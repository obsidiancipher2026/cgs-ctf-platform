'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Beaker } from 'lucide-react'

interface Props {
  slug: string
  instanceType?: string | null
  instanceUrl?: string | null
}

const PLAYGROUND_PREFIX = '/playground/'

export default function ChallengeInstance({ slug, instanceUrl }: Props) {
  const isPlayground = instanceUrl?.startsWith(PLAYGROUND_PREFIX)
  const playgroundSlug = isPlayground ? instanceUrl!.replace(PLAYGROUND_PREFIX, '') : null

  if (!instanceUrl) return null

  if (isPlayground && playgroundSlug) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden"
      >
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--aurora-cyan)]" />
            <span className="font-display text-sm text-txt-primary">Built-in Playground</span>
          </div>
          <p className="text-[10px] font-mono text-txt-muted mb-4 leading-relaxed">
            This challenge has an interactive browser-based playground. Click below to open it.
          </p>
          <a
            href={`/playground/${playgroundSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--aurora-violet)]/15 to-[var(--aurora-cyan)]/10 border border-[var(--aurora-violet)]/25 text-[var(--aurora-cyan)] font-mono text-sm hover:from-[var(--aurora-violet)]/25 hover:to-[var(--aurora-cyan)]/15 transition-all"
          >
            <Beaker className="w-4 h-4 shrink-0" />
            <span>Open Playground</span>
            <ExternalLink className="w-3 h-3 ml-auto shrink-0 opacity-60" />
          </a>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--aurora-cyan)]" />
          <span className="font-display text-sm text-txt-primary">Challenge URL</span>
        </div>
        <a
          href={instanceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--aurora-cyan)]/15 to-[var(--aurora-emerald)]/10 border border-[var(--aurora-cyan)]/25 text-[var(--aurora-cyan)] font-mono text-sm hover:from-[var(--aurora-cyan)]/25 hover:to-[var(--aurora-emerald)]/15 transition-all"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          <span className="truncate">{instanceUrl}</span>
        </a>
      </div>
    </motion.div>
  )
}
