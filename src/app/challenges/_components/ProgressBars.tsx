'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Globe, Lock, Search, Terminal, Puzzle } from 'lucide-react'

interface CategoryProgress {
  category: string
  solved: number
  total: number
}

interface Props {
  total: number
  solved: number
  categoryProgress: CategoryProgress[]
}

const categoryMeta: Record<string, { label: string; icon: React.ElementType; color: string; barColor: string }> = {
  web: { label: 'Web', icon: Globe, color: 'text-[var(--aurora-cyan)]', barColor: 'bg-[var(--aurora-cyan)]' },
  crypto: { label: 'Crypto', icon: Lock, color: 'text-[var(--aurora-violet)]', barColor: 'bg-[var(--aurora-violet)]' },
  forensics: { label: 'Forensics', icon: Search, color: 'text-[var(--aurora-emerald)]', barColor: 'bg-[var(--aurora-emerald)]' },
  reverse: { label: 'Reverse', icon: Terminal, color: 'text-amber-400', barColor: 'bg-amber-400' },
  misc: { label: 'Misc', icon: Puzzle, color: 'text-pink-400', barColor: 'bg-pink-400' },
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={inView ? { width: `${value}%` } : { width: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className={`h-full rounded-full ${color} relative`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </motion.div>
    </div>
  )
}

export default function ProgressBars({ total, solved, categoryProgress }: Props) {
  const overallPct = total > 0 ? Math.round((solved / total) * 100) : 0
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-12 p-6 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01]"
    >
      <h2 className="font-display text-sm text-txt-primary mb-5 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--aurora-cyan)]" />
        Challenge Progress
      </h2>

      {/* Overall */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-txt-secondary">Overall Progress</span>
          <span className="text-xs font-mono text-txt-primary tabular-nums">{overallPct}%</span>
        </div>
        <ProgressBar value={overallPct} color="bg-gradient-to-r from-[var(--aurora-violet)] to-[var(--aurora-cyan)]" />
      </div>

      {/* Per category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryProgress.map((cp) => {
          const meta = categoryMeta[cp.category]
          if (!meta) return null
          const pct = cp.total > 0 ? Math.round((cp.solved / cp.total) * 100) : 0
          const Icon = meta.icon

          return (
            <div key={cp.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                  <span className="text-xs font-mono text-txt-secondary">{meta.label}</span>
                </div>
                <span className="text-[11px] font-mono text-txt-muted tabular-nums">
                  {cp.solved}/{cp.total}
                </span>
              </div>
              <ProgressBar value={pct} color={meta.barColor} />
            </div>
          )
        })}
      </div>
    </motion.section>
  )
}
