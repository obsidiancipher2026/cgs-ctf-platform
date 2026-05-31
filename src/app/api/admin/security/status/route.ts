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
    waf_enabled: config.security.wafEnabled,
    bot_detection_enabled: config.security.botDetectionEnabled,
    account_lockout_enabled: config.security.accountLockoutEnabled,
    quarantine_minutes: config.security.quarantineMinutes,
    max_login_attempts: config.ctf.maxLoginAttempts,
    lockout_duration: config.ctf.lockoutDurationSeconds,
  })
}
