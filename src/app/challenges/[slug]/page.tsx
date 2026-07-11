'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { useStore } from '@/lib/store'
import toast from 'react-hot-toast'
import {
  ChallengeHeader,
  ChallengeSidebar,
  ChallengeDescription,
  ChallengeDownloads,
  ChallengeHints,
  ChallengeSubmit,
  ChallengeInstance,
  ChallengeNotes,
  ChallengeProgress,
  ChallengeNavigation,
  ChallengeSkeleton,
  ChallengeToolbar,
} from '@/components/challenge'

interface Challenge {
  id: number
  title: string
  slug: string
  description: string
  markdown?: string | null
  story?: string | null
  category: string
  difficulty?: string | null
  points: number
  hint?: string | null
  hints?: string | null
  hintPenalty?: number
  files?: string | null
  downloads?: string | null
  author?: string | null
  tags?: string | null
  published: boolean
  instanceUrl?: string | null
  instanceType?: string | null
  estimatedTime?: number | null
  solveCount?: number
  solveRate?: number
  createdAt: string
  updatedAt: string
}

interface SolveEntry {
  challenge_id: number
  title: string
  points: number
  category: string
  solved_at: string
}

interface NavChallenge {
  id: number
  title: string
  slug: string
}

export default function ChallengeWorkspacePage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { isAuthenticated } = useStore()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set())
  const [solves, setSolves] = useState<SolveEntry[]>([])
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await api.getChallengeBySlug(slug)
      setChallenge(data)

      const allData = await api.getPublicChallenges()
      setAllChallenges(allData)

      if (isAuthenticated) {
        try {
          const solved = await api.getUserSolves()
          setSolves(solved)
          setSolvedIds(new Set(solved.map((s: SolveEntry) => s.challenge_id)))
        } catch {}
      }
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [slug, isAuthenticated])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const modal = document.querySelector('[data-modal]')
        if (modal) (modal as HTMLElement).click()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (loading) return <ChallengeSkeleton />

  if (notFound || !challenge) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-txt-primary mb-4">Challenge Not Found</h1>
          <p className="text-txt-secondary font-mono text-sm mb-6">The challenge you&apos;re looking for doesn&apos;t exist.</p>
          <button onClick={() => router.push('/challenges')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--aurora-violet)]/20 to-[var(--aurora-cyan)]/10 border border-[var(--aurora-violet)]/25 text-sm font-mono text-txt-primary hover:from-[var(--aurora-violet)]/30 hover:to-[var(--aurora-cyan)]/20 transition-all">
            Back to Challenges
          </button>
        </div>
      </main>
    )
  }

  const solved = solvedIds.has(challenge.id)
  const attempted = !solved && solves.some(s => s.challenge_id === challenge.id)
  const status: 'solved' | 'attempted' | 'unsolved' = solved ? 'solved' : attempted ? 'attempted' : 'unsolved'

  const categoryChallenges = allChallenges
    .filter(c => c.category === challenge.category)
    .sort((a, b) => a.id - b.id)
  const currentIndex = categoryChallenges.findIndex(c => c.id === challenge.id)

  const previousChallenge: NavChallenge | null = currentIndex > 0
    ? { id: categoryChallenges[currentIndex - 1].id, title: categoryChallenges[currentIndex - 1].title, slug: categoryChallenges[currentIndex - 1].slug }
    : null
  const nextChallenge: NavChallenge | null = currentIndex < categoryChallenges.length - 1
    ? { id: categoryChallenges[currentIndex + 1].id, title: categoryChallenges[currentIndex + 1].title, slug: categoryChallenges[currentIndex + 1].slug }
    : null

  const handleRandom = () => {
    const others = allChallenges.filter(c => c.id !== challenge.id)
    if (others.length > 0) {
      const random = others[Math.floor(Math.random() * others.length)]
      router.push(`/challenges/${random.slug}`)
    }
  }

  const categoryProgress = Array.from(new Set(allChallenges.map(c => c.category))).map(cat => ({
    category: cat,
    solved: allChallenges.filter(c => c.category === cat && solvedIds.has(c.id)).length,
    total: allChallenges.filter(c => c.category === cat).length,
  }))

  const progress = {
    currentSolved: solved,
    totalChallenges: allChallenges.length,
    totalSolved: solvedIds.size,
    categories: categoryProgress,
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f]">
      <ChallengeToolbar title={challenge.title} status={status} onBack={() => router.push('/challenges')} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <ChallengeHeader challenge={challenge} status={status} />
        </motion.div>

        <div className="mt-6">
          <ChallengeNavigation
            previous={previousChallenge}
            next={nextChallenge}
            onRandom={handleRandom}
            category={challenge.category}
          />
        </div>

        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-8">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <ChallengeDescription description={challenge.description} markdown={challenge.markdown} story={challenge.story} />
            </motion.div>

            {challenge.instanceType === 'web' && challenge.instanceUrl && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <ChallengeInstance
                  slug={challenge.slug}
                  instanceType={challenge.instanceType}
                  instanceUrl={challenge.instanceUrl}
                  challengeId={challenge.id}
                />
                {challenge.instanceUrl?.startsWith('/playground/') && (
                  <div className="mt-2 text-[10px] font-mono text-txt-muted text-center">
                    Opens the interactive playground in a new tab. Use the request builder to send custom requests.
                  </div>
                )}
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <ChallengeDownloads slug={challenge.slug} downloads={challenge.downloads} files={challenge.files} challengeId={challenge.id} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <ChallengeHints hint={challenge.hint} hints={challenge.hints} hintPenalty={challenge.hintPenalty} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <ChallengeNotes challengeSlug={challenge.slug} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <ChallengeSidebar challenge={challenge} status={status}>
              <ChallengeSubmit slug={challenge.slug} challengeId={challenge.id} solved={solved} onSolved={loadData} />
            </ChallengeSidebar>
          </div>
        </div>

        <div className="mt-12">
          <ChallengeProgress progress={progress} />
        </div>
      </div>
    </main>
  )
}
