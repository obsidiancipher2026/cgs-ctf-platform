'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import WebChallengePlayground from '@/components/challenge/WebChallengePlayground'
import { getChallengeHandler } from '@/lib/web-challenges/handlers'

export default function PlaygroundPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const handler = getChallengeHandler(slug)

  if (!handler) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#05080f] via-[#070b15] to-[#05080f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-txt-primary mb-4">Playground Not Found</h1>
          <p className="text-txt-secondary font-mono text-sm mb-6">This challenge playground doesn&apos;t exist.</p>
          <button onClick={() => router.push('/challenges')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--aurora-violet)]/20 to-[var(--aurora-cyan)]/10 border border-[var(--aurora-violet)]/25 text-sm font-mono text-txt-primary hover:from-[var(--aurora-violet)]/30 hover:to-[var(--aurora-cyan)]/20 transition-all">
            Back to Challenges
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="h-screen flex flex-col bg-[#05080f] overflow-hidden">
      <header className="shrink-0 flex items-center gap-3 px-4 py-2 border-b border-white/[0.06] bg-[#070b15]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-txt-muted hover:text-txt-primary font-mono text-[11px] transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>
        <span className="w-px h-4 bg-white/[0.08]" />
        <span className="font-display text-sm text-txt-primary">{handler.title}</span>
        <span className="text-[10px] font-mono text-txt-muted bg-white/[0.04] px-2 py-0.5 rounded">Playground</span>
      </header>

      <div className="flex-1 min-h-0">
        <WebChallengePlayground slug={slug} title={handler.title} />
      </div>
    </main>
  )
}
