'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Wrench } from 'lucide-react'

const DEFAULT_MESSAGE = 'The site is currently under maintenance. Please check back later.'

function MaintenanceContent() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState(DEFAULT_MESSAGE)

  useEffect(() => {
    const fromQuery = searchParams.get('msg')
    if (fromQuery) {
      setMessage(fromQuery)
      return
    }
    fetch('/api/maintenance', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => { if (data.message) setMessage(data.message) })
      .catch(() => {})
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.2)] mb-6">
          <Wrench className="w-10 h-10 text-amber-400" />
        </div>
        <h1 className="text-3xl font-display font-bold text-txt-primary mb-4">Under Maintenance</h1>
        <p className="text-txt-secondary font-mono text-sm leading-relaxed">{message}</p>
        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          <p className="text-txt-muted text-xs font-mono">We&apos;ll be back soon.</p>
        </div>
      </div>
    </div>
  )
}

export default function MaintenancePage() {
  return (
    <Suspense fallback={null}>
      <MaintenanceContent />
    </Suspense>
  )
}
