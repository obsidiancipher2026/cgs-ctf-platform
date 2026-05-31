'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Swords, Trophy, Lightbulb,
  Loader2, BookOpen, AlertTriangle, Flag, Download, Droplet, ExternalLink,
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

const difficultyColors: Record<string, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-400',
  hard: 'text-red-400',
  expert: 'text-purple-400',
};



export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useStore();
  const [mounted, setMounted] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyber-blue animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-cyber-gray/50 rounded w-1/3" />
            <div className="h-6 bg-cyber-gray/50 rounded w-2/3" />
            <div className="h-4 bg-cyber-gray/50 rounded w-full" />
            <div className="h-4 bg-cyber-gray/50 rounded w-3/4" />
            <div className="h-32 bg-cyber-gray/50 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 font-mono text-lg">Challenge not found</p>
          <button
            onClick={() => router.push('/challenges')}
            className="mt-4 cyber-btn px-6 py-3 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue font-mono text-sm hover:bg-cyber-blue/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" /> Back to Challenges
          </button>
        </div>
      </div>
    );
  }

  const cat = categoryConfig[challenge.category] || categoryConfig.misc;

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => router.push('/challenges')}
            className="flex items-center gap-2 text-gray-500 hover:text-white font-mono text-xs sm:text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Challenges
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                <span className="text-xl">{cat.icon}</span>
                <span className="text-xs font-mono uppercase tracking-wider" style={{ color: cat.color }}>
                  {cat.label}
                </span>
                <span className="text-gray-600 mx-1">•</span>
                <span className={`text-xs font-mono ${difficultyColors[challenge.difficulty] || 'text-gray-400'}`}>
                  {(challenge.difficulty || 'unknown').toUpperCase()}
                </span>
                {challenge.is_solved && (
                  <div>
                    <span className="text-gray-600 mx-1">•</span>
                    <span className="text-xs font-mono text-cyber-green">SOLVED</span>
                  </div>
                )}
              </div>
              <h1 className="text-white font-cyber text-2xl sm:text-3xl">{challenge.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-5 h-5 text-cyber-green" />
                <span className="text-cyber-green font-cyber text-xl">{challenge.points}pts</span>
              </div>
              {challenge.solver_count > 0 && (
                <div className="flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500 font-mono text-xs">{challenge.solver_count} solves</span>
                </div>
              )}
              {challenge.blood_points > 0 ? (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/30">
                  <Droplet className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-mono text-xs font-bold">First Blood +{challenge.blood_points}pts</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800/30 border border-gray-700/30">
                  <Droplet className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-gray-600 font-mono text-xs">No Blood Bonus</span>
                </div>
              )}
            </div>
          </div>

          <div className="cyber-card rounded-2xl p-5 sm:p-8 border-cyber-blue/20 mb-6">
            <h2 className="text-white font-cyber text-lg mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyber-blue" /> Description
            </h2>
            <p className="text-gray-400 font-mono text-sm leading-relaxed">{challenge.description}</p>
          </div>

          {challenge.hint && (
            <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
              <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-300/80 font-mono text-sm leading-relaxed">{challenge.hint}</p>
            </div>
          )}

          {challenge.challenge_type === 'instance' && (
            <div className="cyber-card rounded-2xl p-5 sm:p-8 border-cyan-500/20 mb-6">
              <h2 className="text-white font-cyber text-lg mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-cyan-400" /> Instance Challenge
              </h2>
              <p className="text-gray-400 font-mono text-sm leading-relaxed mb-4">
                This challenge requires you to interact with a live instance. Click below to open it.
              </p>
              <a
                href={challenge.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl font-cyber text-sm transition-all flex items-center justify-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 w-fit"
              >
                <ExternalLink className="w-4 h-4" />
                Open Instance
              </a>
            </div>
          )}

          {challenge.challenge_type === 'asset' && challenge.file_url && (
            <div className="cyber-card rounded-2xl p-5 sm:p-8 border-cyber-blue/20 mb-6">
              <h2 className="text-white font-cyber text-lg mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-cyber-blue" /> Assets
              </h2>
              <div className="flex items-center gap-3">
                <code className="flex-1 px-4 py-3 rounded-lg bg-black/40 border border-gray-800 text-cyber-blue font-mono text-xs sm:text-sm break-all">
                  {challenge.file_url.split('/').pop()}
                </code>
                <a
                  href={challenge.file_url}
                  download
                  className="px-5 py-3 rounded-xl font-cyber text-sm whitespace-nowrap transition-all flex items-center justify-center gap-2 bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/20"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          )}

          {challenge.flag_mode && challenge.flag_mode !== 'static' && (
            <div className="p-4 rounded-xl bg-cyber-purple/5 border border-cyber-purple/20 mb-6">
              <div className="flex items-start gap-2">
                <Flag className="w-4 h-4 text-cyber-purple mt-0.5 flex-shrink-0" />
                <p className="text-cyber-purple/80 font-mono text-xs leading-relaxed">
                  This challenge uses <strong className="text-white">dynamic flags</strong> — each player receives a unique flag.
                  Sharing your flag with others will not help them solve this challenge.
                </p>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-cyber-blue/5 border border-cyber-blue/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-cyber-blue mt-0.5 flex-shrink-0" />
              <p className="text-cyber-blue/80 font-mono text-xs leading-relaxed">
                Once you find the flag (format: <strong>CGS{'{...}'}</strong>), go to the{' '}
                <button
                  onClick={() => router.push('/flag-submit')}
                  className="underline hover:text-white transition-colors"
                >
                  Flag Submit page
                </button>{' '}
                to submit it.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
