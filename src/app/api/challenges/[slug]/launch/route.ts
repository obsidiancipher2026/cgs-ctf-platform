import prisma from '@/lib/prisma'
import { authenticate, jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { user, error } = await authenticate(request)
    if (error) return error

    const { slug } = params

    const challenge = await prisma.challenge.findUnique({
      where: { slug, published: true },
      select: { id: true, slug: true, instanceUrl: true, instanceType: true, dockerImage: true },
    })

    if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

    if (!challenge.dockerImage && !challenge.instanceUrl) {
      return jsonResponse({ detail: 'This challenge does not have a launchable instance' }, 400)
    }

    return jsonResponse({
      message: 'Instance launched',
      instanceUrl: challenge.instanceUrl || null,
      status: 'running',
      ttl: 3600,
    })
  } catch {
    return jsonResponse({ detail: 'Failed to launch instance' }, 500)
  }
}
