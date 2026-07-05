import prisma from './prisma'

export async function recalculateRankings(): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      where: { isBanned: false, status: 'active' },
      orderBy: [{ score: 'desc' }, { updatedAt: 'asc' }],
      select: { id: true },
    })
    for (let i = 0; i < users.length; i++) {
      await prisma.user.update({
        where: { id: users[i].id },
        data: { ranking: i + 1 },
      })
    }
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

export async function recalculateAllScores(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { isBanned: false, status: 'active' },
    select: { id: true },
  })

  for (const user of users) {
    const score = await getScore(user.id)
    await prisma.user.update({
      where: { id: user.id },
      data: { score },
    })
  }

  await recalculateRankings()
}
