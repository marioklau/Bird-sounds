// components/Navigation.tsx
import { useState, useEffect } from 'react';
import { Home, Mic, Menu, User, LogOut, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string, data?: any) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Cek session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Listen auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription?.subscription.unsubscribe();
  }, []);

  const navItems = [
    { id: 'birds', label: 'Beranda', icon: Home },
    { id: 'identify', label: 'Identifikasi', icon: Mic },
  ];

  if (user) {
    navItems.push({ id: 'profile', label: 'Profil', icon: User });
  }

  // 🔧 Perbaikan 1: handleNavigate dengan safe call dan log
  const handleNavigate = (page: string, data?: any) => {
    console.log('Navigasi ke:', page, data); // untuk debugging
    if (typeof onNavigate === 'function') {
      onNavigate(page, data);
    } else {
      console.error('onNavigate bukan fungsi! Periksa prop di komponen induk.');
    }
    setIsOpen(false);
  };

  // 🔧 Perbaikan 2: handleLogout dengan try-catch
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      handleNavigate('birds');
    } catch (error) {
      console.error('Logout gagal:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavigate('birds')}
          >
            <img src="/burung.png" alt="BirdSound Logo" className="w-10 h-10 rounded-lg object-cover" />
            <span className="text-lg sm:text-xl font-bold text-gray-800">BirdSound</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button" // 🔧 Perbaikan 3: tambahkan type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
            {/* Tombol Login/Logout */}
            {!user ? (
              <button
                type="button" // 🔧 Perbaikan
                onClick={() => handleNavigate('login')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition"
              >
                <LogIn size={18} />
                <span className="text-sm font-medium">Masuk</span>
              </button>
            ) : (
              <button
                type="button" // 🔧 Perbaikan
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-500 border border-red-200 hover:bg-red-50 transition"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Keluar</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button" // 🔧 Perbaikan
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden absolute right-4 top-16 bg-white rounded-lg shadow-lg border border-gray-100 min-w-[200px] z-50">
            <div className="flex flex-col gap-1 p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button" // 🔧 Perbaikan
                    onClick={() => handleNavigate(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
              {!user ? (
                <button
                  type="button" // 🔧 Perbaikan
                  onClick={() => handleNavigate('login')}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition"
                >
                  <LogIn size={20} />
                  <span className="text-sm font-medium">Masuk</span>
                </button>
              ) : (
                <button
                  type="button" // 🔧 Perbaikan
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 border border-red-200 hover:bg-red-50 transition"
                >
                  <LogOut size={20} />
                  <span className="text-sm font-medium">Keluar</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}