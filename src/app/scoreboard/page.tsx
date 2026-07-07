'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Loader2 } from 'lucide-react'

interface ScoreboardEntry {
  rank: number
  id: number
  username: string
  score: number
  country: string | null
  college: string | null
  createdAt: string
}

const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600']

export default function ScoreboardPage() {
  const [entries, setEntries] = useState<ScoreboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/scoreboard')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEntries(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-[var(--aurora-cyan)]" />
            <h1 className="font-display text-4xl text-txt-primary">Scoreboard</h1>
          </div>
          <p className="text-txt-secondary font-mono text-sm">Top players ranked by total points</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-[var(--aurora-cyan)] animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-txt-muted font-mono text-sm">No scores yet. Solve a challenge to get on the board!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-5 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <div className="w-10 text-center shrink-0">
                  {entry.rank <= 3 ? (
                    <Medal className={`w-5 h-5 mx-auto ${rankColors[entry.rank - 1]}`} />
                  ) : (
                    <span className="font-mono text-sm text-txt-muted">#{entry.rank}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm text-txt-primary truncate">{entry.username}</p>
                  {(entry.country || entry.college) && (
                    <p className="text-[10px] font-mono text-txt-muted truncate">
                      {[entry.country, entry.college].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-lg text-[var(--aurora-cyan)]">{entry.score}</p>
                  <p className="text-[10px] font-mono text-txt-muted uppercase tracking-wider">pts</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
