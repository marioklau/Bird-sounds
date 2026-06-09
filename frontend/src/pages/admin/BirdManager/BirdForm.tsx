// components/admin/BirdManager/BirdForm.tsx
import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { BirdService } from './BirdService';
import { Bird } from '../../../types/database';
import { supabase } from '../../../lib/supabase';

const CATEGORIES = ['Kicauan', 'Paruh Bengkok', 'Air', 'Pemangsa', 'Umum'];
const REGIONS = ['Sumatera', 'Jawa', 'Kalimantan', 'Sulawesi', 'Papua', 'Bali_Nusa', 'Umum'];

interface BirdFormProps {
  bird?: Bird | null;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyForm = {
  name: '',
  scientific_name: '',
  description: '',
  habitat: '',
  category: 'Kicauan',
  image_url: '',
  region: 'Umum',
};

export default function BirdForm({ bird, onClose, onSuccess }: BirdFormProps) {
  const [formData, setFormData] = useState(bird ? {
    name: bird.name,
    scientific_name: bird.scientific_name || '',
    description: bird.description,
    habitat: bird.habitat || '',
    category: bird.category,
    image_url: bird.image_url || '',
    region: bird.region || 'Umum',
  } : emptyForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      showNotification('error', 'Format tidak didukung. Gunakan JPG, PNG, atau WEBP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'Ukuran file terlalu besar. Maksimal 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const url = await BirdService.uploadImage(file);
      setFormData(f => ({ ...f, image_url: url }));
      showNotification('success', 'Gambar berhasil diupload!');
    } catch (error) {
      showNotification('error', 'Gagal mengupload gambar. Silakan coba lagi.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    const url = formData.image_url;
    if (!url) return;
    
    try {
      if (url.includes('/bird-images/')) {
        const filePath = url.split('/bird-images/')[1];
        if (filePath) {
          await supabase.storage.from('bird-images').remove([filePath]);
        }
      }
      setFormData(f => ({ ...f, image_url: '' }));
      showNotification('success', 'Gambar berhasil dihapus');
    } catch (error) {
      showNotification('error', 'Gagal menghapus gambar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (bird) {
        await BirdService.update(bird.id, formData);
        showNotification('success', 'Data burung berhasil diperbarui!');
      } else {
        await BirdService.create(formData);
        showNotification('success', 'Data burung berhasil ditambahkan!');
      }
      
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error('Error saving bird:', error);
      showNotification('error', 'Gagal menyimpan data burung');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            {bird ? 'Edit burung' : 'Tambah burung'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3.5">
          {/* Notification */}
          {notification.type === 'success' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600 shrink-0" />
              <p className="text-sm text-green-700">{notification.message}</p>
            </div>
          )}
          
          {notification.type === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <p className="text-sm text-red-700">{notification.message}</p>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Nama burung *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
              placeholder="Contoh: Murai Batu"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Nama ilmiah</label>
            <input
              type="text"
              value={formData.scientific_name}
              onChange={(e) => setFormData(f => ({ ...f, scientific_name: e.target.value }))}
              placeholder="Contoh: Copsychus malabaricus"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Kategori *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Wilayah Persebaran *</label>
            <select
              required
              value={formData.region}
              onChange={(e) => setFormData(f => ({ ...f, region: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {REGIONS.map(r => (
                <option key={r} value={r}>
                  {r === 'Bali_Nusa' ? 'Bali & Nusa Tenggara' : r}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Pilih wilayah utama persebaran burung ini. Pilih "Umum" jika tersebar di seluruh Indonesia.
            </p>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Deskripsi *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder="Deskripsi lengkap tentang burung..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Habitat</label>
            <textarea
              rows={2}
              value={formData.habitat}
              onChange={(e) => setFormData(f => ({ ...f, habitat: e.target.value }))}
              placeholder="Informasi habitat burung..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Gambar</label>
            {formData.image_url && (
              <div className="relative inline-block mb-2">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-100"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=?'; }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={11} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2.5 mb-2">
              <label className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload size={13} />
                {uploadingImage ? 'Mengupload...' : 'Upload gambar'}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
              </label>
              <span className="text-xs text-gray-400">JPG, PNG, WEBP · maks 5MB</span>
            </div>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData(f => ({ ...f, image_url: e.target.value }))}
              placeholder="Atau tempel URL gambar..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-2 pt-1 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : (bird ? 'Simpan' : 'Tambah')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}