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

    // Helper: keep only known scalar fields per model (strip relations & unknown columns)
    const MODEL_FIELDS = {
      user: ['id','username','email','hashedPassword','passwordPlain','avatarUrl','role','status','isBanned','score','ranking','lastIp','lastLogin','createdAt','updatedAt','teamId','firstName','middleName','lastName','country','college'],
      team: ['id','name','description','avatarUrl','isBanned','isSuspended','createdAt','updatedAt'],
      challenge: ['id','title','description','category','difficulty','points','flagMode','flag','hint','maxAttempts','isPublished','solverCount','fileUrl','challengeType','bloodPoints','firstBloodUserId','createdAt','updatedAt'],
      submission: ['id','challengeId','userId','teamId','flagProvided','isCorrect','ipAddress','createdAt'],
      announcement: ['id','title','message','isBroadcast','createdAt','expiresAt'],
      log: ['id','action','details','ipAddress','userId','severity','createdAt'],
      attackLog: ['id','attackType','severity','ipAddress','userId','username','fingerprint','riskScore','endpoint','method','userAgent','payloadSnapshot','headersSnapshot','country','actionTaken','quarantineUntil','blocked','whitelisted','reviewed','reviewedBy','notes','chainHash','prevChainHash','createdAt'],
      realFlag: ['id','challengeName','flag','category','notes','createdBy','createdAt','updatedAt'],
      securityConfig: ['id','key','value'],
      scanTransaction: ['id','submissionId','teamId','challengeId','flagHash','anomalyScore','ipAddress','userAgent','createdAt'],
    };
    const pickScalars = (modelName, obj) => {
      const allowed = MODEL_FIELDS[modelName] || ['id'];
      const result = {};
      for (const key of allowed) {
        if (key in obj) result[key] = obj[key];
      }
      return result;
    };

    // Teams (no dependencies)
    console.log('Importing teams...');
    for (const t of data.teams) {
      const clean = pickScalars('team', t);
      await prisma.team.upsert({ where: { id: t.id }, update: clean, create: clean });
    }

    // Users
    console.log('Importing users...');
    for (const u of data.users) {
      const clean = pickScalars('user', u);
      await prisma.user.upsert({ where: { id: u.id }, update: clean, create: clean });
    }

    // Challenges
    console.log('Importing challenges...');
    for (const c of data.challenges) {
      const clean = pickScalars('challenge', c);
      await prisma.challenge.upsert({
        where: { id: c.id },
        update: clean,
        create: clean,
      });
    }

    // Real flags
    console.log('Importing real flags...');
    for (const rf of data.realFlags) {
      const clean = pickScalars('realFlag', rf);
      await prisma.realFlag.upsert({ where: { id: rf.id }, update: clean, create: clean });
    }

    // Announcements
    console.log('Importing announcements...');
    for (const a of data.announcements) {
      const clean = pickScalars('announcement', a);
      await prisma.announcement.upsert({ where: { id: a.id }, update: clean, create: clean });
    }

    // Submissions
    console.log('Importing submissions...');
    for (const s of data.submissions) {
      const clean = pickScalars('submission', s);
      await prisma.submission.upsert({ where: { id: s.id }, update: clean, create: clean });
    }

    // Logs
    console.log('Importing logs...');
    for (const l of data.logs) {
      const clean = pickScalars('log', l);
      await prisma.log.upsert({ where: { id: l.id }, update: clean, create: clean });
    }

    // Attack logs
    console.log('Importing attack logs...');
    for (const al of data.attackLogs) {
      const clean = pickScalars('attackLog', al);
      await prisma.attackLog.upsert({ where: { id: al.id }, update: clean, create: clean });
    }

    // Security configs (key-based upsert)
    console.log('Importing security configs...');
    for (const sc of data.securityConfigs) {
      const clean = pickScalars('securityConfig', sc);
      await prisma.securityConfig.upsert({
        where: { key: sc.key },
        update: clean,
        create: clean,
      });
    }

    // Scan transactions
    console.log('Importing scan transactions...');
    for (const st of data.scanTransactions) {
      const clean = pickScalars('scanTransaction', st);
      await prisma.scanTransaction.upsert({ where: { id: st.id }, update: clean, create: clean });
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
