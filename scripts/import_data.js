// Import data from JSON to Vercel PostgreSQL
// Run: cd frontend && node scripts/import_data.js

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const DATA_FILE = path.join(__dirname, '..', 'prisma', 'exported_data.json');

async function main() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('ERROR: No exported_data.json found. Run scripts/export_data.js first.');
    process.exit(1);
  }

  console.log('=== Importing data to Vercel PostgreSQL ===');

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const prisma = new PrismaClient();

  try {
    // Sync DB to match JSON: delete records not in the import
    const deleteStaleRecords = async (label, delegate, idField, validIds) => {
      const existing = await delegate.findMany({ select: { [idField]: true } });
      const toDelete = existing.filter(r => !validIds.has(r[idField])).map(r => r[idField]);
      if (toDelete.length > 0) {
        console.log(`  Deleting ${toDelete.length} stale ${label} entries...`);
        await delegate.deleteMany({ where: { [idField]: { in: toDelete } } });
      }
    };

    await deleteStaleRecords('challenge', prisma.challenge, 'id', new Set(data.challenges.map(c => c.id)));
    await deleteStaleRecords('realFlag', prisma.realFlag, 'id', new Set(data.realFlags.map(rf => rf.id)));

    // Teams (no dependencies)
    console.log('Importing teams...');
    for (const t of data.teams) {
      await prisma.team.upsert({ where: { id: t.id }, update: {}, create: t });
    }

    // Users
    console.log('Importing users...');
    for (const u of data.users) {
      await prisma.user.upsert({ where: { id: u.id }, update: {}, create: u });
    }

    // Challenges
    console.log('Importing challenges...');
    for (const c of data.challenges) {
      const { firstBloodUserId, ...createData } = c;
      await prisma.challenge.upsert({
        where: { id: c.id },
        update: {},
        create: { ...createData, firstBloodUserId: firstBloodUserId || null },
      });
    }

    // Real flags
    console.log('Importing real flags...');
    for (const rf of data.realFlags) {
      await prisma.realFlag.upsert({ where: { id: rf.id }, update: {}, create: rf });
    }

    // Announcements
    console.log('Importing announcements...');
    for (const a of data.announcements) {
      await prisma.announcement.upsert({ where: { id: a.id }, update: {}, create: a });
    }

    // Submissions
    console.log('Importing submissions...');
    for (const s of data.submissions) {
      await prisma.submission.upsert({ where: { id: s.id }, update: {}, create: s });
    }

    // Logs
    console.log('Importing logs...');
    for (const l of data.logs) {
      await prisma.log.upsert({ where: { id: l.id }, update: {}, create: l });
    }

    // Attack logs
    console.log('Importing attack logs...');
    for (const al of data.attackLogs) {
      await prisma.attackLog.upsert({ where: { id: al.id }, update: {}, create: al });
    }

    // Security configs (key-based upsert)
    console.log('Importing security configs...');
    for (const sc of data.securityConfigs) {
      await prisma.securityConfig.upsert({
        where: { key: sc.key },
        update: { value: sc.value },
        create: { key: sc.key, value: sc.value },
      });
    }

    // Scan transactions
    console.log('Importing scan transactions...');
    for (const st of data.scanTransactions) {
      await prisma.scanTransaction.upsert({ where: { id: st.id }, update: {}, create: st });
    }

    console.log('\n=== MIGRATION COMPLETE ===');
    console.log(`Imported: ${data.users.length} users`);
    console.log(`Imported: ${data.challenges.length} challenges`);
    console.log(`Imported: ${data.realFlags.length} real flags`);
    console.log(`Imported: ${data.announcements.length} announcements`);
  } catch (e) {
    console.error('Import failed:', e.message || e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => process.exit(1));
