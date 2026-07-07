'use client'
import { motion } from 'framer-motion'

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`rounded-lg bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%] animate-shimmer ${className || ''}`} />
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4 overflow-hidden">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="w-8 h-8 rounded-lg" />
          <SkeletonBlock className="w-16 h-3" />
        </div>
        <SkeletonBlock className="w-12 h-3" />
      </div>
      {/* Title */}
      <SkeletonBlock className="w-3/4 h-5" />
      <SkeletonBlock className="w-1/2 h-5" />
      {/* Description */}
      <SkeletonBlock className="w-full h-3" />
      <SkeletonBlock className="w-2/3 h-3" />
      {/* Bottom */}
      <div className="flex gap-2 pt-2">
        <SkeletonBlock className="flex-1 h-9 rounded-lg" />
        <SkeletonBlock className="w-24 h-9 rounded-lg" />
      </div>
    </div>
  )
}

export default function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero skeleton */}
      <div className="space-y-6">
        <SkeletonBlock className="w-48 h-8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
              <SkeletonBlock className="w-10 h-10 rounded-xl" />
              <SkeletonBlock className="w-16 h-7" />
              <SkeletonBlock className="w-20 h-3" />
            </div>
          ))}
        </div>
      </div>
      {/* Filters skeleton */}
      <SkeletonBlock className="w-full h-11 rounded-xl" />
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
