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
      toast.success('Welcome back, hacker!');
      router.push('/challenges');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="cyber-card-glow rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-cyber-blue mx-auto mb-4" />
            </motion.div>
            <h1 className="font-cyber text-xl sm:text-2xl text-white">Access Terminal</h1>
            <p className="text-gray-500 font-mono text-xs sm:text-sm mt-2">Authenticate to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                  <label className="block text-gray-400 font-mono text-xs mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cyber-input w-full px-4 py-3 rounded-lg font-mono text-sm"
                  placeholder="agent@cyberguardians.io"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-mono text-xs mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cyber-input w-full px-4 py-3 pr-12 rounded-lg font-mono text-sm"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyber-blue"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cyber-btn cyber-btn-ripple w-full py-3 rounded-lg bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 border border-cyber-blue/50 text-white font-cyber text-sm hover:from-cyber-blue/30 hover:to-cyber-purple/30 hover:shadow-[0_0_30px_rgba(0,150,255,0.2)] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-500 font-mono text-sm">New recruit? </span>
            <Link href="/register" className="text-cyber-blue font-mono text-sm hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
