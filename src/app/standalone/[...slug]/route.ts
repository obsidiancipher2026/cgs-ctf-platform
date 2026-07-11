import { NextRequest, NextResponse } from 'next/server'
import { getChallengeHandler } from '@/lib/web-challenges/handlers'
import { PlaygroundRequest, extractCookies } from '@/lib/web-challenges/types'

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const { slug, subPath } = resolve(params.slug)
  return handleRequest(request, slug, subPath, 'GET')
}

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const { slug, subPath } = resolve(params.slug)
  return handleRequest(request, slug, subPath, 'POST')
}

function resolve(slugParts: string[]) {
  const parts = Array.isArray(slugParts) ? slugParts : [slugParts]
  const slug = parts[0] || ''
  const rest = parts.slice(1)
  const subPath = rest.length ? '/' + rest.join('/') : '/'
  return { slug, subPath }
}

async function handleRequest(request: NextRequest, slug: string, path: string, method: string) {
  const handler = getChallengeHandler(slug)
  if (!handler) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  const url = new URL(request.url)
  const query: Record<string, string> = {}
  url.searchParams.forEach((v, k) => { query[k] = v })

  const headers: Record<string, string> = {}
  request.headers.forEach((v, k) => { headers[k] = v })

  const body = method === 'POST' ? await request.text().catch(() => null) : null

  const playgroundReq: PlaygroundRequest = {
    method,
    path,
    headers,
    query,
    body,
    cookies: extractCookies(headers['cookie']),
  }

  try {
    const result = await handler.handler(playgroundReq)
    const responseHeaders: Record<string, string> = { ...result.headers }
    if (result.flag) {
      responseHeaders['x-challenge-flag'] = result.flag
    }
    return new NextResponse(result.body, {
      status: result.status,
      headers: responseHeaders,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
