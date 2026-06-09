import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Map as MapIcon,
  Grid3x3,
  Mic,
  Upload,
  BookOpen,
  Brain,
  Bird as BirdIcon,
  CheckCircle,
  FileAudio,
  Leaf,
  Users,
  GraduationCap,
  Heart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { LoadingSpinner } from '../components/ui/Loading';
import { supabase } from '../lib/supabase';
import { Bird } from '../types/database';
import { RegionMap } from '../components/map/RegionMap';

interface HomePageProps {
  onNavigate: (page: string, data?: { birdId: string }) => void;
}

type ViewMode = 'grid' | 'map';

const REGION_DISPLAY: Record<string, string> = {
  Sumatera: 'Sumatera',
  Jawa: 'Jawa',
  Kalimantan: 'Kalimantan',
  Sulawesi: 'Sulawesi',
  Papua: 'Papua',
  Bali_Nusa: 'Bali & Nusa Tenggara',
  Umum: 'Umum',
};

export function HomePage({ onNavigate }: HomePageProps) {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [filteredBirds, setFilteredBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(['Semua']);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  useEffect(() => {
    fetchBirds();
  }, []);

  useEffect(() => {
    filterBirds();
  }, [birds, searchQuery, selectedCategory, selectedRegion]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredBirds]);

  const fetchBirds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('birds').select('*').order('name');
      if (error) throw error;
      const birdData = data || [];
      setBirds(birdData);
      setCategories(['Semua', ...new Set(birdData.map((b) => b.category).filter(Boolean))]);
      setAvailableRegions([
        ...new Set(birdData.filter((b) => b.region && b.region !== 'Umum').map((b) => b.region!)),
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filterBirds = () => {
    let filtered = [...birds];
    if (selectedCategory !== 'Semua') filtered = filtered.filter((b) => b.category === selectedCategory);
    if (selectedRegion) filtered = filtered.filter((b) => b.region === selectedRegion);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.scientific_name?.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
      );
    }
    setFilteredBirds(filtered);
  };

  const scrollToExplore = () => {
    const exploreSection = document.getElementById('explore-section');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalPages = Math.ceil(filteredBirds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBirds = filteredBirds.slice(startIndex, startIndex + itemsPerPage);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h2 className="mt-4 text-base sm:text-lg font-semibold text-gray-700">Memuat Data Burung</h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-400">Menyiapkan database dan model AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* HERO SECTION (sama seperti sebelumnya) */}
      <section className="pt-16 sm:pt-24 pb-16 sm:pb-24 px-4 sm:px-6 bg-gradient-to-r from-sky-100/70 via-white to-emerald-100/70 border-b border-gray-100 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-row items-center justify-between gap-4 sm:gap-6 md:gap-8 lg:gap-12">
            <div className="flex-1 text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-tight tracking-tight mb-2 sm:mb-3 md:mb-5 text-gray-900">
                Identifikasi Jenis Burung<br />
                <span className="text-emerald-600">dari Suaranya</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed mb-4 sm:mb-6 md:mb-8 max-w-2xl">
                Upload atau rekam suara burung, dan biarkan AI mengidentifikasi
                jenisnya. Pelajari spesies burung di seluruh Indonesia.
              </p>
              <div className="flex flex-row flex-wrap gap-2 sm:gap-3 md:gap-4">
                <button
                  onClick={() => onNavigate('identify')}
                  className="inline-flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg bg-gray-900 text-white font-semibold text-[10px] sm:text-xs md:text-sm hover:bg-gray-800 transition-colors shadow-sm"
                >
                  <Upload size={14} className="sm:size-4" />
                  <span className="hidden xs:inline">Upload</span> Audio
                </button>
                <button
                  onClick={() => onNavigate('identify')}
                  className="inline-flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold text-[10px] sm:text-xs md:text-sm hover:bg-green-100 transition-colors"
                >
                  <Mic size={14} className="sm:size-4" />
                  <span className="hidden xs:inline">Rekam</span> Suara
                </button>
                <button
                  onClick={scrollToExplore}
                  className="inline-flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold text-[10px] sm:text-xs md:text-sm hover:bg-green-100 transition-colors"
                >
                  <BirdIcon size={14} className="sm:size-4" />
                  Informasi Suara Burung
                </button>
              </div>
            </div>
            <div className="relative shrink-0">
              <div className="relative h-32 w-32 xs:h-36 xs:w-36 sm:h-44 sm:w-44 md:h-56 md:w-56 lg:h-72 lg:w-72 xl:h-80 xl:w-80">
                <div className="absolute top-0 left-0 w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 xl:w-32 xl:h-32 rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden shadow-xl rotate-[-8deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 border-2 border-white/50">
                  <img src="/burung2.jpg" alt="Burung Indonesia 1" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="absolute top-0 right-0 w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden shadow-xl rotate-[5deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-20 border-2 border-white/50">
                  <img src="/burung3.jpg" alt="Burung Indonesia 2" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden shadow-xl rotate-[12deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-0 border-2 border-white/50">
                  <img src="/burung4.jpg" alt="Burung Indonesia 3" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ KENAPA PENTING + JENIS BURUNG TERIDENTIFIKASI ═══════════════ */}
      <div className="border-b border-gray-100">
        {/* Manfaat Section */}
        <div className="py-8 sm:py-12 px-4 sm:px-6 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                Kenapa Penting Mengenal Jenis Burung?
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-2xl mx-auto">
                Mengidentifikasi burung bukan hanya tentang pengetahuan, tapi juga berkontribusi pada pelestarian alam
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Manfaat cards (sama seperti sebelumnya) */}
              <div className="bg-white rounded-xl p-4 sm:p-5 text-center hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-300">
                  <Leaf size={18} className="sm:text-xl text-emerald-600 group-hover:text-white transition-all duration-300" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">Konservasi Alam</h3>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">Membantu melindungi spesies burung yang terancam punah dan menjaga keseimbangan ekosistem</p>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-5 text-center hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
                  <GraduationCap size={18} className="sm:text-xl text-blue-600 group-hover:text-white transition-all duration-300" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">Penelitian & Edukasi</h3>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">Data identifikasi burung mendukung riset ilmiah dan pembelajaran tentang keanekaragaman hayati</p>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-5 text-center hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-300">
                  <Users size={18} className="sm:text-xl text-orange-600 group-hover:text-white transition-all duration-300" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">Ekowisata</h3>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">Menarik wisatawan pecinta burung dan meningkatkan ekonomi masyarakat sekitar habitat</p>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-5 text-center hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500 group-hover:scale-110 transition-all duration-300">
                  <Heart size={18} className="sm:text-xl text-purple-600 group-hover:text-white transition-all duration-300" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">Indikator Lingkungan</h3>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">Kehadiran jenis burung tertentu menandakan kualitas lingkungan yang sehat</p>
              </div>
            </div>

            {/* ═══════════════ JENIS BURUNG TERIDENTIFIKASI (Baru) ═══════════════ */}
            <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-md sm:text-lg font-semibold text-gray-800">✨ Jenis Burung Teridentifikasi</h3>
                <p className="text-xs text-gray-500 mt-1">Beberapa spesies yang sering dikenali oleh sistem AI kami</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {[
                  { name: 'Cucak Kutilang', latin: 'Pycnonotus aurigaster' },
                  { name: 'Burung Gereja', latin: 'Passer montanus' },
                  { name: 'Tekukur Biasa', latin: 'Spilopelia chinensis' },
                  { name: 'Cabak Kota', latin: 'Caprimulgus affinis' },
                  { name: 'Kipasan Belang', latin: 'Rhipidura javanica' }
                ].map((bird, idx) => (
                  <div key={idx} className="bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-2 sm:px-5 sm:py-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                    <div className="flex items-center gap-2">
                      <BirdIcon size={16} className="text-emerald-500" />
                      <span className="font-medium text-gray-800 text-sm sm:text-base">{bird.name}</span>
                    </div>
                    <p className="text-[10px] italic text-gray-400 mt-0.5 text-center">{bird.latin}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-[11px] text-gray-400 mt-5">
                *Hasil identifikasi berdasarkan suara yang diunggah pengguna
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CARA KERJA (tidak berubah) */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-14">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Tiga Langkah Mudah</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {[
              { title: 'Rekam atau upload', desc: 'Gunakan mikrofon atau upload file audio dalam format MP3, WAV, OGG, dan lainnya.', icon: <FileAudio size={20} className="sm:text-2xl" />, bgColor: 'bg-emerald-100', hoverBgColor: 'group-hover:bg-emerald-500', iconColor: 'text-emerald-600', hoverIconColor: 'group-hover:text-white' },
              { title: 'Analisis AI', desc: 'Model AI kami memproses spektrum suara dan mencocokkan pada database ribuan burung.', icon: <Brain size={20} className="sm:text-2xl" />, bgColor: 'bg-blue-100', hoverBgColor: 'group-hover:bg-blue-500', iconColor: 'text-blue-600', hoverIconColor: 'group-hover:text-white' },
              { title: 'Hasil detail', desc: 'Dapatkan nama spesies, tingkat kepercayaan, habitat, sebaran, dan info ilmiah selengkapnya.', icon: <CheckCircle size={20} className="sm:text-2xl" />, bgColor: 'bg-purple-100', hoverBgColor: 'group-hover:bg-purple-500', iconColor: 'text-purple-600', hoverIconColor: 'group-hover:text-white' },
            ].map((item, idx) => (
              <div key={idx} className="text-center sm:text-left px-2 group cursor-pointer">
                <div className="flex justify-center sm:justify-start items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className={`p-1.5 sm:p-2 ${item.bgColor} rounded-xl transition-all duration-300 ${item.hoverBgColor} group-hover:scale-110`}>
                    <div className={`${item.iconColor} ${item.hoverIconColor} transition-all duration-300`}>{item.icon}</div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-emerald-600 transition-colors duration-300">{item.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FITUR UTAMA (tidak berubah) */}
      <section id="features-section" className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-14">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Fitur Utama</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: <Upload size={18} className="sm:text-xl" />, bg: 'bg-emerald-100', hoverBg: 'group-hover:bg-emerald-500', iconColor: 'text-emerald-600', hoverIconColor: 'group-hover:text-white', title: 'Upload audio', desc: 'Drag & drop atau pilih file audio dalam berbagai format audio populer.' },
              { icon: <Mic size={18} className="sm:text-xl" />, bg: 'bg-orange-100', hoverBg: 'group-hover:bg-orange-500', iconColor: 'text-orange-600', hoverIconColor: 'group-hover:text-white', title: 'Rekam langsung', desc: 'Rekam suara real-time langsung dari lapangan menggunakan mikrofon perangkat Anda.' },
              { icon: <BookOpen size={18} className="sm:text-xl" />, bg: 'bg-purple-100', hoverBg: 'group-hover:bg-purple-500', iconColor: 'text-purple-600', hoverIconColor: 'group-hover:text-white', title: 'Ensiklopedia burung', desc: 'Akses informasi lengkap habitat, status konservasi, suara khas, dan persebaran.' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${f.bg} rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300 ${f.hoverBg} group-hover:scale-110`}>
                  <div className={`${f.iconColor} ${f.hoverIconColor} transition-all duration-300`}>{f.icon}</div>
                </div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2 group-hover:text-emerald-600 transition-colors duration-300">{f.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPLORE / DATABASE dengan PAGINATION (sama seperti sebelumnya) */}
      <section id="explore-section" className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Jelajahi Spesies Burung</h2>
          </div>

          <div className="relative mb-4 sm:mb-6">
            <Search size={14} className="sm:text-base absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama burung, nama ilmiah, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
              <Filter size={11} className="sm:text-xs" /> Kategori:
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all border ${
                    selectedCategory === cat
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {cat.length > 15 ? `${cat.slice(0, 12)}...` : cat}
                </button>
              ))}
            </div>
            <div className="ml-auto mt-2 sm:mt-0 flex bg-gray-100 rounded-lg p-0.5 sm:p-1 gap-0.5 sm:gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium transition-all ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                <Grid3x3 size={11} className="sm:text-xs" /> Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium transition-all ${
                  viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                <MapIcon size={11} className="sm:text-xs" /> Peta
              </button>
            </div>
          </div>

          {viewMode === 'map' && (
            <div className="mb-6 sm:mb-10 rounded-2xl overflow-hidden border border-gray-200">
              <RegionMap
                selectedRegion={selectedRegion}
                onRegionSelect={setSelectedRegion}
                availableRegions={availableRegions}
              />
              {selectedRegion && (
                <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Filter aktif: <strong className="text-gray-900">{REGION_DISPLAY[selectedRegion] ?? selectedRegion}</strong>
                  </p>
                  <button onClick={() => setSelectedRegion(null)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    Hapus filter
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            Menampilkan <span className="font-semibold text-gray-700">{filteredBirds.length}</span> dari{' '}
            <span className="font-semibold text-gray-700">{birds.length}</span> spesies
          </p>

          {filteredBirds.length === 0 ? (
            <div className="text-center py-12 sm:py-20 border border-dashed border-gray-200 rounded-2xl">
              <BirdIcon size={32} className="sm:text-4xl mx-auto text-gray-300 mb-3 sm:mb-4" />
              <h3 className="font-semibold text-gray-600 text-sm sm:text-base mb-1">Tidak ada hasil</h3>
              <p className="text-xs sm:text-sm text-gray-400">Coba ubah kata kunci atau hapus filter yang aktif.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {paginatedBirds.map((bird) => (
                  <div
                    key={bird.id}
                    onClick={() => onNavigate('bird-detail', { birdId: bird.id })}
                    className="group cursor-pointer bg-white border border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-video overflow-hidden relative bg-gradient-to-br from-emerald-500 to-teal-600">
                      {bird.image_url ? (
                        <img src={bird.image_url} alt={bird.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BirdIcon size={32} className="sm:text-4xl text-white/50" />
                        </div>
                      )}
                      <span className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-semibold text-gray-700">
                        {bird.category.length > 15 ? `${bird.category.slice(0, 12)}...` : bird.category}
                      </span>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm leading-snug">{bird.name}</h3>
                      {bird.scientific_name && (
                        <p className="italic text-[9px] sm:text-[11px] text-gray-400 mt-0.5 sm:mt-1 mb-1 sm:mb-2">{bird.scientific_name}</p>
                      )}
                      <p className="text-gray-500 text-[10px] sm:text-xs line-clamp-2 mb-2 sm:mb-3 leading-relaxed">{bird.description}</p>
                      {bird.habitat && (
                        <div className="flex items-start gap-1 text-[9px] sm:text-[11px] text-gray-400">
                          <MapPin size={9} className="sm:text-xs text-emerald-500 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{bird.habitat}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8 sm:mt-10">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                    }`}
                  >
                    <ChevronLeft size={14} className="sm:size-4" />
                    Previous
                  </button>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                    }`}
                  >
                    Next
                    <ChevronRight size={14} className="sm:size-4" />
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-gray-50 mt-6 sm:mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <BirdIcon size={14} className="sm:text-base text-emerald-600" />
            <span className="font-bold text-gray-800 text-xs sm:text-sm">BirdSound Indonesia</span>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 text-center px-2">Sistem identifikasi burung berbasis suara menggunakan AI & Deep Learning</p>
          <p className="text-[10px] sm:text-xs text-gray-400">© 2026</p>
        </div>
      </footer>
    </div>
  );
}