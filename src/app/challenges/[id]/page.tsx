'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Flag, Download, ExternalLink, ArrowLeft, Lock, Unlock, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function ChallengeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useStore();
  const [challenge, setChallenge] = useState<any>(null);
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(true);

  const files: { name: string }[] = challenge?.files ? JSON.parse(challenge.files) : [];

  useEffect(() => {
    loadChallenge();
  }, [id]);

  const loadChallenge = async () => {
    try {
      const data = await api.getPublicChallenge(Number(id));
      setChallenge(data);
      if (isAuthenticated) {
        try {
          const solved = await api.getUserSolves();
          setSolved(solved.some((s: any) => s.challenge_id === Number(id) || s.challengeId === Number(id)));
        } catch {}
      }
    } catch {
      toast.error('Challenge not found');
      router.push('/challenges');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--aurora-cyan)] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!challenge) return null;

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'easy': return 'text-[var(--aurora-emerald)]';
      case 'medium': return 'text-[var(--aurora-cyan)]';
      case 'hard': return 'text-[#FF4500]';
      default: return 'text-txt-muted';
    }
  };

  const diffMeta: Record<string, { label: string; bars: number; color: string }> = {
    easy: { label: 'Easy', bars: 1, color: 'bg-[var(--aurora-emerald)]' },
    medium: { label: 'Medium', bars: 2, color: 'bg-[var(--aurora-cyan)]' },
    hard: { label: 'Hard', bars: 3, color: 'bg-[#FF4500]' },
  };
  const diff = diffMeta[challenge.difficulty] || { label: 'Unknown', bars: 0, color: 'bg-txt-muted' };

  const catColors: Record<string, string> = {
    web: 'text-[var(--aurora-cyan)]', crypto: 'text-[var(--aurora-violet)]',
    forensics: 'text-[var(--aurora-emerald)]', reverse: 'text-amber-400', misc: 'text-pink-400',
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f]">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <button onClick={() => router.push('/challenges')}
          className="flex items-center gap-2 text-txt-muted font-mono text-sm hover:text-[var(--aurora-cyan)] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Challenges
        </button>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--aurora-violet)]/5 rounded-full blur-[100px] pointer-events-none" />

            {solved && (
              <div className="absolute top-4 right-4 flex items-center gap-2 text-[var(--aurora-emerald)] font-mono text-sm">
                <CheckCircle className="w-5 h-5" /> Solved
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[11px] font-mono uppercase tracking-wider ${catColors[challenge.category] || 'text-txt-muted'}`}>
                    {challenge.category}
                  </span>
                  <span className="text-txt-muted">·</span>
                  <span className={`text-[11px] font-mono ${getDifficultyColor(challenge.difficulty)}`}>
                    {diff.label}
                  </span>
                  <div className="flex gap-[2px]">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`w-4 h-1.5 rounded-full ${i <= diff.bars ? diff.color : 'bg-white/[0.06]'}`} />
                    ))}
                  </div>
                </div>
                <h1 className="font-display text-3xl text-txt-primary mb-2">{challenge.title}</h1>
                <p className="text-sm font-mono text-txt-secondary leading-relaxed">{challenge.description}</p>
              </div>
              <div className="shrink-0 ml-6 text-right">
                <div className="font-display text-4xl text-txt-primary tabular-nums">{challenge.points}</div>
                <div className="text-txt-muted font-mono text-[10px] uppercase tracking-wider">Points</div>
              </div>
            </div>

            {/* Hint */}
            {challenge.hint && (
              <details className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <summary className="text-txt-muted font-mono text-xs uppercase tracking-wider cursor-pointer hover:text-[var(--aurora-cyan)] transition-colors select-none">
                  Need a hint?
                </summary>
                <p className="text-yellow-300 font-mono text-sm mt-3 italic leading-relaxed">{challenge.hint}</p>
              </details>
            )}

            {/* Assets + Instance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {files.length > 0 && (
                <div className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.06]">
                  <h3 className="font-display text-sm text-txt-primary mb-3 flex items-center gap-2">
                    <Download className="w-4 h-4 text-[var(--aurora-cyan)]" /> Download Assets
                  </h3>
                  <div className="space-y-2">
                    {files.map((f, i) => (
                      <a key={i} href={`/api/challenges/${id}/files?name=${f.name}`} download
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[var(--aurora-cyan)] font-mono text-xs hover:bg-white/[0.1] transition-all">
                        <Unlock className="w-3 h-3 shrink-0" /> {f.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {challenge.instanceUrl && (
                <div className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.06]">
                  <h3 className="font-display text-sm text-txt-primary mb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-[var(--aurora-emerald)]" /> Live Instance
                  </h3>
                  <a href={challenge.instanceUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--aurora-emerald)]/10 border border-[var(--aurora-emerald)]/25 text-[var(--aurora-emerald)] font-mono text-sm hover:bg-[var(--aurora-emerald)]/15 transition-all w-fit">
                    <ExternalLink className="w-4 h-4" /> Open Instance
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-white/[0.06] pt-6">
              {solved ? (
                <div className="flex items-center gap-3 text-[var(--aurora-emerald)] font-mono text-sm">
                  <CheckCircle className="w-5 h-5" /> You have solved this challenge
                </div>
              ) : !isAuthenticated ? (
                <div className="flex items-center gap-3 text-txt-muted font-mono text-sm">
                  <Lock className="w-4 h-4" /> <a href="/login" className="text-[var(--aurora-cyan)] hover:underline">Login</a> to submit flags
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/challenges/${id}/solve`)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--aurora-violet)]/20 to-[var(--aurora-cyan)]/10 border border-[var(--aurora-violet)]/25 text-sm font-mono text-txt-primary hover:from-[var(--aurora-violet)]/30 hover:to-[var(--aurora-cyan)]/20 hover:border-[var(--aurora-violet)]/40 transition-all flex items-center gap-2 w-fit"
                >
                  <Flag className="w-4 h-4 text-[var(--aurora-cyan)]" />
                  Submit Flag
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
