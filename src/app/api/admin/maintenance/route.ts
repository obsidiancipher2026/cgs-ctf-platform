import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'
import {
  getMaintenanceStatus,
  setMaintenanceEnabled,
  setMaintenanceMessage,
} from '@/lib/maintenance'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { user, error } = await authenticate(request)
    if (error) return error
    const clientIp = getClientIp(request)
    const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
    if (adminErr) return adminErr

    return jsonResponse(await getMaintenanceStatus())
  } catch (err) {
    console.error('[Maintenance GET]', err)
    return jsonResponse({ detail: 'Failed to load maintenance settings' }, 500)
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await authenticate(request)
    if (error) return error
    const clientIp = getClientIp(request)
    const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
    if (adminErr) return adminErr

    const csrfToken = request.headers.get('x-csrf-token')
    const csrfResult = csrfProtection('/api/admin/maintenance', 'POST', csrfToken, user.id)
    if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

    const body = await request.json().catch(() => ({}))
    const { enabled, message } = body as { enabled?: boolean; message?: string }

    if (typeof enabled === 'boolean') {
      await setMaintenanceEnabled(enabled)
    }

    if (typeof message === 'string') {
      await setMaintenanceMessage(message)
    }

    return jsonResponse(await getMaintenanceStatus())
  } catch (err) {
    console.error('[Maintenance POST]', err)
    return jsonResponse({ detail: 'Failed to update maintenance settings' }, 500)
  }
}
