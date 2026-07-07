'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import { useStore } from '@/lib/store'
import toast from 'react-hot-toast'
import ChallengeHero from './_components/ChallengeHero'
import ProgressBars from './_components/ProgressBars'
import FilterToolbar, { type SortKey } from './_components/FilterToolbar'
import ChallengeGrid from './_components/ChallengeGrid'
import LoadingSkeleton from './_components/LoadingSkeleton'
import EmptyState from './_components/EmptyState'

interface Challenge {
  id: number
  title: string
  slug?: string
  description: string
  category: string
  difficulty: string
  points: number
  hint?: string | null
  files?: string | null
  instanceUrl?: string | null
  createdAt?: string
}

export default function ChallengesPage() {
  const { isAuthenticated } = useStore()

  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set())
  const [solves, setSolves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [sort, setSort] = useState<SortKey>('newest')
  const [hideSolved, setHideSolved] = useState(false)

  useEffect(() => { loadChallenges() }, [])

  const loadChallenges = async () => {
    try {
      const data: Challenge[] = await api.getPublicChallenges()
      setChallenges(data)
      if (isAuthenticated) {
        try {
          const solved = await api.getUserSolves()
          setSolves(solved)
          setSolvedIds(new Set(solved.map((s: any) => s.challenge_id)))
        } catch {}
      }
    } catch {
      toast.error('Failed to load challenges')
    } finally {
      setLoading(false)
    }
  }

  const categories = useMemo(
    () => Array.from(new Set(challenges.map(c => c.category))).sort(),
    [challenges]
  )
  const difficulties = useMemo(
    () => Array.from(new Set(challenges.map(c => c.difficulty))).filter(Boolean).sort(),
    [challenges]
  ) as string[]

  // Compute per-category progress
  const categoryProgress = useMemo(() => {
    return categories.map(cat => {
      const total = challenges.filter(c => c.category === cat).length
      const solved = solves.filter((s: any) => {
        const ch = challenges.find(c => c.id === s.challenge_id)
        return ch && ch.category === cat
      }).length
      return { category: cat, solved, total }
    })
  }, [categories, challenges, solves])

  // Filter & sort
  const filtered = useMemo(() => {
    let result = [...challenges]

    if (selectedCategories.length > 0) {
      result = result.filter(c => selectedCategories.includes(c.category))
    }
    if (selectedDifficulties.length > 0) {
      result = result.filter(c => selectedDifficulties.includes(c.difficulty))
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      )
    }
    if (hideSolved) {
      result = result.filter(c => !solvedIds.has(c.id))
    }

    switch (sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
        break
      case 'points-high':
        result.sort((a, b) => b.points - a.points)
        break
      case 'points-low':
        result.sort((a, b) => a.points - b.points)
        break
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return result
  }, [challenges, selectedCategories, selectedDifficulties, search, hideSolved, solvedIds, sort])

  const hasFilters = !!(search || selectedCategories.length > 0 || selectedDifficulties.length > 0 || hideSolved)

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }, [])

  const toggleDifficulty = useCallback((diff: string) => {
    setSelectedDifficulties(prev =>
      prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]
    )
  }, [])

  const resetFilters = useCallback(() => {
    setSearch('')
    setSelectedCategories([])
    setSelectedDifficulties([])
    setHideSolved(false)
    setSort('newest')
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <LoadingSkeleton />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <ChallengeHero
          total={challenges.length}
          solved={solvedIds.size}
          remaining={challenges.length - solvedIds.size}
        />

        {/* Progress Bars */}
        {challenges.length > 0 && (
          <ProgressBars
            total={challenges.length}
            solved={solvedIds.size}
            categoryProgress={categoryProgress}
          />
        )}

        {/* Filters */}
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          selectedCategories={selectedCategories}
          onCategoryToggle={toggleCategory}
          selectedDifficulties={selectedDifficulties}
          onDifficultyToggle={toggleDifficulty}
          sort={sort}
          onSortChange={setSort}
          hideSolved={hideSolved}
          onHideSolvedToggle={() => setHideSolved(prev => !prev)}
          onReset={resetFilters}
          categories={categories}
          availableDifficulties={difficulties}
        />

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-mono text-txt-muted">
            <span className="text-txt-primary tabular-nums">{filtered.length}</span> challenge{filtered.length !== 1 ? 's' : ''} found
            {hasFilters && <span className="text-txt-muted/60"> · {filtered.length !== challenges.length && `${challenges.length} total`}</span>}
          </p>
        </div>

        {/* Grid or Empty */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <EmptyState key="empty" hasFilters={hasFilters} onReset={resetFilters} />
          ) : (
            <ChallengeGrid key="grid" challenges={filtered} solvedIds={solvedIds} />
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
