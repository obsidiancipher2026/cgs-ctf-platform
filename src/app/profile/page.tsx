'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Shield, Trophy, Calendar, Loader2, BookOpen, Settings,
  CheckCircle, Circle, Swords, Droplet, Lock,
  Save, Eye, EyeOff, KeyRound, RefreshCw,
} from 'lucide-react';
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

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    username: '', email: '', university: '', country: '',
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || !user)) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, user, router]);

  useEffect(() => {
    if (!mounted || !isAuthenticated || !user) return;
    setLoading(true);
    Promise.all([
      api.getMySubmissions(100),
      api.getChallenges(),
    ]).then(([subs, chals]) => {
      setMySubmissions(subs);
      setChallenges(chals);
    }).catch(() => {}).finally(() => setLoading(false));

    if (user) {
      setSettingsForm({
        username: user.username || '',
        email: user.email || '',
        university: (user as any).college || '',
        country: (user as any).country || '',
      });
    }
  }, [mounted, isAuthenticated, user]);

  const solvedChallenges = challenges.filter((c: any) =>
    mySubmissions.some((s: any) => s.challenge_id === c.id && s.is_correct)
  );
  const solvedCount = solvedChallenges.length;
  const totalBlood = mySubmissions.filter((s: any) => s.is_correct && s.is_first_blood).length;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      const data = await api.updateProfile({
        username: settingsForm.username,
        email: settingsForm.email,
        college: settingsForm.university,
        country: settingsForm.country,
      });
      if (data.user) {
        setAuth(data.user);
      }
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.changeOwnPassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      });
      toast.success('Password change request submitted! Waiting for admin approval.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyber-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Header */}
          <div className="cyber-card rounded-2xl p-5 sm:p-8 border-cyber-blue/20 mb-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-cyber text-xl sm:text-2xl text-white truncate">{user.username}</h1>
                <span className="text-gray-400 font-mono text-xs">[{user.role}]</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-cyber-blue/5 border border-cyber-blue/10">
                <div className="text-cyber-blue font-cyber text-lg">{user.score}</div>
                <div className="text-gray-500 font-mono text-[10px]">Points</div>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                <div className="text-yellow-400 font-cyber text-lg">#{user.ranking}</div>
                <div className="text-gray-500 font-mono text-[10px]">Rank</div>
              </div>
              <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                <div className="text-green-400 font-cyber text-lg">{solvedCount}</div>
                <div className="text-gray-500 font-mono text-[10px]">Solved</div>
              </div>
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                <div className="text-red-400 font-cyber text-lg">{totalBlood}</div>
                <div className="text-gray-500 font-mono text-[10px]">Blood</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-900/50 rounded-xl p-0.5 border border-gray-800/50 w-fit">
            <button onClick={() => setActiveTab('progress')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-xs sm:text-sm transition-all ${activeTab === 'progress' ? 'bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30' : 'text-gray-500 hover:text-gray-300'}`}>
              <BookOpen className="w-4 h-4" /> Progress
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-xs sm:text-sm transition-all ${activeTab === 'settings' ? 'bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30' : 'text-gray-500 hover:text-gray-300'}`}>
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'progress' ? (
              <motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="cyber-card rounded-2xl p-5 sm:p-6 border-cyber-blue/20">
                  <h2 className="font-cyber text-white text-lg mb-4 flex items-center gap-2">
                    <Swords className="w-5 h-5 text-cyber-blue" /> My Challenge Progress
                  </h2>
                  {challenges.length > 0 && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-gray-400 font-mono text-xs">Overall Progress</span>
                        <span className="text-cyber-blue font-cyber text-sm font-bold">{Math.round((solvedCount / challenges.length) * 100)}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-800/50 overflow-hidden border border-cyber-blue/20">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyber-blue to-cyber-green transition-all duration-500"
                          style={{ width: `${(solvedCount / challenges.length) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-cyber-green font-mono text-[10px]">{solvedCount} solved</span>
                        <span className="text-gray-500 font-mono text-[10px]">{challenges.length - solvedCount} remaining</span>
                      </div>
                    </div>
                  )}
                  {loading ? (
                    <div className="space-y-2">
                      {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-800/50 rounded animate-pulse" />)}
                    </div>
                  ) : challenges.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 font-mono text-sm">No challenges available</div>
                  ) : (
                    <div className="space-y-2">
                      {challenges.map((c: any) => {
                        const solved = mySubmissions.some((s: any) => s.challenge_id === c.id && s.is_correct);
                        return (
                          <div key={c.id} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${solved ? 'bg-green-500/5 border-green-500/20' : 'bg-gray-900/40 border-gray-800/30'}`}>
                            <div className="flex items-center gap-3 min-w-0">
                              {solved ? <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0" /> : <Circle className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                              <div className="min-w-0">
                                <span className={`font-mono text-sm truncate block ${solved ? 'text-white' : 'text-gray-400'}`}>{c.title}</span>
                                <span className="text-[10px] font-mono text-gray-500">{c.category} · {c.difficulty}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {c.blood_points > 0 && solved && <Droplet className="w-3 h-3 text-red-400" />}
                              <span className={`font-cyber text-xs ${solved ? 'text-cyber-green' : 'text-gray-500'}`}>{c.points}pts</span>
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
                {/* Profile Settings Form */}
                <div className="cyber-card rounded-2xl p-5 sm:p-6 border-cyber-blue/20">
                  <h2 className="font-cyber text-white text-lg mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-cyber-blue" /> Profile Settings
                  </h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 font-mono text-xs mb-2">Username</label>
                        <input type="text" value={settingsForm.username} onChange={(e) => setSettingsForm({ ...settingsForm, username: e.target.value })} className="cyber-input w-full px-4 py-3 rounded-lg font-mono text-sm" required minLength={3} />
                      </div>
                      <div>
                        <label className="block text-gray-400 font-mono text-xs mb-2">Email</label>
                        <input type="email" value={settingsForm.email} onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })} className="cyber-input w-full px-4 py-3 rounded-lg font-mono text-sm" required />
                      </div>
                      <div>
                        <label className="block text-gray-400 font-mono text-xs mb-2">Country</label>
                        <input type="text" value={settingsForm.country} onChange={(e) => setSettingsForm({ ...settingsForm, country: e.target.value })} className="cyber-input w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="e.g. United States" />
                      </div>
                      <div>
                        <label className="block text-gray-400 font-mono text-xs mb-2">College / University</label>
                        <input type="text" value={settingsForm.university} onChange={(e) => setSettingsForm({ ...settingsForm, university: e.target.value })} className="cyber-input w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="e.g. MIT" />
                      </div>
                    </div>
                    <button type="submit" disabled={settingsLoading} className="px-6 py-3 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue font-mono text-sm hover:bg-cyber-blue/20 transition-all flex items-center gap-2 disabled:opacity-50">
                      {settingsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {settingsLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>

                {/* Password Change Form */}
                <div className="cyber-card rounded-2xl p-5 sm:p-6 border-yellow-500/20">
                  <h2 className="font-cyber text-white text-lg mb-4 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-yellow-400" /> Change Password
                  </h2>
                  <p className="text-gray-500 font-mono text-xs mb-4">Password changes require admin approval.</p>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-gray-400 font-mono text-xs mb-2">Current Password</label>
                      <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="cyber-input w-full px-4 py-3 rounded-lg font-mono text-sm" required />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-mono text-xs mb-2">New Password</label>
                      <div className="relative">
                        <input type={showNewPassword ? 'text' : 'password'} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="cyber-input w-full px-4 py-3 rounded-lg font-mono text-sm pr-12" required minLength={6} />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyber-blue">
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 font-mono text-xs mb-2">Confirm New Password</label>
                        <input type={showNewPassword ? 'text' : 'password'} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="cyber-input w-full px-4 py-3 rounded-lg font-mono text-sm" required minLength={6} />
                    </div>
                    <button type="submit" disabled={passwordLoading} className="px-6 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono text-sm hover:bg-yellow-500/20 transition-all flex items-center gap-2 disabled:opacity-50">
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
