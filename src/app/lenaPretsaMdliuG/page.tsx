'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Activity, LogOut,
  BarChart3, Ban, CheckCircle, Trash2,
  Settings, Bell, RefreshCw,
  Loader2, Menu, X,
  Lock, Plus, Pencil, KeyRound,
  Search, FileText, AlertTriangle, Flag,
  Flame, Target, Radio, Eye, EyeOff,

} from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

type AdminTab =
  | 'dashboard' | 'users' | 'announcements' | 'logs' | 'security' | 'settings' | 'realflags'
  | 'warmups' | 'challenges' | 'live';

const tabs: { id: AdminTab; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'announcements', label: 'Announcements', icon: Bell },
  { id: 'logs', label: 'Logs', icon: Activity },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'realflags', label: 'Secret Flags', icon: Flag },
  { id: 'warmups', label: 'Warmup Challenges', icon: Flame },
  { id: 'challenges', label: 'Challenges', icon: Target },
  { id: 'live', label: 'Live Control', icon: Radio },
  { id: 'settings', label: 'Settings', icon: Settings },
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
  const [logs, setLogs] = useState<any[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  const [editAnnouncementTitle, setEditAnnouncementTitle] = useState('');
  const [editAnnouncementMsg, setEditAnnouncementMsg] = useState('');

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
  const [securityBlockIp, setSecurityBlockIp] = useState('');
  const [securityFilterSeverity, setSecurityFilterSeverity] = useState('');
  const [securityFilterType, setSecurityFilterType] = useState('');
  const [securityFeatures, setSecurityFeatures] = useState<Record<string, boolean>>({});
  const [featureToggling, setFeatureToggling] = useState<string | null>(null);
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [realFlags, setRealFlags] = useState<any[]>([]);
  const [realFlagForm, setRealFlagForm] = useState({ challenge_name: '', flag: '', category: '', notes: '' });
  const [editRealFlag, setEditRealFlag] = useState<any>(null);
  const [editRealFlagForm, setEditRealFlagForm] = useState({ challenge_name: '', flag: '', category: '', notes: '' });

  const [warmupChallenges, setWarmupChallenges] = useState<any[]>([]);
  const [allChallenges, setAllChallenges] = useState<any[]>([]);
  const [challengeForm, setChallengeForm] = useState({ title: '', description: '', category: '', points: '100', flag: '', hint: '', files: '', difficulty: '' });
  const [editChallenge, setEditChallenge] = useState<any>(null);
  const [editChallengeForm, setEditChallengeForm] = useState({ title: '', description: '', category: '', points: '100', flag: '', hint: '', files: '', difficulty: '', published: false });

  const [liveCategories, setLiveCategories] = useState<{ category: string; total: number; published: number; unpublished: number }[]>([]);
  const [publishingCat, setPublishingCat] = useState<string | null>(null);

  const tryAutoLogin = async () => {
    try {
      const me = await api.getMe();
      if (me.role === 'admin') {
        useStore.getState().setAuth(me);
        setAuthenticated(true);
        setAuthChecking(false);
        try {
          const csrfData = await api.getCsrfToken();
          useStore.getState().setCsrfToken(csrfData.csrf_token);
        } catch { console.warn('[Admin] Failed to fetch CSRF token'); }
        connectAdminWs();
        return;
      }
    } catch { /* not authed */ }
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
      localStorage.removeItem('user');
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

  useEffect(() => {
    if (authenticated && activeTab === 'dashboard' && !dashboard) {
      loadTabData('dashboard');
    }
  }, [authenticated]);

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
      try {
        const csrfData = await api.getCsrfToken();
        useStore.getState().setCsrfToken(csrfData.csrf_token);
      } catch {}
      toast.success('Welcome, GuildMaster!');
      connectAdminWs();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Connection failed';
      toast.error(msg);
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
        case 'warmups':
          setWarmupChallenges(await api.getChallenges());
          break;
        case 'challenges':
          setAllChallenges(await api.getChallenges());
          break;
        case 'live': {
          const all = await api.getChallenges();
          const cats = new Map<string, { total: number; published: number; unpublished: number }>();
          for (const c of all) {
            if (!cats.has(c.category)) cats.set(c.category, { total: 0, published: 0, unpublished: 0 });
            const entry = cats.get(c.category)!;
            entry.total++;
            if (c.published) entry.published++;
            else entry.unpublished++;
          }
          setLiveCategories(Array.from(cats.entries()).map(([category, counts]) => ({ category, ...counts })));
          setAllChallenges(all);
          break;
        }
      }
    } catch (err: any) {
      toast.error(`Failed to load ${tab} data`);
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

  const handleApprove = async (userId: number) => {
    try { await api.approveUser(userId); toast.success('User approved'); loadTabData('users'); }
    catch { toast.error('Failed to approve user'); }
  };

  const handleApproveAll = async () => {
    try {
      const result = await api.approveAllUsers();
      toast.success(result.detail || 'All pending users approved');
      loadTabData('users');
    } catch { toast.error('Failed to approve users'); }
  };

  const handleLogout = async () => {
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    setAuthenticated(false);
    await useStore.getState().logout();
    window.location.href = '/login';
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
        document.cookie = `access_token=${data.access_token}; path=/; max-age=999999; SameSite=Strict${window.location.protocol === 'https:' ? '; Secure' : ''}`;
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <Loader2 className="w-8 h-8 text-[var(--aurora-cyan)] animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex bg-[var(--bg-base)]">
        <div className="hidden lg:flex lg:w-[45%] relative flex-col items-center justify-center p-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-base)] to-[var(--bg-elevated)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-[var(--aurora-violet)] to-transparent opacity-40" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-[var(--aurora-cyan)] to-transparent opacity-40" />
          <div className="relative z-10 text-center max-w-sm">
            <img src="/images/logo.png" alt="CGS" className="w-20 h-20 mx-auto mb-6 object-contain" />
            <h2 className="font-display text-3xl font-bold text-txt-primary mb-3 tracking-tight">CGS CTF Platform</h2>
            <p className="text-txt-muted font-mono text-sm mb-8 leading-relaxed">Command & Control Center — Restricted Access</p>
            <div className="space-y-3 text-left">
              {[
                { icon: Shield, text: 'Real-time threat monitoring & WAF' },
                { icon: Users, text: 'User management & access control' },
                { icon: Activity, text: 'System logs & announcements' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]">
                  <item.icon className="w-4 h-4 text-[var(--aurora-cyan)] flex-shrink-0" />
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
                <Shield className="w-5 h-5 text-[var(--aurora-violet)]" />
                <h1 className="font-display text-xl font-bold text-txt-primary">Admin Access</h1>
              </div>
              <p className="text-txt-muted font-mono text-sm">Authenticate to access the control center</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-txt-secondary font-mono text-xs mb-2 uppercase tracking-wider">Secret Key</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
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
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
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
                className="w-full py-3 rounded-lg bg-[var(--aurora-violet)] text-white font-display font-semibold text-sm uppercase tracking-widest hover:bg-[var(--aurora-violet)] hover:shadow-[0_0_20px_rgba(124,92,255,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {authChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {authChecking ? 'Authenticating...' : 'Authenticate'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[var(--border)]">
              <button onClick={() => router.push('/login')} className="w-full py-2.5 rounded-lg bg-transparent border border-[var(--aurora-cyan)] text-[var(--aurora-cyan)] font-display font-semibold text-sm uppercase tracking-wider hover:bg-[rgba(34,211,238,0.1)] transition-all flex items-center justify-center gap-2">
                Back to User Login
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (<div className="bg-[var(--bg-base)] min-h-screen">
    <div className="py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            className="relative p-2 text-txt-secondary hover:text-[var(--aurora-cyan)] transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(34,211,238,0.5)] rounded-lg group"
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
          <button onClick={handleLogout} className="p-2 text-txt-secondary hover:text-[var(--aurora-violet)] transition-colors rounded-lg hover:bg-[rgba(124,92,255,0.05)]" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4 lg:gap-6 relative">
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

          <nav
            className={`
              ${sidebarVisible ? 'lg:w-56' : 'lg:w-0 lg:overflow-hidden'}
              lg:relative lg:flex-shrink-0 lg:transition-[width] lg:duration-300 lg:ease-in-out
              lg:bg-transparent lg:border-0
              fixed lg:static inset-y-0 left-0 z-50
              bg-[#0A0C14] border-r border-[rgba(34,211,238,0.08)]
              overflow-y-auto overflow-x-hidden
              transition-all duration-300 ease-in-out
              ${sidebarVisible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              ${sidebarVisible ? 'shadow-[2px_0_30px_rgba(0,0,0,0.5)]' : ''}
            `}
          >
            <div className={`w-56 lg:w-full flex flex-col h-full ${sidebarVisible ? '' : 'lg:hidden'}`}>
              <div className="p-4 border-b border-[rgba(34,211,238,0.06)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--aurora-cyan)]/20 to-[var(--aurora-violet)]/20 border border-[var(--aurora-cyan)]/20 flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-[var(--aurora-cyan)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-display text-txt-primary truncate">GuildMaster</p>
                    <p className="text-[10px] font-mono text-txt-muted truncate">Admin Panel</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { handleTabChange(tab.id); if (window.innerWidth < 1024) setSidebarVisible(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-xs transition-all duration-200 text-left ${
                        activeTab === tab.id
                          ? 'bg-[rgba(34,211,238,0.1)] text-[var(--aurora-cyan)] border border-[rgba(34,211,238,0.2)] shadow-[0_0_12px_rgba(34,211,238,0.08)]'
                          : 'text-txt-muted hover:text-txt-secondary hover:bg-[rgba(34,211,238,0.04)] border border-transparent'
                      }`}
                      title={tab.label}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="p-3 border-t border-[rgba(34,211,238,0.06)]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-xs text-txt-muted hover:text-[#FF5C72] hover:bg-[rgba(255,92,114,0.06)] border border-transparent transition-all duration-200 text-left"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span className="truncate">Sign Out</span>
                </button>
              </div>
            </div>
          </nav>

          <div className="flex-1 min-w-0 transition-all duration-300">
            {tabLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[var(--aurora-cyan)] animate-spin" />
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          {[
                            { label: 'Users', value: dashboard.total_users, icon: Users, color: 'var(--aurora-cyan)' },
                            { label: 'Suspicious Logs', value: dashboard.suspicious_logs, icon: Activity, color: 'var(--aurora-violet)' },
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
                      <div className="card rounded-xl p-6 border border-[rgba(124,92,255,0.2)]">
                        <div className="flex items-center gap-2 mb-5">
                          <AlertTriangle className="w-5 h-5 text-[var(--aurora-violet)]" />
                          <h3 className="font-display text-txt-primary text-lg">Admin Actions</h3>
                        </div>

                        <div>
                          <h4 className="font-display text-txt-secondary text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Search className="w-3 h-3" /> Audit &amp; Security Checks
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={async () => {
                              if (!confirm('Invalidate ALL sessions? All users will need to login again.')) return;
                              try { await api.invalidateAllSessions(); toast.success('All sessions invalidated'); }
                              catch { toast.error('Failed to invalidate sessions'); }
                            }} className="px-4 py-2 rounded-lg bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] font-mono text-xs hover:bg-[rgba(34,211,238,0.2)] transition-all flex items-center gap-1">
                              <RefreshCw className="w-3 h-3" /> Invalidate All Sessions
                            </button>
                            <button onClick={async () => {
                              try {
                                const t = await api.getCsrfToken(); useStore.getState().setCsrfToken(t.csrf_token);
                                const res = await fetch('/api/admin/security/integrity-check');
                                const data = await res.json();
                                toast.success(data.message || 'Chain integrity check complete');
                              } catch { toast.error('Integrity check failed'); }
                            }} className="px-4 py-2 rounded-lg bg-[rgba(52,232,158,0.1)] border border-[rgba(52,232,158,0.3)] text-[var(--aurora-emerald)] font-mono text-xs hover:bg-[rgba(52,232,158,0.2)] transition-all flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Check Chain Integrity
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
                        {users.some((u: any) => u.status === 'pending') && (
                          <button onClick={handleApproveAll} className="px-3 py-1.5 rounded-lg bg-[rgba(52,232,158,0.1)] border border-[rgba(52,232,158,0.3)] text-[var(--aurora-emerald)] font-mono text-xs hover:bg-[rgba(52,232,158,0.2)] transition-all flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Approve All ({users.filter((u: any) => u.status === 'pending').length} pending)
                          </button>
                        )}
                      </div>
                      <div className="overflow-x-auto">
                      <table className="w-full text-left admin-table">
                        <thead>
                          <tr className="text-txt-secondary font-mono text-xs uppercase tracking-wider border-b border-[rgba(34,211,238,0.1)]">
                            <th className="p-3">Username</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Score</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u: any) => (
                            <tr key={u.id} className="border-b border-[rgba(34,211,238,0.05)] hover:bg-[rgba(34,211,238,0.05)] transition-colors">
                              <td className="p-3 font-mono text-sm text-txt-primary flex items-center gap-2">
                                {u.avatar_url && (
                                  <img src={u.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                                )}
                                {u.username}
                              </td>
                              <td className="p-3 font-mono text-xs text-txt-secondary">{u.email}</td>
                              <td className="p-3 font-mono text-sm text-[var(--aurora-emerald)]">{u.score}</td>
                              <td className="p-3">
                                {u.is_banned ? (
                                  <span className="text-xs font-mono text-[var(--aurora-violet)]">Banned</span>
                                ) : u.status === 'active' ? (
                                  <span className="text-xs font-mono text-[var(--aurora-emerald)]">Active</span>
                                ) : (
                                  <span className="text-xs font-mono text-txt-muted">{u.status}</span>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {u.status === 'pending' && (
                                    <button onClick={() => handleApprove(u.id)} className="p-1.5 rounded-lg bg-[rgba(52,232,158,0.1)] text-[var(--aurora-emerald)] hover:bg-[rgba(52,232,158,0.2)] transition-all" title="Approve User">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {!u.is_banned ? (
                                    <button onClick={() => handleBan(u.id)} className="p-1.5 rounded-lg bg-[rgba(124,92,255,0.1)] text-[var(--aurora-violet)] hover:bg-[rgba(124,92,255,0.2)] transition-all" title="Ban">
                                      <Ban className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <button onClick={() => handleUnban(u.id)} className="p-1.5 rounded-lg bg-[rgba(52,232,158,0.1)] text-[var(--aurora-emerald)] hover:bg-[rgba(52,232,158,0.2)] transition-all" title="Unban">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button onClick={() => { setUsernameModal({ userId: u.id, username: u.username }); setUsernameModalValue(''); }} className="p-1.5 rounded-lg bg-[rgba(34,211,238,0.1)] text-[var(--aurora-cyan)] hover:bg-[rgba(34,211,238,0.2)] transition-all" title="Edit Username">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => { setPasswordModal({ userId: u.id, username: u.username }); setPasswordModalValue(''); }} className="p-1.5 rounded-lg bg-[rgba(34,211,238,0.1)] text-[var(--aurora-cyan)] hover:bg-[rgba(34,211,238,0.2)] transition-all" title="Change Password">
                                    <KeyRound className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteUser(u.id, u.username)} className="p-1.5 rounded-lg bg-[rgba(124,92,255,0.1)] text-[var(--aurora-violet)] hover:bg-[rgba(124,92,255,0.2)] transition-all" title="Delete">
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

                  {activeTab === 'announcements' && (
                    <div className="space-y-6">
                      <div className="card rounded-xl p-6">
                        <h3 className="font-display text-txt-primary mb-4 flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[var(--signal-amber)]" />
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
                          <button type="submit" className="admin-action-btn px-6 py-3 rounded-xl bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] font-mono text-sm hover:bg-[rgba(34,211,238,0.2)] transition-all flex items-center gap-2">
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
                                      <button onClick={handleSaveEditAnnouncement} className="admin-action-btn px-4 py-2 rounded-lg bg-[rgba(52,232,158,0.1)] border border-[rgba(52,232,158,0.3)] text-[var(--aurora-emerald)] font-mono text-xs hover:bg-[rgba(52,232,158,0.2)] transition-all">
                                        Save
                                      </button>
                                      <button onClick={() => setEditingAnnouncement(null)} className="admin-action-btn px-4 py-2 rounded-lg bg-[rgba(155,164,178,0.1)] border border-[rgba(155,164,178,0.3)] text-txt-secondary font-mono text-xs hover:bg-[rgba(155,164,178,0.2)] transition-all">
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
                                    className="p-2 rounded-lg bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] hover:bg-[rgba(34,211,238,0.2)] transition-all"
                                    title="Edit"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAnnouncement(a.id)}
                                    className="p-2 rounded-lg bg-[rgba(124,92,255,0.1)] border border-[rgba(124,92,255,0.3)] text-[var(--aurora-violet)] hover:bg-[rgba(124,92,255,0.2)] transition-all"
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
                          <Activity className="w-5 h-5 text-[var(--aurora-cyan)]" /> System Logs
                        </h3>
                        <button onClick={async () => {
                          if (!confirm('Clear all system logs? This cannot be undone.')) return;
                          try { const t = await api.getCsrfToken(); useStore.getState().setCsrfToken(t.csrf_token); await api.clearLogs(); toast.success('All logs cleared'); loadTabData('logs'); }
                          catch { toast.error('Failed to clear logs'); }
                        }} className="admin-action-btn px-4 py-2 rounded-lg bg-[rgba(124,92,255,0.1)] border border-[rgba(124,92,255,0.3)] text-[var(--aurora-violet)] text-xs font-mono hover:bg-[rgba(124,92,255,0.2)] transition-all flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Clear Logs
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left admin-table">
                          <thead>
                            <tr className="text-txt-secondary font-mono text-xs uppercase tracking-wider border-b border-[rgba(34,211,238,0.1)]">
                              <th className="p-3">ID</th>
                              <th className="p-3">Action</th>
                              <th className="p-3">Severity</th>
                              <th className="p-3">IP</th>
                              <th className="p-3">Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {logs.map((log: any) => (
                              <tr key={log.id} className="border-b border-[rgba(34,211,238,0.05)] hover:bg-[rgba(34,211,238,0.05)] transition-colors">
                                <td className="p-3 font-mono text-xs text-txt-muted">{log.id}</td>
                                <td className="p-3 font-mono text-xs text-txt-primary">{log.action}</td>
                                <td className="p-3">
                                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                                    log.severity === 'suspicious' ? 'bg-[rgba(124,92,255,0.1)] text-[var(--aurora-violet)]' :
                                    log.severity === 'info' ? 'bg-[rgba(34,211,238,0.1)] text-[var(--aurora-cyan)]' :
                                    'bg-[rgba(155,164,178,0.1)] text-txt-secondary'
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

                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      {liveAlerts.length > 0 && (
                        <div className="card rounded-xl p-3 border-[rgba(124,92,255,0.5)] bg-[rgba(124,92,255,0.1)]">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-display text-xs text-[var(--aurora-violet)] flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-pulse" /> LIVE ATTACKS {wsConnected ? '(Connected)' : '(Reconnecting...)'}
                            </h4>
                            <button onClick={() => setLiveAlerts([])} className="text-txt-muted hover:text-txt-primary text-xs">Dismiss alerts</button>
                          </div>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            <AnimatePresence>
                              {liveAlerts.slice(0, 5).map((alert: any) => (
                                <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-xs font-mono">
                                  <span className="text-[var(--aurora-violet)]">▶</span>
                                  <span className="text-[#FF8C00] w-20 truncate">{alert.attack_type}</span>
                                  <span className="text-txt-secondary">{alert.ip}</span>
                                  <span className="text-[var(--signal-amber)]">{alert.risk_score}</span>
                                  <span className="text-txt-muted w-32 truncate">{alert.endpoint}</span>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg text-txt-primary flex items-center gap-2">
                          <Shield className="w-5 h-5 text-[var(--aurora-violet)]" /> Security Dashboard
                        </h3>
                        <button onClick={() => { loadTabData('security'); }}
                          className="admin-action-btn px-3 py-1.5 rounded-lg border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] text-xs hover:bg-[rgba(34,211,238,0.1)] transition-all flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" /> Refresh
                        </button>
                      </div>

                      <div className="card rounded-xl p-4 mb-4">
                        <h4 className="font-display text-sm text-txt-primary mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[var(--aurora-violet)]" /> Security Features
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
                              <div key={key} className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${enabled ? 'bg-[rgba(52,232,158,0.05)] border-[rgba(52,232,158,0.25)]' : 'bg-[rgba(124,92,255,0.05)] border-[rgba(124,92,255,0.25)]'}`}>
                                <span className={`text-xs font-mono ${enabled ? 'text-[var(--aurora-emerald)]' : 'text-[var(--aurora-violet)]'}`}>{label}</span>
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
                                  className={`ml-2 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${enabled ? 'bg-[rgba(124,92,255,0.2)] text-[var(--aurora-violet)] hover:bg-[rgba(124,92,255,0.3)]' : 'bg-[rgba(52,232,158,0.2)] text-[var(--aurora-emerald)] hover:bg-[rgba(52,232,158,0.3)]'} ${featureToggling === key ? 'opacity-50 cursor-wait' : ''}`}
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
                          <div className="card rounded-xl p-4 text-center border-[rgba(124,92,255,0.3)]">
                            <div className="text-2xl font-display font-bold text-[var(--aurora-violet)]">{securityStatsData.total_attacks}</div>
                            <div className="text-txt-muted text-xs mt-1">Total Attacks</div>
                          </div>
                          <div className="card rounded-xl p-4 text-center border-[rgba(124,92,255,0.3)]">
                            <div className="text-2xl font-display font-bold text-[#FF8C00]">{securityStatsData.high_count + securityStatsData.critical_count}</div>
                            <div className="text-txt-muted text-xs mt-1">Critical/High</div>
                          </div>
                          <div className="card rounded-xl p-4 text-center border-[rgba(34,211,238,0.3)]">
                            <div className="text-2xl font-display font-bold text-[var(--aurora-cyan)]">{securityStatsData.blocked_count}</div>
                            <div className="text-txt-muted text-xs mt-1">Blocked</div>
                          </div>
                          <div className="card rounded-xl p-4 text-center border-[rgba(255,176,32,0.3)]">
                            <div className="text-2xl font-display font-bold text-[var(--signal-amber)]">{securityStatsData.unique_ips}</div>
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
                                <span className="text-[var(--aurora-violet)] text-xs font-mono w-32 truncate">{t.type || 'unknown'}</span>
                                <div className="flex-1 bg-[#0a0f18]/50 rounded-full h-2">
                                  <div className="bg-[rgba(124,92,255,0.6)] h-2 rounded-full" style={{ width: `${Math.min(100, (t.count / (securityStatsData.total_attacks || 1)) * 100)}%` }} />
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
                              <div className="text-[var(--aurora-violet)] font-mono">{securitySettingsData.blacklisted_ips?.length || 0}</div>
                            </div>
                            <div>
                              <span className="text-txt-muted">Whitelisted IPs</span>
                              <div className="text-[var(--aurora-emerald)] font-mono">{securitySettingsData.whitelisted_ips?.length || 0}</div>
                            </div>
                            <div>
                              <span className="text-txt-muted">Active Quarantines</span>
                              <div className="text-[#FF8C00] font-mono">{securitySettingsData.active_quarantines || 0}</div>
                            </div>
                            <div>
                              <span className="text-txt-muted">Chain Integrity</span>
                              <div className="text-[var(--aurora-cyan)] font-mono">Active</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="card rounded-xl p-4">
                        <h4 className="font-display text-sm text-txt-primary mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[var(--aurora-cyan)]" /> Block IP
                        </h4>
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
                          }} className="admin-action-btn px-4 py-2 rounded-lg bg-[rgba(124,92,255,0.1)] border border-[rgba(124,92,255,0.3)] text-[var(--aurora-violet)] text-xs font-mono hover:bg-[rgba(124,92,255,0.2)] transition-all">
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
                          className="admin-action-btn px-3 py-1.5 rounded-lg border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] text-xs hover:bg-[rgba(34,211,238,0.1)] transition-all">
                          <RefreshCw className="w-3 h-3 inline mr-1" /> Filter
                        </button>
                        <button onClick={async () => {
                          if (!confirm('Clear ALL attack detection results? This cannot be undone.')) return;
                          try { const t = await api.getCsrfToken(); useStore.getState().setCsrfToken(t.csrf_token); await api.clearSecurityLogs(); toast.success('All detection results cleared'); loadTabData('security'); }
                          catch { toast.error('Failed to clear detection results'); }
                        }} className="admin-action-btn px-3 py-1.5 rounded-lg bg-[rgba(124,92,255,0.1)] border border-[rgba(124,92,255,0.3)] text-[var(--aurora-violet)] text-xs font-mono hover:bg-[rgba(124,92,255,0.2)] transition-all flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Clear All Detection Results
                        </button>
                      </div>

                      <div className="card rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-[rgba(34,211,238,0.1)]">
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
                                <tr key={log.id} className="border-b border-[rgba(34,211,238,0.05)] hover:bg-[rgba(34,211,238,0.05)] transition-colors">
                                  <td className="p-3 text-txt-secondary font-mono whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                                  <td className="p-3">
                                    <span className="font-mono text-[var(--aurora-cyan)]">{log.attack_type}</span>
                                  </td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                                      log.severity === 'critical' ? 'bg-[rgba(124,92,255,0.2)] text-[var(--aurora-violet)]' :
                                      log.severity === 'high' ? 'bg-[rgba(255,140,0,0.2)] text-[#FF8C00]' :
                                      log.severity === 'medium' ? 'bg-[rgba(255,176,32,0.2)] text-[var(--signal-amber)]' :
                                      'bg-[rgba(155,164,178,0.2)] text-txt-secondary'
                                    }`}>{log.severity}</span>
                                  </td>
                                  <td className="p-3 font-mono text-txt-secondary">{log.ip_address}</td>
                                  <td className="p-3">
                                    <span className={`font-mono ${
                                      log.risk_score >= 9 ? 'text-[var(--aurora-violet)]' :
                                      log.risk_score >= 7 ? 'text-[#FF8C00]' :
                                      log.risk_score >= 5 ? 'text-[var(--signal-amber)]' : 'text-txt-secondary'
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
                                        }} className="px-2 py-0.5 rounded text-xs border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] hover:bg-[rgba(34,211,238,0.1)] transition-all">Review</button>
                                      ) : (
                                        <span className="text-[var(--aurora-emerald)] text-xs font-mono">✓ Reviewed</span>
                                      )}
                                      {log.blocked ? (
                                        <button onClick={async () => {
                                          await api.unblockIp(log.ip_address);
                                          toast.success(`Unblocked ${log.ip_address}`);
                                          loadTabData('security');
                                        }} className="px-2 py-0.5 rounded text-xs border border-[rgba(52,232,158,0.3)] text-[var(--aurora-emerald)] hover:bg-[rgba(52,232,158,0.1)] transition-all">Unblock</button>
                                      ) : null}
                                      <button onClick={async () => {
                                        await api.blockIp(log.ip_address, 'Attack log action');
                                        toast.success(`Blocked ${log.ip_address}`);
                                        loadTabData('security');
                                      }} className="px-2 py-0.5 rounded text-xs border border-[rgba(124,92,255,0.3)] text-[var(--aurora-violet)] hover:bg-[rgba(124,92,255,0.1)] transition-all">Block</button>
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
                      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                        <h3 className="font-display text-lg text-txt-primary flex items-center gap-2">
                          <Flag className="w-5 h-5 text-[var(--aurora-cyan)]" /> Secret Flag Management
                        </h3>
                        {realFlags.length > 0 && (
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete ALL ${realFlags.length} secret flags? This cannot be undone.`)) return;
                              try { const t = await api.getCsrfToken(); useStore.getState().setCsrfToken(t.csrf_token); const r = await api.deleteAllRealFlags(); toast.success(r.message); loadTabData('realflags'); }
                              catch { toast.error('Failed to delete all flags'); }
                            }}
                            className="px-4 py-2 rounded-lg bg-[rgba(124,92,255,0.15)] border border-[rgba(124,92,255,0.4)] text-[var(--aurora-violet)] font-mono text-xs hover:bg-[rgba(124,92,255,0.25)] transition-all flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete All ({realFlags.length})
                          </button>
                        )}
                      </div>

                      <div className="card rounded-xl p-5 sm:p-6">
                        <h4 className="font-display text-txt-primary text-sm mb-5 flex items-center gap-2 border-b border-[rgba(34,211,238,0.1)] pb-3">
                          <Plus className="w-4 h-4 text-[var(--aurora-emerald)]" /> Store Secret Flag
                        </h4>
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
                            <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Name / Identifier</label>
                            <input type="text" value={realFlagForm.challenge_name} onChange={(e) => setRealFlagForm({ ...realFlagForm, challenge_name: e.target.value })}
                              placeholder="Enter challenge name or identifier" className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Secret Flag</label>
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
                          <button type="submit" className="sm:col-span-2 mt-1 px-6 py-2.5 rounded-xl bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] font-mono text-sm hover:bg-[rgba(34,211,238,0.2)] transition-all flex items-center justify-center gap-2">
                            <Lock className="w-4 h-4" /> Store Flag
                          </button>
                        </form>
                      </div>

                      <div className="card rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-txt-muted font-mono text-[11px] uppercase tracking-wider border-b border-[rgba(34,211,238,0.1)] bg-black/20">
                                <th className="p-3 pl-5 font-medium">ID</th>
                                <th className="p-3 font-medium">Name</th>
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
                                <tr key={f.id} className="border-b border-[rgba(34,211,238,0.05)] hover:bg-[rgba(34,211,238,0.03)] transition-colors">
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
                                          }} className="p-1.5 rounded-lg bg-[rgba(52,232,158,0.1)] text-[var(--aurora-emerald)] hover:bg-[rgba(52,232,158,0.2)] transition-all" title="Save">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => setEditRealFlag(null)} className="p-1.5 rounded-lg bg-[rgba(155,164,178,0.1)] text-txt-secondary hover:bg-[rgba(155,164,178,0.2)] transition-all" title="Cancel">
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
                                            className="p-1.5 rounded-lg bg-[rgba(34,211,238,0.1)] text-[var(--aurora-cyan)] hover:bg-[rgba(34,211,238,0.2)] transition-all" title="Edit">
                                            <Pencil className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={async () => {
                                            if (!confirm(`Delete flag for "${f.challenge_name}"?`)) return;
                                            try { await api.deleteRealFlag(f.id); toast.success('Deleted'); loadTabData('realflags'); }
                                            catch { toast.error('Failed'); }
                                          }} className="p-1.5 rounded-lg bg-[rgba(124,92,255,0.1)] text-[var(--aurora-violet)] hover:bg-[rgba(124,92,255,0.2)] transition-all" title="Delete">
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

                  {activeTab === 'warmups' && (() => {
                    const webChallenges = warmupChallenges.filter((c: any) => c.category === 'web');
                    return (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <h3 className="font-display text-lg text-txt-primary flex items-center gap-2">
                          <Flame className="w-5 h-5 text-[var(--aurora-emerald)]" /> Web Challenges
                        </h3>
                        <div className="flex gap-2">
                          <button onClick={async () => {
                            try {
                              const webChallenges = warmupChallenges.filter((c: any) => c.category === 'web');
                              for (const c of webChallenges) {
                                if (!c.published) await api.updateChallenge(c.id, { published: true });
                              }
                              toast.success(`Published all ${webChallenges.length} web challenges`);
                              loadTabData('warmups');
                            } catch { toast.error('Failed to publish web challenges'); }
                          }} className="px-4 py-2 rounded-lg bg-[rgba(52,232,158,0.12)] border border-[rgba(52,232,158,0.3)] text-[var(--aurora-emerald)] font-mono text-xs hover:bg-[rgba(52,232,158,0.2)] transition-all flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" /> Publish All Web
                          </button>
                          <button onClick={() => { setChallengeForm({ title: '', description: '', category: 'web', points: '100', flag: '', hint: '', files: '', difficulty: '' }); setEditChallenge({ _new: true } as any); }}
                            className="px-4 py-2 rounded-lg bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] font-mono text-xs hover:bg-[rgba(34,211,238,0.2)] transition-all flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5" /> New Web Challenge
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap text-xs font-mono text-txt-muted px-1">
                        <span>Total: <strong className="text-txt-primary">{webChallenges.length}</strong></span>
                        <span>Live: <strong className="text-[var(--aurora-emerald)]">{webChallenges.filter((c: any) => c.published).length}</strong></span>
                        <span>Draft: <strong className="text-[#FF4500]">{webChallenges.filter((c: any) => !c.published).length}</strong></span>
                      </div>

                      {editChallenge?._new && (
                        <div className="card rounded-xl p-5 sm:p-6">
                          <h4 className="font-display text-txt-primary text-sm mb-5 flex items-center gap-2 border-b border-[rgba(34,211,238,0.1)] pb-3">
                            <Plus className="w-4 h-4 text-[var(--aurora-emerald)]" /> Create Web Challenge
                          </h4>
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                              await api.createChallenge(challengeForm);
                              toast.success('Challenge created!');
                              setEditChallenge(null);
                              setChallengeForm({ title: '', description: '', category: 'web', points: '100', flag: '', hint: '', files: '', difficulty: '' });
                              loadTabData('warmups');
                            } catch { toast.error('Failed to create'); }
                          }} className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5">
                            <div>
                              <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Title</label>
                              <input type="text" value={challengeForm.title} onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
                            </div>
                            <div>
                              <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Points</label>
                              <input type="number" value={challengeForm.points} onChange={(e) => setChallengeForm({ ...challengeForm, points: e.target.value })} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Description</label>
                              <textarea value={challengeForm.description} onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })} rows={3} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Flag</label>
                              <textarea value={challengeForm.flag} onChange={(e) => setChallengeForm({ ...challengeForm, flag: e.target.value })} rows={2} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
                            </div>
                            <div>
                              <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Hint</label>
                              <input type="text" value={challengeForm.hint} onChange={(e) => setChallengeForm({ ...challengeForm, hint: e.target.value })} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
                            </div>
                            <div>
                              <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Difficulty</label>
                              <select value={challengeForm.difficulty} onChange={(e) => setChallengeForm({ ...challengeForm, difficulty: e.target.value })} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm">
                                <option value="">Any</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Files (JSON array of URLs)</label>
                              <input type="text" value={challengeForm.files} onChange={(e) => setChallengeForm({ ...challengeForm, files: e.target.value })} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
                            </div>
                            <div className="sm:col-span-2 flex gap-3">
                              <button type="submit" className="px-6 py-2.5 rounded-xl bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] font-mono text-sm hover:bg-[rgba(34,211,238,0.2)] transition-all flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Create Challenge
                              </button>
                              <button type="button" onClick={() => setEditChallenge(null)} className="px-6 py-2.5 rounded-xl bg-[rgba(155,164,178,0.1)] border border-[rgba(155,164,178,0.3)] text-txt-secondary font-mono text-sm hover:bg-[rgba(155,164,178,0.2)] transition-all">Cancel</button>
                            </div>
                          </form>
                        </div>
                      )}

                      <div className="card rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-txt-muted font-mono text-[11px] uppercase tracking-wider border-b border-[rgba(34,211,238,0.1)] bg-black/20">
                                <th className="p-3 pl-5 font-medium">ID</th>
                                <th className="p-3 font-medium">Title</th>
                                <th className="p-3 font-medium">Category</th>
                                <th className="p-3 font-medium">Points</th>
                                <th className="p-3 font-medium">Difficulty</th>
                                <th className="p-3 font-medium">Status</th>
                                <th className="p-3 pr-5 font-medium text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {webChallenges.length === 0 ? (
                                <tr><td colSpan={7} className="p-10 text-center text-txt-muted font-mono text-sm">No web challenges yet</td></tr>
                              ) : webChallenges.map((c: any) => (
                                <tr key={c.id} className="border-b border-[rgba(34,211,238,0.05)] hover:bg-[rgba(34,211,238,0.03)] transition-colors">
                                  {editChallenge?.id === c.id ? (
                                    <>
                                      <td className="p-3 pl-5 font-mono text-xs text-txt-muted align-top pt-4">{c.id}</td>
                                      <td className="p-3"><input type="text" value={editChallengeForm.title} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, title: e.target.value })} className="input-field w-full px-2.5 py-1.5 rounded font-mono text-xs" /></td>
                                      <td className="p-3"><input type="text" value={editChallengeForm.category} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, category: e.target.value })} className="input-field w-24 px-2.5 py-1.5 rounded font-mono text-xs" /></td>
                                      <td className="p-3"><input type="number" value={editChallengeForm.points} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, points: e.target.value })} className="input-field w-20 px-2.5 py-1.5 rounded font-mono text-xs" /></td>
                                      <td className="p-3">
                                        <select value={editChallengeForm.difficulty} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, difficulty: e.target.value })} className="input-field px-2.5 py-1.5 rounded font-mono text-xs">
                                          <option value="">Any</option>
                                          <option value="easy">Easy</option>
                                          <option value="medium">Medium</option>
                                          <option value="hard">Hard</option>
                                        </select>
                                      </td>
                                      <td className="p-3">
                                        <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                                          <input type="checkbox" checked={editChallengeForm.published} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, published: e.target.checked })} className="rounded border-[rgba(34,211,238,0.3)]" />
                                          <span className={editChallengeForm.published ? 'text-[var(--aurora-emerald)]' : 'text-txt-muted'}>{editChallengeForm.published ? 'Published' : 'Draft'}</span>
                                        </label>
                                      </td>
                                      <td className="p-3 pr-5 align-top pt-4">
                                        <div className="flex gap-1.5 justify-end">
                                          <button onClick={async () => {
                                            try { await api.updateChallenge(c.id, editChallengeForm); toast.success('Updated'); setEditChallenge(null); loadTabData('warmups'); }
                                            catch { toast.error('Failed'); }
                                          }} className="p-1.5 rounded-lg bg-[rgba(52,232,158,0.1)] text-[var(--aurora-emerald)] hover:bg-[rgba(52,232,158,0.2)] transition-all" title="Save">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => setEditChallenge(null)} className="p-1.5 rounded-lg bg-[rgba(155,164,178,0.1)] text-txt-secondary hover:bg-[rgba(155,164,178,0.2)] transition-all" title="Cancel">
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="p-3 pl-5 font-mono text-xs text-txt-muted">{c.id}</td>
                                      <td className="p-3 font-mono text-sm text-txt-primary font-medium max-w-[220px] truncate" title={c.title}>{c.title}</td>
                                      <td className="p-3"><span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                                        c.category === 'web' ? 'bg-[rgba(34,211,238,0.12)] text-[var(--aurora-cyan)]' :
                                        c.category === 'crypto' ? 'bg-[rgba(52,232,158,0.12)] text-[var(--aurora-emerald)]' :
                                        c.category === 'pwn' ? 'bg-[rgba(255,92,114,0.12)] text-[#FF5C72]' :
                                        'bg-[rgba(124,92,255,0.12)] text-[var(--aurora-violet)]'
                                      }`}>{c.category}</span></td>
                                      <td className="p-3 font-mono text-xs text-txt-secondary">{c.points}</td>
                                      <td className="p-3 font-mono text-xs text-txt-secondary">{c.difficulty || '-'}</td>
                                      <td className="p-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${c.published ? 'bg-[rgba(52,232,158,0.15)] text-[var(--aurora-emerald)]' : 'bg-[rgba(155,164,178,0.15)] text-txt-muted'}`}>
                                          {c.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                          {c.published ? 'Live' : 'Draft'}
                                        </span>
                                      </td>
                                      <td className="p-3 pr-5">
                                        <div className="flex gap-1.5 justify-end">
                                          <button onClick={() => { setEditChallenge(c); setEditChallengeForm({ title: c.title, description: c.description, category: c.category, points: String(c.points), flag: c.flag, hint: c.hint || '', files: c.files || '', difficulty: c.difficulty || '', published: c.published }); }}
                                            className="p-1.5 rounded-lg bg-[rgba(34,211,238,0.1)] text-[var(--aurora-cyan)] hover:bg-[rgba(34,211,238,0.2)] transition-all" title="Edit">
                                            <Pencil className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={async () => {
                                            if (!confirm(`Delete challenge "${c.title}"?`)) return;
                                            try { await api.deleteChallenge(c.id); toast.success('Deleted'); loadTabData('warmups'); }
                                            catch { toast.error('Failed'); }
                                          }} className="p-1.5 rounded-lg bg-[rgba(124,92,255,0.1)] text-[var(--aurora-violet)] hover:bg-[rgba(124,92,255,0.2)] transition-all" title="Delete">
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
                    );
                  })()}

                  {activeTab === 'challenges' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <h3 className="font-display text-lg text-txt-primary flex items-center gap-2">
                          <Target className="w-5 h-5 text-[var(--aurora-cyan)]" /> All Challenges
                          <span className="text-xs font-mono text-txt-muted font-normal">({allChallenges.length} total)</span>
                        </h3>
                        <button onClick={() => { setChallengeForm({ title: '', description: '', category: 'web', points: '100', flag: '', hint: '', files: '', difficulty: '' }); setEditChallenge({ _new: true } as any); }}
                          className="px-4 py-2 rounded-lg bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] font-mono text-xs hover:bg-[rgba(34,211,238,0.2)] transition-all flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" /> New Challenge
                        </button>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap text-xs font-mono text-txt-muted px-1">
                        <span>Total: <strong className="text-txt-primary">{allChallenges.length}</strong></span>
                        <span>Live: <strong className="text-[var(--aurora-emerald)]">{allChallenges.filter((c: any) => c.published).length}</strong></span>
                        <span>Draft: <strong className="text-[#FF4500]">{allChallenges.filter((c: any) => !c.published).length}</strong></span>
                        {Array.from(new Set(allChallenges.map((c: any) => c.category))).map(cat => (
                          <span key={cat} className="text-txt-muted">{cat}: <strong className="text-txt-primary">{allChallenges.filter((c: any) => c.category === cat).length}</strong></span>
                        ))}
                      </div>

                      {editChallenge?._new && (
                        <div className="card rounded-xl p-5 sm:p-6">
                          <h4 className="font-display text-txt-primary text-sm mb-5 flex items-center gap-2 border-b border-[rgba(34,211,238,0.1)] pb-3">
                            <Plus className="w-4 h-4 text-[var(--aurora-emerald)]" /> Create Challenge
                          </h4>
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                              await api.createChallenge(challengeForm);
                              toast.success('Challenge created!');
                              setEditChallenge(null);
                              setChallengeForm({ title: '', description: '', category: 'web', points: '100', flag: '', hint: '', files: '', difficulty: '' });
                              loadTabData('challenges');
                            } catch { toast.error('Failed to create'); }
                          }} className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5">
                            <div>
                              <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Title</label>
                              <input type="text" value={challengeForm.title} onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
                            </div>
                            <div>
                              <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Points</label>
                              <input type="number" value={challengeForm.points} onChange={(e) => setChallengeForm({ ...challengeForm, points: e.target.value })} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
                            </div>
                            <div>
                              <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Category</label>
                              <input type="text" value={challengeForm.category} onChange={(e) => setChallengeForm({ ...challengeForm, category: e.target.value })} placeholder="e.g. web, crypto, pwn..." className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
                            </div>
                            <div>
                              <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Difficulty</label>
                              <select value={challengeForm.difficulty} onChange={(e) => setChallengeForm({ ...challengeForm, difficulty: e.target.value })} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm">
                                <option value="">Any</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Description</label>
                              <textarea value={challengeForm.description} onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })} rows={3} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Flag</label>
                              <textarea value={challengeForm.flag} onChange={(e) => setChallengeForm({ ...challengeForm, flag: e.target.value })} rows={2} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" required />
                            </div>
                            <div>
                              <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Hint</label>
                              <input type="text" value={challengeForm.hint} onChange={(e) => setChallengeForm({ ...challengeForm, hint: e.target.value })} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
                            </div>
                            <div>
                              <label className="block text-txt-muted font-mono text-[10px] mb-1.5 uppercase tracking-wider">Files (JSON)</label>
                              <input type="text" value={challengeForm.files} onChange={(e) => setChallengeForm({ ...challengeForm, files: e.target.value })} className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
                            </div>
                            <div className="sm:col-span-2 flex gap-3">
                              <button type="submit" className="px-6 py-2.5 rounded-xl bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] font-mono text-sm hover:bg-[rgba(34,211,238,0.2)] transition-all flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Create Challenge
                              </button>
                              <button type="button" onClick={() => setEditChallenge(null)} className="px-6 py-2.5 rounded-xl bg-[rgba(155,164,178,0.1)] border border-[rgba(155,164,178,0.3)] text-txt-secondary font-mono text-sm hover:bg-[rgba(155,164,178,0.2)] transition-all">Cancel</button>
                            </div>
                          </form>
                        </div>
                      )}

                      <div className="card rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-txt-muted font-mono text-[11px] uppercase tracking-wider border-b border-[rgba(34,211,238,0.1)] bg-black/20">
                                <th className="p-3 pl-5 font-medium">ID</th>
                                <th className="p-3 font-medium">Title</th>
                                <th className="p-3 font-medium">Category</th>
                                <th className="p-3 font-medium">Points</th>
                                <th className="p-3 font-medium">Difficulty</th>
                                <th className="p-3 font-medium">Status</th>
                                <th className="p-3 pr-5 font-medium text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allChallenges.length === 0 ? (
                                <tr><td colSpan={7} className="p-10 text-center text-txt-muted font-mono text-sm">No challenges yet</td></tr>
                              ) : allChallenges.map((c: any) => (
                                <tr key={c.id} className="border-b border-[rgba(34,211,238,0.05)] hover:bg-[rgba(34,211,238,0.03)] transition-colors">
                                  {editChallenge?.id === c.id ? (
                                    <>
                                      <td className="p-3 pl-5 font-mono text-xs text-txt-muted align-top pt-4">{c.id}</td>
                                      <td className="p-3"><input type="text" value={editChallengeForm.title} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, title: e.target.value })} className="input-field w-full px-2.5 py-1.5 rounded font-mono text-xs" /></td>
                                      <td className="p-3"><input type="text" value={editChallengeForm.category} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, category: e.target.value })} className="input-field w-24 px-2.5 py-1.5 rounded font-mono text-xs" /></td>
                                      <td className="p-3"><input type="number" value={editChallengeForm.points} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, points: e.target.value })} className="input-field w-20 px-2.5 py-1.5 rounded font-mono text-xs" /></td>
                                      <td className="p-3">
                                        <select value={editChallengeForm.difficulty} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, difficulty: e.target.value })} className="input-field px-2.5 py-1.5 rounded font-mono text-xs">
                                          <option value="">Any</option>
                                          <option value="easy">Easy</option>
                                          <option value="medium">Medium</option>
                                          <option value="hard">Hard</option>
                                        </select>
                                      </td>
                                      <td className="p-3">
                                        <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                                          <input type="checkbox" checked={editChallengeForm.published} onChange={(e) => setEditChallengeForm({ ...editChallengeForm, published: e.target.checked })} className="rounded border-[rgba(34,211,238,0.3)]" />
                                          <span className={editChallengeForm.published ? 'text-[var(--aurora-emerald)]' : 'text-txt-muted'}>{editChallengeForm.published ? 'Published' : 'Draft'}</span>
                                        </label>
                                      </td>
                                      <td className="p-3 pr-5 align-top pt-4">
                                        <div className="flex gap-1.5 justify-end">
                                          <button onClick={async () => {
                                            try { await api.updateChallenge(c.id, editChallengeForm); toast.success('Updated'); setEditChallenge(null); loadTabData('challenges'); }
                                            catch { toast.error('Failed'); }
                                          }} className="p-1.5 rounded-lg bg-[rgba(52,232,158,0.1)] text-[var(--aurora-emerald)] hover:bg-[rgba(52,232,158,0.2)] transition-all" title="Save">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => setEditChallenge(null)} className="p-1.5 rounded-lg bg-[rgba(155,164,178,0.1)] text-txt-secondary hover:bg-[rgba(155,164,178,0.2)] transition-all" title="Cancel">
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="p-3 pl-5 font-mono text-xs text-txt-muted">{c.id}</td>
                                      <td className="p-3 font-mono text-sm text-txt-primary font-medium max-w-[220px] truncate" title={c.title}>{c.title}</td>
                                      <td className="p-3"><span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                                        c.category === 'web' ? 'bg-[rgba(34,211,238,0.12)] text-[var(--aurora-cyan)]' :
                                        c.category === 'crypto' ? 'bg-[rgba(52,232,158,0.12)] text-[var(--aurora-emerald)]' :
                                        c.category === 'pwn' ? 'bg-[rgba(255,92,114,0.12)] text-[#FF5C72]' :
                                        'bg-[rgba(124,92,255,0.12)] text-[var(--aurora-violet)]'
                                      }`}>{c.category}</span></td>
                                      <td className="p-3 font-mono text-xs text-txt-secondary">{c.points}</td>
                                      <td className="p-3 font-mono text-xs text-txt-secondary">{c.difficulty || '-'}</td>
                                      <td className="p-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${c.published ? 'bg-[rgba(52,232,158,0.15)] text-[var(--aurora-emerald)]' : 'bg-[rgba(155,164,178,0.15)] text-txt-muted'}`}>
                                          {c.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                          {c.published ? 'Live' : 'Draft'}
                                        </span>
                                      </td>
                                      <td className="p-3 pr-5">
                                        <div className="flex gap-1.5 justify-end">
                                          <button onClick={() => { setEditChallenge(c); setEditChallengeForm({ title: c.title, description: c.description, category: c.category, points: String(c.points), flag: c.flag, hint: c.hint || '', files: c.files || '', difficulty: c.difficulty || '', published: c.published }); }}
                                            className="p-1.5 rounded-lg bg-[rgba(34,211,238,0.1)] text-[var(--aurora-cyan)] hover:bg-[rgba(34,211,238,0.2)] transition-all" title="Edit">
                                            <Pencil className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={async () => {
                                            if (!confirm(`Delete challenge "${c.title}"?`)) return;
                                            try { await api.deleteChallenge(c.id); toast.success('Deleted'); loadTabData('challenges'); }
                                            catch { toast.error('Failed'); }
                                          }} className="p-1.5 rounded-lg bg-[rgba(124,92,255,0.1)] text-[var(--aurora-violet)] hover:bg-[rgba(124,92,255,0.2)] transition-all" title="Delete">
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
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <h3 className="font-display text-lg text-txt-primary flex items-center gap-2">
                          <Radio className="w-5 h-5 text-[var(--aurora-emerald)]" /> Live Control
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-mono text-txt-muted">
                          <span className="inline-block w-2 h-2 rounded-full bg-[var(--aurora-emerald)] animate-pulse" />
                          {liveCategories.reduce((s, c) => s + c.published, 0)} challenges live
                        </div>
                      </div>

                      {liveCategories.length === 0 ? (
                        <div className="card rounded-xl p-10 text-center">
                          <Radio className="w-10 h-10 mx-auto text-txt-muted mb-3" />
                          <p className="text-txt-muted font-mono text-sm">No challenge categories found</p>
                          <p className="text-txt-muted font-mono text-xs mt-1">Create challenges in the Warmup or Challenges tabs first</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {liveCategories.map((cat) => {
                            const catChallenges = allChallenges.filter((c: any) => c.category === cat.category);
                            return (
                              <div key={cat.category} className="card rounded-xl overflow-hidden border-l-4 border-l-[var(--aurora-cyan)]">
                                <div className="p-5 pb-3">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <h4 className="font-display text-txt-primary text-base capitalize">{cat.category}</h4>
                                      <p className="text-[10px] font-mono text-txt-muted mt-0.5">{cat.total} challenges</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono ${cat.published === cat.total ? 'bg-[rgba(52,232,158,0.15)] text-[var(--aurora-emerald)]' : 'bg-[rgba(155,164,178,0.15)] text-txt-muted'}`}>
                                      {cat.published === cat.total ? 'All Live' : `${cat.published}/${cat.total} Live`}
                                    </span>
                                  </div>
                                  <div className="flex gap-2 mb-3">
                                    <button
                                      onClick={async () => {
                                        setPublishingCat(cat.category);
                                        try {
                                          const r = await api.publishCategory(cat.category);
                                          toast.success(r.message);
                                          loadTabData('live');
                                        } catch { toast.error('Failed to publish'); }
                                        finally { setPublishingCat(null); }
                                      }}
                                      disabled={publishingCat === cat.category || cat.published === cat.total}
                                      className="px-3 py-1.5 rounded-lg bg-[rgba(52,232,158,0.12)] border border-[rgba(52,232,158,0.3)] text-[var(--aurora-emerald)] font-mono text-[10px] hover:bg-[rgba(52,232,158,0.2)] disabled:opacity-40 transition-all flex items-center gap-1.5"
                                    >
                                      {publishingCat === cat.category ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                                      Publish All
                                    </button>
                                    <button
                                      onClick={async () => {
                                        setPublishingCat(cat.category);
                                        try {
                                          const r = await api.unpublishCategory(cat.category);
                                          toast.success(r.message);
                                          loadTabData('live');
                                        } catch { toast.error('Failed to unpublish'); }
                                        finally { setPublishingCat(null); }
                                      }}
                                      disabled={publishingCat === cat.category || cat.published === 0}
                                      className="px-3 py-1.5 rounded-lg bg-[rgba(124,92,255,0.1)] border border-[rgba(124,92,255,0.3)] text-[var(--aurora-violet)] font-mono text-[10px] hover:bg-[rgba(124,92,255,0.2)] disabled:opacity-40 transition-all flex items-center gap-1.5"
                                    >
                                      {publishingCat === cat.category ? <Loader2 className="w-3 h-3 animate-spin" /> : <EyeOff className="w-3 h-3" />}
                                      Unpublish All
                                    </button>
                                  </div>
                                </div>
                                <div className="border-t border-[rgba(34,211,238,0.06)]">
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr className="text-txt-muted font-mono text-[10px] uppercase tracking-wider bg-black/20">
                                        <th className="p-2 pl-5 font-medium">ID</th>
                                        <th className="p-2 font-medium">Title</th>
                                        <th className="p-2 font-medium">Difficulty</th>
                                        <th className="p-2 font-medium">Status</th>
                                        <th className="p-2 pr-5 font-medium text-right">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {catChallenges.map((c: any) => (
                                        <tr key={c.id} className="border-t border-[rgba(34,211,238,0.03)] hover:bg-[rgba(34,211,238,0.02)] transition-colors">
                                          <td className="p-2 pl-5 font-mono text-[10px] text-txt-muted">{c.id}</td>
                                          <td className="p-2 font-mono text-xs text-txt-primary max-w-[200px] truncate" title={c.title}>{c.title}</td>
                                          <td className="p-2 font-mono text-[10px] text-txt-secondary">{c.difficulty || '-'}</td>
                                          <td className="p-2">
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono ${c.published ? 'bg-[rgba(52,232,158,0.15)] text-[var(--aurora-emerald)]' : 'bg-[rgba(155,164,178,0.15)] text-txt-muted'}`}>
                                              {c.published ? 'Live' : 'Draft'}
                                            </span>
                                          </td>
                                          <td className="p-2 pr-5">
                                            <div className="flex gap-1 justify-end">
                                              <button
                                                onClick={async () => {
                                                  try {
                                                    await api.updateChallenge(c.id, { published: true });
                                                    toast.success(`"${c.title}" published`);
                                                    loadTabData('live');
                                                  } catch { toast.error('Failed to publish'); }
                                                }}
                                                disabled={c.published}
                                                className="p-1 rounded bg-[rgba(52,232,158,0.1)] text-[var(--aurora-emerald)] hover:bg-[rgba(52,232,158,0.2)] disabled:opacity-30 transition-all"
                                                title="Publish"
                                              >
                                                <Eye className="w-3 h-3" />
                                              </button>
                                              <button
                                                onClick={async () => {
                                                  try {
                                                    await api.updateChallenge(c.id, { published: false });
                                                    toast.success(`"${c.title}" unpublished`);
                                                    loadTabData('live');
                                                  } catch { toast.error('Failed to unpublish'); }
                                                }}
                                                disabled={!c.published}
                                                className="p-1 rounded bg-[rgba(124,92,255,0.1)] text-[var(--aurora-violet)] hover:bg-[rgba(124,92,255,0.2)] disabled:opacity-30 transition-all"
                                                title="Unpublish"
                                              >
                                                <EyeOff className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="card rounded-xl p-5">
                        <h4 className="font-display text-txt-primary text-sm mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[var(--aurora-cyan)]" /> Quick Stats
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3 rounded-lg bg-black/20 text-center">
                            <div className="text-txt-primary font-display text-xl">{liveCategories.reduce((s, c) => s + c.total, 0)}</div>
                            <div className="text-txt-muted font-mono text-[10px] uppercase tracking-wider">Total Challenges</div>
                          </div>
                          <div className="p-3 rounded-lg bg-[rgba(52,232,158,0.08)] text-center">
                            <div className="text-[var(--aurora-emerald)] font-display text-xl">{liveCategories.reduce((s, c) => s + c.published, 0)}</div>
                            <div className="text-txt-muted font-mono text-[10px] uppercase tracking-wider">Live</div>
                          </div>
                          <div className="p-3 rounded-lg bg-[rgba(255,69,0,0.08)] text-center">
                            <div className="text-[#FF4500] font-display text-xl">{liveCategories.reduce((s, c) => s + c.unpublished, 0)}</div>
                            <div className="text-txt-muted font-mono text-[10px] uppercase tracking-wider">Draft</div>
                          </div>
                          <div className="p-3 rounded-lg bg-[rgba(124,92,255,0.08)] text-center">
                            <div className="text-[var(--aurora-violet)] font-display text-xl">{liveCategories.length}</div>
                            <div className="text-txt-muted font-mono text-[10px] uppercase tracking-wider">Categories</div>
                          </div>
                        </div>
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
                        <button type="submit" className="admin-action-btn px-6 py-3 rounded-xl bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] font-mono text-sm hover:bg-[rgba(34,211,238,0.2)] transition-all flex items-center gap-2">
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
            className="card rounded-2xl p-6 w-full max-w-md border-[rgba(34,211,238,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-txt-primary text-lg mb-2">Change Password</h3>
            <p className="text-txt-secondary font-mono text-xs mb-4">User: <span className="text-[var(--aurora-cyan)]">{passwordModal.username}</span></p>
            <input
              type="password"
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
                className="flex-1 px-4 py-2.5 rounded-lg bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] font-mono text-sm hover:bg-[rgba(34,211,238,0.2)] disabled:opacity-50 transition-all"
              >
                {passwordModalLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
              </button>
              <button
                onClick={() => { setPasswordModal(null); setPasswordModalValue(''); }}
                disabled={passwordModalLoading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[rgba(155,164,178,0.1)] border border-[rgba(155,164,178,0.3)] text-txt-secondary font-mono text-sm hover:bg-[rgba(155,164,178,0.2)] disabled:opacity-50 transition-all"
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
            className="card rounded-2xl p-6 w-full max-w-md border-[rgba(34,211,238,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-txt-primary text-lg mb-2">Edit Username</h3>
            <p className="text-txt-secondary font-mono text-xs mb-4">User: <span className="text-[var(--aurora-cyan)]">{usernameModal.username}</span></p>
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
                className="flex-1 px-4 py-2.5 rounded-lg bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] font-mono text-sm hover:bg-[rgba(34,211,238,0.2)] disabled:opacity-50 transition-all"
              >
                {usernameModalLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
              </button>
              <button
                onClick={() => { setUsernameModal(null); setUsernameModalValue(''); }}
                disabled={usernameModalLoading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[rgba(155,164,178,0.1)] border border-[rgba(155,164,178,0.3)] text-txt-secondary font-mono text-sm hover:bg-[rgba(155,164,178,0.2)] disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>);
}
