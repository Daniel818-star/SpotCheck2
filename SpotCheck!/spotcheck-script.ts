// ============================================================
// SpotCheck — SCRIPT FILE (All JavaScript/TypeScript Logic)
// ============================================================
// This file combines all the "script" logic:
// 1. App Store (State Management - Zustand)
// 2. Auth Library (JWT, bcrypt, category config)
// 3. API Routes (Backend - analyze, auth, history)
// ============================================================


// ==================== 1. APP STORE (stores/app-store.ts) ====================
// This is the global state manager using Zustand

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


// ==================== 2. AUTH LIBRARY (lib/auth.ts) ====================
// JWT token handling, password hashing, and category source configuration

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'spotcheck-secret-key-2024';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch {
    return null;
  }
}

// Category → Trusted Sources mapping
export const CATEGORY_SOURCES: Record<string, { name: string; sources: string[]; icon: string; color: string }> = {
  sports: {
    name: 'Sports',
    sources: ['fifa.com', 'espn.com', 'skysports.com'],
    icon: 'Trophy',
    color: 'emerald',
  },
  politics: {
    name: 'Politics',
    sources: ['bbc.com', 'cnn.com', 'reuters.com'],
    icon: 'Landmark',
    color: 'red',
  },
  educational: {
    name: 'Educational',
    sources: ['britannica.com', 'education.gov', 'harvard.edu'],
    icon: 'GraduationCap',
    color: 'blue',
  },
  scientific: {
    name: 'Scientific',
    sources: ['nasa.gov', 'nature.com', 'science.org'],
    icon: 'Microscope',
    color: 'violet',
  },
  companies: {
    name: 'Companies',
    sources: ['bloomberg.com', 'forbes.com', 'reuters.com'],
    icon: 'Building2',
    color: 'amber',
  },
  acting: {
    name: 'Acting & Entertainment',
    sources: ['imdb.com', 'variety.com', 'hollywoodreporter.com'],
    icon: 'Clapperboard',
    color: 'pink',
  },
};


// ==================== 3. ANALYZE API (api/analyze/route.ts) ====================
// The core fake news detection endpoint
// Uses z-ai-web-dev-sdk for web search + AI chat completions

// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
// import { verifyToken, CATEGORY_SOURCES } from '@/lib/auth';
// import ZAI from 'z-ai-web-dev-sdk';
//
// export async function POST(request: NextRequest) {
//   try {
//     // 1. Verify JWT token
//     const authHeader = request.headers.get('authorization');
//     if (!authHeader?.startsWith('Bearer ')) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }
//     const token = authHeader.split(' ')[1];
//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
//     }
//
//     // 2. Get claim and category
//     const { claim, category } = await request.json();
//     if (!claim || !category) {
//       return NextResponse.json({ error: 'Claim text and category are required' }, { status: 400 });
//     }
//     const categoryConfig = CATEGORY_SOURCES[category];
//     if (!categoryConfig) {
//       return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
//     }
//
//     // 3. Search trusted sources using web search API
//     const zai = await ZAI.create();
//     const searchQuery = `${claim} site:(${categoryConfig.sources.join(' OR ')})`;
//     let searchResults = [];
//
//     try {
//       const searchResponse = await zai.functions.invoke('web_search', {
//         query: searchQuery, num: 10,
//       });
//       searchResults = searchResponse || [];
//     } catch (searchErr) {
//       console.error('Web search error:', searchErr);
//     }
//
//     // 4. Broader search if no results
//     if (searchResults.length === 0) {
//       try {
//         const broaderResponse = await zai.functions.invoke('web_search', {
//           query: `${claim} ${categoryConfig.name} news`, num: 10,
//         });
//         searchResults = broaderResponse || [];
//       } catch (broaderErr) {
//         console.error('Broader search failed:', broaderErr);
//       }
//     }
//
//     // 5. Build search context for AI
//     const searchContext = searchResults
//       .slice(0, 8)
//       .map((r, i) => `[${i + 1}] ${r.name} (${r.host_name}): ${r.snippet}`)
//       .join('\n');
//
//     // 6. AI analysis prompt
//     const analysisPrompt = `You are SpotCheck, an expert fake news detection AI.
//     Analyze: "${claim}" in category "${categoryConfig.name}".
//     Trusted sources: ${categoryConfig.sources.join(', ')}
//     Search results: ${searchContext || 'No results found.'}
//     Respond in JSON: { isFake, confidence (0-100), verdict (REAL/FAKE/UNCERTAIN),
//     explanation, keyFindings[], trustedSourcesFound, sourceBreakdown[], warnings[] }`;
//
//     // 7. Call AI for analysis
//     const completion = await zai.chat.completions.create({
//       messages: [
//         { role: 'system', content: 'You are SpotCheck. Respond with valid JSON only.' },
//         { role: 'user', content: analysisPrompt },
//       ],
//       temperature: 0.3, max_tokens: 1500,
//     });
//
//     const content = completion.choices[0]?.message?.content || '';
//     const analysisResult = JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
//
//     // 8. Save to database
//     const analysis = await db.analysis.create({
//       data: {
//         userId: decoded.userId, claim, category,
//         result: analysisResult.verdict || 'UNCERTAIN',
//         confidence: analysisResult.confidence || 0,
//         sources: JSON.stringify(searchResults.slice(0, 5)),
//         explanation: JSON.stringify(analysisResult),
//         isFake: analysisResult.isFake ?? false,
//       },
//     });
//
//     // 9. Return full result
//     return NextResponse.json({
//       id: analysis.id, claim, category,
//       categoryConfig: { name: categoryConfig.name, sources: categoryConfig.sources, icon: categoryConfig.icon, color: categoryConfig.color },
//       analysis: analysisResult,
//       searchResults: searchResults.slice(0, 5).map(r => ({ name: r.name, url: r.url, snippet: r.snippet, host_name: r.host_name })),
//       createdAt: analysis.createdAt,
//     });
//   } catch (error) {
//     console.error('Analyze error:', error);
//     return NextResponse.json({ error: 'Analysis failed.' }, { status: 500 });
//   }
// }


