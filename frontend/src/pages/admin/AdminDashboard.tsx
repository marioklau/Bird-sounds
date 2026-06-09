// components/admin/AdminDashboard.tsx (Refactored)
import { useState, useEffect } from 'react';
import { LogOut, Plus, Menu, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Bird } from '../../types/database';
import { BirdService } from './BirdManager/BirdService';
import { AudioService } from './AudioManager/AudioService';
import BirdList from './BirdManager/BirdList';
import BirdForm from './BirdManager/BirdForm';
import AudioManager from './AudioManager/AudioManager';

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
}

const REGION_DISPLAY: Record<string, string> = {
  Sumatera: 'Sumatera',
  Jawa: 'Jawa',
  Kalimantan: 'Kalimantan',
  Sulawesi: 'Sulawesi',
  Papua: 'Papua',
  Bali_Nusa: 'Bali & Nusa Tenggara',
  Umum: 'Umum / Nasional',
};

// components/admin/AdminDashboard.tsx (Bagian yang diupdate)
// ... imports tetap sama ...

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBirdForm, setShowBirdForm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editingBird, setEditingBird] = useState<Bird | null>(null);
  const [selectedBirdForAudio, setSelectedBirdForAudio] = useState<Bird | null>(null);

  const fetchBirds = async () => {
    try {
      const data = await BirdService.fetchAll();
      setBirds(data);
    } catch (error) {
      console.error('Error fetching birds:', error);
    } finally {
      setLoading(false);
    }
  };   

  useEffect(() => { fetchBirds(); }, []);

  const handleDeleteBird = async (id: string) => {
    
    try {
      await AudioService.deleteByBirdId(id);
      await BirdService.delete(id);
      await fetchBirds();
    } catch (error) {
      console.error('Error deleting bird:', error);
      alert('Gagal menghapus data burung');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      if (onNavigate) onNavigate('admin-login');
      else window.location.href = '/admin/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getRegionDisplay = (region: string | null) => {
    if (!region) return '—';
    return REGION_DISPLAY[region] || region;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-1"
            onClick={() => setShowMobileMenu(true)}
            aria-label="Buka menu"
          >
            <Menu size={18} className="text-gray-600" />
          </button>
          <img 
            src="/burung.png"
            alt="BirdManager Logo"
            className="w-7 h-7 rounded-lg object-cover"
          />
          <p className="text-sm font-medium text-gray-900">BirdManager</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 rounded-lg px-2.5 py-1.5 hover:bg-red-50 transition-colors"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-52 bg-white border-r border-gray-100 min-h-[calc(100vh-49px)] p-3 sticky top-[49px] shrink-0">
          <p className="text-xs text-gray-400 font-medium px-2 mb-2 uppercase tracking-wider">Menu</p>
          <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-emerald-50 text-left">
            <img 
              src="/burung.png"
              alt="Logo"
              className="w-5 h-5 rounded object-cover shrink-0"
            />
            <div>
              <p className="text-sm font-medium text-emerald-700">Kelola burung</p>
              <p className="text-xs text-gray-400">Data spesies burung</p>
            </div>
          </button>
        </aside>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowMobileMenu(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg p-4 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <img 
                    src="/burung.png"
                    alt="BirdManager Logo"
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <p className="text-sm font-medium text-gray-900">BirdManager</p>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-gray-400 font-medium px-2 mb-2 uppercase tracking-wider">Menu</p>
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-emerald-50 text-left"
                onClick={() => setShowMobileMenu(false)}
              >
                <img 
                  src="/burung.png"
                  alt="Logo"
                  className="w-5 h-5 rounded object-cover shrink-0"
                />
                <div>
                  <p className="text-sm font-medium text-emerald-700">Kelola burung</p>
                  <p className="text-xs text-gray-400">Data spesies burung</p>
                </div>
              </button>

              <div className="mt-auto pt-4 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={15} />
                  Keluar
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-base font-semibold text-gray-900">Kelola burung</h1>
              <p className="text-xs text-gray-500">{birds.length} spesies terdaftar</p>
            </div>
            <button
              onClick={() => {
                setEditingBird(null);
                setShowBirdForm(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
            >
              <Plus size={15} />
              <span>Tambah</span>
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-400 py-12 text-center">Memuat data...</p>
          ) : birds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400 mb-3">Belum ada data burung</p>
              <button
                onClick={() => {
                  setEditingBird(null);
                  setShowBirdForm(true);
                }}
                className="text-sm text-emerald-600 hover:underline"
              >
                Tambah burung pertama
              </button>
            </div>
          ) : (
            <BirdList
              birds={birds}
              onEdit={(bird) => {
                setEditingBird(bird);
                setShowBirdForm(true);
              }}
              onDelete={handleDeleteBird}
              onManageAudio={(bird) => setSelectedBirdForAudio(bird)}
              getRegionDisplay={getRegionDisplay}
            />
          )}
        </main>
      </div>

      {/* Bird Form Modal */}
      {showBirdForm && (
        <BirdForm
          bird={editingBird}
          onClose={() => {
            setShowBirdForm(false);
            setEditingBird(null);
          }}
          onSuccess={() => {
            setShowBirdForm(false);
            setEditingBird(null);
            fetchBirds();
          }}
        />
      )}

      {/* Audio Manager Modal */}
      {selectedBirdForAudio && (
        <AudioManager
          bird={selectedBirdForAudio}
          onClose={() => setSelectedBirdForAudio(null)}
        />
      )}
    </div>
  );
}