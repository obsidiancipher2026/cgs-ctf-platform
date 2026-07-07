'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Loader2, Settings, Save, Eye, EyeOff, KeyRound, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, isAuthenticated, setAuth } = useStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ username: '', email: '', university: '', country: '' });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && (!isAuthenticated || !user)) router.push('/login'); }, [mounted, isAuthenticated, user, router]);

  useEffect(() => {
    if (!mounted || !isAuthenticated || !user) return;
    if (user) setSettingsForm({ username: user.username || '', email: user.email || '', university: (user as any).college || '', country: (user as any).country || '' });
  }, [mounted, isAuthenticated, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSettingsLoading(true);
    try {
      const data = await api.updateProfile({ username: settingsForm.username, email: settingsForm.email, college: settingsForm.university, country: settingsForm.country });
      if (data.user) setAuth(data.user);
      toast.success('Profile updated!');
    } catch (err: any) { toast.error(err?.response?.data?.detail || 'Failed to update'); }
    finally { setSettingsLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwordForm.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    setPasswordLoading(true);
    try {
      await api.changeOwnPassword({ current_password: passwordForm.currentPassword, new_password: passwordForm.newPassword });
      toast.success('Password change request submitted!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) { toast.error(err?.response?.data?.detail || 'Failed'); }
    finally { setPasswordLoading(false); }
  };

  if (!mounted || !isAuthenticated || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-aurora-cyan animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Header */}
          <div className="bg-surface border border-border-c rounded-lg p-5 sm:p-8 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-cyber-grid opacity-20" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-aurora-cyan to-aurora-violet flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display font-bold text-xl sm:text-2xl text-txt-primary truncate">{user.username}</h1>
                  <span className="text-txt-secondary text-xs font-mono">[{user.role}]</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center max-w-xs">
                <div className="p-3 rounded bg-aurora-cyan/20 border border-aurora-cyan/10">
                  <div className="text-aurora-cyan font-display text-lg font-bold">{user.score}</div>
                  <div className="text-txt-muted text-[10px] font-mono">Points</div>
                </div>
                <div className="p-3 rounded bg-signal-amber/5 border border-signal-amber/10">
                  <div className="text-signal-amber font-display text-lg font-bold">#{user.ranking}</div>
                  <div className="text-txt-muted text-[10px] font-mono">Rank</div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            <div className="bg-surface border border-border-c rounded-lg p-5 sm:p-6">
              <h2 className="font-display font-bold text-txt-primary text-lg mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-aurora-cyan" /> Profile Settings</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-txt-secondary text-xs mb-2">Username</label><input type="text" value={settingsForm.username} onChange={(e) => setSettingsForm({ ...settingsForm, username: e.target.value })} className="input-field w-full px-4 py-3 text-sm" required minLength={3} /></div>
                  <div><label className="block text-txt-secondary text-xs mb-2">Email</label><input type="email" value={settingsForm.email} onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })} className="input-field w-full px-4 py-3 text-sm" required /></div>
                  <div><label className="block text-txt-secondary text-xs mb-2">Country</label><input type="text" value={settingsForm.country} onChange={(e) => setSettingsForm({ ...settingsForm, country: e.target.value })} className="input-field w-full px-4 py-3 text-sm" /></div>
                  <div><label className="block text-txt-secondary text-xs mb-2">College / University</label><input type="text" value={settingsForm.university} onChange={(e) => setSettingsForm({ ...settingsForm, university: e.target.value })} className="input-field w-full px-4 py-3 text-sm" /></div>
                </div>
                <button type="submit" disabled={settingsLoading} className="btn-outline px-6 py-3 text-sm flex items-center gap-2 disabled:opacity-50">
                  {settingsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {settingsLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            <div className="bg-surface border border-signal-amber/20 rounded-lg p-5 sm:p-6">
              <h2 className="font-display font-bold text-txt-primary text-lg mb-4 flex items-center gap-2"><KeyRound className="w-5 h-5 text-signal-amber" /> Change Password</h2>
              <p className="text-txt-muted text-xs mb-4">Password changes require admin approval.</p>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div><label className="block text-txt-secondary text-xs mb-2">Current Password</label><input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="input-field w-full px-4 py-3 text-sm" required /></div>
                <div>
                  <label className="block text-txt-secondary text-xs mb-2">New Password</label>
                  <div className="relative">
                    <input type={showNewPassword ? 'text' : 'password'} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="input-field w-full px-4 py-3 text-sm pr-12" required minLength={6} />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-aurora-cyan">{showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div><label className="block text-txt-secondary text-xs mb-2">Confirm New Password</label><input type={showNewPassword ? 'text' : 'password'} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="input-field w-full px-4 py-3 text-sm" required minLength={6} /></div>
                <button type="submit" disabled={passwordLoading} className="px-6 py-3 rounded bg-signal-amber/10 border border-signal-amber/30 text-signal-amber text-sm font-medium hover:bg-signal-amber/20 transition-all flex items-center gap-2 disabled:opacity-50">
                  {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {passwordLoading ? 'Submitting...' : 'Request Password Change'}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
