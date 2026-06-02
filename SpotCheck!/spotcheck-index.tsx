// ============================================================
// SpotCheck — INDEX FILE (Main App Entry + All Page Components)
// ============================================================
// This file combines: page.tsx, layout.tsx, and all components
// In Next.js, "index" = src/app/page.tsx (the main entry point)
// ============================================================

// ==================== LAYOUT (layout.tsx) ====================
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpotCheck — AI Fake News Detector",
  description: "Verify news claims against trusted sources. From FIFA for sports to NASA for science.",
  icons: { icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}

// ==================== MAIN PAGE (page.tsx) ====================
// 'use client';
//
// import { useEffect, useRef, useSyncExternalStore } from 'react';
// import { useAppStore } from '@/stores/app-store';
// import { ThemeProvider } from '@/components/spotcheck/theme-provider';
// import { LandingPage } from '@/components/spotcheck/landing-page';
// import { LoginPage } from '@/components/spotcheck/login-page';
// import { SignupPage } from '@/components/spotcheck/signup-page';
// import { DashboardPage } from '@/components/spotcheck/dashboard-page';
//
// const emptySubscribe = () => () => {};
//
// function useHydratedAuth() {
//   const { isAuthenticated, setAuth, setView } = useAppStore();
//   const hasHydrated = useRef(false);
//   const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
//
//   useEffect(() => {
//     if (!isClient || hasHydrated.current) return;
//     hasHydrated.current = true;
//     const token = localStorage.getItem('spotcheck_token');
//     const userStr = localStorage.getItem('spotcheck_user');
//     if (token && userStr) {
//       try {
//         const user = JSON.parse(userStr);
//         setAuth(user, token);
//         setView('dashboard');
//       } catch {
//         localStorage.removeItem('spotcheck_token');
//         localStorage.removeItem('spotcheck_user');
//       }
//     }
//   }, [isClient, setAuth, setView]);
//
//   return isClient;
// }
//
// function AppContent() {
//   const { currentView, isAuthenticated, setView } = useAppStore();
//   const isClient = useHydratedAuth();
//
//   useEffect(() => {
//     if (isAuthenticated && (currentView === 'login' || currentView === 'signup')) {
//       setView('dashboard');
//     }
//   }, [isAuthenticated, currentView, setView]);
//
//   if (!isClient) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background">
//         <div className="h-10 w-10 rounded-full border-3 border-emerald-500/20 border-t-emerald-500 animate-spin" />
//       </div>
//     );
//   }
//
//   switch (currentView) {
//     case 'login': return <LoginPage />;
//     case 'signup': return <SignupPage />;
//     case 'dashboard': return isAuthenticated ? <DashboardPage /> : <LandingPage />;
//     case 'landing':
//     default: return <LandingPage />;
//   }
// }
//
// export default function Home() {
//   return (
//     <ThemeProvider>
//       <AppContent />
//     </ThemeProvider>
//   );
// }

// ==================== THEME PROVIDER (theme-provider.tsx) ====================
// 'use client';
//
// import { ThemeProvider as NextThemesProvider } from 'next-themes';
// import { type ReactNode } from 'react';
//
// export function ThemeProvider({ children }: { children: ReactNode }) {
//   return (
//     <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
//       {children}
//     </NextThemesProvider>
//   );
// }

// ==================== THEME TOGGLE (theme-toggle.tsx) ====================
// 'use client';
//
// import { useTheme } from 'next-themes';
// import { Sun, Moon } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { useSyncExternalStore } from 'react';
//
// const emptySubscribe = () => () => {};
//
// export function ThemeToggle() {
//   const { theme, setTheme } = useTheme();
//   const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
//
//   if (!mounted) {
//     return (
//       <Button variant="ghost" size="icon" className="h-9 w-9">
//         <Sun className="h-4 w-4" />
//       </Button>
//     );
//   }
//
//   return (
//     <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full"
//       onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
//       {theme === 'dark' ? (
//         <Sun className="h-4 w-4 text-yellow-400 transition-transform hover:rotate-45" />
//       ) : (
//         <Moon className="h-4 w-4 text-slate-700 transition-transform hover:-rotate-12" />
//       )}
//     </Button>
//   );
// }

// ==================== LANDING PAGE (landing-page.tsx) ====================
// Full landing page with hero, features, categories, how-it-works
// (See landing-page.tsx for complete code — 138 lines)

// ==================== LOGIN PAGE (login-page.tsx) ====================
// Login form with email/password, show/hide password, loading state
// (See login-page.tsx for complete code — 71 lines)

// ==================== SIGNUP PAGE (signup-page.tsx) ====================
// Signup form with name/email/password, validation, loading state
// (See signup-page.tsx for complete code — 68 lines)

// ==================== DASHBOARD PAGE (dashboard-page.tsx) ====================
// Main dashboard with category grid, claim input, analysis results,
// confidence ring, key findings, source breakdown, warnings, history
// (See dashboard-page.tsx for complete code — 335 lines)
