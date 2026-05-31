'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Swords, Trophy, Lightbulb, Loader2, AlertTriangle, Flag, Droplet, Radio, ExternalLink,
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

export default function InstancePage() {
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
      .then((data) => {
        if (data.challenge_type !== 'instance') {
          toast.error('This challenge is not an instance challenge');
          router.push(`/challenges/${id}`);
          return;
        }
        setChallenge(data);
      })
      .catch(() => toast.error('Failed to load challenge'))
      .finally(() => setLoading(false));
  }, [mounted, isAuthenticated, user, params.id, router]);

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
          <p className="text-gray-500 font-mono text-lg">Instance not available</p>
          <button
            onClick={() => router.push('/challenges')}
            className="mt-4 px-6 py-3 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue font-mono text-sm hover:bg-cyber-blue/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" /> Back to Challenges
          </button>
        </div>
      </div>
    );
  }

  const cat = categoryConfig[challenge.category] || categoryConfig.misc;
  const fileUrl = challenge.file_url || '';

  const openInstance = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => router.push(`/challenges/${challenge.id}`)}
            className="flex items-center gap-2 text-gray-500 hover:text-white font-mono text-xs sm:text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Challenge Details
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{cat.icon}</span>
            <span className="text-xs font-mono uppercase tracking-wider" style={{ color: cat.color }}>
              {cat.label}
            </span>
            <span className="text-gray-600 mx-1">•</span>
            <span className={`text-xs font-mono ${difficultyColors[challenge.difficulty] || 'text-gray-400'}`}>
              {(challenge.difficulty || 'unknown').toUpperCase()}
            </span>
          </div>

          <h1 className="text-white font-cyber text-2xl sm:text-3xl mb-2">{challenge.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mb-6">
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

          <div className="cyber-card rounded-2xl p-5 sm:p-8 border-cyan-500/20 mb-6">
            <p className="text-gray-400 font-mono text-sm leading-relaxed mb-6">{challenge.description}</p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={openInstance}
                disabled={!fileUrl}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-cyber text-sm sm:text-base transition-all flex items-center justify-center gap-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ExternalLink className="w-5 h-5 flex-shrink-0" />
                <span>Open Instance</span>
              </button>
              {!fileUrl && (
                <p className="text-xs text-gray-500 font-mono text-center sm:text-left">Instance URL not available</p>
              )}
            </div>
          </div>

          {challenge.hint && (
            <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
              <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-300/80 font-mono text-sm leading-relaxed">{challenge.hint}</p>
            </div>
          )}

          <div className="p-4 rounded-xl bg-cyber-blue/5 border border-cyber-blue/20">
            <div className="flex items-start gap-2">
              <Flag className="w-4 h-4 text-cyber-blue mt-0.5 flex-shrink-0" />
              <p className="text-cyber-blue/80 font-mono text-xs leading-relaxed">
                Found the flag? Submit it on the{' '}
                <button
                  onClick={() => router.push('/flag-submit')}
                  className="underline hover:text-white transition-colors"
                >
                  Flag Submit page
                </button>
                .
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
