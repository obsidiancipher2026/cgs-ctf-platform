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
  Search, FileText, AlertTriangle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

type AdminTab =
  | 'dashboard' | 'users' | 'announcements' | 'logs' | 'security' | 'settings';

const tabs: { id: AdminTab; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'announcements', label: 'Announcements', icon: Bell },
  { id: 'logs', label: 'Logs', icon: Activity },
  { id: 'security', label: 'Security', icon: Shield },
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
              ${sidebarVisible ? 'lg:w-48' : 'lg:w-0 lg:overflow-hidden'}
              lg:relative lg:flex-shrink-0 lg:transition-[width] lg:duration-300 lg:ease-in-out
              lg:bg-transparent lg:border-0
              fixed lg:static inset-y-0 left-0 z-50
              bg-[var(--bg-surface)] border-r border-[rgba(34,211,238,0.1)]
              overflow-y-auto overflow-x-hidden
              transition-all duration-300 ease-in-out
              ${sidebarVisible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              ${sidebarVisible ? 'shadow-[2px_0_20px_rgba(34,211,238,0.08)]' : ''}
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
                        ? 'bg-[rgba(34,211,238,0.1)] text-[var(--aurora-cyan)] border border-[rgba(34,211,238,0.2)] shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                        : 'text-txt-secondary hover:text-txt-primary hover:bg-[rgba(34,211,238,0.05)] border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
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
