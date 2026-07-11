'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Beaker, Play, Square, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface Props {
  slug: string
  instanceType?: string | null
  instanceUrl?: string | null
  challengeId?: number
}

const PLAYGROUND_PREFIX = '/playground/'
const INSTANCE_TTL = 2700

interface InstanceData {
  instanceId: string
  url: string
  expiresAt: number
  ttl: number
}

export default function ChallengeInstance({ slug, instanceType, instanceUrl, challengeId }: Props) {
  const [instance, setInstance] = useState<InstanceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [ttl, setTtl] = useState(0)
  const [error, setError] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const isPlayground = instanceUrl?.startsWith(PLAYGROUND_PREFIX)
  const playgroundSlug = isPlayground ? instanceUrl!.replace(PLAYGROUND_PREFIX, '') : null

  // Check for existing running instance on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(`ctf-instance-${slug}`)
    if (stored) {
      try {
        const data: InstanceData = JSON.parse(stored)
        if (data.expiresAt > Date.now()) {
          setInstance(data)
          setTtl(Math.max(0, Math.floor((data.expiresAt - Date.now()) / 1000)))
        } else {
          sessionStorage.removeItem(`ctf-instance-${slug}`)
        }
      } catch { sessionStorage.removeItem(`ctf-instance-${slug}`) }
    }
  }, [slug])

  // Countdown timer
  useEffect(() => {
    if (instance && ttl > 0) {
      timerRef.current = setInterval(() => {
        setTtl(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            setInstance(null)
            sessionStorage.removeItem(`ctf-instance-${slug}`)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [instance, ttl, slug])

  const handleStart = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data: InstanceData & { challengeId?: number } = await api.startInstance(challengeId || 0)
      // We need the challenge slug, but the API returns instance info
      const instanceData: InstanceData = {
        instanceId: data.instanceId,
        url: data.url,
        expiresAt: data.expiresAt,
        ttl: data.ttl || INSTANCE_TTL,
      }
      setInstance(instanceData)
      setTtl(instanceData.ttl)
      sessionStorage.setItem(`ctf-instance-${slug}`, JSON.stringify(instanceData))
      toast.success('Instance started!')
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || 'Failed to start instance'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [slug, challengeId])

  const handleStop = useCallback(async () => {
    if (!instance) return
    setLoading(true)
    try {
      await api.stopInstance(instance.instanceId)
      setInstance(null)
      setTtl(0)
      sessionStorage.removeItem(`ctf-instance-${slug}`)
      toast.success('Instance stopped')
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to stop instance')
    } finally {
      setLoading(false)
    }
  }, [instance, slug])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Playground rendering (existing)
  if (isPlayground && playgroundSlug) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
        className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--aurora-cyan)]" />
            <span className="font-display text-sm text-txt-primary">Built-in Playground</span>
          </div>
          <p className="text-[10px] font-mono text-txt-muted mb-4 leading-relaxed">
            This challenge has an interactive browser-based playground. Click below to open it.
          </p>
          <a href={`/playground/${playgroundSlug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--aurora-violet)]/15 to-[var(--aurora-cyan)]/10 border border-[var(--aurora-violet)]/25 text-[var(--aurora-cyan)] font-mono text-sm hover:from-[var(--aurora-violet)]/25 hover:to-[var(--aurora-cyan)]/15 transition-all">
            <Beaker className="w-4 h-4 shrink-0" />
            <span>Open Playground</span>
            <ExternalLink className="w-3 h-3 ml-auto shrink-0 opacity-60" />
          </a>
        </div>
      </motion.div>
    )
  }

  // Static URL (existing)
  if (instanceUrl && !isPlayground) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
        className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--aurora-cyan)]" />
            <span className="font-display text-sm text-txt-primary">Challenge URL</span>
          </div>
          <a href={instanceUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--aurora-cyan)]/15 to-[var(--aurora-emerald)]/10 border border-[var(--aurora-cyan)]/25 text-[var(--aurora-cyan)] font-mono text-sm hover:from-[var(--aurora-cyan)]/25 hover:to-[var(--aurora-emerald)]/15 transition-all">
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span className="truncate">{instanceUrl}</span>
          </a>
        </div>
      </motion.div>
    )
  }

  // On-demand instance (new)
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
      className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-1.5 h-1.5 rounded-full ${instance ? 'bg-[var(--aurora-emerald)]' : 'bg-[var(--aurora-cyan)]'}`} />
          <span className="font-display text-sm text-txt-primary">
            {instance ? 'Instance Running' : 'On-Demand Instance'}
          </span>
        </div>

        <p className="text-[10px] font-mono text-txt-muted mb-4 leading-relaxed">
          {instance
            ? 'Your personal challenge instance is running. Open it below to start hacking.'
            : 'Start a personal challenge instance. Each instance is isolated, runs for 45 minutes, and has a unique flag.'}
        </p>

        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] font-mono text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            {error}
          </div>
        )}

        {instance ? (
          <div className="space-y-3">
            <a href={instance.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--aurora-emerald)]/15 to-[var(--aurora-cyan)]/10 border border-[var(--aurora-emerald)]/25 text-[var(--aurora-emerald)] font-mono text-sm hover:from-[var(--aurora-emerald)]/25 hover:to-[var(--aurora-cyan)]/15 transition-all">
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span className="truncate">{instance.url}</span>
            </a>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-mono text-txt-muted">
                <Clock className="w-3 h-3" />
                <span className={ttl < 300 ? 'text-red-400' : 'text-txt-muted'}>{formatTime(ttl)}</span>
              </div>
              <button onClick={handleStop} disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] font-mono text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50">
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />}
                Stop Instance
              </button>
            </div>
          </div>
        ) : (
          <button onClick={handleStart} disabled={loading}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--aurora-violet)]/15 to-[var(--aurora-cyan)]/10 border border-[var(--aurora-violet)]/25 text-[var(--aurora-cyan)] font-mono text-sm hover:from-[var(--aurora-violet)]/25 hover:to-[var(--aurora-cyan)]/15 transition-all disabled:opacity-50">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {loading ? 'Starting instance...' : 'Open Instance'}
          </button>
        )}
      </div>
    </motion.div>
  )
}
