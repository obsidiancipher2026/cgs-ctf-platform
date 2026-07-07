'use client'
import { motion } from 'framer-motion'
import { SearchX, RotateCcw } from 'lucide-react'

interface Props {
  hasFilters: boolean
  onReset: () => void
}

export default function EmptyState({ hasFilters, onReset }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-4"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6"
      >
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <SearchX className="w-12 h-12 text-txt-muted/40" />
        </div>
      </motion.div>
      <h3 className="font-display text-lg text-txt-primary mb-2">No challenges found</h3>
      <p className="text-sm font-mono text-txt-muted text-center max-w-md mb-6">
        {hasFilters
          ? 'Try adjusting your filters or search query to find what you\'re looking for.'
          : 'Challenges are being prepared. Check back soon.'}
      </p>
      {hasFilters && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--aurora-violet)]/20 to-[var(--aurora-cyan)]/10 border border-[var(--aurora-violet)]/20 text-xs font-mono text-txt-primary hover:from-[var(--aurora-violet)]/30 hover:to-[var(--aurora-cyan)]/20 transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </motion.button>
      )}
    </motion.div>
  )
}
