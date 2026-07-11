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
  // ═══════════════════════════════ WEB ═══════════════════════════════
  // ── Easy ──
  {
    title: 'Hidden in Plain Sight',
    description: 'Our new landing page looks empty, but our server never stops talking. Take a closer look at what it says when nobody\'s watching the screen.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{h34d3rs_h1d3_th1ngs_t00}',
    hint: 'Sometimes the answer isn\'t in the room, it\'s in the envelope.',
    instanceUrl: null,
  },
  {
    title: 'Cookie Jar',
    description: 'Guests get in easy. Admins get more. The site trusts whatever you tell it, as long as you say it the right way.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{c00k13s_ar3nt_j5t_f0r_b4k1ng}',
    hint: 'Trust, but decode.',
    instanceUrl: null,
  },
  {
    title: 'View Source',
    description: 'Our new VaultCore security portal is live. The developers claim it\'s completely secure. See if you can find any secrets hidden in the source code.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{m1n1f13d_d03snt_m34n_h1dd3n}',
    hint: 'The browser loads more than what you see on screen. Check what files are being requested.',
    instanceUrl: null,
  },
  {
    title: 'Guest vs Admin',
    description: 'The dashboard treats guests and administrators very differently. The difference is just a question of what you carry in your pocket.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{r0l3_b4s3d_4cc3ss_1s_just_b3l13f}',
    hint: 'What you carry defines who you are.',
    instanceUrl: null,
  },
  {
    title: 'Path as a Parameter',
    description: 'A file viewer that takes filenames from the URL. It claims it only serves from a safe directory.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{s4mpl3_4pp_l34ks_f1l3s}',
    hint: 'When the app adds a folder, you can always go back.',
    instanceUrl: null,
  },
  {
    title: 'API Rate Limit Race',
    description: 'The API rate limiter blocks too many requests from the same source. But the implementation has a small window of opportunity.',
    category: 'web', difficulty: 'easy', points: 100,
    flag: 'CGS{r4c3_th3_l1m1t_y0u_w1n}',
    hint: 'Patience is a virtue, but speed is a weapon.',
    instanceUrl: null,
  },
  // ── Medium ──
  {
    title: 'SQLi Speakeasy',
    description: 'This login form is older than it looks and trusts input a little too much.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{uni0n_s3l3ct_y0ur_w4y_1n}',
    hint: 'Ask it a question it wasn\'t trained to refuse.',
    instanceUrl: null,
  },
  {
    title: 'Path Less Traveled',
    description: 'This file viewer only wants you looking at its own folder. It doesn\'t check very hard.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{p4th_tr4v3rs4l_1s_a_cl4ss1c}',
    hint: 'Every road leads back if you know how to walk backward.',
    instanceUrl: null,
  },
  {
    title: 'Blind SQLi',
    description: 'The search feature tells you when something exists. It never shows you the data itself, but it\'s remarkably honest about yes and no.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{bl1nd_1nputs_st1ll_sp34k_l0udly}',
    hint: 'The truth is binary, you just have to ask enough questions.',
    instanceUrl: null,
  },
  {
    title: 'NoSQL Injection',
    description: 'This modern API uses a flexible database and trusts JSON just a bit too generously.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{n0sql_1nj3ct_1s_th3_n3w_sql}',
    hint: 'Sometimes the query operator is the password.',
    instanceUrl: null,
  },
  {
    title: 'SSTI',
    description: 'The feedback page renders your name with {{curly braces}}. That should be safe.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{t3mpl4t3s_d0nt_3sc4p3_3v3ryth1ng}',
    hint: 'The curly braces are a feature, not a bug.',
    instanceUrl: null,
  },
  {
    title: 'Open Redirect',
    description: 'This site has a nice "Continue to partner site" feature. It takes a URL parameter and trusts it completely.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{0p3n_r3d1r3ct_n0t_just_f1sh1ng}',
    hint: 'The path forward leads somewhere unexpected.',
    instanceUrl: null,
  },
  {
    title: 'CORS Misconfig',
    description: 'The internal API returns sensitive user data. It trusts any origin that asks nicely.',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{c0rs_th1nk1ng_y0u_c4n_r34d}',
    hint: 'The server doesn\'t care where the request came from.',
    instanceUrl: null,
  },
  {
    title: 'IDOR',
    description: 'The invoice page uses sequential IDs. Users can only see their own invoices — or can they?',
    category: 'web', difficulty: 'medium', points: 250,
    flag: 'CGS{d1r3ct_0bj3ct_r3f3r3nc3_byp4ss}',
    hint: 'The number on the URL is just a suggestion.',
    instanceUrl: null,
  },
  // ── Hard ──
  {
    title: 'SSRF to the Crown Jewels',
    description: 'This app is happy to fetch images from anywhere you tell it to. It doesn\'t ask why you\'d want it to look somewhere... internal.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{m3t4d4t4_s3rv1c3s_tru5t_t00_much}',
    hint: 'It fetches for you, it just doesn\'t ask where \'you\' really are.',
    instanceUrl: null,
  },
  {
    title: 'XSS to Admin',
    description: 'A stored comment field reflects user input. The admin bot reads every new comment.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{xss_th3_adm1ns_c00k13_pl34s3}',
    hint: 'The admin sees what you see. Make it worth their visit.',
    instanceUrl: null,
  },
  {
    title: 'Prototype Pollution',
    description: 'A Node.js app merges user JSON into internal objects. The merge utility doesn\'t check what keys you\'re setting.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{pr0t0typ3_p0llut10n_1s_s3lf_m0d1fy}',
    hint: 'The blueprint of every object can be rewritten by anyone who touches it.',
    instanceUrl: null,
  },
  {
    title: 'JWT Algorithm Confusion',
    description: 'The server uses RS256 to sign tokens. But the verification library lets you choose the algorithm.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{jwt_alg_n0n3_byp4ss_l34ds_t0_rce}',
    hint: 'If the token says it\'s HMAC, the server might believe it with the public key.',
    instanceUrl: null,
  },
  {
    title: 'CSRF Token Bypass',
    description: 'The CSRF protection uses a token stored in a cookie that is also sent with every request.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{csrf_byp4ss_w1th_c00k13_s3cr3ts}',
    hint: 'The cookie thinks it\'s a fortress, but it\'s the key to the gate.',
    instanceUrl: null,
  },
  {
    title: 'XXE',
    description: 'The XML parser accepts document uploads. It\'s configured to process external entities.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{xxe_st1ll_w0rks_1n_2k24}',
    hint: 'The XML document can include content from anywhere it wants.',
    instanceUrl: null,
  },
  {
    title: 'Race Condition',
    description: 'The coupon redemption system checks the balance and then deducts. Between those two steps, anything can happen.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{r4c3_c0nd1t10n_d0ubl3_sp3nd}',
    hint: 'The gap between checking and spending is all the room you need.',
    instanceUrl: null,
  },
  {
    title: 'Cache Poisoning',
    description: 'The CDN caches responses based on URL and headers. If you can make it cache the wrong response, everyone who follows will see what you want them to see.',
    category: 'web', difficulty: 'hard', points: 450,
    flag: 'CGS{p01s0n_th3_c4ch3_t0_w1n_th3_g4m3}',
    hint: 'What the cache remembers, the world inherits.',
    instanceUrl: null,
  },

  // ═══════════════════ Document Challenges (30) ═══════════════════
  // ── Easy (10) ──
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
  // ── Medium (10) ──
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
    title: 'Path Less Traveled',
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
  // ── Hard (10) ──
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

  // ═══════════════════════════ FORENSICS ═══════════════════════════
  // ── Easy ──
  {
    title: 'Metadata Whisper',
    description: 'This photo was taken during a CGS field trip. The image looks ordinary, but cameras remember more than what\'s in frame.',
    category: 'forensics', difficulty: 'easy', points: 100,
    flag: 'CGS{3x1f_kn0ws_wh3r3_y0u_b33n}',
    hint: 'The picture tells a story the eyes can\'t read.',
    files: JSON.stringify([{name:'photo.png'},{name:'generate.py'}]),
  },
  {
    title: 'Zip of Secrets',
    description: 'We recovered this archive from an old backup drive. It\'s locked, but not with much imagination.',
    category: 'forensics', difficulty: 'easy', points: 100,
    flag: 'CGS{p4ssw0rd_w4s_1n_th3_w0rdl1st}',
    hint: 'The lock looks strong until you ask it nicely.',
    files: JSON.stringify([{name:'secret.zip'},{name:'create.py'}]),
  },
  {
    title: 'Not-a-Virus',
    description: 'The EDR flagged this executable as suspicious, but the actual payload is hidden in plain sight within the binary\'s strings.',
    category: 'forensics', difficulty: 'easy', points: 100,
    flag: 'CGS{str1ngs_n0t_just_f0r_b1n4r13s}',
    hint: 'Not all text is code.',
    files: JSON.stringify([{name:'sample.exe'},{name:'generate.py'}]),
  },
  {
    title: 'Hidden in Plain Text',
    description: 'This text file looks completely ordinary. But someone used a trick — invisible characters — to hide a secret message between the lines.',
    category: 'forensics', difficulty: 'easy', points: 100,
    flag: 'CGS{1nv1s1bl3_ch4rs_4r3_v1s1bl3_t00}',
    hint: 'The spaces aren\'t all empty.',
    files: JSON.stringify([{name:'message.txt'},{name:'generate.py'}]),
  },
  {
    title: 'Image Dimensions Mismatch',
    description: 'This PNG image refuses to display correctly. The viewer shows a blank canvas, but the raw data tells a different story.',
    category: 'forensics', difficulty: 'easy', points: 100,
    flag: 'CGS{1hdr_h1d3s_m0r3_th4n_h31ght}',
    hint: 'The image knows its real size, but it\'s not telling the whole truth.',
    files: JSON.stringify([{name:'corrupted.png'},{name:'generate.py'}]),
  },
  {
    title: 'File Signature Maze',
    description: 'We found a file with the extension .dat. It doesn\'t open in anything, but its header bytes hint at its real identity.',
    category: 'forensics', difficulty: 'easy', points: 100,
    flag: 'CGS{m4g1c_byt3s_n3v3r_l13_4b0ut_f1l3s}',
    hint: 'The extension is a suggestion. The first bytes are the truth.',
    files: JSON.stringify([{name:'mystery.dat'},{name:'generate.py'}]),
  },
  {
    title: 'Base64 Everywhere',
    description: 'Somebody \'encrypted\' a secret by encoding it over and over again with the same algorithm.',
    category: 'forensics', difficulty: 'easy', points: 100,
    flag: 'CGS{l4y3rs_0f_b64_1s_n0t_3ncrypt10n}',
    hint: 'Peel the onion one layer at a time.',
    files: JSON.stringify([{name:'secret.txt'},{name:'generate.py'}]),
  },
  {
    title: 'Discord Leak',
    description: 'Someone posted a screenshot of a supposed "top secret" message on Discord. The image was cropped, but not carefully enough.',
    category: 'forensics', difficulty: 'easy', points: 100,
    flag: 'CGS{d1sc0rd_l34ks_h4pp3n_3v3ry_d4y}',
    hint: 'Sometimes what\'s outside the crop matters.',
    files: JSON.stringify([{name:'discord_screenshot.png'},{name:'generate.py'}]),
  },
  // ── Medium ──
  {
    title: 'Packet Whodunit',
    description: 'Somebody sent something over the wire during this capture window. Wireshark remembers conversations, not just packets.',
    category: 'forensics', difficulty: 'medium', points: 250,
    flag: 'CGS{tcp_str34ms_r3m3mb3r_3v3ryth1ng}',
    hint: 'The conversation happened, you just weren\'t listening at the right layer.',
    files: JSON.stringify([{name:'capture.pcap'},{name:'create.py'}]),
  },
  {
    title: 'Steg-anography',
    description: 'This image looks completely normal at a glance. Somebody hid something in the parts nobody usually looks at.',
    category: 'forensics', difficulty: 'medium', points: 250,
    flag: 'CGS{l0w3st_b1ts_h1d3_th3_m0st}',
    hint: 'The picture isn\'t lying, it\'s just not telling everything at once.',
    files: JSON.stringify([{name:'stego.png'},{name:'embed.py'}]),
  },
  {
    title: 'Document Forensics',
    description: 'A Word document was leaked, but the visible text is just filler. The real clues are hiding in the file\'s metadata and embedded objects.',
    category: 'forensics', difficulty: 'medium', points: 250,
    flag: 'CGS{0l3_0bj3cts_l34k_m0r3_th4n_t3xt}',
    hint: 'The document has layers of history that most viewers skip.',
    files: JSON.stringify([{name:'document.docx'},{name:'generate.py'}]),
  },
  {
    title: 'PDF Puzzle',
    description: 'This PDF has multiple layers and hidden text. The page looks empty, but the content is there — just invisible.',
    category: 'forensics', difficulty: 'medium', points: 250,
    flag: 'CGS{pdf_l4y3rs_c4n_b3_str3am3d}',
    hint: 'Not everything visible is text, and not everything invisible is missing.',
    files: JSON.stringify([{name:'puzzle.pdf'},{name:'generate.py'}]),
  },
  {
    title: 'Registry Analysis',
    description: 'A Windows system was compromised, and the investigators found a suspicious registry hive. Somewhere in the keys is the evidence.',
    category: 'forensics', difficulty: 'medium', points: 250,
    flag: 'CGS{r3g1stry_k3ys_c0nt41n_s3cr3ts}',
    hint: 'Windows remembers everything you tell it, even if you wish it wouldn\'t.',
    files: JSON.stringify([{name:'NTUSER.DAT'},{name:'generate.py'}]),
  },
  {
    title: 'Traffic Analysis',
    description: 'We captured network traffic from a known malware sandbox. Somewhere in this pcap, the malware called home.',
    category: 'forensics', difficulty: 'medium', points: 250,
    flag: 'CGS{c2_tr4ff1c_l00ks_l1k3_n0rm4l_n01s3}',
    hint: 'The beacon hides among the noise. Find the pattern.',
    files: JSON.stringify([{name:'malware_capture.pcap'},{name:'generate.py'}]),
  },
  {
    title: 'Browser History Exfiltration',
    description: 'A suspect\'s browser history database was recovered. The browsing data reveals more than just visited sites.',
    category: 'forensics', difficulty: 'medium', points: 250,
    flag: 'CGS{br0ws3r_h1st0ry_t3lls_3v3ryth1ng}',
    hint: 'Your browser writes everything down, even when you\'re offline.',
    files: JSON.stringify([{name:'history.db'},{name:'generate.py'}]),
  },
  {
    title: 'USB Data Exfiltration',
    description: 'A Rubber Ducky script was recovered. The keystrokes simulate a user copying data to a USB drive.',
    category: 'forensics', difficulty: 'medium', points: 250,
    flag: 'CGS{ducky_scr1pt_exf1ltrat3s_d4ta}',
    hint: 'The keystrokes don\'t belong to a person.',
    files: JSON.stringify([{name:'payload.txt'},{name:'generate.py'}]),
  },
  // ── Hard ──
  {
    title: 'Memory Lane',
    description: 'We caught this snapshot mid-process. Whatever that process was holding onto, it\'s still holding on.',
    category: 'forensics', difficulty: 'hard', points: 450,
    flag: 'CGS{v0l4t1l1ty_n3v3r_f0rg3ts}',
    hint: 'The computer forgot to forget.',
    files: JSON.stringify([{name:'dump.bin'},{name:'create_dump.py'}]),
  },
  {
    title: 'Disk Image Analysis',
    description: 'A forensic image of a compromised server was taken. The rootkit hid files in unallocated space.',
    category: 'forensics', difficulty: 'hard', points: 450,
    flag: 'CGS{d1sk_1m4g3_rcv3ry_un4ll0c4t3d}',
    hint: 'Deleted doesn\'t mean gone.',
    files: JSON.stringify([{name:'disk_image.dd'},{name:'generate.py'}]),
  },
  {
    title: 'Packet Reconstruction',
    description: 'HTTP traffic was captured but the files were transferred in fragments across multiple packets. Reassemble the stream to recover the document.',
    category: 'forensics', difficulty: 'hard', points: 450,
    flag: 'CGS{r3c0nstruct1ng_fr4gm3nt3d_f1l3s}',
    hint: 'The pieces are all there, just out of order.',
    files: JSON.stringify([{name:'fragmented.pcap'},{name:'generate.py'}]),
  },
  {
    title: 'Stego with Deep Learning',
    description: 'An image contains hidden data embedded using a neural network-based steganography technique. Traditional LSB tools won\'t detect it.',
    category: 'forensics', difficulty: 'hard', points: 450,
    flag: 'CGS{n3ur4l_st3g0_h1d3s_d33ply}',
    hint: 'The neural net learned to hide where humans never look.',
    files: JSON.stringify([{name:'deep_stego.png'},{name:'generate.py'}]),
  },
  {
    title: 'SQLite WAL Forensics',
    description: 'A SQLite database was deleted, but the Write-Ahead Log survived. The database remembered everything.',
    category: 'forensics', difficulty: 'hard', points: 450,
    flag: 'CGS{w4l_f1l3s_p3rs1st_4ft3r_d3l3t10n}',
    hint: 'The database\'s memory outlives the database itself.',
    files: JSON.stringify([{name:'database.db-wal'},{name:'generate.py'}]),
  },
  {
    title: 'Browser Cache Reconstruction',
    description: 'A browser cache folder was recovered. Among the cached resources is a partially loaded message.',
    category: 'forensics', difficulty: 'hard', points: 450,
    flag: 'CGS{c4ch3d_p4g3s_c4n_b3_r3c0v3r3d}',
    hint: 'The browser saves everything it downloads, even fragments.',
    files: JSON.stringify([{name:'cache_folder.zip'},{name:'generate.py'}]),
  },
  {
    title: 'Encrypted Container Analysis',
    description: 'A VeraCrypt container was found. The password was weak and the hash was recoverable.',
    category: 'forensics', difficulty: 'hard', points: 450,
    flag: 'CGS{v3r4cr1pt_w34k_p4ssw0rd_cr4ck3d}',
    hint: 'The container is locked, but the key is guessable.',
    files: JSON.stringify([{name:'secret_volume.hc'},{name:'generate.py'}]),
  },
  {
    title: 'Cloud Log Forensics',
    description: 'AWS CloudTrail logs were leaked. Somewhere in the API calls is evidence of a data exfiltration.',
    category: 'forensics', difficulty: 'hard', points: 450,
    flag: 'CGS{cl0udtr41l_l0gs_d0nt_l13_3v3r}',
    hint: 'Every API call leaves a permanent record.',
    files: JSON.stringify([{name:'cloudtrail_logs.json'},{name:'generate.py'}]),
  },

  // ═══════════════════════════ REVERSE ═══════════════════════════
  // ── Easy ──
  {
    title: 'Baby\'s First Binary',
    description: 'This little program is guarding something. It\'s not trying very hard to hide it.',
    category: 'reverse', difficulty: 'easy', points: 100,
    flag: 'CGS{str1ngs_d1dnt_l13}',
    hint: 'It talks before it thinks. Listen to what it says to itself.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  {
    title: 'Flag in Functions',
    description: 'The binary exports several functions with unusual names. Not all of them are meant to be called.',
    category: 'reverse', difficulty: 'easy', points: 100,
    flag: 'CGS{symb0ls_t3ll_3v3ryth1ng}',
    hint: 'The function names are the programmer\'s notes to you.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  {
    title: 'Hardcoded Key',
    description: 'This program encrypts something and compares the result. The key was left in the source code.',
    category: 'reverse', difficulty: 'easy', points: 100,
    flag: 'CGS{h4rdc0d3d_k3ys_n3v3r_s3cur3}',
    hint: 'The secret is in the source, just not in plain text.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  {
    title: 'Simple XOR Check',
    description: 'The binary takes a password and XORs it against a known buffer. If the result matches, you\'re in.',
    category: 'reverse', difficulty: 'easy', points: 100,
    flag: 'CGS{x0r_ch3cksums_n0t_s3cur3}',
    hint: 'XOR is a two-way street.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  {
    title: 'Input Echo',
    description: 'The program prints your input back to you. But if you give it the right input, it also prints the flag.',
    category: 'reverse', difficulty: 'easy', points: 100,
    flag: 'CGS{3ch0_c0nd1t10n4l_0utput}',
    hint: 'It repeats what you say, but it\'s listening for something specific.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  {
    title: 'Return Code',
    description: 'This program doesn\'t print the flag — it returns it, one character at a time, as exit codes.',
    category: 'reverse', difficulty: 'easy', points: 100,
    flag: 'CGS{3x1t_c0d3s_4r3_m3ss4g3s_t00}',
    hint: 'The program never speaks, but it always leaves a number.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  {
    title: 'Decompile Me',
    description: 'A Java .class file was found. It contains the flag in plain sight — if you can read what the compiler wrote.',
    category: 'reverse', difficulty: 'easy', points: 100,
    flag: 'CGS{d3c0mp1l3_m3_1m_4n_0p3n_b00k}',
    hint: 'Java bytecode is just another language.',
    files: JSON.stringify([{name:'FlagPrinter.class'},{name:'FlagPrinter.java'}]),
  },
  {
    title: 'Time Check',
    description: 'The binary refuses to run unless the system time matches a specific value. The check is easy to spot and easier to bypass.',
    category: 'reverse', difficulty: 'easy', points: 100,
    flag: 'CGS{t1m3_ch3cks_d0nt_st0p_r3v3rs3rs}',
    hint: 'The program checks its watch before it speaks.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  // ── Medium ──
  {
    title: 'Loopy Logic',
    description: 'This program checks your input using its own private arithmetic. It never explains itself, but it always follows the same rules.',
    category: 'reverse', difficulty: 'medium', points: 250,
    flag: 'CGS{k3yg3n_l00ps_4r3nt_5ecr3t}',
    hint: 'It counts, it checks, it forgives nothing — but it repeats itself.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  {
    title: 'Flag Checker',
    description: 'The binary implements a flag validation function with multiple constraints. All the checks use simple arithmetic that can be reversed.',
    category: 'reverse', difficulty: 'medium', points: 250,
    flag: 'CGS{c0nstr41nts_4r3_r3v3rs1bl3}',
    hint: 'Every constraint is a clue in disguise.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  {
    title: 'Custom VM',
    description: 'This program implements a small virtual machine and executes bytecode. The flag check is inside the bytecode, not the binary.',
    category: 'reverse', difficulty: 'medium', points: 250,
    flag: 'CGS{v1rtu4l_m4ch1n3_byt3c0d3_r3v3rs1ng}',
    hint: 'The real program isn\'t the one you can disassemble.',
    files: JSON.stringify([{name:'challenge.c'},{name:'bytecode.bin'},{name:'Makefile'}]),
  },
  {
    title: 'CRC Check',
    description: 'The binary calculates a CRC of the input and compares it. Reverse the CRC logic to forge a valid input.',
    category: 'reverse', difficulty: 'medium', points: 250,
    flag: 'CGS{crC_1s_f0r_3rr0r_n0t_s3cur1ty}',
    hint: 'Cyclic redundancy is not cryptographic.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  {
    title: 'Anti-Debug',
    description: 'The binary calls ptrace and refuses to run if a debugger is attached. The anti-debug check must be bypassed.',
    category: 'reverse', difficulty: 'medium', points: 250,
    flag: 'CGS{ptrac3_ch3ck_n0t_d3bug_pr00f}',
    hint: 'It checks if it\'s being watched. Trick it into thinking it\'s alone.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  {
    title: 'Z3 Solver',
    description: 'The flag checker uses complex constraints that look impossible to reverse by hand. But a solver can find the answer.',
    category: 'reverse', difficulty: 'medium', points: 250,
    flag: 'CGS{symb0l1c_3x3cut10n_s0lv3s_4ll}',
    hint: 'Let the math do the work.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  {
    title: 'UPX Packed',
    description: 'This binary is packed with UPX. The unpacking stub is easy to spot and even easier to run.',
    category: 'reverse', difficulty: 'medium', points: 250,
    flag: 'CGS{upx_p4ck1ng_1s_tr4nsp4r3nt}',
    hint: 'The binary is wearing a disguise. Remove it to see its true face.',
    files: JSON.stringify([{name:'packed.exe'},{name:'generate.py'}]),
  },
  {
    title: '.NET Decompilation',
    description: 'A .NET executable contains the flag-verification logic. The CIL bytecode practically reads like the original C#.',
    category: 'reverse', difficulty: 'medium', points: 250,
    flag: 'CGS{n3t_d3c0mp1l4t10n_w1th_1ld4sm}',
    hint: '.NET programs carry their source code\'s skeleton.',
    files: JSON.stringify([{name:'DotNetFlag.dll'},{name:'generate.py'}]),
  },
  // ── Hard ──
  {
    title: 'Obfuscated Onion',
    description: 'This binary really does not want to be watched while it works. It behaves differently the moment it feels observed.',
    category: 'reverse', difficulty: 'hard', points: 450,
    flag: 'CGS{p33l1ng_l4y3rs_t4k3s_p4t13nc3}',
    hint: 'Peel it wrong and it peels back.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  {
    title: 'VM Based Obfuscation',
    description: 'The core logic runs inside a custom VM with a complex instruction set. Standard disassembly shows only the VM interpreter.',
    category: 'reverse', difficulty: 'hard', points: 450,
    flag: 'CGS{vm_pr0t3ct10n_n0t_1mp0ss1bl3}',
    hint: 'The interpreter applies everywhere. The bytecode is the real program.',
    files: JSON.stringify([{name:'challenge.c'},{name:'bytecode.bin'},{name:'Makefile'}]),
  },
  {
    title: 'White-Box Crypto',
    description: 'An AES implementation has the key embedded in lookup tables. Extracting the key requires understanding the table structure.',
    category: 'reverse', difficulty: 'hard', points: 450,
    flag: 'CGS{wh1t3b0x_a3s_t4bl3s_l34k_k3ys}',
    hint: 'The key isn\'t hidden, it\'s just spread across many numbers.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  {
    title: 'Firmware Reversing',
    description: 'A firmware dump from an IoT device contains the flag. The binary runs on an ARM Cortex-M core.',
    category: 'reverse', difficulty: 'hard', points: 450,
    flag: 'CGS{f1rmw4r3_r3v3rs1ng_0n_4rm}',
    hint: 'The microcontroller never forgets its secrets.',
    files: JSON.stringify([{name:'firmware.bin'},{name:'generate.py'}]),
  },
  {
    title: 'JNI Reversing',
    description: 'An Android app calls a native library via JNI. The flag verification happens in the native code.',
    category: 'reverse', difficulty: 'hard', points: 450,
    flag: 'CGS{jni_n4t1v3_c0d3_r3v34ls_4ll}',
    hint: 'The Java layer is just the messenger.',
    files: JSON.stringify([{name:'app-debug.apk'},{name:'native-lib.cpp'}]),
  },
  {
    title: 'Ghost in the Machine',
    description: 'This binary modifies its own code at runtime. The flag check is written on the fly and doesn\'t exist in the static binary.',
    category: 'reverse', difficulty: 'hard', points: 450,
    flag: 'CGS{s3lf_m0d1fy1ng_c0d3_gh0stly}',
    hint: 'The program writes its own rules as it runs.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  {
    title: 'Time Travel Debugging',
    description: 'A 64-bit Windows binary has a complex anti-reversing scheme. Use reverse debugging to step backward through the flag check.',
    category: 'reverse', difficulty: 'hard', points: 450,
    flag: 'CGS{t1m3_tr4v3l_d3bugg1ng_w1ns}',
    hint: 'Sometimes the best way forward is to step back.',
    files: JSON.stringify([{name:'challenge.c'},{name:'Makefile'}]),
  },
  {
    title: 'Real World CVE Reversal',
    description: 'A patched and unpatched binary pair is provided. Find the vulnerability that was fixed and exploit it to recover the flag.',
    category: 'reverse', difficulty: 'hard', points: 450,
    flag: 'CGS{p4tch_d1ff1ng_r3v34ls_vulns}',
    hint: 'Compare the two versions. The difference is the vulnerability.',
    files: JSON.stringify([{name:'vulnerable.exe'},{name:'patched.exe'},{name:'generate.py'}]),
  },

  // ═══════════════════════════ CRYPTO ═══════════════════════════
  // ── Easy ──
  {
    title: 'Caesar\'s Ghost',
    description: 'We found this scrambled note in an old CGS server log. It looks like a shift cipher, but not the one everybody expects.',
    category: 'crypto', difficulty: 'easy', points: 100,
    flag: 'CGS{sh1ft_h4pp3ns}',
    hint: 'Julius liked round numbers, but this one\'s off by a coin flip.',
    files: JSON.stringify([{name:'ciphertext.txt'}]),
  },
  {
    title: 'XOR Marks the Spot',
    description: 'This flag was \'protected\' by a single-byte XOR key. Somebody thought that was enough.',
    category: 'crypto', difficulty: 'easy', points: 100,
    flag: 'CGS{s1ngl3_byt3_x0r_1s_n0_l0ck}',
    hint: 'One key, many doors, only one fits without breaking the lock.',
    files: JSON.stringify([{name:'xor_ciphertext.txt'}]),
  },
  {
    title: 'Base64 Flip',
    description: 'The flag was encoded with Base64 a few times, then given to us as a long string. That\'s not encryption, that\'s just layers.',
    category: 'crypto', difficulty: 'easy', points: 100,
    flag: 'CGS{b64_d3c0d1ng_1s_n0t_crypt0}',
    hint: 'Every layer peels off the same way.',
    files: JSON.stringify([{name:'encoded.txt'},{name:'generate.py'}]),
  },
  {
    title: 'Hex Decode',
    description: 'A sequence of hex bytes was found in a text file. The bytes decode to something that looks like the flag. Maybe it is.',
    category: 'crypto', difficulty: 'easy', points: 100,
    flag: 'CGS{h3x_d3c0d3_n0t_3ncrypt10n}',
    hint: 'Every two characters become one byte.',
    files: JSON.stringify([{name:'hex_message.txt'},{name:'generate.py'}]),
  },
  {
    title: 'Vigenère',
    description: 'The flag was encrypted with a Vigenère cipher and a short key. The key is a common English word and the ciphertext is short.',
    category: 'crypto', difficulty: 'easy', points: 100,
    flag: 'CGS{v1g3n3r3_k3y_w4s_t00_sh0rt}',
    hint: 'A repeating key eventually repeats itself.',
    files: JSON.stringify([{name:'ciphertext.txt'},{name:'generate.py'}]),
  },
  {
    title: 'Atbash',
    description: 'A simple substitution cipher where the alphabet is reversed. The message is short and the flag is recognizable.',
    category: 'crypto', difficulty: 'easy', points: 100,
    flag: 'CGS{4tb4sh_c1ph3r_r3v3rs3d}',
    hint: 'A is Z, B is Y — the alphabet folded in half.',
    files: JSON.stringify([{name:'ciphertext.txt'},{name:'generate.py'}]),
  },
  {
    title: 'Morse Code',
    description: 'We intercepted an audio signal that sounds like random beeps. The pattern is anything but random.',
    category: 'crypto', difficulty: 'easy', points: 100,
    flag: 'CGS{m0rs3_c0d3_b33ps_n0t_music}',
    hint: 'The beeps are a language older than radio.',
    files: JSON.stringify([{name:'morse.wav'},{name:'generate.py'}]),
  },
  {
    title: 'Baconian Cipher',
    description: 'A paragraph of text looks ordinary, but the letters are grouped in fives. Look closer — every letter is either font A or font B.',
    category: 'crypto', difficulty: 'easy', points: 100,
    flag: 'CGS{b4c0n_c1ph3r_b1n4ry_h1dd3n}',
    hint: 'The letters carry two meanings: one you read, one you decode.',
    files: JSON.stringify([{name:'bacon_message.txt'},{name:'generate.py'}]),
  },
  // ── Medium ──
  {
    title: 'RSA\'s Small Mistake',
    description: 'We rolled our own RSA keys in a hurry. The math still works, just maybe too easily.',
    category: 'crypto', difficulty: 'medium', points: 250,
    flag: 'CGS{fact0r1ng_sm4ll_pr1m3s_1s_ch34p}',
    hint: 'Even giants trip on small stones.',
    files: JSON.stringify([{name:'rsa_params.txt'},{name:'generate.js'}]),
  },
  {
    title: 'Padding Oracle Lite',
    description: 'This endpoint decrypts things for us and is very particular about complaining when padding looks wrong. That pickiness might tell you more than intended.',
    category: 'crypto', difficulty: 'medium', points: 250,
    flag: 'CGS{th3_3rr0r_t0ld_0n_1ts3lf}',
    hint: 'The error message is more honest than it means to be.',
    files: JSON.stringify([{name:'encrypted_flag.txt'},{name:'server.js'}]),
    instanceUrl: null,
  },
  {
    title: 'Hash Length Extension',
    description: 'A server signs messages using MD5(key + message). Given a signed message, forge a new valid signature for an extended message.',
    category: 'crypto', difficulty: 'medium', points: 250,
    flag: 'CGS{h4sh_l3ngth_3xt3ns10n_br34ks_md5}',
    hint: 'The hash continues from where the original left off.',
    files: JSON.stringify([{name:'server.js'},{name:'generate.py'}]),
    instanceUrl: null,
  },
  {
    title: 'ECB Byte-at-a-Time',
    description: 'An oracle encrypts your input appended to the flag using AES-ECB. The block cipher reveals the flag one byte at a time.',
    category: 'crypto', difficulty: 'medium', points: 250,
    flag: 'CGS{3cb_byt3_4t_t1m3_0r4cl3}',
    hint: 'ECB treats each block in isolation. That\'s its weakness.',
    files: JSON.stringify([{name:'server.js'},{name:'generate.py'}]),
  },
  {
    title: 'Diffie-Hellman MITM',
    description: 'A DH key exchange was captured. The parameters are weak and the public values were exchanged in the clear.',
    category: 'crypto', difficulty: 'medium', points: 250,
    flag: 'CGS{dh_m1tm_w1th_sm4ll_pr1m3}',
    hint: 'The shared secret is only a secret if nobody else can compute it.',
    files: JSON.stringify([{name:'dh_capture.txt'},{name:'generate.py'}]),
  },
  {
    title: 'Bit Flipping',
    description: 'A CBC-encrypted cookie contains an admin flag in one of its blocks. Flip the right bits to become admin.',
    category: 'crypto', difficulty: 'medium', points: 250,
    flag: 'CGS{cbc_b1t_fl1pp1ng_t0_4dm1n}',
    hint: 'In CBC, changing the previous block changes the next block\'s plaintext.',
    files: JSON.stringify([{name:'encrypted_cookie.txt'},{name:'server.js'},{name:'generate.py'}]),
  },
  {
    title: 'ECB Cut-and-Paste',
    description: 'A server generates encrypted tokens using AES-ECB. Users can influence part of the plaintext before encryption.',
    category: 'crypto', difficulty: 'medium', points: 250,
    flag: 'CGS{3cb_cut_p4st3_r0l3_3sc4l4t3}',
    hint: 'ECB blocks can be rearranged without detection.',
    files: JSON.stringify([{name:'server.js'},{name:'generate.py'}]),
  },
  {
    title: 'CRC Collision',
    description: 'A file integrity system uses CRC32 to verify authenticity. Two different files can have the same CRC.',
    category: 'crypto', difficulty: 'medium', points: 250,
    flag: 'CGS{cr32_c0ll1s10ns_4r3_tr1v14l}',
    hint: 'CRC is for error detection, not security.',
    files: JSON.stringify([{name:'generate.py'}]),
  },
  // ── Hard ──
  {
    title: 'Lattice of Lies',
    description: 'Two of our old services generated RSA keys around the same time, using the same random pool. That\'s probably fine.',
    category: 'crypto', difficulty: 'hard', points: 450,
    flag: 'CGS{l4tt1c3_r3duct10n_br34ks_w34k_k3ys}',
    hint: 'The numbers are polite until you rearrange the furniture.',
    files: JSON.stringify([{name:'rsa_keys.txt'},{name:'generate.js'}]),
  },
  {
    title: 'Fault Attack',
    description: 'An RSA signing device occasionally produces faulty signatures. A single faulty signature plus the correct one reveals the private key.',
    category: 'crypto', difficulty: 'hard', points: 450,
    flag: 'CGS{f4ult_4n4lys1s_r3v34ls_th3_k3y}',
    hint: 'One mistake is all it takes to undo the math.',
    files: JSON.stringify([{name:'signatures.txt'},{name:'generate.py'}]),
  },
  {
    title: 'Bleichenbacher\'s Attack',
    description: 'An SSL server responds differently to correctly formatted vs. incorrectly formatted PKCS#1 v1.5 ciphertexts.',
    category: 'crypto', difficulty: 'hard', points: 450,
    flag: 'CGS{bl31ch3nb4ch3r_pkcs15_0r4cl3}',
    hint: 'The oracle answers one bit at a time, but that\'s enough.',
    files: JSON.stringify([{name:'server.js'},{name:'encrypted.txt'},{name:'generate.py'}]),
  },
  {
    title: 'Side-Channel Timing',
    description: 'A password comparison function uses a byte-by-byte comparison and returns early on the first mismatch.',
    category: 'crypto', difficulty: 'hard', points: 450,
    flag: 'CGS{t1m1ng_s1d3_ch4nn3l_byt3_by_byt3}',
    hint: 'The faster it fails, the earlier the mistake.',
    files: JSON.stringify([{name:'server.js'},{name:'generate.py'}]),
  },
  {
    title: 'RSA with Common Factor',
    description: 'Two RSA moduli share a common prime factor. The GCD reveals the shared factor instantly.',
    category: 'crypto', difficulty: 'hard', points: 450,
    flag: 'CGS{rs4_c0mm0n_f4ct0r_w34k_n33ds}',
    hint: 'Two keys can share a secret without knowing it.',
    files: JSON.stringify([{name:'rsa_keypair1.txt'},{name:'rsa_keypair2.txt'},{name:'generate.py'}]),
  },
  {
    title: 'ECDSA Nonce Reuse',
    description: 'Two ECDSA signatures were created with the same nonce (k). Their signatures reveal the private key.',
    category: 'crypto', difficulty: 'hard', points: 450,
    flag: 'CGS{3cds4_n0nc3_r3us3_f4t4l_3rr0r}',
    hint: 'Reusing a nonce in ECDSA is like reusing a one-time pad key.',
    files: JSON.stringify([{name:'signatures.txt'},{name:'generate.py'}]),
  },
  {
    title: 'RC4 Bias',
    description: 'A large amount of RC4-encrypted data was captured. The first few bytes of RC4 output have measurable biases.',
    category: 'crypto', difficulty: 'hard', points: 450,
    flag: 'CGS{rc4_b14s_s1ngl3_byt3_pr3d1ct4bl3}',
    hint: 'The first bytes of RC4 are predictable enough to be useful.',
    files: JSON.stringify([{name:'rc4_ciphertext.bin'},{name:'generate.py'}]),
  },
  {
    title: 'Quantum/Post-Quantum Crypto Intro',
    description: 'A "quantum-safe" implementation uses a lattice-based scheme. But the parameters are too small and the secret can be recovered.',
    category: 'crypto', difficulty: 'hard', points: 450,
    flag: 'CGS{p0st_qu4ntum_w1th_w34k_p4r4ms}',
    hint: 'Quantum resistance requires math that\'s hard even for quantum computers.',
    files: JSON.stringify([{name:'pqc_params.txt'},{name:'generate.py'}]),
  },

  // ═══════════════════════════ MISC ═══════════════════════════
  // ── Easy ──
  {
    title: 'Console Confessions',
    description: 'This page doesn\'t say much out loud. But it\'s definitely thinking something.',
    category: 'misc', difficulty: 'easy', points: 100,
    flag: 'CGS{f12_1s_y0ur_fr13nd}',
    hint: 'The page is quiet, but it\'s not silent.',
    files: JSON.stringify([{name:'index.html'},{name:'script.js'}]),
  },
  {
    title: 'DNS Exfiltration',
    description: 'A pcap file shows a series of DNS queries. Each subdomain contains part of a base64-encoded message.',
    category: 'misc', difficulty: 'easy', points: 100,
    flag: 'CGS{dns_tunn3l1ng_3xfl1tr4t3s_d4t4}',
    hint: 'Every domain name tells a story.',
    files: JSON.stringify([{name:'dns_capture.pcap'},{name:'generate.py'}]),
  },
  {
    title: 'Pastebin Dump',
    description: 'A paste from Pastebin contains what looks like credentials and a flag. But the flag is subtly altered.',
    category: 'misc', difficulty: 'easy', points: 100,
    flag: 'CGS{p4st3b1n_dumps_4r3_g0ldm1n3s}',
    hint: 'The paste looks real, but someone\'s been there before you.',
    files: JSON.stringify([{name:'paste_dump.txt'},{name:'generate.py'}]),
  },
  {
    title: 'Click the Button',
    description: 'A web page has a button that claims to show the flag — but it moves away from the cursor. Automate the click.',
    category: 'misc', difficulty: 'easy', points: 100,
    flag: 'CGS{cl1ck1ng_4ut0m4t10n_byp4ss3s_gu1}',
    hint: 'The button has thumbs, you have code.',
    files: JSON.stringify([{name:'index.html'},{name:'script.js'}]),
  },
  {
    title: 'Emoji Cipher',
    description: 'A message consists entirely of emoji. Each emoji represents a letter or word.',
    category: 'misc', difficulty: 'easy', points: 100,
    flag: 'CGS{3m0j1_crypt0_1s_n0t_s3cur3}',
    hint: '🍎 is A. The pattern is simpler than it looks.',
    files: JSON.stringify([{name:'emoji_message.txt'},{name:'generate.py'}]),
  },
  {
    title: 'OSINT - Social Media',
    description: 'A CGS member posted about their "favorite CTF platform" on social media. The flag is in their profile or post history.',
    category: 'misc', difficulty: 'easy', points: 100,
    flag: 'CGS{s0c1al_m3d14_0s1nt_sk1lls}',
    hint: 'People leave digital footprints everywhere.',
    files: JSON.stringify([{name:'profile_info.txt'},{name:'generate.py'}]),
  },
  {
    title: 'Logic Puzzle',
    description: 'A set of logical clues describes a sequence of operations on numbers. Solve the puzzle to derive the flag.',
    category: 'misc', difficulty: 'easy', points: 100,
    flag: 'CGS{l0g1c_puzzl3s_n33d_p4tt3rns}',
    hint: 'The clues are rules, not suggestions. Every rule narrows the answer.',
    files: JSON.stringify([{name:'puzzle.txt'},{name:'generate.py'}]),
  },
  {
    title: 'QR Code Madness',
    description: 'An image contains a QR code that doesn\'t scan. The QR code is partially corrupted and needs manual reconstruction.',
    category: 'misc', difficulty: 'easy', points: 100,
    flag: 'CGS{qr_c0d3_r3c0nstruct10n_sk1lls}',
    hint: 'QR codes have error correction for a reason.',
    files: JSON.stringify([{name:'corrupted_qr.png'},{name:'generate.py'}]),
  },
  // ── Medium ──
  {
    title: 'JWT Jenga',
    description: 'Our session tokens are cryptographically signed... most of the time. The verification code has some opinions about what counts as \'signed.\'',
    category: 'misc', difficulty: 'medium', points: 250,
    flag: 'CGS{n0n3_alg_m34ns_n0_pr00f}',
    hint: 'The signature is only as strong as the person who forgot to check it.',
    files: JSON.stringify([{name:'server.js'}]),
    instanceUrl: null,
  },
  {
    title: 'Bluetooth Beacon',
    description: 'A pcap file contains BLE advertisements. One of the advertisement payloads contains a hidden message.',
    category: 'misc', difficulty: 'medium', points: 250,
    flag: 'CGS{blu3t00th_b34c0n_h1dden_d4t4}',
    hint: 'Bluetooth devices broadcast all the time. Listen carefully.',
    files: JSON.stringify([{name:'ble_capture.pcap'},{name:'generate.py'}]),
  },
  {
    title: 'Python Jail',
    description: 'A Python REPL accepts input but blocks many keywords. Bypass the filter to read the flag file.',
    category: 'misc', difficulty: 'medium', points: 250,
    flag: 'CGS{pyth0n_j41l_3sc4p3_ch4r_byp4ss}',
    hint: 'Python is full of ways to say the same thing.',
    files: JSON.stringify([{name:'jail.py'},{name:'generate.py'}]),
    instanceUrl: null,
  },
  {
    title: 'Wi-Fi Deauth Analysis',
    description: 'A pcap file contains Wi-Fi management frames including deauthentication packets. The flag is encoded in the deauth reason codes.',
    category: 'misc', difficulty: 'medium', points: 250,
    flag: 'CGS{d34uth_fr4m3s_t3ll_4_st0ry}',
    hint: 'The 802.11 management frames are chatty.',
    files: JSON.stringify([{name:'wifi_capture.pcap'},{name:'generate.py'}]),
  },
  {
    title: 'Prisoner\'s Dilemma',
    description: 'An API simulates iterated Prisoner\'s Dilemma rounds. Cooperate and defect at the right times to earn enough points.',
    category: 'misc', difficulty: 'medium', points: 250,
    flag: 'CGS{1t3r4t3d_pr1s0n3rs_d1l3mm4_s0lv3d}',
    hint: 'The strategy that wins in the long run is usually the kindest.',
    instanceUrl: null,
    files: JSON.stringify([{name:'server.js'}]),
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
