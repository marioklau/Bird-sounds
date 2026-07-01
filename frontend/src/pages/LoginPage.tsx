// pages/LoginPage.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: () => void;
}

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      onLogin();
      onNavigate('birds');
    }
    setLoading(false);
  };

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

        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px', textAlign: 'center' }}>
          Masuk
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 1.5rem', textAlign: 'center' }}>
          Masukkan kredensial Anda untuk melanjutkan
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {/* Link ke halaman register */}
        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#64748b',
          marginTop: '1.5rem',
          marginBottom: '0.5rem', // dikurangi agar tombol kembali dekat
        }}>
          Belum punya akun?{' '}
          <button
            onClick={() => onNavigate('register')}
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
            Daftar
          </button>
        </p>

        {/* 🔹 Tombol kembali ke HomePage */}
        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#64748b',
          margin: '0 0 1rem',
        }}>
          <button
            onClick={() => onNavigate('home')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: '13px',
            }}
          >
            ← Kembali ke Beranda
          </button>
        </p>

        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#94a3b8',
          marginTop: '1rem',
          marginBottom: 0,
        }}>
          © 2025 BirdManager
        </p>
      </div>
    </div>
  );
}