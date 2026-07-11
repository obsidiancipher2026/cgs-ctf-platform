import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

const hashFlag = (flag: string) => crypto.createHash('sha256').update(flag).digest('hex')

const generateSlug = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const playgroundSlug = (title: string): string =>
  `/playground/${generateSlug(title)}`

interface ChallengeData {
  title: string; description: string; category: string; difficulty: string;
  points: number; flag: string; hint: string | null; files?: string | null; instanceUrl?: string | null;
}

const challenges: ChallengeData[] = [
  // ═══════════════════ Easy (10) ═══════════════════
  {
    title: 'Robots Only',
    description: 'The bots know something you don\'t. Ask them nicely. This site has secrets that search engines are told to ignore, but nothing stops you from looking.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{b0ts_d0nt_t3ll_but_th3y_l34v3_tr41ls}',
    hint: 'The bots know something you don\'t. Ask them nicely.',
    instanceUrl: null,
  },
  {
    title: 'Cookie Monster',
    description: 'Cookies are just crumbs. Follow the crumbs to the door — no wait, look under the couch. This app trusts whatever role you tell it you are.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{c00k13_m0nst3r_w4nts_th3_fl4g}',
    hint: 'Cookies are just crumbs. Follow the crumbs to the door — no wait, look under the couch.',
    instanceUrl: null,
  },
  {
    title: 'View Source Won\'t Save You',
    description: 'Ctrl+U is for people who give up too early. Or is it? There\'s more to this page than meets the eye — or the source viewer.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{s0urc3_c0d3_n0t_s0_s3cur3}',
    hint: 'Ctrl+U is for people who give up too early. Or is it?',
    instanceUrl: null,
  },
  {
    title: 'The Parameter Whisperer',
    description: 'Numbers don\'t lie, but the ones you see aren\'t the only ones that exist. Try changing what you\'re told to look at.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{wh0_kn3w_y0ur_n3ighb0rs_pr0f1l3}',
    hint: 'Numbers don\'t lie, but the ones you see aren\'t the only ones that exist.',
    instanceUrl: null,
  },
  {
    title: 'Header Games',
    description: 'The server judges you by your browser. Lie about your identity. Some content is only served to very specific visitors.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{h34d3rs_4r3_th3_n3w_c00k13s}',
    hint: 'The server judges you by your browser. Lie about your identity.',
    instanceUrl: null,
  },
  {
    title: 'Login? Optional',
    description: 'The password field has never met an apostrophe it didn\'t like. This login form is older than the internet and trusts you completely.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{\' OR \'1\'=\'1\' -- th3_cl4ss1c}',
    hint: 'The password field has never met an apostrophe it didn\'t like.',
    instanceUrl: null,
  },
  {
    title: 'Directory of Secrets',
    description: 'Version control remembers everything, even what you tried to forget. Check what\'s hiding in common backup locations.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{wh0_n33ds_4_p4ssw0rd_wh3n_y0u_h4v3_g1t}',
    hint: 'Version control remembers everything, even what you tried to forget.',
    instanceUrl: null,
  },
  {
    title: 'Cache Me If You Can',
    description: 'It\'s not on the page. It\'s not off the page either. Sometimes the browser loads things the page never shows you.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{th3_bundl3_kn0ws_wh3r3_th3_fl4g_1s}',
    hint: 'It\'s not on the page. It\'s not off the page either.',
    instanceUrl: null,
  },
  {
    title: 'The Redirect Trap',
    description: 'This link takes you somewhere else. Somewhere else takes you somewhere better. Follow the chain carefully.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{r3d1r3cts_c4n_b3_d4ng3r0us_t00}',
    hint: 'This link takes you somewhere else. Somewhere else takes you somewhere better.',
    instanceUrl: null,
  },
  {
    title: 'Form of Truth',
    description: 'The form says no. The server never got the memo. Client-side validation is just a suggestion, not a law.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{cl13nt_s1d3_1s_just_4_sugg3st10n}',
    hint: 'The form says no. The server never got the memo.',
    instanceUrl: null,
  },
  // ═══════════════════ Medium (10) ═══════════════════
  {
    title: 'Blind As A Bat',
    description: 'It never tells you what it knows. It only ever says yes or no. But that\'s enough if you know how to ask.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{bl1nd_but_n0t_s1l3nt_ab0ut_th3_fl4g}',
    hint: 'It never tells you what it knows. It only ever says yes or no.',
    instanceUrl: null,
  },
  {
    title: 'Template Trouble',
    description: 'Your name gets printed back. Names can say a lot about you — and about the server too if you format them right.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{t3mpl4t3s_4r3_p0w3rful_t001s}',
    hint: 'Your name gets printed back. Names can say a lot about you.',
    instanceUrl: null,
  },
  {
    title: 'XSS Marks the Spot',
    description: 'The admin reads every comment. Be persuasive. If your message is compelling enough, you might get more than a reply.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{xss_th3_sp0t_g0t_th3_fl4g}',
    hint: 'The admin reads every comment. Be persuasive.',
    instanceUrl: null,
  },
  {
    title: 'Race to the Flag',
    description: 'One request should be enough for anyone. Prove the developer wrong, simultaneously. Speed is the only thing between you and victory.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{r4c3_y0ur_w4y_t0_th3_fl4g}',
    hint: 'One request should be enough for anyone. Prove the developer wrong, simultaneously.',
    instanceUrl: null,
  },
  {
    title: 'JWT None of Your Business',
    description: 'Trust, but verify. The server does neither. If you can convince it of who you are, it will believe you.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{jwt_n0n3_0f_y0ur_bus1n3ss}',
    hint: 'Trust, but verify. The server does neither.',
    instanceUrl: null,
  },
  {
    title: 'The Path Less Traveled',
    description: 'Every file has a filename parameter. Not every filename is a filename. Sometimes what looks like a name is actually a path.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{th3_p4th_l3ss_tr4v3l3d_l34ds_t0_fl4gs}',
    hint: 'Every file has a filename parameter. Not every filename is a filename.',
    instanceUrl: null,
  },
  {
    title: 'Deserialize This',
    description: 'State should never be trusted. Neither should this cookie. When the server unpacks what you give it, you control what gets unpacked.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{d3s3r14l1z3_th1s_1f_y0u_d4r3}',
    hint: 'State should never be trusted. Neither should this cookie.',
    instanceUrl: null,
  },
  {
    title: 'CORS You Later',
    description: 'Origins are just headers. Headers are just words. Words can be anything. This API trusts any origin that speaks its language.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{c0rs_byp4ss_g3ts_th3_fl4g}',
    hint: 'Origins are just headers. Headers are just words. Words can be anything.',
    instanceUrl: null,
  },
  {
    title: 'GraphQL Gauntlet',
    description: 'Ask the schema what it knows. It\'s surprisingly chatty. GraphQL will tell you everything about its structure if you just ask.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{gr4phql_1s_4n_0p3n_b00k}',
    hint: 'Ask the schema what it knows. It\'s surprisingly chatty.',
    instanceUrl: null,
  },
  {
    title: 'The Upload Zone',
    description: 'It checks the extension. It never checks the content. Or does it check something else entirely? Upload and find out.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{uppl04d_y0ur_w4y_t0_v1ct0ry}',
    hint: 'It checks the extension. It never checks the content. Or does it check something else entirely?',
    instanceUrl: null,
  },
  // ═══════════════════ Hard (10) ═══════════════════
  {
    title: 'SSRF to the Cloud',
    description: 'The server fetches URLs for you. Ask it to fetch something closer to home. The most interesting things are on the local network.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{ssrf_1s_th3_g4t3w4y_t0_th3_cl0ud}',
    hint: 'The server fetches URLs for you. Ask it to fetch something closer to home.',
    instanceUrl: null,
  },
  {
    title: 'Prototype Chaos',
    description: '__proto__ isn\'t a typo. It\'s an invitation. When apps merge objects without caution, everything becomes malleable.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{pr0t0typ3_ch40s_1s_c0mpl3t3}',
    hint: '__proto__ isn\'t a typo. It\'s an invitation.',
    instanceUrl: null,
  },
  {
    title: 'Smuggler\'s Route',
    description: 'The proxy and the app disagree about where a request ends. Exploit the argument. Somewhere in the confusion lies the flag.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{smuggl3d_r3qu3sts_g3t_th3_fl4g}',
    hint: 'The proxy and the app disagree about where a request ends. Exploit the argument.',
    instanceUrl: null,
  },
  {
    title: 'Cache Poisoning Carnival',
    description: 'The cache remembers the wrong thing for the right reason. One poisoned response poisons every visitor that follows.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{c4ch3_p01s0n_f0r_th3_c4rn1v4l}',
    hint: 'The cache remembers the wrong thing for the right reason.',
    instanceUrl: null,
  },
  {
    title: 'XXE Marks Another Spot',
    description: 'XML is verbose for a reason. Some of that verbosity reads files. When the parser trusts entities, the filesystem is an open book.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{xxe_m4rks_th3_sp0t_ag41n}',
    hint: 'XML is verbose for a reason. Some of that verbosity reads files.',
    instanceUrl: null,
  },
  {
    title: 'The Chained Exploit',
    description: 'One bug alone gets you nowhere. Two bugs holding hands get you everywhere. Chain them together for maximum effect.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{ch41n3d_3xpl01ts_ar3_th3_b3st}',
    hint: 'One bug alone gets you nowhere. Two bugs holding hands get you everywhere.',
    instanceUrl: null,
  },
  {
    title: 'Second-Order Injection',
    description: 'The injection isn\'t where you type it. It\'s where it\'s used later. Some payloads need patience to detonate.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{s3c0nd_0rd3r_1nj3ct10n_1s_d3l4y3d}',
    hint: 'The injection isn\'t where you type it. It\'s where it\'s used later.',
    instanceUrl: null,
  },
  {
    title: 'WebSocket Whisper',
    description: 'HTTP has cookies. WebSockets remember them too, whether you meant them to or not. Real-time communication, real-time leaks.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{w3bs0ck3t_wh1sp3rs_s3cr3ts_t00}',
    hint: 'HTTP has cookies. WebSockets remember them too, whether you meant them to or not.',
    instanceUrl: null,
  },
  {
    title: 'Cryptic Signature',
    description: 'The public key was never meant to be a secret. Someone forgot that. When the signing algorithm is confused, anyone can sign.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{cr1pt1c_s1gn4tur3s_4r3nt_s0_cr1pt1c}',
    hint: 'The public key was never meant to be a secret. Someone forgot that.',
    instanceUrl: null,
  },
  {
    title: 'The Sandbox Escape',
    description: 'The sandbox promises isolation. Promises aren\'t code. When the sandbox has holes, the whole server is your playground.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{s4ndb0x_3sc4p3_n0t_s0_s4ndb0x3d}',
    hint: 'The sandbox promises isolation. Promises aren\'t code.',
    instanceUrl: null,
  },
]

