import { CheckCircle2, MapPin, BookOpen, RotateCcw, View } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { AudioPlayer } from '../components/ui/AudioPlayer';
import { DetectionResult } from './IdentifyPage';

interface ResultPageProps {
  result: DetectionResult;
  onNavigate: (page: string, data?: unknown) => void;
}

export function ResultPage({ result, onNavigate }: ResultPageProps) {
  // Pengamanan ekstra lapis ganda jika payload result bernilai null/undefined
  const bird = result?.bird ?? {
    id: '',
    name: 'Tidak Diketahui',
    scientific_name: '-',
    description: 'Tidak ada deskripsi tersedia.',
    habitat: '-',
    category: '-',
    image_url: ''
  };
  
  const confidence = result?.confidence ?? 0;
  const audioUrl = result?.audioUrl ?? '';

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-emerald-600 bg-emerald-50';
    if (conf >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getConfidenceText = (conf: number) => {
    if (conf >= 80) return 'Sangat Yakin';
    if (conf >= 60) return 'Cukup Yakin';
    return 'Kemungkinan';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4 animate-bounce">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Analisis Selesai!
          </h1>
          <p className="text-gray-600">
            Kami telah mengidentifikasi suara burung Anda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gray-200 relative overflow-hidden">
              {bird.image_url ? (
                <img
                  src={bird.image_url}
                  alt={bird.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                  <span className="text-white text-6xl font-bold">
                    {bird.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
            <CardBody>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {bird.name}
                  </h2>
                  {bird.scientific_name && (
                    <p className="text-sm italic text-gray-600">
                      {bird.scientific_name}
                    </p>
                  )}
                </div>
                <div className={`px-4 py-2 rounded-full text-center ${getConfidenceColor(confidence)}`}>
                  <p className="text-xs font-semibold">
                    {getConfidenceText(confidence)}
                  </p>
                  <p className="text-2xl font-bold">
                    {confidence.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <BookOpen size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Kategori</p>
                    <p className="text-gray-600">{bird.category || '-'}</p>
                  </div>
                </div>

                {bird.habitat && (
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Habitat</p>
                      <p className="text-gray-600">{bird.habitat}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardBody>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Deskripsi
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {bird.description}
                </p>
              </CardBody>
            </Card>

            {/* Pemutar berkas rekaman manual / upload */}
            {audioUrl && (
              <Card>
                <CardBody>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Audio yang Dianalisis
                  </h3>
                  <AudioPlayer src={audioUrl} />
                </CardBody>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => onNavigate('detect')}
              >
                <RotateCcw size={18} />
                Coba Lagi
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => onNavigate('bird-detail', { birdId: bird.id })}
                disabled={!bird.id}
              >
                <View size={18} />
                Lihat Detail Lengkap
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardBody>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Tingkat Kepercayaan Sinyal
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{bird.name}</span>
                    <span className="font-bold text-emerald-600">{confidence.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(Math.max(confidence, 0), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Hasil analisis didasarkan pada perhitungan spektrogram audio secara real-time. 
              Tingkat kepercayaan menunjukkan kecocokan frekuensi desibel suara tangkapan mikrofon dengan dataset model latih.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}