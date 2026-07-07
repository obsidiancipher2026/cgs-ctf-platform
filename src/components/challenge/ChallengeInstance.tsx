'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Play, Square, RotateCcw, Trash2, Copy, ExternalLink,
  Loader2, Clock, Server, AlertCircle, Timer,
} from 'lucide-react'
import LaunchOverlay from './LaunchOverlay'

interface Props {
  slug: string
  instanceType?: string | null
  instanceUrl?: string | null
  instanceTTL?: number | null
  dockerImage?: string | null
}

interface InstanceData {
  id: string
  status: string
  url: string | null
  expiresAt: string
  token?: string
  ttl?: number
}

type InstanceStatus = 'idle' | 'starting' | 'running' | 'expired' | 'error' | 'extending'

const statusConfig: Record<InstanceStatus, { label: string; color: string; bg: string; dotColor: string; animate: boolean }> = {
  idle: { label: 'Ready', color: 'text-txt-muted', bg: 'bg-white/[0.04] border-white/[0.08]', dotColor: 'bg-txt-muted', animate: false },
  starting: { label: 'Starting', color: 'text-signal-amber', bg: 'bg-[rgba(255,176,32,0.1)] border-[rgba(255,176,32,0.25)]', dotColor: 'bg-signal-amber', animate: true },
  running: { label: 'Running', color: 'text-[var(--aurora-emerald)]', bg: 'bg-[rgba(52,232,158,0.1)] border-[rgba(52,232,158,0.25)]', dotColor: 'bg-[var(--aurora-emerald)]', animate: false },
  expired: { label: 'Expired', color: 'text-[#FF5C72]', bg: 'bg-[rgba(255,92,114,0.06)] border-[rgba(255,92,114,0.15)]', dotColor: 'bg-[#FF5C72]', animate: false },
  error: { label: 'Error', color: 'text-[#FF5C72]', bg: 'bg-[rgba(255,92,114,0.06)] border-[rgba(255,92,114,0.15)]', dotColor: 'bg-[#FF5C72]', animate: false },
  extending: { label: 'Extending', color: 'text-signal-amber', bg: 'bg-[rgba(255,176,32,0.1)] border-[rgba(255,176,32,0.25)]', dotColor: 'bg-signal-amber', animate: true },
}

