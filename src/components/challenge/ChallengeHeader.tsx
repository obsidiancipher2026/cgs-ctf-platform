'use client'

import { motion } from 'framer-motion'
import {
  ChevronRight, Globe, Lock, Search, Terminal, Puzzle,
  Clock, Users, TrendingUp, Tag, Bookmark, Share2, Heart,
  CheckCircle, AlertCircle, HelpCircle
} from 'lucide-react'

interface Challenge {
  id: number
  title: string
  slug: string
  description: string
  category: string
  difficulty?: string | null
  points: number
  author?: string | null
  tags?: string | null
  estimatedTime?: number | null
  solveCount?: number
  solveRate?: number
  createdAt?: string
}

interface Props {
  challenge: Challenge
  status?: 'solved' | 'attempted' | 'unsolved'
}

const categoryMeta: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  web: { icon: Globe, label: 'Web', color: 'text-[var(--aurora-cyan)]', bg: 'bg-[rgba(34,211,238,0.08)] border-[rgba(34,211,238,0.2)]' },
  crypto: { icon: Lock, label: 'Crypto', color: 'text-[var(--aurora-violet)]', bg: 'bg-[rgba(124,92,255,0.08)] border-[rgba(124,92,255,0.2)]' },
  forensics: { icon: Search, label: 'Forensics', color: 'text-[var(--aurora-emerald)]', bg: 'bg-[rgba(52,232,158,0.08)] border-[rgba(52,232,158,0.2)]' },
  reverse: { icon: Terminal, label: 'Reverse', color: 'text-amber-400', bg: 'bg-[rgba(251,191,36,0.08)] border-[rgba(251,191,36,0.2)]' },
  osint: { icon: Search, label: 'OSINT', color: 'text-sky-400', bg: 'bg-[rgba(56,189,248,0.08)] border-[rgba(56,189,248,0.2)]' },
  misc: { icon: Puzzle, label: 'Misc', color: 'text-pink-400', bg: 'bg-[rgba(244,114,182,0.08)] border-[rgba(244,114,182,0.2)]' },
}

const difficultyMeta: Record<string, { label: string; color: string; bars: number; barColor: string }> = {
  easy: { label: 'Easy', color: 'text-[var(--aurora-emerald)]', bars: 1, barColor: 'bg-[var(--aurora-emerald)]' },
  medium: { label: 'Medium', color: 'text-[var(--aurora-cyan)]', bars: 2, barColor: 'bg-[var(--aurora-cyan)]' },
  hard: { label: 'Hard', color: 'text-[#FF4500]', bars: 3, barColor: 'bg-[#FF4500]' },
}

const statusConfig = {
  solved: { icon: CheckCircle, label: 'Solved', color: 'text-[var(--aurora-emerald)]', bg: 'bg-[rgba(52,232,158,0.1)] border-[rgba(52,232,158,0.25)]' },
  attempted: { icon: AlertCircle, label: 'Attempted', color: 'text-signal-amber', bg: 'bg-[rgba(255,176,32,0.1)] border-[rgba(255,176,32,0.25)]' },
  unsolved: { icon: HelpCircle, label: 'Unsolved', color: 'text-txt-muted', bg: 'bg-white/[0.04] border-white/[0.08]' },
}

export default function ChallengeHeader({ challenge, status = 'unsolved' }: Props) {
  const cat = categoryMeta[challenge.category] || categoryMeta.misc
  const diff = difficultyMeta[challenge.difficulty || 'easy'] || { label: 'Unknown', color: 'text-txt-muted', bars: 0, barColor: 'bg-txt-muted' }
  const CatIcon = cat.icon
  const st = statusConfig[status]
  const StatusIcon = st.icon

  const tags: string[] = (() => {
    if (!challenge.tags) return []
    try { return JSON.parse(challenge.tags) } catch { return [] }
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-8"
    >
      {/* Breadcrumbs */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-1.5 text-xs font-mono text-txt-muted mb-5"
      >
        <a href="/challenges" className="hover:text-[var(--aurora-cyan)] transition-colors">Challenges</a>
        <ChevronRight className="w-3 h-3" />
        <span className={cat.color}>{cat.label}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-txt-secondary truncate max-w-[200px]">{challenge.title}</span>
      </motion.nav>

      {/* Title + Status */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <motion.h1
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="font-display text-3xl sm:text-4xl text-txt-primary mb-3 leading-tight"
          >
            {challenge.title}
          </motion.h1>

          {/* Badges row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap items-center gap-2.5"
          >
            {/* Category badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider border ${cat.bg} ${cat.color}`}>
              <CatIcon className="w-3 h-3" />
              {cat.label}
            </span>

            {/* Difficulty badge */}
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider border border-white/[0.08] bg-white/[0.04] ${diff.color}`}>
              {diff.label}
              <span className="flex gap-[2px]">
                {[1, 2, 3].map(i => (
                  <span key={i} className={`w-3 h-1 rounded-full ${i <= diff.bars ? diff.barColor : 'bg-white/[0.06]'}`} />
                ))}
              </span>
            </span>

            {/* Points badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono border border-[var(--aurora-violet)]/25 bg-[var(--aurora-violet)]/10 text-[var(--aurora-violet)]">
              {challenge.points} pts
            </span>
          </motion.div>
        </div>

        {/* Points display (large) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="shrink-0 text-right hidden sm:block"
        >
          <div className="font-display text-5xl text-txt-primary tabular-nums leading-none">{challenge.points}</div>
          <div className="text-txt-muted font-mono text-[10px] uppercase tracking-wider mt-1">Points</div>
        </motion.div>
      </div>

      {/* Meta row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono text-txt-muted mb-4"
      >
        {challenge.author && (
          <span className="flex items-center gap-1.5">
            <span className="text-txt-secondary">by</span>
            <span className="text-txt-primary">{challenge.author}</span>
          </span>
        )}
        {challenge.estimatedTime && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[var(--aurora-cyan)]" />
            {challenge.estimatedTime} min
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Users className="w-3 h-3 text-[var(--aurora-violet)]" />
          {challenge.solveCount ?? 0} solves
        </span>
        {challenge.solveRate !== undefined && challenge.solveRate !== null && (
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-[var(--aurora-emerald)]" />
            {challenge.solveRate.toFixed(1)}% solve rate
          </span>
        )}
      </motion.div>

      {/* Tags */}
      {tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex flex-wrap items-center gap-2 mb-4"
        >
          <Tag className="w-3 h-3 text-txt-muted" />
          {tags.map((tag, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-mono text-txt-muted bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
              {tag}
            </span>
          ))}
        </motion.div>
      )}

      {/* Status + Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between"
      >
        {/* Status indicator */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono border ${st.bg} ${st.color}`}>
          <StatusIcon className="w-3 h-3" />
          {st.label}
        </span>

        {/* Action buttons (placeholders) */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.03] text-txt-muted hover:text-[var(--aurora-cyan)] hover:border-[var(--aurora-cyan)]/25 hover:bg-[var(--aurora-cyan)]/5 transition-all" title="Bookmark">
            <Bookmark className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.03] text-txt-muted hover:text-pink-400 hover:border-pink-400/25 hover:bg-pink-400/5 transition-all" title="Favorite">
            <Heart className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.03] text-txt-muted hover:text-[var(--aurora-violet)] hover:border-[var(--aurora-violet)]/25 hover:bg-[var(--aurora-violet)]/5 transition-all" title="Share">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
