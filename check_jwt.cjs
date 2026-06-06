const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.challenge.findUnique({ where: { id: 11 } }).then(c => {
  console.log(JSON.stringify({ id: c.id, title: c.title, fileUrl: c.fileUrl }));
}).finally(() => p.$disconnect());
