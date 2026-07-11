'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

const ALLOWED_PREFIXES = ['/maintenance', '/lenaPretsaMdliuG']

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useStore((s) => s.user)
  const isLoading = useStore((s) => s.isLoading)

  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')
  const lastEnabled = useRef<boolean | null>(null)

  useEffect(() => {
    let active = true
    const check = async () => {
      try {
        const res = await fetch('/api/maintenance', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!active) return
        setEnabled(data.enabled)
        setMessage(data.message || '')
      } catch {
        /* ignore network errors */
      }
    }
    check()
    const id = setInterval(check, 10000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    if (enabled === null || isLoading) return

    const isAdmin = user?.role === 'admin'
    const isAllowed = ALLOWED_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + '/'),
    )

    if (enabled && !isAdmin && !isAllowed) {
      const target = '/maintenance' + (message ? '?msg=' + encodeURIComponent(message) : '')
      if (pathname !== '/maintenance') router.replace(target)
    }

    lastEnabled.current = enabled
  }, [enabled, pathname, user, isLoading, message, router])

  return <>{children}</>
}
