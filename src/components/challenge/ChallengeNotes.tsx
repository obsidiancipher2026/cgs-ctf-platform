'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StickyNote, Eye, EyeOff, Save } from 'lucide-react'

interface Props {
  challengeSlug: string
}

const STORAGE_KEY_PREFIX = 'ctf-notes-'

export default function ChallengeNotes({ challengeSlug }: Props) {
  const [notes, setNotes] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const storageKey = `${STORAGE_KEY_PREFIX}${challengeSlug}`

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) setNotes(stored)
    } catch {}
  }, [storageKey])

  const saveNotes = useCallback(() => {
    try {
      localStorage.setItem(storageKey, notes)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
  }, [notes, storageKey])

  useEffect(() => {
    const timer = setTimeout(saveNotes, 1000)
    return () => clearTimeout(timer)
  }, [notes, saveNotes])

  const renderPreview = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('```')) return null
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-lg font-display font-bold text-txt-primary mt-3 mb-1">{line.slice(2)}</h1>
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-base font-display font-semibold text-txt-primary mt-2 mb-1">{line.slice(3)}</h2>
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="text-xs font-mono text-txt-secondary ml-4 list-disc">{line.slice(2)}</li>
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={i} className="text-xs font-mono text-txt-primary font-bold">{line.slice(2, -2)}</strong>
      }
      if (line.trim() === '') return <div key={i} className="h-2" />
      return <p key={i} className="text-xs font-mono text-txt-secondary leading-relaxed">{line}</p>
    })
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--aurora-violet)]" />
          <h3 className="font-display text-sm text-txt-primary">Personal Notes</h3>
          {notes && (
            <span className="text-[10px] font-mono text-txt-muted bg-white/[0.05] px-2 py-0.5 rounded-full">
              {notes.length}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <svg className="w-4 h-4 text-txt-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1.5 text-[10px] font-mono text-txt-muted hover:text-[var(--aurora-cyan)] transition-colors uppercase tracking-wider"
                >
                  {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showPreview ? 'Edit' : 'Preview'}
                </button>
                <AnimatePresence>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-[10px] font-mono text-[var(--aurora-emerald)]"
                    >
                      <Save className="w-3 h-3" />
                      Saved
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {showPreview ? (
                <div className="min-h-[120px] p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  {notes ? (
                    <div className="space-y-1">{renderPreview(notes)}</div>
                  ) : (
                    <p className="text-xs font-mono text-txt-muted italic">No notes yet...</p>
                  )}
                </div>
              ) : (
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Jot down your notes, approach, and findings..."
                  className="w-full min-h-[120px] px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-txt-primary font-mono text-xs placeholder:text-txt-muted/40 focus:outline-none focus:border-[var(--aurora-violet)]/30 transition-all resize-y leading-relaxed"
                />
              )}

              <div className="flex items-center justify-between text-[10px] font-mono text-txt-muted">
                <span>Supports markdown</span>
                <span>Auto-saved to browser</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
