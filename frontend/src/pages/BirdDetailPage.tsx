import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, MapPin, Volume2, Calendar, Bird as BirdIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AudioPlayer } from '../components/ui/AudioPlayer';
import { LoadingPage } from '../components/ui/Loading';
import { supabase } from '../lib/supabase';
import { Bird, AudioSample } from '../types/database';

interface BirdDetailPageProps {
  birdId: string;
  onNavigate: (page: string) => void;
}

export function BirdDetailPage({ birdId, onNavigate }: BirdDetailPageProps) {
  const [bird, setBird] = useState<Bird | null>(null);
  const [audioSamples, setAudioSamples] = useState<AudioSample[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBirdDetail();
  }, [birdId]);

  const fetchBirdDetail = async () => {
    try {
      const { data: birdData, error: birdError } = await supabase
        .from('birds')
        .select('*')
        .eq('id', birdId)
        .maybeSingle();

      if (birdError) throw birdError;
      setBird(birdData);

      const { data: audioData, error: audioError } = await supabase
        .from('audio_samples')
        .select('*')
        .eq('bird_id', birdId);

      if (audioError) throw audioError;
      setAudioSamples(audioData || []);
    } catch (error) {
      console.error('Error fetching bird detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (!bird) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <BirdIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">Burung tidak ditemukan</p>
          <Button onClick={() => onNavigate('birds')}>Kembali ke Daftar Burung</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Tombol Kembali */}
        <button
          onClick={() => onNavigate('birds')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Kolom Kiri - Gambar & Info Dasar */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              {/* Card Gambar */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-emerald-500 to-teal-600 relative overflow-hidden">
                  {bird.image_url ? (
                    <img
                      src={bird.image_url}
                      alt={bird.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BirdIcon size={80} className="text-white/50" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full mb-3">
                    {bird.category}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {bird.name}
                  </h1>
                  {bird.scientific_name && (
                    <p className="text-sm italic text-gray-400 mb-4">
                      {bird.scientific_name}
                    </p>
                  )}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar size={14} />
                      <span>
                        Ditambahkan {new Date(bird.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan - Detail */}
          <div className="lg:col-span-3 space-y-6">
            {/* Deskripsi */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <BookOpen size={20} className="text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Deskripsi</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {bird.description}
              </p>
            </div>

            {/* Habitat */}
            {bird.habitat && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                    <MapPin size={20} className="text-teal-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Habitat</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {bird.habitat}
                </p>
              </div>
            )}

            {/* Contoh Suara */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Volume2 size={20} className="text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Contoh Suara</h2>
              </div>

              {audioSamples.length > 0 ? (
                <div className="space-y-4">
                  {audioSamples.map((audio, index) => (
                    <div key={audio.id}>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Sample {index + 1}
                        {audio.duration > 0 && (
                          <span className="text-gray-400 ml-2">
                            ({audio.duration} detik)
                          </span>
                        )}
                      </p>
                      <AudioPlayer src={audio.audio_url} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                  <Volume2 size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">
                    Belum ada contoh suara untuk burung ini
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}