import { NextRequest } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; path?: string[] } }
) {
  const { id, path: segments = [] } = params

  const basePath = path.resolve(process.cwd(), 'challenge-sites', id, ...segments)
  const challengeRoot = path.resolve(process.cwd(), 'challenge-sites')
  if (!basePath.startsWith(challengeRoot + path.sep) && basePath !== challengeRoot) {
    return new Response('Forbidden', { status: 403 })
  }

  const tryPaths = [basePath]
  if (!path.extname(basePath)) {
    tryPaths.push(basePath + '.html')
  }

  let resolvedPath = ''
  for (const p of tryPaths) {
    try {
      const stat = await fs.stat(p)
      if (stat.isDirectory()) {
        resolvedPath = path.join(p, 'index.html')
        break
      } else if (stat.isFile()) {
        resolvedPath = p
        break
      }
    } catch {
      continue
    }
  }

  if (!resolvedPath) {
    try { await fs.access(resolvedPath) } catch { return new Response('Not Found', { status: 404 }) }
  }

  let content: string
  try {
    content = await fs.readFile(resolvedPath, 'utf-8')
  } catch {
    return new Response('Not Found', { status: 404 })
  }
  const ext = path.extname(resolvedPath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  return new Response(content, {
    headers: { 'Content-Type': contentType },
  })
}
