import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { IdentifyPage, DetectionResult } from './pages/IdentifyPage';
import { ResultPage } from './pages/ResultPage';
import { BirdDetailPage } from './pages/BirdDetailPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import './index.css';

type Page = 'birds' | 'identify' | 'result' | 'bird-detail' | 'admin' | 'admin-login' | 'login' | 'register' | 'profile';

interface PageData {
  result?: DetectionResult;
  birdId?: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('birds');
  const [pageData, setPageData] = useState<PageData>({});
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isRouteInitialized, setIsRouteInitialized] = useState(false);

  // 1. Cek auth dan role
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setAuthChecked(true);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        setIsAdmin(false);
      } else {
        setIsAdmin(profile.role === 'admin');
      }
      setAuthChecked(true);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setIsAdmin(profile?.role === 'admin');
            setAuthChecked(true);
          });
      } else {
        setIsAdmin(false);
        setAuthChecked(true);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 2. Inisialisasi route berdasarkan URL (dijalankan setelah authChecked true)
  useEffect(() => {
    if (!authChecked) return;

    const initializeRoute = async () => {
      const path = window.location.pathname;

      const navigateTo = (page: Page, data?: PageData) => {
        setCurrentPage(page);
        if (data) setPageData(data);
        else setPageData({});
        const urlMap: Record<Page, string> = {
          birds: '/',
          identify: '/identify',
          result: '/result',
          'bird-detail': '/bird-detail',
          admin: '/admin',
          'admin-login': '/admin/login',
          login: '/login',
          register: '/register',
          profile: '/profile',
        };
        window.history.pushState({}, '', urlMap[page] || '/');
      };

      // Proteksi halaman admin
      if (path === '/admin') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigateTo('admin-login');
          setIsRouteInitialized(true);
          return;
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role !== 'admin') {
          navigateTo('login');
        } else {
          navigateTo('admin');
        }
        setIsRouteInitialized(true);
        return;
      }

      if (path === '/admin/login') {
        navigateTo('admin-login');
        setIsRouteInitialized(true);
        return;
      }

      // Rute lainnya
      if (path === '/' || path === '') navigateTo('birds');
      else if (path === '/identify') navigateTo('identify');
      else if (path === '/result') navigateTo('result');
      else if (path === '/login') navigateTo('login');
      else if (path === '/register') navigateTo('register');
      else if (path === '/profile') navigateTo('profile');
      else navigateTo('birds');

      setIsRouteInitialized(true);
    };

    initializeRoute();
  }, [authChecked]);

  // 3. Fungsi navigasi dari komponen
  const handleNavigate = (page: string, data?: unknown) => {
    const targetPage = page as Page;

    if (targetPage === 'admin') {
      if (!authChecked) return;
      if (isAdmin === null) return;
      if (isAdmin === false) {
        window.history.pushState({}, '', '/login');
        setCurrentPage('login');
        setPageData({});
        return;
      }
    }

    const urlMap: Record<Page, string> = {
      birds: '/',
      identify: '/identify',
      result: '/result',
      'bird-detail': '/bird-detail',
      admin: '/admin',
      'admin-login': '/admin/login',
      login: '/login',
      register: '/register',
      profile: '/profile',
    };
    window.history.pushState({}, '', urlMap[targetPage] || '/');
    setCurrentPage(targetPage);
    if (data) setPageData(data as PageData);
    else setPageData({});
  };

  // 4. Tampilkan loading sampai route siap
  if (!isRouteInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </div>
    );
  }

  // 5. Render halaman
  const showNavigation = !['admin', 'admin-login', 'login', 'register'].includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'birds': return <HomePage onNavigate={handleNavigate} />;
      case 'identify': return <IdentifyPage onNavigate={handleNavigate} />;
      case 'result':
        return pageData.result ? <ResultPage result={pageData.result} onNavigate={handleNavigate} /> : <HomePage onNavigate={handleNavigate} />;
      case 'bird-detail':
        return pageData.birdId ? <BirdDetailPage birdId={pageData.birdId} onNavigate={handleNavigate} /> : <HomePage onNavigate={handleNavigate} />;
      case 'login': return <LoginPage onNavigate={handleNavigate} onLogin={() => {}} />;
      case 'register': return <RegisterPage onNavigate={handleNavigate} onLogin={() => {}} />;
      case 'profile': return <ProfilePage onNavigate={handleNavigate} />;
      case 'admin':
        if (isAdmin !== true) {
          setTimeout(() => handleNavigate('login'), 0);
          return null;
        }
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'admin-login':
        return <AdminLogin />; // ✅ Tanpa prop onNavigate
      default: return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavigation && <Navigation currentPage={currentPage} onNavigate={handleNavigate} />}
      {renderPage()}
    </div>
  );
}

export default App;