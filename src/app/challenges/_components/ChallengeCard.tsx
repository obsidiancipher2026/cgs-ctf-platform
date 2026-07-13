'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Globe, Lock, Search, Terminal, Puzzle, CheckCircle, Sword, Eye, ExternalLink, Download } from 'lucide-react'

const categoryMeta: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  web: { icon: Globe, label: 'Web', color: 'text-[var(--aurora-cyan)]' },
  crypto: { icon: Lock, label: 'Crypto', color: 'text-[var(--aurora-violet)]' },
  forensics: { icon: Search, label: 'Forensics', color: 'text-[var(--aurora-emerald)]' },
  reverse: { icon: Terminal, label: 'Reverse', color: 'text-amber-400' },
  osint: { icon: Search, label: 'OSINT', color: 'text-sky-400' },
  misc: { icon: Puzzle, label: 'Misc', color: 'text-pink-400' },
}

const difficultyMeta: Record<string, { label: string; color: string; bars: number; barColor: string }> = {
  easy: { label: 'Easy', color: 'text-[var(--aurora-emerald)]', bars: 1, barColor: 'bg-[var(--aurora-emerald)]' },
  medium: { label: 'Medium', color: 'text-[var(--aurora-cyan)]', bars: 2, barColor: 'bg-[var(--aurora-cyan)]' },
  hard: { label: 'Hard', color: 'text-[#FF4500]', bars: 3, barColor: 'bg-[#FF4500]' },
}

interface Challenge {
  id: number
  title: string
  slug?: string
  description: string
  category: string
  difficulty: string
  points: number
  hint?: string | null
  files?: string | null
  instanceUrl?: string | null
  instanceType?: string | null
  createdAt?: string
}

interface Props {
  challenge: Challenge
  solved: boolean
  index: number
}

export default function ChallengeCard({ challenge, solved, index }: Props) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const cat = categoryMeta[challenge.category] || categoryMeta.misc
  const diff = difficultyMeta[challenge.difficulty] || { label: 'Unknown', color: 'text-txt-muted', bars: 0, barColor: 'bg-txt-muted' }
  const Icon = cat.icon

  const hasInstance = challenge.instanceType === 'web' && !!challenge.instanceUrl
  const hasFiles = !!challenge.files

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/challenges/${challenge.slug || challenge.id}`)
  }

  const handleOpenInstance = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/challenges/${challenge.slug || challenge.id}`)
  }

  const primaryAction = hasInstance
    ? { label: 'Open Instance', icon: ExternalLink, onClick: handleOpenInstance }
    : hasFiles
    ? { label: 'Download Assets', icon: Download, onClick: handleView }
    : { label: 'View Challenge', icon: null, onClick: handleView }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={hasInstance ? undefined : handleView}
      className="relative group cursor-pointer"
    >
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
      />

      <div className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${
        solved
          ? 'border-[var(--aurora-emerald)]/20 bg-gradient-to-br from-[var(--aurora-emerald)]/[0.04] to-white/[0.02]'
          : 'border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01]'
      } group-hover:border-white/[0.15] group-hover:bg-white/[0.06] group-hover:shadow-xl group-hover:shadow-black/20`}>
        
        {solved && (
          <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-7 bg-[var(--aurora-emerald)]/20 rotate-45 translate-x-8 -translate-y-2 border border-[var(--aurora-emerald)]/30" />
          </div>
        )}

        <div className="p-5">
          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: hovered ? -8 : 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.06] ${cat.color}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </motion.div>
              <span className={`text-[10px] font-mono uppercase tracking-wider ${cat.color}`}>
                {cat.label}
              </span>
              <span className="text-[10px] text-txt-muted">·</span>
              <span className={`text-[10px] font-mono ${diff.color}`}>
                {diff.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-[2px]">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-3 h-1 rounded-full ${i <= diff.bars ? diff.barColor : 'bg-white/[0.06]'}`} />
                ))}
              </div>
              {solved && <CheckCircle className="w-3.5 h-3.5 text-[var(--aurora-emerald)]" />}
            </div>
          </div>

          {/* Title + Points */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-display text-base text-txt-primary group-hover:text-white transition-colors leading-snug">
              {challenge.title}
            </h3>
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.06]">
              <motion.span
                className="font-display text-sm text-txt-primary tabular-nums"
                animate={{ scale: hovered ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {challenge.points}
              </motion.span>
              <span className="text-[9px] font-mono text-txt-muted uppercase tracking-wider">pts</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs font-mono text-txt-secondary leading-relaxed line-clamp-2 mb-4">
            {challenge.description}
          </p>

          {/* Metadata row */}
          <div className="flex items-center gap-3 text-[10px] font-mono text-txt-muted mb-4">
            {hasInstance && (
              <span className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Live Instance
              </span>
            )}
            {hasFiles && (
              <span className="flex items-center gap-1">
                <Sword className="w-3 h-3" /> Files
              </span>
            )}
            {challenge.hint && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> Hint
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { e.stopPropagation(); primaryAction.onClick(e) }}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--aurora-violet)]/20 to-[var(--aurora-cyan)]/10 border border-[var(--aurora-violet)]/20 text-[11px] font-mono text-txt-primary hover:from-[var(--aurora-violet)]/30 hover:to-[var(--aurora-cyan)]/20 hover:border-[var(--aurora-violet)]/40 transition-all flex items-center justify-center gap-1.5"
            >
              {primaryAction.icon && <primaryAction.icon className="w-3 h-3" />}
              {solved ? 'View Solution' : primaryAction.label}
            </motion.button>
            {hasInstance && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleView}
                className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-txt-secondary hover:bg-white/[0.08] hover:text-txt-primary transition-all flex items-center gap-1.5"
              >
                Details
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
