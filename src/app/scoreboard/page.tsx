'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, RefreshCw, Users, Zap, Loader2, Search,
  User, Target, Droplet,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

const rankMeta = [
  { color: 'text-yellow-400', glow: 'rgba(250,204,21,0.15)', label: '1st' },
  { color: 'text-gray-300', glow: 'rgba(209,213,219,0.12)', label: '2nd' },
  { color: 'text-amber-600', glow: 'rgba(217,119,6,0.12)', label: '3rd' },
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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || !user)) router.push('/login');
  }, [mounted, isAuthenticated, user, router]);

  const loadScoreboard = useCallback(async () => {
    setRefreshing(true);
    try {
      const [indiv, tm] = await Promise.all([
        api.getScoreboard(100, 0),
        api.getTeamScoreboard(100, 0),
      ]);
      setEntries(indiv.entries);
      setTotalCount(indiv.total_count);
      setTeamEntries(tm.entries);
      setTeamTotalCount(tm.total_count);
    } catch {
      console.error('Failed to load scoreboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshKey]);

  useEffect(() => {
    if (!mounted || !isAuthenticated || !user) return;
    loadScoreboard();
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}//${window.location.host}`;
    const ws = new WebSocket(`${wsUrl}/ws/scoreboard`);
    ws.onmessage = () => loadScoreboard();
    const interval = setInterval(loadScoreboard, 30000);
    return () => { ws.close(); clearInterval(interval); };
  }, [loadScoreboard, mounted, isAuthenticated, user]);

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter((e: any) =>
      e.username.toLowerCase().includes(q) ||
      (e.team_name && e.team_name.toLowerCase().includes(q))
    );
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyber-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Compact header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h1 className="font-cyber font-bold text-xl sm:text-2xl text-white">
                Scoreboard
              </h1>
              <span className="flex items-center gap-1 text-gray-500 font-mono text-xs ml-2">
                <Zap className="w-3 h-3 text-cyber-blue" /> Live
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-mono text-xs">
                <Users className="w-3 h-3 inline mr-1" />
                {tab === 'individual' ? totalCount : teamTotalCount}
              </span>
              <button onClick={() => setRefreshKey(k => k + 1)} className="p-1.5 rounded-lg text-gray-400 hover:text-cyber-blue hover:bg-cyber-blue/10 transition-all" aria-label="Refresh">
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tabs + Search row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="flex gap-1 bg-gray-900/50 rounded-xl p-0.5 border border-gray-800/50">
              {(['individual', 'team'] as const).map((t) => (
                <button key={t} onClick={() => {
                  if (t === 'team') { toast('Team scoring coming soon!', { icon: '🏆', duration: 3000 }); return; }
                  setTab(t);
                }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${tab === t ? 'bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30' : 'text-gray-500 hover:text-gray-300'}`}>
                  {t === 'individual' ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                  {t === 'individual' ? 'Individual' : 'Team'}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tab === 'individual' ? 'Search...' : 'Search team...'}
                className="cyber-input w-full pl-9 pr-3 py-1.5 rounded-xl font-mono text-xs"
              />
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="cyber-card rounded-xl p-3 sm:p-4 animate-pulse">
                <div className="h-4 bg-gray-800/50 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (tab === 'individual' ? filteredEntries : filteredTeams).length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 font-mono text-sm">
              {search ? 'No results match your search' : tab === 'individual' ? 'No scores yet. Be the first!' : 'No teams yet.'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              {/* Compact column headers */}
              <div className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-3 sm:gap-8 px-3 sm:px-5 py-2 text-gray-500 font-mono text-[11px] sm:text-[11px] uppercase tracking-wider border-b border-gray-800/50 mb-1.5">
                <span className="text-center w-7">Rank</span>
                <span>{tab === 'individual' ? 'Player' : 'Team'}</span>
                {tab === 'individual' && <span className="text-center w-10 sm:w-12">Solves</span>}
                {tab === 'individual' && <span className="text-center w-12 sm:w-14">Blood</span>}
                {tab === 'individual' && <span className="text-center w-20 truncate hidden sm:block">Country</span>}
                {tab === 'individual' && <span className="text-center w-28 truncate hidden sm:block">College/University</span>}
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
                     className={`relative rounded-xl transition-all duration-200 ${
                          isCurrentUser
                            ? 'cyber-card-glow border-cyber-blue/30'
                            : isTop3
                              ? 'bg-gray-900/60 border border-gray-800/50'
                              : 'bg-gray-900/40 border border-gray-800/30 hover:border-gray-700/50 hover:bg-gray-900/60'
                       }`}
                       style={isTop3 ? { boxShadow: `0 0 15px ${top!.glow}` } : {}}
                     >
                       {/* Score bar - only for top 3 */}
                       {isTop3 && (
                         <div className="absolute left-0 top-0 bottom-0 rounded-xl pointer-events-none" style={{
                           width: `${scoreWidth}%`,
                           background: isTop3
                             ? `linear-gradient(90deg, ${top!.glow}, transparent)`
                             : 'linear-gradient(90deg, rgba(0,212,255,0.04), transparent)',
                         }} />
                       )}

                          <div className="relative z-10 grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-3 sm:gap-8 items-center px-3 sm:px-5 py-1.5 sm:py-2.5 min-h-[2rem] sm:min-h-[2.5rem]">
                            {/* Rank */}
                             {isTop3 ? (
                               <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] sm:text-sm font-bold font-mono" style={{ backgroundColor: `${top!.glow}` }}>
                                 #{rank}
                               </div>
                             ) : (
                              <span className="text-center font-mono text-[11px] sm:text-xs text-gray-500 w-7">#{rank}</span>
                            )}

                              {/* Name */}
                              <div className="min-w-0 truncate">
                               {tab === 'individual' ? (
                                 <div>
                                 <span className={`text-[11px] sm:text-sm font-mono truncate block ${isCurrentUser ? 'text-cyber-blue' : 'text-white'}`}>
                                   {entry.username}
                                   {isCurrentUser && <span className="text-[10px] sm:text-[10px] text-cyber-blue ml-0.5">(you)</span>}
                                   {entry.team_name && <span className="text-[10px] sm:text-[10px] text-cyber-blue/60 ml-1 hidden sm:inline">[{entry.team_name}]</span>}
                                 </span>
                                 <span className="text-[8px] text-gray-500 font-mono truncate block sm:hidden">{entry.country || '-'}{entry.country && entry.college ? ' · ' : ''}{entry.college || ''}</span>
                                 </div>
                               ) : (
                                  <span className="text-[11px] sm:text-sm font-mono text-white truncate block">{entry.team_name}</span>
                               )}
                             </div>

                             {tab === 'individual' && (
                               <span className="text-gray-500 font-mono text-[11px] sm:text-xs text-center w-10 sm:w-12" title="Solves">
                                 {entry.solved_count ?? 0}
                               </span>
                             )}
                             {tab === 'individual' && (
                               <span className="text-red-400 font-mono text-[11px] sm:text-xs text-center w-12 sm:w-14" title="Blood points">
                                 <Droplet className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline -mt-0.5 mr-px sm:mr-0.5 text-red-400" />{entry.blood_points ?? 0}
                               </span>
                             )}
                             {tab === 'individual' && (
                               <span className="text-gray-400 font-mono text-[11px] sm:text-xs text-center w-20 truncate hidden sm:block" title={entry.country || ''}>
                                 {entry.country || '-'}
                               </span>
                             )}
                             {tab === 'individual' && (
                               <span className="text-gray-400 font-mono text-[11px] sm:text-xs text-center w-28 truncate hidden sm:block" title={entry.college || ''}>
                                 {entry.college || '-'}
                               </span>
                             )}
                            <span className="font-cyber text-cyber-blue text-[11px] sm:text-sm font-bold whitespace-nowrap text-right w-16 sm:w-20">
                              {score}<span className="text-[9px] sm:text-[10px] font-mono text-gray-500 font-normal ml-px sm:ml-0.5">pts</span>
                            </span>
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
