import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  currentView: 'landing' | 'login' | 'signup' | 'dashboard' | 'results';
  setView: (view: 'landing' | 'login' | 'signup' | 'dashboard' | 'results') => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  claimText: string;
  setClaimText: (text: string) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
}

export interface AnalysisSource {
  name: string;
  url: string;
  snippet: string;
  host_name: string;
}

export interface AnalysisResult {
  id: string;
  claim: string;
  category: string;
  categoryConfig: {
    name: string;
    sources: string[];
    icon: string;
    color: string;
  };
  analysis: {
    isFake: boolean | null;
    confidence: number;
    verdict: string;
    explanation: string;
    keyFindings: string[];
    trustedSourcesFound: number;
    sourceBreakdown: Array<{ source: string; supports: boolean; relevance: string }>;
    warnings: string[];
  };
  searchResults: AnalysisSource[];
  createdAt: string;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spotcheck_token', token);
      localStorage.setItem('spotcheck_user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('spotcheck_token');
      localStorage.removeItem('spotcheck_user');
    }
    set({ user: null, token: null, isAuthenticated: false, currentView: 'landing', analysisResult: null });
  },
  currentView: 'landing',
  setView: (currentView) => set({ currentView }),
  selectedCategory: '',
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  claimText: '',
  setClaimText: (claimText) => set({ claimText }),
  isAnalyzing: false,
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  analysisResult: null,
  setAnalysisResult: (analysisResult) => set({ analysisResult }),
}));
