'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Loader2, Trophy, Flag, Filter, ChevronDown, ChevronRight, CheckCircle, Circle, Search, Lock, Unlock, Droplet, Lightbulb, Radio, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';

const categoryConfig: Record<string, { badgeClass: string; icon: string; label: string }> = {
  crypto: { badgeClass: 'badge-crypto', icon: '🔐', label: 'Crypto' },
  web: { badgeClass: 'badge-web', icon: '🌐', label: 'Web' },
  reverse: { badgeClass: 'badge-rev', icon: '🧩', label: 'Reverse' },
  forensics: { badgeClass: 'badge-forensics', icon: '🔍', label: 'Forensics' },
  osint: { badgeClass: 'badge-misc', icon: '🕵️', label: 'OSINT' },
  pwn: { badgeClass: 'badge-hard', icon: '💥', label: 'Pwn' },
  misc: { badgeClass: 'badge-misc', icon: '🎲', label: 'Misc' },
};

const difficultyMeta: Record<string, { badgeClass: string; label: string }> = {
  easy: { badgeClass: 'badge-easy', label: 'Easy' },
  medium: { badgeClass: 'badge-medium', label: 'Medium' },
  hard: { badgeClass: 'badge-hard', label: 'Hard' },
  expert: { badgeClass: 'badge-insane', label: 'Extreme' },
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterOpen, setFilterOpen] = useState<Record<string, boolean>>({ visibility: true, difficulty: true, category: true });

  const toggleHint = (id: number) => {
    setHintsVisible((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && (!isAuthenticated || !user)) router.push('/login'); }, [mounted, isAuthenticated, user, router]);

  useEffect(() => {
    if (!mounted || !isAuthenticated || !user) return;
    setLoading(true);
    api.getChallenges(selectedCategory || undefined).then(setChallenges).catch(() => {}).finally(() => setLoading(false));
  }, [mounted, isAuthenticated, user, selectedCategory]);

  const filtered = useMemo(() => {
    let result = challenges;
    if (selectedDifficulty) result = result.filter((c) => c.difficulty === selectedDifficulty);
    if (visibility === 'solved') result = result.filter((c) => c.is_solved);
    else if (visibility === 'unsolved') result = result.filter((c) => !c.is_solved);
    return result;
  }, [challenges, selectedDifficulty, visibility]);

  const toggleFilter = (key: string) => setFilterOpen({ ...filterOpen, [key]: !filterOpen[key] });

  if (!mounted || !isAuthenticated || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-core animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto flex gap-4 sm:gap-6">
        {/* Sidebar */}
        <motion.aside initial={{ width: sidebarOpen ? 220 : 0, opacity: sidebarOpen ? 1 : 0 }} animate={{ width: sidebarOpen ? 220 : 0, opacity: sidebarOpen ? 1 : 0 }} className="flex-shrink-0 overflow-hidden hidden lg:block">
          <div className="bg-surface border border-border-c rounded-lg p-4 sticky top-24 w-[220px]">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center gap-2 text-txt-muted text-xs uppercase tracking-wider mb-3 hover:text-txt-primary transition-colors">
              <Filter className="w-3 h-3" /> Filters {sidebarOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>

            {/* Visibility */}
            <div className="mb-3">
              <button onClick={() => toggleFilter('visibility')} className="flex items-center gap-1.5 text-txt-muted text-xs mb-1.5 hover:text-txt-primary transition-colors w-full text-left">
                {filterOpen.visibility ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />} Status
              </button>
              <AnimatePresence>
                {filterOpen.visibility && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-0.5 overflow-hidden">
                    {(['all', 'solved', 'unsolved'] as const).map((v) => (
                      <button key={v} onClick={() => setVisibility(v)} className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded text-xs transition-all ${visibility === v ? 'bg-blue-dim/30 text-blue-glow border border-blue-core/30' : 'text-txt-muted hover:text-txt-secondary hover:bg-surface-2'}`}>
                        {v === 'all' ? <Circle className="w-3 h-3" /> : v === 'solved' ? <CheckCircle className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {v === 'all' ? 'All' : v === 'solved' ? 'Solved' : 'Unsolved'}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Difficulty */}
            <div className="mb-3">
              <button onClick={() => toggleFilter('difficulty')} className="flex items-center gap-1.5 text-txt-muted text-xs mb-1.5 hover:text-txt-primary transition-colors w-full text-left">
                {filterOpen.difficulty ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />} Difficulty
              </button>
              <AnimatePresence>
                {filterOpen.difficulty && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-0.5 overflow-hidden">
                    {difficulties.map((d) => {
                      const meta = difficultyMeta[d];
                      return (
                        <button key={d} onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)} className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded text-xs transition-all ${selectedDifficulty === d ? `${meta.badgeClass} border` : 'text-txt-muted hover:text-txt-secondary hover:bg-surface-2'}`}>
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
              <button onClick={() => toggleFilter('category')} className="flex items-center gap-1.5 text-txt-muted text-xs mb-1.5 hover:text-txt-primary transition-colors w-full text-left">
                {filterOpen.category ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />} Category
              </button>
              <AnimatePresence>
                {filterOpen.category && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-0.5 overflow-hidden">
                    {categories.map((cat) => {
                      const cfg = categoryConfig[cat];
                      const isActive = selectedCategory === cat;
                      return (
                        <button key={cat} onClick={() => setSelectedCategory(isActive ? null : cat)} className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded text-xs transition-all ${isActive ? `${cfg.badgeClass} border` : 'text-txt-muted hover:text-txt-secondary hover:bg-surface-2'}`}>
                          <span className="text-sm">{cfg.icon}</span> {cfg.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {(selectedDifficulty || visibility !== 'all' || selectedCategory) && (
              <button onClick={() => { setSelectedDifficulty(null); setVisibility('all'); setSelectedCategory(null); }} className="text-blue-glow text-xs hover:underline mt-3">Clear all filters</button>
            )}
          </div>
        </motion.aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
              <div>
                <h1 className="font-display font-bold text-xl sm:text-2xl text-txt-primary flex items-center gap-2">
                  <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-blue-core" /> Challenge Arena
                </h1>
                <p className="text-txt-muted text-xs mt-0.5">{filtered.length} of {challenges.length} challenge{challenges.length !== 1 ? 's' : ''} visible</p>
              </div>
              <Link href="/flag-submit" className="px-3.5 py-1.5 rounded bg-blue-dim/30 border border-blue-core/30 text-blue-glow text-xs hover:bg-blue-dim/50 transition-all flex items-center gap-1.5 w-fit">
                <Flag className="w-3.5 h-3.5" /> Submit Flag
              </Link>
            </div>

            {/* Mobile category filter */}
            <div className="flex flex-wrap gap-1.5 mb-4 lg:hidden">
              <button onClick={() => setSelectedCategory(null)} className={`px-2.5 py-1 rounded text-xs transition-all ${!selectedCategory ? 'bg-blue-dim/30 border border-blue-core/50 text-blue-glow' : 'bg-surface border border-border-c text-txt-muted hover:border-border-c'}`}>All</button>
              {categories.map((cat) => {
                const cfg = categoryConfig[cat];
                return (
                  <button key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)} className={`px-2.5 py-1 rounded text-xs transition-all ${cat === selectedCategory ? `${cfg.badgeClass} border` : 'bg-surface border border-border-c text-txt-muted hover:border-border-c'}`}>
                    {cfg.icon} {cfg.label}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-surface border border-border-c rounded-lg p-4 animate-pulse">
                    <div className="h-3 bg-surface-2 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-surface-2 rounded w-2/3 mb-2" />
                    <div className="h-2 bg-surface-2 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-txt-muted mx-auto mb-3" />
                <p className="text-txt-secondary text-sm">No challenges match your filters</p>
                <p className="text-txt-muted text-xs mt-1">Try adjusting your filter criteria</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((challenge, index) => {
                  const cat = categoryConfig[challenge.category] || categoryConfig.misc;
                  const diff = difficultyMeta[challenge.difficulty] || difficultyMeta.easy;
                  return (
                    <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                      <Link href={`/challenges/${challenge.id}`} className="block bg-surface border border-border-c rounded-lg p-4 h-full flex flex-col group glitch-hover hover:border-border-c/80 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`badge ${cat.badgeClass}`}>{cat.icon} {cat.label}</span>
                          <span className={`badge ${diff.badgeClass} ml-auto`}>{diff.label}</span>
                        </div>
                        <h3 className="text-txt-primary font-body font-semibold text-sm mb-1.5 group-hover:text-blue-glow transition-colors leading-tight">{challenge.title}</h3>
                        <p className="text-txt-muted text-xs leading-relaxed line-clamp-2 mb-2 flex-1">{challenge.description}</p>

                        <div className="mb-2">
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleHint(challenge.id); }} className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1 rounded transition-all text-txt-muted hover:text-warning">
                            <Lightbulb className="w-3 h-3" /> {hintsVisible.has(challenge.id) ? 'Hide Hint' : 'Show Hint'}
                          </button>
                          <div className={`mt-1.5 overflow-hidden transition-all duration-300 ${hintsVisible.has(challenge.id) ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="px-3 py-2 rounded bg-warning/5 border border-warning/20">
                              <p className="text-warning/80 text-[11px] leading-relaxed">{challenge.hint || 'No hint available.'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-border-c/50">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Trophy className="w-3.5 h-3.5 text-blue-glow" />
                              <span className="text-blue-glow font-display text-xs font-bold">{challenge.points}pts</span>
                            </div>
                            {challenge.blood_points > 0 ? (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-dim/20 border border-red-core/20" title={`Blood: +${challenge.blood_points}pts`}>
                                <Droplet className="w-3 h-3 text-red-glow" />
                                <span className="text-red-glow text-[10px] font-bold">+{challenge.blood_points}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded opacity-40"><Droplet className="w-3 h-3 text-txt-muted" /><span className="text-txt-muted text-[10px]">+0</span></div>
                            )}
                            {challenge.solver_count > 0 && (
                              <div className="flex items-center gap-1"><Swords className="w-3 h-3 text-txt-muted" /><span className="text-txt-muted text-[11px]">{challenge.solver_count}</span></div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {challenge.is_solved && <span className="flex items-center gap-1 text-[10px] text-success"><CheckCircle className="w-3 h-3" /></span>}
                            {challenge.challenge_type === 'instance' ? (
                              <span className="px-3 py-1 rounded bg-blue-dim/30 border border-blue-core/30 text-blue-glow text-xs flex items-center gap-1 pointer-events-none"><Radio className="w-3 h-3" /> Instance</span>
                            ) : challenge.file_url ? (
                              <span className="px-3 py-1 rounded bg-warning/10 border border-warning/30 text-warning text-xs flex items-center gap-1 pointer-events-none"><Download className="w-3 h-3" /> Assets</span>
                            ) : (
                              <span className="px-3 py-1 rounded bg-blue-dim/30 border border-blue-core/30 text-blue-glow text-xs flex items-center gap-1 pointer-events-none"><Unlock className="w-3 h-3" /> Solve</span>
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
