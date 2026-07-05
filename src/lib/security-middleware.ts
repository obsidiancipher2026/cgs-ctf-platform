import crypto from 'crypto'
import { config } from './config'
import { detector, botDetector } from './waf'
import { sanitizeDict } from './sanitizer'
import prisma from './prisma'
import { isFeatureEnabled } from './security-features'

function lookupGeoIP(ip: string): string {
  // Best-effort geo lookup using private IP ranges.
  // For accurate geo IP, integrate a service like ip-api.com or maxmind.
  if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') return 'local'
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) return 'private'
  const firstOctet = parseInt(ip.split('.')[0], 10)
  if (isNaN(firstOctet)) return 'unknown'
  return 'external'
}

async function logAttackToDB(data: {
  attackType: string
  severity: string
  ipAddress: string
  riskScore: number
  endpoint?: string
  method?: string
  userAgent?: string
  payloadSnapshot?: string
  headersSnapshot?: string
  actionTaken: string
  blocked: number
  country?: string
  quarantineUntil?: number
}): Promise<void> {
  try {
    const lastEntry = await prisma.attackLog.findFirst({ orderBy: { id: 'desc' } })
    const prevHash = lastEntry?.chainHash || null

    const rawHash = JSON.stringify({
      ...data,
      prevHash,
      ts: Date.now(),
    })

    const chainHash = crypto.createHash('sha256').update(rawHash).digest('hex')

    await prisma.attackLog.create({
      data: {
        attackType: data.attackType,
        severity: data.severity,
        ipAddress: data.ipAddress,
        riskScore: data.riskScore,
        endpoint: data.endpoint,
        method: data.method,
        userAgent: data.userAgent,
        payloadSnapshot: data.payloadSnapshot,
        headersSnapshot: data.headersSnapshot,
        actionTaken: data.actionTaken,
        blocked: data.blocked,
        country: data.country,
        quarantineUntil: data.quarantineUntil,
        chainHash,
        prevChainHash: prevHash,
      },
    })
  } catch (error) {
    console.error('Failed to log attack to DB', error)
  }
}

export interface SecurityCheckResult {
  blocked: boolean
  statusCode: number
  detail: string
  reason?: string
  riskScore?: number
  traceId?: string
}

export async function runSecurityCheck(
  path: string,
  method: string,
  clientIp: string,
  headers: Headers,
  body: unknown,
  query: Record<string, string | string[]>,
): Promise<SecurityCheckResult | null> {
  const now = Date.now() / 1000
  const userAgent = headers.get('user-agent') || ''
  const acceptLang = headers.get('accept-language') || ''
  const contentType = headers.get('content-type') || ''

  if (path.startsWith('/ws') || method === 'OPTIONS' || path === '/health') {
    return null
  }

  const headersDict: Record<string, string | string[] | undefined> = {}
  headers.forEach((value, key) => {
    headersDict[key] = value
  })

  const queryDict: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(query)) {
    queryDict[k] = Array.isArray(v) ? v[0] : v
  }

  let bodyDict: Record<string, unknown> | null = null
  let bodyBytes: Buffer | null = null

  if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
    if (typeof body === 'object' && body !== null) {
      bodyDict = sanitizeDict(body as Record<string, unknown>)
    }
    bodyBytes = Buffer.from(JSON.stringify(body))
  }

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const bodySizeLimitEnabled = await isFeatureEnabled('body_size_limit')
    if (bodySizeLimitEnabled) {
      const maxSize = path.includes('/upload') ? config.limits.maxUploadSize : config.limits.maxRequestBodySize
      if (bodyBytes && bodyBytes.length > maxSize) {
        return { blocked: true, statusCode: 413, detail: 'Request body too large' }
      }
    }
  }

  const wafEnabled = config.security.wafEnabled && await isFeatureEnabled('waf_pattern_scan')
  if (wafEnabled) {
    const wafResult = detector.assessRequest(path, method, bodyDict, headersDict, queryDict)

    if (wafResult.blocked) {
      const attackTypesStr = wafResult.attackTypes.join(',') || 'unknown'
      const traceId = crypto.randomBytes(6).toString('hex')
      const statusCode = wafResult.riskScore < 9.0 ? 403 : 418

      const payloadSnapshot = bodyBytes ? bodyBytes.slice(0, 500).toString('utf-8') : undefined

      await logAttackToDB({
        attackType: attackTypesStr.split(',')[0],
        severity: wafResult.riskScore >= 9.0 ? 'critical' : wafResult.riskScore >= 7.0 ? 'high' : 'medium',
        ipAddress: clientIp,
        riskScore: wafResult.riskScore,
        endpoint: path,
        method,
        userAgent: userAgent.slice(0, 500),
        payloadSnapshot,
        headersSnapshot: JSON.stringify(headersDict).slice(0, 1000),
        actionTaken: wafResult.quarantine ? 'quarantine' : 'blocked',
        blocked: 1,
        country: lookupGeoIP(clientIp),
        quarantineUntil: wafResult.quarantine ? now + config.security.quarantineMinutes * 60 : undefined,
      })

      return {
        blocked: true,
        statusCode,
        detail: 'Request blocked by WAF',
        reason: wafResult.reason || 'waf_blocked',
        riskScore: wafResult.riskScore,
        traceId,
      }
    }
  }

  return null
}

export async function wafGuard(
  request: Request,
  path: string,
  clientIp: string,
  body?: unknown,
): Promise<SecurityCheckResult | null> {
  const query: Record<string, string | string[]> = {}
  const url = new URL(request.url)
  url.searchParams.forEach((v, k) => { query[k] = v })
  return runSecurityCheck(path, request.method, clientIp, request.headers, body ?? null, query)
}
