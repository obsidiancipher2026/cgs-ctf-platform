import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BASE_SCORES: Record<string, number> = { easy: 100, medium: 200, hard: 300, insane: 500 }
const BLOOD_BONUS: Record<string, number> = { easy: 25, medium: 50, hard: 75, insane: 100 }

async function migrateScores() {
  console.log('=== Score Migration ===\n')

  const challenges = await prisma.challenge.findMany()
  console.log(`Found ${challenges.length} challenges\n`)

  for (const c of challenges) {
    const baseScore = BASE_SCORES[c.difficulty ?? ''] ?? 100
    if (c.points !== baseScore) {
      await prisma.challenge.update({
        where: { id: c.id },
        data: { points: baseScore },
      })
      console.log(`[SCORE] ${c.title}: ${c.points} -> ${baseScore} (${c.difficulty ?? 'unknown'})`)
    } else {
      console.log(`[SCORE] ${c.title}: ${c.points} (already correct)`)
    }
  }

  console.log('\nScore migration complete.\n')

  console.log('=== Historical First Blood Migration ===\n')

  const solvedChallenges = await prisma.challenge.findMany({
    where: { solveCount: { gt: 0 }, bloodAwarded: false },
  })

  for (const c of solvedChallenges) {
    const firstSolve = await prisma.submission.findFirst({
      where: { challengeId: c.id, solved: true },
      orderBy: { createdAt: 'asc' },
    })

    if (!firstSolve) continue

    const bloodBonus = BLOOD_BONUS[c.difficulty ?? ''] ?? 0

    await prisma.$transaction(async (tx) => {
      await tx.challenge.update({
        where: { id: c.id },
        data: {
          firstSolverUserId: firstSolve.userId,
          firstBloodTimestamp: firstSolve.createdAt,
          bloodAwarded: true,
        },
      })

      if (bloodBonus > 0) {
        await tx.user.update({
          where: { id: firstSolve.userId },
          data: {
            bloodPoints: { increment: bloodBonus },
            score: { increment: bloodBonus },
          },
        })
      }
    })

    const solver = await prisma.user.findUnique({ where: { id: firstSolve.userId }, select: { username: true } })
    console.log(`[BLOOD] ${c.title}: First blood -> ${solver?.username ?? firstSolve.userId} (+${bloodBonus} pts)`)
  }

  const notAwarded = await prisma.challenge.count({ where: { solveCount: { gt: 0 }, bloodAwarded: false } })
  if (notAwarded > 0) {
    console.log(`\n[WARN] ${notAwarded} solved challenges still not awarded blood points`)
  }

  console.log('\nHistorical first blood migration complete.')
}

migrateScores()
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
