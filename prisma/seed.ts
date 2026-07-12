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
  `/standalone/${generateSlug(title)}`

interface ChallengeData {
  title: string; description: string; category: string; difficulty: string;
  points: number; flag: string; hint: string | null; files?: string | null; instanceUrl?: string | null;
}

const challenges: ChallengeData[] = [
  // ═══ EASY TIER (7) ═══
  { title:'NovaSec Portal',      category:'web',difficulty:'easy',points:100,flag:'CGS{h3ad3rs_sp34k_l0ud3r_th4n_p4g3s}',          hint:'Web servers communicate using more than just HTML.',                                                                    instanceUrl:null, description:'NovaSec Labs just launched their shiny new company portal. Their security team is confident there\'s nothing interesting here — \'just a clean page,\' they said. But web servers talk in more ways than one. Sometimes the most important message isn\'t what gets displayed on screen.' },
  { title:'TimeVault',            category:'web',difficulty:'easy',points:100,flag:'CGS{css_v4r1abl3s_4r3_m0r3_th4n_c0l0rs}',      hint:'The secret isn\'t in the JavaScript. Look at how the page is styled.',                                                       instanceUrl:null, description:'TimeVault is counting down to something classified. The developers were in a rush and pushed their work straight to production. While everyone stares at the ticking clock, the real secret is hidden in how the page is dressed — not in what it does.' },
  { title:'DebugMode',            category:'web',difficulty:'easy',points:100,flag:'CGS{c0ns0l3_l0gs_d0nt_l13_t0_y0u}',            hint:'Developers leave messages while they code. Where do those messages usually go?',                                              instanceUrl:null, description:'CGS SysMonitor is an internal dashboard used to track system health. An engineer left debug mode enabled before deploying to production. The logs on screen look normal. But not everything shows on screen.' },
  { title:'PixelArchive',         category:'web',difficulty:'easy',points:100,flag:'CGS{3x1f_d4t4_hu6h_wh0_kn3w}',                 hint:'The flag isn\'t on the page. It\'s inside a file the page links to.',                                                        instanceUrl:null, files:JSON.stringify([{name:'featured-photo.jpg',url:'/standalone/pixelarchive/assets/featured-photo.jpg'}]), description:'A photographer\'s online portfolio, all clean grids and moody captions. Cameras — and the files they produce — remember more than the photographer intended to share.' },
  { title:'CrawlerTrap',          category:'web',difficulty:'easy',points:100,flag:'CGS{r0b0ts_txt_1s_n0t_4_f1r3w4ll}',           hint:'Check for a file that tells search engines what not to crawl.',                                                              instanceUrl:null, description:'CGS is building something internal and isn\'t ready to announce it. They\'ve politely asked search engines to stay away from a certain page. Search engines listen to polite requests. You don\'t have to.' },
  { title:'StyleGuide',           category:'web',difficulty:'easy',points:100,flag:'CGS{ext3rn4l_css_h4s_c0mm3nts_t00}',          hint:'The page loads more files than just its own HTML. Check what it links to.',                                                  instanceUrl:null, files:JSON.stringify([{name:'tokens.css',url:'/standalone/styleguide/assets/tokens.css'}]), description:'CGS\'s design team published their internal style guide. Everything looks buttoned-up on the page — but the stylesheet powering it was written by a developer who forgot that comments ship to production too.' },
  { title:'EncodedBanner',        category:'web',difficulty:'easy',points:100,flag:'CGS{b4s3_s1xty_f0ur_1s_n0t_3ncrypt10n}',      hint:'Look at the embedded JSON config script tag. Not every field is plain text.',                                                instanceUrl:null, description:'CGS Labs is teasing a new product with a slick countdown banner. The page ships its configuration as embedded JSON — some of it \'encoded for efficiency.\' Encoding isn\'t encryption.' },

  // ═══ MEDIUM TIER (10) ═══
  { title:'CookieCrumbs',         category:'web',difficulty:'medium',points:250,flag:'CGS{c00k13s_ar3_just_s3lf_r3p0rted_st4te}', hint:'Look at what cookies get set when you load the page.',                                                                   instanceUrl:null, description:'CGS Members Portal has a shiny login form — and a dashboard that quietly trusts a cookie to decide who you are. The form is a red herring. The server already believes whatever you tell it.' },
  { title:'TokenPeek',            category:'web',difficulty:'medium',points:250,flag:'CGS{jwt_p4yl04ds_ar3_r34d4bl3_n0t_s3cur3}', hint:'JWTs have three parts. Look closely at what the middle part contains.',                                                  instanceUrl:null, description:'CGS\'s internal tools use JSON Web Tokens for \'authentication.\' The server reads the payload to decide what you can see. It never actually checks whether the token is legitimate.' },
  { title:'LocalVault',           category:'web',difficulty:'medium',points:250,flag:'CGS{cl13nt_s1d3_gat3s_ar3_su663st10ns}',     hint:'Check what\'s stored in this site\'s Local Storage.',                                                                       instanceUrl:null, description:'CGS\'s premium panel is gated behind a feature flag stored right there in your browser. The promo code box is a distraction — the real switch is sitting in plain view in Local Storage.' },
  { title:'HiddenAPI',            category:'web',difficulty:'medium',points:250,flag:'CGS{th3_ui_1sn7_th3_wh0l3_4p1_surf4c3}',     hint:'The bundle was built straight from source. Search for /api/ strings — one endpoint is hidden.',                               instanceUrl:null, description:'The UI loads an app.bundle.js file built straight from source. It uses a public stats API, but the bundle might contain references to other endpoints.' },
  { title:'ReflectedNote',        category:'web',difficulty:'medium',points:250,flag:'CGS{r3fl3ct3d_xss_st1ll_c0unts}',           hint:'The note parameter gets reflected into the page. What happens if it contains HTML?',                                          instanceUrl:null, description:'CGS\'s internal notes tool lets you preview a note by pasting it into the URL. It renders your note exactly as written — a little too exactly.' },
  { title:'NoneAlg',              category:'web',difficulty:'medium',points:250,flag:'CGS{n3v3r_tru5t_th3_4l6_h34d3r}',            hint:'How does the server know which algorithm to use when verifying a JWT?',                                                    instanceUrl:null, description:'CGS\'s internal tools login system uses JWTs. The verification code reads the algorithm straight from the token instead of pinning it.' },
  { title:'RateDodge',            category:'web',difficulty:'medium',points:250,flag:'CGS{sp00f3d_h34d3rs_r3s3t_r4t3_l1m1ts}',     hint:'The server asks the client what IP it\'s coming from. Vary the X-Forwarded-For header across requests.',                      instanceUrl:null, description:'RateDodge \u2014 a rate limiter guards /api/vend. It only allows one request per IP. Or does it check the IP the way you think it does?' },
  { title:'GraphIntrospect',      category:'web',difficulty:'medium',points:250,flag:'CGS{1ntr0sp3ct10n_l34ks_th3_wh0l3_sch3m4}', hint:'This API is GraphQL. GraphQL schemas can describe themselves — look up introspection queries.',                             instanceUrl:null, description:'CGS Assets is a small internal catalog with a GraphQL backend. The frontend only asks for what it needs — but GraphQL will happily tell you everything it CAN answer, if you just ask the schema about itself.' },
  { title:'PathPeek',             category:'web',difficulty:'medium',points:250,flag:'CGS{d0t_d0t_sl4sh_st1ll_w0rks_1n_2026}',    hint:'The file parameter builds a filesystem path directly. What characters let you escape a folder?',                            instanceUrl:null, description:'CGS\'s internal doc viewer serves files from a folder by name. It never stopped to check whether \'by name\' could also mean \'by relative path.\'' },

  // ═══ HARD TIER (10) ═══
  { title:'SQLiLogin',            category:'web',difficulty:'hard',points:400,flag:'CGS{cl4ss1c_sql1_n3v3r_r3ally_d13s}',          hint:'This login form builds a SQL query directly from your input.',                                                             instanceUrl:null, description:'CGS\'s legacy admin login still runs on hand-rolled SQL, held together by string concatenation and hope.' },
  { title:'BlindBool',            category:'web',difficulty:'hard',points:400,flag:'CGS{bl1nd_b00l34n_extr4ct10n_1s_sl0w_but_sur3}',hint:'True/false is still a channel. Look for boolean-based blind SQL injection.',                                              instanceUrl:null, description:'CGS\'s product search never gives you a query error and never gives you data back — just found or not found. That\'s still enough to talk to the database, one true/false question at a time.' },
  { title:'SSRFetch',             category:'web',difficulty:'hard',points:400,flag:'CGS{s3rv3r_s1d3_r3qu3sts_g0_pl4c3s_us3rs_c4nt}',hint:'This feature makes an HTTP request from the server on your behalf. What if you pointed it somewhere unexpected?',           instanceUrl:null, description:'CGS\'s link preview tool fetches whatever URL you give it — from the server, not your browser. The server can see places you can\'t.' },
  { title:'DeserialBomb',         category:'web',difficulty:'hard',points:400,flag:'CGS{1ns3cur3_d3s3r14l1zat10n_1s_rc3}',          hint:'The prefs cookie isn\'t JSON — it\'s a serialized object format that can embed executable functions.',                       instanceUrl:null, description:'CGS\'s preferences feature stores your settings as a serialized object in a cookie — and happily reconstructs it, functions and all, on the next request.' },
  { title:'JWTCrack',             category:'web',difficulty:'hard',points:400,flag:'CGS{w34k_hm4c_s3cr3ts_f4ll_t0_wordl1sts}',     hint:'The token\'s signature is legitimate HS256 — but is the secret behind it actually strong?',                                 instanceUrl:null, description:'CGS\'s internal API signs its tokens properly — HMAC, valid signature, all correct. Except the secret they picked wouldn\'t survive five minutes against a wordlist.' },
  { title:'RaceWin',              category:'web',difficulty:'hard',points:400,flag:'CGS{t0ct0u_r4c3_c0nd1t10ns_ar3_r34l}',         hint:'The redemption check isn\'t a single atomic operation — it reads state, then writes state, as two separate steps.',        instanceUrl:null, description:'CGS is running a limited flash promo: one flag coupon, redeemable exactly once every 30 seconds. Their redemption check reads the flag state, then writes it — two separate steps. Steps take time. Time is exploitable.' },
  { title:'ProtoPollute',         category:'web',difficulty:'hard',points:400,flag:'CGS{__pr0t0__pollut10n_ch4ng3s_3v3ryth1ng}',   hint:'This endpoint deep-merges your preferences into server state. What happens if you include a __proto__ key?',               instanceUrl:null, description:'CGS\'s settings API merges your preferences into its config, recursively, key by key. It never stopped to ask whether one of those keys might be __proto__.' },
  { title:'SSTI Render',          category:'web',difficulty:'hard',points:400,flag:'CGS{ss7i_turns_t3mpl4t3s_1nt0_sh3lls}',        hint:'Try a template expression like <%= 7*7 %> in the preview field.',                                                            instanceUrl:null, description:'CGS\'s marketing team built a live preview for email templates. Whatever you type gets rendered by the server\'s full template engine, no sandbox in sight.' },
  { title:'XXEcho',               category:'web',difficulty:'hard',points:400,flag:'CGS{xx3_st1ll_h4unts_l3g4cy_p4rs3rs}',          hint:'XML supports defining custom entities, including ones that read local files — research XXE.',                                instanceUrl:null, description:'CGS\'s contact importer accepts XML uploads and happily resolves whatever entities you define inside them — including ones that point at the local filesystem.' },
  { title:'CORSChain',            category:'web',difficulty:'hard',points:400,flag:'CGS{r3fl3ct3d_cors_pl4y_l34ks_cr3d3nt14l5}',    hint:'Check the CORS headers on /api/session-info — what Origin values does it accept, and does it allow credentials?',           instanceUrl:null, description:'CGS\'s session-info API reflects whatever Origin header it receives and allows credentialed requests. That\'s a very generous cross-origin policy for an endpoint that returns session data.' },
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

  const seedSlugs = challenges.map(c => generateSlug(c.title))

  // Remove any challenges that are no longer present in the seed list.
  const removed = await prisma.challenge.deleteMany({
    where: { slug: { notIn: seedSlugs } },
  })
  if (removed.count > 0) {
    console.log(`[OK] Removed ${removed.count} stale challenge(s)`)
  }

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
        published: true,
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
        published: true,
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
