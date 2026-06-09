// components/admin/AudioManager/AudioForm.tsx
import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react';

interface AudioFormProps {
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export default function AudioForm({ uploading, onUpload }: AudioFormProps) {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: null, message: '' });
    }, 3000);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await onUpload(e);
      showNotification('success', 'Suara burung berhasil diupload!');
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Gagal mengupload suara burung');
    }
  };

  return (
    <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
      {/* Success/Error Messages */}
      {notification.type === 'success' && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between gap-2 animate-in">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <p className="text-sm text-green-700">{notification.message}</p>
          </div>
          <button onClick={() => setNotification({ type: null, message: '' })}>
            <X size={14} className="text-green-600" />
          </button>
        </div>
      )}
      
      {notification.type === 'error' && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-2 animate-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <p className="text-sm text-red-700">{notification.message}</p>
          </div>
          <button onClick={() => setNotification({ type: null, message: '' })}>
            <X size={14} className="text-red-600" />
          </button>
        </div>
      )}
      
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tambah Contoh Suara
      </label>
      <div className="flex items-center gap-3">
        <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload size={16} />
          {uploading ? 'Mengupload...' : 'Pilih File Audio'}
          <input 
            type="file" 
            accept="audio/*" 
            onChange={handleUpload} 
            disabled={uploading} 
            className="hidden" 
          />
        </label>
        <span className="text-xs text-gray-500">
          MP3, WAV, OGG · maks 10MB
        </span>
      </div>
      
      {/* Upload progress indicator */}
      {uploading && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-purple-200 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
            <span className="text-xs text-purple-600">Mengupload...</span>
          </div>
        </div>
      )}
    </div>
  );
}