'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, CheckCircle, Zap, Trophy, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function SubmitFlagPage() {
  const router = useRouter();
  const { isAuthenticated } = useStore();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set());
  const [selectedId, setSelectedId] = useState('');
  const [flag, setFlag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [chals, solved] = await Promise.all([
        api.getPublicChallenges(),
        api.getUserSolves().catch(() => []),
      ]);
      setChallenges(chals);
      setSolvedIds(new Set(solved.map((s: any) => s.challenge_id)));
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!selectedId || !flag.trim()) { toast.error('Select a challenge and enter a flag'); return; }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.submitFlag(Number(selectedId), flag.trim());
      setResult(res);
      setSolvedIds(prev => new Set(prev).add(Number(selectedId)));
      setFlag('');

      const msg = res.first_blood
        ? `FIRST BLOOD! ${res.total_points_awarded}pts (${res.points_awarded} + ${res.first_blood_bonus} bonus)`
        : `+${res.points_awarded} points`;
      toast.success(msg, { duration: 5000, style: { background: '#065f46', color: '#fff', border: '1px solid #10b981' } });
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Incorrect flag';
      toast.error(detail);
    } finally { setSubmitting(false); }
  };

  const unsolved = challenges.filter(c => !solvedIds.has(c.id));

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--aurora-cyan)] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <button onClick={() => router.push('/challenges')}
          className="flex items-center gap-2 text-txt-muted font-mono text-sm hover:text-[var(--aurora-cyan)] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Challenges
        </button>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card rounded-2xl p-8 border-l-4 border-l-[var(--aurora-cyan)]">
            <h1 className="font-display text-2xl text-txt-primary mb-2 flex items-center gap-3">
              <Flag className="w-6 h-6 text-[var(--aurora-cyan)]" /> Submit Flag
            </h1>
            <p className="text-txt-secondary font-mono text-sm mb-8">Enter your flag below. First solver earns a <span className="text-yellow-300">+100 blood bonus</span>.</p>

            <div className="space-y-5">
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-txt-muted block mb-2">Challenge</label>
                <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                  className="input-field w-full px-4 py-3 rounded-xl font-mono text-sm bg-[#0a0f18]">
                  <option value="">Select a challenge...</option>
                  {unsolved.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.category} — {c.points}pts)</option>
                  ))}
                </select>
                {unsolved.length === 0 && challenges.length > 0 && (
                  <p className="text-[var(--aurora-emerald)] font-mono text-xs mt-2">You&apos;ve solved all available challenges!</p>
                )}
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-txt-muted block mb-2">Flag</label>
                <input type="text" value={flag} onChange={e => setFlag(e.target.value)}
                  placeholder="CGS{...}" autoFocus
                  className="input-field w-full px-4 py-3 rounded-xl font-mono text-sm"
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }} />
              </div>

              <button onClick={handleSubmit} disabled={submitting || !selectedId || !flag.trim()}
                className="w-full py-3 rounded-xl bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] font-mono text-sm hover:bg-[rgba(34,211,238,0.2)] disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                <Flag className="w-4 h-4" /> {submitting ? 'Checking...' : 'Submit Flag'}
              </button>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-8 rounded-xl p-6 border bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.3)]">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-[var(--aurora-emerald)]" />
                    <span className="font-display text-lg text-[var(--aurora-emerald)]">Correct Flag!</span>
                  </div>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex items-center gap-2 text-txt-secondary">
                      <Trophy className="w-4 h-4 text-[var(--aurora-emerald)]" /> Score: <span className="text-txt-primary">+{result.points_awarded} points</span>
                    </div>
                    {result.first_blood && (
                      <div className="flex items-center gap-2 text-yellow-300">
                        <Zap className="w-4 h-4" /> FIRST BLOOD! <span className="font-bold">+{result.first_blood_bonus} bonus points</span>
                      </div>
                    )}
                    <div className="text-txt-muted text-xs pt-2 border-t border-[rgba(16,185,129,0.2)] mt-2">
                      Total earned: <span className="text-txt-primary font-bold">{result.total_points_awarded} points</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
