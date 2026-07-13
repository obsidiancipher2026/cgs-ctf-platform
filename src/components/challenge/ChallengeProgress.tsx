'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Globe, Lock, Search, Terminal, Puzzle, TrendingUp } from 'lucide-react'

interface ChallengeProgress {
  currentSolved: boolean
  totalChallenges: number
  totalSolved: number
  categories: {
    category: string
    solved: number
    total: number
  }[]
}

interface Props {
  progress: ChallengeProgress
}

const categoryMeta: Record<string, { label: string; icon: React.ElementType; color: string; barColor: string }> = {
  web: { label: 'Web', icon: Globe, color: 'text-[var(--aurora-cyan)]', barColor: 'bg-[var(--aurora-cyan)]' },
  crypto: { label: 'Crypto', icon: Lock, color: 'text-[var(--aurora-violet)]', barColor: 'bg-[var(--aurora-violet)]' },
  forensics: { label: 'Forensics', icon: Search, color: 'text-[var(--aurora-emerald)]', barColor: 'bg-[var(--aurora-emerald)]' },
  reverse: { label: 'Reverse', icon: Terminal, color: 'text-amber-400', barColor: 'bg-amber-400' },
  osint: { label: 'OSINT', icon: Search, color: 'text-sky-400', barColor: 'bg-sky-400' },
  misc: { label: 'Misc', icon: Puzzle, color: 'text-pink-400', barColor: 'bg-pink-400' },
}

function AnimatedBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={inView ? { width: `${value}%` } : { width: 0 }}
        transition={{ duration: 1, delay: delay, ease: [0.25, 0.1, 0.25, 1] }}
        className={`h-full rounded-full ${color} relative`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </motion.div>
    </div>
  )
}

export default function ChallengeProgress({ progress }: Props) {
  const overallPct = progress.totalChallenges > 0
    ? Math.round((progress.totalSolved / progress.totalChallenges) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5"
    >
      <h3 className="font-display text-sm text-txt-primary mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--aurora-emerald)]" />
        Progress
      </h3>

      {/* Overall */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-txt-secondary">Overall</span>
          <span className="text-xs font-mono text-txt-primary tabular-nums">
            {progress.totalSolved}/{progress.totalChallenges} ({overallPct}%)
          </span>
        </div>
        <AnimatedBar value={overallPct} color="bg-gradient-to-r from-[var(--aurora-violet)] to-[var(--aurora-cyan)]" />
      </div>

      {/* Current challenge status */}
      <div className="mb-4 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-mono">
          <TrendingUp className={`w-3.5 h-3.5 ${progress.currentSolved ? 'text-[var(--aurora-emerald)]' : 'text-txt-muted'}`} />
          <span className={progress.currentSolved ? 'text-[var(--aurora-emerald)]' : 'text-txt-secondary'}>
            {progress.currentSolved ? 'Challenge completed' : 'Not yet solved'}
          </span>
        </div>
      </div>

      {/* Per-category */}
      <div className="space-y-3">
        {progress.categories.filter(cp => cp.total > 0).map((cp, i) => {
          const meta = categoryMeta[cp.category]
          if (!meta) return null
          const pct = cp.total > 0 ? Math.round((cp.solved / cp.total) * 100) : 0
          const Icon = meta.icon

          return (
            <div key={cp.category}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3 h-3 ${meta.color}`} />
                  <span className="text-[11px] font-mono text-txt-secondary">{meta.label}</span>
                </div>
                <span className="text-[10px] font-mono text-txt-muted tabular-nums">
                  {cp.solved}/{cp.total}
                </span>
              </div>
              <AnimatedBar value={pct} color={meta.barColor} delay={0.1 + i * 0.1} />
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
