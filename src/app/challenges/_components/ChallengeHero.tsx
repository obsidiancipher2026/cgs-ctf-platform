'use client'
import { useEffect, useRef } from 'react'
import { motion, useSpring, useTransform, useInView } from 'framer-motion'
import { Shield, CheckCircle, Target, Trophy, TrendingUp } from 'lucide-react'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  suffix?: string
  color: string
  delay?: number
  format?: 'number' | 'percent'
}

function AnimatedCounter({ value, suffix = '', format = 'number' }: { value: number; suffix?: string; format?: 'number' | 'percent' }) {
  const spring = useSpring(0, { stiffness: 60, damping: 15 })
  const display = useTransform(spring, (v) => {
    if (format === 'percent') return `${Math.round(v)}${suffix}`
    if (value >= 1000) return `${Math.round(v).toLocaleString()}${suffix}`
    return `${Math.round(v)}${suffix}`
  })
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => { if (inView) spring.set(value) }, [inView, value, spring])
  return <motion.span ref={ref} className="font-display text-3xl text-txt-primary tabular-nums">{display}</motion.span>
}

function StatCard({ icon, label, value, suffix, color, delay = 0, format }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative group"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative p-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-white/[0.03] to-transparent blur-2xl" />
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.06]`}>
            <div className={color}>{icon}</div>
          </div>
        </div>
        <div className="space-y-1">
          <AnimatedCounter value={value} suffix={suffix} format={format} />
          <p className="text-xs font-mono text-txt-muted tracking-wide">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

interface Props {
  total: number
  solved: number
  remaining: number
}

export default function ChallengeHero({ total, solved, remaining }: Props) {
  const completion = total > 0 ? Math.round((solved / total) * 100) : 0

  return (
    <section className="relative mb-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--aurora-violet)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--aurora-cyan)]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex flex-col lg:flex-row lg:items-end gap-8">
        {/* Left: Title */}
        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--aurora-violet)]/20 to-[var(--aurora-cyan)]/10 border border-[var(--aurora-violet)]/20">
                <Shield className="w-5 h-5 text-[var(--aurora-cyan)]" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-txt-muted">Challenge Arena</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-txt-primary mb-3 tracking-tight">
              Challenges
            </h1>
            <p className="text-sm md:text-base text-txt-secondary font-mono leading-relaxed max-w-xl">
              Test your skills across multiple cybersecurity domains, earn points, and climb the leaderboard.
            </p>
          </motion.div>
        </div>

        {/* Right: Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto lg:min-w-[500px]">
          <StatCard icon={<Trophy className="w-4 h-4" />} label="Available Challenges" value={total} color="text-[var(--aurora-cyan)]" delay={0.1} />
          <StatCard icon={<CheckCircle className="w-4 h-4" />} label="Solved" value={solved} color="text-[var(--aurora-emerald)]" delay={0.15} />
          <StatCard icon={<Target className="w-4 h-4" />} label="Remaining" value={remaining} color="text-amber-400" delay={0.2} />
          <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Completion" value={completion} suffix="%" format="percent" color="text-[var(--aurora-violet)]" delay={0.25} />
        </div>
      </div>
    </section>
  )
}
