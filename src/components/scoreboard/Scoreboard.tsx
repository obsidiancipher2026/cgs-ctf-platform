'use client'

import { useState, useEffect, useMemo } from 'react'
import { Trophy, Users, Layers, CheckCircle, Clock, Zap, TrendingUp, TrendingDown, Minus, RefreshCw, Target } from 'lucide-react'

export interface ScoreboardPlayer {
  rank: number
  id: number
  username: string
  score: number
  bloodPoints: number
  country: string | null
  college: string | null
  solves: number
  totalChallenges: number
  lastActivity: { title: string; time: string } | null
  createdAt: string
}

export interface ScoreboardStats {
  totalUsers: number
  totalChallenges: number
  totalSolves: number
  totalScore: number
}

interface ScoreboardProps {
  players: ScoreboardPlayer[]
  stats: ScoreboardStats | null
  loading?: boolean
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="w-8 h-5 rounded bg-white/[0.06] animate-pulse shrink-0" />
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-36 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-24 rounded bg-white/[0.04] animate-pulse" />
          </div>
          <div className="w-16 h-5 rounded bg-white/[0.06] animate-pulse shrink-0" />
          <div className="w-20 h-5 rounded bg-white/[0.06] animate-pulse shrink-0" />
          <div className="w-14 h-5 rounded bg-white/[0.06] animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  )
}

function TimeDisplay() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => {
      // Countdown to end of CTF day (arbitrary — replace with real end time if available)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      const diff = end.getTime() - Date.now()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return <>{time}</>
}

