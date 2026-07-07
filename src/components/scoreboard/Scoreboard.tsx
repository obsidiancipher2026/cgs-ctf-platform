'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Search, Flame, ChevronUp, ChevronDown, Users } from 'lucide-react'

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

function getFlagEmoji(countryCode: string | null): string {
  if (!countryCode || countryCode.length !== 2) return ''
  const codePoints = [...countryCode.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  return String.fromCodePoint(...codePoints)
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function useCountUp(end: number, duration: number, startOn: boolean) {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!startOn) { setValue(0); return }
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setValue(Math.floor(progress * end))
      if (progress < 1) frameRef.current = requestAnimationFrame(step)
    }
    frameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameRef.current)
  }, [end, duration, startOn])

  return value
}

function SkeletonRow({ width = '100%' }: { width?: string }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className="w-10 h-5 rounded bg-white/[0.06] animate-pulse shrink-0" />
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-full bg-white/[0.06] animate-pulse shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 w-28 rounded bg-white/[0.06] animate-pulse" />
          <div className="h-2.5 w-20 rounded bg-white/[0.04] animate-pulse" />
        </div>
      </div>
      <div className="w-16 h-5 rounded bg-white/[0.06] animate-pulse shrink-0" />
      <div className="w-14 h-7 rounded bg-white/[0.06] animate-pulse shrink-0" />
    </div>
  )
}

function PodiumCard({
  player,
  rank,
  accentColor,
  size,
  delay,
}: {
  player: ScoreboardPlayer
  rank: number
  accentColor: string
  size: 'lg' | 'sm'
  delay: number
}) {
  const isLg = size === 'lg'
  const bloodCounted = useCountUp(player.bloodPoints, 800, true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className={`relative flex flex-col items-center ${isLg ? 'scale-100' : 'scale-90 md:scale-100'}`}
    >
      {/* Medal */}
      <div className="relative mb-3">
        <div
          className={`rounded-full flex items-center justify-center border-2 ${
            rank === 1
              ? 'w-16 h-16 md:w-20 md:h-20 border-[var(--aurora-cyan)] shadow-[0_0_30px_-5px_var(--aurora-cyan)]'
              : rank === 2
              ? 'w-14 h-14 md:w-16 md:h-16 border-[var(--text-muted)] shadow-[0_0_20px_-5px_rgba(155,164,178,0.3)]'
              : 'w-14 h-14 md:w-16 md:h-16 border-[var(--signal-amber)] shadow-[0_0_20px_-5px_var(--signal-amber)]'
          }`}
          style={{ background: 'var(--bg-surface)' }}
        >
          <span className="font-display font-bold text-lg md:text-xl" style={{ color: accentColor }}>
            #{rank}
          </span>
        </div>
        {rank === 1 && (
          <div className="absolute -top-2 -right-2">
            <Trophy className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'var(--aurora-cyan)' }} />
          </div>
        )}
      </div>

      {/* Avatar */}
      <div
        className={`rounded-full bg-white/[0.04] flex items-center justify-center font-display font-bold mb-2 border-2 ${
          isLg ? 'w-14 h-14 md:w-16 md:h-16 text-lg md:text-xl' : 'w-11 h-11 md:w-14 md:h-14 text-base md:text-lg'
        }`}
        style={{
          borderColor: accentColor,
          color: 'var(--text-primary)',
          boxShadow: rank === 1 ? `0 0 25px -5px ${accentColor}` : 'none',
        }}
      >
        {player.username.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <p
        className="font-display font-semibold text-center leading-tight"
        style={{
          color: 'var(--text-primary)',
          fontSize: isLg ? 'clamp(0.95rem, 1.4vw, 1.15rem)' : 'clamp(0.8rem, 1.1vw, 0.95rem)',
        }}
      >
        {player.username}
      </p>

      {/* Country + College */}
      {(player.country || player.college) && (
        <p
          className="font-mono text-center mt-0.5 truncate max-w-[140px]"
          style={{ color: 'var(--text-muted)', fontSize: '10px' }}
        >
          {player.country && `${getFlagEmoji(player.country)} ${player.country}`}
          {player.country && player.college && ' · '}
          {player.college}
        </p>
      )}

      {/* Score */}
      <div className="flex items-center gap-3 mt-3">
        <div className="text-center">
          <p
            className="font-display font-bold"
            style={{
              color: accentColor,
              fontSize: isLg ? 'clamp(1.3rem, 2vw, 1.7rem)' : 'clamp(1rem, 1.5vw, 1.25rem)',
              textShadow: rank === 1 ? `0 0 20px ${accentColor}40` : 'none',
            }}
          >
            {formatNumber(player.score)}
          </p>
          <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            pts
          </p>
        </div>
        {player.bloodPoints > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: 'rgba(255,92,114,0.1)', border: '1px solid rgba(255,92,114,0.2)' }}>
            <Flame className="w-3 h-3" style={{ color: 'var(--alert-coral)' }} />
            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--alert-coral)' }}>
              +{formatNumber(bloodCounted)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function PlayerRow({
  player,
  index,
  visible,
}: {
  player: ScoreboardPlayer
  index: number
  visible: boolean
}) {
  const scoreCounted = useCountUp(player.score, 900, visible)
  const bloodCounted = useCountUp(player.bloodPoints, 700, visible)
  const isTop10 = player.rank <= 10

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={visible ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.025, duration: 0.35, ease: 'easeOut' }}
      className="group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 cursor-default"
      style={{
        background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
        border: '1px solid transparent',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(124,92,255,0.06)'
        e.currentTarget.style.borderColor = 'rgba(124,92,255,0.2)'
        e.currentTarget.style.boxShadow = '0 0 20px rgba(124,92,255,0.06)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
        e.currentTarget.style.borderColor = 'transparent'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Accent border on hover */}
      <div
        className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: 'linear-gradient(to bottom, var(--aurora-violet), var(--aurora-cyan))' }}
      />

      {/* Rank */}
      <div className="w-10 text-center shrink-0">
        <span
          className="font-mono font-semibold"
          style={{
            color: isTop10 ? 'var(--aurora-cyan)' : 'var(--text-muted)',
            fontSize: isTop10 ? '14px' : '12px',
          }}
        >
          #{player.rank}
        </span>
      </div>

      {/* Player info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0 border"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          {player.username.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {player.username}
          </p>
          <p className="font-mono text-[10px] truncate flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            {player.country && <span>{getFlagEmoji(player.country)}</span>}
            {player.college || player.country ? [player.country, player.college].filter(Boolean).join(' · ') : '—'}
          </p>
        </div>
      </div>

      {/* Blood Points */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0 w-24 justify-end">
        {player.bloodPoints > 0 ? (
          <>
            <Flame className="w-3.5 h-3.5" style={{ color: 'var(--alert-coral)' }} />
            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--alert-coral)' }}>
              {formatNumber(bloodCounted)}
            </span>
          </>
        ) : (
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
        )}
      </div>

      {/* Score */}
      <div className="text-right shrink-0 w-20">
        <p
          className="font-display font-bold"
          style={{
            color: 'var(--aurora-cyan)',
            fontSize: isTop10 ? '16px' : '14px',
          }}
        >
          {formatNumber(scoreCounted)}
        </p>
        <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          pts
        </p>
      </div>
    </motion.div>
  )
}

