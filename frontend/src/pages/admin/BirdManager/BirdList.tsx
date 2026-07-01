// components/admin/BirdManager/BirdList.tsx
import { useState } from 'react';
import { Edit2, Trash2, Music, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { Bird } from '../../../types/database';

interface BirdListProps {
  birds: Bird[];
  onEdit: (bird: Bird) => void;
  onDelete: (id: string) => Promise<void>;
  onManageAudio: (bird: Bird) => void;
  getRegionDisplay: (region: string | null) => string;
}

export default function BirdList({ birds, onEdit, onDelete, onManageAudio, getRegionDisplay }: BirdListProps) {
  // State untuk paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Hitung total halaman
  const totalPages = Math.ceil(birds.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentBirds = birds.slice(indexOfFirst, indexOfLast);

  // State lain
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Fungsi pindah halaman
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: null, message: '' });
    }, 3000);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await onDelete(id);
      showNotification('success', 'Data burung berhasil dihapus!');
      setDeleteConfirm(null);
      // Jika setelah hapus data tersisa kurang dari 1 halaman dan kita tidak di halaman 1, pindah ke halaman sebelumnya
      const remaining = birds.length - 1;
      const newTotalPages = Math.ceil(remaining / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (remaining === 0) {
        setCurrentPage(1);
      }
    } catch (error) {
      showNotification('error', 'Gagal menghapus data burung');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Notification Toast */}
      {notification.type === 'success' && (
        <div className="fixed top-20 right-4 z-50 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 shadow-lg animate-in">
          <CheckCircle size={16} className="text-green-600" />
          <p className="text-sm text-green-700">{notification.message}</p>
          <button onClick={() => setNotification({ type: null, message: '' })} className="ml-2">
            <X size={14} className="text-green-600" />
          </button>
        </div>
      )}
      
      {notification.type === 'error' && (
        <div className="fixed top-20 right-4 z-50 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 shadow-lg animate-in">
          <AlertTriangle size={16} className="text-red-600" />
          <p className="text-sm text-red-700">{notification.message}</p>
          <button onClick={() => setNotification({ type: null, message: '' })} className="ml-2">
            <X size={14} className="text-red-600" />
          </button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden sm:block bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Burung</th>
              <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Kategori</th>
              <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium hidden lg:table-cell">Habitat</th>
              <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium hidden md:table-cell">Wilayah</th>
              <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Suara</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentBirds.map((bird) => (
              <tr key={bird.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-emerald-50 flex items-center justify-center shrink-0">
                      {bird.image_url ? (
                        <img
                          src={bird.image_url}
                          alt={bird.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=?'; }}
                        />
                      ) : (
                        <span className="text-emerald-600 text-sm font-medium">{bird.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{bird.name}</p>
                      {bird.scientific_name && (
                        <p className="text-xs italic text-gray-400">{bird.scientific_name}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                    {bird.category}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <p className="text-xs text-gray-400 max-w-xs truncate">{bird.habitat || '—'}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                    {getRegionDisplay(bird.region)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onManageAudio(bird)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Music size={12} />
                    <span>Kelola Suara</span>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(bird)}
                      className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(bird.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentBirds.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  Tidak ada data burung.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-2">
        {currentBirds.map((bird) => (
          <div key={bird.id} className="bg-white border border-gray-100 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-emerald-50 flex items-center justify-center shrink-0">
                {bird.image_url ? (
                  <img
                    src={bird.image_url}
                    alt={bird.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=?'; }}
                  />
                ) : (
                  <span className="text-emerald-600 font-medium">{bird.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{bird.name}</p>
                {bird.scientific_name && (
                  <p className="text-xs italic text-gray-400 truncate">{bird.scientific_name}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                    {bird.category}
                  </span>
                  {bird.region && bird.region !== 'Umum' && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                      {getRegionDisplay(bird.region)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => onManageAudio(bird)}
                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Music size={14} />
                </button>
                <button
                  onClick={() => onEdit(bird)}
                  className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(bird.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {currentBirds.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-lg p-6 text-center text-sm text-gray-400">
            Tidak ada data burung.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-xs text-gray-400">
            Menampilkan {indexOfFirst + 1}–{Math.min(indexOfLast, birds.length)} dari {birds.length} data
          </div>
          <div className="flex gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm rounded border transition-colors ${
                currentPage === 1
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 text-sm rounded border transition-colors ${
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Konfirmasi Hapus</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Apakah Anda yakin ingin menghapus burung ini?
            </p>
            <p className="text-xs text-red-600 mb-5">
              Peringatan: Semua suara yang terkait dengan burung ini juga akan dihapus!
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}