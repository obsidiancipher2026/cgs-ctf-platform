'use client'

import { useEffect, useRef, useCallback } from 'react'

interface SSEOptions {
  onStatus?: (data: { instanceId: string; status: string; progress?: string }) => void
  onLog?: (data: { instanceId: string; level: string; message: string; timestamp: string }) => void
  onEvent?: (data: { instanceId: string; event: string; details?: any; timestamp: string }) => void
  onError?: (err: Event) => void
}

export function useInstanceSSE(instanceId: string | null, options: SSEOptions) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const connect = useCallback(() => {
    if (!instanceId) return
    if (eventSourceRef.current) eventSourceRef.current.close()

    const es = new EventSource(`/api/instances/instances/${instanceId}/events`)
    eventSourceRef.current = es

    es.addEventListener('status', (e) => {
      try { optionsRef.current.onStatus?.(JSON.parse(e.data)) } catch {}
    })

    es.addEventListener('log', (e) => {
      try { optionsRef.current.onLog?.(JSON.parse(e.data)) } catch {}
    })

    es.addEventListener('instance_event', (e) => {
      try { optionsRef.current.onEvent?.(JSON.parse(e.data)) } catch {}
    })

    es.onerror = (err) => {
      optionsRef.current.onError?.(err)
    }
  }, [instanceId])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (instanceId) connect()
    return () => disconnect()
  }, [instanceId, connect, disconnect])

  return { connect, disconnect }
}
