'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Search, Trophy, Landmark, GraduationCap, Microscope,
  Building2, Clapperboard, Loader2, LogOut, History, ChevronRight,
  AlertTriangle, CheckCircle2, XCircle, HelpCircle, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/stores/app-store';
import { ThemeToggle } from './theme-toggle';
import { CATEGORY_SOURCES } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const categoryIcons: Record<string, React.ElementType> = { Trophy, Landmark, GraduationCap, Microscope, Building2, Clapperboard };

const categoryColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  sports: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-500', glow: 'shadow-emerald-500/20' },
  politics: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500', glow: 'shadow-red-500/20' },
  educational: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-500', glow: 'shadow-sky-500/20' },
  scientific: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-500', glow: 'shadow-violet-500/20' },
  companies: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500', glow: 'shadow-amber-500/20' },
  acting: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-500', glow: 'shadow-pink-500/20' },
};

function getConfidenceColor(confidence: number) {
  if (confidence >= 75) return 'text-emerald-500';
  if (confidence >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function getConfidenceBarColor(confidence: number) {
  if (confidence >= 75) return '[&>div]:bg-emerald-500';
  if (confidence >= 50) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-red-500';
}

function getVerdictIcon(verdict: string) {
  switch (verdict.toUpperCase()) {
    case 'REAL': return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
    case 'FAKE': return <XCircle className="h-6 w-6 text-red-500" />;
    default: return <HelpCircle className="h-6 w-6 text-amber-500" />;
  }
}

function getVerdictBg(verdict: string) {
  switch (verdict.toUpperCase()) {
    case 'REAL': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
    case 'FAKE': return 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400';
    default: return 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400';
  }
}

export function DashboardPage() {
  const { user, token, logout, setView, selectedCategory, setSelectedCategory, claimText, setClaimText, isAnalyzing, setIsAnalyzing, analysisResult, setAnalysisResult } = useAppStore();
  const { toast } = useToast();
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; claim: string; category: string; result: string; confidence: number; isFake: boolean; createdAt: string }>>([]);

  useEffect(() => {
    if (user && token) {
      const savedToken = localStorage.getItem('spotcheck_token');
      const savedUser = localStorage.getItem('spotcheck_user');
      if (savedToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          if (!user) { useAppStore.getState().setAuth(parsedUser, savedToken); }
        } catch { /* ignore */ }
      }
    }
  }, [user, token]);

  const handleAnalyze = async () => {
    if (!selectedCategory) { toast({ title: 'Select a category', description: 'Choose a category for your news claim', variant: 'destructive' }); return; }
    if (!claimText.trim()) { toast({ title: 'Enter a claim', description: 'Type or paste the news claim you want to verify', variant: 'destructive' }); return; }
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ claim: claimText, category: selectedCategory }) });
      const data = await res.json();
      if (!res.ok) { toast({ title: 'Analysis Failed', description: data.error, variant: 'destructive' }); return; }
      setAnalysisResult(data);
      toast({ title: 'Analysis Complete', description: `Verdict: ${data.analysis.verdict}` });
    } catch { toast({ title: 'Error', description: 'Failed to analyze. Please try again.', variant: 'destructive' }); } finally { setIsAnalyzing(false); }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setHistory(data.analyses);
    } catch { /* ignore */ }
  };

  useEffect(() => { if (showHistory) fetchHistory(); }, [showHistory]);

  const handleLogout = () => { logout(); setView('landing'); toast({ title: 'Logged out', description: 'See you next time!' }); };

  if (!user) { setView('landing'); return null; }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"><Shield className="h-5 w-5 text-white" /></div>
            <span className="text-xl font-bold tracking-tight">Spot<span className="text-emerald-500">Check</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)} className="text-muted-foreground"><History className="h-4 w-4 mr-1.5" />History</Button>
            <ThemeToggle />
            <Separator orientation="vertical" className="h-6 mx-1" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</div>
              <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleLogout}><LogOut className="h-4 w-4 text-muted-foreground" /></Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-5">
            <Card className="border-border/60 shadow-lg">
              <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Search className="h-5 w-5 text-emerald-500" />Select Category</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2.5">
                  {Object.entries(CATEGORY_SOURCES).map(([key, config]) => {
                    const Icon = categoryIcons[config.icon] || Search;
                    const colors = categoryColors[key];
                    const isSelected = selectedCategory === key;
                    return (
                      <motion.button key={key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setSelectedCategory(key); setAnalysisResult(null); }}
                        className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${isSelected ? `${colors.border} ${colors.bg} shadow-lg ${colors.glow}` : 'border-border/40 hover:border-border/80 bg-transparent'}`}>
                        <Icon className={`h-5 w-5 ${isSelected ? colors.text : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>{config.name}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight text-center">{config.sources.slice(0, 2).join(', ')}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-lg">
              <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />Enter Your Claim</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Textarea placeholder="Type or paste the news claim you want to verify..." value={claimText} onChange={(e) => setClaimText(e.target.value)} className="min-h-[120px] resize-none text-base" />
                {selectedCategory && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Searching:</span>
                    {CATEGORY_SOURCES[selectedCategory].sources.map((s, i) => (<Badge key={i} variant="secondary" className="text-xs font-normal">{s}</Badge>))}
                  </div>
                )}
                <Button onClick={handleAnalyze} disabled={isAnalyzing || !selectedCategory || !claimText.trim()} className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 text-base font-medium">
                  {isAnalyzing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing with {CATEGORY_SOURCES[selectedCategory]?.name || ''} sources...</> : <><Search className="mr-2 h-5 w-5" />Verify This Claim</>}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <AnimatePresence mode="wait">
              {isAnalyzing && (
                <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center justify-center py-20">
                  <div className="relative"><div className="h-20 w-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" /><Shield className="absolute inset-0 m-auto h-8 w-8 text-emerald-500" /></div>
                  <p className="mt-6 text-lg font-medium">Searching trusted sources...</p>
                  <p className="text-sm text-muted-foreground mt-1">Cross-referencing with {CATEGORY_SOURCES[selectedCategory]?.sources.join(', ')}</p>
                </motion.div>
              )}

              {analysisResult && !isAnalyzing && (
                <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
                  <Card className={`border-2 shadow-xl overflow-hidden ${analysisResult.analysis.verdict === 'REAL' ? 'border-emerald-500/40' : analysisResult.analysis.verdict === 'FAKE' ? 'border-red-500/40' : 'border-amber-500/40'}`}>
                    <div className={`px-6 py-5 ${analysisResult.analysis.verdict === 'REAL' ? 'bg-emerald-500/5' : analysisResult.analysis.verdict === 'FAKE' ? 'bg-red-500/5' : 'bg-amber-500/5'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">{getVerdictIcon(analysisResult.analysis.verdict)}<div><p className="text-sm text-muted-foreground">Verdict</p><p className="text-2xl font-bold">{analysisResult.analysis.verdict}</p></div></div>
                        <div className="text-right"><p className="text-sm text-muted-foreground">Confidence</p><p className={`text-3xl font-bold ${getConfidenceColor(analysisResult.analysis.confidence)}`}>{analysisResult.analysis.confidence}%</p></div>
                      </div>
                      <div className="mt-4"><Progress value={analysisResult.analysis.confidence} className={`h-2.5 ${getConfidenceBarColor(analysisResult.analysis.confidence)}`} /></div>
                    </div>
                    <CardContent className="pt-5"><p className="text-sm leading-relaxed text-muted-foreground">{analysisResult.analysis.explanation}</p></CardContent>
                  </Card>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Card className="border-border/60 shadow-lg">
                      <CardContent className="pt-6 flex flex-col items-center">
                        <div className="relative h-36 w-36">
                          <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="10" fill="none" className="text-muted/30" />
                            <circle cx="60" cy="60" r="50" stroke={analysisResult.analysis.confidence >= 75 ? '#10b981' : analysisResult.analysis.confidence >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="10" fill="none" strokeDasharray={`${(analysisResult.analysis.confidence / 100) * 314.16} 314.16`} strokeLinecap="round" className="confidence-ring transition-all duration-1000" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-3xl font-bold ${getConfidenceColor(analysisResult.analysis.confidence)}`}>{analysisResult.analysis.confidence}%</span>
                            <span className="text-xs text-muted-foreground">Assurance</span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <Badge className={getVerdictBg(analysisResult.analysis.verdict)}>{analysisResult.analysis.verdict}</Badge>
                          <Badge variant="outline" className="text-xs">{analysisResult.categoryConfig.name}</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-lg">
                      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Key Findings</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="space-y-2.5">
                          {analysisResult.analysis.keyFindings?.map((finding, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm"><ChevronRight className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /><span className="text-muted-foreground leading-relaxed">{finding}</span></li>
                          ))}
                          {(!analysisResult.analysis.keyFindings || analysisResult.analysis.keyFindings.length === 0) && (<li className="text-sm text-muted-foreground">No specific findings available.</li>)}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {analysisResult.analysis.sourceBreakdown && analysisResult.analysis.sourceBreakdown.length > 0 && (
                    <Card className="border-border/60 shadow-lg">
                      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><ExternalLink className="h-4 w-4 text-emerald-500" />Source Breakdown</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysisResult.analysis.sourceBreakdown.map((source, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              {source.supports ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                              <div className="flex-1 min-w-0"><p className="text-sm font-medium">{source.source}</p><p className="text-xs text-muted-foreground truncate">{source.relevance}</p></div>
                              <Badge variant={source.supports ? 'default' : 'destructive'} className="text-xs shrink-0">{source.supports ? 'Supports' : 'Contradicts'}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {analysisResult.analysis.warnings && analysisResult.analysis.warnings.length > 0 && (
                    <Card className="border-amber-500/30 shadow-lg">
                      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2 text-amber-500"><AlertTriangle className="h-4 w-4" />Warnings & Red Flags</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysisResult.analysis.warnings.map((warning, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /><span className="text-muted-foreground">{warning}</span></li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {analysisResult.searchResults && analysisResult.searchResults.length > 0 && (
                    <Card className="border-border/60 shadow-lg">
                      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4 text-emerald-500" />Sources Found ({analysisResult.searchResults.length})</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysisResult.searchResults.map((result, i) => (
                            <a key={i} href={result.url} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0"><p className="text-sm font-medium group-hover:text-emerald-500 transition-colors truncate">{result.name}</p><p className="text-xs text-muted-foreground mt-0.5">{result.host_name}</p><p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.snippet}</p></div>
                                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {!analysisResult && !isAnalyzing && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5"><Shield className="h-10 w-10 text-emerald-500/50" /></div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Verify</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">Select a category, type your news claim, and click &quot;Verify This Claim&quot; to get started.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {showHistory && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-8 overflow-hidden">
              <Card className="border-border/60 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-emerald-500" />Analysis History</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>Close</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No analyses yet. Start by verifying a claim!</p>
                  ) : (
                    <ScrollArea className="max-h-96">
                      <div className="space-y-3">
                        {history.map((item) => {
                          const catConfig = CATEGORY_SOURCES[item.category as keyof typeof CATEGORY_SOURCES];
                          return (
                            <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${item.result === 'REAL' ? 'bg-emerald-500/10' : item.result === 'FAKE' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                                {item.result === 'REAL' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : item.result === 'FAKE' ? <XCircle className="h-5 w-5 text-red-500" /> : <HelpCircle className="h-5 w-5 text-amber-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.claim}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-[10px]">{catConfig?.name || item.category}</Badge>
                                  <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <Badge className={getVerdictBg(item.result)}>{item.result}</Badge>
                                <p className={`text-sm font-semibold mt-1 ${getConfidenceColor(item.confidence)}`}>{item.confidence}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
