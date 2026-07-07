'use client'

import { motion } from 'framer-motion'

export default function ChallengeSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="h-3 rounded bg-white/[0.06] animate-shimmer"
              style={{ width: 60 + Math.random() * 40 }}
            />
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content skeleton */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="flex gap-3">
                <div className="h-6 w-20 rounded-full bg-white/[0.06] animate-shimmer" />
                <div className="h-6 w-16 rounded-full bg-white/[0.06] animate-shimmer" />
                <div className="h-6 w-24 rounded-full bg-white/[0.06] animate-shimmer" />
              </div>
              <div className="h-10 w-3/4 rounded-lg bg-white/[0.06] animate-shimmer" />
              <div className="flex gap-4">
                <div className="h-4 w-32 rounded bg-white/[0.04] animate-shimmer" />
                <div className="h-4 w-24 rounded bg-white/[0.04] animate-shimmer" />
                <div className="h-4 w-20 rounded bg-white/[0.04] animate-shimmer" />
              </div>
            </motion.div>

            {/* Description skeleton */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 sm:p-8 space-y-4"
            >
              <div className="h-4 w-full rounded bg-white/[0.06] animate-shimmer" />
              <div className="h-4 w-5/6 rounded bg-white/[0.06] animate-shimmer" />
              <div className="h-4 w-4/5 rounded bg-white/[0.06] animate-shimmer" />
              <div className="h-24 w-full rounded-xl bg-white/[0.04] animate-shimmer mt-4" />
              <div className="h-4 w-3/4 rounded bg-white/[0.06] animate-shimmer" />
              <div className="h-4 w-2/3 rounded bg-white/[0.06] animate-shimmer" />
            </motion.div>

            {/* Downloads skeleton */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 space-y-3"
            >
              <div className="h-4 w-24 rounded bg-white/[0.06] animate-shimmer" />
              {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03]">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] animate-shimmer" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 rounded bg-white/[0.06] animate-shimmer" />
                    <div className="h-2.5 w-16 rounded bg-white/[0.04] animate-shimmer" />
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Hints skeleton */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 space-y-3"
            >
              <div className="h-4 w-16 rounded bg-white/[0.06] animate-shimmer" />
              {[1, 2].map(i => (
                <div key={i} className="h-12 w-full rounded-xl bg-white/[0.03] animate-shimmer" />
              ))}
            </motion.div>
          </div>

          {/* Sidebar skeleton */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full lg:w-[340px] shrink-0 space-y-4"
          >
            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 space-y-4">
              <div className="h-4 w-28 rounded bg-white/[0.06] animate-shimmer" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 w-16 rounded bg-white/[0.04] animate-shimmer" />
                    <div className="h-3 w-20 rounded bg-white/[0.06] animate-shimmer" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 space-y-3">
              <div className="h-4 w-24 rounded bg-white/[0.06] animate-shimmer" />
              <div className="h-12 w-full rounded-xl bg-white/[0.03] animate-shimmer" />
              <div className="h-11 w-full rounded-xl bg-white/[0.06] animate-shimmer" />
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 space-y-3">
              <div className="h-4 w-20 rounded bg-white/[0.06] animate-shimmer" />
              {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 w-24 rounded bg-white/[0.04] animate-shimmer" />
                  <div className="h-3 w-12 rounded bg-white/[0.06] animate-shimmer" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
