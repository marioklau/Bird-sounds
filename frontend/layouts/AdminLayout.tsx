import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import {AdminNavigation} from '../src/pages/admin/AdminNavigation';

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const isAuth = !!session;
      setIsAuthenticated(isAuth);

      if (!isAuth && location.pathname !== '/admin/login') {
        navigate('/admin/login');
      }
      if (isAuth && location.pathname === '/admin/login') {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Jika sudah login, tampilkan layout dengan navigation admin
  if (isAuthenticated && location.pathname !== '/admin/login') {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavigation />
        <Outlet />
      </div>
    );
  }

  // Untuk halaman login, tampilkan tanpa navigation
  return <Outlet />;
}