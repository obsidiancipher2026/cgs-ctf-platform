'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '', username: '', email: '', password: '', confirmPassword: '',
    country: '', college: '', agreed_tos: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { setAuth, setCsrfToken } = useStore();
  const redirectTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { return () => { if (redirectTimer.current) clearTimeout(redirectTimer.current); }; }, []);

  const update = (field: string, value: any) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreed_tos) { toast.error('You must agree to the Terms of Service'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (!form.full_name.trim()) { toast.error('Full name is required'); return; }
    setLoading(true);
    try {
      const data = await api.register({
        full_name: form.full_name, username: form.username, email: form.email,
        password: form.password, country: form.country, college: form.college,
        agreed_tos: form.agreed_tos,
      });
      if (data.user) {
        setAuth(data.user);
        try {
          const csrfData = await api.getCsrfToken();
          setCsrfToken(csrfData.csrf_token);
        } catch {}
      }
      toast.success('Registration successful! Welcome aboard.');
      setSuccess(true);
      redirectTimer.current = setTimeout(() => router.push('/challenges'), 800);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inputClass = "input-field w-full px-4 py-3 text-sm pl-10";
  const labelClass = "block text-txt-secondary text-xs font-medium mb-1.5 uppercase tracking-wider";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left Brand Panel — quiet, minimal, identical to Login page */}
      <div className="hidden lg:flex lg:w-[35%] relative bg-void items-center justify-center overflow-hidden">
        <div className="panel-grid" />
        <div className="panel-scan" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(224,32,32,0.04) 0%, transparent 50%, rgba(26,110,255,0.04) 100%)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-red-core/30 via-border-c to-blue-core/30" />

        <div className="relative z-10 text-center px-10 max-w-xs">
          <img src="/images/logo.png" alt="CGS Logo" className="w-12 h-12 mx-auto mb-6 object-contain" />
          <h2 className="font-display font-bold text-2xl text-txt-primary mb-2">Cyber Guardians Society</h2>
          <p className="text-txt-secondary text-sm mb-8">Capture. Exploit. Defend.</p>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border-c" />
            <span className="text-txt-muted text-[10px] font-mono uppercase tracking-widest">Platform</span>
            <div className="flex-1 h-px bg-border-c" />
          </div>

          <p className="text-txt-muted text-xs leading-relaxed">
            Competitive CTF challenges for cybersecurity enthusiasts.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 bg-surface overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-lg">
          {success ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-6" />
              <h2 className="font-display font-bold text-2xl text-success mb-3">Registration Submitted!</h2>
              <p className="text-txt-secondary text-sm mb-6">Your account is pending admin approval. You will be able to access the platform once an administrator approves your account.</p>
              <div className="w-full max-w-sm mx-auto bg-surface-2 rounded-full h-2 mb-4 overflow-hidden border border-border-c">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-core to-success animate-pulse" style={{ width: '100%' }} />
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-6">
                <img src="/images/logo.png" alt="CGS Logo" className="w-10 h-10 mx-auto mb-3 object-contain" />
                <h2 className="font-display font-bold text-xl text-txt-primary">CGS CTF</h2>
              </div>

              {/* Header */}
              <div className="mb-6">
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-txt-primary mb-2">Create Account</h1>
                <p className="text-txt-secondary text-sm">Join Cyber Guardians Society and start your journey.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className={labelClass}>Full Name <span className="text-red-core">*</span></label>
                  <div className="relative">
                    <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className={inputClass} placeholder="John Doe" required autoComplete="name" />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                </div>

                {/* Username + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Callsign <span className="text-red-core">*</span></label>
                    <div className="relative">
                      <input type="text" value={form.username} onChange={(e) => update('username', e.target.value)} className={inputClass} placeholder="h4ck3r_01" required minLength={3} autoComplete="username" />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email <span className="text-red-core">*</span></label>
                    <div className="relative">
                      <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} placeholder="you@email.com" required autoComplete="email" />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                    </div>
                  </div>
                </div>

                {/* Password + Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Password <span className="text-red-core">*</span></label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} className={inputClass + " pr-12"} placeholder="Min 8 characters" required minLength={8} autoComplete="new-password" />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-blue-core transition-colors p-1">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Confirm Password <span className="text-red-core">*</span></label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} className={inputClass} placeholder="Repeat password" required minLength={8} autoComplete="new-password" />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                  </div>
                </div>

                {/* Country + College */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Country <span className="text-red-core">*</span></label>
                    <div className="relative">
                      <input type="text" value={form.country} onChange={(e) => update('country', e.target.value)} className={inputClass} placeholder="e.g. PK" required />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-txt-muted text-[10px] mt-1">Short form (PK, IND, UAE)</p>
                  </div>
                  <div>
                    <label className={labelClass}>College <span className="text-red-core">*</span></label>
                    <div className="relative">
                      <input type="text" value={form.college} onChange={(e) => update('college', e.target.value)} className={inputClass} placeholder="e.g. NUST" required />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                    </div>
                    <p className="text-txt-muted text-[10px] mt-1">Short form</p>
                  </div>
                </div>

                <div className="bg-blue-core/10 border border-blue-core/20 rounded-lg px-4 py-3 text-xs text-txt-secondary">
                  <p><strong>Note:</strong> After registration, your account will be reviewed by an administrator. You will not be able to access the platform until your account is approved.</p>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer group pt-1">
                  <input type="checkbox" checked={form.agreed_tos} onChange={(e) => update('agreed_tos', e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-border-c bg-surface-2 text-blue-core focus:ring-blue-core/30 focus:ring-offset-0 cursor-pointer" />
                  <span className="text-txt-secondary text-xs sm:text-sm leading-relaxed select-none group-hover:text-txt-primary transition-colors">
                    I agree to the <Link href="/terms" className="text-blue-glow hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-glow hover:underline">Privacy Policy</Link>
                  </span>
                </label>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <p className="text-center mt-6 text-txt-muted text-xs">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-glow hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
