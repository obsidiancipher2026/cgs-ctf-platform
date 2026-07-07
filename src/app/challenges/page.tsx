'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Flag, Lock, Unlock, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function ChallengesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitId, setSubmitId] = useState<number | null>(null);
  const [flagInput, setFlagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadChallenges();
  }, []);

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

  const handleSubmitFlag = async (challengeId: number) => {
    if (!flagInput.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.submitFlag(challengeId, flagInput.trim());
      toast.success(res.message);
      setSolvedIds(prev => new Set(prev).add(challengeId));
      setFlagInput('');
      setSubmitId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Incorrect flag');
    }
    finally { setSubmitting(false); }
  };

  const categories = Array.from(new Set(challenges.map(c => c.category)));
  const filtered = challenges.filter(c => {
    if (categoryFilter && c.category !== categoryFilter) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'easy': return 'text-[var(--aurora-emerald)]';
      case 'medium': return 'text-[var(--aurora-cyan)]';
      case 'hard': return 'text-[#FF4500]';
      default: return 'text-txt-muted';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display text-3xl text-txt-primary mb-2">CGS Challenges</h1>
          <p className="text-txt-secondary font-mono text-sm">
            {challenges.length} challenges available · {solvedIds.size} solved
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search challenges..." className="input-field w-full pl-9 pr-4 py-2.5 rounded-xl font-mono text-sm" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="input-field px-4 py-2.5 rounded-xl font-mono text-sm bg-[#0a0f18]">
            <option value="">All Categories</option>
            {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
          </select>
        </div>

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

                  {solved && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-5 h-5 text-[var(--aurora-emerald)]" />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display text-txt-primary text-base">{challenge.title}</h3>
                      <div className="flex gap-2 mt-1.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[rgba(124,92,255,0.12)] text-[var(--aurora-violet)]">{challenge.category}</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-black/30 ${getDifficultyColor(challenge.difficulty)}`}>{challenge.difficulty}</span>
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
                      <p className="text-txt-muted font-mono text-xs mt-2 italic">{challenge.hint}</p>
                    </details>
                  )}

                  {challenge.files && (
                    <div className="mb-3 text-[10px] font-mono text-txt-muted flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> Challenge files available
                    </div>
                  )}

                  <div className="border-t border-[rgba(34,211,238,0.08)] pt-3 mt-3">
                    {solved ? (
                      <div className="flex items-center gap-2 text-[var(--aurora-emerald)] font-mono text-xs" onClick={e => e.stopPropagation()}>
                        <CheckCircle className="w-4 h-4" /> Solved
                      </div>
                    ) : !isAuthenticated ? (
                      <div className="flex items-center gap-2 text-txt-muted font-mono text-xs" onClick={e => e.stopPropagation()}>
                        <Lock className="w-4 h-4" /> <a href="/login" className="text-[var(--aurora-cyan)] hover:underline" onClick={e => e.stopPropagation()}>Login</a> to submit flags
                      </div>
                    ) : submitId === challenge.id ? (
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <input type="text" value={flagInput} onChange={e => setFlagInput(e.target.value)}
                          placeholder="CGS{...}" autoFocus
                          className="input-field flex-1 px-3 py-1.5 rounded-lg font-mono text-xs"
                          onKeyDown={e => { if (e.key === 'Enter') handleSubmitFlag(challenge.id); }} />
                        <button onClick={() => handleSubmitFlag(challenge.id)} disabled={submitting}
                          className="px-3 py-1.5 rounded-lg bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] font-mono text-xs hover:bg-[rgba(34,211,238,0.2)] disabled:opacity-50 transition-all">
                          {submitting ? '...' : 'Submit'}
                        </button>
                        <button onClick={() => { setSubmitId(null); setFlagInput(''); }}
                          className="p-1.5 rounded-lg bg-[rgba(155,164,178,0.1)] text-txt-secondary hover:bg-[rgba(155,164,178,0.2)] transition-all">
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); setSubmitId(challenge.id); }}
                        className="w-full py-2 rounded-lg bg-[rgba(34,211,238,0.08)] border border-[rgba(34,211,238,0.15)] text-[var(--aurora-cyan)] font-mono text-xs hover:bg-[rgba(34,211,238,0.15)] transition-all flex items-center justify-center gap-1.5">
                        <Flag className="w-3.5 h-3.5" /> Submit Flag
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