export default function Scoreboard({ players, stats, loading = false }: ScoreboardProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const top3 = useMemo(() => players.filter(p => p.rank <= 3).sort((a, b) => a.rank - b.rank), [players])
  const rest = useMemo(() => players.filter(p => p.rank > 3), [players])

  if (!mounted) return null

  const medalColors: Record<number, { bg: string; border: string; text: string; label: string }> = {
    1: { bg: 'rgba(34,211,238,0.08)', border: 'var(--aurora-cyan)', text: 'var(--aurora-cyan)', label: '1st' },
    2: { bg: 'rgba(155,164,178,0.08)', border: 'var(--text-muted)', text: 'var(--text-muted)', label: '2nd' },
    3: { bg: 'rgba(255,176,32,0.08)', border: 'var(--signal-amber)', text: 'var(--signal-amber)', label: '3rd' },
  }

  return (
    <div className="min-h-screen pt-16" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        {/* ─── HERO BANNER ─── */}
        <div className="relative overflow-hidden rounded-2xl mb-8 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          {/* Faint circuit pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, var(--aurora-cyan) 0.5px, transparent 0.5px), radial-gradient(circle at 80% 50%, var(--aurora-violet) 0.5px, transparent 0.5px)`,
            backgroundSize: '40px 40px',
          }} />
          <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-8 sm:py-10">
            {/* Left: decorative icon */}
            <div className="hidden sm:flex flex-col items-center">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.2)' }}>
                  <Target className="w-7 h-7" style={{ color: 'var(--aurora-violet)' }} />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full" style={{ background: 'rgba(124,92,255,0.15)', filter: 'blur(6px)' }} />
              </div>
            </div>

            {/* Center: title */}
            <div className="text-center flex-1">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--aurora-cyan)' }}>
                CGS CTF · 2026
              </p>
              <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
                SCOREBOARD
              </h1>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] mt-2 flex items-center justify-center gap-2" style={{ color: 'var(--aurora-violet)' }}>
                <span className="inline-block w-4 h-px" style={{ background: 'var(--aurora-violet)' }} />
                COMPETE. EXPLOIT. CAPTURE.
                <span className="inline-block w-4 h-px" style={{ background: 'var(--aurora-violet)' }} />
              </p>
            </div>

            {/* Right: trophy icon */}
            <div className="hidden sm:flex flex-col items-center">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}>
                  <Trophy className="w-7 h-7" style={{ color: 'var(--aurora-cyan)' }} />
                </div>
                {/* Concentric rings */}
                <div className="absolute inset-0 rounded-2xl border" style={{ borderColor: 'rgba(34,211,238,0.1)', transform: 'scale(1.25)' }} />
                <div className="absolute inset-0 rounded-2xl border" style={{ borderColor: 'rgba(34,211,238,0.05)', transform: 'scale(1.5)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ─── STATS BAR ─── */}
        {stats && (
          <div className="rounded-xl border mb-8 overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-y sm:divide-y-0" style={{ borderColor: 'var(--border)' }}>
              {[
                { icon: Users, label: 'TEAMS', value: stats.totalUsers, color: 'var(--aurora-violet)' },
                { icon: Layers, label: 'CHALLENGES', value: stats.totalChallenges, color: 'var(--aurora-cyan)' },
                { icon: CheckCircle, label: 'SOLVED', value: stats.totalSolves, color: 'var(--aurora-emerald)' },
                { icon: Clock, label: 'TIME REMAINING', value: <TimeDisplay />, color: 'var(--signal-amber)' },
                { icon: Zap, label: 'TOTAL POINTS', value: stats.totalScore.toLocaleString(), color: 'var(--aurora-cyan)' },
              ].map((item, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                    <span className="font-mono text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      {item.label}
                    </span>
                  </div>
                  <div className="font-display font-bold text-xl sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TABLE ─── */}
        {loading ? (
          <Skeleton />
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <Trophy className="w-10 h-10 mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-display font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>No scores yet</p>
            <p className="font-mono text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Solve a challenge to get on the board!</p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="font-mono text-[10px] font-semibold uppercase tracking-widest px-5 py-3.5 w-16" style={{ color: 'var(--aurora-cyan)' }}>Rank</th>
                    <th className="font-mono text-[10px] font-semibold uppercase tracking-widest px-5 py-3.5" style={{ color: 'var(--aurora-cyan)' }}>Player</th>
                    <th className="font-mono text-[10px] font-semibold uppercase tracking-widest px-5 py-3.5 w-24 text-right" style={{ color: 'var(--aurora-cyan)' }}>Points</th>
                    <th className="font-mono text-[10px] font-semibold uppercase tracking-widest px-5 py-3.5 w-28 text-center hidden sm:table-cell" style={{ color: 'var(--aurora-cyan)' }}>Solved</th>
                    <th className="font-mono text-[10px] font-semibold uppercase tracking-widest px-5 py-3.5 w-44 hidden md:table-cell" style={{ color: 'var(--aurora-cyan)' }}>Last Activity</th>
                    <th className="font-mono text-[10px] font-semibold uppercase tracking-widest px-5 py-3.5 w-20 text-center hidden lg:table-cell" style={{ color: 'var(--aurora-cyan)' }}>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Top 3 */}
                  {top3.map(player => {
                    const mc = medalColors[player.rank]
                    return (
                      <tr key={player.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg font-mono font-bold text-sm" style={{ background: mc.bg, border: `1px solid ${mc.border}`, color: mc.text }}>
                            {player.rank}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-sm shrink-0" style={{ background: mc.bg, border: `1px solid ${mc.border}`, color: mc.text }}>
                              {player.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{player.username}</p>
                              <p className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                {[player.country, player.college].filter(Boolean).join(' · ') || '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-display font-bold text-base" style={{ color: mc.text }}>
                            {player.score.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center hidden sm:table-cell">
                          <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {player.solves}<span className="text-txt-muted">/{player.totalChallenges}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          {player.lastActivity ? (
                            <div>
                              <p className="font-mono text-xs truncate max-w-[180px]" style={{ color: 'var(--text-secondary)' }} title={player.lastActivity.title}>
                                {player.lastActivity.title}
                              </p>
                              <p className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                {getRelativeTime(player.lastActivity.time)}
                              </p>
                            </div>
                          ) : (
                            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center hidden lg:table-cell">
                          <span className="inline-flex items-center gap-1 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                            <Minus className="w-3 h-3" /> —
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {/* Ranks 4+ */}
                  {rest.map((player, i) => (
                    <tr key={player.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: i < rest.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-sm" style={{ color: 'var(--text-muted)' }}>
                          #{player.rank}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-sm shrink-0 border" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                            {player.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{player.username}</p>
                            <p className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              {[player.country, player.college].filter(Boolean).join(' · ') || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-display font-bold text-base" style={{ color: 'var(--aurora-emerald)' }}>
                          {player.score.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center hidden sm:table-cell">
                        <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {player.solves}<span className="text-txt-muted">/{player.totalChallenges}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        {player.lastActivity ? (
                          <div>
                            <p className="font-mono text-xs truncate max-w-[180px]" style={{ color: 'var(--text-secondary)' }} title={player.lastActivity.title}>
                              {player.lastActivity.title}
                            </p>
                            <p className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              {getRelativeTime(player.lastActivity.time)}
                            </p>
                          </div>
                        ) : (
                          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center hidden lg:table-cell">
                        <span className="inline-flex items-center gap-1 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Minus className="w-3 h-3" /> —
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── FOOTER ─── */}
        {!loading && players.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-5">
            <RefreshCw className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Scoreboard updates every 30 seconds
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
