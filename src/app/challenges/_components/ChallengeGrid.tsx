'use client'
import { motion } from 'framer-motion'
import ChallengeCard from './ChallengeCard'

interface Challenge {
  id: number
  title: string
  description: string
  category: string
  difficulty: string
  points: number
  hint?: string | null
  files?: string | null
  createdAt?: string
}

interface Props {
  challenges: Challenge[]
  solvedIds: Set<number>
}

export default function ChallengeGrid({ challenges, solvedIds }: Props) {
  return (
    <motion.div
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {challenges.map((challenge, i) => (
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          solved={solvedIds.has(challenge.id)}
          index={i}
        />
      ))}
    </motion.div>
  )
}
