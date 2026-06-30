import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: 'file:./dev.db' } },
});

async function main() {
  console.log('Cleaning up unapproved users...');
  const result = await prisma.user.deleteMany({
    where: { status: { not: 'active' } },
  });
  console.log(`Deleted ${result.count} unapproved user(s).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
