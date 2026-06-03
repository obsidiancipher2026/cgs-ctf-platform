// Export data from SQLite dev.db to JSON
// Run: cd frontend && node scripts/export_data.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCHEMA_PRISMA = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const SCHEMA_SQLITE = path.join(__dirname, '..', 'prisma', 'schema.sqlite.prisma');
const DATA_FILE = path.join(__dirname, '..', 'prisma', 'exported_data.json');

async function main() {
  console.log('=== Exporting data from SQLite dev.db ===');

  // Backup current schema and switch to SQLite
  const postgresSchema = fs.readFileSync(SCHEMA_PRISMA, 'utf-8');
  fs.copyFileSync(SCHEMA_SQLITE, SCHEMA_PRISMA);

  // Generate Prisma client for SQLite
  execSync('npx prisma generate', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: 'file:./dev.db' } });

  // Export data
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient({ datasources: { db: { url: 'file:./dev.db' } } });

  try {
    const data = {
      users: await prisma.user.findMany(),
      challenges: await prisma.challenge.findMany(),
      realFlags: await prisma.realFlag.findMany(),
      announcements: await prisma.announcement.findMany(),
      submissions: await prisma.submission.findMany(),
      teams: await prisma.team.findMany(),
      logs: await prisma.log.findMany(),
      attackLogs: await prisma.attackLog.findMany(),
      securityConfigs: await prisma.securityConfig.findMany(),
      scanTransactions: await prisma.scanTransaction.findMany(),
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`Exported: ${data.users.length} users`);
    console.log(`Exported: ${data.challenges.length} challenges`);
    console.log(`Exported: ${data.realFlags.length} real flags`);
    console.log(`Exported: ${data.announcements.length} announcements`);
    console.log(`Exported: ${data.submissions.length} submissions`);
    console.log(`Exported: ${data.teams.length} teams`);
    console.log(`Data saved to: prisma/exported_data.json`);
  } finally {
    await prisma.$disconnect();
  }

  // Restore PostgreSQL schema
  fs.writeFileSync(SCHEMA_PRISMA, postgresSchema);
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('\nExport complete. Schema restored to PostgreSQL.');
}

main().catch(e => { console.error('Export failed:', e); process.exit(1); });
