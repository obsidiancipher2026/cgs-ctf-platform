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
  points: number; flag: string; hint: string | null; hintList?: string[];
  files?: string | null; instanceUrl?: string | null;
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
  { title:'CookieCrumbs',         category:'web',difficulty:'medium',points:200,flag:'CGS{c00k13s_ar3_just_s3lf_r3p0rted_st4te}', hint:'Look at what cookies get set when you load the page.',                                                                   instanceUrl:null, description:'CGS Members Portal has a shiny login form — and a dashboard that quietly trusts a cookie to decide who you are. The form is a red herring. The server already believes whatever you tell it.' },
  { title:'TokenPeek',            category:'web',difficulty:'medium',points:200,flag:'CGS{jwt_p4yl04ds_ar3_r34d4bl3_n0t_s3cur3}', hint:'JWTs have three parts. Look closely at what the middle part contains.',                                                  instanceUrl:null, description:'CGS\'s internal tools use JSON Web Tokens for \'authentication.\' The server reads the payload to decide what you can see. It never actually checks whether the token is legitimate.' },
  { title:'LocalVault',           category:'web',difficulty:'medium',points:200,flag:'CGS{cl13nt_s1d3_gat3s_ar3_su663st10ns}',     hint:'Check what\'s stored in this site\'s Local Storage.',                                                                       instanceUrl:null, description:'CGS\'s premium panel is gated behind a feature flag stored right there in your browser. The promo code box is a distraction — the real switch is sitting in plain view in Local Storage.' },
  { title:'HiddenAPI',            category:'web',difficulty:'medium',points:200,flag:'CGS{th3_ui_1sn7_th3_wh0l3_4p1_surf4c3}',     hint:'The bundle was built straight from source. Search for /api/ strings — one endpoint is hidden.',                               instanceUrl:null, description:'The UI loads an app.bundle.js file built straight from source. It uses a public stats API, but the bundle might contain references to other endpoints.' },
  { title:'ReflectedNote',        category:'web',difficulty:'medium',points:200,flag:'CGS{r3fl3ct3d_xss_st1ll_c0unts}',           hint:'The note preview renders your input exactly as written. What happens if the input contains script tags?',                      instanceUrl:null, description:'CGS Quick Note is an internal tool for drafting and previewing notes. Your input gets rendered live on the page — the app trusts you to write safe content.' },
  { title:'NoneAlg',              category:'web',difficulty:'medium',points:200,flag:'CGS{n3v3r_tru5t_th3_4l6_h34d3r}',            hint:'How does the server know which algorithm to use when verifying a JWT?',                                                    instanceUrl:null, description:'CGS\'s internal tools login system uses JWTs. The verification code reads the algorithm straight from the token instead of pinning it.' },
  { title:'RateDodge',            category:'web',difficulty:'medium',points:200,flag:'CGS{sp00f3d_h34d3rs_r3s3t_r4t3_l1m1ts}',     hint:'The server asks the client what IP it\'s coming from. Vary the X-Client-IP header across requests.',                        instanceUrl:null, description:'RateDodge \u2014 a rate limiter guards /api/vend. It only allows one request per IP. Or does it check the IP the way you think it does?' },
  { title:'GraphIntrospect',      category:'web',difficulty:'medium',points:200,flag:'CGS{gr4ph_1ntr0sp3ct10n_l34ks_th3_wh0l3_sch3m4}', hint:'Introspection reveals more than just field names — look at the return types. Some payloads need decoding.',                     instanceUrl:null, description:'CGS Asset Catalog exposes a GraphQL API for querying internal design assets. The frontend only asks for what it needs — but GraphQL will happily tell you everything it CAN answer, if you just ask the schema about itself. What you find might need a second look.' },
  { title:'PathPeek',             category:'web',difficulty:'medium',points:200,flag:'CGS{d0t_d0t_sl4sh_st1ll_w0rks_1n_2026}',    hint:'The file parameter builds a filesystem path directly. What characters let you escape a folder?',                            instanceUrl:null, description:'CGS\'s internal doc viewer serves files from a folder by name. It never stopped to check whether \'by name\' could also mean \'by relative path.\'' },

  // ═══ HARD TIER (8) ═══
  { title:'BlindBool',            category:'web',difficulty:'hard',points:300,flag:'CGS{bl1nd_b00l34n_extr4ct10n_1s_sl0w_but_sur3}',hint:'True/false is still a channel. Look for boolean-based blind SQL injection.',                                              instanceUrl:null, description:'CGS\'s product search never gives you a query error and never gives you data back — just found or not found. That\'s still enough to talk to the database, one true/false question at a time.' },
  { title:'SSRFetch',             category:'web',difficulty:'hard',points:300,flag:'CGS{s3rv3r_s1d3_r3qu3sts_g0_pl4c3s_us3rs_c4nt}',hint:'This feature makes an HTTP request from the server on your behalf. What if you pointed it somewhere unexpected?',           instanceUrl:null, description:'CGS\'s link preview tool fetches whatever URL you give it — from the server, not your browser. The server can see places you can\'t.' },

  { title:'JWTCrack',             category:'web',difficulty:'hard',points:300,flag:'CGS{w34k_hm4c_s3cr3ts_f4ll_t0_wordl1sts}',     hint:'The token\'s signature is legitimate HS256 — but is the secret behind it actually strong?',                                 instanceUrl:null, description:'CGS\'s internal API signs its tokens properly — HMAC, valid signature, all correct. Except the secret they picked wouldn\'t survive five minutes against a wordlist.' },
  { title:'RaceWin',              category:'web',difficulty:'hard',points:300,flag:'CGS{t0ct0u_r4c3_c0nd1t10ns_ar3_r34l}',         hint:'The redemption check isn\'t a single atomic operation — it reads state, then writes state, as two separate steps.',        instanceUrl:null, description:'CGS is running a limited flash promo: one flag coupon, redeemable exactly once every 30 seconds. Their redemption check reads the flag state, then writes it — two separate steps. Steps take time. Time is exploitable.' },
  { title:'ProtoPollute',         category:'web',difficulty:'hard',points:300,flag:'CGS{__pr0t0__pollut10n_ch4ng3s_3v3ryth1ng}',   hint:'This endpoint deep-merges your preferences into server state. What happens if you include a __proto__ key?',               instanceUrl:null, description:'CGS\'s settings API merges your preferences into its config, recursively, key by key. It never stopped to ask whether one of those keys might be __proto__.' },
  { title:'SSTI Render',          category:'web',difficulty:'hard',points:300,flag:'CGS{ss7i_turns_t3mpl4t3s_1nt0_sh3lls}',        hint:'Try a template expression like <%= 7*7 %> in the preview field.',                                                            instanceUrl:null, description:'CGS\'s marketing team built a live preview for email templates. Whatever you type gets rendered by the server\'s full template engine, no sandbox in sight.' },
  { title:'XXEcho',               category:'web',difficulty:'hard',points:300,flag:'CGS{xx3_st1ll_h4unts_l3g4cy_p4rs3rs}',          hint:'XML supports defining custom entities, including ones that read local files — research XXE.',                                instanceUrl:null, description:'CGS\'s contact importer accepts XML uploads and happily resolves whatever entities you define inside them — including ones that point at the local filesystem.' },
  { title:'CORSChain',            category:'web',difficulty:'hard',points:300,flag:'CGS{r3fl3ct3d_cors_pl4y_l34ks_cr3d3nt14l5}',    hint:'Check the CORS headers on /api/session-info — what Origin values does it accept, and does it allow credentials?',           instanceUrl:null, description:'CGS\'s session-info API reflects whatever Origin header it receives and allows credentialed requests. That\'s a very generous cross-origin policy for an endpoint that returns session data.' },

  // ═══ OSINT EASY ═══
  {
    title:'Project OES Archive', category:'osint', difficulty:'easy', points:100,
    flag:'CGS{ProgenitorTyrantGvirusTveronicaUroborosCvirusAlpis}',
    hint:null,
    hintList:[
      'The character\'s initials are O.E.S.',
      'The character is a scientist, not the main protagonist.',
      'The game series began in the 1990s.',
      'The first letter of every research name is capitalized.',
      'There are seven research names.',
      'Ignore spaces, hyphens, and punctuation. Join all research names together.',
    ],
    instanceUrl:null,
    description:'A highly classified archive has been recovered from a heavily secured scientific laboratory. Among the recovered files are several confidential research notes, damaged correspondence, and references to an individual known only as "OES."\n\nDuring the investigation, analysts discovered that the challenge author is a huge fan of a famous AAA survival horror video game series. The codename OES is a clue pointing toward one of its most iconic fictional scientists.\n\nYour mission is to identify this character and list the names of their most significant successful biological research projects in chronological order. Concatenate the names together exactly as shown in the flag format.',
  },
  {
    title:'The Forgotten Castle', category:'osint', difficulty:'easy', points:100,
    flag:'CGS{Peleș_Castle}',
    hint:null,
    hintList:[
      'Located in Romania.',
      'Built in the 19th century.',
      'Frequently compared to a castle from Resident Evil Village.',
    ],
    instanceUrl:null,
    description:'A recovered intelligence report mentions that the challenge author is fascinated by a legendary vampire lord from a famous survival horror game. Investigators believe the castle in the game was inspired by a real European castle.\n\nFind the name of the real castle.',
  },

  // ═══ OSINT MEDIUM ═══
  {
    title:'Project Umbrella', category:'osint', difficulty:'medium', points:200,
    flag:'CGS{Umbrella_1968}',
    hint:null,
    hintList:[
      'The corporation\'s logo is red and white.',
      'Founded by three people.',
      'Search official lore instead of fan theories.',
    ],
    instanceUrl:null,
    description:'Researchers found documents describing a fictional pharmaceutical corporation responsible for numerous biological disasters.\n\nIdentify the corporation and determine the year it was founded according to official lore.',
  },
  {
    title:'Spencer\'s Mansion', category:'osint', difficulty:'medium', points:200,
    flag:'CGS{Biltmore_Estate}',
    hint:null,
    hintList:[
      'Located in the United States.',
      'It is one of the largest private residences in America.',
      'Search for "real inspiration for Spencer Mansion."',
    ],
    instanceUrl:null,
    description:'Recovered architectural sketches appear to resemble a mansion from a famous survival horror game. Researchers believe it was inspired by a real historical mansion.\n\nIdentify the real mansion and submit its official name.',
  },

  // ═══ OSINT HARD ═══
  {
    title:'The Founder', category:'osint', difficulty:'hard', points:300,
    flag:'CGS{1966}',
    hint:null,
    hintList:[
      'The flower originates from Africa.',
      'It later became the basis of many viral experiments.',
      'Search the official Resident Evil timeline.',
    ],
    instanceUrl:null,
    description:'Investigators recovered notes mentioning only the initials O.E.S. and references to an ancient flower.\n\nIdentify the scientist and determine the exact year he discovered the flower that became the foundation of his life\'s work.',
  },

  // ═══ NEW OSINT CHALLENGES ═══
  {
    title:'Whitechapel Files', category:'osint', difficulty:'hard', points:300,
    flag:'CGS{Metropolitan_Police_Whitechapel_Row}',
    hint:null,
    hintList:[
      'The killer\'s identity remains officially unknown.',
      'Search historical police records rather than game lore.',
      'The answer is related to the first of the Canonical Five victims.',
      'Replace spaces with underscores.',
      'Keep official capitalization.',
    ],
    instanceUrl:null,
    description:'In a sealed archive recovered from a classified forensic laboratory, investigators discovered several fragmented reports concerning a notorious serial killer who inspired one of the most memorable antagonists in a famous AAA stealth-action video game.\n\nMost of the records have been destroyed. The only surviving note reads:\n\n"History remembers the monster. Detectives remember the streets."\n\nYour mission is to identify the real historical serial killer, determine the official name of the police division responsible for investigating the murders, and find the exact street where the first canonical victim\'s body was discovered.\n\nCombine both answers to recover the flag.\n\nFlag Format\nCGS{PoliceDivision_StreetName}',
  },
  {
    title:'Mount Massive', category:'osint', difficulty:'medium', points:200,
    flag:'CGS{42.9398,-78.8764}',
    hint:null,
    hintList:[
      'The answer isn\'t inside the game. Research what inspired the game\'s setting.',
      'The building you\'re looking for is a historic psychiatric hospital in New York State.',
      'The inspiration is the Richardson Olmsted Complex in Buffalo. Now find its precise coordinates.',
    ],
    instanceUrl:null,
    description:'A damaged notebook recovered from the challenge author\'s desk contains only one readable sentence:\n\n"My favourite horror game series is Outlast. I\'ve always wondered how close Mount Massive Asylum is to its real-world inspiration."\n\nYour mission is to identify the real-world location that inspired Mount Massive Asylum and determine its exact geographic coordinates.\n\nFlag Format:\nCGS{LATITUDE,LONGITUDE}',
  },

  // ═══ FORENSICS EASY (5) ═══
  {
    title:'Hidden in Plain Sight', category:'forensics', difficulty:'easy', points:100,
    flag:'CGS{tr41l1ng_d4t4_1s_3v3ryw3r3}',
    hint:'JPEGs end with FF D9. Check what comes after.',
    files:JSON.stringify([{name:'trailing.jpg', url:'/uploads/challenges/forensics-easy1/trailing.jpg'}]),
    instanceUrl:null,
    description:'A JPEG image has a text string appended after the EOF marker. Extract it with a hex editor or binwalk.',
  },
  {
    title:'Whitespace Secrets', category:'forensics', difficulty:'easy', points:100,
    flag:'CGS{wh1t3sp4c3_h1d3s_th1ngs}',
    hint:'Try a Stegsnow tool or view the file in a hex editor.',
    files:JSON.stringify([{name:'empty.txt', url:'/uploads/challenges/forensics-easy2/empty.txt'}]),
    instanceUrl:null,
    description:'A text file looks empty but has invisible characters (spaces and tabs) encoding a message in binary (space=0, tab=1).',
  },
  {
    title:'Reversed Image', category:'forensics', difficulty:'easy', points:100,
    flag:'CGS{byt3_0rd3r_m4tt3rs}',
    hint:'Compare the file\'s first 8 bytes to a normal PNG signature.',
    files:JSON.stringify([{name:'corrupted.png', url:'/uploads/challenges/forensics-easy3/corrupted.png'}]),
    instanceUrl:null,
    description:'A PNG file\'s header bytes are reversed, so it won\'t open normally.',
  },
  {
    title:'EXIF Explorer', category:'forensics', difficulty:'easy', points:100,
    flag:'CGS{m3t4d4t4_t3lls_st0r13s}',
    hint:'Use exiftool to dump all metadata fields.',
    files:JSON.stringify([{name:'photo.jpg', url:'/uploads/challenges/forensics-easy4/photo.jpg'}]),
    instanceUrl:null,
    description:'A photo\'s metadata contains a flag in the "Comment" field.',
  },
  {
    title:'Base64 in a PCAP', category:'forensics', difficulty:'easy', points:100,
    flag:'CGS{p4ck3ts_c4rry_s3cr3ts}',
    hint:'Filter for POST requests in Wireshark and decode the payload.',
    files:JSON.stringify([{name:'traffic.pcap', url:'/uploads/challenges/forensics-easy5/traffic.pcap'}]),
    instanceUrl:null,
    description:'A packet capture has one HTTP POST request with a Base64-encoded flag in the body.',
  },

  // ═══ FORENSICS MEDIUM (4) ═══
  {
    title:'LSB PNG', category:'forensics', difficulty:'medium', points:200,
    flag:'CGS{l345t_51gn1f1c4nt_b1t}',
    hint:'Use a Python script with PIL to extract LSBs from each pixel, then convert bits to ASCII.',
    files:JSON.stringify([{name:'image.png', url:'/uploads/challenges/forensics-medium1/image.png'}]),
    instanceUrl:null,
    description:'A PNG image hides a flag in the least significant bits of the red channel.',
  },
  {
    title:'Corrupted Header Recovery', category:'forensics', difficulty:'medium', points:200,
    flag:'CGS{z1p_h34d3r_r3p41r}',
    hint:'ZIP files start with 50 4B 03 04. Compare and fix.',
    files:JSON.stringify([{name:'archive.zip', url:'/uploads/challenges/forensics-medium2/archive.zip'}]),
    instanceUrl:null,
    description:'A ZIP file has a corrupted local file header (wrong magic bytes) that needs fixing before it will extract.',
  },
  {
    title:'Memory Dump Strings', category:'forensics', difficulty:'medium', points:200,
    flag:'CGS{m3m0ry_n3v3r_f0rg3ts}',
    hint:'Run strings on the dump and grep for "CGS{".',
    files:JSON.stringify([{name:'memory.raw', url:'/uploads/challenges/forensics-medium3/memory.raw'}]),
    instanceUrl:null,
    description:'A memory dump (.raw) contains a process running a script with the flag in an environment variable.',
  },
  {
    title:'Audio Spectrogram', category:'forensics', difficulty:'medium', points:200,
    flag:'CGS{s0und_w4v3s_h1d3_1m4g3s}',
    hint:'Open the file in Audacity or Sonic Visualiser and switch to spectrogram view.',
    files:JSON.stringify([{name:'audio.wav', url:'/uploads/challenges/forensics-medium4/audio.wav'}]),
    instanceUrl:null,
    description:'A WAV file has a flag hidden visually in its frequency spectrogram.',
  },

  // ═══ FORENSICS HARD (2) ═══
  {
    title:'Multi-Layer Steganography', category:'forensics', difficulty:'hard', points:300,
    flag:'CGS{l4y3r3d_s3cr3ts_n33d_p4t13nc3}',
    hint:null,
    hintList:[
      'Extract EXIF first, decode the GPS values as characters to get the steghide password, then extract the embedded file.',
      'The password is hidden in the image\'s EXIF GPS coordinates (decoded as ASCII).',
      'Use steghide with the extracted password to reveal the flag.',
    ],
    files:JSON.stringify([{name:'secret.jpg', url:'/uploads/challenges/forensics-hard1/secret.jpg'}]),
    instanceUrl:null,
    description:'A JPEG has a password-protected steghide payload; the password is hidden in the image\'s EXIF GPS coordinates (decoded as ASCII).',
  },
  {
    title:'Disk Image Carving', category:'forensics', difficulty:'hard', points:300,
    flag:'CGS{d3l3t3d_bu7_n0t_g0n3_f0r3v3r}',
    hint:null,
    hintList:[
      'Carve for PDFs first, then check document metadata rather than the page content.',
      'Use foremost or scalpel to recover deleted files from the disk image.',
      'The flag is inside a PDF\'s document properties, not the visible text.',
    ],
    files:JSON.stringify([{name:'disk.dd', url:'/uploads/challenges/forensics-hard2/disk.dd'}]),
    instanceUrl:null,
    description:'A raw disk image (.dd) has a deleted file with the flag. The file was deleted but not overwritten, and file carving with foremost or scalpel recovers it.',
  },

  // ═══ MISC ═══
  {
    title:'Digital Footprints', category:'misc', difficulty:'easy', points:100,
    flag:'CGS{1nk_1n_b10_7r4c3}',
    hint:'Where does an organization leave traces that aren\'t on their official website?',
    instanceUrl:null,
    description:'Every organization leaves traces of its identity across the internet. Some are loud, while others quietly exist where people choose to share moments instead of words. One of our oldest public footprints contains exactly what you\'re looking for. Observe carefully.',
  },
  {
    title:'Professional Presence', category:'misc', difficulty:'medium', points:200,
    flag:'CGS{pr0f35510n4l_f007pr1n7}',
    hint:'Look where professionals present their career history. The answer is not in the visible text.',
    instanceUrl:null,
    description:'Not every clue belongs inside a repository or website. Sometimes the most valuable information is hidden where organizations present themselves to the professional world. Read everything\u2014not just the headlines.',
  },
  {
    title:'Status Message', category:'misc', difficulty:'easy', points:100,
    flag:'CGS{5747u5_kn0w5_411}',
    hint:'A single line can reveal more than an entire conversation. Check platforms where short updates are the norm.',
    instanceUrl:null,
    description:'Some messages aren\'t sent directly\u2014they simply wait to be noticed. A single line can reveal more than an entire conversation. Look beyond the obvious.',
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

const getHints = (hint: string | null, hintList?: string[]): string | null => {
  if (hintList && hintList.length > 0) return JSON.stringify(hintList.map(h => ({ text: h, penalty: 0 })))
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
        hints: getHints(c.hint, c.hintList),
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
        hints: getHints(c.hint, c.hintList),
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
