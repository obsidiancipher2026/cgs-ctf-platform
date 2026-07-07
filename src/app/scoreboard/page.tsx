'use client'

import { useState, useEffect } from 'react'
import Scoreboard, { type ScoreboardPlayer, type ScoreboardStats } from '@/components/scoreboard/Scoreboard'

export default function ScoreboardPage() {
  const [players, setPlayers] = useState<ScoreboardPlayer[]>([])
  const [stats, setStats] = useState<ScoreboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/scoreboard')
      .then(res => res.json())
      .then(data => {
        if (data.players) {
          setPlayers(data.players)
          setStats(data.stats)
        } else if (Array.isArray(data)) {
          setPlayers(data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Scoreboard players={players} stats={stats} loading={loading} />
    </main>
  )
}
