'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, CheckCircle, Trophy, Zap, ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function SolveChallengePage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flag, setFlag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadChallenge();
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (!loading && !solved && challenge) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [loading, solved, challenge]);

  const loadChallenge = async () => {
    try {
      const data = await api.getPublicChallenge(Number(id));
      setChallenge(data);
      try {
        const solved = await api.getUserSolves();
        setSolved(solved.some((s: any) => s.challenge_id === Number(id)));
      } catch {}
    } catch {
      toast.error('Challenge not found');
      router.push('/challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!flag.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.submitFlag(Number(id), flag.trim());
      setResult(res);
      setSolved(true);
      setFlag('');

      const msg = res.first_blood
        ? `FIRST BLOOD! +${res.total_points_awarded}pts`
        : `+${res.points_awarded} points`;
      toast.success(msg, { duration: 5000, style: { background: '#065f46', color: '#fff', border: '1px solid #10b981' } });
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Incorrect flag';
      toast.error(detail);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--aurora-cyan)] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!challenge) return null;

  const catColors: Record<string, string> = {
    web: 'text-[var(--aurora-cyan)]', crypto: 'text-[var(--aurora-violet)]',
    forensics: 'text-[var(--aurora-emerald)]', reverse: 'text-amber-400', misc: 'text-pink-400',
  };
  const catBgs: Record<string, string> = {
    web: 'bg-[rgba(34,211,238,0.08)] border-[rgba(34,211,238,0.2)]',
    crypto: 'bg-[rgba(124,92,255,0.08)] border-[rgba(124,92,255,0.2)]',
    forensics: 'bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.2)]',
    reverse: 'bg-[rgba(251,191,36,0.08)] border-[rgba(251,191,36,0.2)]',
    misc: 'bg-[rgba(244,114,182,0.08)] border-[rgba(244,114,182,0.2)]',
  };
  const diffMeta: Record<string, { label: string; bars: number; color: string }> = {
    easy: { label: 'Easy', bars: 1, color: 'bg-[var(--aurora-emerald)]' },
    medium: { label: 'Medium', bars: 2, color: 'bg-[var(--aurora-cyan)]' },
    hard: { label: 'Hard', bars: 3, color: 'bg-[#FF4500]' },
  };
  const diff = diffMeta[challenge.difficulty] || { label: 'Unknown', bars: 0, color: 'bg-txt-muted' };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <button onClick={() => router.push(`/challenges/${id}`)}
          className="flex items-center gap-2 text-txt-muted font-mono text-sm hover:text-[var(--aurora-cyan)] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Challenge
        </button>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--aurora-violet)]/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Challenge info */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[11px] font-mono uppercase tracking-wider ${catColors[challenge.category] || 'text-txt-muted'}`}>
                {challenge.category}
              </span>
              <span className="text-txt-muted">·</span>
              <span className="text-[11px] font-mono text-txt-secondary">
                {diff.label}
              </span>
              <div className="flex gap-[2px] ml-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-3 h-1 rounded-full ${i <= diff.bars ? diff.color : 'bg-white/[0.06]'}`} />
                ))}
              </div>
              <span className="text-txt-muted ml-1">·</span>
              <span className="text-[11px] font-mono text-txt-secondary">{challenge.points} pts</span>
            </div>

            <h1 className="font-display text-2xl text-txt-primary mb-2">{challenge.title}</h1>

            <p className="text-sm font-mono text-txt-secondary leading-relaxed mb-6">{challenge.description}</p>

            {/* Hint */}
            {challenge.hint && (
              <details className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <summary className="text-txt-muted font-mono text-xs uppercase tracking-wider cursor-pointer hover:text-[var(--aurora-cyan)] transition-colors select-none">
                  Need a hint?
                </summary>
                <p className="text-yellow-300 font-mono text-sm mt-3 italic">{challenge.hint}</p>
              </details>
            )}

            <div className="border-t border-white/[0.06] pt-6">
              {solved && !result ? (
                <div className="flex items-center gap-3 text-[var(--aurora-emerald)] font-mono text-sm py-3">
                  <CheckCircle className="w-5 h-5" /> Already solved
                </div>
              ) : (
                <>
                  <label className="font-mono text-xs uppercase tracking-wider text-txt-muted block mb-3">
                    Enter Flag
                  </label>
                  <motion.div animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={flag}
                        onChange={e => setFlag(e.target.value)}
                        placeholder="CGS{...}"
                        className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-txt-primary font-mono text-sm placeholder:text-txt-muted/40 focus:outline-none focus:border-[var(--aurora-cyan)]/40 focus:bg-white/[0.06] transition-all"
                        onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={submitting || !flag.trim()}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--aurora-cyan)]/15 to-[var(--aurora-cyan)]/5 border border-[var(--aurora-cyan)]/30 text-[var(--aurora-cyan)] font-mono text-sm hover:from-[var(--aurora-cyan)]/25 hover:to-[var(--aurora-cyan)]/10 hover:border-[var(--aurora-cyan)]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        <Flag className="w-4 h-4" />
                        {submitting ? 'Checking...' : 'Submit'}
                      </motion.button>
                    </div>
                  </motion.div>

                  <p className="text-txt-muted font-mono text-[10px] mt-3 uppercase tracking-wider">
                    Submit the correct flag to earn points
                  </p>
                </>
              )}
            </div>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-6 rounded-xl p-5 border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.06)]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-[var(--aurora-emerald)]" />
                    <span className="font-display text-lg text-[var(--aurora-emerald)]">Correct!</span>
                  </div>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex items-center gap-2 text-txt-secondary">
                      <Trophy className="w-4 h-4 text-[var(--aurora-emerald)]" />
                      Points: <span className="text-txt-primary">+{result.points_awarded}</span>
                    </div>
                    {result.first_blood && (
                      <div className="flex items-center gap-2 text-yellow-300">
                        <Zap className="w-4 h-4" />
                        FIRST BLOOD! <span className="font-bold">+{result.first_blood_bonus} bonus</span>
                      </div>
                    )}
                    <div className="text-txt-muted text-xs pt-2 border-t border-[rgba(16,185,129,0.2)] mt-2">
                      Total earned: <span className="text-[var(--aurora-emerald)] font-bold">{result.total_points_awarded} points</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/challenges')}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-txt-secondary font-mono text-xs hover:bg-white/[0.08] hover:text-txt-primary transition-all flex items-center gap-2"
                  >
                    <ArrowRight className="w-3.5 h-3.5" /> Back to Challenges
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
