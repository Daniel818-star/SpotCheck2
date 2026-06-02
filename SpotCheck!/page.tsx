'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useAppStore } from '@/stores/app-store';
import { ThemeProvider } from '@/components/spotcheck/theme-provider';
import { LandingPage } from '@/components/spotcheck/landing-page';
import { LoginPage } from '@/components/spotcheck/login-page';
import { SignupPage } from '@/components/spotcheck/signup-page';
import { DashboardPage } from '@/components/spotcheck/dashboard-page';

const emptySubscribe = () => () => {};

function useHydratedAuth() {
  const { isAuthenticated, setAuth, setView } = useAppStore();
  const hasHydrated = useRef(false);
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    if (!isClient || hasHydrated.current) return;
    hasHydrated.current = true;
    const token = localStorage.getItem('spotcheck_token');
    const userStr = localStorage.getItem('spotcheck_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuth(user, token);
        setView('dashboard');
      } catch {
        localStorage.removeItem('spotcheck_token');
        localStorage.removeItem('spotcheck_user');
      }
    }
  }, [isClient, setAuth, setView]);

  return isClient;
}

function AppContent() {
  const { currentView, isAuthenticated, setView } = useAppStore();
  const isClient = useHydratedAuth();

  useEffect(() => {
    if (isAuthenticated && (currentView === 'login' || currentView === 'signup')) {
      setView('dashboard');
    }
  }, [isAuthenticated, currentView, setView]);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-3 border-emerald-500/20 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  switch (currentView) {
    case 'login': return <LoginPage />;
    case 'signup': return <SignupPage />;
    case 'dashboard': return isAuthenticated ? <DashboardPage /> : <LandingPage />;
    case 'landing':
    default: return <LandingPage />;
  }
}

export default function Home() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
