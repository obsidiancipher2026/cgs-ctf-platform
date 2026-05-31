import prisma from './prisma'

const ALL_FEATURES = [
  'ip_blacklist', 'ip_quarantine', 'ip_whitelist', 'input_sanitization',
  'waf_pattern_scan', 'anomaly_detection', 'bot_detection', 'rate_limiting',
  'body_size_limit', 'csrf_protection', 'cors_validation', 'attack_logging',
  'security_headers', 'tarpit_protection',
]

let cachedFeatures: Record<string, boolean> | null = null
let lastFetch = 0
const CACHE_TTL = 5000

export async function getSecurityFeatures(): Promise<Record<string, boolean>> {
  const now = Date.now()
  if (cachedFeatures && now - lastFetch < CACHE_TTL) {
    return cachedFeatures
  }
  const rows = await prisma.securityConfig.findMany({
    where: { key: { in: ALL_FEATURES } },
  })
  const features: Record<string, boolean> = {}
  for (const key of ALL_FEATURES) {
    const row = rows.find(r => r.key === key)
    features[key] = row ? row.value === 'true' : true
  }
  cachedFeatures = features
  lastFetch = now
  return features
}

export async function isFeatureEnabled(key: string): Promise<boolean> {
  const features = await getSecurityFeatures()
  return features[key] !== false
}
