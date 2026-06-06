'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag, Loader2, CheckCircle, XCircle, Swords,
  Trophy, Clock, X,
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
        ? (data.first_blood ? 'Correct flag! First blood + bonus!' : 'Correct flag! Points awarded.')
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

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyber-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="font-cyber text-2xl sm:text-3xl text-white flex items-center gap-3 font-bold">
              <Flag className="w-6 h-6 sm:w-8 sm:h-8 text-cyber-blue" />
              Flag Submit
            </h1>
            <p className="text-gray-500 font-mono text-xs sm:text-sm mt-1">
              Submit flags for challenges
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
          <div className="cyber-card-glow rounded-2xl p-5 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-400 font-mono text-xs mb-2">Challenge</label>
                {loadingChallenges ? (
                  <div className="h-11 bg-gray-800/50 rounded-lg animate-pulse" />
                ) : (
                  <select
                    value={challengeId}
                    onChange={(e) => { setChallengeId(e.target.value); setResult(null); }}
                    className="cyber-input w-full px-4 py-2.5 rounded-lg font-mono text-sm"
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
                <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                  <span className="flex items-center gap-1">
                    <Swords className="w-3 h-3" /> {selectedChallenge.difficulty}
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-cyber-green" /> {selectedChallenge.points}pts
                  </span>
                </div>
              )}

              <div>
                <label className="block text-gray-400 font-mono text-xs mb-2">
                  Flag <span className="text-gray-600">(format: CGS{'{...}'})</span>
                </label>
                <input
                  type="text"
                  value={flag}
                  onChange={(e) => { setFlag(e.target.value); setResult(null); }}
                  placeholder="CGS{...}"
                  className="cyber-input w-full px-4 py-3 rounded-lg font-mono text-sm"
                  required
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !challengeId || !flag.trim()}
                className="cyber-btn cyber-btn-ripple w-full py-3 rounded-lg bg-gradient-to-r from-cyber-blue/20 to-cyber-green/20 border border-cyber-blue/50 text-white font-cyber text-sm hover:from-cyber-blue/30 hover:to-cyber-green/30 hover:shadow-[0_0_30px_rgba(0,229,255,0.2)] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                {submitting ? 'Submitting...' : 'Submit Flag'}
              </button>
            </form>

            {/* Submission Result Popup */}
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
                    className={`relative w-full max-w-sm rounded-2xl p-8 border-2 ${
                      result.correct
                        ? 'bg-gray-900/95 border-cyber-green/40 shadow-[0_0_40px_rgba(0,255,136,0.15)]'
                        : 'bg-gray-900/95 border-cyber-red/40 shadow-[0_0_40px_rgba(255,0,51,0.15)]'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setShowPopup(false)}
                      className="absolute top-3 right-3 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                      {result.correct ? (
                        <div className="w-16 h-16 rounded-full bg-cyber-green/20 flex items-center justify-center mb-4">
                          <CheckCircle className="w-10 h-10 text-cyber-green" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-cyber-red/20 flex items-center justify-center mb-4">
                          <XCircle className="w-10 h-10 text-cyber-red" />
                        </div>
                      )}

                      <h3 className={`font-cyber text-xl mb-2 ${
                        result.correct ? 'text-cyber-green' : 'text-cyber-red'
                      }`}>
                        {result.correct ? 'CORRECT FLAG' : 'INCORRECT FLAG'}
                      </h3>

                      <p className={`font-mono text-sm mb-4 ${
                        result.correct ? 'text-cyber-green/80' : 'text-cyber-red/80'
                      }`}>
                        {result.message}
                      </p>

                      {result.correct && result.points_awarded !== undefined && (
                        <div className="flex items-center gap-3 text-xs font-mono text-gray-400 mb-2">
                          <span className="px-3 py-1 rounded-full bg-cyber-green/10 border border-cyber-green/20 text-cyber-green">
                            +{result.points_awarded} pts
                          </span>
                          {result.first_blood && (
                            <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                              FIRST BLOOD
                            </span>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => setShowPopup(false)}
                        className={`mt-2 px-6 py-2 rounded-lg font-cyber text-xs border transition-colors ${
                          result.correct
                            ? 'border-cyber-green/30 text-cyber-green hover:bg-cyber-green/10'
                            : 'border-cyber-red/30 text-cyber-red hover:bg-cyber-red/10'
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

          <div className="lg:col-span-5">
          <div className="cyber-card-glow rounded-2xl p-5 sm:p-8">
            <h2 className="text-white font-cyber text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" /> Recent Submissions
            </h2>
            {loadingSubmissions ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-800/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <p className="text-gray-500 font-mono text-sm text-center py-6">No submissions yet</p>
            ) : (
              <div className="space-y-2">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      sub.is_correct
                        ? 'bg-cyber-green/5 border-cyber-green/20'
                        : 'bg-gray-800/20 border-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {sub.is_correct
                        ? <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0" />
                        : <XCircle className="w-4 h-4 text-cyber-red flex-shrink-0" />
                      }
                      <span className="font-mono text-sm text-gray-300 truncate">
                        {sub.challenge_title || `Challenge #${sub.challenge_id}`}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-gray-500 flex-shrink-0 ml-2">
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
