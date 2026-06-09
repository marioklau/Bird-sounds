// BirdsPage.tsx - Revisi sebagai Beranda/Halaman Utama
import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Map as MapIcon, Grid3x3, Mic, Sparkles, BookOpen } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/Loading';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { Bird } from '../types/database';
import { RegionMap } from '../components/map/RegionMap';

interface BirdsPageProps {
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

export function BirdsPage({ onNavigate }: BirdsPageProps) {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [filteredBirds, setFilteredBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(['Semua']);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);

  useEffect(() => {
    fetchBirds();
  }, []);

  useEffect(() => {
    filterBirds();
  }, [searchQuery, selectedCategory, selectedRegion, birds]);

  const fetchBirds = async () => {
    try {
      const { data, error } = await supabase
        .from('birds')
        .select('*')
        .order('name');

      if (error) throw error;

      setBirds(data || []);

      const uniqueCategories = ['Semua', ...new Set(data?.map(b => b.category) || [])];
      setCategories(uniqueCategories);

      const regionsWithBirds = [...new Set(
        data?.filter(b => b.region && b.region !== 'Umum').map(b => b.region) || []
      )];
      setAvailableRegions(regionsWithBirds);
      
    } catch (error) {
      console.error('Error fetching birds:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBirds = () => {
    let filtered = birds;

    if (selectedCategory !== 'Semua') {
      filtered = filtered.filter(bird => bird.category === selectedCategory);
    }

    if (selectedRegion) {
      filtered = filtered.filter(bird => bird.region === selectedRegion);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        bird =>
          bird.name.toLowerCase().includes(query) ||
          bird.scientific_name?.toLowerCase().includes(query) ||
          bird.description.toLowerCase().includes(query)
      );
    }

    setFilteredBirds(filtered);
  };

  const handleRegionSelect = (region: string | null) => {
    setSelectedRegion(region);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Memuat data burung...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      {/* Hero Section dengan fitur Identifikasi */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm mb-6">
            <Sparkles size={18} />
            <span className="text-sm font-medium">Database Burung Indonesia</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Informasi Burung Indonesia
          </h1>
          
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10">
            Jelajahi berbagai jenis burung dengan informasi lengkap. 
            Atau identifikasi burung dari suaranya menggunakan teknologi AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              variant="primary"
              onClick={() => onNavigate('identify')}
              className="bg-white text-emerald-700 hover:bg-gray-100"
            >
              <Mic size={20} />
              Identifikasi Suara Burung
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                const element = document.getElementById('explore-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-emerald-500 hover:bg-emerald-400"
            >
              <BookOpen size={20} />
              Jelajahi Burung
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* View Mode Toggle */}
        <div className="flex justify-end mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5 ${
                viewMode === 'grid' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3x3 size={16} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5 ${
                viewMode === 'map' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MapIcon size={16} />
              <span className="hidden sm:inline">Peta Wilayah</span>
            </button>
          </div>
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="mb-8">
            <RegionMap
              selectedRegion={selectedRegion}
              onRegionSelect={handleRegionSelect}
              availableRegions={availableRegions}
            />
            {selectedRegion && (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Menampilkan burung di wilayah <strong>{REGION_DISPLAY[selectedRegion] || selectedRegion}</strong>
                  <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                    {filteredBirds.length} spesies
                  </span>
                </p>
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  Hapus filter
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search and Filters */}
        <div id="explore-section" className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari nama burung, nama ilmiah, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">Kategori:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Menampilkan {filteredBirds.length} dari {birds.length} burung
          </p>
          {selectedRegion && viewMode === 'grid' && (
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              Hapus filter wilayah
            </button>
          )}
        </div>

        {/* Results Grid */}
        {filteredBirds.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-600">
                {selectedRegion 
                  ? `Tidak ada burung yang ditemukan di wilayah ${REGION_DISPLAY[selectedRegion] || selectedRegion}`
                  : 'Tidak ada burung yang ditemukan'}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBirds.map((bird) => (
              <Card
                key={bird.id}
                hover
                onClick={() => onNavigate('bird-detail', { birdId: bird.id })}
                className="overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105"
              >
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  {bird.image_url ? (
                    <img
                      src={bird.image_url}
                      alt={bird.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                      <span className="text-white text-5xl font-bold">
                        {bird.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-emerald-700">
                    {bird.category}
                  </div>
                  {bird.region && bird.region !== 'Umum' && (
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-md text-white text-xs">
                      {REGION_DISPLAY[bird.region] || bird.region}
                    </div>
                  )}
                </div>

                <CardBody>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {bird.name}
                  </h3>
                  {bird.scientific_name && (
                    <p className="text-sm italic text-gray-600 mb-3">
                      {bird.scientific_name}
                    </p>
                  )}
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {bird.description}
                  </p>
                  {bird.habitat && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="flex-shrink-0 mt-0.5 text-emerald-600" />
                      <span className="line-clamp-1">{bird.habitat}</span>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}