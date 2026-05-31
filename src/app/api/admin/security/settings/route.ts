import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  return jsonResponse({
    blacklisted_ips: [],
    whitelisted_ips: [],
    quarantined_ips: {},
    active_quarantines: 0,
    rate_limits: {
      auth: { max: config.rateLimit.auth, window: config.rateLimit.window },
      admin: { max: config.rateLimit.admin, window: 60 },
    },
  })
}
