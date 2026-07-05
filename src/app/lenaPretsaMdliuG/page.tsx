'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Activity, LogOut,
  BarChart3, Ban, CheckCircle, Trash2,
  Settings, Bell, RefreshCw,
  Loader2, Menu, X,
  Swords, Flag, Plus, Eye, EyeOff, KeyRound,
  Upload, Pencil, Radio, Lock, ShieldOff, Droplet,
  Search, FileText, AlertTriangle, Flame,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

type AdminTab =
  | 'dashboard' | 'users' | 'challenges'
  | 'submissions' | 'announcements' | 'logs' | 'warmup' | 'security' | 'realflags' | 'settings' | 'live';

const tabs: { id: AdminTab; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'challenges', label: 'Challenges', icon: Swords },
  { id: 'submissions', label: 'Submissions', icon: Flag },
  { id: 'announcements', label: 'Announcements', icon: Bell },
  { id: 'logs', label: 'Logs', icon: Activity },
  { id: 'warmup', label: 'Warmup', icon: Flame },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'realflags', label: 'Secret Flags', icon: Lock },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'live', label: 'Live Control', icon: Radio },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginForm, setLoginForm] = useState({ password: '', accessKey: '' });
  const [tabLoading, setTabLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const router = useRouter();
  const { user } = useStore();

  const [dashboard, setDashboard] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  const [editAnnouncementTitle, setEditAnnouncementTitle] = useState('');
  const [editAnnouncementMsg, setEditAnnouncementMsg] = useState('');
  const [newChallenge, setNewChallenge] = useState({
    title: '', description: '', category: 'web', difficulty: 'easy',
    points: 100, flagMode: 'dynamic_user', flag: '', hint: '', maxAttempts: 8, bloodPoints: 25, challengeType: 'asset',
  });

  const bloodByDiff: Record<string, number> = { easy: 25, medium: 50, hard: 75, expert: 100 };
  const [credForm, setCredForm] = useState({ current_username: '', current_password: '', new_username: '', new_password: '' });
  const [passwordModal, setPasswordModal] = useState<{ userId: number; username: string } | null>(null);
  const [passwordModalValue, setPasswordModalValue] = useState('');
  const [passwordModalLoading, setPasswordModalLoading] = useState(false);
  const [usernameModal, setUsernameModal] = useState<{ userId: number; username: string } | null>(null);
  const [usernameModalValue, setUsernameModalValue] = useState('');
  const [usernameModalLoading, setUsernameModalLoading] = useState(false);
  const [securityStatsData, setSecurityStatsData] = useState<any>(null);
  const [securityLogsData, setSecurityLogsData] = useState<any[]>([]);
  const [securitySettingsData, setSecuritySettingsData] = useState<any>(null);
  const [realFlags, setRealFlags] = useState<any[]>([]);
  const [warmupChallenges, setWarmupChallenges] = useState<any[]>([]);
  const [realFlagForm, setRealFlagForm] = useState({ challenge_name: '', flag: '', category: '', notes: '' });
  const [editRealFlag, setEditRealFlag] = useState<any>(null);
  const [editRealFlagForm, setEditRealFlagForm] = useState({ challenge_name: '', flag: '', category: '', notes: '' });
  const [securityBlockIp, setSecurityBlockIp] = useState('');
  const [securityFilterSeverity, setSecurityFilterSeverity] = useState('');
  const [securityFilterType, setSecurityFilterType] = useState('');
  const [securityFeatures, setSecurityFeatures] = useState<Record<string, boolean>>({});
  const [featureToggling, setFeatureToggling] = useState<string | null>(null);
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);
  const [liveChallenges, setLiveChallenges] = useState<any[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const [editingChallenge, setEditingChallenge] = useState<any | null>(null);
  const [editChallengeForm, setEditChallengeForm] = useState({
    title: '', description: '', category: 'web', difficulty: 'easy',
    points: 100, flagMode: 'dynamic_user', flag: '', hint: '', maxAttempts: 0, bloodPoints: 0, challengeType: 'asset',
  });
  const [editChallengeLoading, setEditChallengeLoading] = useState(false);

  const tryAutoLogin = async () => {
    try {
      const me = await api.getMe();
      if (me.role === 'admin') {
        setAuthenticated(true);
        setAuthChecking(false);
        try {
          const csrfData = await api.getCsrfToken();
          useStore.getState().setCsrfToken(csrfData.csrf_token);
        } catch { console.warn('[Admin] Failed to fetch CSRF token — admin actions may fail'); }
        loadTabData('dashboard');
        return;
      }
    } catch { /* not authed, show login */ }
    setAuthChecking(false);
  };

  const connectAdminWs = async () => {
    try {
      const token = document.cookie.split('; ').find(r => r.startsWith('access_token='))?.split('=')[1];
      if (!token) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/admin/audit?token=${token}`;
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => setWsConnected(true);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'attack_alert') {
            setLiveAlerts(prev => [{ ...data, id: Date.now() }, ...prev].slice(0, 20));
            toast.error(`🚨 ${data.attack_type} blocked from ${data.ip}`, { duration: 4000 });
          }
        } catch {}
      };
      ws.onclose = () => { setWsConnected(false); wsRef.current = null; };
      ws.onerror = () => { setWsConnected(false); };
      wsRef.current = ws;
    } catch {}
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.role === 'admin') { tryAutoLogin(); return; }
      } catch {}
    }
    setAuthChecking(false);
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    if (mq.matches) setSidebarVisible(false);
    const handler = (e: MediaQueryListEvent) => setSidebarVisible(!e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthChecking(true);
    localStorage.removeItem('user');
    localStorage.removeItem('csrf_token');
    try {
      const data = await api.adminLogin(loginForm.password, loginForm.accessKey);
      useStore.getState().setAuth(data.user);
      setAuthenticated(true);
      setAuthChecking(false);
      const csrfData = await api.getCsrfToken();
      useStore.getState().setCsrfToken(csrfData.csrf_token);
      toast.success('Welcome, GuildMaster!');
      loadTabData('dashboard');
      connectAdminWs();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Connection failed — is the backend running?';
      if (msg.includes('WAF') || msg.includes('blocked') || err?.response?.headers?.['x-waf-blocked']) {
        toast.error(`🚫 WAF blocked request. Try again in 30s. Reason: ${msg}`);
      } else if (err?.response?.status === 429) {
        toast.error(`⏳ Rate limited: ${msg}`);
      } else {
        toast.error(msg);
      }
      setAuthChecking(false);
    }
  };

  const loadTabData = async (tab: AdminTab) => {
    try {
      switch (tab) {
        case 'dashboard':
          if (!dashboard) setDashboard(await api.getAdminDashboard());
          break;
        case 'users': setUsers(await api.getAdminUsers()); break;
        case 'challenges': setChallenges(await api.getAdminChallenges()); break;
        case 'submissions': setSubmissions(await api.getAdminSubmissions()); break;
        case 'announcements': setAnnouncementsList(await api.getAdminAnnouncements()); break;
        case 'logs': setLogs(await api.getAdminLogs()); break;
        case 'security':
          setSecurityStatsData(await api.getSecurityStats());
          const logsResp = await api.getSecurityLogs();
          setSecurityLogsData(logsResp.entries || []);
          setSecuritySettingsData(await api.getSecuritySettings());
          setSecurityFeatures(await api.getSecurityFeatures());
          break;
        case 'realflags':
          setRealFlags(await api.getRealFlags());
          break;
        case 'warmup': {
          const all = await api.getAdminChallenges();
          setWarmupChallenges(all.filter((c: any) =>
            c.category?.toLowerCase() === 'web' && ['easy', 'medium', 'hard'].includes(c.difficulty?.toLowerCase())
          ));
          break;
        }
        case 'live':
          setLiveChallenges(await api.getAdminChallenges());
          break;
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || '';
      if (detail.includes('WAF') || detail.includes('blocked') || err?.response?.headers?.['x-waf-blocked']) {
        toast.error('Request blocked by WAF. Please refresh and login again.');
        if (detail.includes('quarantine')) {
          setTimeout(() => { setAuthenticated(false); }, 3000);
        }
      } else if (err?.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        setAuthenticated(false);
      } else if (err?.response?.status === 403) {
        toast.error(`Access denied: ${detail || 'Forbidden'}`);
      } else if (err?.response?.status === 429) {
        toast.error(`Rate limited: ${detail || 'Too many requests'}`);
      } else {
        toast.error(`Failed to load ${tab} data`);
      }
    }
  };

  const handleTabChange = async (tab: AdminTab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) setSidebarVisible(false);
    setTabLoading(true);
    await loadTabData(tab);
    setTabLoading(false);
  };

  const handleBan = async (userId: number) => {
    try { await api.banUser(userId); toast.success('User banned'); loadTabData('users'); }
    catch { toast.error('Failed to ban user'); }
  };

  const handleUnban = async (userId: number) => {
    try { await api.unbanUser(userId); toast.success('User unbanned'); loadTabData('users'); }
    catch { toast.error('Failed to unban'); }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    useStore.getState().logout();
    router.push('/');
  };

  const handleAdminChangePassword = async () => {
    if (!passwordModal || !passwordModalValue || passwordModalValue.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPasswordModalLoading(true);
    try {
      await api.adminChangeUserPassword(passwordModal.userId, passwordModalValue);
      toast.success(`Password changed for ${passwordModal.username}`);
      setPasswordModal(null);
      setPasswordModalValue('');
      loadTabData('users');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to change password');
    } finally {
      setPasswordModalLoading(false);
    }
  };

  const handleAdminChangeUsername = async () => {
    if (!usernameModal || !usernameModalValue || usernameModalValue.trim().length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    setUsernameModalLoading(true);
    try {
      await api.adminChangeUsername(usernameModal.userId, usernameModalValue.trim());
      toast.success(`Username changed for ${usernameModal.username}`);
      setUsernameModal(null);
      setUsernameModalValue('');
      loadTabData('users');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to change username');
    } finally {
      setUsernameModalLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Permanently delete user "${username}" (ID: ${userId})? This cannot be undone.`)) return;
    try { await api.deleteUser(userId); toast.success(`User "${username}" deleted`); loadTabData('users'); }
    catch { toast.error('Failed to delete user'); }
  };

  const handleResetScore = async (userId: number, username: string) => {
    if (!confirm(`Reset score for "${username}" to 0?`)) return;
    try { await api.resetUserScore(userId); toast.success(`Score reset for "${username}"`); loadTabData('users'); }
    catch { toast.error('Failed to reset score'); }
  };

  const handleResetUserSolves = async (userId: number, username: string) => {
    if (!confirm(`Reset all solves for "${username}"? This will also reset their score.`)) return;
    try { await api.adminResetUserSolves(userId); toast.success(`Solves reset for "${username}"`); loadTabData('users'); }
    catch { toast.error('Failed to reset user solves'); }
  };

  const handleResetBlood = async (userId: number, username: string) => {
    if (!confirm(`Reset blood points for "${username}" to 0?`)) return;
    try { await api.adminResetUserBlood(userId); toast.success(`Blood points reset for "${username}"`); loadTabData('users'); }
    catch { toast.error('Failed to reset blood points'); }
  };

  const handleResetChallengeSolves = async (challengeId: number, title: string) => {
    if (!confirm(`Reset all solves for challenge "${title}"? Solver scores will be recalculated.`)) return;
    try { await api.adminResetChallengeSolves(challengeId); toast.success(`Solves reset for "${title}"`); loadTabData('challenges'); }
    catch { toast.error('Failed to reset challenge solves'); }
  };

  const handleAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.createAnnouncement(announcementTitle, announcementMsg); toast.success('Announcement sent!'); setAnnouncementTitle(''); setAnnouncementMsg(''); loadTabData('announcements'); }
    catch { toast.error('Failed'); }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm('Delete this announcement?')) return;
    try { await api.adminDeleteAnnouncement(id); toast.success('Announcement deleted'); loadTabData('announcements'); }
    catch { toast.error('Failed to delete'); }
  };

  const handleSaveEditAnnouncement = async () => {
    if (!editingAnnouncement) return;
    try {
      await api.adminUpdateAnnouncement(editingAnnouncement.id, editAnnouncementTitle, editAnnouncementMsg);
      toast.success('Announcement updated');
      setEditingAnnouncement(null);
      loadTabData('announcements');
    } catch { toast.error('Failed to update'); }
  };

  const handleReset = async () => {
    if (!confirm('Reset entire competition? This is irreversible!')) return;
    try { await api.resetCompetition(); toast.success('Competition reset'); loadTabData('dashboard'); }
    catch { toast.error('Failed to reset'); }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminCreateChallenge(newChallenge);
      toast.success('Challenge created!');
      setNewChallenge({ title: '', description: '', category: 'web', difficulty: 'easy', points: 100, flagMode: 'dynamic_user', flag: '', hint: '', maxAttempts: 8, bloodPoints: 25, challengeType: 'asset' });
      loadTabData('challenges');
    } catch (err: any) { toast.error(err?.response?.data?.detail || 'Failed to create'); }
  };

  const handleDeleteChallenge = async (id: number) => {
    if (!confirm('Delete this challenge? This will also remove all submissions.')) return;
    try { await api.adminDeleteChallenge(id); toast.success('Challenge deleted'); loadTabData('challenges'); }
    catch { toast.error('Failed to delete'); }
  };

  const handleTogglePublish = async (id: number) => {
    try { await api.adminTogglePublishChallenge(id); toast.success('Toggled publish status'); loadTabData('challenges'); }
    catch (err: any) { toast.error(err?.response?.data?.detail || 'Failed to toggle publish status'); }
  };

  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const handleUploadAsset = async (challengeId: number, file: File) => {
    setUploadingId(challengeId);
    try {
      const data = await api.adminUploadChallengeAsset(challengeId, file);
      toast.success('Asset uploaded!');
      loadTabData('challenges');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  const handleFileSelect = (challengeId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUploadAsset(challengeId, file);
    e.target.value = '';
  };

  const handleEditChallenge = (c: any) => {
    setEditingChallenge(c);
    const diff = c.difficulty || 'easy';
    setEditChallengeForm({
      title: c.title || '',
      description: c.description || '',
      category: c.category || 'web',
      difficulty: diff,
      points: c.points || 100,
      flagMode: c.flagMode || 'dynamic_user',
      flag: c.flag || '',
      hint: c.hint || '',
      maxAttempts: c.maxAttempts ?? 8,
      bloodPoints: c.bloodPoints || bloodByDiff[diff] || 50,
      challengeType: c.challengeType || 'asset',
    });
  };

  const handleUpdateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChallenge) return;
    setEditChallengeLoading(true);
    try {
      await api.adminUpdateChallenge(editingChallenge.id, editChallengeForm);
      toast.success('Challenge updated!');
      setEditingChallenge(null);
      loadTabData('challenges');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update challenge');
    } finally {
      setEditChallengeLoading(false);
    }
  };

  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credForm.current_username || !credForm.current_password) {
      toast.error('Current username and password required');
      return;
    }
    try {
      const data = await api.changeAdminCredentials(
        credForm.current_username,
        credForm.current_password,
        credForm.new_username || undefined,
        credForm.new_password || undefined
      );
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.username = data.username;
      localStorage.setItem('user', JSON.stringify(storedUser));
      useStore.getState().setAuth(storedUser);
      toast.success(`Credentials updated! Username: ${data.username}`);
      if (credForm.new_password) {
        toast('Re-login with new credentials', { icon: '⚠️' });
      }
      setCredForm({ current_username: '', current_password: '', new_username: '', new_password: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update credentials');
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--void)]">
        <Loader2 className="w-8 h-8 text-[var(--blue-core)] animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex bg-[var(--void)]">
        <div className="hidden lg:flex lg:w-[45%] relative flex-col items-center justify-center p-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface)] via-[var(--void)] to-[var(--surface-2)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-[var(--red-core)] to-transparent opacity-40" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-[var(--blue-core)] to-transparent opacity-40" />
          <div className="relative z-10 text-center max-w-sm">
            <img src="/images/logo.png" alt="CGS" className="w-20 h-20 mx-auto mb-6 object-contain" />
            <h2 className="font-display text-3xl font-bold text-txt-primary mb-3 tracking-tight">CGS CTF Platform</h2>
            <p className="text-txt-muted font-mono text-sm mb-8 leading-relaxed">Command & Control Center — Restricted Access</p>
            <div className="space-y-3 text-left">
              {[
                { icon: Shield, text: 'Real-time threat monitoring & WAF' },
                { icon: Users, text: 'User management & access control' },
                { icon: Swords, text: 'Challenge lifecycle management' },
                { icon: Radio, text: 'Live competition control' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                  <item.icon className="w-4 h-4 text-[var(--blue-core)] flex-shrink-0" />
                  <span className="text-txt-secondary font-mono text-xs">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[55%] flex items-center justify-center px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <img src="/images/logo.png" alt="CGS" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="font-display text-lg font-bold text-txt-primary">CGS CTF Platform</h1>
                <p className="text-txt-muted font-mono text-xs">Command & Control Center</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-[var(--red-core)]" />
                <h1 className="font-display text-xl font-bold text-txt-primary">Admin Access</h1>
              </div>
              <p className="text-txt-muted font-mono text-sm">Authenticate to access the control center</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-txt-secondary font-mono text-xs mb-2 uppercase tracking-wider">Secret Key</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
                  <input
                    type="password"
                    value={loginForm.accessKey}
                    onChange={(e) => setLoginForm({ ...loginForm, accessKey: e.target.value })}
                    className="input-field w-full pl-10 pr-4 py-3 rounded-lg font-mono text-sm"
                    placeholder="Enter secret key"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-txt-secondary font-mono text-xs mb-2 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="input-field w-full pl-10 pr-4 py-3 rounded-lg font-mono text-sm"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={authChecking}
                className="w-full py-3 rounded-lg bg-[var(--red-core)] text-white font-display font-semibold text-sm uppercase tracking-widest hover:bg-[var(--red-glow)] hover:shadow-[0_0_20px_rgba(224,32,32,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {authChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {authChecking ? 'Authenticating...' : 'Authenticate'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[var(--border)]">
              <button onClick={() => router.push('/login')} className="w-full py-2.5 rounded-lg bg-transparent border border-[var(--blue-core)] text-[var(--blue-core)] font-display font-semibold text-sm uppercase tracking-wider hover:bg-[rgba(26,110,255,0.1)] transition-all flex items-center justify-center gap-2">
                Back to User Login
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (<div className="bg-[var(--void)] min-h-screen">
    <div className="py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            className="relative p-2 text-txt-secondary hover:text-[var(--blue-core)] transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(26,110,255,0.5)] rounded-lg group"
            onClick={() => setSidebarVisible(prev => !prev)}
            title={sidebarVisible ? 'Close sidebar' : 'Open sidebar'}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <span className={`absolute transition-all duration-300 ease-in-out ${sidebarVisible ? 'rotate-45 opacity-0 scale-75' : 'rotate-0 opacity-100 scale-100'}`}>
                <Menu className="w-5 h-5" />
              </span>
              <span className={`absolute transition-all duration-300 ease-in-out ${sidebarVisible ? 'rotate-0 opacity-100 scale-100' : '-rotate-45 opacity-0 scale-75'}`}>
                <X className="w-5 h-5" />
              </span>
            </div>
          </button>

          <img src="/images/logo.png" alt="CGS" className="w-7 h-7 flex-shrink-0 object-contain" />
          <h1 className="font-display font-bold text-xl sm:text-2xl text-txt-primary flex-1 min-w-0 truncate">
            Command & Control Center
          </h1>
          <button onClick={handleLogout} className="p-2 text-txt-secondary hover:text-[var(--red-core)] transition-colors rounded-lg hover:bg-[rgba(224,32,32,0.05)]" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4 lg:gap-6 relative">
          {/* Mobile overlay */}
          <AnimatePresence>
            {sidebarVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                onClick={() => setSidebarVisible(false)}
              />
            )}
          </AnimatePresence>

          {/* Sidebar nav - Desktop: flex with width transition, Mobile: drawer from left */}
          <nav
            className={`
              ${sidebarVisible ? 'lg:w-48' : 'lg:w-0 lg:overflow-hidden'}
              lg:relative lg:flex-shrink-0 lg:transition-[width] lg:duration-300 lg:ease-in-out
              lg:bg-transparent lg:border-0
              fixed lg:static inset-y-0 left-0 z-50
              bg-[var(--surface)] border-r border-[rgba(26,110,255,0.1)]
              overflow-y-auto overflow-x-hidden
              transition-all duration-300 ease-in-out
              ${sidebarVisible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              ${sidebarVisible ? 'shadow-[2px_0_20px_rgba(26,110,255,0.08)]' : ''}
            `}
          >
            <div className={`w-48 lg:w-full flex flex-col gap-1 p-3 pt-3 ${sidebarVisible ? '' : 'lg:hidden'}`}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { handleTabChange(tab.id); if (window.innerWidth < 1024) setSidebarVisible(false); }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm transition-all duration-200 text-left whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-[rgba(26,110,255,0.1)] text-[var(--blue-core)] border border-[rgba(26,110,255,0.2)] shadow-[0_0_15px_rgba(26,110,255,0.1)]'
                        : 'text-txt-secondary hover:text-txt-primary hover:bg-[rgba(26,110,255,0.05)] border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Main content - smooth layout reflow via flex */}
          <div className="flex-1 min-w-0 transition-all duration-300">
            {tabLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[var(--blue-core)] animate-spin" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === 'dashboard' && (
                    <div>
                      {dashboard && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                          {[
                            { label: 'Users', value: dashboard.total_users, icon: Users, color: 'var(--blue-core)' },
                            { label: 'Challenges', value: dashboard.total_challenges || 0, icon: Swords, color: '#A03CFF' },
                            { label: 'Suspicious Logs', value: dashboard.suspicious_logs, icon: Activity, color: 'var(--red-glow)' },
                          ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                              <div key={i} className="card rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: item.color }} />
                                  <span className="text-txt-secondary font-mono text-xs">{item.label}</span>
                                </div>
                                <span className="font-display text-xl sm:text-2xl text-txt-primary">{item.value}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="card rounded-xl p-6 border border-[rgba(224,32,32,0.2)]">
                        <div className="flex items-center gap-2 mb-5">
                          <AlertTriangle className="w-5 h-5 text-[var(--red-core)]" />
                          <h3 className="font-display text-txt-primary text-lg">Danger Zone</h3>
                        </div>

                        {/* Destructive Actions */}
                        <div className="mb-5">
                          <h4 className="font-display text-txt-secondary text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                            <RefreshCw className="w-3 h-3" /> Competition Actions
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button onClick={handleReset} className="px-4 py-3 rounded-lg bg-[rgba(224,32,32,0.1)] border border-[rgba(224,32,32,0.3)] text-[var(--red-core)] font-mono text-xs hover:bg-[rgba(224,32,32,0.2)] transition-all flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4" /> Reset Competition
                            </button>
                            <button onClick={async () => {
                              if (!confirm('Invalidate ALL sessions? All users will need to login again.')) return;
                              try { await api.invalidateAllSessions(); toast.success('All sessions invalidated'); }
                              catch { toast.error('Failed to invalidate sessions'); }
                            }} className="px-4 py-3 rounded-lg bg-[rgba(255,140,0,0.1)] border border-[rgba(255,140,0,0.3)] text-[#FF8C00] font-mono text-xs hover:bg-[rgba(255,140,0,0.2)] transition-all flex items-center justify-center gap-2">
                              <Lock className="w-4 h-4" /> Invalidate All Sessions
                            </button>
                          </div>
                        </div>

                        {/* Blood Points */}
                        <div className="mb-5">
                          <h4 className="font-display text-txt-secondary text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Droplet className="w-3 h-3" /> Blood Points
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button onClick={async () => {
                              if (!confirm('Reset ALL blood points across all challenges? This cannot be undone.')) return;
                              try { await api.resetAllBlood(); toast.success('All blood points reset'); loadTabData('dashboard'); }
                              catch { toast.error('Failed to reset blood points'); }
                            }} className="px-4 py-3 rounded-lg bg-[rgba(224,32,32,0.1)] border border-[rgba(224,32,32,0.3)] text-[var(--red-glow)] font-mono text-xs hover:bg-[rgba(224,32,32,0.2)] transition-all flex items-center justify-center gap-2">
                              <Droplet className="w-4 h-4" /> Reset All Blood Points
                            </button>
                            <button onClick={async () => {
                              if (!confirm('Auto-assign blood points to all challenges with 0 blood? (Easy=25, Medium=50, Hard=75, Expert=100)')) return;
                              try {
                                const t = await api.getCsrfToken(); useStore.getState().setCsrfToken(t.csrf_token);
                                const res = await fetch('/api/admin/challenges/backfill-blood', { method: 'POST', headers: { 'x-csrf-token': t.csrf_token } });
                                const data = await res.json();
                                toast.success(data.message || 'Blood points backfilled');
                                loadTabData('dashboard');
                              } catch { toast.error('Failed to backfill blood points'); }
                            }} className="px-4 py-3 rounded-lg bg-[rgba(0,214,143,0.1)] border border-[rgba(0,214,143,0.3)] text-[var(--success)] font-mono text-xs hover:bg-[rgba(0,214,143,0.2)] transition-all flex items-center justify-center gap-2">
                              <Droplet className="w-4 h-4" /> Backfill Blood Points
                            </button>
                          </div>
                        </div>

                        {/* Challenge Management */}
                        <div className="mb-5">
                          <h4 className="font-display text-txt-secondary text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Swords className="w-3 h-3" /> Challenge Cleanup
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            <button onClick={async () => {
                              const titles = prompt('Enter challenge titles to delete (comma-separated):\nExample: Command Injection Ping Utility, Hex Dump Analysis');
                              if (!titles) return;
                              const titleList = titles.split(',').map(t => t.trim()).filter(Boolean);
                              if (titleList.length === 0) return;
                              if (!confirm(`Delete ${titleList.length} challenge(s)? This will remove all associated submissions and cannot be undone.`)) return;
                              try {
                                const t = await api.getCsrfToken(); useStore.getState().setCsrfToken(t.csrf_token);
                                const res = await fetch('/api/admin/challenges/bulk-delete', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'x-csrf-token': t.csrf_token },
                                  body: JSON.stringify({ titles: titleList }),
                                });
                                const data = await res.json();
                                if (data.deleted?.length > 0) {
                                  toast.success(`Deleted: ${data.deleted.join(', ')}`);
                                } else {
                                  toast.error('No matching challenges found');
                                }
                                loadTabData('dashboard');
                              } catch { toast.error('Failed to delete challenges'); }
                            }} className="px-4 py-3 rounded-lg bg-[rgba(224,32,32,0.1)] border border-[rgba(224,32,32,0.3)] text-[var(--red-glow)] font-mono text-xs hover:bg-[rgba(224,32,32,0.2)] transition-all flex items-center justify-center gap-2">
                              <Trash2 className="w-4 h-4" /> Remove Challenges by Title
                            </button>
                          </div>
                        </div>

                        {/* Audit & Security */}
                        <div>
                          <h4 className="font-display text-txt-secondary text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Search className="w-3 h-3" /> Audit &amp; Security Checks
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={async () => {
                              try { const r = await api.auditScan(); toast.success(`Audit scan complete: ${r.anomalies?.length || 0} anomalies found`); } catch { toast.error('Audit scan failed'); }
                            }} className="px-4 py-2 rounded-lg bg-[rgba(26,110,255,0.1)] border border-[rgba(26,110,255,0.3)] text-[var(--blue-core)] font-mono text-xs hover:bg-[rgba(26,110,255,0.2)] transition-all flex items-center gap-1">
                              <Search className="w-3 h-3" /> Audit Scan
                            </button>
                            <button onClick={async () => {
                              try { const r = await api.collusionScan(); toast.success(`Collusion scan: ${r.flagged?.length || 0} suspicious groups`); } catch { toast.error('Collusion scan failed'); }
                            }} className="px-4 py-2 rounded-lg bg-[rgba(160,60,255,0.1)] border border-[rgba(160,60,255,0.3)] text-[#A03CFF] font-mono text-xs hover:bg-[rgba(160,60,255,0.2)] transition-all flex items-center gap-1">
                              <Users className="w-3 h-3" /> Collusion Scan
                            </button>
                            <button onClick={async () => {
                              try { const r = await api.qaRun(); toast.success(`QA check: ${r.checklist?.length || 0} items`); } catch { toast.error('QA mode not enabled'); }
                            }} className="px-4 py-2 rounded-lg bg-[rgba(0,214,143,0.1)] border border-[rgba(0,214,143,0.3)] text-[var(--success)] font-mono text-xs hover:bg-[rgba(0,214,143,0.2)] transition-all flex items-center gap-1">
                              <FileText className="w-3 h-3" /> QA Checklist
                            </button>
                            <button onClick={async () => {
                              try { const r = await api.qaChmod(); toast.success(`Chmod check: ${r.writable_dirs || 0} writable dirs`); } catch { toast.error('Chmod check failed'); }
                            }} className="px-4 py-2 rounded-lg bg-[rgba(255,184,0,0.1)] border border-[rgba(255,184,0,0.3)] text-[var(--warning)] font-mono text-xs hover:bg-[rgba(255,184,0,0.2)] transition-all flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Chmod Check
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'users' && (
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-txt-secondary font-mono text-xs">{users.length} registered users</span>
                      </div>
                      <div className="overflow-x-auto">
                      <table className="w-full text-left admin-table">
                        <thead>
                          <tr className="text-txt-secondary font-mono text-xs uppercase tracking-wider border-b border-[rgba(26,110,255,0.1)]">
                            <th className="p-3">Username</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Solves</th>
                            <th className="p-3">Score</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u: any) => (
                            <tr key={u.id} className="border-b border-[rgba(26,110,255,0.05)] hover:bg-[rgba(26,110,255,0.05)] transition-colors">
                              <td className="p-3 font-mono text-sm text-txt-primary flex items-center gap-2">
                                {u.avatar_url && (
                                  <img src={u.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                                )}
                                {u.username}
                              </td>
                              <td className="p-3 font-mono text-xs text-txt-secondary">{u.email}</td>
                              <td className="p-3 font-mono text-sm text-[var(--warning)]">{u.solves}</td>
                              <td className="p-3 font-mono text-sm text-[var(--success)]">{u.score}</td>
                              <td className="p-3">
                                {u.is_banned ? (
                                  <span className="text-xs font-mono text-[var(--red-core)]">Banned</span>
                                ) : u.status === 'active' ? (
                                  <span className="text-xs font-mono text-[var(--success)]">Active</span>
                                ) : (
                                  <span className="text-xs font-mono text-txt-muted">{u.status}</span>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {!u.is_banned ? (
                                    <button onClick={() => handleBan(u.id)} className="p-1.5 rounded-lg bg-[rgba(224,32,32,0.1)] text-[var(--red-core)] hover:bg-[rgba(224,32,32,0.2)] transition-all" title="Ban">
                                      <Ban className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <button onClick={() => handleUnban(u.id)} className="p-1.5 rounded-lg bg-[rgba(0,214,143,0.1)] text-[var(--success)] hover:bg-[rgba(0,214,143,0.2)] transition-all" title="Unban">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button onClick={() => { setUsernameModal({ userId: u.id, username: u.username }); setUsernameModalValue(''); }} className="p-1.5 rounded-lg bg-[rgba(26,110,255,0.1)] text-[var(--blue-glow)] hover:bg-[rgba(26,110,255,0.2)] transition-all" title="Edit Username">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => { setPasswordModal({ userId: u.id, username: u.username }); setPasswordModalValue(''); }} className="p-1.5 rounded-lg bg-[rgba(26,110,255,0.1)] text-[var(--blue-core)] hover:bg-[rgba(26,110,255,0.2)] transition-all" title="Change Password">
                                    <KeyRound className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleResetScore(u.id, u.username)} className="p-1.5 rounded-lg bg-[rgba(255,184,0,0.1)] text-[var(--warning)] hover:bg-[rgba(255,184,0,0.2)] transition-all" title="Reset Score">
                                    <RefreshCw className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleResetBlood(u.id, u.username)} className="p-1.5 rounded-lg bg-[rgba(224,32,32,0.1)] text-[var(--red-glow)] hover:bg-[rgba(224,32,32,0.2)] transition-all" title="Reset Blood Points">
                                    <Droplet className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleResetUserSolves(u.id, u.username)} className="p-1.5 rounded-lg bg-[rgba(160,60,255,0.1)] text-[#A03CFF] hover:bg-[rgba(160,60,255,0.2)] transition-all" title="Reset Solves">
                                    <Flag className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteUser(u.id, u.username)} className="p-1.5 rounded-lg bg-[rgba(224,32,32,0.1)] text-[var(--red-core)] hover:bg-[rgba(224,32,32,0.2)] transition-all" title="Delete">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    </div>
                  )}

                  {activeTab === 'challenges' && (
                    <div className="space-y-6">
                      {/* Create Challenge */}
                      <div className="card rounded-xl p-4 sm:p-6">
                        <h3 className="font-display text-txt-primary text-sm mb-4 flex items-center gap-2">
                          <Plus className="w-4 h-4 text-[var(--success)]" /> Create Challenge
                        </h3>
                        <form onSubmit={handleCreateChallenge} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="sm:col-span-2 lg:col-span-3">
                            <input type="text" value={newChallenge.title} onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })} placeholder="Title" className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
                          </div>
                          <div className="sm:col-span-2 lg:col-span-3">
                            <textarea value={newChallenge.description} onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })} placeholder="Description" rows={3} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
                          </div>
                          <select value={newChallenge.category} onChange={(e) => setNewChallenge({ ...newChallenge, category: e.target.value })} className="input-field px-4 py-2.5 rounded-lg font-mono text-sm">
                            <option value="web">Web</option>
                            <option value="crypto">Crypto</option>
                            <option value="reverse">Reverse</option>
                            <option value="forensics">Forensics</option>
                            <option value="osint">OSINT</option>
                            <option value="pwn">Pwn</option>
                            <option value="misc">Misc</option>
                          </select>
                          <select value={newChallenge.difficulty} onChange={(e) => { const d = e.target.value; setNewChallenge({ ...newChallenge, difficulty: d, bloodPoints: bloodByDiff[d] || 50 }); }} className="input-field px-4 py-2.5 rounded-lg font-mono text-sm">
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                            <option value="expert">Expert</option>
                          </select>
                          <select value={newChallenge.flagMode} onChange={(e) => setNewChallenge({ ...newChallenge, flagMode: e.target.value })} className="input-field px-4 py-2.5 rounded-lg font-mono text-sm">
                            <option value="dynamic_user">Dynamic (Per User)</option>
                            <option value="static">Static</option>
                            <option value="dynamic_team">Dynamic (Per Team)</option>
                          </select>
                          <select value={newChallenge.challengeType} onChange={(e) => setNewChallenge({ ...newChallenge, challengeType: e.target.value })} className="input-field px-4 py-2.5 rounded-lg font-mono text-sm">
                            <option value="asset">Asset (Downloadable)</option>
                            <option value="instance">Instance (In-Browser)</option>
                          </select>
                          <div>
                            <label className="block text-txt-muted font-mono text-[10px] mb-1 uppercase tracking-wider">Flag</label>
                            <input type="text" value={newChallenge.flag} onChange={(e) => setNewChallenge({ ...newChallenge, flag: e.target.value })} placeholder="Type challenge flag here" className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
                          </div>
                          <div>
                            <label className="block text-txt-muted font-mono text-[10px] mb-1 uppercase tracking-wider">Points</label>
                            <input type="number" value={newChallenge.points} onChange={(e) => setNewChallenge({ ...newChallenge, points: parseInt(e.target.value) || 0 })} placeholder="Score for solving" className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
                          </div>
                          <div>
                            <label className="block text-txt-muted font-mono text-[10px] mb-1 uppercase tracking-wider">Max Attempts</label>
                            <input type="number" value={newChallenge.maxAttempts} onChange={(e) => setNewChallenge({ ...newChallenge, maxAttempts: parseInt(e.target.value) || 8 })} placeholder="8 = default" className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
                          </div>
                          <div>
                            <label className="block text-txt-muted font-mono text-[10px] mb-1 uppercase tracking-wider">Blood Points</label>
                            <input type="number" value={newChallenge.bloodPoints} onChange={(e) => setNewChallenge({ ...newChallenge, bloodPoints: parseInt(e.target.value) || 0 })} placeholder="Bonus for first solver" className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
                          </div>
                          <div className="sm:col-span-2 lg:col-span-3">
                            <label className="block text-txt-muted font-mono text-[10px] mb-1 uppercase tracking-wider">Hint</label>
                            <textarea value={newChallenge.hint} onChange={(e) => setNewChallenge({ ...newChallenge, hint: e.target.value })} placeholder="Hint (optional)" rows={2} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
                          </div>
                          <button type="submit" className="sm:col-span-2 lg:col-span-3 px-6 py-3 rounded-xl bg-[rgba(0,214,143,0.1)] border border-[rgba(0,214,143,0.3)] text-[var(--success)] font-mono text-sm hover:bg-[rgba(0,214,143,0.2)] transition-all flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Create Challenge
                          </button>
                        </form>
                      </div>

                      {/* Challenge List */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left admin-table">
                          <thead>
                            <tr className="text-txt-secondary font-mono text-xs uppercase tracking-wider border-b border-[rgba(26,110,255,0.1)]">
                              <th className="p-3">ID</th>
                              <th className="p-3">Title</th>
                              <th className="p-3">Category</th>
                              <th className="p-3">Difficulty</th>
                              <th className="p-3">Points</th>
                              <th className="p-3">Flag Mode</th>
                              <th className="p-3">Blood</th>
                              <th className="p-3">Solves</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {challenges.map((c: any) => (
                              <tr key={c.id} className="border-b border-[rgba(26,110,255,0.05)] hover:bg-[rgba(26,110,255,0.05)] transition-colors">
                                <td className="p-3 font-mono text-xs text-txt-muted">{c.id}</td>
                                <td className="p-3 font-mono text-sm text-txt-primary">{c.title}</td>
                                <td className="p-3 font-mono text-xs text-[var(--blue-core)]">{c.category}</td>
                                <td className="p-3 font-mono text-xs">{c.difficulty}</td>
                                <td className="p-3 font-mono text-sm text-[var(--success)]">{c.points}</td>
                                <td className="p-3 font-mono text-xs text-[#A03CFF]">{c.flagMode}</td>
                                <td className="p-3 font-mono text-xs text-[var(--red-glow)]">{c.bloodPoints || 0}</td>
                                <td className="p-3 font-mono text-xs text-[var(--warning)]">{c.solverCount}</td>
                                <td className="p-3">
                                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${c.status === 'published' ? 'bg-[rgba(0,214,143,0.1)] text-[var(--success)]' : c.status === 'archived' ? 'bg-[rgba(224,32,32,0.1)] text-[var(--red-core)]' : 'bg-[rgba(122,156,192,0.1)] text-txt-secondary'}`}>
                                    {c.status === 'published' ? 'Published' : c.status === 'archived' ? 'Archived' : c.status === 'in_review' ? 'In Review' : 'Draft'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <button onClick={() => handleTogglePublish(c.id)} className="p-1.5 rounded-lg bg-[rgba(26,110,255,0.1)] text-[var(--blue-core)] hover:bg-[rgba(26,110,255,0.2)] transition-all" title={c.status === 'published' ? 'Unpublish' : 'Publish'}>
                                      {c.status === 'published' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                    <button onClick={() => handleEditChallenge(c)} className="p-1.5 rounded-lg bg-[rgba(255,184,0,0.1)] text-[var(--warning)] hover:bg-[rgba(255,184,0,0.2)] transition-all" title="Edit Challenge">
                                      <Settings className="w-3.5 h-3.5" />
                                    </button>
                                    <label className={`p-1.5 rounded-lg cursor-pointer transition-all ${uploadingId === c.id ? 'bg-[rgba(0,214,143,0.1)] text-[var(--success)] animate-pulse' : 'bg-[rgba(0,214,143,0.1)] text-[var(--success)] hover:bg-[rgba(0,214,143,0.2)]'}`} title="Upload Asset">
                                      <input type="file" className="hidden" onChange={(e) => handleFileSelect(c.id, e)} />
                                      {uploadingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                    </label>
                                    <button onClick={() => handleResetChallengeSolves(c.id, c.title)} className="p-1.5 rounded-lg bg-[rgba(160,60,255,0.1)] text-[#A03CFF] hover:bg-[rgba(160,60,255,0.2)] transition-all" title="Reset Solves">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDeleteChallenge(c.id)} className="p-1.5 rounded-lg bg-[rgba(224,32,32,0.3)] text-[var(--red-core)] hover:bg-[rgba(224,32,32,0.5)] transition-all" title="Delete Challenge">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'submissions' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg text-txt-primary flex items-center gap-2">
                          <Flag className="w-5 h-5 text-[var(--blue-core)]" /> Submissions
                        </h3>
                        <button onClick={async () => {
                          if (!confirm('Clear ALL submissions? This will also reset all scores and solver counts.')) return;
                          try { const t = await api.getCsrfToken(); useStore.getState().setCsrfToken(t.csrf_token); await api.clearSubmissions(); toast.success('All submissions cleared, scores reset'); loadTabData('submissions'); }
                          catch { toast.error('Failed to clear submissions'); }
                        }} className="admin-action-btn px-4 py-2 rounded-lg bg-[rgba(224,32,32,0.1)] border border-[rgba(224,32,32,0.3)] text-[var(--red-glow)] text-xs font-mono hover:bg-[rgba(224,32,32,0.2)] transition-all flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Clear Submissions
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left admin-table">
                          <thead>
                            <tr className="text-txt-secondary font-mono text-xs uppercase tracking-wider border-b border-[rgba(26,110,255,0.1)]">
                              <th className="p-3">ID</th>
                              <th className="p-3">Player</th>
                              <th className="p-3">Challenge</th>
                              <th className="p-3">Result</th>
                              <th className="p-3">IP</th>
                              <th className="p-3">Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {submissions.map((s: any) => (
                              <tr key={s.id} className="border-b border-[rgba(26,110,255,0.05)] hover:bg-[rgba(26,110,255,0.05)] transition-colors">
                                <td className="p-3 font-mono text-xs text-txt-muted">{s.id}</td>
                                <td className="p-3 font-mono text-xs text-txt-primary font-semibold">{s.username || '-'}</td>
                                <td className="p-3 font-mono text-xs text-txt-primary">{s.challenge_title}</td>
                                <td className="p-3">
                                  <span className={`text-xs font-mono ${s.is_correct ? 'text-[var(--success)]' : 'text-[var(--red-core)]'}`}>
                                    {s.is_correct ? 'CORRECT' : 'WRONG'}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-xs text-txt-muted">{s.ip_address || '-'}</td>
                                <td className="p-3 font-mono text-xs text-txt-muted">{new Date(s.created_at).toLocaleString()}</td>
                              </tr>
                            ))}
                            {submissions.length === 0 && (
                              <tr>
                                <td colSpan={6} className="p-6 text-center text-txt-muted font-mono text-sm">No submissions yet</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'announcements' && (
                    <div className="space-y-6">
                      <div className="card rounded-xl p-6">
                        <h3 className="font-display text-txt-primary mb-4 flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[var(--warning)]" />
                          New Announcement
                        </h3>
                        <form onSubmit={handleAnnouncement} className="space-y-4">
                          <div>
                            <label className="block text-txt-secondary font-mono text-xs mb-2">Title</label>
                            <input type="text" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" required />
                          </div>
                          <div>
                            <label className="block text-txt-secondary font-mono text-xs mb-2">Message</label>
                            <textarea value={announcementMsg} onChange={(e) => setAnnouncementMsg(e.target.value)} rows={4} className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" required />
                          </div>
                          <button type="submit" className="admin-action-btn px-6 py-3 rounded-xl bg-[rgba(26,110,255,0.1)] border border-[rgba(26,110,255,0.3)] text-[var(--blue-core)] font-mono text-sm hover:bg-[rgba(26,110,255,0.2)] transition-all flex items-center gap-2">
                            <Bell className="w-4 h-4" /> Send Announcement
                          </button>
                        </form>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-display text-txt-primary text-lg flex items-center gap-2 px-1">
                          <Activity className="w-4 h-4 text-txt-muted" />
                          Existing Announcements
                        </h3>
                        {announcementsList.length === 0 ? (
                          <div className="card rounded-xl p-10 text-center">
                            <Bell className="w-10 h-10 text-txt-muted mx-auto mb-3" />
                            <p className="text-txt-muted font-mono text-sm">No announcements yet</p>
                          </div>
                        ) : announcementsList.map((a: any) => (
                          <div key={a.id} className="card rounded-xl p-5 border-l-4" style={{ borderLeftColor: '#ffd700' }}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                {editingAnnouncement?.id === a.id ? (
                                  <div className="space-y-3">
                                    <input
                                      type="text"
                                      value={editAnnouncementTitle}
                                      onChange={(e) => setEditAnnouncementTitle(e.target.value)}
                                      className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm"
                                    />
                                    <textarea
                                      value={editAnnouncementMsg}
                                      onChange={(e) => setEditAnnouncementMsg(e.target.value)}
                                      rows={3}
                                      className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm"
                                    />
                                    <div className="flex gap-2">
                                      <button onClick={handleSaveEditAnnouncement} className="admin-action-btn px-4 py-2 rounded-lg bg-[rgba(0,214,143,0.1)] border border-[rgba(0,214,143,0.3)] text-[var(--success)] font-mono text-xs hover:bg-[rgba(0,214,143,0.2)] transition-all">
                                        Save
                                      </button>
                                      <button onClick={() => setEditingAnnouncement(null)} className="admin-action-btn px-4 py-2 rounded-lg bg-[rgba(122,156,192,0.1)] border border-[rgba(122,156,192,0.3)] text-txt-secondary font-mono text-xs hover:bg-[rgba(122,156,192,0.2)] transition-all">
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <h4 className="font-display text-txt-primary text-sm mb-1">{a.title}</h4>
                                    <p className="text-txt-secondary font-mono text-xs whitespace-pre-wrap line-clamp-2">{a.message}</p>
                                    <p className="text-txt-muted font-mono text-xs mt-2">{new Date(a.created_at).toLocaleString()}</p>
                                  </div>
                                )}
                              </div>
                              {editingAnnouncement?.id !== a.id && (
                                <div className="flex gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => { setEditingAnnouncement(a); setEditAnnouncementTitle(a.title); setEditAnnouncementMsg(a.message); }}
                                    className="p-2 rounded-lg bg-[rgba(26,110,255,0.1)] border border-[rgba(26,110,255,0.3)] text-[var(--blue-core)] hover:bg-[rgba(26,110,255,0.2)] transition-all"
                                    title="Edit"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAnnouncement(a.id)}
                                    className="p-2 rounded-lg bg-[rgba(224,32,32,0.1)] border border-[rgba(224,32,32,0.3)] text-[var(--red-core)] hover:bg-[rgba(224,32,32,0.2)] transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'logs' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg text-txt-primary flex items-center gap-2">
                          <Activity className="w-5 h-5 text-[var(--blue-core)]" /> System Logs
                        </h3>
                        <button onClick={async () => {
                          if (!confirm('Clear all system logs? This cannot be undone.')) return;
                          try { const t = await api.getCsrfToken(); useStore.getState().setCsrfToken(t.csrf_token); await api.clearLogs(); toast.success('All logs cleared'); loadTabData('logs'); }
                          catch { toast.error('Failed to clear logs'); }
                        }} className="admin-action-btn px-4 py-2 rounded-lg bg-[rgba(224,32,32,0.1)] border border-[rgba(224,32,32,0.3)] text-[var(--red-glow)] text-xs font-mono hover:bg-[rgba(224,32,32,0.2)] transition-all flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Clear Logs
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left admin-table">
                          <thead>
                            <tr className="text-txt-secondary font-mono text-xs uppercase tracking-wider border-b border-[rgba(26,110,255,0.1)]">
                              <th className="p-3">ID</th>
                              <th className="p-3">Action</th>
                              <th className="p-3">Severity</th>
                              <th className="p-3">IP</th>
                              <th className="p-3">Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {logs.map((log: any) => (
                              <tr key={log.id} className="border-b border-[rgba(26,110,255,0.05)] hover:bg-[rgba(26,110,255,0.05)] transition-colors">
                                <td className="p-3 font-mono text-xs text-txt-muted">{log.id}</td>
                                <td className="p-3 font-mono text-xs text-txt-primary">{log.action}</td>
                                <td className="p-3">
                                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                                    log.severity === 'suspicious' ? 'bg-[rgba(224,32,32,0.1)] text-[var(--red-core)]' :
                                    log.severity === 'info' ? 'bg-[rgba(26,110,255,0.1)] text-[var(--blue-core)]' :
                                    'bg-[rgba(122,156,192,0.1)] text-txt-secondary'
                                  }`}>{log.severity}</span>
                                </td>
                                <td className="p-3 font-mono text-xs text-txt-muted">{log.ip_address || '-'}</td>
                                <td className="p-3 font-mono text-xs text-txt-muted">{new Date(log.created_at).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'warmup' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <h3 className="font-display text-lg text-txt-primary flex items-center gap-2">
                          <Flame className="w-5 h-5 text-[#FF8C00]" /> Warmup Challenges (Web: Easy/Medium/Hard)
                        </h3>
                        <button
                          onClick={async () => {
                            if (!confirm('Are you sure you want to publish all Web challenges?')) return;
                            try {
                              const t = await api.getCsrfToken();
                              useStore.getState().setCsrfToken(t.csrf_token);
                              const res = await api.adminPublishAllWeb();
                              toast.success('All Web challenges have been published.');
                              loadTabData('warmup');
                              loadTabData('challenges');
                            } catch { toast.error('Failed to publish all Web challenges'); }
                          }}
                          className="px-5 py-2.5 rounded-xl bg-[rgba(26,110,255,0.15)] border border-[rgba(26,110,255,0.4)] text-[var(--blue-core)] font-mono text-sm hover:bg-[rgba(26,110,255,0.25)] transition-all flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Publish All Web Challenges
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left admin-table">
                          <thead>
                            <tr className="text-txt-secondary font-mono text-xs uppercase tracking-wider border-b border-[rgba(26,110,255,0.1)]">
                              <th className="p-3">ID</th>
                              <th className="p-3">Title</th>
                              <th className="p-3">Difficulty</th>
                              <th className="p-3">Points</th>
                              <th className="p-3">Type</th>
                              <th className="p-3">Solves</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {warmupChallenges.length === 0 ? (
                              <tr><td colSpan={8} className="p-6 text-center text-txt-muted font-mono text-sm">No warmup challenges found</td></tr>
                            ) : warmupChallenges.map((c: any) => (
                              <tr key={c.id} className="border-b border-[rgba(26,110,255,0.05)] hover:bg-[rgba(26,110,255,0.05)] transition-colors">
                                <td className="p-3 font-mono text-xs text-txt-muted">{c.id}</td>
                                <td className="p-3 font-mono text-sm text-txt-primary">{c.title}</td>
                                <td className="p-3 font-mono text-xs capitalize">{c.difficulty}</td>
                                <td className="p-3 font-mono text-sm text-[var(--success)]">{c.points}</td>
                                <td className="p-3 font-mono text-xs text-[#A03CFF]">{c.challengeType}</td>
                                <td className="p-3 font-mono text-xs text-[var(--warning)]">{c.solverCount}</td>
                                <td className="p-3">
                                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${c.status === 'published' ? 'bg-[rgba(0,214,143,0.1)] text-[var(--success)]' : c.status === 'archived' ? 'bg-[rgba(224,32,32,0.1)] text-[var(--red-core)]' : 'bg-[rgba(122,156,192,0.1)] text-txt-secondary'}`}>
                                    {c.status === 'published' ? 'Published' : c.status === 'archived' ? 'Archived' : c.status === 'in_review' ? 'In Review' : 'Draft'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => handleTogglePublish(c.id)} className="p-1.5 rounded-lg bg-[rgba(26,110,255,0.1)] text-[var(--blue-core)] hover:bg-[rgba(26,110,255,0.2)] transition-all" title={c.status === 'published' ? 'Unpublish' : 'Publish'}>
                                      {c.status === 'published' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                    {c.challengeType === 'asset' && (
                                      <label className="p-1.5 rounded-lg bg-[rgba(0,214,143,0.1)] text-[var(--success)] hover:bg-[rgba(0,214,143,0.2)] cursor-pointer transition-all" title="Download Assets">
                                        <Upload className="w-3.5 h-3.5" />
                                      </label>
                                    )}
                                    {c.challengeType === 'instance' && (
                                      <span className="p-1.5 rounded-lg bg-[rgba(26,110,255,0.1)] text-[var(--blue-core)] text-[10px] font-mono">Open Instance</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      {liveAlerts.length > 0 && (
                        <div className="card rounded-xl p-3 border-[rgba(224,32,32,0.5)] bg-[rgba(224,32,32,0.1)]">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-display text-xs text-[var(--red-glow)] flex items-center gap-1">
                              <Radio className="w-3 h-3 animate-pulse" /> LIVE ATTACKS {wsConnected ? '(Connected)' : '(Reconnecting...)'}
                            </h4>
                            <button onClick={() => setLiveAlerts([])} className="text-txt-muted hover:text-txt-primary text-xs">Dismiss alerts</button>
                          </div>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            <AnimatePresence>
                              {liveAlerts.slice(0, 5).map((alert: any) => (
                                <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-xs font-mono">
                                  <span className="text-[var(--red-glow)]">▶</span>
                                  <span className="text-[#FF8C00] w-20 truncate">{alert.attack_type}</span>
                                  <span className="text-txt-secondary">{alert.ip}</span>
                                  <span className="text-[var(--warning)]">{alert.risk_score}</span>
                                  <span className="text-txt-muted w-32 truncate">{alert.endpoint}</span>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg text-txt-primary flex items-center gap-2">
                          <Shield className="w-5 h-5 text-[var(--red-core)]" /> Security Dashboard
                        </h3>
                        <button onClick={() => { loadTabData('security'); }}
                          className="admin-action-btn px-3 py-1.5 rounded-lg border border-[rgba(26,110,255,0.3)] text-[var(--blue-core)] text-xs hover:bg-[rgba(26,110,255,0.1)] transition-all flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" /> Refresh
                        </button>
                      </div>

                      <div className="card rounded-xl p-4 mb-4">
                        <h4 className="font-display text-sm text-txt-primary mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[var(--red-core)]" /> Security Features
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                          {Object.entries({
                            ip_blacklist: 'IP Blacklist',
                            ip_quarantine: 'IP Quarantine',
                            ip_whitelist: 'IP Whitelist',
                            input_sanitization: 'Input Sanitization',
                            waf_pattern_scan: 'WAF Pattern Scan',
                            anomaly_detection: 'Anomaly Detection',
                            bot_detection: 'Bot Detection',
                            rate_limiting: 'Rate Limiting',
                            body_size_limit: 'Body Size Limit',
                            csrf_protection: 'CSRF Protection',
                            cors_validation: 'CORS Validation',
                            attack_logging: 'Attack Logging',
                            security_headers: 'Security Headers',
                            tarpit_protection: 'Tarpit Protection',
                          }).map(([key, label]) => {
                            const enabled = securityFeatures[key] ?? true;
                            return (
                              <div key={key} className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${enabled ? 'bg-[rgba(0,214,143,0.05)] border-[rgba(0,214,143,0.25)]' : 'bg-[rgba(224,32,32,0.05)] border-[rgba(224,32,32,0.25)]'}`}>
                                <span className={`text-xs font-mono ${enabled ? 'text-[var(--success)]' : 'text-[var(--red-glow)]'}`}>{label}</span>
                                <button
                                  onClick={async () => {
                                    setFeatureToggling(key);
                                    try {
                                      const r = await api.toggleSecurityFeature(key);
                                      if (r.all_features) {
                                        setSecurityFeatures(r.all_features);
                                      } else {
                                        setSecurityFeatures(prev => ({ ...prev, [key]: !prev[key] }));
                                      }
                                      const status = r.enabled !== undefined ? (r.enabled ? 'enabled' : 'disabled') : 'toggled';
                                      toast.success(`${label} ${status}`);
                                    } catch { toast.error(`Failed to toggle ${label}`); }
                                    setFeatureToggling(null);
                                  }}
                                  disabled={featureToggling === key}
                                  className={`ml-2 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${enabled ? 'bg-[rgba(224,32,32,0.2)] text-[var(--red-glow)] hover:bg-[rgba(224,32,32,0.3)]' : 'bg-[rgba(0,214,143,0.2)] text-[var(--success)] hover:bg-[rgba(0,214,143,0.3)]'} ${featureToggling === key ? 'opacity-50 cursor-wait' : ''}`}
                                >
                                  {featureToggling === key ? <Loader2 className="w-3 h-3 animate-spin inline" /> : enabled ? 'Disable' : 'Enable'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {securityStatsData && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="card rounded-xl p-4 text-center border-[rgba(224,32,32,0.3)]">
                            <div className="text-2xl font-display font-bold text-[var(--red-glow)]">{securityStatsData.total_attacks}</div>
                            <div className="text-txt-muted text-xs mt-1">Total Attacks</div>
                          </div>
                          <div className="card rounded-xl p-4 text-center border-[rgba(224,32,32,0.3)]">
                            <div className="text-2xl font-display font-bold text-[#FF8C00]">{securityStatsData.high_count + securityStatsData.critical_count}</div>
                            <div className="text-txt-muted text-xs mt-1">Critical/High</div>
                          </div>
                          <div className="card rounded-xl p-4 text-center border-[rgba(26,110,255,0.3)]">
                            <div className="text-2xl font-display font-bold text-[var(--blue-core)]">{securityStatsData.blocked_count}</div>
                            <div className="text-txt-muted text-xs mt-1">Blocked</div>
                          </div>
                          <div className="card rounded-xl p-4 text-center border-[rgba(255,184,0,0.3)]">
                            <div className="text-2xl font-display font-bold text-[var(--warning)]">{securityStatsData.unique_ips}</div>
                            <div className="text-txt-muted text-xs mt-1">Unique IPs</div>
                          </div>
                        </div>
                      )}

                      {securityStatsData && securityStatsData.top_attack_types && (
                        <div className="card rounded-xl p-4">
                          <h4 className="font-display text-sm text-txt-primary mb-3">Top Attack Types</h4>
                          <div className="space-y-2">
                            {securityStatsData.top_attack_types.map((t: any, i: number) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-[var(--red-glow)] text-xs font-mono w-32 truncate">{t.type || 'unknown'}</span>
                                <div className="flex-1 bg-[#0a0f18]/50 rounded-full h-2">
                                  <div className="bg-[rgba(224,32,32,0.6)] h-2 rounded-full" style={{ width: `${Math.min(100, (t.count / (securityStatsData.total_attacks || 1)) * 100)}%` }} />
                                </div>
                                <span className="text-txt-secondary text-xs font-mono w-12 text-right">{t.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="card rounded-xl p-4">
                        <h4 className="font-display text-sm text-txt-primary mb-3">Security Settings</h4>
                        {securitySettingsData && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div>
                              <span className="text-txt-muted">Blacklisted IPs</span>
                              <div className="text-[var(--red-glow)] font-mono">{securitySettingsData.blacklisted_ips?.length || 0}</div>
                            </div>
                            <div>
                              <span className="text-txt-muted">Whitelisted IPs</span>
                              <div className="text-[var(--success)] font-mono">{securitySettingsData.whitelisted_ips?.length || 0}</div>
                            </div>
                            <div>
                              <span className="text-txt-muted">Active Quarantines</span>
                              <div className="text-[#FF8C00] font-mono">{securitySettingsData.active_quarantines || 0}</div>
                            </div>
                            <div>
                              <span className="text-txt-muted">Chain Integrity</span>
                              <div className="text-[var(--blue-core)] font-mono">Active</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="card rounded-xl p-4">
                        <h4 className="font-display text-sm text-txt-primary mb-3">Security Features Overview</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                          <div className="p-3 rounded-lg bg-[rgba(11,18,32,0.8)] border border-[rgba(122,156,192,0.3)]">
                            <div className="text-[var(--blue-core)] font-mono text-[11px] font-bold mb-1">WAF Engine</div>
                            <div className="text-txt-muted leading-relaxed">Detects SQLi, XSS, command injection, path traversal, encoded payloads. Blocks at risk_score &ge; 3.0.</div>
                          </div>
                          <div className="p-3 rounded-lg bg-[rgba(11,18,32,0.8)] border border-[rgba(122,156,192,0.3)]">
                            <div className="text-[var(--blue-core)] font-mono text-[11px] font-bold mb-1">Rate Limiting</div>
                            <div className="text-txt-muted leading-relaxed">Per-endpoint limits (auth: 5/15s, admin: 30/60s, submissions: 10/60s). Escalating penalties x1→x32.</div>
                          </div>
                          <div className="p-3 rounded-lg bg-[rgba(11,18,32,0.8)] border border-[rgba(122,156,192,0.3)]">
                            <div className="text-[var(--blue-core)] font-mono text-[11px] font-bold mb-1">Anomaly Detection</div>
                            <div className="text-txt-muted leading-relaxed">JSON structure abuse, method enumeration, path probing, parameter pollution, endpoint hammering.</div>
                          </div>
                          <div className="p-3 rounded-lg bg-[rgba(11,18,32,0.8)] border border-[rgba(122,156,192,0.3)]">
                            <div className="text-[var(--blue-core)] font-mono text-[11px] font-bold mb-1">Bot Detection</div>
                            <div className="text-txt-muted leading-relaxed">Rate analysis, path scraping, regular intervals, scanner UA detection (acunetix, sqlmap, nessus…).</div>
                          </div>
                          <div className="p-3 rounded-lg bg-[rgba(11,18,32,0.8)] border border-[rgba(122,156,192,0.3)]">
                            <div className="text-[var(--blue-core)] font-mono text-[11px] font-bold mb-1">IP Quarantine &amp; Blacklist</div>
                            <div className="text-txt-muted leading-relaxed">Auto-quarantine high-risk IPs (5 min). Manual block/unblock/whitelist via buttons below.</div>
                          </div>
                          <div className="p-3 rounded-lg bg-[rgba(11,18,32,0.8)] border border-[rgba(122,156,192,0.3)]">
                            <div className="text-[var(--blue-core)] font-mono text-[11px] font-bold mb-1">CSRF Protection</div>
                            <div className="text-txt-muted leading-relaxed">HMAC-based tokens on all admin mutating endpoints (POST/PUT/DELETE). Validated server-side.</div>
                          </div>
                          <div className="p-3 rounded-lg bg-[rgba(11,18,32,0.8)] border border-[rgba(122,156,192,0.3)]">
                            <div className="text-[var(--blue-core)] font-mono text-[11px] font-bold mb-1">Input Sanitization</div>
                            <div className="text-txt-muted leading-relaxed">Strips HTML tags, encodes special chars on POST/PUT/PATCH body and query params.</div>
                          </div>
                          <div className="p-3 rounded-lg bg-[rgba(11,18,32,0.8)] border border-[rgba(122,156,192,0.3)]">
                            <div className="text-[var(--blue-core)] font-mono text-[11px] font-bold mb-1">Account Lockout</div>
                            <div className="text-txt-muted leading-relaxed">Progressive delays (0→1200s). CAPTCHA at 3 failures. Lockout at 5 IP or 15 IP-level failures.</div>
                          </div>
                          <div className="p-3 rounded-lg bg-[rgba(11,18,32,0.8)] border border-[rgba(122,156,192,0.3)]">
                            <div className="text-[var(--blue-core)] font-mono text-[11px] font-bold mb-1">Immutable Audit Log</div>
                             <div className="text-txt-muted leading-relaxed">SHA256 chain-hash linking every log entry. Integrity verification via &quot;Check Chain&quot; below.</div>
                          </div>
                          <div className="p-3 rounded-lg bg-[rgba(11,18,32,0.8)] border border-[rgba(122,156,192,0.3)]">
                            <div className="text-[var(--blue-core)] font-mono text-[11px] font-bold mb-1">Fingerprinting &amp; Anti-Sharing</div>
                            <div className="text-txt-muted leading-relaxed">SHA256(ip|ua|accept-lang) per user. Detects multiple fingerprints per account, rapid submissions.</div>
                          </div>
                          <div className="p-3 rounded-lg bg-[rgba(11,18,32,0.8)] border border-[rgba(122,156,192,0.3)]">
                            <div className="text-[var(--blue-core)] font-mono text-[11px] font-bold mb-1">Request Body Size Limit</div>
                            <div className="text-txt-muted leading-relaxed">100 KB for regular requests, 50 MB for file uploads. Returns 413 if exceeded.</div>
                          </div>
                          <div className="p-3 rounded-lg bg-[rgba(11,18,32,0.8)] border border-[rgba(122,156,192,0.3)]">
                            <div className="text-[var(--blue-core)] font-mono text-[11px] font-bold mb-1">CORS Origin Validation</div>
                            <div className="text-txt-muted leading-relaxed">Validates Origin/Referer against allowed origins. Blocks cross-origin mutating requests.</div>
                          </div>
                        </div>
                      </div>

                      <div className="card rounded-xl p-4">
                        <h4 className="font-display text-sm text-txt-primary mb-3">Block IP</h4>
                        <div className="flex gap-2">
                          <input type="text" value={securityBlockIp} onChange={(e) => setSecurityBlockIp(e.target.value)}
                            placeholder="IP address to block..."
                            className="input-field flex-1 px-3 py-2 rounded-lg font-mono text-xs" />
                          <button onClick={async () => {
                            if (!securityBlockIp) return;
                            await api.blockIp(securityBlockIp, 'Admin block');
                            toast.success(`Blocked ${securityBlockIp}`);
                            setSecurityBlockIp('');
                            loadTabData('security');
                          }} className="admin-action-btn px-4 py-2 rounded-lg bg-[rgba(224,32,32,0.1)] border border-[rgba(224,32,32,0.3)] text-[var(--red-glow)] text-xs font-mono hover:bg-[rgba(224,32,32,0.2)] transition-all">
                            Block
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap mb-2">
                        <select value={securityFilterSeverity} onChange={(e) => setSecurityFilterSeverity(e.target.value)}
                          className="input-field px-3 py-1.5 rounded-lg font-mono text-xs w-28 bg-[#0a0f18]">
                          <option value="">All Severity</option>
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                        <select value={securityFilterType} onChange={(e) => setSecurityFilterType(e.target.value)}
                          className="input-field px-3 py-1.5 rounded-lg font-mono text-xs w-36 bg-[#0a0f18]">
                          <option value="">All Types</option>
                          <option value="sql">SQL Injection</option>
                          <option value="xss">XSS</option>
                          <option value="cmdi">Command Injection</option>
                          <option value="ptrav">Path Traversal</option>
                          <option value="bot">Bot</option>
                          <option value="rate">Rate Limit</option>
                        </select>
                        <button onClick={() => loadTabData('security')}
                          className="admin-action-btn px-3 py-1.5 rounded-lg border border-[rgba(26,110,255,0.3)] text-[var(--blue-core)] text-xs hover:bg-[rgba(26,110,255,0.1)] transition-all">
                          <RefreshCw className="w-3 h-3 inline mr-1" /> Filter
                        </button>
                        <button onClick={async () => {
                          if (!confirm('Clear ALL attack detection results? This cannot be undone.')) return;
                          try { const t = await api.getCsrfToken(); useStore.getState().setCsrfToken(t.csrf_token); await api.clearSecurityLogs(); toast.success('All detection results cleared'); loadTabData('security'); }
                          catch { toast.error('Failed to clear detection results'); }
                        }} className="admin-action-btn px-3 py-1.5 rounded-lg bg-[rgba(224,32,32,0.1)] border border-[rgba(224,32,32,0.3)] text-[var(--red-glow)] text-xs font-mono hover:bg-[rgba(224,32,32,0.2)] transition-all flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Clear All Detection Results
                        </button>
                      </div>

                      <div className="card rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-[rgba(26,110,255,0.1)]">
                                <th className="text-left p-3 text-txt-muted font-mono">Time</th>
                                <th className="text-left p-3 text-txt-muted font-mono">Type</th>
                                <th className="text-left p-3 text-txt-muted font-mono">Severity</th>
                                <th className="text-left p-3 text-txt-muted font-mono">IP</th>
                                <th className="text-left p-3 text-txt-muted font-mono">Risk</th>
                                <th className="text-left p-3 text-txt-muted font-mono">Action</th>
                                <th className="text-left p-3 text-txt-muted font-mono">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {securityLogsData.length === 0 && (
                                <tr><td colSpan={7} className="p-6 text-center text-txt-muted font-mono">No attack logs recorded</td></tr>
                              )}
                              {securityLogsData.map((log: any) => (
                                <tr key={log.id} className="border-b border-[rgba(26,110,255,0.05)] hover:bg-[rgba(26,110,255,0.05)] transition-colors">
                                  <td className="p-3 text-txt-secondary font-mono whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                                  <td className="p-3">
                                    <span className="font-mono text-[var(--blue-core)]">{log.attack_type}</span>
                                  </td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                                      log.severity === 'critical' ? 'bg-[rgba(224,32,32,0.2)] text-[var(--red-glow)]' :
                                      log.severity === 'high' ? 'bg-[rgba(255,140,0,0.2)] text-[#FF8C00]' :
                                      log.severity === 'medium' ? 'bg-[rgba(255,184,0,0.2)] text-[var(--warning)]' :
                                      'bg-[rgba(122,156,192,0.2)] text-txt-secondary'
                                    }`}>{log.severity}</span>
                                  </td>
                                  <td className="p-3 font-mono text-txt-secondary">{log.ip_address}</td>
                                  <td className="p-3">
                                    <span className={`font-mono ${
                                      log.risk_score >= 9 ? 'text-[var(--red-glow)]' :
                                      log.risk_score >= 7 ? 'text-[#FF8C00]' :
                                      log.risk_score >= 5 ? 'text-[var(--warning)]' : 'text-txt-secondary'
                                    }`}>{log.risk_score.toFixed(1)}</span>
                                  </td>
                                  <td className="p-3 font-mono text-txt-secondary">{log.action_taken}</td>
                                  <td className="p-3">
                                    <div className="flex gap-1">
                                      {!log.reviewed ? (
                                        <button onClick={async () => {
                                          await api.reviewAttackLog(log.id);
                                          toast.success('Reviewed');
                                          loadTabData('security');
                                        }} className="px-2 py-0.5 rounded text-xs border border-[rgba(26,110,255,0.3)] text-[var(--blue-core)] hover:bg-[rgba(26,110,255,0.1)] transition-all">Review</button>
                                      ) : (
                                        <span className="text-[var(--success)] text-xs font-mono">✓ Reviewed</span>
                                      )}
                                      {log.blocked ? (
                                        <button onClick={async () => {
                                          await api.unblockIp(log.ip_address);
                                          toast.success(`Unblocked ${log.ip_address}`);
                                          loadTabData('security');
                                        }} className="px-2 py-0.5 rounded text-xs border border-[rgba(0,214,143,0.3)] text-[var(--success)] hover:bg-[rgba(0,214,143,0.1)] transition-all">Unblock</button>
                                      ) : null}
                                      <button onClick={async () => {
                                        await api.blockIp(log.ip_address, 'Attack log action');
                                        toast.success(`Blocked ${log.ip_address}`);
                                        loadTabData('security');
                                      }} className="px-2 py-0.5 rounded text-xs border border-[rgba(224,32,32,0.3)] text-[var(--red-glow)] hover:bg-[rgba(224,32,32,0.1)] transition-all">Block</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'realflags' && (
                    <div className="space-y-6">
                      <div className="card rounded-xl p-5 sm:p-6">
                        <h3 className="font-display text-txt-primary text-sm mb-5 flex items-center gap-2 border-b border-[rgba(26,110,255,0.1)] pb-3">
                          <Lock className="w-4 h-4 text-[var(--blue-core)]" /> Store Secret Flag
                        </h3>
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          try {
                            await api.createRealFlag(realFlagForm.challenge_name, realFlagForm.flag, realFlagForm.category || undefined, realFlagForm.notes || undefined);
                            toast.success('Secret flag stored!');
                            setRealFlagForm({ challenge_name: '', flag: '', category: '', notes: '' });
                            loadTabData('realflags');
                          } catch (err: any) {
                            toast.error(err?.response?.data?.detail || 'Failed to store flag');
                          }
                        }} className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5">
                          <div className="sm:col-span-2">
                            <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Challenge Name</label>
                            <input type="text" value={realFlagForm.challenge_name} onChange={(e) => setRealFlagForm({ ...realFlagForm, challenge_name: e.target.value })}
                              placeholder="Enter challenge name" className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Flag</label>
                            <textarea value={realFlagForm.flag} onChange={(e) => setRealFlagForm({ ...realFlagForm, flag: e.target.value })}
                              placeholder="Paste secret flag here" rows={2} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
                          </div>
                          <div>
                            <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Category</label>
                            <input type="text" value={realFlagForm.category} onChange={(e) => setRealFlagForm({ ...realFlagForm, category: e.target.value })}
                              placeholder="e.g. Web, Crypto" className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
                          </div>
                          <div>
                            <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Notes</label>
                            <input type="text" value={realFlagForm.notes} onChange={(e) => setRealFlagForm({ ...realFlagForm, notes: e.target.value })}
                              placeholder="Additional notes" className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
                          </div>
                          <button type="submit" className="sm:col-span-2 mt-1 px-6 py-2.5 rounded-xl bg-[rgba(26,110,255,0.1)] border border-[rgba(26,110,255,0.3)] text-[var(--blue-core)] font-mono text-sm hover:bg-[rgba(26,110,255,0.2)] transition-all flex items-center justify-center gap-2">
                            <Lock className="w-4 h-4" /> Store Flag
                          </button>
                        </form>
                      </div>

                      <div className="card rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-txt-muted font-mono text-[11px] uppercase tracking-wider border-b border-[rgba(26,110,255,0.1)] bg-black/20">
                                <th className="p-3 pl-5 font-medium">ID</th>
                                <th className="p-3 font-medium">Challenge</th>
                                <th className="p-3 font-medium">Flag</th>
                                <th className="p-3 font-medium">Category</th>
                                <th className="p-3 font-medium">Notes</th>
                                <th className="p-3 pr-5 font-medium text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {realFlags.length === 0 ? (
                                <tr><td colSpan={6} className="p-10 text-center text-txt-muted font-mono text-sm">No secret flags stored yet</td></tr>
                              ) : realFlags.map((f: any) => (
                                <tr key={f.id} className="border-b border-[rgba(26,110,255,0.05)] hover:bg-[rgba(26,110,255,0.03)] transition-colors">
                                  {editRealFlag?.id === f.id ? (
                                    <>
                                      <td className="p-3 pl-5 font-mono text-xs text-txt-muted align-top pt-4">{f.id}</td>
                                      <td className="p-3">
                                        <input type="text" value={editRealFlagForm.challenge_name} onChange={(e) => setEditRealFlagForm({ ...editRealFlagForm, challenge_name: e.target.value })}
                                          className="input-field w-full px-2.5 py-1.5 rounded font-mono text-xs" />
                                      </td>
                                      <td className="p-3">
                                        <textarea value={editRealFlagForm.flag} onChange={(e) => setEditRealFlagForm({ ...editRealFlagForm, flag: e.target.value })}
                                          className="input-field w-full px-2.5 py-1.5 rounded font-mono text-xs" rows={1} />
                                      </td>
                                      <td className="p-3">
                                        <input type="text" value={editRealFlagForm.category} onChange={(e) => setEditRealFlagForm({ ...editRealFlagForm, category: e.target.value })}
                                          className="input-field w-full px-2.5 py-1.5 rounded font-mono text-xs" />
                                      </td>
                                      <td className="p-3">
                                        <input type="text" value={editRealFlagForm.notes} onChange={(e) => setEditRealFlagForm({ ...editRealFlagForm, notes: e.target.value })}
                                          className="input-field w-full px-2.5 py-1.5 rounded font-mono text-xs" />
                                      </td>
                                      <td className="p-3 pr-5 align-top pt-4">
                                        <div className="flex gap-1.5 justify-end">
                                          <button onClick={async () => {
                                            try {
                                              await api.updateRealFlag(f.id, editRealFlagForm);
                                              toast.success('Updated');
                                              setEditRealFlag(null);
                                              loadTabData('realflags');
                                            } catch { toast.error('Failed'); }
                                          }} className="p-1.5 rounded-lg bg-[rgba(0,214,143,0.1)] text-[var(--success)] hover:bg-[rgba(0,214,143,0.2)] transition-all" title="Save">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => setEditRealFlag(null)} className="p-1.5 rounded-lg bg-[rgba(122,156,192,0.1)] text-txt-secondary hover:bg-[rgba(122,156,192,0.2)] transition-all" title="Cancel">
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="p-3 pl-5 font-mono text-xs text-txt-muted">{f.id}</td>
                                      <td className="p-3 font-mono text-sm text-txt-primary font-medium">{f.challenge_name}</td>
                                      <td className="p-3 font-mono text-xs max-w-[220px] truncate" title={f.flag} style={{color: '#ff4500'}}>{f.flag}</td>
                                      <td className="p-3 font-mono text-xs text-txt-secondary">{f.category || <span className="text-txt-muted">-</span>}</td>
                                      <td className="p-3 font-mono text-xs text-txt-secondary max-w-[180px] truncate" title={f.notes || ''}>{f.notes || <span className="text-txt-muted">-</span>}</td>
                                      <td className="p-3 pr-5">
                                        <div className="flex gap-1.5 justify-end">
                                          <button onClick={() => { setEditRealFlag(f); setEditRealFlagForm({ challenge_name: f.challenge_name, flag: f.flag, category: f.category || '', notes: f.notes || '' }); }}
                                            className="p-1.5 rounded-lg bg-[rgba(26,110,255,0.1)] text-[var(--blue-core)] hover:bg-[rgba(26,110,255,0.2)] transition-all" title="Edit">
                                            <Pencil className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={async () => {
                                            if (!confirm(`Delete flag for "${f.challenge_name}"?`)) return;
                                            try { await api.deleteRealFlag(f.id); toast.success('Deleted'); loadTabData('realflags'); }
                                            catch { toast.error('Failed'); }
                                          }} className="p-1.5 rounded-lg bg-[rgba(224,32,32,0.1)] text-[var(--red-glow)] hover:bg-[rgba(224,32,32,0.2)] transition-all" title="Delete">
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'live' && (
                    <div className="space-y-6">
                      <div className="card rounded-xl p-5 sm:p-6">
                        <h3 className="font-display text-txt-primary text-sm mb-5 flex items-center gap-2 border-b border-[rgba(26,110,255,0.1)] pb-3">
                          <Radio className="w-4 h-4 text-[var(--blue-core)]" /> Live Challenge Control
                        </h3>
                        <p className="text-txt-muted font-mono text-xs mb-5">Publish or unpublish challenges by category and difficulty. Current counts shown for each group.</p>

                        {(() => {
                          const categories = ['web', 'reverse', 'crypto', 'forensics', 'osint'];
                          const difficulties = ['easy', 'medium', 'hard'];
                          const catLabels: Record<string, string> = { web: 'Web', reverse: 'Reverse', crypto: 'Crypto', forensics: 'Forensics', osint: 'OSINT' };
                          const diffLabels: Record<string, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

                          function countFor(cat: string, diff: string): number {
                            return liveChallenges.filter(c => c.category === cat && c.difficulty === diff).length;
                          }
                          function publishedCount(cat: string, diff: string): number {
                            return liveChallenges.filter(c => c.category === cat && c.difficulty === diff && c.status === 'published').length;
                          }

                          const handleToggle = async (action: 'publish' | 'unpublish', category: string, difficulty: string) => {
                            const label = `${catLabels[category]} ${diffLabels[difficulty]}`;
                            try {
                              const result = await api.adminBulkToggleChallenges(action, category, difficulty);
                              toast.success(result.message);
                              setLiveChallenges(await api.getAdminChallenges());
                            } catch (err: any) {
                              toast.error(err?.response?.data?.detail || `Failed to ${action} ${label}`);
                            }
                          };

                          const handleToggleCategory = async (action: 'publish' | 'unpublish', category: string) => {
                            try {
                              const result = await api.adminBulkToggleChallenges(action, category);
                              toast.success(result.message);
                              setLiveChallenges(await api.getAdminChallenges());
                            } catch (err: any) {
                              toast.error(err?.response?.data?.detail || `Failed to ${action} ${category}`);
                            }
                          };

                          return (
                            <div className="space-y-4">
                              {/* Category-level buttons */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                                {categories.map(cat => {
                                  const total = liveChallenges.filter(c => c.category === cat).length;
                                  const pub = liveChallenges.filter(c => c.category === cat && c.status === 'published').length;
                                  return (
                                    <div key={cat} className="card rounded-xl p-4 border border-[rgba(26,110,255,0.1)]">
                                      <h4 className="font-display text-txt-primary text-sm mb-2 uppercase tracking-wider">{catLabels[cat]}</h4>
                                      <p className="text-txt-muted font-mono text-xs mb-3">{pub}/{total} published</p>
                                      <div className="flex gap-2">
                                        <button onClick={() => handleToggleCategory('publish', cat)} className="flex-1 px-2 py-1.5 rounded-lg bg-[rgba(0,214,143,0.1)] border border-[rgba(0,214,143,0.3)] text-[var(--success)] font-mono text-xs hover:bg-[rgba(0,214,143,0.2)] transition-all">
                                          Publish All
                                        </button>
                                        <button onClick={() => handleToggleCategory('unpublish', cat)} className="flex-1 px-2 py-1.5 rounded-lg bg-[rgba(224,32,32,0.1)] border border-[rgba(224,32,32,0.3)] text-[var(--red-glow)] font-mono text-xs hover:bg-[rgba(224,32,32,0.2)] transition-all">
                                          Unpublish All
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Per-category × difficulty grid */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="text-txt-muted font-mono text-[11px] uppercase tracking-wider border-b border-[rgba(26,110,255,0.1)] bg-black/20">
                                      <th className="p-3 pl-5 font-medium">Category</th>
                                      {difficulties.map(d => (
                                        <th key={d} className="p-3 font-medium text-center">{diffLabels[d]}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {categories.map(cat => (
                                      <tr key={cat} className="border-b border-[rgba(26,110,255,0.05)] hover:bg-[rgba(26,110,255,0.03)] transition-colors">
                                        <td className="p-3 pl-5 font-mono text-sm text-txt-primary font-medium">{catLabels[cat]}</td>
                                        {difficulties.map(diff => {
                                          const total = countFor(cat, diff);
                                          const pub = publishedCount(cat, diff);
                                          return (
                                            <td key={diff} className="p-3 text-center">
                                              {total > 0 ? (
                                                <div className="flex flex-col items-center gap-1.5">
                                                  <span className="font-mono text-xs text-txt-secondary">{pub}/{total}</span>
                                                  <div className="flex gap-1">
                                                    <button onClick={() => handleToggle('publish', cat, diff)}
                                                      disabled={pub === total}
                                                      className="px-2 py-1 rounded bg-[rgba(0,214,143,0.1)] border border-[rgba(0,214,143,0.3)] text-[var(--success)] font-mono text-[10px] hover:bg-[rgba(0,214,143,0.2)] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                                      Live
                                                    </button>
                                                    <button onClick={() => handleToggle('unpublish', cat, diff)}
                                                      disabled={pub === 0}
                                                      className="px-2 py-1 rounded bg-[rgba(224,32,32,0.1)] border border-[rgba(224,32,32,0.3)] text-[var(--red-glow)] font-mono text-[10px] hover:bg-[rgba(224,32,32,0.2)] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                                      Draft
                                                    </button>
                                                  </div>
                                                </div>
                                              ) : (
                                                <span className="font-mono text-xs text-txt-muted">—</span>
                                              )}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="card rounded-xl p-6">
                      <h3 className="font-display text-txt-primary mb-4">Change Admin Credentials</h3>
                      <form onSubmit={handleChangeCredentials} className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-txt-secondary font-mono text-xs mb-2">Current Username</label>
                          <input type="text" value={credForm.current_username} onChange={(e) => setCredForm({ ...credForm, current_username: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" required />
                        </div>
                        <div>
                          <label className="block text-txt-secondary font-mono text-xs mb-2">Current Password</label>
                          <input type="password" value={credForm.current_password} onChange={(e) => setCredForm({ ...credForm, current_password: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" required />
                        </div>
                        <div>
                          <label className="block text-txt-secondary font-mono text-xs mb-2">New Username (optional)</label>
                          <input type="text" value={credForm.new_username} onChange={(e) => setCredForm({ ...credForm, new_username: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" />
                        </div>
                        <div>
                          <label className="block text-txt-secondary font-mono text-xs mb-2">New Password (optional)</label>
                          <input type="password" value={credForm.new_password} onChange={(e) => setCredForm({ ...credForm, new_password: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" />
                        </div>
                        <button type="submit" className="admin-action-btn px-6 py-3 rounded-xl bg-[rgba(26,110,255,0.1)] border border-[rgba(26,110,255,0.3)] text-[var(--blue-core)] font-mono text-sm hover:bg-[rgba(26,110,255,0.2)] transition-all flex items-center gap-2">
                          <Settings className="w-4 h-4" /> Update Credentials
                        </button>
                      </form>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Password Change Modal */}
    <AnimatePresence>
      {passwordModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          onClick={() => !passwordModalLoading && setPasswordModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="card rounded-2xl p-6 w-full max-w-md border-[rgba(26,110,255,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-txt-primary text-lg mb-2">Change Password</h3>
            <p className="text-txt-secondary font-mono text-xs mb-4">User: <span className="text-[var(--blue-core)]">{passwordModal.username}</span></p>
            <input
              type="text"
              value={passwordModalValue}
              onChange={(e) => setPasswordModalValue(e.target.value)}
              placeholder="New password (min 8 chars)"
              className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm mb-4"
              autoFocus
              minLength={8}
            />
            <div className="flex gap-3">
              <button
                onClick={handleAdminChangePassword}
                disabled={passwordModalLoading || passwordModalValue.length < 8}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[rgba(26,110,255,0.1)] border border-[rgba(26,110,255,0.3)] text-[var(--blue-core)] font-mono text-sm hover:bg-[rgba(26,110,255,0.2)] disabled:opacity-50 transition-all"
              >
                {passwordModalLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
              </button>
              <button
                onClick={() => { setPasswordModal(null); setPasswordModalValue(''); }}
                disabled={passwordModalLoading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[rgba(122,156,192,0.1)] border border-[rgba(122,156,192,0.3)] text-txt-secondary font-mono text-sm hover:bg-[rgba(122,156,192,0.2)] disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Username Change Modal */}
    <AnimatePresence>
      {usernameModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          onClick={() => !usernameModalLoading && setUsernameModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="card rounded-2xl p-6 w-full max-w-md border-[rgba(26,110,255,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-txt-primary text-lg mb-2">Edit Username</h3>
            <p className="text-txt-secondary font-mono text-xs mb-4">User: <span className="text-[var(--blue-glow)]">{usernameModal.username}</span></p>
            <input
              type="text"
              value={usernameModalValue}
              onChange={(e) => setUsernameModalValue(e.target.value)}
              placeholder="New username (min 3 chars)"
              className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm mb-4"
              autoFocus
              minLength={3}
            />
            <div className="flex gap-3">
              <button
                onClick={handleAdminChangeUsername}
                disabled={usernameModalLoading || usernameModalValue.trim().length < 3}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[rgba(26,110,255,0.1)] border border-[rgba(26,110,255,0.3)] text-[var(--blue-glow)] font-mono text-sm hover:bg-[rgba(26,110,255,0.2)] disabled:opacity-50 transition-all"
              >
                {usernameModalLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
              </button>
              <button
                onClick={() => { setUsernameModal(null); setUsernameModalValue(''); }}
                disabled={usernameModalLoading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[rgba(122,156,192,0.1)] border border-[rgba(122,156,192,0.3)] text-txt-secondary font-mono text-sm hover:bg-[rgba(122,156,192,0.2)] disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Edit Challenge Modal */}
    <AnimatePresence>
      {editingChallenge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 overflow-y-auto py-8"
          onClick={() => !editChallengeLoading && setEditingChallenge(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="card rounded-2xl p-4 sm:p-6 w-[95vw] sm:w-[90vw] md:max-w-2xl border-[rgba(255,184,0,0.3)] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-txt-primary text-lg mb-2 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[var(--warning)]" /> Edit Challenge
            </h3>
            <p className="text-txt-secondary font-mono text-xs mb-4">ID: <span className="text-[var(--warning)]">{editingChallenge.id}</span></p>
            <form onSubmit={handleUpdateChallenge} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="md:col-span-2">
                <input type="text" value={editChallengeForm.title} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, title: e.target.value })} placeholder="Title" className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
              </div>
              <div className="md:col-span-2">
                <textarea value={editChallengeForm.description} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, description: e.target.value })} placeholder="Description" rows={3} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
              </div>
              <select value={editChallengeForm.category} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, category: e.target.value })} className="input-field px-4 py-2.5 rounded-lg font-mono text-sm">
                <option value="web">Web</option>
                <option value="crypto">Crypto</option>
                <option value="reverse">Reverse</option>
                <option value="forensics">Forensics</option>
                <option value="osint">OSINT</option>
                <option value="pwn">Pwn</option>
                <option value="misc">Misc</option>
              </select>
              <select value={editChallengeForm.difficulty} onChange={(e) => { const d = e.target.value; setEditChallengeForm({ ...editChallengeForm, difficulty: d, bloodPoints: bloodByDiff[d] || 50 }); }} className="input-field px-4 py-2.5 rounded-lg font-mono text-sm">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
              <select value={editChallengeForm.flagMode} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, flagMode: e.target.value })} className="input-field px-4 py-2.5 rounded-lg font-mono text-sm">
                <option value="dynamic_user">Dynamic (Per User)</option>
                <option value="static">Static</option>
                <option value="dynamic_team">Dynamic (Per Team)</option>
              </select>
              <select value={editChallengeForm.challengeType} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, challengeType: e.target.value })} className="input-field px-4 py-2.5 rounded-lg font-mono text-sm">
                <option value="asset">Asset (Downloadable)</option>
                <option value="instance">Instance (In-Browser)</option>
              </select>
              <div>
                <label className="block text-txt-muted font-mono text-[10px] mb-1 uppercase tracking-wider">Flag</label>
                <input type="text" value={editChallengeForm.flag} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, flag: e.target.value })} placeholder="Challenge answer flag" className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
              </div>
              <div>
                <label className="block text-txt-muted font-mono text-[10px] mb-1 uppercase tracking-wider">Points</label>
                <input type="number" value={editChallengeForm.points} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, points: parseInt(e.target.value) || 0 })} placeholder="Score for solving" className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
              </div>
              <div>
                <label className="block text-txt-muted font-mono text-[10px] mb-1 uppercase tracking-wider">Max Attempts</label>
                <input type="number" value={editChallengeForm.maxAttempts} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, maxAttempts: parseInt(e.target.value) || 8 })} placeholder="8 = default" className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
              </div>
              <div>
                <label className="block text-txt-muted font-mono text-[10px] mb-1 uppercase tracking-wider">Blood Points</label>
                <input type="number" value={editChallengeForm.bloodPoints} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, bloodPoints: parseInt(e.target.value) || 0 })} placeholder="Bonus for first solver" className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-txt-muted font-mono text-[10px] mb-1 uppercase tracking-wider">Hint</label>
                <textarea value={editChallengeForm.hint} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, hint: e.target.value })} placeholder="Hint (optional)" rows={2} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={editChallengeLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[rgba(255,184,0,0.1)] border border-[rgba(255,184,0,0.3)] text-[var(--warning)] font-mono text-sm hover:bg-[rgba(255,184,0,0.2)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {editChallengeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                  {editChallengeLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingChallenge(null)}
                  disabled={editChallengeLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[rgba(122,156,192,0.1)] border border-[rgba(122,156,192,0.3)] text-txt-secondary font-mono text-sm hover:bg-[rgba(122,156,192,0.2)] disabled:opacity-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>);
}
