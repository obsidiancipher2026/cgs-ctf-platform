import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const ALL_FEATURES = [
  'ip_blacklist', 'ip_quarantine', 'ip_whitelist', 'input_sanitization',
  'waf_pattern_scan', 'anomaly_detection', 'bot_detection', 'rate_limiting',
  'body_size_limit', 'csrf_protection', 'cors_validation', 'attack_logging',
  'security_headers', 'tarpit_protection',
]

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error
  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const rows = await prisma.securityConfig.findMany({
    where: { key: { in: ALL_FEATURES } },
  })
  const features: Record<string, boolean> = {}
  for (const key of ALL_FEATURES) {
    const row = rows.find(r => r.key === key)
    features[key] = row ? row.value === 'true' : true
  }

  return jsonResponse({ ...features })
}
