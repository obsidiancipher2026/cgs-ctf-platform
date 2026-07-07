'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Flame } from 'lucide-react'

export interface ScoreboardPlayer {
  rank: number
  id: number
  username: string
  score: number
  bloodPoints: number
  country: string | null
  college: string | null
}

interface ScoreboardProps {
  players: ScoreboardPlayer[]
  loading?: boolean
}

function getFlagEmoji(code: string | null): string {
  if (!code || code.length !== 2) return ''
  const pts = [...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  return String.fromCodePoint(...pts)
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
          <div className="w-8 h-4 rounded bg-white/[0.06] animate-pulse shrink-0" />
          <div className="w-8 h-8 rounded-full bg-white/[0.06] animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-20 rounded bg-white/[0.04] animate-pulse" />
          </div>
          <div className="w-12 h-4 rounded bg-white/[0.06] animate-pulse shrink-0" />
          <div className="w-16 h-6 rounded bg-white/[0.06] animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  )
}

export default function Scoreboard({ players, loading = false }: ScoreboardProps) {
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return players
    const q = search.toLowerCase()
    return players.filter(p =>
      p.username.toLowerCase().includes(q) ||
      (p.country || '').toLowerCase().includes(q) ||
      (p.college || '').toLowerCase().includes(q)
    )
  }, [players, search])

  const top3 = useMemo(() => filtered.filter(p => p.rank <= 3), [filtered])
  const rest = useMemo(() => filtered.filter(p => p.rank > 3), [filtered])

  const medalColors = ['#22D3EE', '#9AA4B2', '#FFB020']
  const medalLabels = ['1st', '2nd', '3rd']

  if (!mounted) return null

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-txt-primary">Scoreboard</h1>
        <p className="font-mono text-sm text-txt-secondary mt-1">Top players ranked by total points</p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, country, university…"
          className="w-full pl-9 pr-3 py-2 rounded-lg text-sm font-mono text-txt-primary bg-surface border border-border-c placeholder:text-txt-muted outline-none transition-colors focus:border-aurora-violet"
          aria-label="Search leaderboard"
        />
      </div>

      {/* Loading */}
      {loading && <Skeleton />}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-xl bg-aurora-violet/10 border border-aurora-violet/20 flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-txt-muted" />
          </div>
          <p className="font-display font-semibold text-txt-primary">
            {search ? 'No players match your search' : 'No scores yet'}
          </p>
          <p className="font-mono text-sm text-txt-muted mt-1">
            {search ? 'Try a different query.' : 'Solve a challenge to get on the board!'}
          </p>
        </div>
      )}

      {/* Top 3 */}
      {!loading && top3.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            {top3.sort((a, b) => a.rank - b.rank).map((player, i) => (
              <div
                key={player.id}
                className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border"
                style={{
                  background: i === 0 ? 'rgba(34,211,238,0.04)' : 'rgba(255,255,255,0.02)',
                  borderColor: i === 0 ? 'rgba(34,211,238,0.2)' : 'var(--border)',
                }}
              >
                <span
                  className="font-mono text-lg font-bold shrink-0"
                  style={{ color: medalColors[i], minWidth: '28px' }}
                >
                  #{player.rank}
                </span>
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0 border"
                    style={{
                      background: 'var(--bg-surface)',
                      borderColor: medalColors[i],
                    }}
                  >
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-medium text-txt-primary truncate">
                      {player.username}
                    </p>
                    <p className="font-mono text-[10px] text-txt-muted truncate flex items-center gap-1">
                      {player.country && <span>{getFlagEmoji(player.country)}</span>}
                      {[player.country, player.college].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {player.bloodPoints > 0 && (
                    <div className="flex items-center gap-1 text-alert-coral">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="font-mono text-xs font-semibold">{player.bloodPoints}</span>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="font-display font-bold text-sm" style={{ color: medalColors[i] }}>
                      {player.score.toLocaleString()}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">pts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Table */}
      {!loading && filtered.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border-c">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.03] border-b border-border-c">
                <th className="font-mono text-[10px] font-semibold uppercase tracking-widest text-txt-muted px-4 py-3 w-14">Rank</th>
                <th className="font-mono text-[10px] font-semibold uppercase tracking-widest text-txt-muted px-4 py-3">Player</th>
                <th className="font-mono text-[10px] font-semibold uppercase tracking-widest text-txt-muted px-4 py-3 hidden sm:table-cell">University</th>
                <th className="font-mono text-[10px] font-semibold uppercase tracking-widest text-txt-muted px-4 py-3 hidden sm:table-cell">Country</th>
                <th className="font-mono text-[10px] font-semibold uppercase tracking-widest text-txt-muted px-4 py-3 w-24 text-right">Blood</th>
                <th className="font-mono text-[10px] font-semibold uppercase tracking-widest text-txt-muted px-4 py-3 w-24 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-c">
              {/* Ranks 1-3 in table */}
              {top3.sort((a, b) => a.rank - b.rank).map(player => (
                <tr
                  key={player.id}
                  className="transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-sm font-bold" style={{ color: medalColors[player.rank - 1] }}>
                      #{player.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-[11px] shrink-0 border"
                        style={{
                          background: 'var(--bg-surface)',
                          borderColor: medalColors[player.rank - 1],
                        }}
                      >
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-sm font-medium text-txt-primary">{player.username}</p>
                        <p className="font-mono text-[10px] text-txt-muted sm:hidden">
                          {[player.college, player.country].filter(Boolean).join(' · ') || '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="font-mono text-xs text-txt-secondary">{player.college || '—'}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="font-mono text-xs text-txt-secondary">
                      {player.country ? `${getFlagEmoji(player.country)} ${player.country}` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {player.bloodPoints > 0 ? (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-alert-coral">
                        <Flame className="w-3 h-3" />
                        {player.bloodPoints}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-txt-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-display font-bold text-sm text-txt-primary">{player.score.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
              {/* Ranks 4+ */}
              {rest.map((player, i) => (
                <tr
                  key={player.id}
                  className="transition-colors hover:bg-white/[0.03]"
                  style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}
                >
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-sm text-txt-muted">#{player.rank}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-[11px] shrink-0 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-sm font-medium text-txt-primary">{player.username}</p>
                        <p className="font-mono text-[10px] text-txt-muted sm:hidden">
                          {[player.college, player.country].filter(Boolean).join(' · ') || '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="font-mono text-xs text-txt-secondary">{player.college || '—'}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="font-mono text-xs text-txt-secondary">
                      {player.country ? `${getFlagEmoji(player.country)} ${player.country}` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {player.bloodPoints > 0 ? (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-alert-coral">
                        <Flame className="w-3 h-3" />
                        {player.bloodPoints}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-txt-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-display font-bold text-sm text-txt-primary">{player.score.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
