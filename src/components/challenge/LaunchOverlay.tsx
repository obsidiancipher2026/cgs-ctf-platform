'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle, Terminal } from 'lucide-react'
import { useInstanceSSE } from '@/hooks/useInstanceSSE'

interface Props {
  isOpen: boolean
  onClose: () => void
  instanceId: string | null
  onComplete?: () => void
}

interface Step {
  label: string
  key: string
  status: 'pending' | 'in_progress' | 'done' | 'error'
}

const STEPS: Step[] = [
  { label: 'Initializing environment', key: 'creating', status: 'pending' },
  { label: 'Pulling container image', key: 'pulling', status: 'pending' },
  { label: 'Starting challenge', key: 'starting', status: 'pending' },
  { label: 'Health check', key: 'health', status: 'pending' },
  { label: 'Ready!', key: 'running', status: 'pending' },
]

export default function LaunchOverlay({ isOpen, onClose, instanceId, onComplete }: Props) {
  const [steps, setSteps] = useState<Step[]>(STEPS)
  const [logLines, setLogLines] = useState<string[]>([])
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useInstanceSSE(instanceId, {
    onStatus(data) {
      setSteps(prev => {
        let found = false
        const next = prev.map(s => {
          if (s.key === data.status) {
            found = true
            return { ...s, status: 'in_progress' as const }
          }
          if (!found && s.status === 'pending') return { ...s, status: 'pending' as const }
          if (!found && s.status === 'in_progress') return { ...s, status: 'in_progress' as const }
          if (found && s.status === 'in_progress') return { ...s, status: 'done' as const }
          if (s.status === 'in_progress' && s.key !== data.status) return { ...s, status: 'done' as const }
          return s
        })

        if (data.status === 'running') {
          setCompleted(true)
          onComplete?.()
        }
        if (data.status === 'error') {
          setError(data.progress || 'Failed to launch')
        }

        return next
      })
    },
    onLog(data) {
      setLogLines(prev => [...prev.slice(-49), `[${data.level.toUpperCase()}] ${data.message}`])
    },
  })

  useEffect(() => {
    if (isOpen) {
      setSteps(STEPS)
      setLogLines([])
      setCompleted(false)
      setError(null)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070C]/90 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg mx-4 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--aurora-cyan)]/20 to-[var(--aurora-emerald)]/10 border border-[var(--aurora-cyan)]/25 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-[var(--aurora-cyan)]" />
                </div>
                <div>
                  <h3 className="font-display text-sm text-txt-primary">Launching Instance</h3>
                  <p className="text-[11px] font-mono text-txt-muted">
                    {completed ? 'Instance is ready' : error ? 'Launch failed' : 'Setting up your challenge environment...'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {steps.map((step) => (
                  <div key={step.key} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02]">
                    {step.status === 'done' && <CheckCircle2 className="w-4 h-4 text-[var(--aurora-emerald)] shrink-0" />}
                    {step.status === 'in_progress' && <Loader2 className="w-4 h-4 text-[var(--aurora-cyan)] animate-spin shrink-0" />}
                    {step.status === 'error' && <XCircle className="w-4 h-4 text-[#FF5C72] shrink-0" />}
                    {step.status === 'pending' && <div className="w-4 h-4 rounded-full border border-white/[0.15] shrink-0" />}
                    <span className={`text-xs font-mono ${
                      step.status === 'done' ? 'text-[var(--aurora-emerald)]' :
                      step.status === 'in_progress' ? 'text-[var(--aurora-cyan)]' :
                      step.status === 'error' ? 'text-[#FF5C72]' :
                      'text-txt-muted'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              {logLines.length > 0 && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-black/40 border border-white/[0.06] max-h-28 overflow-y-auto font-mono text-[10px] leading-relaxed">
                  {logLines.map((line, i) => (
                    <div key={i} className="text-txt-muted">{line}</div>
                  ))}
                </div>
              )}

              {error && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-[#FF5C72]/10 border border-[#FF5C72]/20 text-xs font-mono text-[#FF5C72]">
                  {error}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-txt-secondary hover:text-txt-primary hover:bg-white/[0.1] transition-all"
                >
                  {completed || error ? 'Close' : 'Minimize'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
