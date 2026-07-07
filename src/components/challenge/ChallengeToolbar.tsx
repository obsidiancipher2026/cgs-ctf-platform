'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Search, Flag, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react'

interface Props {
  title: string
  status?: 'solved' | 'attempted' | 'unsolved'
  onBack?: () => void
}

const statusConfig = {
  solved: { icon: CheckCircle, label: 'Solved', color: 'text-[var(--aurora-emerald)]', bg: 'bg-[rgba(52,232,158,0.1)]', border: 'border-[rgba(52,232,158,0.25)]' },
  attempted: { icon: AlertCircle, label: 'Attempted', color: 'text-signal-amber', bg: 'bg-[rgba(255,176,32,0.1)]', border: 'border-[rgba(255,176,32,0.25)]' },
  unsolved: { icon: HelpCircle, label: 'Unsolved', color: 'text-txt-muted', bg: 'bg-white/[0.04]', border: 'border-white/[0.08]' },
}

export default function ChallengeToolbar({ title, status = 'unsolved', onBack }: Props) {
  const st = statusConfig[status]
  const StatusIcon = st.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-16 z-30 backdrop-blur-xl bg-base/80 border-b border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack || (() => window.history.back())}
            className="shrink-0 p-1.5 rounded-lg hover:bg-white/[0.06] text-txt-muted hover:text-txt-primary transition-all"
            title="Go back (Esc)"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>

          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm font-display text-txt-primary truncate">{title}</h2>
            <div className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono border ${st.bg} ${st.border} ${st.color}`}>
              <StatusIcon className="w-2.5 h-2.5" />
              {st.label}
            </div>
          </div>
        </div>

        {/* Right: Keyboard hints */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-txt-muted">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-txt-secondary">/</kbd>
            <span>Search</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-txt-muted">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-txt-secondary">F</kbd>
            <span>Flag</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
