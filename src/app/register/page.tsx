'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import '@/app/cgs-auth.css';

const STEP_COUNT = 3;

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score += 25;
  if (pw.length >= 12) score += 15;
  if (/[A-Z]/.test(pw)) score += 15;
  if (/[a-z]/.test(pw)) score += 10;
  if (/[0-9]/.test(pw)) score += 15;
  if (/[^A-Za-z0-9]/.test(pw)) score += 20;
  score = Math.min(score, 100);
  if (score < 35) return { score, label: 'Weak', color: 'var(--cgs-red)' };
  if (score < 65) return { score, label: 'Moderate', color: '#FF8C00' };
  return { score, label: 'Strong', color: 'var(--cgs-blue)' };
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    full_name: '', username: '', email: '', password: '', confirmPassword: '',
    country: '', college: '', agreed_tos: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const router = useRouter();
  const redirectTimer = useRef<NodeJS.Timeout | null>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    return () => { if (redirectTimer.current) clearTimeout(redirectTimer.current); };
  }, []);

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  // GSAP step transitions
  const animateStep = useCallback((dir: 'next' | 'prev') => {
    const gsap = (window as any).gsap;
    if (!gsap || !stepRef.current) return;
    const slideX = dir === 'next' ? 30 : -30;
    gsap.fromTo(stepRef.current, { opacity: 0, x: slideX }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.inOut' });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const gsap = (window as any).gsap;
    if (!gsap || !stepRef.current) return;
    gsap.fromTo(stepRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
    gsap.fromTo('.cgs-auth-field', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.05, ease: 'power2.out' }, '-=0.1');
  }, [step]);

  useEffect(() => {
    if (!error) return;
    const gsap = (window as any).gsap;
    if (!gsap) return;
    gsap.fromTo('.cgs-auth-error-msg', { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.2, ease: 'power2.out' });
  }, [error]);

  const canProceed = () => {
    if (step === 1) return form.full_name.trim().length >= 2 && form.username.trim().length >= 3 && form.email.includes('@');
    if (step === 2) return form.password.length >= 8 && form.password === form.confirmPassword;
    return form.agreed_tos;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.full_name.trim()) { setError('Full name is required'); return; }
      if (form.full_name.includes('@')) { setError('Full name cannot be an email address'); return; }
      if (form.full_name.trim().length < 2) { setError('Full name must be at least 2 characters'); return; }
      if (form.username.trim().length < 3) { setError('Username must be at least 3 characters'); return; }
      if (!form.email.includes('@')) { setError('Enter a valid email address'); return; }
    }
    if (step === 2) {
      if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    }
    setError('');
    setDirection('next');
    setStep((s) => Math.min(s + 1, STEP_COUNT));
  };

  const handleBack = () => {
    setError('');
    setDirection('prev');
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreed_tos) { setError('You must agree to the Terms of Service'); return; }
    setLoading(true);
    setError('');
    try {
      await api.register({
        full_name: form.full_name, username: form.username, email: form.email,
        password: form.password, country: form.country, college: form.college,
        agreed_tos: form.agreed_tos,
      });
      toast.success('Registration submitted! Your account is pending admin approval.', { duration: 5000 });
      setSuccess(true);
      redirectTimer.current = setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Registration failed';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const pwStrength = passwordStrength(form.password);

  if (success) {
    return (
      <div className="cgs-auth cgs-auth-register min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--cgs-bg-void)]" style={{ backgroundColor: '#0A0A0C' }}>
        <div className="cgs-auth-circuit" />
        <div className="relative z-10 w-full max-w-[420px] mx-4 text-center" ref={stepRef}>
          <div style={{ marginBottom: '24px' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--cgs-success)" strokeWidth={1.5} style={{ display: 'block', margin: '0 auto' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '20px', color: 'var(--cgs-text-primary)', marginBottom: '8px' }}>Account Created</h2>
          <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', color: 'var(--cgs-text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
            Your account is pending admin approval.<br />You&apos;ll be redirected to login shortly.
          </p>
          <button onClick={() => router.push('/login')} className="cgs-auth-btn cgs-auth-btn-blue" style={{ maxWidth: '200px', margin: '0 auto' }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cgs-auth cgs-auth-register min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--cgs-bg-void)]" style={{ backgroundColor: '#0A0A0C' }}>
      <div className="cgs-auth-circuit" />

      <div className="relative z-10 w-full max-w-[460px] mx-4">
        <div className="cgs-auth-glass rounded-[16px] overflow-hidden" style={{ position: 'relative' }}>
          <div style={{ padding: '32px 32px 28px' }}>
            {/* Step indicator */}
            <div style={{ marginBottom: '28px' }}>
              {/* Desktop: full track */}
              <div className="cgs-auth-hide-mobile" style={{ display: 'none', position: 'relative', height: '4px', background: 'var(--cgs-bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: '2px', width: `${((step - 1) / (STEP_COUNT - 1)) * 100}%`, background: step === STEP_COUNT ? 'var(--cgs-red)' : 'var(--cgs-blue)', transition: 'all 400ms ease' }} />
                {[1, 2, 3].map((s) => (
                  <div key={s} style={{
                    position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                    left: `${((s - 1) / (STEP_COUNT - 1)) * 100}%`,
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: s < step ? 'var(--cgs-success)' : s === step ? (step === STEP_COUNT ? 'var(--cgs-red)' : 'var(--cgs-blue)') : 'var(--cgs-bg-elevated)',
                    border: s <= step ? 'none' : '2px solid var(--cgs-border)',
                    transition: 'all 300ms ease', zIndex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {s < step ? (
                      <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <span style={{ fontSize: '8px', fontWeight: 700, color: s === step ? '#0A0A0C' : 'var(--cgs-text-muted)' }}>{s}</span>
                    )}
                  </div>
                ))}
              </div>
              {/* Mobile: dots */}
              <div className="cgs-auth-show-mobile" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`cgs-auth-step-dot ${s === step ? (step === STEP_COUNT ? 'active-red' : 'active') : ''} ${s < step ? 'done' : ''}`} />
                ))}
              </div>
            </div>

            {/* Step labels */}
            <div style={{ marginBottom: '24px' }}>
              {step === 1 && (
                <div ref={stepRef}>
                  <h2 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '20px', color: 'var(--cgs-text-primary)', marginBottom: '4px' }}>Identity</h2>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', color: 'var(--cgs-text-secondary)' }}>Tell us about yourself.</p>
                </div>
              )}
              {step === 2 && (
                <div ref={stepRef}>
                  <h2 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '20px', color: 'var(--cgs-text-primary)', marginBottom: '4px' }}>Security</h2>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', color: 'var(--cgs-text-secondary)' }}>Set a strong password.</p>
                </div>
              )}
              {step === 3 && (
                <div ref={stepRef}>
                  <h2 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '20px', color: 'var(--cgs-text-primary)', marginBottom: '4px' }}>Confirmation</h2>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', color: 'var(--cgs-text-secondary)' }}>Review and submit.</p>
                </div>
              )}
            </div>

            {/* Form */}
            <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Error */}
              {error && (
                <div className="cgs-auth-error-msg" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', paddingLeft: '8px', borderLeft: '2px solid var(--cgs-error)', fontFamily: '"Inter", sans-serif', fontSize: '12px', color: 'var(--cgs-error)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                  {error}
                </div>
              )}

              {/* Step 1: Identity */}
              <div style={{ display: step === 1 ? 'flex' : 'none', flexDirection: 'column', gap: '2px' }}>
                <div className="cgs-auth-field" style={{ marginBottom: '14px' }}>
                  <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} placeholder=" " required autoComplete="name" id="reg-name" />
                  <svg className="cgs-auth-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  <label htmlFor="reg-name">Full Name</label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="cgs-auth-field">
                    <input type="text" value={form.username} onChange={(e) => update('username', e.target.value)} placeholder=" " required minLength={3} autoComplete="username" id="reg-username" />
                    <svg className="cgs-auth-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    <label htmlFor="reg-username">Callsign</label>
                  </div>
                  <div className="cgs-auth-field">
                    <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder=" " required autoComplete="email" id="reg-email" />
                    <svg className="cgs-auth-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    <label htmlFor="reg-email">Email</label>
                  </div>
                </div>
                {/* Country + College */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '2px' }}>
                  <div className="cgs-auth-field">
                    <input type="text" value={form.country} onChange={(e) => update('country', e.target.value)} placeholder=" " autoComplete="country" id="reg-country" />
                    <svg className="cgs-auth-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" /></svg>
                    <label htmlFor="reg-country">Country (PK, IND)</label>
                  </div>
                  <div className="cgs-auth-field">
                    <input type="text" value={form.college} onChange={(e) => update('college', e.target.value)} placeholder=" " autoComplete="organization" id="reg-college" />
                    <svg className="cgs-auth-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0-.529 2.427.723.723 0 0 0 .482.814 27.62 27.62 0 0 0 5.015 1.23 1.5 1.5 0 0 0 .512-.015 28.16 28.16 0 0 0 5.015-1.23.723.723 0 0 0 .482-.814 60.708 60.708 0 0 0-.53-2.427m-15.372 0a57.53 57.53 0 0 0 1.905-1.953 1.5 1.5 0 0 1 1.034-.465 1.5 1.5 0 0 1 1.034.465 57.53 57.53 0 0 0 1.905 1.953m-3.878 0a60.099 60.099 0 0 1 7.5 0" /></svg>
                    <label htmlFor="reg-college">College</label>
                  </div>
                </div>
              </div>

              {/* Step 2: Security */}
              <div style={{ display: step === 2 ? 'flex' : 'none', flexDirection: 'column', gap: '2px' }}>
                <div className="cgs-auth-field" style={{ marginBottom: '14px' }}>
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => { update('password', e.target.value); }} placeholder=" " required minLength={8} autoComplete="new-password" id="reg-password" />
                  <svg className="cgs-auth-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
                  <label htmlFor="reg-password">Password</label>
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cgs-text-muted)', padding: '4px' }}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div style={{ marginBottom: '14px' }}>
                    <div className="cgs-auth-meter">
                      <div className="cgs-auth-meter-fill" style={{ width: `${pwStrength.score}%`, background: pwStrength.color }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--cgs-text-muted)' }}>Strength: <span style={{ color: pwStrength.color }}>{pwStrength.label}</span></span>
                      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'var(--cgs-text-muted)' }}>{form.password.length} chars</span>
                    </div>
                  </div>
                )}
                <div className="cgs-auth-field">
                  <input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder=" " required minLength={8} autoComplete="new-password" id="reg-confirm" />
                  <svg className="cgs-auth-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
                  <label htmlFor="reg-confirm">Confirm Password</label>
                </div>
              </div>

              {/* Step 3: Confirmation */}
              <div style={{ display: step === 3 ? 'flex' : 'none', flexDirection: 'column', gap: '16px' }}>
                {/* Summary */}
                <div style={{ background: 'var(--cgs-bg-elevated)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Name', value: form.full_name },
                    { label: 'Callsign', value: form.username },
                    { label: 'Email', value: form.email },
                    form.country ? { label: 'Country', value: form.country } : null,
                    form.college ? { label: 'College', value: form.college } : null,
                  ].filter(Boolean).map((item: any, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '12px', color: 'var(--cgs-text-muted)' }}>{item.label}</span>
                      <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', color: 'var(--cgs-text-primary)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Approval notice */}
                <div style={{ background: 'var(--cgs-red-soft)', border: '1px solid var(--cgs-red-dim)', borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cgs-red)" strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '12px', color: 'var(--cgs-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--cgs-red)' }}>Admin Approval Required:</strong> Your account will be reviewed by an administrator before you can access the platform.
                  </p>
                </div>

                {/* Terms */}
                <label className="cgs-auth-toggle" style={{ alignItems: 'flex-start' }}>
                  <input type="checkbox" checked={form.agreed_tos} onChange={(e) => update('agreed_tos', e.target.checked)} style={{ position: 'absolute', opacity: 0 }} />
                  <span className="cgs-auth-toggle-track" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', color: 'var(--cgs-text-secondary)', lineHeight: 1.4 }}>
                    I agree to the <Link href="/terms" style={{ color: 'var(--cgs-blue)', textDecoration: 'none' }}>Terms of Service</Link> and <Link href="/privacy" style={{ color: 'var(--cgs-blue)', textDecoration: 'none' }}>Privacy Policy</Link>
                  </span>
                </label>
              </div>

              {/* Navigation buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', gap: '12px' }}>
                {step > 1 ? (
                  <button type="button" onClick={handleBack} className="cgs-auth-btn cgs-auth-btn-ghost" style={{ width: 'auto', minWidth: '100px', padding: '12px 20px', fontSize: '13px' }}>
                    Back
                  </button>
                ) : <div />}

                {step < STEP_COUNT ? (
                  <button type="button" onClick={handleNext} disabled={!canProceed()} className="cgs-auth-btn cgs-auth-btn-blue" style={{ width: 'auto', minWidth: '120px', padding: '12px 20px', fontSize: '13px' }}>
                    Next
                  </button>
                ) : (
                  <button type="submit" disabled={loading || !form.agreed_tos} className="cgs-auth-btn cgs-auth-btn-red" style={{ width: 'auto', minWidth: '140px', padding: '12px 20px', fontSize: '13px' }}>
                    {loading ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'cgsSpin 0.8s linear infinite' }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    ) : null}
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                )}
              </div>
            </form>

            {/* Sign in link */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '12px', color: 'var(--cgs-text-muted)' }}>Already have an account? </span>
              <Link href="/login" style={{ fontFamily: '"Inter", sans-serif', fontSize: '12px', fontWeight: 500, color: 'var(--cgs-blue)', textDecoration: 'none', transition: 'color 150ms' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cgs-red)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--cgs-blue)'}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes cgsSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
