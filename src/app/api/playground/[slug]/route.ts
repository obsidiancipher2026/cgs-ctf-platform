import { NextRequest, NextResponse } from 'next/server'
import { getChallengeHandler } from '@/lib/web-challenges/handlers'
import { PlaygroundRequest, extractCookies } from '@/lib/web-challenges/types'

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  return handleRequest(request, params.slug, 'GET')
}

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  return handleRequest(request, params.slug, 'POST')
}

async function handleRequest(request: NextRequest, slug: string, method: string) {
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
    path: url.pathname,
    headers,
    query,
    body,
    cookies: extractCookies(headers['cookie']),
  }

  try {
    const result = await handler.handler(playgroundReq)

    const responseHeaders: Record<string, string> = {
      ...result.headers,
    }

    if (result.flag) {
      responseHeaders['x-challenge-flag'] = result.flag
    }

    const response = new NextResponse(result.body, {
      status: result.status,
      headers: responseHeaders,
    })

    return response
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
