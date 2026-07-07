'use client'

import { useState, useEffect } from 'react'
import Scoreboard, { type ScoreboardPlayer } from '@/components/scoreboard/Scoreboard'

export default function ScoreboardPage() {
  const [players, setPlayers] = useState<ScoreboardPlayer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/scoreboard')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPlayers(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="pt-16 pb-12">
        <Scoreboard players={players} loading={loading} />
      </div>
    </main>
  )
}
