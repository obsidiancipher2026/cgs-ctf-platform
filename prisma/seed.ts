import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('%7O#sidianC!pher26AtT_G', 12)

  await prisma.user.upsert({
    where: { username: 'Master' },
    update: {},
    create: {
      username: 'Master',
      email: 'master@cgs.local',
      hashedPassword,
      passwordPlain: '%7O#sidianC!pher26AtT_G',
      role: 'admin',
      status: 'active',
      firstName: 'Master',
    },
  })

  console.log('Admin user created successfully')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())