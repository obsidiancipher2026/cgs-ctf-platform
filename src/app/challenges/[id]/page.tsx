'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Flag, Download, ExternalLink, ArrowLeft, Lock, Unlock } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function ChallengeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useStore();
  const [challenge, setChallenge] = useState<any>(null);
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flagInput, setFlagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmitFlag = async () => {
    if (!flagInput.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.submitFlag(Number(id), flagInput.trim());
      toast.success(res.message);
      setSolved(true);
      setFlagInput('');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Incorrect flag');
    } finally {
      setSubmitting(false);
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f]">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <button onClick={() => router.push('/challenges')}
          className="flex items-center gap-2 text-txt-muted font-mono text-sm hover:text-[var(--aurora-cyan)] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Challenges
        </button>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card rounded-2xl p-8 border-l-4 border-l-[var(--aurora-cyan)] relative overflow-hidden">
            {solved && (
              <div className="absolute top-4 right-4 flex items-center gap-2 text-[var(--aurora-emerald)] font-mono text-sm">
                <CheckCircle className="w-5 h-5" /> Solved
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-display text-2xl text-txt-primary">{challenge.title}</h1>
                <div className="flex gap-2 mt-2">
                  <span className="inline-block px-3 py-0.5 rounded text-xs font-mono uppercase tracking-wider bg-[rgba(124,92,255,0.12)] text-[var(--aurora-violet)]">{challenge.category}</span>
                  <span className={`inline-block px-3 py-0.5 rounded text-xs font-mono uppercase tracking-wider bg-black/30 ${getDifficultyColor(challenge.difficulty)}`}>{challenge.difficulty}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-3xl text-txt-primary">{challenge.points}</div>
                <div className="text-txt-muted font-mono text-xs uppercase tracking-wider">Points</div>
              </div>
            </div>

            <p className="text-txt-secondary font-mono text-sm leading-relaxed mb-6">{challenge.description}</p>

            {challenge.hint && (
              <details className="mb-6">
                <summary className="text-txt-muted font-mono text-xs uppercase tracking-wider cursor-pointer hover:text-[var(--aurora-cyan)] transition-colors">Hint</summary>
                <p className="text-txt-muted font-mono text-sm mt-2 italic">{challenge.hint}</p>
              </details>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {files.length > 0 && (
                <div className="card rounded-xl p-4 bg-[rgba(34,211,238,0.03)] border border-[rgba(34,211,238,0.1)]">
                  <h3 className="font-display text-sm text-txt-primary mb-3 flex items-center gap-2"><Download className="w-4 h-4" /> Download Assets</h3>
                  <div className="space-y-2">
                    {files.map((f, i) => (
                      <a key={i} href={`/api/challenges/${id}/files?name=${f.name}`} download
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(34,211,238,0.06)] border border-[rgba(34,211,238,0.12)] text-[var(--aurora-cyan)] font-mono text-xs hover:bg-[rgba(34,211,238,0.12)] transition-all">
                        <Unlock className="w-3 h-3" /> {f.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {challenge.instanceUrl && (
                <div className="card rounded-xl p-4 bg-[rgba(16,185,129,0.03)] border border-[rgba(16,185,129,0.1)]">
                  <h3 className="font-display text-sm text-txt-primary mb-3 flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Live Instance</h3>
                  <a href={challenge.instanceUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.25)] text-[var(--aurora-emerald)] font-mono text-sm hover:bg-[rgba(16,185,129,0.18)] transition-all w-fit">
                    <ExternalLink className="w-4 h-4" /> Open Instance
                  </a>
                </div>
              )}
            </div>

            {solved ? (
              <div className="border-t border-[rgba(34,211,238,0.08)] pt-6">
                <div className="flex items-center gap-3 text-[var(--aurora-emerald)] font-mono text-sm">
                  <CheckCircle className="w-5 h-5" /> You have solved this challenge
                </div>
              </div>
            ) : !isAuthenticated ? (
              <div className="border-t border-[rgba(34,211,238,0.08)] pt-6">
                <div className="flex items-center gap-3 text-txt-muted font-mono text-sm">
                  <Lock className="w-4 h-4" /> <a href="/login" className="text-[var(--aurora-cyan)] hover:underline">Login</a> to submit flags
                </div>
              </div>
            ) : (
              <div className="border-t border-[rgba(34,211,238,0.08)] pt-6">
                <h3 className="font-display text-sm text-txt-primary mb-3 flex items-center gap-2"><Flag className="w-4 h-4" /> Submit Flag</h3>
                <div className="flex gap-2">
                  <input type="text" value={flagInput} onChange={e => setFlagInput(e.target.value)}
                    placeholder="CGS{...}" autoFocus
                    className="input-field flex-1 px-4 py-2.5 rounded-xl font-mono text-sm"
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmitFlag(); }} />
                  <button onClick={handleSubmitFlag} disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] font-mono text-sm hover:bg-[rgba(34,211,238,0.2)] disabled:opacity-50 transition-all">
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
