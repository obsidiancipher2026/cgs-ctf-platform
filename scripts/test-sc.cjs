const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()
;(async () => {
  try {
    const r = await p.securityConfig.upsert({
      where: { key: 'maintenance_mode' },
      update: { value: 'true' },
      create: { key: 'maintenance_mode', value: 'true' },
    })
    console.log('UPSERT OK:', r)
    await p.securityConfig.update({ where: { key: 'maintenance_mode' }, data: { value: 'false' } })
    console.log('RESET OK')
  } catch (e) {
    console.error('ERROR:', e.message)
  } finally {
    await p.$disconnect()
  }
})()
