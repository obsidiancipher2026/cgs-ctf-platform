import prisma from '@/lib/prisma'
import { jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    const challenge = await prisma.challenge.findUnique({
      where: { slug, published: true },
      select: { instanceUrl: true, instanceType: true, instanceStatus: true },
    })

    if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

    return jsonResponse({
      status: challenge.instanceStatus || 'running',
      url: challenge.instanceUrl || null,
      ttl: 3600,
    })
  } catch {
    return jsonResponse({ detail: 'Failed to get instance status' }, 500)
  }
}
