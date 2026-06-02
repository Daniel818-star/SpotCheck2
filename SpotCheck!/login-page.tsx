'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/stores/app-store';
import { ThemeToggle } from './theme-toggle';
import { useToast } from '@/hooks/use-toast';

export function LoginPage() {
  const { setView, setAuth } = useAppStore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { toast({ title: 'Login Failed', description: data.error, variant: 'destructive' }); return; }
      setAuth(data.user, data.token);
      setView('dashboard');
      toast({ title: 'Welcome back!', description: `Logged in as ${data.user.name}` });
    } catch { toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' }); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"><Shield className="h-5 w-5 text-white" /></div>
            <span className="text-xl font-bold tracking-tight">Spot<span className="text-emerald-500">Check</span></span>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="p-8 rounded-2xl border border-border/60 bg-card shadow-xl">
            <button onClick={() => setView('landing')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"><ArrowLeft className="h-4 w-4" />Back to home</button>
            <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
            <p className="text-muted-foreground text-sm mb-6">Log in to continue verifying news</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11" autoComplete="email" /></div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 h-11" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
              </div>
              <Button type="submit" className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging in...</> : 'Log In'}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">Don&apos;t have an account? <button onClick={() => setView('signup')} className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors">Sign up for free</button></p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
