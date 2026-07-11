const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()
;(async () => {
  try {
    const users = await p.user.findMany({ select: { id: true, username: true, role: true, status: true, isBanned: true } })
    console.log('USERS:', JSON.stringify(users, null, 2))
  } catch (e) {
    console.error('ERROR:', e.message)
  } finally {
    await p.$disconnect()
  }
})()
