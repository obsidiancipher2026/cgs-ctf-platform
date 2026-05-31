'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Loader2, Trophy, Flag, Filter, ChevronDown, ChevronRight,
  CheckCircle, Circle, Search, Lock, Unlock, Droplet, Lightbulb, Radio, Download,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';

const categoryConfig: Record<string, { color: string; icon: string; label: string }> = {
  crypto: { color: '#00ff88', icon: '🔐', label: 'Crypto' },
  web: { color: '#00d4ff', icon: '🌐', label: 'Web' },
  reverse: { color: '#7b2ff7', icon: '🧩', label: 'Reverse' },
  forensics: { color: '#ffd700', icon: '🔍', label: 'Forensics' },
  osint: { color: '#ff6b35', icon: '🕵️', label: 'OSINT' },
  pwn: { color: '#e74c3c', icon: '💥', label: 'Pwn' },
  misc: { color: '#ff2d79', icon: '🎲', label: 'Misc' },
};

const difficultyMeta: Record<string, { color: string; bg: string; border: string; label: string }> = {
  easy: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Easy' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Medium' },
  hard: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Hard' },
  expert: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Extreme' },
};

const categories = Object.keys(categoryConfig);
const difficulties = ['easy', 'medium', 'hard', 'expert'];

export default function ChallengesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useStore();
  const [mounted, setMounted] = useState(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [hintsVisible, setHintsVisible] = useState<Set<number>>(new Set());

  const toggleHint = (id: number) => {
    setHintsVisible((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterOpen, setFilterOpen] = useState<Record<string, boolean>>({
    visibility: true, difficulty: true, category: true,
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || !user)) router.push('/login');
  }, [mounted, isAuthenticated, user, router]);

  useEffect(() => {
    if (!mounted || !isAuthenticated || !user) return;
    setLoading(true);
    api.getChallenges(selectedCategory || undefined)
      .then(setChallenges)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted, isAuthenticated, user, selectedCategory]);

  const filtered = useMemo(() => {
    let result = challenges;
    if (selectedDifficulty) {
      result = result.filter((c) => c.difficulty === selectedDifficulty);
    }
    if (visibility === 'solved') {
      result = result.filter((c) => c.is_solved);
    } else if (visibility === 'unsolved') {
      result = result.filter((c) => !c.is_solved);
    }
    return result;
  }, [challenges, selectedDifficulty, visibility]);

  const toggleFilter = (key: string) => setFilterOpen({ ...filterOpen, [key]: !filterOpen[key] });

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyber-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto flex gap-4 sm:gap-6">
        {/* Sidebar */}
        <motion.aside
          initial={{ width: sidebarOpen ? 220 : 0, opacity: sidebarOpen ? 1 : 0 }}
          animate={{ width: sidebarOpen ? 220 : 0, opacity: sidebarOpen ? 1 : 0 }}
          className="flex-shrink-0 overflow-hidden hidden lg:block"
        >
          <div className="cyber-card rounded-xl p-4 sticky top-24 w-[220px]">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center gap-2 text-gray-400 font-mono text-xs uppercase tracking-wider mb-3 hover:text-white transition-colors">
              <Filter className="w-3 h-3" /> Filters {sidebarOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>

            {/* Visibility */}
            <div className="mb-3">
              <button onClick={() => toggleFilter('visibility')} className="flex items-center gap-1.5 text-gray-500 font-mono text-xs mb-1.5 hover:text-white transition-colors w-full text-left">
                {filterOpen.visibility ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />} Status
              </button>
              <AnimatePresence>
                {filterOpen.visibility && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-0.5 overflow-hidden">
                    {(['all', 'solved', 'unsolved'] as const).map((v) => (
                      <button key={v} onClick={() => setVisibility(v)} className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg font-mono text-xs transition-all ${visibility === v ? 'bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'}`}>
                        {v === 'all' ? <Circle className="w-3 h-3" /> : v === 'solved' ? <CheckCircle className={`w-3 h-3 ${visibility === v ? 'text-cyber-blue' : ''}`} /> : <Lock className="w-3 h-3" />}
                        {v === 'all' ? 'All' : v === 'solved' ? 'Solved' : 'Unsolved'}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Difficulty */}
            <div className="mb-3">
              <button onClick={() => toggleFilter('difficulty')} className="flex items-center gap-1.5 text-gray-500 font-mono text-xs mb-1.5 hover:text-white transition-colors w-full text-left">
                {filterOpen.difficulty ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />} Difficulty
              </button>
              <AnimatePresence>
                {filterOpen.difficulty && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-0.5 overflow-hidden">
                    {difficulties.map((d) => {
                      const meta = difficultyMeta[d];
                      return (
                        <button key={d} onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)} className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg font-mono text-xs transition-all ${selectedDifficulty === d ? `${meta.bg} ${meta.color} border ${meta.border}` : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'}`}>
                          <span className={`w-2 h-2 rounded-full ${d === 'easy' ? 'bg-green-400' : d === 'medium' ? 'bg-yellow-400' : d === 'hard' ? 'bg-orange-400' : 'bg-red-400'}`} />
                          {meta.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category */}
            <div>
              <button onClick={() => toggleFilter('category')} className="flex items-center gap-1.5 text-gray-500 font-mono text-xs mb-1.5 hover:text-white transition-colors w-full text-left">
                {filterOpen.category ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />} Category
              </button>
              <AnimatePresence>
                {filterOpen.category && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-0.5 overflow-hidden">
                    {categories.map((cat) => {
                      const cfg = categoryConfig[cat];
                      const isActive = selectedCategory === cat;
                      return (
                        <button key={cat} onClick={() => setSelectedCategory(isActive ? null : cat)} className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg font-mono text-xs transition-all ${isActive ? 'text-white border' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'}`} style={isActive ? { backgroundColor: `${cfg.color}15`, borderColor: `${cfg.color}40`, color: cfg.color } : {}}>
                          <span className="text-sm">{cfg.icon}</span> {cfg.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {(selectedDifficulty || visibility !== 'all' || selectedCategory) && (
              <button onClick={() => { setSelectedDifficulty(null); setVisibility('all'); setSelectedCategory(null); }} className="text-cyber-blue font-mono text-xs hover:underline mt-3">
                Clear all filters
              </button>
            )}
          </div>
        </motion.aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
              <div>
                <h1 className="font-cyber text-xl sm:text-2xl text-white flex items-center gap-2 font-bold">
                  <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-cyber-blue" />
                  Challenges
                </h1>
                <p className="text-gray-500 font-mono text-xs mt-0.5">
                  {filtered.length} of {challenges.length} challenge{challenges.length !== 1 ? 's' : ''} visible
                </p>
              </div>
              <Link
                href="/flag-submit"
                className="px-3.5 py-1.5 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue font-mono text-xs hover:bg-cyber-blue/20 transition-all flex items-center gap-1.5 w-fit"
              >
                <Flag className="w-3.5 h-3.5" /> Submit Flag
              </Link>
            </div>

            {/* Mobile category filter bar */}
            <div className="flex flex-wrap gap-1.5 mb-4 lg:hidden">
              <button onClick={() => setSelectedCategory(null)} className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-all ${!selectedCategory ? 'bg-cyber-blue/20 border border-cyber-blue/50 text-cyber-blue' : 'bg-gray-800/30 border border-gray-700/50 text-gray-400 hover:border-gray-600'}`}>All</button>
              {categories.map((cat) => {
                const cfg = categoryConfig[cat];
                return (
                  <button key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)} className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-all ${cat === selectedCategory ? 'border text-white' : 'bg-gray-800/30 border border-gray-700/50 text-gray-400 hover:border-gray-600'}`} style={cat === selectedCategory ? { backgroundColor: `${cfg.color}20`, borderColor: `${cfg.color}50`, color: cfg.color } : {}}>
                    {cfg.icon} {cfg.label}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="cyber-card rounded-xl p-4 border-cyber-blue/10 animate-pulse">
                    <div className="h-3 bg-gray-800/50 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-gray-800/50 rounded w-2/3 mb-2" />
                    <div className="h-2 bg-gray-800/50 rounded w-1/2 mb-3" />
                    <div className="h-2 bg-gray-800/50 rounded w-full mb-1" />
                    <div className="h-2 bg-gray-800/50 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 font-mono text-base">No challenges match your filters</p>
                <p className="text-gray-600 font-mono text-xs mt-1">Try adjusting your filter criteria</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((challenge, index) => {
                  const cat = categoryConfig[challenge.category] || categoryConfig.misc;
                  const diff = difficultyMeta[challenge.difficulty] || difficultyMeta.easy;
                  return (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Link
                        href={`/challenges/${challenge.id}`}
                        className="block cyber-card rounded-xl p-4 border border-gray-800/60 hover:border-cyber-blue/30 transition-all duration-300 h-full flex flex-col hover:shadow-lg hover:shadow-cyber-blue/5 hover:-translate-y-0.5 group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                            {cat.icon} {cat.label}
                          </span>
                          <span className={`ml-auto text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full ${diff.color} ${diff.bg} border ${diff.border}`}>
                            {diff.label}
                          </span>
                        </div>

                        <h3 className="text-white font-cyber text-sm sm:text-base mb-1.5 group-hover:text-cyber-blue transition-colors leading-tight">
                          {challenge.title}
                        </h3>

                        <p className="text-gray-500 font-mono text-xs leading-relaxed line-clamp-2 mb-2 flex-1">
                          {challenge.description}
                        </p>

                        <div className="mb-2">
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleHint(challenge.id); }}
                            aria-expanded={hintsVisible.has(challenge.id)}
                            aria-controls={`hint-${challenge.id}`}
                            className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-lg transition-all"
                            style={{
                              color: hintsVisible.has(challenge.id) ? '#ffd700' : '#6b7280',
                              backgroundColor: hintsVisible.has(challenge.id) ? '#ffd70010' : 'transparent',
                              border: `1px solid ${hintsVisible.has(challenge.id) ? '#ffd70030' : 'transparent'}`,
                            }}
                          >
                            <Lightbulb className={`w-3 h-3 ${hintsVisible.has(challenge.id) ? 'text-yellow-400' : ''}`} />
                            {hintsVisible.has(challenge.id) ? 'Hide Hint' : 'Show Hint'}
                          </button>
                          <div
                            id={`hint-${challenge.id}`}
                            className={`mt-1.5 overflow-hidden transition-all duration-300 ease-in-out ${hintsVisible.has(challenge.id) ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                          >
                            <div className="px-3 py-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                              <p className="text-yellow-300/80 font-mono text-[11px] leading-relaxed">{challenge.hint || 'No hint available for this challenge.'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-gray-800/50">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Trophy className="w-3.5 h-3.5 text-cyber-blue" />
                              <span className="text-cyber-blue font-cyber text-xs font-bold">{challenge.points}pts</span>
                            </div>
                            {challenge.blood_points > 0 ? (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30" title={`First blood bonus: +${challenge.blood_points}pts`}>
                                <Droplet className="w-3 h-3 text-red-400" />
                                <span className="text-red-400 font-mono text-[10px] font-bold">+{challenge.blood_points}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-800/30 border border-gray-700/30 opacity-50" title="No blood bonus">
                                <Droplet className="w-3 h-3 text-gray-600" />
                                <span className="text-gray-600 font-mono text-[10px]">+0</span>
                              </div>
                            )}
                            {challenge.solver_count > 0 && (
                              <div className="flex items-center gap-1">
                                <Swords className="w-3 h-3 text-gray-600" />
                                <span className="text-gray-500 font-mono text-[11px]">{challenge.solver_count}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {challenge.is_solved && (
                              <span className="flex items-center gap-1 text-[10px] font-mono text-cyber-green">
                                <CheckCircle className="w-3 h-3" />
                              </span>
                            )}
                            {challenge.challenge_type === 'instance' ? (
                              <span className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs flex items-center gap-1 pointer-events-none">
                                <Radio className="w-3 h-3" /> Instance
                              </span>
                            ) : challenge.file_url ? (
                              <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs flex items-center gap-1 pointer-events-none">
                                <Download className="w-3 h-3" /> Assets
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue font-mono text-xs flex items-center gap-1 pointer-events-none">
                                <Unlock className="w-3 h-3" /> Solve
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
