export interface WAFResult {
  riskScore: number
  blocked: boolean
  quarantine: boolean
  attackTypes: string[]
  reason?: string
}

const SQL_INJECTION_PATTERNS = [
  /(\bSELECT\b.{0,40}\bFROM\b)/i,
  /(\bUNION\b.{0,40}\bSELECT\b)/i,
  /(\bINSERT\b.{0,40}\bINTO\b)/i,
  /(\bDELETE\b.{0,40}\bFROM\b)/i,
  /(\bDROP\b.{0,40}\bTABLE\b)/i,
  /(\bALTER\b.{0,40}\bTABLE\b)/i,
  /(\bCREATE\b.{0,40}\bTABLE\b)/i,
  /(\bEXEC\b.{0,40}\bXP_)/i,
  /('{2,}|--|;.*--)/,
  /(\bOR\b.{1,5}\d{1,2}\s*=\s*\d{1,2})/i,
  /(\bAND\b.{1,5}\d{1,2}\s*=\s*\d{1,2})/i,
  /(%27|')%20\w+%20(=|like)/i,
  /admin'\s*--/i,
  /1' OR '1' = '1/i,
  /1 OR 1=1 --/i,
]

const XSS_PATTERNS = [
  /<script[^>]*>[\s\S]*?<\/script>/i,
  /javascript\s*:/i,
  /on\w+\s*=\s*['"][^'"]*['"]/i,
  /<iframe[^>]*>/i,
  /<embed[^>]*>/i,
  /<object[^>]*>/i,
  /<img[^>]*onerror\s*=/i,
  /<[^>]*on\w+\s*=\s*[^>]*>/i,
  /document\.(cookie|location|write)/i,
  /eval\s*\(/i,
  /String\.fromCharCode/i,
  /<svg[^>]*onload\s*=/i,
  /expression\s*\(/i,
  /vbscript\s*:/i,
]

const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//,
  /\.\.\\/,
  /%2e%2e%2f/i,
  /%2e%2e\\/i,
  /\.\.%2f/i,
  /%2e%2e\//i,
]

const COMMAND_INJECTION_PATTERNS = [
  /;\s*(rm|ls|cat|wget|curl|nc|bash|sh|powershell|cmd|del|dir|whoami|id|uname)/i,
  /`[^`]+`/,
  /\$\([^)]+\)/,
  /\|\s*(sh|bash|cmd|powershell)/i,
  /&&\s*(rm|ls|cat|wget)/i,
  /\|\|/,
  />\s*\/dev\//,
  /2>&1/,
]

const KNOWN_ATTACK_TOOLS_PATTERNS = [
  /sqlmap/i, /nmap/i, /nikto/i, /dirbuster/i, /gobuster/i,
  /burpsuite/i, /acunetix/i, /nessus/i, /openvas/i,
  /metasploit/i, /hydra/i, /john/i, /hashcat/i, /aircrack/i,
]

const SUSPICIOUS_PATHS = [
  /\.env$/i, /\.git\//i, /wp-admin/i, /phpmyadmin/i,
  /\.htaccess/i, /config\./i, /backup/i, /\.sql$/i, /\.dump$/i,
  /xmlrpc/i, /\.svn/i, /\.DS_Store/i,
]

const ENCODED_PAYLOAD_PATTERNS = [
  /[A-Za-z0-9+/]{40,}={0,2}/,
  /%[0-9A-Fa-f]{2}%[0-9A-Fa-f]{2}%[0-9A-Fa-f]{2}/,
  /\\x[0-9A-Fa-f]{2}\\x[0-9A-Fa-f]{2}/,
  /&#[0-9]{2,4};/,
]

export class WAFEngine {
  scanValue(value: string): Array<[string, string]> {
    const findings: Array<[string, string]> = []

    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(value)) {
        findings.push(['sql', `sql_${pattern.source.slice(0, 20)}`])
        break
      }
    }

    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(value)) {
        findings.push(['xss', `xss_${pattern.source.slice(0, 20)}`])
        break
      }
    }

    for (const pattern of PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(value)) {
        findings.push(['ptrav', `ptrav_${pattern.source.slice(0, 20)}`])
        break
      }
    }

    for (const pattern of COMMAND_INJECTION_PATTERNS) {
      if (pattern.test(value)) {
        findings.push(['cmdi', `cmdi_${pattern.source.slice(0, 20)}`])
        break
      }
    }

    for (const pattern of KNOWN_ATTACK_TOOLS_PATTERNS) {
      if (pattern.test(value)) {
        findings.push(['tool', `tool_${pattern.source.slice(0, 20)}`])
        break
      }
    }

    for (const pattern of ENCODED_PAYLOAD_PATTERNS) {
      if (pattern.test(value)) {
        findings.push(['encoded', `encoded_${pattern.source.slice(0, 20)}`])
        break
      }
    }

    return findings
  }

  scanHeaders(headers: Record<string, string | string[] | undefined>): Array<[string, string]> {
    const findings: Array<[string, string]> = []
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-original-url', 'cf-connecting-ip']

    for (const header of suspiciousHeaders) {
      const val = headers[header] as string | undefined
      if (val) {
        const headerFindings = this.scanValue(val)
        if (headerFindings.length > 0) {
          findings.push(['header_injection', `header:${header}`])
        }
      }
    }

    return findings
  }

  detectScanning(path: string): string | null {
    const SCANNER_PROBE_PATHS = [
      /^\/\.env/i, /^\/\.git\//i, /^\/wp-admin/i, /^\/phpmyadmin/i,
      /^\/\.htaccess/i, /^\/config\./i, /^\/backup/i,
      /^\/\.sql/i, /^\/xmlrpc/i, /^\/\.svn/i, /^\/\.DS_Store/i,
    ]
    for (const pattern of SCANNER_PROBE_PATHS) {
      if (pattern.test(path)) {
        return 'scanner_probe'
      }
    }
    return null
  }

  detectAnomalousContentType(contentType: string): boolean {
    if (!contentType) return false
    const ct = contentType.toLowerCase()
    return (
      ct.includes('application/x-www-form-urlencoded') ||
      ct.includes('text/html') ||
      ct.includes('application/xml') ||
      ct.includes('soap') ||
      ct.includes('application/x-php') ||
      ct.includes('application/x-java')
    )
  }

  assessRequest(
    path: string,
    method: string,
    body: Record<string, unknown> | null | undefined,
    headers: Record<string, string | string[] | undefined>,
    query: Record<string, unknown> | null | undefined,
  ): WAFResult {
    const attackTypes: string[] = []
    let riskScore = 0.0
    let blocked = false
    let quarantine = false

    const allInputs: string[] = []

    if (query) {
      for (const [, v] of Object.entries(query)) {
        if (typeof v === 'string') allInputs.push(v)
      }
    }
    if (body) {
      for (const [, v] of Object.entries(body)) {
        if (typeof v === 'string') allInputs.push(v)
        else if (Array.isArray(v)) v.forEach(x => typeof x === 'string' && allInputs.push(x))
      }
    }

    const ua = (headers['user-agent'] as string) || ''
    allInputs.push(ua)

    for (const input of allInputs) {
      const findings = this.scanValue(input)
      for (const [cat] of findings) {
        if (cat === 'sql' && !attackTypes.includes('sql_injection')) {
          attackTypes.push('sql_injection')
          riskScore += 8.0
          blocked = true
        }
        if (cat === 'xss' && !attackTypes.includes('xss')) {
          attackTypes.push('xss')
          riskScore += 7.0
          blocked = true
        }
        if (cat === 'ptrav' && !attackTypes.includes('path_traversal')) {
          attackTypes.push('path_traversal')
          riskScore += 6.0
          blocked = true
        }
        if (cat === 'cmdi' && !attackTypes.includes('command_injection')) {
          attackTypes.push('command_injection')
          riskScore += 9.0
          blocked = true
          quarantine = true
        }
        if (cat === 'tool' && !attackTypes.includes('attack_tool')) {
          attackTypes.push('attack_tool')
          riskScore += 5.0
        }
        if (cat === 'encoded' && !attackTypes.includes('encoded_payload')) {
          attackTypes.push('encoded_payload')
          riskScore += 4.0
        }
      }
    }

    for (const pattern of SUSPICIOUS_PATHS) {
      if (pattern.test(path)) {
        riskScore += 4.0
        if (!attackTypes.includes('suspicious_path')) attackTypes.push('suspicious_path')
      }
    }

    const headerFindings = this.scanHeaders(headers)
    for (const [, name] of headerFindings) {
      riskScore += 3.0
      if (!attackTypes.includes('header_injection')) attackTypes.push('header_injection')
    }

    const uaLower = ua.toLowerCase()
    if (!uaLower || uaLower.length < 10) {
      riskScore += 2.0
      if (!attackTypes.includes('missing_user_agent')) attackTypes.push('missing_user_agent')
    }

    return { riskScore, blocked, quarantine, attackTypes }
  }
}

export class BotDetector {
  private readonly botPatterns = [
    /curl/i, /wget/i, /sqlmap/i,
    /ahrefs/i, /semrush/i, /python-requests/i, /go-http-client/i,
    /java\//i, /libwww/i, /perl/i, /ruby/i,
    /headless/i, /phantom/i, /puppeteer/i, /playwright/i,
    /selenium/i, /chrome-lighthouse/i,
    /slurp/i,
  ]

  private readonly botSignals = [
    'headless', 'selenium', 'webdriver', 'phantom', 'puppeteer',
    'playwright', 'cypress',
  ]

  analyze(
    ip: string,
    userAgent: string,
    path: string,
    acceptLang: string,
    headers: Record<string, string | string[] | undefined>,
  ): { isBot: boolean; score: number; reason: string } {
    let score = 0.0
    const reasons: string[] = []
    const ua = userAgent.toLowerCase()

    for (const pattern of this.botPatterns) {
      if (pattern.test(ua)) {
        score += 0.4
        reasons.push(`matches_bot_pattern:${pattern}`)
        break
      }
    }

    for (const signal of this.botSignals) {
      if (ua.includes(signal)) {
        score += 0.5
        reasons.push(`bot_signal:${signal}`)
      }
    }

    if (ua.length < 10) {
      score += 0.3
      reasons.push('short_ua')
    }

    if (!acceptLang || acceptLang.length < 2) {
      score += 0.15
      reasons.push('missing_accept_lang')
    }

    const secChUa = headers['sec-ch-ua'] as string | undefined
    if (!secChUa && score > 0) {
      score += 0.1
    }

    const dnt = headers['dnt'] as string | undefined
    if (dnt === '1') score -= 0.1

    score = Math.min(1.0, Math.max(0, score))

    return { isBot: score >= 0.5, score, reason: reasons.join('; ') }
  }
}

export const detector = new WAFEngine()
export const botDetector = new BotDetector()
