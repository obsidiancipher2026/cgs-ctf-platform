'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, Loader2, Shield, Swords, Trophy } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-void items-center justify-center overflow-hidden">
        <div className="panel-grid" />
        <div className="panel-scan" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(224,32,32,0.06) 0%, transparent 40%, rgba(26,110,255,0.06) 100%)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-red-core/40 via-border-c to-blue-core/40" />

        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="relative inline-flex mb-8">
            <div className="panel-glow" />
            <div className="relative">
              <div className="panel-ring-mid" />
              <div className="panel-ring-outer" />
              <img src="/images/logo.png" alt="CGS Logo" className="relative w-20 h-20 object-contain" />
            </div>
          </div>

          <h2 className="font-display font-bold text-4xl mb-3 tracking-tight panel-gradient-text">Cyber Guardians Society</h2>
          <p className="text-txt-secondary text-sm mb-10 leading-relaxed">Capture. Exploit. Defend.</p>

          <div className="space-y-3.5 text-left">
            {[
              { icon: Swords, text: 'Access CTF challenges across 5 categories', color: 'text-red-glow' },
              { icon: Trophy, text: 'Compete on the live leaderboard', color: 'text-blue-glow' },
              { icon: Shield, text: 'Battle-tested security infrastructure', color: 'text-success' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="panel-feature flex items-center gap-3.5"
              >
                <div className="panel-feature-icon">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-txt-secondary text-sm leading-snug">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/images/logo.png" alt="CGS Logo" className="w-12 h-12 mx-auto mb-3 object-contain" />
            <h2 className="font-display font-bold text-xl text-txt-primary">CGS CTF</h2>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-txt-primary mb-2">Welcome Back</h1>
            <p className="text-txt-secondary text-sm">Sign in to access the arena and capture flags.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-txt-secondary text-xs font-medium mb-2 uppercase tracking-wider">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full px-4 py-3 text-sm pl-10"
                  placeholder="agent@cyberguardians.io"
                  required
                  autoComplete="email"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-txt-secondary text-xs font-medium mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full px-4 py-3 text-sm pl-10 pr-12"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-blue-core transition-colors p-1">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-border-c" />
            <span className="text-txt-muted text-xs font-mono">OR</span>
            <div className="flex-1 h-px bg-border-c" />
          </div>

          {/* Register Link */}
          <Link
            href="/register"
            className="btn-outline w-full py-3.5 text-sm flex items-center justify-center gap-2"
          >
            Create New Account
          </Link>

          <p className="text-center mt-6 text-txt-muted text-xs">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-glow hover:underline">Register here</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
