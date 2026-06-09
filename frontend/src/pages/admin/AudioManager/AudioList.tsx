// components/admin/AudioManager/AudioList.tsx
import { useState } from 'react';
import { Play, Pause, Trash2, Music, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { AudioSample } from '../../../types/database';

interface AudioListProps {
  audioSamples: AudioSample[];
  playingAudioId: string | null;
  onPlay: (audioId: string, audioUrl: string) => void;
  onDelete: (audioId: string, audioUrl: string) => void;
}

export default function AudioList({ audioSamples, playingAudioId, onPlay, onDelete }: AudioListProps) {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Tidak ada confirm di sini, langsung panggil onDelete yang akan membuka modal

  if (audioSamples.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <Music size={40} className="text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Belum ada contoh suara untuk burung ini</p>
        <p className="text-xs text-gray-400 mt-1">Upload file audio untuk menambahkan suara burung</p>
      </div>
    );
  }

  return (
    <>
      {/* Notification Toast */}
      {notification.type === 'success' && (
        <div className="fixed top-20 right-4 z-50 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 shadow-lg">
          <CheckCircle size={16} className="text-green-600" />
          <p className="text-sm text-green-700">{notification.message}</p>
          <button onClick={() => setNotification({ type: null, message: '' })} className="ml-2">
            <X size={14} className="text-green-600" />
          </button>
        </div>
      )}
      
      {notification.type === 'error' && (
        <div className="fixed top-20 right-4 z-50 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 shadow-lg">
          <AlertTriangle size={16} className="text-red-600" />
          <p className="text-sm text-red-700">{notification.message}</p>
          <button onClick={() => setNotification({ type: null, message: '' })} className="ml-2">
            <X size={14} className="text-red-600" />
          </button>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Daftar Suara ({audioSamples.length})
        </h3>
        {audioSamples.map((audio, index) => (
          <div key={audio.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => onPlay(audio.id, audio.audio_url)}
                className="w-8 h-8 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-colors"
              >
                {playingAudioId === audio.id ? (
                  <Pause size={14} className="text-purple-700" />
                ) : (
                  <Play size={14} className="text-purple-700" />
                )}
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Sample {index + 1}
                </p>
                {audio.duration > 0 && (
                  <p className="text-xs text-gray-500">
                    Durasi: {Math.floor(audio.duration / 60)}:{(audio.duration % 60).toString().padStart(2, '0')}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Ditambahkan: {new Date(audio.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDelete(audio.id, audio.audio_url)} // Langsung panggil onDelete tanpa confirm
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Hapus suara"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}