function PlayerCard({
  player,
  index,
  visible,
}: {
  player: ScoreboardPlayer
  index: number
  visible: boolean
}) {
  const scoreCounted = useCountUp(player.score, 900, visible)
  const bloodCounted = useCountUp(player.bloodPoints, 700, visible)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.03, duration: 0.3, ease: 'easeOut' }}
      className="rounded-xl p-4 border transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 border"
          style={{
            background: 'var(--bg-base)',
            borderColor: index < 3 ? 'var(--aurora-violet)' : 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          {player.username.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>#{player.rank}</span>
            <p className="font-display text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {player.username}
            </p>
          </div>
          <p className="font-mono text-[10px] truncate flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            {player.country && <span>{getFlagEmoji(player.country)}</span>}
            {[player.country, player.college].filter(Boolean).join(' · ') || '—'}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1.5">
          {player.bloodPoints > 0 ? (
            <>
              <Flame className="w-3.5 h-3.5" style={{ color: 'var(--alert-coral)' }} />
              <span className="font-mono text-xs font-semibold" style={{ color: 'var(--alert-coral)' }}>
                +{formatNumber(bloodCounted)}
              </span>
            </>
          ) : (
            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>No blood</span>
          )}
        </div>
        <div className="text-right">
          <span className="font-display font-bold text-lg" style={{ color: 'var(--aurora-cyan)' }}>
            {formatNumber(scoreCounted)}
          </span>
          <span className="font-mono text-[9px] ml-1 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            pts
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default function Scoreboard({ players, loading = false }: ScoreboardProps) {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [mounted, setMounted] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return players
    const q = search.toLowerCase()
    return players.filter(
      p =>
        p.username.toLowerCase().includes(q) ||
        (p.country || '').toLowerCase().includes(q) ||
        (p.college || '').toLowerCase().includes(q)
    )
  }, [players, search])

  const top3 = useMemo(() => filtered.filter(p => p.rank <= 3), [filtered])
  const rest = useMemo(() => filtered.filter(p => p.rank > 3), [filtered])

  const podiumOrder = useMemo(() => {
    if (top3.length === 0) return []
    const map = new Map(top3.map(p => [p.rank, p]))
    return [map.get(2), map.get(1), map.get(3)].filter(Boolean) as ScoreboardPlayer[]
  }, [top3])

  if (!mounted) return null

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.2)' }}>
            <Trophy className="w-6 h-6" style={{ color: 'var(--aurora-cyan)' }} />
          </div>
          <h1
            className="font-display font-bold"
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--aurora-cyan) 60%, var(--aurora-violet) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Scoreboard
          </h1>
        </div>
        <p className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
          Top players ranked by total points
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search players, universities, countries…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm font-mono transition-all duration-200 outline-none"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--aurora-violet)'; e.target.style.boxShadow = '0 0 0 1px var(--aurora-violet)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            aria-label="Search leaderboard"
          />
          <kbd
            className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            ^K
          </kbd>
        </div>

        {/* View toggle */}
        <div className="hidden sm:flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <button
            onClick={() => setViewMode('table')}
            className="px-3 py-2 text-xs font-mono font-medium transition-colors duration-150"
            style={{
              background: viewMode === 'table' ? 'rgba(124,92,255,0.15)' : 'transparent',
              color: viewMode === 'table' ? 'var(--aurora-violet)' : 'var(--text-muted)',
            }}
            aria-label="Table view"
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('card')}
            className="px-3 py-2 text-xs font-mono font-medium transition-colors duration-150"
            style={{
              background: viewMode === 'card' ? 'rgba(124,92,255,0.15)' : 'transparent',
              color: viewMode === 'card' ? 'var(--aurora-violet)' : 'var(--text-muted)',
            }}
            aria-label="Card view"
          >
            Cards
          </button>
        </div>
      </motion.div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-2.5" role="status" aria-label="Loading scoreboard">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(124,92,255,0.08)', border: '1px solid rgba(124,92,255,0.15)' }}
          >
            <Users className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {search ? 'No players match your search' : 'No scores yet'}
          </p>
          <p className="font-mono text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {search
              ? 'Try a different name, university, or country.'
              : 'Solve a challenge to get on the board!'}
          </p>
        </motion.div>
      )}

      {/* Podium Section */}
      {!loading && top3.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px flex-1 max-w-20" style={{ background: 'linear-gradient(90deg, transparent, var(--border))' }} />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              Top Players
            </span>
            <div className="h-px flex-1 max-w-20" style={{ background: 'linear-gradient(270deg, transparent, var(--border))' }} />
          </div>

          {/* Podium layout: 2nd | 1st | 3rd */}
          <div className="flex items-end justify-center gap-4 md:gap-8">
            {podiumOrder.map((player, i) => {
              const rank = i === 0 ? 2 : i === 1 ? 1 : 3
              const colors = [
                'var(--text-muted)',
                'var(--aurora-cyan)',
                'var(--signal-amber)',
              ]
              return (
                <div key={player.id} className={i === 1 ? 'order-1 md:order-2' : i === 0 ? 'order-2 md:order-1' : 'order-3'}>
                  <PodiumCard
                    player={player}
                    rank={rank}
                    accentColor={colors[rank - 1]}
                    size={rank === 1 ? 'lg' : 'sm'}
                    delay={0.3 + i * 0.1}
                  />
                </div>
              )
            })}
          </div>
        </motion.section>
      )}

      {/* Table / List Section */}
      {!loading && rest.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          {viewMode === 'table' ? (
            <>
              {/* Desktop Table Header */}
              <div className="hidden md:flex items-center gap-3 px-5 py-2.5 mb-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="w-10 text-center shrink-0">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Rank</span>
                </div>
                <div className="flex-1 min-w-0 pl-[44px]">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Player</span>
                </div>
                <div className="hidden sm:flex items-center shrink-0 w-24 justify-end">
                  <Flame className="w-3 h-3 mr-1" style={{ color: 'var(--text-muted)' }} />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Blood</span>
                </div>
                <div className="text-right shrink-0 w-20">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Score</span>
                </div>
              </div>

              {/* Desktop Rows */}
              <div className="hidden md:block space-y-0.5">
                <AnimatePresence>
                  {rest.map((player, i) => (
                    <PlayerRow key={player.id} player={player} index={i} visible={mounted} />
                  ))}
                </AnimatePresence>
              </div>

              {/* Mobile Cards (table view on mobile) */}
              <div className="md:hidden space-y-2.5">
                <AnimatePresence>
                  {rest.map((player, i) => (
                    <PlayerCard key={player.id} player={player} index={i} visible={mounted} />
                  ))}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Card View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <AnimatePresence>
                {rest.map((player, i) => (
                  <PlayerCard key={player.id} player={player} index={i} visible={mounted} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>
      )}
    </div>
  )
}
