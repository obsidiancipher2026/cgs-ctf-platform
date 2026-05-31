import prisma from './prisma'

export async function recalculateRankings(): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      where: { isBanned: false, status: 'active' },
      orderBy: [
        { score: 'desc' },
        { updatedAt: 'asc' },
      ],
    })

    const updates = users.map((user, index) =>
      prisma.user.update({
        where: { id: user.id },
        data: { ranking: index + 1 },
      }),
    )

    await prisma.$transaction(updates)
  } catch (error) {
    console.error('Failed to recalculate rankings', error)
  }
}

export async function getScore(userId: number): Promise<number> {
  const correctSubmissions = await prisma.submission.findMany({
    where: { userId, isCorrect: true },
    include: { challenge: true },
  })

  let total = 0
  for (const sub of correctSubmissions) {
    total += sub.challenge.points
  }

  const bloodChallenges = await prisma.challenge.findMany({
    where: { firstBloodUserId: userId, bloodPoints: { gt: 0 } },
    select: { bloodPoints: true },
  })
  for (const bc of bloodChallenges) {
    total += bc.bloodPoints
  }

  return total
}

export async function getSolverCount(challengeId: number): Promise<number> {
  return prisma.submission.count({
    where: { challengeId, isCorrect: true },
  })
}
