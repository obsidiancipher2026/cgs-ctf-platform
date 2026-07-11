'use client'

import { useState, useEffect, useMemo } from 'react'
import { Trophy, Users, Layers, CheckCircle, Zap, RefreshCw, Target } from 'lucide-react'

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

function Skeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
          <div className="w-6 h-4 rounded bg-white/[0.06] animate-pulse shrink-0" />
          <div className="w-7 h-7 rounded-lg bg-white/[0.06] animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-32 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-2.5 w-20 rounded bg-white/[0.04] animate-pulse" />
          </div>
          <div className="w-14 h-4 rounded bg-white/[0.06] animate-pulse shrink-0" />
          <div className="w-16 h-4 rounded bg-white/[0.06] animate-pulse shrink-0" />
          <div className="w-10 h-4 rounded bg-white/[0.06] animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  )
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
    <div className="min-h-screen pt-14" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

        {/* ─── HERO BANNER ─── */}
        <div className="relative overflow-hidden rounded-xl mb-6 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="relative z-10 flex items-center justify-between px-5 py-5">
            <div className="hidden sm:flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.2)' }}>
                <Target className="w-5 h-5" style={{ color: 'var(--aurora-violet)' }} />
              </div>
            </div>

            <div className="text-center flex-1">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--aurora-cyan)' }}>
                CGS CTF · 2026
              </p>
              <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
                SCOREBOARD
              </h1>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] mt-1 flex items-center justify-center gap-2" style={{ color: 'var(--aurora-violet)' }}>
                <span className="inline-block w-3 h-px" style={{ background: 'var(--aurora-violet)' }} />
                COMPETE. EXPLOIT. CAPTURE.
                <span className="inline-block w-3 h-px" style={{ background: 'var(--aurora-violet)' }} />
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}>
                <Trophy className="w-5 h-5" style={{ color: 'var(--aurora-cyan)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ─── STATS BAR ─── */}
        {stats && (
          <div className="rounded-lg border mb-6 overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0" style={{ borderColor: 'var(--border)' }}>
              {[
                { icon: Users, label: 'TEAMS', value: stats.totalUsers, color: 'var(--aurora-violet)' },
                { icon: Layers, label: 'CHALLENGES', value: stats.totalChallenges, color: 'var(--aurora-cyan)' },
                { icon: CheckCircle, label: 'SOLVED', value: stats.totalSolves, color: 'var(--aurora-emerald)' },
                { icon: Zap, label: 'TOTAL POINTS', value: stats.totalScore.toLocaleString(), color: 'var(--aurora-cyan)' },
              ].map((item, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <item.icon className="w-3 h-3" style={{ color: item.color }} />
                    <span className="font-mono text-[8px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      {item.label}
                    </span>
                  </div>
                  <div className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
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
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <Trophy className="w-8 h-8 mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>No scores yet</p>
            <p className="font-mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Solve a challenge to get on the board!</p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="font-mono text-[9px] font-semibold uppercase tracking-widest px-4 py-2.5 w-14" style={{ color: 'var(--aurora-cyan)' }}>Rank</th>
                    <th className="font-mono text-[9px] font-semibold uppercase tracking-widest px-4 py-2.5" style={{ color: 'var(--aurora-cyan)' }}>Player</th>
                    <th className="font-mono text-[9px] font-semibold uppercase tracking-widest px-4 py-2.5 w-20 text-right" style={{ color: 'var(--aurora-cyan)' }}>Points</th>
                    <th className="font-mono text-[9px] font-semibold uppercase tracking-widest px-4 py-2.5 w-24 text-center hidden sm:table-cell" style={{ color: 'var(--aurora-cyan)' }}>Solved</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Top 3 */}
                  {top3.map(player => {
                    const mc = medalColors[player.rank]
                    return (
                      <tr key={player.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg font-mono font-bold text-xs" style={{ background: mc.bg, border: `1px solid ${mc.border}`, color: mc.text }}>
                            {player.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs shrink-0" style={{ background: mc.bg, border: `1px solid ${mc.border}`, color: mc.text }}>
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
                        <td className="px-4 py-3 text-right">
                          <span className="font-display font-bold text-sm" style={{ color: mc.text }}>
                            {player.score.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                          <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {player.solves}<span style={{ color: 'var(--text-muted)' }}>/{player.totalChallenges}</span>
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {/* Ranks 4+ */}
                  {rest.map((player, i) => (
                    <tr key={player.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: i < rest.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-xs" style={{ color: 'var(--text-muted)' }}>
                          #{player.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs shrink-0 border" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
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
                      <td className="px-4 py-3 text-right">
                        <span className="font-display font-bold text-sm" style={{ color: 'var(--aurora-emerald)' }}>
                          {player.score.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {player.solves}<span className="text-txt-muted">/{player.totalChallenges}</span>
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
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <RefreshCw className="w-2.5 h-2.5" style={{ color: 'var(--text-muted)' }} />
            <p className="font-mono text-[9px]" style={{ color: 'var(--text-muted)' }}>
              Auto-refreshes every 30s
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
