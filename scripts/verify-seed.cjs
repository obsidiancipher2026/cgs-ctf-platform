const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.challenge.count();
  console.log('Total challenges:', count);

  const webChallenges = await prisma.challenge.findMany({
    where: { category: 'web' },
    orderBy: { id: 'asc' },
    select: { id: true, title: true, difficulty: true, points: true, hint: true, description: true, flag: true },
  });

  console.log('Web challenges:', webChallenges.length);
  console.log('');

  const docTitles = [
    'Robots Only', 'Cookie Monster', "View Source Won't Save You",
    'The Parameter Whisperer', 'Header Games', 'Login? Optional',
    'Directory of Secrets', 'Cache Me If You Can', 'The Redirect Trap',
    'Form of Truth', 'Blind As A Bat', 'Template Trouble',
    'XSS Marks the Spot', 'Race to the Flag', 'JWT None of Your Business',
    'Path Less Traveled', 'Deserialize This', 'CORS You Later',
    'GraphQL Gauntlet', 'The Upload Zone', 'SSRF to the Cloud',
    'Prototype Chaos', "Smuggler's Route", 'Cache Poisoning Carnival',
    'XXE Marks Another Spot', 'The Chained Exploit',
    'Second-Order Injection', 'WebSocket Whisper',
    'Cryptic Signature', 'The Sandbox Escape',
  ];

  let allGood = true;
  for (const title of docTitles) {
    const found = webChallenges.find(c => c.title === title);
    const status = found ? '✓' : '✗ MISSING';
    if (!found) allGood = false;
    console.log(`  ${status}  ${title}`);
  }
  console.log('');
  console.log(allGood ? '✓ All 30 document challenges present!' : '✗ Some challenges are missing!');
  await prisma.$disconnect();
}

main().catch(console.error);
