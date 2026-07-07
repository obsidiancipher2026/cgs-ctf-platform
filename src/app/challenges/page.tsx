'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Lock, Unlock, Search, Filter, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

const diffColors: Record<string, string> = {
  easy: 'text-[var(--aurora-emerald)]',
  medium: 'text-[var(--aurora-cyan)]',
  hard: 'text-[#FF4500]',
};

const catColors: Record<string, string> = {
  web: 'text-[var(--aurora-cyan)]',
  crypto: 'text-[var(--aurora-violet)]',
  forensics: 'text-[var(--aurora-emerald)]',
  reverse: 'text-amber-400',
  misc: 'text-pink-400',
  warmup: 'text-yellow-400',
};

const catBgColors: Record<string, string> = {
  web: 'bg-[rgba(34,211,238,0.1)] border-[rgba(34,211,238,0.25)]',
  crypto: 'bg-[rgba(124,92,255,0.1)] border-[rgba(124,92,255,0.25)]',
  forensics: 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.25)]',
  reverse: 'bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.25)]',
  misc: 'bg-[rgba(244,114,182,0.1)] border-[rgba(244,114,182,0.25)]',
  warmup: 'bg-[rgba(250,204,21,0.1)] border-[rgba(250,204,21,0.25)]',
};

const diffBgColors: Record<string, string> = {
  easy: 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.25)]',
  medium: 'bg-[rgba(34,211,238,0.1)] border-[rgba(34,211,238,0.25)]',
  hard: 'bg-[rgba(255,69,0,0.1)] border-[rgba(255,69,0,0.25)]',
};

export default function ChallengesPage() {
  const router = useRouter();
  const { isAuthenticated } = useStore();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadChallenges(); }, []);

  const loadChallenges = async () => {
    try {
      const data = await api.getPublicChallenges();
      setChallenges(data);
      if (isAuthenticated) {
        try {
          const solved = await api.getUserSolves();
          setSolvedIds(new Set(solved.map((s: any) => s.challenge_id)));
        } catch {}
      }
    } catch { toast.error('Failed to load challenges'); }
    finally { setLoading(false); }
  };

  const categories = Array.from(new Set(challenges.map(c => c.category)));
  const difficulties = Array.from(new Set(challenges.map(c => c.difficulty)));

  const filtered = challenges.filter(c => {
    if (categoryFilter && c.category !== categoryFilter) return false;
    if (difficultyFilter && c.difficulty !== difficultyFilter) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f]">
      <div className="max-w-7xl mx-auto px-4 py-10 flex gap-8">
        <aside className="w-56 shrink-0 hidden md:block">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-24 space-y-6">
            <div>
              <h2 className="font-display text-sm text-txt-primary mb-3 flex items-center gap-2"><Filter className="w-3.5 h-3.5" /> Filters</h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-txt-muted" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..." className="input-field w-full pl-8 pr-3 py-2 rounded-lg font-mono text-xs" />
              </div>
            </div>
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-wider text-txt-muted mb-2">Category</h3>
              <div className="space-y-1">
                <button onClick={() => setCategoryFilter('')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${!categoryFilter ? 'bg-[rgba(34,211,238,0.08)] text-[var(--aurora-cyan)]' : 'text-txt-muted hover:text-txt-secondary'}`}>All Categories</button>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat === categoryFilter ? '' : cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${categoryFilter === cat ? `${catBgColors[cat]} ${catColors[cat]}` : 'text-txt-muted hover:text-txt-secondary'}`}>{cat}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-wider text-txt-muted mb-2">Difficulty</h3>
              <div className="space-y-1">
                <button onClick={() => setDifficultyFilter('')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${!difficultyFilter ? 'bg-[rgba(34,211,238,0.08)] text-[var(--aurora-cyan)]' : 'text-txt-muted hover:text-txt-secondary'}`}>All Difficulties</button>
                {difficulties.map(diff => (
                  <button key={diff} onClick={() => setDifficultyFilter(diff === difficultyFilter ? '' : diff)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${difficultyFilter === diff ? `${diffBgColors[diff]} ${diffColors[diff]}` : 'text-txt-muted hover:text-txt-secondary'}`}>{diff}</button>
                ))}
              </div>
            </div>
          </motion.div>
        </aside>
        <div className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-3xl text-txt-primary mb-2">CGS Challenges</h1>
            <p className="text-txt-secondary font-mono text-sm">
              {challenges.length} challenges available · {solvedIds.size} solved
              {(categoryFilter || difficultyFilter) && <span className="ml-2 text-txt-muted">· {filtered.length} shown</span>}
            </p>
          </motion.div>
          {loading ? (
            <div className="text-center py-20"><div className="w-8 h-8 border-2 border-[var(--aurora-cyan)] border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-txt-muted font-mono">No challenges found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((challenge, i) => {
              const solved = solvedIds.has(challenge.id);
              return (
                <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/challenges/${challenge.id}`)}
                  className={`card rounded-xl p-5 border-l-4 cursor-pointer ${solved ? 'border-l-[var(--aurora-emerald)]' : 'border-l-[var(--aurora-cyan)]'} relative overflow-hidden hover:bg-[rgba(34,211,238,0.02)] transition-colors`}>
                  {solved && <div className="absolute top-3 right-3"><CheckCircle className="w-5 h-5 text-[var(--aurora-emerald)]" /></div>}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display text-txt-primary text-base">{challenge.title}</h3>
                      <div className="flex gap-2 mt-1.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[rgba(124,92,255,0.12)] text-[var(--aurora-violet)]">{challenge.category}</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-black/30 ${diffColors[challenge.difficulty] || 'text-txt-muted'}`}>{challenge.difficulty}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg text-txt-primary">{challenge.points}</div>
                      <div className="text-txt-muted font-mono text-[10px] uppercase tracking-wider">Points</div>
                    </div>
                  </div>
                  <p className="text-txt-secondary font-mono text-xs leading-relaxed mb-4 line-clamp-3">{challenge.description}</p>
                  {challenge.hint && (
                    <details className="mb-4" onClick={e => e.stopPropagation()}>
                      <summary className="text-txt-muted font-mono text-[10px] uppercase tracking-wider cursor-pointer hover:text-[var(--aurora-cyan)] transition-colors">Hint</summary>
                      <p className="text-yellow-300 font-mono text-xs mt-2 italic">{challenge.hint}</p>
                    </details>
                  )}
                  {challenge.files && <div className="mb-3 text-[10px] font-mono text-txt-muted flex items-center gap-1"><Unlock className="w-3 h-3" /> Challenge files available</div>}
                  <div className="border-t border-[rgba(34,211,238,0.08)] pt-3 mt-3">
                    {solved ? (
                      <div className="flex items-center gap-2 text-[var(--aurora-emerald)] font-mono text-xs" onClick={e => e.stopPropagation()}>
                        <CheckCircle className="w-4 h-4" /> Solved
                      </div>
                    ) : (
                      <div onClick={e => e.stopPropagation()}
                        className="flex items-center gap-2 text-[var(--aurora-cyan)] font-mono text-xs hover:text-[rgba(34,211,238,0.7)] transition-colors">
                        <ExternalLink className="w-4 h-4" /> View Challenge
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
