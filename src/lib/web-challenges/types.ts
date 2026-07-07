export interface PlaygroundRequest {
  method: string
  path: string
  headers: Record<string, string>
  query: Record<string, string>
  body: string | null
  cookies: Record<string, string>
}

export interface PlaygroundResponse {
  status: number
  headers: Record<string, string>
  body: string
  flag?: string
}

export type ChallengeHandler = (req: PlaygroundRequest) => PlaygroundResponse | Promise<PlaygroundResponse>

export interface ChallengeDef {
  slug: string
  title: string
  description?: string
  handler: ChallengeHandler
}

export function html(body: string, flag?: string): PlaygroundResponse {
  return { status: 200, headers: { 'Content-Type': 'text/html' }, body, flag }
}

export function json(data: any, flag?: string): PlaygroundResponse {
  return { status: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), flag }
}

export function text(body: string, flag?: string): PlaygroundResponse {
  return { status: 200, headers: { 'Content-Type': 'text/plain' }, body, flag }
}

export function redirect(to: string, flag?: string): PlaygroundResponse {
  return { status: 302, headers: { 'Location': to }, body: '', flag }
}

export function error(status: number, msg: string): PlaygroundResponse {
  return { status, headers: { 'Content-Type': 'text/plain' }, body: msg }
}

export function extractCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  if (!cookieHeader) return cookies
  for (const pair of cookieHeader.split(';')) {
    const [k, ...v] = pair.trim().split('=')
    if (k) cookies[k] = v.join('=')
  }
  return cookies
}