const getTags = (category: string, difficulty: string): string => {
  const tags: string[] = [category, difficulty]
  return JSON.stringify(tags)
}

const getEstimatedTime = (difficulty: string): number => {
  switch (difficulty) {
    case 'easy': return 15
    case 'medium': return 30
    case 'hard': return 60
    default: return 15
  }
}

const getInstanceType = (category: string): string | null => {
  if (category === 'web') return 'web'
  return null
}

const getHints = (hint: string | null): string | null => {
  if (!hint) return null
  return JSON.stringify([{ text: hint, penalty: 0 }])
}

async function seedAdmin() {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    console.warn('[WARN] ADMIN_PASSWORD not set — skipping admin user creation')
    return
  }

  const bcrypt = await import('bcryptjs')
  const hashedPassword = await bcrypt.default.hash(adminPassword, 12)

  await prisma.user.upsert({
    where: { username: process.env.ADMIN_USERNAME || 'admin' },
    update: {},
    create: {
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@cyberguardians.io',
      hashedPassword,
      role: 'admin',
      status: 'active',
    },
  })
  console.log('[OK] Admin user created')
}

async function seedChallenges() {
  console.log('Seeding challenges...')

  let created = 0
  let updated = 0
  for (const c of challenges) {
    const slug = generateSlug(c.title)

    await prisma.challenge.upsert({
      where: { slug },
      update: {
        title: c.title,
        description: c.description,
        category: c.category,
        difficulty: c.difficulty,
        points: c.points,
        flag: hashFlag(c.flag),
        hint: c.hint ? c.hint : null,
        files: c.files ? c.files : null,
        instanceUrl: c.instanceUrl ? c.instanceUrl : (c.category === 'web' ? playgroundSlug(c.title) : null),
        markdown: c.description,
        story: null,
        downloads: c.files ? c.files : null,
        author: 'CGS Team',
        tags: getTags(c.category, c.difficulty),
        estimatedTime: getEstimatedTime(c.difficulty),
        solveCount: 0,
        solveRate: 0.0,
        instanceType: getInstanceType(c.category),
        hintPenalty: 0,
        hints: getHints(c.hint),
      },
      create: {
        slug,
        title: c.title,
        description: c.description,
        category: c.category,
        difficulty: c.difficulty,
        points: c.points,
        flag: hashFlag(c.flag),
        hint: c.hint ? c.hint : null,
        files: c.files ? c.files : null,
        instanceUrl: c.instanceUrl ? c.instanceUrl : (c.category === 'web' ? playgroundSlug(c.title) : null),
        published: false,
        markdown: c.description,
        story: null,
        downloads: c.files ? c.files : null,
        author: 'CGS Team',
        tags: getTags(c.category, c.difficulty),
        estimatedTime: getEstimatedTime(c.difficulty),
        solveCount: 0,
        solveRate: 0.0,
        instanceType: getInstanceType(c.category),
        hintPenalty: 0,
        hints: getHints(c.hint),
      },
    })

    created++
  }

  const total = await prisma.challenge.count()
  console.log(`[OK] ${created} challenges seeded (${total} total in database)`)
}

async function main() {
  console.log('=== CGS CTF Database Seed ===\n')
  await seedAdmin()
  console.log('')
  await seedChallenges()
  console.log('\n=== Seed complete ===')
}

main()
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
