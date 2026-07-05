'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCw, Users, Zap, Loader2, Search, User, Droplet } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

const rankMeta = [
  { color: 'text-warning', glow: 'rgba(255,184,0,0.15)', label: '1st' },
  { color: 'text-txt-secondary', glow: 'rgba(122,156,192,0.12)', label: '2nd' },
  { color: 'text-orange-500', glow: 'rgba(249,115,22,0.12)', label: '3rd' },
];

export default function ScoreboardPage() {
  const { isAuthenticated, user } = useStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [teamEntries, setTeamEntries] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [teamTotalCount, setTeamTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'individual' | 'team'>('individual');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && (!isAuthenticated || !user)) router.push('/login'); }, [mounted, isAuthenticated, user, router]);

  const loadScoreboard = useCallback(async () => {
    setRefreshing(true);
    try {
      const [indiv, tm] = await Promise.all([api.getScoreboard(100, 0), api.getTeamScoreboard(100, 0)]);
      if (indiv) { setEntries(indiv.entries || []); setTotalCount(indiv.total_count || 0); }
      if (tm) { setTeamEntries(tm.entries || []); setTeamTotalCount(tm.total_count || 0); }
    } catch (e) { console.error('Failed to load scoreboard', e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated || !user) return;
    loadScoreboard();
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}//${window.location.host}`;
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`${wsUrl}/ws/scoreboard`);
      ws.onmessage = () => loadScoreboard();
    } catch (e) { console.warn('WebSocket connection failed', e); }
    const interval = setInterval(loadScoreboard, 30000);
    return () => { if (ws) ws.close(); clearInterval(interval); };
  }, [loadScoreboard, mounted, isAuthenticated, user]);

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter((e: any) => e.username.toLowerCase().includes(q) || (e.team_name && e.team_name.toLowerCase().includes(q)));
  }, [entries, search]);

  const filteredTeams = useMemo(() => {
    if (!search.trim()) return teamEntries;
    const q = search.toLowerCase();
    return teamEntries.filter((e: any) => e.team_name.toLowerCase().includes(q));
  }, [teamEntries, search]);

  const maxScore = useMemo(() => {
    const list = tab === 'individual' ? filteredEntries : filteredTeams;
    return list.length > 0 ? list[0].score ?? list[0].total_score ?? 1 : 1;
  }, [filteredEntries, filteredTeams, tab]);

  if (!mounted || !isAuthenticated || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-core animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              <h1 className="font-display font-bold text-xl sm:text-2xl text-txt-primary">Leaderboard</h1>
              <span className="flex items-center gap-1 text-txt-muted text-xs ml-2">
                <Zap className="w-3 h-3 text-success" /> LIVE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-txt-secondary text-xs"><Users className="w-3 h-3 inline mr-1" />{tab === 'individual' ? totalCount : teamTotalCount}</span>
              <button onClick={() => loadScoreboard()} className="p-1.5 text-txt-muted hover:text-blue-core transition-colors" aria-label="Refresh">
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tabs + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="flex gap-1 bg-surface rounded-lg p-0.5 border border-border-c">
              {(['individual', 'team'] as const).map((t) => (
                <button key={t} onClick={() => {
                  if (t === 'team') { toast('Team scoring coming soon!', { icon: '🏆', duration: 3000 }); return; }
                  setTab(t);
                }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${tab === t ? 'bg-blue-dim/30 text-blue-glow border border-blue-core/30' : 'text-txt-muted hover:text-txt-secondary'}`}>
                  {t === 'individual' ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                  {t === 'individual' ? 'Individual' : 'Team'}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-txt-muted" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input-field w-full pl-9 pr-3 py-1.5 rounded-lg text-xs" />
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="bg-surface border border-border-c rounded-lg p-3 sm:p-4 animate-pulse"><div className="h-4 bg-surface-2 rounded w-1/3" /></div>)}
          </div>
        ) : (tab === 'individual' ? filteredEntries : filteredTeams).length === 0 ? (
          <div className="text-center py-12 text-txt-secondary text-sm">{search ? 'No results match your search' : 'No scores yet. Be the first!'}</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              {/* Column Headers */}
              <div className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-3 sm:gap-8 px-3 sm:px-5 py-2 text-txt-muted text-[11px] uppercase tracking-wider border-b border-border-c mb-1.5">
                <span className="text-center w-7">Rank</span>
                <span>{tab === 'individual' ? 'Player' : 'Team'}</span>
                {tab === 'individual' && <span className="text-center w-10 sm:w-12">Solves</span>}
                {tab === 'individual' && <span className="text-center w-12 sm:w-14">Blood</span>}
                {tab === 'individual' && <span className="text-center w-20 truncate hidden sm:block">Country</span>}
                {tab === 'individual' && <span className="text-center w-28 truncate hidden sm:block">College</span>}
                <span className="text-right w-16 sm:w-20">Score</span>
              </div>

              <div className="space-y-1">
                {(tab === 'individual' ? filteredEntries : filteredTeams).map((entry: any, idx: number) => {
                  const rank = entry.rank;
                  const isTop3 = rank <= 3;
                  const top = isTop3 ? rankMeta[rank - 1] : null;
                  const isCurrentUser = tab === 'individual' && entry.username === user?.username;
                  const score = entry.score ?? entry.total_score ?? 0;
                  const scoreWidth = Math.min(100, (score / maxScore) * 100);

                  return (
                    <motion.div
                      key={rank}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`relative rounded-lg transition-all duration-200 ${
                        isCurrentUser ? 'bg-blue-dim/20 border border-blue-core/30' : isTop3 ? 'bg-surface border border-border-c' : 'bg-surface border border-border-c/50 hover:border-border-c'
                      }`}
                      style={isTop3 ? { boxShadow: `0 0 15px ${top!.glow}` } : {}}
                    >
                      {isTop3 && (
                        <div className="absolute left-0 top-0 bottom-0 rounded-lg pointer-events-none" style={{ width: `${scoreWidth}%`, background: `linear-gradient(90deg, ${top!.glow}, transparent)` }} />
                      )}
                      <div className="relative z-10 grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-3 sm:gap-8 items-center px-3 sm:px-5 py-1.5 sm:py-2.5 min-h-[2rem] sm:min-h-[2.5rem]">
                        {isTop3 ? (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] sm:text-sm font-bold font-mono" style={{ backgroundColor: `${top!.glow}` }}>#{rank}</div>
                        ) : (
                          <span className="text-center font-mono text-[11px] sm:text-xs text-txt-muted w-7">#{rank}</span>
                        )}
                        <div className="min-w-0 truncate">
                          {tab === 'individual' ? (
                            <div>
                              <span className={`text-[11px] sm:text-sm font-mono truncate block ${isCurrentUser ? 'text-blue-glow' : 'text-txt-primary'}`}>
                                {entry.username}
                                {isCurrentUser && <span className="text-[10px] text-blue-core ml-0.5">(you)</span>}
                                {entry.team_name && <span className="text-[10px] text-txt-muted ml-1 hidden sm:inline">[{entry.team_name}]</span>}
                              </span>
                              <span className="text-[8px] text-txt-muted font-mono truncate block sm:hidden">{entry.country || '-'}{entry.country && entry.college ? ' · ' : ''}{entry.college || ''}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] sm:text-sm font-mono text-txt-primary truncate block">{entry.team_name}</span>
                          )}
                        </div>
                        {tab === 'individual' && <span className="text-txt-muted font-mono text-[11px] sm:text-xs text-center w-10 sm:w-12">{entry.solved_count ?? 0}</span>}
                        {tab === 'individual' && <span className="text-red-glow font-mono text-[11px] sm:text-xs text-center w-12 sm:w-14"><Droplet className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline -mt-0.5 mr-px sm:mr-0.5" />{entry.blood_points ?? 0}</span>}
                        {tab === 'individual' && <span className="text-txt-secondary font-mono text-[11px] sm:text-xs text-center w-20 truncate hidden sm:block">{entry.country || '-'}</span>}
                        {tab === 'individual' && <span className="text-txt-secondary font-mono text-[11px] sm:text-xs text-center w-28 truncate hidden sm:block">{entry.college || '-'}</span>}
                        <span className="font-display font-bold text-blue-glow text-[11px] sm:text-sm whitespace-nowrap text-right w-16 sm:w-20">{score}<span className="text-[9px] sm:text-[10px] font-mono text-txt-muted font-normal ml-px sm:ml-0.5">pts</span></span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
