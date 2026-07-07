'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Globe, Lock, Search, Terminal, Puzzle,
  Clock, Users, TrendingUp, Calendar, Flag,
  Bookmark, Heart, CheckCircle, AlertCircle, HelpCircle
} from 'lucide-react'

interface Challenge {
  id: number
  title: string
  slug: string
  category: string
  difficulty?: string | null
  points: number
  author?: string | null
  solveCount?: number
  solveRate?: number
  estimatedTime?: number | null
  createdAt?: string
  hintPenalty?: number
}

interface Props {
  challenge: Challenge
  status?: 'solved' | 'attempted' | 'unsolved'
  children?: React.ReactNode
}

const categoryMeta: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  web: { icon: Globe, label: 'Web', color: 'text-[var(--aurora-cyan)]' },
  crypto: { icon: Lock, label: 'Crypto', color: 'text-[var(--aurora-violet)]' },
  forensics: { icon: Search, label: 'Forensics', color: 'text-[var(--aurora-emerald)]' },
  reverse: { icon: Terminal, label: 'Reverse', color: 'text-amber-400' },
  misc: { icon: Puzzle, label: 'Misc', color: 'text-pink-400' },
}

const difficultyMeta: Record<string, { label: string; color: string; bars: number; barColor: string }> = {
  easy: { label: 'Easy', color: 'text-[var(--aurora-emerald)]', bars: 1, barColor: 'bg-[var(--aurora-emerald)]' },
  medium: { label: 'Medium', color: 'text-[var(--aurora-cyan)]', bars: 2, barColor: 'bg-[var(--aurora-cyan)]' },
  hard: { label: 'Hard', color: 'text-[#FF4500]', bars: 3, barColor: 'bg-[#FF4500]' },
}

const statusConfig = {
  solved: { icon: CheckCircle, label: 'Solved', color: 'text-[var(--aurora-emerald)]', bg: 'bg-[rgba(52,232,158,0.1)]', border: 'border-[rgba(52,232,158,0.25)]' },
  attempted: { icon: AlertCircle, label: 'Attempted', color: 'text-signal-amber', bg: 'bg-[rgba(255,176,32,0.1)]', border: 'border-[rgba(255,176,32,0.25)]' },
  unsolved: { icon: HelpCircle, label: 'Unsolved', color: 'text-txt-muted', bg: 'bg-white/[0.04]', border: 'border-white/[0.08]' },
}

export default function ChallengeSidebar({ challenge, status = 'unsolved', children }: Props) {
  const [bookmarked, setBookmarked] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const cat = categoryMeta[challenge.category] || categoryMeta.misc
  const diff = difficultyMeta[challenge.difficulty || 'easy'] || { label: 'Unknown', color: 'text-txt-muted', bars: 0, barColor: 'bg-txt-muted' }
  const CatIcon = cat.icon
  const st = statusConfig[status]
  const StatusIcon = st.icon

  const createdDate = challenge.createdAt
    ? new Date(challenge.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="w-full lg:w-[340px] shrink-0 space-y-4 lg:sticky lg:top-24 lg:self-start"
    >
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden">
        <div className="p-5">
          <h3 className="font-display text-sm text-txt-primary mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--aurora-violet)]" />
            Challenge Info
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-txt-muted">Category</span>
              <span className={`text-xs font-mono flex items-center gap-1.5 ${cat.color}`}>
                <CatIcon className="w-3 h-3" />
                {cat.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-txt-muted">Difficulty</span>
              <span className={`text-xs font-mono flex items-center gap-2 ${diff.color}`}>
                {diff.label}
                <span className="flex gap-[2px]">
                  {[1, 2, 3].map(i => (
                    <span key={i} className={`w-3 h-1 rounded-full ${i <= diff.bars ? diff.barColor : 'bg-white/[0.06]'}`} />
                  ))}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-txt-muted">Points</span>
              <span className="text-xs font-mono text-[var(--aurora-violet)]">{challenge.points} pts</span>
            </div>
            {challenge.author && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-txt-muted">Author</span>
                <span className="text-xs font-mono text-txt-secondary">{challenge.author}</span>
              </div>
            )}
            {createdDate && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-txt-muted">Created</span>
                <span className="text-xs font-mono text-txt-secondary flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {createdDate}
                </span>
              </div>
            )}
            {challenge.solveRate !== undefined && challenge.solveRate !== null && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-txt-muted">Solve Rate</span>
                <span className="text-xs font-mono text-txt-secondary flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-[var(--aurora-emerald)]" />
                  {challenge.solveRate.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
        <div className={`border-t border-white/[0.06] px-5 py-3 ${st.bg}`}>
          <div className={`flex items-center gap-2 text-xs font-mono ${st.color}`}>
            <StatusIcon className="w-4 h-4" />
            {st.label}
          </div>
        </div>
      </div>

      {children}

      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5">
        <h3 className="font-display text-sm text-txt-primary mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--aurora-cyan)]" />
          Quick Stats
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-txt-muted flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              Solve Count
            </span>
            <span className="text-xs font-mono text-txt-primary tabular-nums">{challenge.solveCount ?? 0}</span>
          </div>
          {challenge.estimatedTime && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-txt-muted flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Est. Time
              </span>
              <span className="text-xs font-mono text-txt-primary">{challenge.estimatedTime} min</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-txt-muted flex items-center gap-1.5">
              <Flag className="w-3 h-3" />
              Points
            </span>
            <span className="text-xs font-mono text-[var(--aurora-violet)] font-bold">{challenge.points}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setBookmarked(!bookmarked)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-mono transition-all ${
            bookmarked
              ? 'bg-[var(--aurora-cyan)]/10 border-[var(--aurora-cyan)]/30 text-[var(--aurora-cyan)]'
              : 'bg-white/[0.03] border-white/[0.08] text-txt-muted hover:text-txt-secondary hover:border-white/[0.12]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          {bookmarked ? 'Saved' : 'Save'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setFavorited(!favorited)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-mono transition-all ${
            favorited
              ? 'bg-pink-400/10 border-pink-400/30 text-pink-400'
              : 'bg-white/[0.03] border-white/[0.08] text-txt-muted hover:text-txt-secondary hover:border-white/[0.12]'
          }`}
        >
          <Heart className="w-4 h-4" />
          {favorited ? 'Favorited' : 'Favorite'}
        </motion.button>
      </div>
    </motion.aside>
  )
}
