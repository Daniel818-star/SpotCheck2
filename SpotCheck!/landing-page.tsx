'use client';

import { motion } from 'framer-motion';
import { Shield, Search, Zap, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/app-store';
import { ThemeToggle } from './theme-toggle';

export function LandingPage() {
  const { setView, isAuthenticated } = useAppStore();

  const features = [
    { icon: Search, title: 'Smart Detection', description: 'AI-powered analysis that cross-references your news claims with trusted sources in real-time.' },
    { icon: Globe, title: 'Category Sources', description: 'From FIFA for sports to NASA for science, each category uses its most trusted sources.' },
    { icon: Zap, title: 'Instant Results', description: 'Get confidence percentages and detailed breakdowns in seconds, not hours.' },
    { icon: Shield, title: 'Evidence-Based', description: 'Every verdict is backed by real search results from authoritative sources.' },
  ];

  const categories = [
    { name: 'Sports', source: 'FIFA, ESPN', emoji: '⚽' },
    { name: 'Politics', source: 'BBC, CNN', emoji: '🏛️' },
    { name: 'Educational', source: 'Britannica', emoji: '🎓' },
    { name: 'Scientific', source: 'NASA', emoji: '🔬' },
    { name: 'Companies', source: 'Bloomberg', emoji: '🏢' },
    { name: 'Acting', source: 'IMDb, Variety', emoji: '🎬' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Spot<span className="text-emerald-500">Check</span></span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button onClick={() => setView('dashboard')} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">
                Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setView('login')} className="text-muted-foreground hover:text-foreground">Log in</Button>
                <Button onClick={() => setView('signup')} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">Get Started</Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-6">
                <Zap className="h-3.5 w-3.5" /> AI-Powered Fake News Detection
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
                Don&apos;t Get Fooled.{' '}
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">Verify First.</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                SpotCheck cross-references your news claims against the most trusted sources for each category — from FIFA for sports to NASA for science — and tells you what&apos;s real and what&apos;s fake.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" onClick={() => setView('signup')} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/25 text-base px-8 h-12">
                  Start Checking — It&apos;s Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setView('login')} className="text-base px-8 h-12">I have an account</Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 * i }} className="relative group p-6 rounded-2xl border border-border/60 bg-card/50 hover:bg-card hover:border-emerald-500/30 transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Category-Specific Verification</h2>
            <p className="text-muted-foreground text-lg">Each category searches its most trusted sources</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.05 * i }} className="flex flex-col items-center p-5 rounded-2xl border border-border/60 bg-card/50 hover:bg-card hover:border-emerald-500/30 transition-all duration-300 text-center">
                <span className="text-3xl mb-3">{cat.emoji}</span>
                <span className="font-semibold text-sm">{cat.name}</span>
                <span className="text-xs text-muted-foreground mt-1">{cat.source}</span>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to verify any claim</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Type Your Claim', desc: 'Paste or type the news claim you want to verify and pick a category.' },
              { step: '2', title: 'We Search Sources', desc: 'SpotCheck searches trusted sources like FIFA, BBC, NASA, and more for your claim.' },
              { step: '3', title: 'Get Your Verdict', desc: 'Receive a REAL/FAKE verdict with a confidence percentage and detailed breakdown.' },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 * i }} className="text-center">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg shadow-emerald-500/25">{item.step}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-emerald-500" /><span className="font-semibold">SpotCheck</span></div>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />100% Free &bull; No API keys needed &bull; Powered by AI</p>
        </div>
      </footer>
    </div>
  );
}
