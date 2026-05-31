const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const c = await p.challenge.findMany({ orderBy: { id: 'asc' } });
  c.forEach(x => console.log(x.id, x.title, x.category, x.difficulty, x.points, x.isPublished ? 'PUB' : 'DRAFT'));
  await p.$disconnect();
})();
