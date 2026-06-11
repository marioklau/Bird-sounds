// IdentifyPage.tsx - Nama baru dari DetectionPage
import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Mic,
  Play,
  StopCircle,
  AlertCircle,
  Activity,
  FileAudio,
  Volume2
} from 'lucide-react';

import { Bird } from '../types/database';

interface IdentifyPageProps {
  onNavigate: (page: string, data?: { result: DetectionResult }) => void;
}

export interface DetectionResult {
  bird: Bird;
  confidence: number;
  audioUrl: string;
}

interface RealtimeData {
  prediction: string;
  confidence: number;
  error?: string;
}

export function IdentifyPage({ onNavigate }: IdentifyPageProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'realtime'>('upload');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRealtimeListening, setIsRealtimeListening] = useState(false);
  const [realtimePrediction, setRealtimePrediction] = useState<RealtimeData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const realtimeRecorderRef = useRef<MediaRecorder | null>(null);
  const realtimeStreamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const isListeningRef = useRef(false);

  useEffect(() => {
    return () => {
      cleanupRealtime();
    };
  }, [activeTab]);

  const cleanupRealtime = () => {
    isListeningRef.current = false;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    if (realtimeRecorderRef.current && realtimeRecorderRef.current.state !== 'inactive') {
      try {
        realtimeRecorderRef.current.stop();
      } catch (err) {
        console.warn('Error stopping recorder:', err);
      }
    }
    
    if (realtimeStreamRef.current) {
      realtimeStreamRef.current.getTracks().forEach(track => track.stop());
      realtimeStreamRef.current = null;
    }
    
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    
    setIsRealtimeListening(false);
    setRealtimePrediction(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('File harus berupa audio');
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Silakan upload audio terlebih dahulu');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('https://mariox07-bird-sound-api.hf.space/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Gagal melakukan prediksi');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const result: DetectionResult = {
        bird: {
          id: '1',
          name: data.prediction,
          scientific_name: data.scientific_name || '-',
          description: data.description || '-',
          habitat: data.habitat || '-',
          category: data.category || '-',
          image_url: data.image_url || '',
          region: data.Region || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        confidence: data.confidence || 0,
        audioUrl: audioUrl,
      };

      setIsAnalyzing(false);
      onNavigate('result', { result });
    } catch (err: any) {
      console.error(err);
      setIsAnalyzing(false);
      setError(err.message || 'Terjadi kesalahan saat analisis audio');
    }
  };

  const startRealtimeDetection = async () => {
    setError('');
    setRealtimePrediction(null);

    try {
      const WS_URL = 'wss://mariox07-bird-sound-api.hf.space/ws/realtime';
      console.log('🔌 Menghubungkan ke WebSocket:', WS_URL);
      
      wsRef.current = new WebSocket(WS_URL);

      await new Promise((resolve, reject) => {
        if (!wsRef.current) return reject('WebSocket tidak tersedia');
        
        const timeout = setTimeout(() => {
          reject('Timeout koneksi WebSocket (5 detik)');
        }, 5000);
        
        wsRef.current.onopen = () => {
          clearTimeout(timeout);
          console.log('✅ WebSocket terhubung');
          resolve(true);
        };
        
        wsRef.current.onerror = (err) => {
          clearTimeout(timeout);
          console.error('❌ WebSocket error:', err);
          reject('Gagal terhubung ke server');
        };
      });

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            console.warn('Backend warning:', data.error);
            setError(data.error);
          } else {
            console.log('📨 Prediksi:', data);
            setRealtimePrediction(data);
          }
        } catch (err) {
          console.error('Gagal parse response:', err);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket terputus, code:', event.code, 'reason:', event.reason);
        if (isListeningRef.current) {
          setError('Koneksi terputus. Silakan coba lagi.');
          setIsRealtimeListening(false);
          isListeningRef.current = false;
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 22050,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      
      console.log('✅ Akses mikrofon diberikan');
      realtimeStreamRef.current = stream;
      isListeningRef.current = true;
      setIsRealtimeListening(true);

      heartbeatIntervalRef.current = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(new Uint8Array([0]));
        }
      }, 10000);

      const recordAndSend = () => {
        if (!isListeningRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          console.log('❌ Tidak bisa rekam: WebSocket tidak siap');
          if (isListeningRef.current) {
            timeoutRef.current = setTimeout(() => recordAndSend(), 1000);
          }
          return;
        }

        const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/wav';
        
        const recorder = new MediaRecorder(stream, { mimeType });
        realtimeRecorderRef.current = recorder;
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          if (chunks.length === 0) {
            if (isListeningRef.current) {
              timeoutRef.current = setTimeout(() => recordAndSend(), 1000);
            }
            return;
          }
          
          const audioBlob = new Blob(chunks, { type: mimeType });
          console.log(`📤 Mengirim audio: ${(audioBlob.size / 1024).toFixed(2)} KB`);
          
          if (wsRef.current?.readyState === WebSocket.OPEN && audioBlob.size > 0) {
            audioBlob.arrayBuffer().then(buffer => {
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(buffer);
              }
            }).catch(err => {
              console.error('Gagal kirim audio:', err);
            });
          }
          
          if (isListeningRef.current) {
            timeoutRef.current = setTimeout(() => recordAndSend(), 3000);
          }
        };

        recorder.start(1000);
        
        timeoutRef.current = setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, 3000);
      };

      recordAndSend();

    } catch (err: any) {
      console.error('❌ Error start realtime:', err);
      if (err.message && err.message.includes('terhubung')) {
        setError('Tidak bisa terhubung ke server. Pastikan backend berjalan di http://127.0.0.1:8000');
      } else if (err.name === 'NotAllowedError') {
        setError('Izin mikrofon ditolak. Silakan izinkan akses mikrofon.');
      } else if (err.name === 'NotFoundError') {
        setError('Mikrofon tidak ditemukan.');
      } else {
        setError(err.message || 'Gagal memulai identifikasi real-time');
      }
      setIsRealtimeListening(false);
      isListeningRef.current = false;
    }
  };

  const stopRealtimeDetection = () => {
    cleanupRealtime();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mb-4 mx-auto">
            <Volume2 size={28} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Identifikasi Suara Burung
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Upload rekaman suara burung atau rekam langsung menggunakan mikrofon untuk identifikasi otomatis
          </p>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex justify-center mb-6 bg-gray-100 p-1 rounded-xl max-w-md mx-auto">
          <button
            onClick={() => {
              setActiveTab('upload');
              cleanupRealtime();
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload size={14} className="inline mr-2" />
            Upload File
          </button>
          <button
            onClick={() => {
              setActiveTab('realtime');
              cleanupRealtime();
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'realtime'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mic size={14} className="inline mr-2" />
            Rekam Langsung
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="p-6 sm:p-8">
            
            {/* TAB 1: UPLOAD FILE */}
            {activeTab === 'upload' && (
              <div
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-gray-200 bg-gray-50/50 hover:border-emerald-400 hover:bg-emerald-50/30'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileAudio size={24} className="text-emerald-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Upload Audio Burung
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  Drag & drop atau klik untuk memilih file
                </p>
                <p className="text-[11px] text-gray-300">
                  Format: MP3, WAV, OGG, M4A
                </p>
              </div>
            )}

            {/* TAB 2: REAL-TIME STREAMING */}
            {activeTab === 'realtime' && (
              <div className="text-center py-4">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all ${
                  isRealtimeListening 
                    ? 'bg-red-100' 
                    : 'bg-emerald-100'
                }`}>
                  {isRealtimeListening ? (
                    <Activity size={36} className="text-red-600 animate-pulse" />
                  ) : (
                    <Mic size={36} className="text-emerald-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {isRealtimeListening ? 'Sedang Mendengarkan...' : 'Identifikasi Langsung'}
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
                  {isRealtimeListening 
                    ? 'Sistem sedang merekam dan menganalisis suara secara real-time'
                    : 'Rekam suara burung langsung dari mikrofon Anda'
                  }
                </p>
                
                {!isRealtimeListening ? (
                  <button
                    onClick={startRealtimeDetection}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <Mic size={16} />
                    Mulai Identifikasi
                  </button>
                ) : (
                  <button
                    onClick={stopRealtimeDetection}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
                  >
                    <StopCircle size={16} />
                    Hentikan
                  </button>
                )}

                {/* Hasil Prediksi Real-time */}
                {isRealtimeListening && (
                  <div className="mt-8 border border-gray-100 bg-gray-50 rounded-xl p-5 max-w-sm mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                        Hasil Identifikasi Langsung
                      </span>
                    </div>
                    
                    {realtimePrediction ? (
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-1">
                          {realtimePrediction.prediction.replace(/_/g, ' ')}
                        </h4>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">Confidence</span>
                            <span className="font-semibold text-emerald-600">
                              {realtimePrediction.confidence.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${realtimePrediction.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-center mb-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-emerald-600"></div>
                        </div>
                        <p className="text-xs text-gray-400">
                          Menunggu suara burung...
                        </p>
                        <p className="text-[10px] text-gray-300 mt-2">
                          Coba bersiul atau putar suara burung
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-5 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Preview Audio untuk Upload */}
            {activeTab === 'upload' && selectedFile && audioUrl && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-3">Preview Audio</p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Play size={16} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <audio controls className="w-full h-10" src={audioUrl}>
                    Browser tidak mendukung elemen audio.
                  </audio>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Tombol Identifikasi untuk Upload */}
        {activeTab === 'upload' && selectedFile && (
          <div className="mt-6 text-center">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Menganalisis...
                </>
              ) : (
                <>
                  <Mic size={16} />
                  Identifikasi Sekarang
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}