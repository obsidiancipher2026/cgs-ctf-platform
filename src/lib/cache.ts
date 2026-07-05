const MAX_CACHE_SIZE = 200
const cache = new Map<string, { data: unknown; expires: number }>()
const accessOrder: string[] = []

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) {
    cache.delete(key)
    const idx = accessOrder.indexOf(key)
    if (idx >= 0) accessOrder.splice(idx, 1)
    return null
  }
  return entry.data as T
}

export function setCache(key: string, data: unknown, ttlMs: number): void {
  if (cache.size >= MAX_CACHE_SIZE && !cache.has(key)) {
    const oldest = accessOrder.shift()
    if (oldest) cache.delete(oldest)
  }
  if (!cache.has(key)) accessOrder.push(key)
  cache.set(key, { data, expires: Date.now() + ttlMs })
}

export function invalidateCache(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
      const idx = accessOrder.indexOf(key)
      if (idx >= 0) accessOrder.splice(idx, 1)
    }
  }
}
