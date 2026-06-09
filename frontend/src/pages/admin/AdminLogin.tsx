// AdminLogin.tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.session) window.location.href = '/admin';
    } catch (error: any) {
      setError(error.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
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
        {/* Logo dengan gambar custom */}
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

        {/* Header */}
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px' }}>
          Masuk
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 1.5rem' }}>
          Masukkan kredensial Anda untuk melanjutkan
        </p>

        {/* Form */}
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
              placeholder="admin@email.com"
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
            {loading ? 'Memproses...' : 'Masuk ke dashboard'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '1.5rem', marginBottom: 0 }}>
          © 2025 BirdManager
        </p>
      </div>
    </div>
  );
}