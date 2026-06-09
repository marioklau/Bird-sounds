// App.tsx - Revisi dengan perubahan page names
import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage'; // BirdsPage jadi Beranda
import { IdentifyPage, DetectionResult } from './pages/IdentifyPage'; // Ganti nama dari DetectionPage
import { ResultPage } from './pages/ResultPage';
import { BirdDetailPage } from './pages/BirdDetailPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import './index.css'

type Page = 'birds' | 'identify' | 'result' | 'bird-detail' | 'admin' | 'admin-login';

interface PageData {
  result?: DetectionResult;
  birdId?: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('birds'); // Default ke birds (Beranda)
  const [pageData, setPageData] = useState<PageData>({});

  // Cek URL path saat pertama kali load
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentPage('admin');
    } else if (path === '/admin/login') {
      setCurrentPage('admin-login');
    }

    // Listen untuk popstate (tombol back/forward)
    const handlePopState = () => {
      const newPath = window.location.pathname;
      if (newPath === '/admin') {
        setCurrentPage('admin');
      } else if (newPath === '/admin/login') {
        setCurrentPage('admin-login');
      } else {
        setCurrentPage('birds');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page: string, data?: unknown) => {
    // Update URL berdasarkan page
    if (page === 'admin') {
      window.history.pushState({}, '', '/admin');
      setCurrentPage('admin');
    } else if (page === 'admin-login') {
      window.history.pushState({}, '', '/admin/login');
      setCurrentPage('admin-login');
    } else {
      if (window.location.pathname === '/admin' || window.location.pathname === '/admin/login') {
        window.history.pushState({}, '', '/');
      }
      setCurrentPage(page as Page);
      if (data) {
        setPageData(data as PageData);
      } else {
        setPageData({});
      }
    }
  };

  // Sembunyikan navigation di halaman admin dan admin-login
  const showNavigation = currentPage !== 'admin' && currentPage !== 'admin-login';

  const renderPage = () => {
    switch (currentPage) {
      case 'birds': // Beranda (sebelumnya Info Burung)
        return <HomePage onNavigate={handleNavigate} />;
      
      case 'identify': // Identifikasi (sebelumnya Deteksi)
        return <IdentifyPage onNavigate={handleNavigate} />;
      
      case 'result':
        return pageData.result && pageData.result.bird ? (
          <ResultPage result={pageData.result} onNavigate={handleNavigate} />
        ) : (
          <HomePage onNavigate={handleNavigate} />
        );
      
      case 'bird-detail':
        return pageData.birdId ? (
          <BirdDetailPage birdId={pageData.birdId} onNavigate={handleNavigate} />
        ) : (
          <HomePage onNavigate={handleNavigate} />
        );
      
      case 'admin':
        return <AdminDashboard />;
      
      case 'admin-login':
        return <AdminLogin />;
      
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavigation && (
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      )}
      {renderPage()}
    </div>
  );
}

export default App;