'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag, Loader2, CheckCircle, XCircle, Swords,
  Trophy, Clock, X, Send,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function FlagSubmitPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useStore();
  const [mounted, setMounted] = useState(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [challengeId, setChallengeId] = useState('');
  const [flag, setFlag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [result, setResult] = useState<{ correct: boolean; message: string; points_awarded?: number; first_blood?: boolean } | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || !user)) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, user, router]);

  useEffect(() => {
    if (!mounted || !isAuthenticated || !user) return;
    setLoadingChallenges(true);
    api.getChallenges()
      .then(setChallenges)
      .catch(() => {})
      .finally(() => setLoadingChallenges(false));
  }, [mounted, isAuthenticated, user]);

  useEffect(() => {
    if (!mounted || !isAuthenticated || !user) return;
    setLoadingSubmissions(true);
    api.getMySubmissions(10)
      .then(setSubmissions)
      .catch(() => {})
      .finally(() => setLoadingSubmissions(false));
  }, [mounted, isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId || !flag.trim()) return;
    setSubmitting(true);
    setResult(null);
    setShowPopup(false);
    try {
      const data = await api.submitFlag(Number(challengeId), flag.trim());
      const msg = data.correct
        ? (data.first_blood ? 'Correct flag! First blood bonus awarded!' : 'Correct flag! Points awarded.')
        : 'Incorrect flag. Try again.';
      setResult({ correct: data.correct, message: msg, points_awarded: data.points_awarded, first_blood: data.first_blood });
      setShowPopup(true);
      if (data.correct) toast.success('Flag accepted!');
      else toast.error('Incorrect flag');
      api.getMySubmissions(10).then(setSubmissions).catch(() => {});
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Submission failed';
      setResult({ correct: false, message: detail });
      setShowPopup(true);
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedChallenge = challenges.find((c) => c.id === Number(challengeId));

  const difficultyConfig: Record<string, { label: string; badge: string }> = {
    easy: { label: 'Easy', badge: 'badge-easy' },
    medium: { label: 'Medium', badge: 'badge-medium' },
    hard: { label: 'Hard', badge: 'badge-hard' },
    expert: { label: 'Expert', badge: 'badge-expert' },
  };

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-aurora-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl sm:text-3xl text-txt-primary flex items-center gap-3 font-bold">
              <Flag className="w-6 h-6 sm:w-8 sm:h-8 text-aurora-violet" />
              Flag Submit
            </h1>
            <p className="text-txt-muted font-mono text-xs sm:text-sm mt-1">
              Select a challenge and submit your flag
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Submit Form */}
            <div className="lg:col-span-7">
              <div className="card rounded-xl p-5 sm:p-7">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-txt-muted font-mono text-xs mb-2">Challenge</label>
                    {loadingChallenges ? (
                      <div className="h-11 bg-surface rounded-lg animate-pulse" />
                    ) : (
                      <select
                        value={challengeId}
                        onChange={(e) => { setChallengeId(e.target.value); setResult(null); setShowPopup(false); }}
                        className="input-field w-full px-4 py-2.5 rounded-lg font-mono text-sm"
                        required
                      >
                        <option value="">-- Select a challenge --</option>
                        {challenges.map((c) => (
                          <option key={c.id} value={c.id}>
                            [{c.category}] {c.title} ({c.points}pts)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {selectedChallenge && (
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className={`px-2 py-0.5 rounded border ${difficultyConfig[selectedChallenge.difficulty]?.badge || 'badge-easy'}`}>
                        {selectedChallenge.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-green-400">
                        <Trophy className="w-3 h-3" /> {selectedChallenge.points}pts
                      </span>
                      {selectedChallenge.solver_count > 0 && (
                        <span className="flex items-center gap-1 text-txt-muted">
                          <Swords className="w-3 h-3" /> {selectedChallenge.solver_count} solves
                        </span>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-txt-muted font-mono text-xs mb-2">
                      Flag <span className="text-txt-muted/60">(format: CGS{'{...}'})</span>
                    </label>
                    <input
                      type="text"
                      value={flag}
                      onChange={(e) => { setFlag(e.target.value); setResult(null); setShowPopup(false); }}
                      placeholder="CGS{your_flag_here}"
                      className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm"
                      required
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !challengeId || !flag.trim()}
                    className="btn-primary w-full py-3 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? 'Submitting...' : 'Submit Flag'}
                  </button>
                </form>

                {/* Result Popup */}
                <AnimatePresence>
                  {showPopup && result && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                      onClick={() => setShowPopup(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.85, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className={`relative w-full max-w-sm rounded-xl p-8 border ${
                          result.correct
                            ? 'bg-surface border-green-500/30'
                            : 'bg-surface border-aurora-violet/30'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setShowPopup(false)}
                          className="absolute top-3 right-3 p-1 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-surface transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                          {result.correct ? (
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                              <CheckCircle className="w-10 h-10 text-green-400" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-aurora-violet/10 flex items-center justify-center mb-4">
                              <XCircle className="w-10 h-10 text-aurora-violet" />
                            </div>
                          )}

                          <h3 className={`font-display text-xl mb-2 ${
                            result.correct ? 'text-green-400' : 'text-aurora-violet'
                          }`}>
                            {result.correct ? 'CORRECT FLAG' : 'INCORRECT FLAG'}
                          </h3>

                          <p className={`font-mono text-sm mb-4 ${
                            result.correct ? 'text-green-400/80' : 'text-aurora-violet/80'
                          }`}>
                            {result.message}
                          </p>

                          {result.correct && result.points_awarded !== undefined && (
                            <div className="flex items-center gap-3 text-xs font-mono mb-2">
                              <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
                                +{result.points_awarded} pts
                              </span>
                              {result.first_blood && (
                                <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
                                  FIRST BLOOD
                                </span>
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => setShowPopup(false)}
                            className={`mt-2 px-6 py-2 rounded-lg font-display text-xs border transition-colors ${
                              result.correct
                                ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                                : 'border-aurora-violet/30 text-aurora-violet hover:bg-aurora-violet/10'
                            }`}
                          >
                            CLOSE
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="lg:col-span-5">
              <div className="card rounded-xl p-5 sm:p-7">
                <h2 className="text-txt-primary font-display text-lg mb-4 flex items-center gap-2 font-semibold">
                  <Clock className="w-5 h-5 text-txt-muted" /> Recent Submissions
                </h2>
                {loadingSubmissions ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-surface rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : submissions.length === 0 ? (
                  <p className="text-txt-muted font-mono text-sm text-center py-6">No submissions yet</p>
                ) : (
                  <div className="space-y-2">
                    {submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          sub.is_correct
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-surface border-border-c'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {sub.is_correct
                            ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            : <XCircle className="w-4 h-4 text-aurora-violet flex-shrink-0" />
                          }
                          <span className="font-mono text-sm text-txt-secondary truncate">
                            {sub.challenge_title || `Challenge #${sub.challenge_id}`}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-txt-muted flex-shrink-0 ml-2">
                          {new Date(sub.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
