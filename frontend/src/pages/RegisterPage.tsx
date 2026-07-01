// pages/RegisterPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
  onLogin: () => void; // tetap ada meski tidak digunakan
}

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  // Navigasi otomatis ke login setelah 3 detik jika sukses
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onNavigate('login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, onNavigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '360px',
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '2rem',
      }}>
        {/* Logo + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
          <img 
            src="/burung.png"
            alt="BirdManager Logo"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              objectFit: 'cover',
            }}
          />
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>BirdManager</span>
        </div>

        {success ? (
          // --- Tampilan sukses ---
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#059669', margin: '0 0 8px' }}>
              Selamat!
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 12px' }}>
              Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi (jika diperlukan) atau lanjutkan ke halaman login.
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px' }}>
              Anda akan dialihkan ke halaman login dalam 3 detik...
            </p>
            <button
              onClick={() => onNavigate('login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#059669',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px',
                padding: 0,
              }}
            >
              Login sekarang
            </button>
          </div>
        ) : (
          // --- Form pendaftaran ---
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px', textAlign: 'center' }}>
              Daftar Akun
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 1.5rem', textAlign: 'center' }}>
              Buat akun baru untuk mulai menggunakan BirdManager
            </p>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anda@email.com"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                  Kata sandi
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </div>

              {error && (
                <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '4px',
                  padding: '10px',
                  background: loading ? '#a7f3d0' : '#059669',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </form>

            {/* Link ke login */}
            <p style={{
              textAlign: 'center',
              fontSize: '13px',
              color: '#64748b',
              marginTop: '1.5rem',
              marginBottom: 0,
            }}>
              Sudah punya akun?{' '}
              <button
                onClick={() => onNavigate('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#059669',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  fontSize: '13px',
                }}
              >
                Masuk
              </button>
            </p>
          </>
        )}

        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#94a3b8',
          marginTop: '1.5rem',
          marginBottom: 0,
        }}>
          © 2025 BirdManager
        </p>
      </div>
    </div>
  );
}