'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, UserPlus, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { sanitizeObject } from '@/lib/sanitize';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', middle_name: '', last_name: '',
    username: '', email: '', password: '', confirmPassword: '',
    gender: '', country: '', college: '',
    age_group: '', player_type: '', agreed_tos: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown, router]);

  const update = (field: string, value: any) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreed_tos) {
      toast.error('You must agree to the Terms of Service and Privacy Policy');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!form.first_name.trim()) {
      toast.error('First name is required');
      return;
    }
    setLoading(true);
    try {
      await api.register(sanitizeObject({
        first_name: form.first_name,
        middle_name: form.middle_name || undefined,
        last_name: form.last_name || undefined,
        username: form.username,
        email: form.email,
        password: form.password,
        gender: form.gender || undefined,
        country: form.country || undefined,
        college: form.college || undefined,
        age_group: form.age_group || undefined,
        player_type: form.player_type || undefined,
        agreed_tos: form.agreed_tos,
      }));
      toast.success('Registration successful!');
      setCooldown(10);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "cyber-input w-full px-4 py-3 rounded-lg font-mono text-sm";
  const labelClass = "block text-gray-400 font-mono text-xs mb-2 tracking-wider";
  const selectClass = "cyber-input w-full px-4 py-3 rounded-lg font-mono text-sm appearance-none";

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="cyber-card rounded-2xl p-6 sm:p-10 border-cyber-blue/20">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-cyber-blue mx-auto mb-5" />
            <h1 className="font-cyber text-xl sm:text-2xl text-white">Create Account</h1>
            <p className="text-gray-500 font-mono text-xs sm:text-sm mt-2">Join the Cyber Guardians Society</p>
          </div>

          {cooldown > 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-cyber-green mx-auto mb-6" />
              <h2 className="font-cyber text-xl text-cyber-green mb-3">Registration Submitted!</h2>
              <p className="text-gray-400 font-mono text-sm mb-2">
                Your account is pending admin approval.
              </p>
              <p className="text-gray-500 font-mono text-xs mb-6">
                You will be able to log in once an administrator activates your account.
              </p>
              <div className="w-full max-w-sm mx-auto bg-gray-800/50 rounded-full h-2.5 mb-4 overflow-hidden border border-cyber-blue/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyber-blue to-cyber-green transition-all duration-1000 ease-linear"
                  style={{ width: `${((10 - cooldown) / 10) * 100}%` }}
                />
              </div>
              <p className="text-gray-500 font-mono text-xs">Redirecting to home page...</p>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>First Name <span className="text-cyber-blue">*</span></label>
                <input type="text" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} className={inputClass} placeholder="John" required />
              </div>
              <div>
                <label className={labelClass}>Middle Name</label>
                <input type="text" value={form.middle_name} onChange={(e) => update('middle_name', e.target.value)} className={inputClass} placeholder="(optional)" />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input type="text" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} className={inputClass} placeholder="(optional)" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Scoreboard Name <span className="text-cyber-blue">*</span></label>
                <input type="text" value={form.username} onChange={(e) => update('username', e.target.value)} className={inputClass} placeholder="choose_callsign" required minLength={3} />
              </div>
              <div>
                <label className={labelClass}>Email <span className="text-cyber-blue">*</span></label>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} placeholder="agent@cyberguardians.io" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Password <span className="text-cyber-blue">*</span></label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} className={inputClass + " pr-12"} placeholder="••••••••" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyber-blue transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
{form.password && (
    <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden mt-1">
      <div
        className="h-full rounded-full bg-cyber-blue transition-all duration-300"
        style={{ width: `${Math.min(100, (form.password.length / 10) * 100)}%` }}
      />
    </div>
  )}
              <div>
                <label className={labelClass}>Confirm Password <span className="text-cyber-blue">*</span></label>
                <input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} className={inputClass} placeholder="••••••••" required minLength={6} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Gender</label>
                <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className={selectClass}>
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input type="text" value={form.country} onChange={(e) => update('country', e.target.value)} className={inputClass} placeholder="e.g. PK" />
                <p className="text-gray-500 font-mono text-[10px] mt-1">Please write your country name in short form (e.g. PK, IND, UAE)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className={labelClass}>College / University</label>
                <input type="text" value={form.college} onChange={(e) => update('college', e.target.value)} className={inputClass} placeholder="(optional)" />
                <p className="text-gray-500 font-mono text-[10px] mt-1">Please write your college/university name in short form</p>
              </div>
              <div>
                <label className={labelClass}>Age Group</label>
                <select value={form.age_group} onChange={(e) => update('age_group', e.target.value)} className={selectClass}>
                  <option value="">Select age group</option>
                  <option value="under_18">Under 18</option>
                  <option value="18_24">18 – 24</option>
                  <option value="25_34">25 – 34</option>
                  <option value="35_44">35 – 44</option>
                  <option value="45_plus">45+</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Player Type</label>
                <select value={form.player_type} onChange={(e) => update('player_type', e.target.value)} className={selectClass}>
                  <option value="">Select player type</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                  <option value="ctf_veteran">CTF Veteran</option>
                </select>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group pt-1">
              <input type="checkbox" checked={form.agreed_tos} onChange={(e) => update('agreed_tos', e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyber-blue focus:ring-cyber-blue/30 focus:ring-offset-0 cursor-pointer" />
              <span className="text-gray-400 font-mono text-xs sm:text-sm leading-relaxed select-none group-hover:text-gray-300 transition-colors">
                I agree to the{' '}
                <Link href="/terms" className="text-cyber-blue underline decoration-cyber-blue/30 hover:decoration-cyber-blue transition-all">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-cyber-blue underline decoration-cyber-blue/30 hover:decoration-cyber-blue transition-all">Privacy Policy</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="cyber-btn w-full py-3 rounded-lg bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 border border-cyber-blue/50 text-white font-cyber text-sm hover:from-cyber-blue/30 hover:to-cyber-purple/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          )}

          <div className="mt-6 text-center">
            <span className="text-gray-500 font-mono text-sm">Already have an account? </span>
            <Link href="/login" className="text-cyber-blue font-mono text-sm hover:underline">
              Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
