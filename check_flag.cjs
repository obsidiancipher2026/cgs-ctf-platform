const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.challenge.findUnique({where:{id:5}}).then(c => {
  console.log('ID:', c.id, 'Title:', c.title, 'Flag:', c.flag);
}).finally(() => p.$disconnect());
