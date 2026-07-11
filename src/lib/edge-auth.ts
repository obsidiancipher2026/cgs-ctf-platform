function base64UrlDecode(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function isAdminAccessToken(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const [header, payload, signature] = parts

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlDecode(signature).buffer as ArrayBuffer,
      new TextEncoder().encode(`${header}.${payload}`),
    )
    if (!valid) return false

    const claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as {
      type?: string
      role?: string
      exp?: number
    }
    if (claims.type !== 'access') return false
    if (claims.exp && claims.exp < Math.floor(Date.now() / 1000)) return false
    return claims.role === 'admin'
  } catch {
    return false
  }
}
