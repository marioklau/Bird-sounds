import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from '../src/components/Navigation';

export function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (page: string, data?: unknown) => {
    if (page === 'result' && data) {
      navigate('/result', { state: data });
    } else if (page === 'bird-detail' && data) {
      navigate(`/birds/${(data as { birdId: string }).birdId}`);
    } else {
      navigate(`/${page === 'home' ? '' : page}`);
    }
  };

  const getCurrentPage = () => {
    const path = location.pathname;

    if (path === '/') return 'home';
    if (path === '/detect') return 'detect';
    if (path === '/result') return 'result';
    if (path === '/birds') return 'birds';
    if (path.startsWith('/birds/')) return 'bird-detail';

    return 'home';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentPage={getCurrentPage()}
        onNavigate={handleNavigate}
      />
      <Outlet />
    </div>
  );
}