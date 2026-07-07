import prisma from '@/lib/prisma'
import { jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    const challenge = await prisma.challenge.findUnique({
      where: { slug, published: true },
      select: { downloads: true, files: true },
    })

    if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

    let downloadFiles: unknown[] = []

    if (challenge.downloads) {
      try {
        downloadFiles = JSON.parse(challenge.downloads)
      } catch {
        return jsonResponse({ detail: 'Invalid downloads metadata' }, 500)
      }
    } else if (challenge.files) {
      try {
        downloadFiles = JSON.parse(challenge.files)
      } catch {
        return jsonResponse({ detail: 'Invalid files metadata' }, 500)
      }
    }

    return jsonResponse({ files: downloadFiles })
  } catch {
    return jsonResponse({ detail: 'Failed to load downloads' }, 500)
  }
}
