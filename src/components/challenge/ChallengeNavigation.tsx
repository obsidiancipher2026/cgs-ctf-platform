'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Shuffle, LayoutGrid } from 'lucide-react'

interface ChallengeNav {
  id: number
  title: string
  slug: string
}

interface Props {
  previous?: ChallengeNav | null
  next?: ChallengeNav | null
  onRandom?: () => void
  category?: string
}

export default function ChallengeNavigation({ previous, next, onRandom, category }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Previous */}
        {previous ? (
          <a
            href={`/challenges/${previous.slug || previous.id}`}
            className="group flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:border-white/[0.15] hover:bg-white/[0.06] transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-txt-muted group-hover:text-[var(--aurora-cyan)] transition-colors shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] font-mono text-txt-muted uppercase tracking-wider mb-0.5">Previous</div>
              <div className="text-xs font-mono text-txt-secondary group-hover:text-txt-primary truncate transition-colors">
                {previous.title}
              </div>
            </div>
          </a>
        ) : (
          <div className="hidden sm:block" />
        )}

        {/* Random */}
        {onRandom && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRandom}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:border-[var(--aurora-violet)]/30 hover:bg-[var(--aurora-violet)]/5 text-txt-muted hover:text-[var(--aurora-violet)] transition-all"
          >
            <Shuffle className="w-4 h-4" />
            <span className="text-xs font-mono">Random</span>
          </motion.button>
        )}

        {/* Next */}
        {next ? (
          <a
            href={`/challenges/${next.slug || next.id}`}
            className="group flex items-center justify-end gap-3 px-4 py-3.5 rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:border-white/[0.15] hover:bg-white/[0.06] transition-all text-right"
          >
            <div className="min-w-0">
              <div className="text-[10px] font-mono text-txt-muted uppercase tracking-wider mb-0.5">Next</div>
              <div className="text-xs font-mono text-txt-secondary group-hover:text-txt-primary truncate transition-colors">
                {next.title}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-txt-muted group-hover:text-[var(--aurora-cyan)] transition-colors shrink-0" />
          </a>
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>

      {/* Back to challenges */}
      <div className="text-center">
        <a
          href={category ? `/challenges?category=${encodeURIComponent(category)}` : '/challenges'}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-txt-secondary hover:text-txt-primary hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Back to Challenges
        </a>
      </div>
    </motion.div>
  )
}
