export function sanitizeText(value: string, maxLength: number = 500): string {
  if (typeof value !== 'string') return String(value || '')
  let result = value.trim().slice(0, maxLength)
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
