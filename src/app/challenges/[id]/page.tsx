'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Swords, Trophy, Lightbulb,
  Loader2, BookOpen, AlertTriangle, Flag, Download, Droplet, ExternalLink,
  CheckCircle, XCircle, Send,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

const categoryConfig: Record<string, { color: string; icon: string; label: string }> = {
  crypto: { color: '#00ff88', icon: '🔐', label: 'Crypto' },
  web: { color: '#00d4ff', icon: '🌐', label: 'Web' },
  reverse: { color: '#7b2ff7', icon: '⚙️', label: 'Reverse' },
  forensics: { color: '#ffd700', icon: '🔍', label: 'Forensics' },
  osint: { color: '#ff6b35', icon: '🕵️', label: 'OSINT' },
  pwn: { color: '#e74c3c', icon: '💥', label: 'Pwn' },
  misc: { color: '#ff2d79', icon: '🎲', label: 'Misc' },
};

const difficultyConfig: Record<string, { label: string; color: string; badge: string }> = {
  easy: { label: 'Easy', color: 'text-green-400', badge: 'bg-green-500/10 border-green-500/30 text-green-400' },
  medium: { label: 'Medium', color: 'text-yellow-400', badge: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
  hard: { label: 'Hard', color: 'text-red-400', badge: 'bg-red-500/10 border-red-500/30 text-red-400' },
  expert: { label: 'Expert', color: 'text-purple-400', badge: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
};

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useStore();
  const [mounted, setMounted] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [flag, setFlag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; message: string; points_awarded?: number; first_blood?: boolean } | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || !user)) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, user, router]);

  useEffect(() => {
    if (!mounted || !isAuthenticated || !user) return;
    const id = params.id;
    if (!id) return;
    setLoading(true);
    api.getChallenge(Number(id))
      .then(setChallenge)
      .catch(() => toast.error('Failed to load challenge'))
      .finally(() => setLoading(false));
  }, [mounted, isAuthenticated, user, params.id]);

  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || !flag.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      const data = await api.submitFlag(challenge.id, flag.trim());
      const msg = data.correct
        ? (data.first_blood ? 'Correct flag! First blood bonus awarded!' : 'Correct flag! Points awarded.')
        : 'Incorrect flag. Try again.';
      setResult({ correct: data.correct, message: msg, points_awarded: data.points_awarded, first_blood: data.first_blood });
      if (data.correct) {
        toast.success('Flag accepted!');
        setChallenge((prev: any) => ({ ...prev, is_solved: true }));
      } else {
        toast.error('Incorrect flag');
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Submission failed';
      setResult({ correct: false, message: detail });
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-core animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-surface rounded w-1/3" />
            <div className="h-6 bg-surface rounded w-2/3" />
            <div className="h-4 bg-surface rounded w-full" />
            <div className="h-4 bg-surface rounded w-3/4" />
            <div className="h-32 bg-surface rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-txt-muted mx-auto mb-4" />
          <p className="text-txt-secondary font-mono text-lg">Challenge not found</p>
          <button
            onClick={() => router.push('/challenges')}
            className="mt-4 btn-outline px-6 py-3 rounded-lg text-sm"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" /> Back to Challenges
          </button>
        </div>
      </div>
    );
  }

  const cat = categoryConfig[challenge.category] || categoryConfig.misc;
  const diff = difficultyConfig[challenge.difficulty] || difficultyConfig.easy;

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Back button */}
          <button
            onClick={() => router.push('/challenges')}
            className="flex items-center gap-2 text-txt-muted hover:text-txt-primary font-mono text-xs sm:text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Challenges
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                <span className="text-sm font-mono uppercase tracking-wider px-2 py-0.5 rounded border" style={{ color: cat.color, borderColor: `${cat.color}33`, backgroundColor: `${cat.color}10` }}>
                  {cat.label}
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${diff.badge}`}>
                  {diff.label}
                </span>
                {challenge.is_solved && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded border bg-green-500/10 border-green-500/30 text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> SOLVED
                  </span>
                )}
              </div>
              <h1 className="text-txt-primary font-display text-2xl sm:text-3xl font-bold">{challenge.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
                <Trophy className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-display text-lg font-bold">{challenge.points}pts</span>
              </div>
              {challenge.solver_count > 0 && (
                <div className="flex items-center gap-1.5 text-txt-muted font-mono text-xs">
                  <Swords className="w-4 h-4" />
                  {challenge.solver_count} solves
                </div>
              )}
              {challenge.blood_points > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-core/10 border border-red-core/30">
                  <Droplet className="w-4 h-4 text-red-core" />
                  <span className="text-red-core font-mono text-xs font-bold">First Blood +{challenge.blood_points}pts</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="card rounded-xl p-5 sm:p-7 mb-4">
            <h2 className="text-txt-primary font-display text-lg mb-3 flex items-center gap-2 font-semibold">
              <BookOpen className="w-5 h-5 text-blue-core" /> Description
            </h2>
            <p className="text-txt-secondary font-mono text-sm leading-relaxed whitespace-pre-wrap">{challenge.description}</p>
          </div>

          {/* Hint */}
          {challenge.hint && (
            <div className="flex items-start gap-3 mb-4 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
              <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-300/80 font-mono text-sm leading-relaxed">{challenge.hint}</p>
            </div>
          )}

          {/* Instance Challenge */}
          {challenge.challenge_type === 'instance' && (
            <div className="card rounded-xl p-5 sm:p-7 mb-4">
              <h2 className="text-txt-primary font-display text-lg mb-4 flex items-center gap-2 font-semibold">
                <ExternalLink className="w-5 h-5 text-blue-core" /> Instance Challenge
              </h2>
              <p className="text-txt-secondary font-mono text-sm leading-relaxed mb-4">
                This challenge requires you to interact with a live instance. Click below to open it.
              </p>
              <a
                href={challenge.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-6 py-2.5 rounded-lg text-sm inline-flex items-center gap-2 w-fit"
              >
                <ExternalLink className="w-4 h-4" />
                Open Instance
              </a>
            </div>
          )}

          {/* Assets */}
          {challenge.challenge_type === 'asset' && challenge.file_url && (
            <div className="card rounded-xl p-5 sm:p-7 mb-4">
              <h2 className="text-txt-primary font-display text-lg mb-4 flex items-center gap-2 font-semibold">
                <Download className="w-5 h-5 text-blue-core" /> Assets
              </h2>
              <div className="flex items-center gap-3">
                <code className="flex-1 px-4 py-3 rounded-lg bg-void border border-border-c text-blue-core font-mono text-xs sm:text-sm break-all">
                  {challenge.file_url.split('/').pop()}
                </code>
                <a
                  href={challenge.file_url}
                  download
                  className="btn-primary px-5 py-2.5 rounded-lg text-sm whitespace-nowrap inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          )}

          {/* Dynamic flag notice */}
          {challenge.flag_mode && challenge.flag_mode !== 'static' && (
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 mb-4">
              <div className="flex items-start gap-2">
                <Flag className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-purple-300/80 font-mono text-xs leading-relaxed">
                  This challenge uses <strong className="text-txt-primary">dynamic flags</strong> — each player receives a unique flag.
                  Sharing your flag with others will not help them solve this challenge.
                </p>
              </div>
            </div>
          )}

          {/* Flag Submission Form */}
          <div className="card rounded-xl p-5 sm:p-7">
            <h2 className="text-txt-primary font-display text-lg mb-4 flex items-center gap-2 font-semibold">
              <Flag className="w-5 h-5 text-red-core" /> Submit Flag
            </h2>

            {challenge.is_solved ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-mono text-sm">You already solved this challenge!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitFlag} className="space-y-4">
                <div>
                  <label className="block text-txt-muted font-mono text-xs mb-2">
                    Flag format: <span className="text-txt-secondary">CGS{'{...}'}</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={flag}
                      onChange={(e) => { setFlag(e.target.value); setResult(null); }}
                      placeholder="CGS{your_flag_here}"
                      className="input-field flex-1 px-4 py-3 rounded-lg font-mono text-sm"
                      required
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="submit"
                      disabled={submitting || !flag.trim()}
                      className="btn-primary px-5 py-3 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all inline-flex items-center gap-2"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </div>

                {/* Result feedback */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 p-4 rounded-lg border ${
                      result.correct
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-core/10 border-red-core/30'
                    }`}
                  >
                    {result.correct ? (
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-core mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`font-mono text-sm font-semibold ${result.correct ? 'text-green-400' : 'text-red-core'}`}>
                        {result.correct ? 'CORRECT FLAG' : 'INCORRECT FLAG'}
                      </p>
                      <p className={`font-mono text-xs mt-1 ${result.correct ? 'text-green-400/80' : 'text-red-core/80'}`}>
                        {result.message}
                      </p>
                      {result.correct && result.points_awarded !== undefined && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-xs">
                            +{result.points_awarded} pts
                          </span>
                          {result.first_blood && (
                            <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono text-xs">
                              FIRST BLOOD
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
