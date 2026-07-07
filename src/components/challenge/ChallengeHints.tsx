'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, ChevronDown, AlertTriangle, Lock, Eye } from 'lucide-react'

interface Props {
  hint?: string | null
  hints?: string | null
  hintPenalty?: number
}

function parseHints(hintsJson: string | null | undefined, legacyHint: string | null | undefined): string[] {
  const result: string[] = []

  if (hintsJson) {
    try {
      const parsed = JSON.parse(hintsJson)
      if (Array.isArray(parsed)) {
        result.push(...parsed.map(h => typeof h === 'string' ? h : h.text || h.content || String(h)))
      }
    } catch {}
  }

  if (legacyHint && result.length === 0) {
    result.push(legacyHint)
  }

  return result
}

export default function ChallengeHints({ hint, hints, hintPenalty = 0 }: Props) {
  const hintList = parseHints(hints, hint)
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set())
  const [showAll, setShowAll] = useState(false)

  if (hintList.length === 0) return null

  const revealHint = (index: number) => {
    setRevealedIndices(prev => {
      const next = new Set(prev)
      next.add(index)
      return next
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm text-txt-primary flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-signal-amber" />
          Hints
          <span className="text-[10px] font-mono text-txt-muted bg-white/[0.05] px-2 py-0.5 rounded-full">
            {hintList.length}
          </span>
        </h3>
        {hintList.length > 1 && (
          <button
            onClick={() => {
              if (showAll) {
                setRevealedIndices(new Set())
                setShowAll(false)
              } else {
                const allIndices = new Set(hintList.map((_, i) => i))
                setRevealedIndices(allIndices)
                setShowAll(true)
              }
            }}
            className="text-[10px] font-mono text-txt-muted hover:text-[var(--aurora-cyan)] transition-colors uppercase tracking-wider"
          >
            {showAll ? 'Hide All' : 'Show All'}
          </button>
        )}
      </div>

      {hintPenalty > 0 && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-signal-amber/5 border border-signal-amber/15 text-signal-amber text-[11px] font-mono">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Each hint costs {hintPenalty} points</span>
        </div>
      )}

      <div className="space-y-2">
        {hintList.map((hintText, i) => {
          const isRevealed = revealedIndices.has(i)

          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                borderColor: isRevealed ? 'rgba(255,176,32,0.2)' : 'rgba(255,255,255,0.06)',
              }}
              className="rounded-xl border overflow-hidden"
            >
              <button
                onClick={() => revealHint(i)}
                disabled={isRevealed}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] transition-colors disabled:cursor-default"
              >
                <div className="flex items-center gap-2.5">
                  {isRevealed ? (
                    <Eye className="w-4 h-4 text-signal-amber" />
                  ) : (
                    <Lightbulb className="w-4 h-4 text-txt-muted" />
                  )}
                  <span className="text-xs font-mono text-txt-secondary">
                    Hint {i + 1}
                  </span>
                  {!isRevealed && hintPenalty > 0 && (
                    <span className="text-[9px] font-mono text-signal-amber/60 bg-signal-amber/5 px-1.5 py-0.5 rounded">
                      -{hintPenalty} pts
                    </span>
                  )}
                </div>
                {!isRevealed && <Lock className="w-3 h-3 text-txt-muted" />}
              </button>

              <AnimatePresence>
                {isRevealed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 pt-0">
                      <div className="p-3 rounded-lg bg-signal-amber/[0.04] border border-signal-amber/10">
                        <p className="text-sm font-mono text-txt-secondary leading-relaxed italic">
                          {hintText}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
