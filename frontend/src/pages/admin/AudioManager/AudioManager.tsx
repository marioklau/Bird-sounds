// components/admin/AudioManager/AudioManager.tsx
import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Bird } from '../../../types/database';
import { AudioService } from './AudioService';
import AudioForm from './AudioForm';
import AudioList from './AudioList';

interface AudioManagerProps {
  bird: Bird | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AudioManager({ bird, onClose, onSuccess }: AudioManagerProps) {
  const [audioSamples, setAudioSamples] = useState<any[]>([]);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioRefs, setAudioRefs] = useState<{ [key: string]: HTMLAudioElement }>({});
  const [error, setError] = useState<string | null>(null);
  // State untuk delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; url: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (bird) {
      loadAudioSamples();
    }
  }, [bird]);

  const loadAudioSamples = async () => {
    if (!bird) return;
    try {
      setError(null);
      const samples = await AudioService.fetchByBirdId(bird.id);
      setAudioSamples(samples);
    } catch (err) {
      setError('Gagal memuat daftar suara burung');
      console.error('Error loading audio samples:', err);
    }
  };

  const handleAddAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !bird) return;

    // Validate file type
    if (!['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'].includes(file.type)) {
      setError('Format tidak didukung. Gunakan MP3, WAV, atau OGG');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran file terlalu besar. Maksimal 10MB');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setUploadingAudio(true);
    setError(null);
    
    try {
      // Upload file to storage
      const audioUrl = await AudioService.uploadAudio(file, bird.id);
      
      // Get audio duration
      const duration = await AudioService.getDuration(file);
      
      // Save to database
      await AudioService.add(bird.id, audioUrl, duration);
      
      // Refresh the list
      await loadAudioSamples();
      
      // Clear file input
      e.target.value = '';
      
      // Call success callback if provided
      if (onSuccess) onSuccess();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupload suara burung';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleDeleteAudio = async (audioId: string, audioUrl: string) => {
    setDeleting(true);
    try {
      await AudioService.delete(audioId, audioUrl);
      await loadAudioSamples();
      setDeleteConfirm(null);
      // Success message akan ditampilkan oleh AudioList component
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus suara burung';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeleting(false);
    }
  };

  const handlePlayAudio = (audioId: string, audioUrl: string) => {
    try {
      // Stop current playing audio
      if (playingAudioId && audioRefs[playingAudioId]) {
        audioRefs[playingAudioId].pause();
        audioRefs[playingAudioId].currentTime = 0;
      }
      
      if (playingAudioId === audioId) {
        setPlayingAudioId(null);
        return;
      }
      
      // Create new audio element if not exists
      if (!audioRefs[audioId]) {
        const audio = new Audio(audioUrl);
        audio.addEventListener('ended', () => {
          setPlayingAudioId(null);
        });
        audio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          setError('Gagal memutar audio');
          setTimeout(() => setError(null), 3000);
          setPlayingAudioId(null);
        });
        setAudioRefs(prev => ({ ...prev, [audioId]: audio }));
        audio.play().catch(err => {
          console.error('Error playing audio:', err);
          setError('Gagal memutar audio. Periksa koneksi internet Anda.');
          setTimeout(() => setError(null), 3000);
        });
        setPlayingAudioId(audioId);
      } else {
        audioRefs[audioId].play().catch(err => {
          console.error('Error playing audio:', err);
          setError('Gagal memutar audio');
          setTimeout(() => setError(null), 3000);
        });
        setPlayingAudioId(audioId);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memutar audio');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (!bird) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Kelola Suara - {bird.name}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tambah atau hapus contoh suara burung
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {/* Global Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="text-xs text-red-600 hover:text-red-700 mt-1"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
          
          <AudioForm uploading={uploadingAudio} onUpload={handleAddAudio} />
          
          <AudioList 
            audioSamples={audioSamples}
            playingAudioId={playingAudioId}
            onPlay={handlePlayAudio}
            onDelete={async (id, url) => setDeleteConfirm({ id, url })}
          />
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-3">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Konfirmasi Hapus</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Apakah Anda yakin ingin menghapus suara ini?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteAudio(deleteConfirm.id, deleteConfirm.url)}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}