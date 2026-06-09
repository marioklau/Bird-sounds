import { useState } from 'react';
import { Home, Mic, Menu, } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'birds', label: 'Beranda', icon: Home },
    { id: 'identify', label: 'Identifikasi', icon: Mic },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo dengan gambar custom */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavigate('birds')}
          >
            <img 
              src="/public/burung.png"
              alt="BirdSound Logo"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <span className="text-lg sm:text-xl font-bold text-gray-800">
              BirdSound
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
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
          </div>

          {/* Mobile Button - Selalu icon Menu, tidak berubah jadi X */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu - Dropdown dari kanan */}
        {isOpen && (
          <div className="md:hidden absolute right-4 top-16 bg-white rounded-lg shadow-lg border border-gray-100 min-w-[200px] z-50">
            <div className="flex flex-col gap-1 p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <button
                    key={item.id}
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}