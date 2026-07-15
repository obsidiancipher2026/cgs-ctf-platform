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
  files?: string | null; instanceUrl?: string | null; instanceType?: string | null;
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
  {
    title:'Memory Lane', category:'forensics', difficulty:'hard', points:300,
    flag:'CGS{v0l4t1l1ty_n3v3r_f0rg3ts}',
    hint:null,
    hintList:[
      'Use volatility or strings to extract readable text from the memory dump.',
      'Search for the CGS flag format directly in the extracted strings.',
      'The flag is embedded in a process environment variable or command-line argument.',
    ],
    files:JSON.stringify([{name:'memory.raw', url:'/uploads/challenges/forensics-hard3/memory.raw'}]),
    instanceUrl:null,
    description:'A raw memory dump (.raw) from a Linux system. The computer forgot to forget. A process left sensitive data in memory that was never written to disk. Use Volatility or strings analysis to recover the flag from the dead process memory.',
  },
  {
    title:'Decrypted Wire', category:'forensics', difficulty:'hard', points:300,
    flag:'CGS{tls_k3ys_unl0ck_th3_w1r3}',
    hint:null,
    hintList:[
      'The SSLKEYLOG file contains TLS session keys that Wireshark can use for decryption.',
      'In Wireshark, go to Edit > Preferences > Protocols > TLS and set the (Pre)-Master-Secret log filename.',
      'After loading the key log, follow the TLS stream to find the HTTP response with the flag.',
    ],
    files:JSON.stringify([
      {name:'traffic.pcap', url:'/uploads/challenges/forensics-hard4/traffic.pcap'},
      {name:'sslkeylog.log', url:'/uploads/challenges/forensics-hard4/sslkeylog.log'},
    ]),
    instanceUrl:null,
    description:'A packet capture of a TLS-encrypted session between a client and server. The lock and the key were shipped separately, on purpose. An SSLKEYLOG file was leaked alongside the capture. Load it in Wireshark to decrypt the session and recover the flag from the HTTP response body.',
  },
  {
    title:'Deep Carve', category:'forensics', difficulty:'hard', points:300,
    flag:'CGS{d33p_c4rv1ng_f1nds_fr4gm3nt5}',
    hint:null,
    hintList:[
      'The disk image has a deleted file with a known signature (PNG magic bytes: 89 50 4E 47).',
      'The file is not in one contiguous block - its data is scattered across non-contiguous clusters.',
      'Use foremost or scalpel with raw disk carving mode. If the output is corrupted, check the FAT for cluster allocation.',
    ],
    files:JSON.stringify([{name:'disk.dd', url:'/uploads/challenges/forensics-hard5/disk.dd'}]),
    instanceUrl:null,
    description:'A raw disk image with a deleted file whose data blocks are scattered across non-contiguous clusters. The pieces aren\'t next to each other. That\'s the point. You\'ll need to reconstruct the file from its fragments before extracting the flag.',
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

  // ═══ MISC EASY ═══
  {
    title:'The Forgotten Repository', category:'misc', difficulty:'easy', points:100,
    flag:'CGS{0p3n_50urc3_hun73r}',
    hint:'Developers sometimes leave sensitive information in public repositories. Check the commit history or file contents.',
    instanceUrl:null,
    description:'Not everything is hidden behind encryption. Sometimes developers leave things where only the curious bother to look.',
  },

  // ═══ MISC MEDIUM ═══
  {
    title:'Hidden Announcement', category:'misc', difficulty:'medium', points:200,
    flag:'CGS{p45t5_n3v3r_d13}',
    hint:'Some information is posted publicly but only once. Check archived or historical posts.',
    instanceUrl:null,
    description:'Some announcements are made once and then forgotten. Search through our public timeline carefully; the answer hasn\'t moved.',
  },

  // ═══ CRYPTO EASY (8) ═══
  {
    title:'Caesar\'s Ghost', category:'crypto', difficulty:'easy', points:100,
    flag:'CGS{sh1ft_h4pp3ns}',
    hint:'The shift is not 13 (ROT13). Try other shifts.',
    files:JSON.stringify([{name:'ciphertext.txt', url:'/uploads/challenges/crypto-easy1/ciphertext.txt'}]),
    instanceUrl:null,
    description:'A mysterious message was found encrypted with a classical cipher. The sender claims it\'s unbreakable, but they used a simple substitution that shifts each letter. Julius liked round numbers, but this one\'s off by a coin flip. Can you recover the plaintext?',
  },
  {
    title:'XOR Marks the Spot', category:'crypto', difficulty:'easy', points:100,
    flag:'CGS{s1ngl3_byt3_x0r_1s_n0_l0ck}',
    hint:'Try XORing with every possible single byte (0x00-0xFF) until readable text appears.',
    files:JSON.stringify([{name:'xor_ciphertext.txt', url:'/uploads/challenges/crypto-easy2/xor_ciphertext.txt'}]),
    instanceUrl:null,
    description:'An encrypted message was intercepted. The encryption used a single-byte XOR key — the same byte was XORed with every character of the plaintext. One key, many doors, only one fits without breaking the lock. Find the key and decrypt the message.',
  },
  {
    title:'Encoding Onion', category:'crypto', difficulty:'easy', points:100,
    flag:'CGS{layer5_0f_3nc0d1ng_p33l_off}',
    hint:'The flag was encoded multiple times. Work backwards from the outside in.',
    files:JSON.stringify([{name:'encoded.txt', url:'/uploads/challenges/crypto-easy3/encoded.txt'}]),
    instanceUrl:null,
    description:'A developer encrypted a secret before posting it publicly. They said "I layered it for security." The data has been through multiple encoding transforms stacked on top of each other. It\'s dressed for three different parties, one on top of the other. Peel back each layer to find the flag.',
  },
  {
    title:'Mirror Cipher', category:'crypto', difficulty:'easy', points:100,
    flag:'CGS{atb45h_1s_1ts_0wn_1nv3rs3}',
    hint:'Atbash maps A->Z, B->Y, C->X, etc. Applying it twice returns the original.',
    files:JSON.stringify([{name:'ciphertext.txt', url:'/uploads/challenges/crypto-easy4/ciphertext.txt'}]),
    instanceUrl:null,
    description:'An ancient cipher was recovered from a classified archive. The encryption maps each letter to its "mirror" in the alphabet — A becomes Z, B becomes Y, and so on. This cipher undoes itself if you just do it again. Can you reverse it?',
  },
  {
    title:'Key of Four', category:'crypto', difficulty:'easy', points:100,
    flag:'CGS{v1g3n3r3_w1th_a_sh0rt_k3y}',
    hint:'The key is short (3-4 characters) and hinted in the challenge description.',
    files:JSON.stringify([{name:'ciphertext.txt', url:'/uploads/challenges/crypto-easy5/ciphertext.txt'}]),
    instanceUrl:null,
    description:'A Vigenère cipher was used to encrypt a secret message. The key is shorter than you\'d expect — only 3-4 characters long. The key repeats cyclically throughout the message. A hint about the key is hidden in the challenge context. Can you crack it?',
  },
  {
    title:'Radio Silence', category:'crypto', difficulty:'easy', points:100,
    flag:'CGS{m0rs3_c0d3_st1ll_w0rk5}',
    hint:'Decode the Morse code: dots (.) and dashes (-) representing characters.',
    files:JSON.stringify([{name:'morse.txt', url:'/uploads/challenges/crypto-easy6/morse.txt'}]),
    instanceUrl:null,
    description:'A radio transmission was intercepted during a routine spectrum monitoring session. The message appears to be encoded in International Morse Code — dots and dashes used to carry every message. Download the intercepted signal and decode the Morse code to recover the flag.',
  },
  {
    title:'Rotated Further', category:'crypto', difficulty:'easy', points:100,
    flag:'CGS{r0t47_g03s_p4st_l3tt3rs}',
    hint:'ROT47 rotates the full printable ASCII range (33-126), not just letters.',
    files:JSON.stringify([{name:'ciphertext.txt', url:'/uploads/challenges/crypto-easy7/ciphertext.txt'}]),
    instanceUrl:null,
    description:'Another rotation cipher, but this one rotates more than just the alphabet. It shifts the entire printable ASCII range — from exclamation mark to tilde. It rotates more than just the alphabet this time. Can you undo the rotation?',
  },
  {
    title:'Rainbow\'s End', category:'crypto', difficulty:'easy', points:100,
    flag:'CGS{md5_h4sh3s_ar3nt_s3cr3ts}',
    hint:'The hash has already been cracked by someone, somewhere. Use an online rainbow table.',
    instanceUrl:null,
    description:'A developer stored a secret by hashing it with MD5, believing it was secure. But this hash has already been cracked by someone, somewhere, before you. MD5 hashes of common words are readily available in rainbow tables. Find the original plaintext that produces this hash: 5f4dcc3b5aa765d61d8327deb882cf99',
  },

  // ═══ CRYPTO MEDIUM (8) ═══
  {
    title:'RSA\'s Small Mistake', category:'crypto', difficulty:'medium', points:200,
    flag:'CGS{fact0r1ng_sm4ll_pr1m3s_1s_ch34p}',
    hint:'Factor n into p and q, then compute the private exponent.',
    files:JSON.stringify([{name:'rsa_params.txt', url:'/uploads/challenges/crypto-medium1/rsa_params.txt'}]),
    instanceUrl:null,
    description:'An RSA-encrypted message was intercepted. The public key looks normal, but the primes used to generate n are suspiciously small. Even giants trip on small stones. Factor n to recover the private key and decrypt the message.',
  },
  {
    title:'Frequency Fumble', category:'crypto', difficulty:'medium', points:200,
    flag:'CGS{v1g3n3r3_k3y_l3ngth_l34k5}',
    hint:'Use Kasiski examination to find the key length, then frequency analysis for each shift.',
    files:JSON.stringify([{name:'ciphertext.txt', url:'/uploads/challenges/crypto-medium2/ciphertext.txt'}]),
    instanceUrl:null,
    description:'A long message was encrypted with a Vigenère cipher using an unknown key. Patterns repeat when the key is shorter than the message. Use Kasiski examination or the Index of Coincidence to determine the key length, then crack each Caesar shift independently.',
  },
  {
    title:'Penguin Problem', category:'crypto', difficulty:'medium', points:200,
    flag:'CGS{3cb_m0d3_l34k5_p4tt3rns}',
    hint:'ECB mode encrypts identical blocks to identical ciphertext. Look at the pattern.',
    files:JSON.stringify([
      {name:'penguin_original.bmp', url:'/uploads/challenges/crypto-medium3/penguin_original.bmp'},
      {name:'challenge_note.txt', url:'/uploads/challenges/crypto-medium3/challenge_note.txt'},
    ]),
    instanceUrl:null,
    description:'An image was encrypted using AES in ECB mode. Encrypted doesn\'t mean the shapes disappear. In ECB mode, identical plaintext blocks produce identical ciphertext blocks, preserving visual patterns. Examine the encrypted output to identify the hidden structure.',
  },
  {
    title:'Padding Oracle Lite', category:'crypto', difficulty:'medium', points:200,
    flag:'CGS{th3_3rr0r_t0ld_0n_1ts3lf}',
    hint:'Send modified ciphertext and observe whether the server returns a padding error.',
    instanceUrl:'/standalone/padding-oracle-lite', instanceType:'web',
    description:'A web endpoint decrypts AES-CBC ciphertext and returns different error messages for invalid padding vs. invalid data. The error message is more honest than it means to be. Use the padding oracle to decrypt the flag byte by byte.',
  },
  {
    title:'Same Prefix, Different Story', category:'crypto', difficulty:'medium', points:200,
    flag:'CGS{md5_c0ll1s10ns_ar3_r34l}',
    hint:'Two files with different content share the same MD5 hash. Inspect file B.',
    files:JSON.stringify([
      {name:'file_a.txt', url:'/uploads/challenges/crypto-medium5/file_a.txt'},
      {name:'file_b.txt', url:'/uploads/challenges/crypto-medium5/file_b.txt'},
    ]),
    instanceUrl:null,
    description:'Two different files were provided, each claiming to contain important data. Two different things can wear the same fingerprint. Verify that both files produce the same MD5 hash, then examine file B to find the hidden flag.',
  },
  {
    title:'Predictable Dice', category:'crypto', difficulty:'medium', points:200,
    flag:'CGS{w34k_prng_s33d5_ar3_gu355abl3}',
    hint:'The PRNG was seeded with a Unix timestamp. Reproduce the seed to regenerate the token.',
    files:JSON.stringify([{name:'token.txt', url:'/uploads/challenges/crypto-medium6/token.txt'}]),
    instanceUrl:null,
    description:'A web application generates session tokens using a PRNG seeded with the current Unix timestamp. It rolled the dice, but the dice remember what time it was. Given the generation time and the token, reproduce the PRNG sequence to predict the next token and unlock the flag.',
  },
  {
    title:'Secret\'s Not So Secret', category:'crypto', difficulty:'medium', points:200,
    flag:'CGS{w34k_jwt_s3cr3ts_g3t_cr4ck3d}',
    hint:'The JWT secret is a short common word. Try a dictionary attack with hashcat or jwt_tool.',
    files:JSON.stringify([{name:'token.jwt', url:'/uploads/challenges/crypto-medium7/token.jwt'}]),
    instanceUrl:null,
    description:'A JSON Web Token was intercepted from an authentication flow. The token is signed with HS256, but the signing secret is weak and short. The signature is only as strong as the word behind it. Crack the secret offline and forge an admin token to reveal the flag.',
  },
  {
    title:'Mode Matters', category:'crypto', difficulty:'medium', points:200,
    flag:'CGS{cbc_w1th0ut_1v_1s_r1sky}',
    hint:'Two messages encrypted with the same IV and key. XOR the ciphertexts to get XOR of plaintexts.',
    files:JSON.stringify([{name:'ciphertexts.txt', url:'/uploads/challenges/crypto-medium8/ciphertexts.txt'}]),
    instanceUrl:null,
    description:'Two messages were encrypted using AES-CBC with the same key and the same initialization vector. Using the same starting point twice tells you more than it should. XOR the ciphertexts together to isolate the difference between the two plaintexts.',
  },

  // ═══ CRYPTO HARD (8) ═══
  {
    title:'Lattice of Lies', category:'crypto', difficulty:'hard', points:300,
    flag:'CGS{l4tt1c3_r3duct10n_br34ks_w34k_k3ys}',
    hint:'Two ciphertexts share the same modulus n. Use the extended Euclidean algorithm on e1 and e2.',
    files:JSON.stringify([{name:'rsa_common.txt', url:'/uploads/challenges/crypto-hard1/rsa_common.txt'}]),
    instanceUrl:null,
    description:'Two RSA ciphertexts were encrypted with the same modulus but different public exponents. The numbers are polite until you rearrange the furniture. If the exponents are coprime, you can recover the plaintext without factoring n. This is the common modulus attack.',
  },
  {
    title:'Wiener\'s Whisper', category:'crypto', difficulty:'hard', points:300,
    flag:'CGS{sm4ll_pr1v4t3_3xp0n3nts_ar3_d4ng3r0us}',
    hint:'The private exponent d is very small. Use continued fractions on e/n.',
    files:JSON.stringify([{name:'rsa_wiener.txt', url:'/uploads/challenges/crypto-hard2/rsa_wiener.txt'}]),
    instanceUrl:null,
    description:'An RSA key was generated with an unusually small private exponent. The private key was in a hurry to be small. When d < n^(1/4)/3, Wiener\'s attack using continued fraction expansion of e/n efficiently recovers d.',
  },
  {
    title:'Flip the Bit', category:'crypto', difficulty:'hard', points:300,
    flag:'CGS{b1t_fl1pp1ng_cbc_1s_p0w3rful}',
    hint:'In CBC mode, flipping a ciphertext byte flips the corresponding plaintext byte in the next block.',
    files:JSON.stringify([{name:'cookie.txt', url:'/uploads/challenges/crypto-hard3/cookie.txt'}]),
    instanceUrl:'/standalone/flip-the-bit', instanceType:'web',
    description:'A web application encrypts session cookies using AES-CBC. Change one block, and the next one changes in a way you can predict. Flip specific bits in the ciphertext to change "admin=false" to "admin=true" in the decrypted cookie.',
  },
  {
    title:'Partial Exposure', category:'crypto', difficulty:'hard', points:300,
    flag:'CGS{l34k1ng_h4lf_a_k3y_1s_3n0ugh}',
    hint:'The top half of the private exponent is leaked. Use Coppersmith\'s method or lattice reduction.',
    files:JSON.stringify([{name:'rsa_partial.txt', url:'/uploads/challenges/crypto-hard4/rsa_partial.txt'}]),
    instanceUrl:null,
    description:'An RSA private key was partially compromised — the top half of the private exponent d was leaked. You don\'t need the whole secret if you already know most of it. Use lattice-based partial key recovery to find the remaining bits.',
  },
  {
    title:'Small Curve, Big Problem', category:'crypto', difficulty:'hard', points:300,
    flag:'CGS{w34k_curv3s_h4v3_sm4ll_0rd3rs}',
    hint:'The elliptic curve has a small group order. Brute-force all possible private keys.',
    files:JSON.stringify([{name:'curve_params.txt', url:'/uploads/challenges/crypto-hard5/curve_params.txt'}]),
    instanceUrl:null,
    description:'An elliptic curve was deliberately chosen with a small group order. Some curves don\'t have enough room to hide a secret in. The private key can be recovered by testing all possible values from 1 to the curve order using the public key point.',
  },
  {
    title:'Format Preserved, Security Not', category:'crypto', difficulty:'hard', points:300,
    flag:'CGS{fp3_1sn\'t_4lway5_5tr0ng3c}',
    hint:'The Feistel network uses a weak key schedule. Analyze the round keys.',
    files:JSON.stringify([{name:'fpe_challenge.txt', url:'/uploads/challenges/crypto-hard6/fpe_challenge.txt'}]),
    instanceUrl:null,
    description:'A payment processor uses format-preserving encryption to protect card numbers. It kept the shape of the secret, not the strength of it. The Feistel network uses a weak key derivation that can be reversed. Analyze the encrypted values to recover the flag.',
  },
  {
    title:'Timing Tells', category:'crypto', difficulty:'hard', points:300,
    flag:'CGS{c0mp4r1s0n_t1m1ng_l34ks_byt3s}',
    hint:'The server compares strings byte-by-byte with early exit. Measure response times.',
    instanceUrl:'/standalone/timing-tells', instanceType:'web',
    description:'A login endpoint compares your input against a secret token byte-by-byte. It answers a little faster when you\'re getting warmer. The non-constant-time comparison leaks information through response timing. Measure timing differences to recover the secret one character at a time.',
  },
  {
    title:'Oracle, Full Session', category:'crypto', difficulty:'hard', points:300,
    flag:'CGS{full_p4dd1ng_0r4cl3_r3c0v3rs_3v3ryth1ng}',
    hint:'This is a complete padding oracle attack across multiple blocks. Script the full recovery.',
    instanceUrl:'/standalone/oracle-full-session', instanceType:'web',
    description:'A web application decrypts AES-CBC ciphertext and leaks padding validity through error messages. Ask it enough small yes-or-no questions and it eventually says everything. Implement a full multi-round padding oracle attack to recover the entire encrypted flag across all blocks.',
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
        instanceType: c.instanceType !== undefined ? c.instanceType : getInstanceType(c.category),
        hintPenalty: 0,
        hints: getHints(c.hint, c.hintList),
        bloodAwarded: false,
        firstSolverUserId: null,
        firstBloodTimestamp: null,
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
        instanceType: c.instanceType !== undefined ? c.instanceType : getInstanceType(c.category),
        hintPenalty: 0,
        hints: getHints(c.hint, c.hintList),
        bloodAwarded: false,
        firstSolverUserId: null,
        firstBloodTimestamp: null,
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
