'use client'
import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowUpDown, Check, RotateCcw, Filter } from 'lucide-react'

export type SortKey = 'newest' | 'oldest' | 'points-high' | 'points-low' | 'alphabetical' | 'solved-first' | 'unsolved-first'

interface Props {
  search: string
  onSearchChange: (v: string) => void
  selectedCategories: string[]
  onCategoryToggle: (cat: string) => void
  selectedDifficulties: string[]
  onDifficultyToggle: (diff: string) => void
  sort: SortKey
  onSortChange: (s: SortKey) => void
  hideSolved: boolean
  onHideSolvedToggle: () => void
  onReset: () => void
  categories: string[]
  availableDifficulties: string[]
}

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'points-high', label: 'Highest Points' },
  { key: 'points-low', label: 'Lowest Points' },
  { key: 'alphabetical', label: 'A–Z' },
]

const difficultyMeta: Record<string, { label: string; color: string; bars: number }> = {
  easy: { label: 'Easy', color: 'text-[var(--aurora-emerald)]', bars: 1 },
  medium: { label: 'Medium', color: 'text-[var(--aurora-cyan)]', bars: 2 },
  hard: { label: 'Hard', color: 'text-[#FF4500]', bars: 3 },
}

const categoryEmoji: Record<string, string> = {
  web: '🌐', crypto: '🔐', forensics: '🕵️', reverse: '🧠', misc: '📦',
}

export default function FilterToolbar({
  search, onSearchChange,
  selectedCategories, onCategoryToggle,
  selectedDifficulties, onDifficultyToggle,
  sort, onSortChange,
  hideSolved, onHideSolvedToggle,
  onReset, categories, availableDifficulties,
}: Props) {
  const [showSort, setShowSort] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const hasFilters = search || selectedCategories.length > 0 || selectedDifficulties.length > 0 || hideSolved

  return (
    <div className="space-y-4 mb-8">
      {/* Row 1: Search + Sort + Reset */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted group-focus-within:text-[var(--aurora-cyan)] transition-colors" />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search challenges..."
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-txt-primary text-sm font-mono placeholder:text-txt-muted/50 focus:outline-none focus:border-[var(--aurora-cyan)]/40 focus:bg-white/[0.06] transition-all"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-3.5 h-3.5 text-txt-muted" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Sort + Reset */}
        <div className="flex gap-2">
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSort(!showSort)}
              className="h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-txt-secondary text-xs font-mono hover:bg-white/[0.08] hover:text-txt-primary transition-all flex items-center gap-2"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{sortOptions.find(o => o.key === sort)?.label || 'Sort'}</span>
            </button>
            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#0B0F17] border border-white/[0.1] shadow-2xl overflow-hidden z-50"
                >
                  {sortOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => { onSortChange(opt.key); setShowSort(false) }}
                      className={`w-full px-4 py-2.5 text-xs font-mono text-left flex items-center justify-between hover:bg-white/[0.05] transition-colors ${sort === opt.key ? 'text-[var(--aurora-cyan)]' : 'text-txt-secondary'}`}
                    >
                      {opt.label}
                      {sort === opt.key && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onHideSolvedToggle}
            className={`h-11 px-4 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 ${hideSolved
              ? 'bg-[var(--aurora-emerald)]/10 border-[var(--aurora-emerald)]/30 text-[var(--aurora-emerald)]'
              : 'bg-white/[0.04] border-white/[0.08] text-txt-secondary hover:bg-white/[0.08]'}`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{hideSolved ? 'Solved Hidden' : 'Hide Solved'}</span>
          </button>

          <AnimatePresence>
            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={onReset}
                className="h-11 w-11 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-txt-muted hover:text-[var(--aurora-cyan)] hover:border-[var(--aurora-cyan)]/30 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Row 2: Category + Difficulty pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const active = selectedCategories.includes(cat)
          return (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryToggle(cat)}
              className={`px-3.5 py-2 rounded-full text-xs font-mono capitalize tracking-wide border transition-all ${
                active
                  ? 'bg-[var(--aurora-violet)]/15 border-[var(--aurora-violet)]/40 text-[var(--aurora-violet)] shadow-lg shadow-[var(--aurora-violet)]/5'
                  : 'bg-white/[0.03] border-white/[0.06] text-txt-muted hover:bg-white/[0.06] hover:text-txt-secondary'
              }`}
            >
              <span className="mr-1.5">{categoryEmoji[cat] || '#'}</span>
              {cat}
            </motion.button>
          )
        })}
      </div>

      {/* Row 3: Difficulty pills */}
      <div className="flex flex-wrap gap-2">
        {availableDifficulties.map(diff => {
          const meta = difficultyMeta[diff]
          const active = selectedDifficulties.includes(diff)
          return (
            <motion.button
              key={diff}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDifficultyToggle(diff)}
              className={`px-3.5 py-2 rounded-full text-xs font-mono capitalize tracking-wide border transition-all ${
                active
                  ? 'border-white/[0.2] bg-white/[0.08] text-txt-primary shadow-lg'
                  : 'bg-white/[0.03] border-white/[0.06] text-txt-muted hover:bg-white/[0.06] hover:text-txt-secondary'
              }`}
            >
              <span className={meta?.color || 'text-txt-muted'}>
                {'■'.repeat(meta?.bars || 1)}{'□'.repeat(3 - (meta?.bars || 1))}
              </span>
              <span className="ml-2">{diff}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
