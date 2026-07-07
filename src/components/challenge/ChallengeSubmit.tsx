'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag, CheckCircle, Trophy, Zap, Send, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'

interface Props {
  slug: string
  challengeId: number
  solved?: boolean
  onSolved?: (result: any) => void
}

export default function ChallengeSubmit({ slug, challengeId, solved = false, onSolved }: Props) {
  const { isAuthenticated } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [flag, setFlag] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [shake, setShake] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [confetti, setConfetti] = useState(false)

  useEffect(() => {
    if (!solved && !result) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300)
      return () => clearTimeout(timer)
    }
  }, [solved, result])

  const handleSubmit = async () => {
    if (!flag.trim() || submitting) return

    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch(`/api/challenges/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag: flag.trim() }),
        credentials: 'include',
      })

      const data = await res.json()

      if (res.status === 429) {
        setRateLimited(true)
        setTimeout(() => setRateLimited(false), 30000)
        setSubmitting(false)
        return
      }

      if (res.ok && data.message) {
        setResult(data)
        setConfetti(true)
        setFlag('')
        setTimeout(() => setConfetti(false), 2000)
        onSolved?.(data)
      } else {
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }
    } catch {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setSubmitting(false)
    }
  }

  if (solved && !result) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5">
        <div className="flex items-center gap-3 text-[var(--aurora-emerald)] font-mono text-sm py-3">
          <CheckCircle className="w-5 h-5" />
          Challenge Solved
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden relative">
      {/* Confetti effect */}
      <AnimatePresence>
        {confetti && (
          <>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: 0,
                  scale: 0,
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 300,
                  rotate: Math.random() * 720,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 + Math.random(), ease: 'easeOut' }}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full pointer-events-none z-10"
                style={{
                  background: ['#7C5CFF', '#22D3EE', '#34E89E', '#FFB020', '#FF5C72'][i % 5],
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <div className="p-5">
        <h3 className="font-display text-sm text-txt-primary mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--aurora-violet)]" />
          Submit Flag
        </h3>

        {!isAuthenticated ? (
          <div className="text-center py-4">
            <p className="text-xs font-mono text-txt-muted mb-3">
              Login to submit flags
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--aurora-violet)]/20 to-[var(--aurora-cyan)]/10 border border-[var(--aurora-violet)]/25 text-xs font-mono text-txt-primary hover:from-[var(--aurora-violet)]/30 hover:to-[var(--aurora-cyan)]/20 transition-all"
            >
              Login
            </a>
          </div>
        ) : rateLimited ? (
          <div className="text-center py-4">
            <p className="text-xs font-mono text-signal-amber">
              Too many attempts. Please wait before trying again.
            </p>
          </div>
        ) : result ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="rounded-xl p-4 border border-[rgba(52,232,158,0.3)] bg-[rgba(52,232,158,0.06)]"
          >
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-[var(--aurora-emerald)]" />
              <span className="font-display text-lg text-[var(--aurora-emerald)]">Correct!</span>
            </div>
            <div className="space-y-1.5 font-mono text-sm">
              <div className="flex items-center gap-2 text-txt-secondary">
                <Trophy className="w-3.5 h-3.5 text-[var(--aurora-emerald)]" />
                Points: <span className="text-txt-primary">+{result.points_awarded}</span>
              </div>
              {result.first_blood && (
                <div className="flex items-center gap-2 text-yellow-300">
                  <Zap className="w-3.5 h-3.5" />
                  FIRST BLOOD! <span className="font-bold">+{result.first_blood_bonus} bonus</span>
                </div>
              )}
              {result.total_points_awarded && (
                <div className="text-txt-muted text-[11px] pt-1.5 border-t border-[rgba(52,232,158,0.15)]">
                  Total: <span className="text-[var(--aurora-emerald)] font-bold">{result.total_points_awarded} pts</span>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : {}} transition={{ duration: 0.4 }}>
            <label className="font-mono text-[10px] uppercase tracking-wider text-txt-muted block mb-2.5">
              Enter Flag
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={flag}
                onChange={e => setFlag(e.target.value)}
                placeholder="CGS{...}"
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-txt-primary font-mono text-sm placeholder:text-txt-muted/40 focus:outline-none focus:border-[var(--aurora-violet)]/40 focus:bg-white/[0.06] transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={submitting || !flag.trim()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--aurora-violet)]/20 to-[var(--aurora-violet)]/5 border border-[var(--aurora-violet)]/25 text-[var(--aurora-violet)] font-mono text-sm hover:from-[var(--aurora-violet)]/30 hover:to-[var(--aurora-violet)]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
