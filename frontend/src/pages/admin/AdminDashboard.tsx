// pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { LogOut, Plus, Menu, X, CheckCircle, XCircle, Bird as BirdIcon, FileAudio } from 'lucide-react';
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

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<'birds' | 'approvals'>('birds');
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBirdForm, setShowBirdForm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editingBird, setEditingBird] = useState<Bird | null>(null);
  const [selectedBirdForAudio, setSelectedBirdForAudio] = useState<Bird | null>(null);

  const [pendingAudio, setPendingAudio] = useState<any[]>([]);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

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

  const fetchPendingAudio = async () => {
    setLoadingAudio(true);
    try {
      const { data: audioData, error: audioError } = await supabase
        .from('audio_samples')
        .select(`
          *,
          birds:bird_id (id, name)
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true });

      if (audioError) throw audioError;

      if (audioData && audioData.length > 0) {
        const userIds = audioData
          .map((a) => a.user_id)
          .filter((id) => id !== null && id !== undefined);

        if (userIds.length > 0) {
          const { data: profilesData, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, full_name')
            .in('id', userIds);

          if (!profileError && profilesData) {
            const profileMap = Object.fromEntries(
              profilesData.map((p) => [p.id, p])
            );
            audioData.forEach((audio) => {
              if (audio.user_id && profileMap[audio.user_id]) {
                audio.profiles = profileMap[audio.user_id];
              }
            });
          } else {
            console.warn('Gagal mengambil profiles:', profileError);
          }
        }
      }

      setPendingAudio(audioData || []);
    } catch (error: any) {
      console.error('Error fetching pending audio:', error.message || error);
      setPendingAudio([]);
    } finally {
      setLoadingAudio(false);
    }
  };

  useEffect(() => {
    fetchBirds();
    fetchPendingAudio();
    supabase.auth.getUser().then(({ data }) => setAdminUser(data.user));
  }, []);

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

  const handleApproveAudio = async (audioId: string) => {
    try {
      const { error } = await supabase
        .from('audio_samples')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          reviewer_id: adminUser?.id,
        })
        .eq('id', audioId);
      if (error) throw error;
      await fetchPendingAudio();
    } catch (error) {
      console.error('Error approving audio:', error);
      alert('Gagal menyetujui audio');
    }
  };

  const handleRejectAudio = async (audioId: string) => {
    try {
      const { error } = await supabase
        .from('audio_samples')
        .update({
          status: 'rejected',
          admin_notes: 'Ditolak oleh admin',
          reviewer_id: adminUser?.id,
        })
        .eq('id', audioId);
      if (error) throw error;
      await fetchPendingAudio();
    } catch (error) {
      console.error('Error rejecting audio:', error);
      alert('Gagal menolak audio');
    }
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

          {/* Menu Kelola Burung */}
          <button
            onClick={() => setCurrentView('birds')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
              currentView === 'birds'
                ? 'bg-emerald-50 text-emerald-700'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <BirdIcon size={18} className="shrink-0" />
            <div>
              <p className="text-sm font-medium">Kelola burung</p>
              <p className="text-xs text-gray-400">Data spesies burung</p>
            </div>
          </button>

          {/* Menu Persetujuan */}
          <button
            onClick={() => setCurrentView('approvals')}
            className={`mt-1 w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
              currentView === 'approvals'
                ? 'bg-amber-50 text-amber-700'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <FileAudio size={18} className="shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Persetujuan</p>
              <p className="text-xs text-gray-400">
                {pendingAudio.length} menunggu
              </p>
            </div>
            {pendingAudio.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingAudio.length}
              </span>
            )}
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
                onClick={() => {
                  setCurrentView('birds');
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  currentView === 'birds'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <BirdIcon size={18} className="shrink-0" />
                <div>
                  <p className="text-sm font-medium">Kelola burung</p>
                  <p className="text-xs text-gray-400">Data spesies burung</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setCurrentView('approvals');
                  setShowMobileMenu(false);
                }}
                className={`mt-1 w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  currentView === 'approvals'
                    ? 'bg-amber-50 text-amber-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <FileAudio size={18} className="shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Persetujuan</p>
                  <p className="text-xs text-gray-400">
                    {pendingAudio.length} menunggu
                  </p>
                </div>
                {pendingAudio.length > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingAudio.length}
                  </span>
                )}
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
          {currentView === 'birds' ? (
            <>
              {/* Bagian Kelola Burung */}
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
            </>
          ) : (
            <>
              {/* Bagian Persetujuan Audio */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-base font-semibold text-gray-900">Persetujuan Audio</h1>
                  <p className="text-xs text-gray-500">
                    {pendingAudio.length} audio menunggu persetujuan
                  </p>
                </div>
                <button
                  onClick={fetchPendingAudio}
                  className="text-xs text-amber-600 hover:underline"
                >
                  Refresh
                </button>
              </div>

              {loadingAudio ? (
                <p className="text-sm text-gray-400 py-4">Memuat audio...</p>
              ) : pendingAudio.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                  <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Tidak ada audio yang menunggu persetujuan.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingAudio.map((audio) => {
                    const bird = audio.birds;
                    const displayName =
                      audio.profiles?.username ||
                      audio.profiles?.full_name ||
                      (audio.user_id ? `User: ${audio.user_id.slice(0, 8)}...` : 'Unknown');

                    return (
                      <div key={audio.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-800">
                                {bird?.name || 'Burung tidak diketahui'}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{displayName}</span>
                              <span className="text-xs text-gray-400">
                                {audio.submitted_at
                                  ? new Date(audio.submitted_at).toLocaleDateString('id-ID')
                                  : ''}
                              </span>
                            </div>
                            <div className="mt-1">
                              <audio controls src={audio.audio_url} className="h-8 w-full max-w-xs" />
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleApproveAudio(audio.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors"
                            >
                              <CheckCircle size={14} />
                              Setujui
                            </button>
                            <button
                              onClick={() => handleRejectAudio(audio.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors"
                            >
                              <XCircle size={14} />
                              Tolak
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
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