export default function ChallengeInstance({ slug, instanceType, instanceUrl, instanceTTL, dockerImage }: Props) {
  const [status, setStatus] = useState<InstanceStatus>('idle')
  const [instanceData, setInstanceData] = useState<InstanceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOverlay, setShowOverlay] = useState(false)
  const [pendingInstanceId, setPendingInstanceId] = useState<string | null>(null)

  const isVisible = instanceType === 'web' || !!instanceUrl || !!dockerImage

  const checkExistingInstance = useCallback(async () => {
    try {
      const res = await fetch(`/api/challenges/${slug}/instance`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.instance && data.instance.status === 'running') {
          const expiresAt = new Date(data.instance.expiresAt)
          if (expiresAt > new Date()) {
            setInstanceData(data.instance)
            setStatus('running')
            const secsLeft = Math.floor((expiresAt.getTime() - Date.now()) / 1000)
            setRemaining(secsLeft)
            return
          }
        }
      }
    } catch {}
  }, [slug])

  useEffect(() => {
    if (isVisible) checkExistingInstance()
  }, [isVisible, checkExistingInstance])

  useEffect(() => {
    if (remaining === null || status !== 'running') return
    if (remaining <= 0) {
      setStatus('expired')
      setInstanceData(null)
      setRemaining(null)
      return
    }
    const interval = setInterval(() => setRemaining(r => (r !== null ? r - 1 : null)), 1000)
    return () => clearInterval(interval)
  }, [remaining, status])

  const handleLaunch = async () => {
    setLoading(true)
    setError(null)
    setStatus('starting')
    setShowOverlay(true)
    try {
      const res = await fetch(`/api/challenges/${slug}/launch`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Failed to launch instance')
        setStatus('idle')
        setShowOverlay(false)
        setLoading(false)
        return
      }

      if (data.instance) {
        setInstanceData(data.instance)
        setPendingInstanceId(data.instance.id)
        setStatus('starting')
        const ttl = instanceTTL || data.instance.ttl || 1800
        setRemaining(ttl)
      }
    } catch {
      setError('Failed to connect to instance server')
      setStatus('idle')
      setShowOverlay(false)
    }
    setLoading(false)
  }

  const handleLaunchComplete = () => {
    setStatus('running')
    setShowOverlay(false)
  }

  const handleRestart = async () => {
    setLoading(true)
    setError(null)
    setStatus('starting')
    try {
      const res = await fetch(`/api/challenges/${slug}/instance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restart' }),
        credentials: 'include',
      })
      const data = await res.json()
      if (data.instance) {
        setInstanceData(data.instance)
        setStatus('running')
        setPendingInstanceId(data.instance.id)
        setShowOverlay(true)
        setRemaining(instanceTTL || 1800)
      }
    } catch {
      setError('Failed to restart')
      setStatus('idle')
    }
    setLoading(false)
  }

  const handleDestroy = async () => {
    setLoading(true)
    try {
      await fetch(`/api/challenges/${slug}/instance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'destroy' }),
        credentials: 'include',
      })
      setInstanceData(null)
      setStatus('idle')
      setRemaining(null)
      setPendingInstanceId(null)
    } catch {}
    setLoading(false)
  }

  const handleExtend = async () => {
    if (!instanceData) return
    setStatus('extending')
    try {
      const res = await fetch(`/api/challenges/${slug}/instance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extend', seconds: 300, maxMinutes: 120 }),
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        if (data.instance) {
          setInstanceData(data.instance)
          const expiresAt = new Date(data.instance.expiresAt)
          setRemaining(Math.floor((expiresAt.getTime() - Date.now()) / 1000))
          setStatus('running')
        }
      }
    } catch {}
    if (status === 'extending') setStatus('running')
  }

  const handleOpenInstance = () => {
    if (instanceData?.url) {
      window.open(instanceData.url, '_blank', 'noopener,noreferrer')
    }
  }

  const copyUrl = async () => {
    if (instanceData?.url) {
      await navigator.clipboard.writeText(instanceData.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (!isVisible) return null

  const st = statusConfig[status]

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden"
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm text-txt-primary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--aurora-cyan)]" />
              Challenge Instance
            </h3>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border ${st.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dotColor} ${st.animate ? 'animate-pulse' : ''}`} />
              <span className={st.color}>{st.label}</span>
            </div>
          </div>

          {error && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-[#FF5C72]/10 border border-[#FF5C72]/20 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-[#FF5C72] shrink-0" />
              <span className="text-xs font-mono text-[#FF5C72]">{error}</span>
            </div>
          )}

          {status === 'idle' && !loading && (
            <div className="space-y-3">
              <p className="text-xs font-mono text-txt-muted">
                Launch a personal instance to interact with this challenge.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLaunch}
                className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--aurora-cyan)]/15 to-[var(--aurora-emerald)]/10 border border-[var(--aurora-cyan)]/25 text-[var(--aurora-cyan)] font-mono text-sm hover:from-[var(--aurora-cyan)]/25 hover:to-[var(--aurora-emerald)]/15 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Open Instance
              </motion.button>
            </div>
          )}

          {status === 'starting' && !showOverlay && (
            <div className="flex items-center justify-center gap-3 py-6">
              <Loader2 className="w-5 h-5 text-signal-amber animate-spin" />
              <span className="text-sm font-mono text-signal-amber">Starting instance...</span>
            </div>
          )}

          {(status === 'running' || status === 'extending') && instanceData && (
            <div className="space-y-3">
              {instanceData.url && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--aurora-cyan)] shrink-0" />
                  <span className="flex-1 text-xs font-mono text-[var(--aurora-cyan)] truncate">
                    {instanceData.url}
                  </span>
                  <button onClick={copyUrl} className="shrink-0 p-1.5 rounded-md hover:bg-white/[0.08] transition-colors">
                    <Copy className={`w-3 h-3 ${copied ? 'text-[var(--aurora-emerald)]' : 'text-txt-muted'}`} />
                  </button>
                </div>
              )}

              {remaining !== null && status === 'running' && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02]">
                  <span className="text-[10px] font-mono text-txt-muted flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Expires in
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono tabular-nums ${remaining < 300 ? 'text-signal-amber' : 'text-txt-secondary'}`}>
                      {formatTime(remaining)}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExtend}
                      className="p-1 rounded hover:bg-white/[0.06] transition-colors"
                      title="Extend by 5 minutes"
                    >
                      <Timer className="w-3 h-3 text-txt-muted hover:text-[var(--aurora-cyan)]" />
                    </motion.button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {instanceData.url && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOpenInstance}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--aurora-cyan)]/15 to-[var(--aurora-emerald)]/10 border border-[var(--aurora-cyan)]/25 text-xs font-mono text-[var(--aurora-cyan)] hover:from-[var(--aurora-cyan)]/25 hover:to-[var(--aurora-emerald)]/15 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Challenge
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRestart}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-txt-secondary hover:text-txt-primary hover:bg-white/[0.08] disabled:opacity-40 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restart
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDestroy}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5C72]/5 border border-[#FF5C72]/15 text-xs font-mono text-[#FF5C72]/80 hover:text-[#FF5C72] hover:bg-[#FF5C72]/10 disabled:opacity-40 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Destroy
                </motion.button>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="mt-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLaunch}
                disabled={loading}
                className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--aurora-cyan)]/15 to-[var(--aurora-emerald)]/10 border border-[var(--aurora-cyan)]/25 text-[var(--aurora-cyan)] font-mono text-sm hover:from-[var(--aurora-cyan)]/25 hover:to-[var(--aurora-emerald)]/15 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Launch New Instance
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      <LaunchOverlay
        isOpen={showOverlay}
        onClose={() => setShowOverlay(false)}
        instanceId={pendingInstanceId}
        onComplete={handleLaunchComplete}
      />
    </>
  )
}
