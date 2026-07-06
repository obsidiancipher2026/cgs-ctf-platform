'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Trophy, Loader2, BookOpen, Settings, CheckCircle, Circle, Swords, Droplet, Save, Eye, EyeOff, KeyRound, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, isAuthenticated, setAuth } = useStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'progress' | 'settings'>('progress');
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsForm, setSettingsForm] = useState({ username: '', email: '', university: '', country: '' });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && (!isAuthenticated || !user)) router.push('/login'); }, [mounted, isAuthenticated, user, router]);

  useEffect(() => {
    if (!mounted || !isAuthenticated || !user) return;
    setLoading(true);
    Promise.all([api.getMySubmissions(100), api.getChallenges()]).then(([subs, chals]) => {
      setMySubmissions(subs); setChallenges(chals);
    }).catch(() => {}).finally(() => setLoading(false));
    if (user) setSettingsForm({ username: user.username || '', email: user.email || '', university: (user as any).college || '', country: (user as any).country || '' });
  }, [mounted, isAuthenticated, user]);

  const solvedChallenges = challenges.filter((c: any) => mySubmissions.some((s: any) => s.challenge_id === c.id && s.is_correct));
  const solvedCount = solvedChallenges.length;
  const totalBlood = mySubmissions.filter((s: any) => s.is_correct && s.is_first_blood).length;

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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded bg-aurora-cyan/20 border border-aurora-cyan/10">
                  <div className="text-aurora-cyan font-display text-lg font-bold">{user.score}</div>
                  <div className="text-txt-muted text-[10px] font-mono">Points</div>
                </div>
                <div className="p-3 rounded bg-signal-amber/5 border border-signal-amber/10">
                  <div className="text-signal-amber font-display text-lg font-bold">#{user.ranking}</div>
                  <div className="text-txt-muted text-[10px] font-mono">Rank</div>
                </div>
                <div className="p-3 rounded bg-aurora-emerald/5 border border-aurora-emerald/10">
                  <div className="text-aurora-emerald font-display text-lg font-bold">{solvedCount}</div>
                  <div className="text-txt-muted text-[10px] font-mono">Solved</div>
                </div>
                <div className="p-3 rounded bg-aurora-violet/20 border border-aurora-violet/10">
                  <div className="text-aurora-violet font-display text-lg font-bold">{totalBlood}</div>
                  <div className="text-txt-muted text-[10px] font-mono">Blood</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-surface rounded-lg p-0.5 border border-border-c w-fit">
            <button onClick={() => setActiveTab('progress')} className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs sm:text-sm font-medium transition-all ${activeTab === 'progress' ? 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30' : 'text-txt-muted hover:text-txt-secondary'}`}>
              <BookOpen className="w-4 h-4" /> Progress
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs sm:text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30' : 'text-txt-muted hover:text-txt-secondary'}`}>
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'progress' ? (
              <motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="bg-surface border border-border-c rounded-lg p-5 sm:p-6">
                  <h2 className="font-display font-bold text-txt-primary text-lg mb-4 flex items-center gap-2"><Swords className="w-5 h-5 text-aurora-cyan" /> My Challenge Progress</h2>
                  {challenges.length > 0 && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-txt-secondary text-xs">Overall Progress</span>
                        <span className="text-aurora-cyan font-display text-sm font-bold">{Math.round((solvedCount / challenges.length) * 100)}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-surface-raised overflow-hidden border border-border-c">
                        <div className="h-full rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-emerald transition-all duration-500" style={{ width: `${(solvedCount / challenges.length) * 100}%` }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-aurora-emerald text-[10px] font-mono">{solvedCount} solved</span>
                        <span className="text-txt-muted text-[10px] font-mono">{challenges.length - solvedCount} remaining</span>
                      </div>
                    </div>
                  )}
                  {loading ? (
                    <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-10 bg-surface-raised rounded animate-pulse" />)}</div>
                  ) : challenges.length === 0 ? (
                    <div className="text-center py-8 text-txt-secondary text-sm">No challenges available</div>
                  ) : (
                    <div className="space-y-2">
                      {challenges.map((c: any) => {
                        const solved = mySubmissions.some((s: any) => s.challenge_id === c.id && s.is_correct);
                        return (
                          <div key={c.id} className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${solved ? 'bg-aurora-emerald/5 border-success/20' : 'bg-surface-raised border-border-c/30'}`}>
                            <div className="flex items-center gap-3 min-w-0">
                              {solved ? <CheckCircle className="w-4 h-4 text-aurora-emerald flex-shrink-0" /> : <Circle className="w-4 h-4 text-txt-muted flex-shrink-0" />}
                              <div className="min-w-0">
                                <span className={`text-sm truncate block ${solved ? 'text-txt-primary' : 'text-txt-secondary'}`}>{c.title}</span>
                                <span className="text-[10px] font-mono text-txt-muted">{c.category} · {c.difficulty}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {c.blood_points > 0 && solved && <Droplet className="w-3 h-3 text-aurora-violet" />}
                              <span className={`font-display text-xs ${solved ? 'text-aurora-emerald' : 'text-txt-muted'}`}>{c.points}pts</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
