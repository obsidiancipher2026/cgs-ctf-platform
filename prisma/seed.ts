import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

const hashFlag = (flag: string) => crypto.createHash('sha256').update(flag).digest('hex')

const generateSlug = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const playgroundSlug = (title: string): string =>
  `/playground/${generateSlug(title)}`

interface ChallengeData {
  title: string; description: string; category: string; difficulty: string;
  points: number; flag: string; hint: string | null; files?: string | null; instanceUrl?: string | null;
}

// No challenges are seeded. The platform currently has no challenges.
const challenges: ChallengeData[] = []

const getTags = (category: string, difficulty: string): string => {
  const tags: string[] = [category, difficulty]
  return JSON.stringify(tags)
}

const getEstimatedTime = (difficulty: string): number => {
  switch (difficulty) {
    case 'easy': return 15
    case 'medium': return 30
    case 'hard': return 60
    default: return 15
  }
}

const getInstanceType = (category: string): string | null => {
  if (category === 'web') return 'web'
  return null
}

const getHints = (hint: string | null): string | null => {
  if (!hint) return null
  return JSON.stringify([{ text: hint, penalty: 0 }])
}

async function seedAdmin() {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    console.warn('[WARN] ADMIN_PASSWORD not set — skipping admin user creation')
    return
  }

  const bcrypt = await import('bcryptjs')
  const hashedPassword = await bcrypt.default.hash(adminPassword, 12)

  await prisma.user.upsert({
    where: { username: process.env.ADMIN_USERNAME || 'admin' },
    update: {},
    create: {
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@cyberguardians.io',
      hashedPassword,
      role: 'admin',
      status: 'active',
    },
  })
  console.log('[OK] Admin user created')
}

async function seedChallenges() {
  console.log('Seeding challenges...')

  const seedSlugs = challenges.map(c => generateSlug(c.title))

  // Remove any challenges that are no longer present in the seed list.
  const removed = await prisma.challenge.deleteMany({
    where: { slug: { notIn: seedSlugs } },
  })
  if (removed.count > 0) {
    console.log(`[OK] Removed ${removed.count} stale challenge(s)`)
  }

  let created = 0
  let updated = 0
  for (const c of challenges) {
    const slug = generateSlug(c.title)

    await prisma.challenge.upsert({
      where: { slug },
      update: {
        title: c.title,
        description: c.description,
        category: c.category,
        difficulty: c.difficulty,
        points: c.points,
        flag: hashFlag(c.flag),
        hint: c.hint ? c.hint : null,
        files: c.files ? c.files : null,
        instanceUrl: c.instanceUrl ? c.instanceUrl : (c.category === 'web' ? playgroundSlug(c.title) : null),
        markdown: c.description,
        story: null,
        downloads: c.files ? c.files : null,
        author: 'CGS Team',
        tags: getTags(c.category, c.difficulty),
        estimatedTime: getEstimatedTime(c.difficulty),
        solveCount: 0,
        solveRate: 0.0,
        instanceType: getInstanceType(c.category),
        hintPenalty: 0,
        hints: getHints(c.hint),
      },
      create: {
        slug,
        title: c.title,
        description: c.description,
        category: c.category,
        difficulty: c.difficulty,
        points: c.points,
        flag: hashFlag(c.flag),
        hint: c.hint ? c.hint : null,
        files: c.files ? c.files : null,
        instanceUrl: c.instanceUrl ? c.instanceUrl : (c.category === 'web' ? playgroundSlug(c.title) : null),
        published: false,
        markdown: c.description,
        story: null,
        downloads: c.files ? c.files : null,
        author: 'CGS Team',
        tags: getTags(c.category, c.difficulty),
        estimatedTime: getEstimatedTime(c.difficulty),
        solveCount: 0,
        solveRate: 0.0,
        instanceType: getInstanceType(c.category),
        hintPenalty: 0,
        hints: getHints(c.hint),
      },
    })

    created++
  }

  const total = await prisma.challenge.count()
  console.log(`[OK] ${created} challenges seeded (${total} total in database)`)
}

async function main() {
  console.log('=== CGS CTF Database Seed ===\n')
  await seedAdmin()
  console.log('')
  await seedChallenges()
  console.log('\n=== Seed complete ===')
}

main()
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
