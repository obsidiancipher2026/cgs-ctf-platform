'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';
import '@/app/cgs-auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setAuth, setCsrfToken } = useStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const fieldsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const gsap = (window as any).gsap;
    if (!gsap || !cardRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(cardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5 });
    tl.fromTo('.cgs-auth-field', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.07 }, '-=0.15');
    tl.fromTo('.cgs-auth-btn', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3 }, '-=0.1');
    tl.fromTo('.cgs-auth-trust', { opacity: 0 }, { opacity: 1, duration: 0.3 }, '-=0.05');
  }, []);

  useEffect(() => {
    if (!error) return;
    const gsap = (window as any).gsap;
    if (!gsap) return;
    gsap.fromTo('.cgs-auth-error-msg', { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.2, ease: 'power2.out' });
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.login(email, password);
      setAuth(data.user);
      try {
        const csrfData = await api.getCsrfToken();
        setCsrfToken(csrfData.csrf_token);
      } catch {}
      toast.success('Welcome back, Guardian!');
      router.push('/challenges');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Login failed';
      setError(msg);
      toast.error(msg);
      const gsap = (window as any).gsap;
      if (gsap && cardRef.current) {
        gsap.fromTo(cardRef.current, { x: -4 }, { x: 4, duration: 0.08, repeat: 3, yoyo: true, ease: 'power2.inOut', onComplete: () => { gsap.set(cardRef.current, { x: 0 }); } });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cgs-auth cgs-auth-login min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--cgs-bg-void)]" style={{ backgroundColor: '#0A0A0C' }}>
      <div className="cgs-auth-circuit" />

      <div ref={cardRef} className="relative z-10 w-full max-w-[420px] mx-4" style={{ opacity: 0 }}>
        {/* Glass card with blue spine */}
        <div className="cgs-auth-glass rounded-[16px] overflow-hidden" style={{ position: 'relative' }}>
          {/* Blue accent spine — 6px on left inner edge */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: '6px', height: '100%', background: 'var(--cgs-blue)', borderRadius: '0 3px 3px 0' }} />

          <div style={{ padding: '40px 36px 36px 42px' }}>
            {/* Status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--cgs-red)', boxShadow: '0 0 6px rgba(255,23,68,0.5)', animation: 'cgsPulseDot 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--cgs-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>CGS Member Access</span>
            </div>

            <style>{`
              @keyframes cgsPulseDot {
                0%, 100% { box-shadow: 0 0 0 0 rgba(255,23,68,0.5); }
                70% { box-shadow: 0 0 0 8px rgba(255,23,68,0); }
              }
            `}</style>

            {/* Heading */}
            <h1 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '22px', color: 'var(--cgs-text-primary)', margin: '16px 0 4px', letterSpacing: '-0.01em' }}>
              Welcome Back
            </h1>
            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', color: 'var(--cgs-text-secondary)', marginBottom: '28px' }}>
              Sign in to access the arena.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Email */}
              <div className="cgs-auth-field" style={{ marginBottom: '16px' }}>
                <input
                  ref={(el) => { fieldsRef.current[0] = el; }}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  required
                  autoComplete="email"
                  id="login-email"
                />
                <svg className="cgs-auth-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                <label htmlFor="login-email">Email</label>
              </div>

              {/* Password */}
              <div className="cgs-auth-field" style={{ marginBottom: '8px' }}>
                <input
                  ref={(el) => { fieldsRef.current[1] = el; }}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  required
                  autoComplete="current-password"
                  id="login-password"
                />
                <svg className="cgs-auth-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
                <label htmlFor="login-password">Password</label>
              </div>

              {/* Error */}
              {error && (
                <div className="cgs-auth-error-msg" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', paddingLeft: '8px', borderLeft: '2px solid var(--cgs-error)', fontFamily: '"Inter", sans-serif', fontSize: '12px', color: 'var(--cgs-error)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                  {error}
                </div>
              )}

              {/* Remember me toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <label className="cgs-auth-toggle" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span className="cgs-auth-toggle-track" />
                  <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', color: 'var(--cgs-text-secondary)' }}>Remember me</span>
                </label>

                <Link href="/forgot-password" style={{ fontFamily: '"Inter", sans-serif', fontSize: '12px', color: 'var(--cgs-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cgs-blue)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--cgs-text-muted)'}>
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="cgs-auth-btn cgs-auth-btn-blue">
                {loading ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'cgsSpin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                ) : <LogIn size={18} />}
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
              <style>{`@keyframes cgsSpin { to { transform: rotate(360deg); } }`}</style>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0 20px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--cgs-border)' }} />
                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '12px', color: 'var(--cgs-text-muted)', whiteSpace: 'nowrap' }}>New to Cyber Guardians?</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--cgs-border)' }} />
              </div>

              {/* Register link */}
              <Link href="/register"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '12px 24px', borderRadius: '10px', fontFamily: '"Inter", sans-serif', fontSize: '13px', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--cgs-text-secondary)', border: '1px solid var(--cgs-border)', textDecoration: 'none', transition: 'all 150ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--cgs-red)'; e.currentTarget.style.borderColor = 'var(--cgs-red-dim)'; e.currentTarget.style.background = 'var(--cgs-red-soft)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--cgs-text-secondary)'; e.currentTarget.style.borderColor = 'var(--cgs-border)'; e.currentTarget.style.background = 'transparent'; }}>
                Create Account
              </Link>
            </form>

            {/* Trust row */}
            <div className="cgs-auth-trust" style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px' }}>
              {[
                { icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', label: 'Encrypted' },
                { icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z', label: 'Verified' },
                { icon: 'M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88', label: 'Private' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cgs-text-muted)" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--cgs-text-muted)', letterSpacing: '0.03em' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin link */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/lenaPretsaMdliuG" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--cgs-text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 150ms' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cgs-red)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--cgs-text-muted)'}>
            Admin Access
          </Link>
        </div>
      </div>
    </div>
  );
}
