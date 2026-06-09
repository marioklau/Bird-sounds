import os
import librosa
import librosa.display
import numpy as np
import matplotlib.pyplot as plt

from PIL import Image

# =========================================
# PARAMETER
# =========================================

TARGET_SR = 16000
TARGET_DURATION = 5
TARGET_LENGTH = TARGET_SR * TARGET_DURATION

N_FFT = 1024
HOP_LENGTH = 512
WIN_LENGTH = 1024

# =========================================
# PREPROCESS AUDIO
# =========================================

def preprocess_audio(audio_path):

    # =========================================
    # LOAD AUDIO
    # =========================================

    audio, sr = librosa.load(
        audio_path,
        sr=TARGET_SR
    )

    # =========================================
    # CEK DURASI AUDIO
    # =========================================

    duration = librosa.get_duration(
        y=audio,
        sr=sr
    )

    if duration < 4.9 or duration > 5.1:
        raise ValueError(
            "Audio harus 5 detik"
        )

    # =========================================
    # NORMALISASI AUDIO
    # =========================================

    max_val = np.max(np.abs(audio))

    if max_val > 0:
        audio = audio / max_val

    # =========================================
    # PADDING / CROP
    # =========================================

    if len(audio) > TARGET_LENGTH:

        audio = audio[:TARGET_LENGTH]

    else:

        padding = TARGET_LENGTH - len(audio)

        audio = np.pad(
            audio,
            (0, padding),
            mode='constant'
        )

    # =========================================
    # STFT
    # =========================================

    stft = librosa.stft(
        audio,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
        win_length=WIN_LENGTH
    )

    # =========================================
    # SPECTROGRAM DB
    # =========================================

    spectrogram = librosa.amplitude_to_db(
        np.abs(stft),
        ref=np.max
    )

    # =========================================
    # NORMALISASI SPECTROGRAM
    # =========================================

    spectrogram = (
        spectrogram - spectrogram.min()
    ) / (
        spectrogram.max() - spectrogram.min()
    )

    # =========================================
    # BUAT FOLDER TEMP
    # =========================================

    os.makedirs("temp", exist_ok=True)

    # =========================================
    # SAVE SPECTROGRAM
    # =========================================

    plt.figure(figsize=(3, 3))

    librosa.display.specshow(
        spectrogram,
        sr=sr,
        hop_length=HOP_LENGTH,
        cmap='magma'
    )

    plt.axis('off')

    plt.tight_layout(pad=0)

    temp_image = "temp/temp_spectrogram.png"

    plt.savefig(
        temp_image,
        bbox_inches='tight',
        pad_inches=0
    )

    plt.close()

    # =========================================
    # LOAD IMAGE
    # =========================================

    image = Image.open(temp_image).convert("RGB")

    # =========================================
    # RESIZE IMAGE
    # =========================================

    image = image.resize((128, 128))

    # =========================================
    # CONVERT KE ARRAY
    # =========================================

    image = np.array(image)

    # =========================================
    # NORMALISASI IMAGE
    # =========================================

    image = image / 255.0

    # =========================================
    # PASTIKAN RGB
    # =========================================

    if len(image.shape) == 2:

        image = np.stack(
            (image,) * 3,
            axis=-1
        )

    return image