import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cyberguardians.io'

  if (!adminPassword) {
    console.error('[FATAL] ADMIN_PASSWORD environment variable is required for seeding.')
    console.error('Run: ADMIN_PASSWORD=your-password npx prisma db seed')
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  await prisma.user.upsert({
    where: { username: process.env.ADMIN_USERNAME || 'admin' },
    update: {},
    create: {
      username: process.env.ADMIN_USERNAME || 'admin',
      email: adminEmail,
      hashedPassword,
      role: 'admin',
      status: 'active',
    },
  })

  console.log('Admin user created successfully')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())