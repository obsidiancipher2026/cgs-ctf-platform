import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import prisma from '@/lib/prisma'

const ALL_FEATURES = [
  'ip_blacklist', 'ip_quarantine', 'ip_whitelist', 'input_sanitization',
  'waf_pattern_scan', 'anomaly_detection', 'bot_detection', 'rate_limiting',
  'body_size_limit', 'csrf_protection', 'cors_validation', 'attack_logging',
  'security_headers', 'tarpit_protection',
]

async function getAllFeatures(): Promise<Record<string, boolean>> {
  const rows = await prisma.securityConfig.findMany({
    where: { key: { in: ALL_FEATURES } },
  })
  const map: Record<string, boolean> = {}
  for (const key of ALL_FEATURES) {
    const row = rows.find(r => r.key === key)
    map[key] = row ? row.value === 'true' : true
  }
  return map
}

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error
  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const url = new URL(request.url)
  const feature = url.searchParams.get('feature')
  if (!feature || !ALL_FEATURES.includes(feature)) {
    return jsonResponse({ detail: 'Invalid feature name' }, 400)
  }

  const existing = await prisma.securityConfig.findUnique({ where: { key: feature } })
  const currentEnabled = existing ? existing.value === 'true' : true
  const newEnabled = !currentEnabled

  await prisma.securityConfig.upsert({
    where: { key: feature },
    update: { value: String(newEnabled) },
    create: { key: feature, value: String(newEnabled) },
  })

  const allFeatures = await getAllFeatures()

  return jsonResponse({ feature, enabled: newEnabled, all_features: allFeatures })
}
