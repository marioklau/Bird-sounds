from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uuid
import tensorflow as tf
import numpy as np
import os
import librosa
import soundfile as sf
import logging
import asyncio

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from preprocessing import preprocess_audio

app = FastAPI()

# Buat folder temp otomatis
os.makedirs("temp", exist_ok=True)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model burung
try:
    model = tf.keras.models.load_model("model/bird_sound_model.keras")
    logger.info("✅ Model berhasil dimuat")
except Exception as e:
    logger.error(f"❌ Gagal memuat model: {e}")
    model = None

CLASSES = [
    "Burung_gereja",
    "Cabak_kota",
    "Cucak_kutilang",
    "Kipasan_belang",
    "Tekukur biasa"
]


def adjust_audio_duration(file_path, target_duration=5.0, sr=22050):
    """
    Memaksa durasi audio menjadi tepat target_duration detik
    """
    try:
        # Load audio
        y, current_sr = librosa.load(file_path, sr=sr, duration=target_duration)
        
        target_samples = int(target_duration * sr)
        
        if len(y) > target_samples:
            # Potong jika kepanjangan
            y = y[:target_samples]
        elif len(y) < target_samples:
            # Padding jika kurang
            y = np.pad(y, (0, target_samples - len(y)), mode='constant')
        
        # Simpan sebagai WAV
        sf.write(file_path, y, sr, format='WAV', subtype='PCM_16')
        logger.info(f"✅ Audio diproses: durasi={len(y)/sr:.2f}s")
        return True
    except Exception as e:
        logger.error(f"❌ Gagal adjust audio: {e}")
        raise


# ==================== ENDPOINT UPLOAD FILE ====================
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        return {"error": "Model belum dimuat. Silakan periksa kembali model."}
    
    file_ext = os.path.splitext(file.filename)[1] or ".wav"
    temp_audio = f"temp/upload_{uuid.uuid4().hex}{file_ext}"

    try:
        # Simpan file
        content = await file.read()
        if len(content) == 0:
            return {"error": "File audio kosong"}
        
        with open(temp_audio, "wb") as buffer:
            buffer.write(content)
        
        logger.info(f"📁 File diterima: {file.filename}, ukuran={len(content)} bytes")

        # Proses durasi
        adjust_audio_duration(temp_audio, target_duration=5.0)

        # Preprocessing
        image = preprocess_audio(temp_audio)
        image = np.expand_dims(image, axis=0)

        # Prediksi
        prediction = model.predict(image, verbose=0)
        predicted_index = np.argmax(prediction)
        confidence = float(np.max(prediction) * 100)
        predicted_label = CLASSES[predicted_index]

        logger.info(f"🎯 Prediksi: {predicted_label} ({confidence:.2f}%)")

        return {
            "prediction": predicted_label,
            "confidence": confidence
        }

    except Exception as e:
        logger.error(f"❌ Error pada /predict: {str(e)}")
        return {"error": f"Gagal memproses audio: {str(e)}"}

    finally:
        if os.path.exists(temp_audio):
            try:
                os.remove(temp_audio)
            except:
                pass


# ==================== WEBSOCKET ENDPOINT REAL-TIME ====================
@app.websocket("/ws/realtime")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("🔌 Koneksi WebSocket terbuka")
    
    if model is None:
        await websocket.send_json({"error": "Model belum dimuat"})
        await websocket.close()
        return
    
    try:
        while True:
            # Terima data audio dengan timeout
            try:
                # Gunakan receive_bytes dengan try-except untuk WebSocketDisconnect
                audio_bytes = await asyncio.wait_for(
                    websocket.receive_bytes(), 
                    timeout=30.0
                )
            except asyncio.TimeoutError:
                logger.warning("Timeout menerima data, tetap mendengarkan...")
                continue
            except WebSocketDisconnect:
                logger.info("WebSocket disconnected by client")
                break
            except Exception as e:
                logger.error(f"Error receive bytes: {e}")
                break
            
            if not audio_bytes or len(audio_bytes) < 2000:
                logger.warning(f"Data terlalu kecil: {len(audio_bytes)} bytes, skip")
                continue
                
            temp_filename = f"temp/ws_{uuid.uuid4().hex}.webm"
            
            try:
                # Simpan data mentah
                with open(temp_filename, "wb") as f:
                    f.write(audio_bytes)
                
                logger.info(f"📥 Menerima audio: {len(audio_bytes)} bytes")
                
                # Cek header file (validasi)
                with open(temp_filename, "rb") as f:
                    header = f.read(12)
                    is_webm = header[:4] == b'\x1a\x45\xdf\xa3'
                    is_wav = header[:4] == b'RIFF'
                    
                    if not is_webm and not is_wav:
                        logger.warning(f"Format tidak dikenal: {header[:4]}")
                        await websocket.send_json({
                            "error": "Format audio tidak didukung. Kirim dalam format WebM atau WAV."
                        })
                        continue
                
                # Proses audio
                adjust_audio_duration(temp_filename, target_duration=5.0)
                
                # Preprocessing
                image = preprocess_audio(temp_filename)
                image = np.expand_dims(image, axis=0)
                
                # Prediksi
                prediction = model.predict(image, verbose=0)
                predicted_index = np.argmax(prediction)
                confidence = float(np.max(prediction) * 100)
                predicted_label = CLASSES[predicted_index]
                
                logger.info(f"🎯 Real-time prediksi: {predicted_label} ({confidence:.2f}%)")
                
                # Kirim hasil
                try:
                    await websocket.send_json({
                        "prediction": predicted_label,
                        "confidence": confidence
                    })
                except Exception as e:
                    logger.error(f"Error sending response: {e}")
                    break
                
            except Exception as e:
                logger.error(f"Error processing audio: {str(e)}")
                try:
                    await websocket.send_json({
                        "error": f"Gagal memproses audio: {str(e)}"
                    })
                except:
                    pass
                
            finally:
                if os.path.exists(temp_filename):
                    try:
                        os.remove(temp_filename)
                    except:
                        pass
                    
    except WebSocketDisconnect:
        logger.info("🔌 Koneksi WebSocket terputus secara normal")
    except Exception as e:
        logger.error(f"❌ Terjadi kesalahan koneksi WebSocket: {str(e)}")
    finally:
        logger.info("WebSocket connection closed")

# ==================== HEALTH CHECK ====================
@app.get("/")
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "classes": CLASSES
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="127.0.0.1", 
        port=8000,
        log_level="info",
        ws_ping_interval=20,
        ws_ping_timeout=60
    )