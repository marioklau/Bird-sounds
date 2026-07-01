import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AudioSample } from '../types/database';

interface ProfilePageProps {
  onNavigate: (page: string, data?: any) => void; // tambahkan data optional
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const [user, setUser] = useState<any>(null);
  const [birdOptions, setBirdOptions] = useState<{ id: string; name: string }[]>([]);
  const [selectedBirdId, setSelectedBirdId] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [myUploads, setMyUploads] = useState<AudioSample[]>([]);

  useEffect(() => {
    // Ambil user saat ini
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    // Ambil daftar burung untuk dropdown (hanya id dan name)
    supabase
      .from('birds')
      .select('id, name')
      .then(({ data }) => setBirdOptions(data || []));
    // Ambil riwayat upload user
    fetchMyUploads();
  }, []);

  const fetchMyUploads = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('audio_samples')
      .select('*, birds(name)')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false });
    if (data) setMyUploads(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBirdId || !audioFile) {
      setMessage('Pilih burung dan file audio.');
      return;
    }
    setUploading(true);
    setMessage('');

    try {
      // Upload file ke Supabase Storage
      const fileExt = audioFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `audio_uploads/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('bird-audio')
        .upload(filePath, audioFile);
      if (uploadError) throw uploadError;

      // Dapatkan public URL
      const { data: urlData } = supabase.storage
        .from('bird-audio')
        .getPublicUrl(filePath);
      const audioUrl = urlData.publicUrl;

      // Simpan ke audio_samples dengan status pending
      const { error: insertError } = await supabase
        .from('audio_samples')
        .insert({
          bird_id: selectedBirdId,
          audio_url: audioUrl,
          duration: 0,
          user_id: user?.id,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        });
      if (insertError) throw insertError;

      setMessage('Upload berhasil! Menunggu persetujuan admin.');
      setAudioFile(null);
      setSelectedBirdId('');
      fetchMyUploads(); // refresh riwayat
    } catch (error: any) {
      setMessage('Gagal upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${map[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profil Saya</h1>
      <p className="text-gray-600 mb-6">Email: {user?.email}</p>

      {/* Form Upload */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Suara Burung</h2>
        <form onSubmit={handleUpload}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Burung</label>
            <select
              value={selectedBirdId}
              onChange={(e) => setSelectedBirdId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">-- Pilih --</option>
              {birdOptions.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">File Audio (MP3/WAV)</label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {uploading ? 'Mengunggah...' : 'Upload'}
          </button>
          {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
        </form>
      </div>

      {/* Riwayat Upload */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Riwayat Upload</h2>
        {myUploads.length === 0 ? (
          <p className="text-gray-500">Belum ada upload.</p>
        ) : (
          <ul className="space-y-3">
            {myUploads.map((item) => (
              <li key={item.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <p className="font-medium">{(item as any).birds?.name || 'Burung tidak diketahui'}</p>
                  <p className="text-sm text-gray-500">Upload: {new Date(item.submitted_at!).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(item.status!)}
                  {item.status === 'approved' && (
                    <button
                      onClick={() => onNavigate('bird-detail', { birdId: item.bird_id })}
                      className="text-xs text-emerald-600 hover:underline"
                    >
                      Lihat
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}