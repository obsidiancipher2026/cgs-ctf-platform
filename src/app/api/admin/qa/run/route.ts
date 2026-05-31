import { authenticate, jsonResponse, requireAdmin, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error
  const clientIp = getClientIp(request)
  const adminCheck = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminCheck) return adminCheck

  if (process.env.INTERNAL_QA_MODE !== 'true') {
    return jsonResponse({ detail: 'QA mode not enabled. Set INTERNAL_QA_MODE=true' }, 403)
  }

  const checklist = [
    { id: 'xss', name: 'XSS Prevention', status: 'check', description: 'All user inputs sanitized via WAF + sanitizer. CSP headers set.' },
    { id: 'sqli', name: 'SQL Injection Prevention', status: 'check', description: 'WAF detects 14 SQLi patterns. All DB queries use Prisma ORM (parameterized).' },
    { id: 'csrf', name: 'CSRF Protection', status: 'check', description: 'HMAC-based CSRF tokens on all POST/PUT/DELETE admin endpoints.' },
    { id: 'auth', name: 'Authentication Hardening', status: 'check', description: 'bcrypt password hashing. JWT with version-based invalidation. Fingerprint binding.' },
    { id: 'rate_limits', name: 'Rate Limiting', status: 'check', description: 'Auth: 5/15s, Admin: 30/60s, Submissions: 5/min. Tarpit with exponential backoff.' },
    { id: 'jwt', name: 'JWT Security', status: 'check', description: 'HS256 algorithm. Versioned tokens invalidate on restart. Short expiry (15min access).' },
    { id: 'upload', name: 'File Upload Security', status: 'check', description: 'WAF scans uploads. Body size limits (100KB/50MB). Type validation.' },
    { id: 'idor', name: 'IDOR Prevention', status: 'check', description: 'User-scoped queries. Admin-only routes require requireAdmin() check.' },
    { id: 'race', name: 'Race Condition Prevention', status: 'check', description: 'Sequential DB operations. Rate limits prevent rapid concurrent submissions.' },
    { id: 'waf', name: 'WAF Bypass Testing', status: 'check', description: '14 SQLi, 14 XSS, 8 CMDI patterns. Encoded payload detection. IP quarantine.' },
    { id: 'deserialize', name: 'Deserialization Safety', status: 'check', description: 'No insecure deserialization. JSON.parse only on validated input.' },
    { id: 'ssrf', name: 'SSRF Prevention', status: 'check', description: 'Outbound requests limited to webhook URL only. Timeout set to 5s.' },
  ]

  return jsonResponse({ checklist, generated_at: new Date().toISOString(), mode: 'internal_qa' })
}
