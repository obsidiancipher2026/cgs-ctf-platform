'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { sanitizeInput } from '@/lib/sanitize';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setAuth, setCsrfToken } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login(sanitizeInput(email), password);
      setAuth(data.user);
      try {
        const csrfData = await api.getCsrfToken();
        setCsrfToken(csrfData.csrf_token);
      } catch {}
      toast.success('Welcome back, Guardian!');
      router.push('/challenges');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-[40%] relative bg-void items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(224,32,32,0.08) 0%, transparent 50%, rgba(26,110,255,0.08) 100%)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-red-core/40 via-border-c to-blue-core/40" />
        <div className="relative z-10 text-center px-8">
          <Shield className="w-16 h-16 text-red-core mx-auto mb-6" />
          <h2 className="font-display font-bold text-3xl text-txt-primary mb-3">Cyber Guardians Society</h2>
          <p className="text-txt-secondary text-sm">Capture. Exploit. Defend.</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-surface">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Shield className="w-10 h-10 text-red-core mx-auto mb-3" />
            <h2 className="font-display font-bold text-xl text-txt-primary">CGS CTF</h2>
          </div>

          <h1 className="font-display font-bold text-2xl text-txt-primary mb-1">Welcome Back, Guardian</h1>
          <p className="text-txt-secondary text-sm mb-8">Sign in to access the arena.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-txt-secondary text-xs font-medium mb-2 uppercase tracking-wider">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full px-4 py-3 text-sm"
                placeholder="agent@cyberguardians.io" required autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-txt-secondary text-xs font-medium mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full px-4 py-3 pr-12 text-sm"
                  placeholder="••••••••" required autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-blue-core transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-txt-muted text-sm">New recruit? </span>
            <Link href="/register" className="text-blue-glow text-sm hover:underline">Register here</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
