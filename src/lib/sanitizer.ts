export function sanitizeText(value: string, maxLength: number = 500): string {
  if (typeof value !== 'string') return String(value || '')
  let result = value.trim().slice(0, maxLength)
  // Strip HTML tags and dangerous patterns
  result = result.replace(/<[^>]*>/g, '')
  result = result.replace(/[<>"'\\]/g, '')
  result = result.replace(/javascript\s*:/gi, '')
  result = result.replace(/on\w+\s*=/gi, '')
  result = result.replace(/vbscript\s*:/gi, '')
  result = result.replace(/expression\s*\(/gi, '')
  return result
}

export function sanitizeHTML(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export function sanitizeDict(d: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(d)) {
    if (typeof v === 'string') result[k] = sanitizeHTML(v)
    else if (typeof v === 'object' && v !== null && !Array.isArray(v)) result[k] = sanitizeDict(v as Record<string, unknown>)
    else if (Array.isArray(v)) result[k] = v.map(x => (typeof x === 'string' ? sanitizeHTML(x) : x))
    else result[k] = v
  }
  return result
}

import { config } from './config'

const VALID_FLAG_PATTERN = /^[A-Za-z0-9_{}\-]+$/

function getFlagPrefix(): string {
  const fmt = config.ctf.flagFormat || 'CGS{}'
  const brace = fmt.indexOf('{}')
  return brace >= 0 ? fmt.slice(0, brace + 1) : 'CGS{'
}

export function validateFlagFormat(flag: string): boolean {
  const prefix = getFlagPrefix()
  return flag.startsWith(prefix) && flag.endsWith('}') && flag.length > prefix.length + 1
}

export interface FlagValidationResult {
  valid: boolean
  reason?: string
}

export function validateFlagStrict(flag: string): FlagValidationResult {
  if (!flag || !flag.trim()) {
    return { valid: false, reason: 'Flag cannot be empty' }
  }

  flag = flag.trim()
  const prefix = getFlagPrefix()

  if (!flag.startsWith(prefix)) {
    return { valid: false, reason: `Flag must start with '${prefix}'` }
  }
  if (!flag.endsWith('}')) {
    return { valid: false, reason: "Flag must end with '}'" }
  }

  const inner = flag.slice(prefix.length, -1)
  if (!inner) {
    return { valid: false, reason: 'Flag content cannot be empty' }
  }
  if (inner.length < 2) {
    return { valid: false, reason: 'Flag content too short (min 2 chars)' }
  }
  if (flag.length > 200) {
    return { valid: false, reason: 'Flag too long (max 200 chars)' }
  }

  for (const ch of inner) {
    const code = ch.charCodeAt(0)
    if (code < 32 || code > 126) {
      return { valid: false, reason: 'Flag contains non-printable characters' }
    }
  }

  if (!VALID_FLAG_PATTERN.test(flag)) {
    return {
      valid: false,
      reason: 'Flag contains invalid characters. Use only letters, numbers, underscores, hyphens, and curly braces',
    }
  }

  return { valid: true }
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character'
  }
  return null
}