// ==================== 4. SIGNUP API (api/auth/signup/route.ts) ====================
// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
// import { hashPassword, generateToken } from '@/lib/auth';
//
// export async function POST(request: NextRequest) {
//   const { name, email, password } = await request.json();
//   if (!name || !email || !password) return NextResponse.json({ error: 'All fields required' }, { status: 400 });
//   if (password.length < 6) return NextResponse.json({ error: 'Password min 6 chars' }, { status: 400 });
//   const existingUser = await db.user.findUnique({ where: { email } });
//   if (existingUser) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
//   const hashedPassword = await hashPassword(password);
//   const user = await db.user.create({ data: { name, email, password: hashedPassword } });
//   const token = generateToken({ userId: user.id, email: user.email });
//   return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } });
// }


// ==================== 5. LOGIN API (api/auth/login/route.ts) ====================
// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
// import { verifyPassword, generateToken } from '@/lib/auth';
//
// export async function POST(request: NextRequest) {
//   const { email, password } = await request.json();
//   if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
//   const user = await db.user.findUnique({ where: { email } });
//   if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
//   const isValid = await verifyPassword(password, user.password);
//   if (!isValid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
//   const token = generateToken({ userId: user.id, email: user.email });
//   return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } });
// }


// ==================== 6. HISTORY API (api/history/route.ts) ====================
// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
// import { verifyToken } from '@/lib/auth';
//
// export async function GET(request: NextRequest) {
//   const authHeader = request.headers.get('authorization');
//   if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   const decoded = verifyToken(authHeader.split(' ')[1]);
//   if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
//   const analyses = await db.analysis.findMany({
//     where: { userId: decoded.userId }, orderBy: { createdAt: 'desc' }, take: 50,
//   });
//   return NextResponse.json({ analyses: analyses.map(a => ({
//     id: a.id, claim: a.claim, category: a.category,
//     result: a.result, confidence: a.confidence, isFake: a.isFake,
//     explanation: a.explanation, createdAt: a.createdAt,
//   }))});
// }


// ==================== 7. DATABASE SCHEMA (prisma/schema.prisma) ====================
// generator client { provider = "prisma-client-js" }
// datasource db { provider = "sqlite"; url = env("DATABASE_URL") }
//
// model User {
//   id        String     @id @default(cuid())
//   email     String     @unique
//   name      String
//   password  String
//   createdAt DateTime   @default(now())
//   updatedAt DateTime   @updatedAt
//   analyses Analysis[]
// }
//
// model Analysis {
//   id          String   @id @default(cuid())
//   userId      String
//   claim       String
//   category    String
//   result      String
//   confidence  Int
//   sources     String
//   explanation String
//   isFake      Boolean
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt
//   user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//   @@index([userId])
// }
