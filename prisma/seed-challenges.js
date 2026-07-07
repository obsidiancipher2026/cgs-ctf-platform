const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

const hashFlag = (flag) => crypto.createHash('sha256').update(flag).digest('hex')

const challenges = [
  {
    title: 'Hidden in Plain Sight',
    description: 'Our new landing page looks empty, but our server never stops talking. Take a closer look at what it says when nobody\'s watching the screen.',
    category: 'web',
    difficulty: 'easy',
    points: 75,
    flag: 'CGS{h34d3rs_h1d3_th1ngs_t00}',
    hint: 'Sometimes the answer isn\'t in the room, it\'s in the envelope.',
  },
  {
    title: 'Cookie Jar',
    description: 'Guests get in easy. Admins get more. The site trusts whatever you tell it, as long as you say it the right way.',
    category: 'web',
    difficulty: 'easy',
    points: 100,
    flag: 'CGS{c00k13s_ar3nt_j5t_f0r_b4k1ng}',
    hint: 'Trust, but decode.',
  },
  {
    title: 'Caesar\'s Ghost',
    description: 'We found this scrambled note in an old CGS server log. It looks like a shift cipher, but not the one everybody expects.',
    category: 'crypto',
    difficulty: 'easy',
    points: 50,
    flag: 'CGS{sh1ft_h4pp3ns}',
    hint: 'Julius liked round numbers, but this one\'s off by a coin flip.',
  },
  {
    title: 'XOR Marks the Spot',
    description: 'This flag was \'protected\' by a single-byte XOR key. Somebody thought that was enough.',
    category: 'crypto',
    difficulty: 'easy',
    points: 100,
    flag: 'CGS{s1ngl3_byt3_x0r_1s_n0_l0ck}',
    hint: 'One key, many doors, only one fits without breaking the lock.',
  },
  {
    title: 'Metadata Whisper',
    description: 'This photo was taken during a CGS field trip. The image looks ordinary, but cameras remember more than what\'s in frame.',
    category: 'forensics',
    difficulty: 'easy',
    points: 75,
    flag: 'CGS{3x1f_kn0ws_wh3r3_y0u_b33n}',
    hint: 'The picture tells a story the eyes can\'t read.',
  },
  {
    title: 'Zip of Secrets',
    description: 'We recovered this archive from an old backup drive. It\'s locked, but not with much imagination.',
    category: 'forensics',
    difficulty: 'easy',
    points: 100,
    flag: 'CGS{p4ssw0rd_w4s_1n_th3_w0rdl1st}',
    hint: 'The lock looks strong until you ask it nicely.',
  },
  {
    title: 'Baby\'s First Binary',
    description: 'This little program is guarding something. It\'s not trying very hard to hide it.',
    category: 'reverse',
    difficulty: 'easy',
    points: 100,
    flag: 'CGS{str1ngs_d1dnt_l13}',
    hint: 'It talks before it thinks. Listen to what it says to itself.',
  },
  {
    title: 'Console Confessions',
    description: 'This page doesn\'t say much out loud. But it\'s definitely thinking something.',
    category: 'misc',
    difficulty: 'easy',
    points: 50,
    flag: 'CGS{f12_1s_y0ur_fr13nd}',
    hint: 'The page is quiet, but it\'s not silent.',
  },
  {
    title: 'SQLi Speakeasy',
    description: 'This login form is older than it looks and trusts input a little too much.',
    category: 'web',
    difficulty: 'medium',
    points: 250,
    flag: 'CGS{uni0n_s3l3ct_y0ur_w4y_1n}',
    hint: 'Ask it a question it wasn\'t trained to refuse.',
  },
  {
    title: 'Path Less Traveled',
    description: 'This file viewer only wants you looking at its own folder. It doesn\'t check very hard.',
    category: 'web',
    difficulty: 'medium',
    points: 225,
    flag: 'CGS{p4th_tr4v3rs4l_1s_a_cl4ss1c}',
    hint: 'Every road leads back if you know how to walk backward.',
  },
  {
    title: 'RSA\'s Small Mistake',
    description: 'We rolled our own RSA keys in a hurry. The math still works, just maybe too easily.',
    category: 'crypto',
    difficulty: 'medium',
    points: 300,
    flag: 'CGS{fact0r1ng_sm4ll_pr1m3s_1s_ch34p}',
    hint: 'Even giants trip on small stones.',
  },
  {
    title: 'Padding Oracle Lite',
    description: 'This endpoint decrypts things for us and is very particular about complaining when padding looks wrong. That pickiness might tell you more than intended.',
    category: 'crypto',
    difficulty: 'medium',
    points: 300,
    flag: 'CGS{th3_3rr0r_t0ld_0n_1ts3lf}',
    hint: 'The error message is more honest than it means to be.',
  },
  {
    title: 'Packet Whodunit',
    description: 'Somebody sent something over the wire during this capture window. Wireshark remembers conversations, not just packets.',
    category: 'forensics',
    difficulty: 'medium',
    points: 250,
    flag: 'CGS{tcp_str34ms_r3m3mb3r_3v3ryth1ng}',
    hint: 'The conversation happened, you just weren\'t listening at the right layer.',
  },
  {
    title: 'Steg-anography',
    description: 'This image looks completely normal at a glance. Somebody hid something in the parts nobody usually looks at.',
    category: 'forensics',
    difficulty: 'medium',
    points: 250,
    flag: 'CGS{l0w3st_b1ts_h1d3_th3_m0st}',
    hint: 'The picture isn\'t lying, it\'s just not telling everything at once.',
  },
  {
    title: 'Loopy Logic',
    description: 'This program checks your input using its own private arithmetic. It never explains itself, but it always follows the same rules.',
    category: 'reverse',
    difficulty: 'medium',
    points: 300,
    flag: 'CGS{k3yg3n_l00ps_4r3nt_5ecr3t}',
    hint: 'It counts, it checks, it forgives nothing — but it repeats itself.',
  },
  {
    title: 'JWT Jenga',
    description: 'Our session tokens are cryptographically signed... most of the time. The verification code has some opinions about what counts as \'signed.\'',
    category: 'misc',
    difficulty: 'medium',
    points: 275,
    flag: 'CGS{n0n3_alg_m34ns_n0_pr00f}',
    hint: 'The signature is only as strong as the person who forgot to check it.',
  },
  {
    title: 'SSRF to the Crown Jewels',
    description: 'This app is happy to fetch images from anywhere you tell it to. It doesn\'t ask why you\'d want it to look somewhere... internal.',
    category: 'web',
    difficulty: 'hard',
    points: 450,
    flag: 'CGS{m3t4d4t4_s3rv1c3s_tru5t_t00_much}',
    hint: 'It fetches for you, it just doesn\'t ask where \'you\' really are.',
  },
  {
    title: 'Lattice of Lies',
    description: 'Two of our old services generated RSA keys around the same time, using the same random pool. That\'s probably fine.',
    category: 'crypto',
    difficulty: 'hard',
    points: 500,
    flag: 'CGS{l4tt1c3_r3duct10n_br34ks_w34k_k3ys}',
    hint: 'The numbers are polite until you rearrange the furniture.',
  },
  {
    title: 'Memory Lane',
    description: 'We caught this snapshot mid-process. Whatever that process was holding onto, it\'s still holding on.',
    category: 'forensics',
    difficulty: 'hard',
    points: 475,
    flag: 'CGS{v0l4t1l1ty_n3v3r_f0rg3ts}',
    hint: 'The computer forgot to forget.',
  },
  {
    title: 'Obfuscated Onion',
    description: 'This binary really does not want to be watched while it works. It behaves differently the moment it feels observed.',
    category: 'reverse',
    difficulty: 'hard',
    points: 500,
    flag: 'CGS{p33l1ng_l4y3rs_t4k3s_p4t13nc3}',
    hint: 'Peel it wrong and it peels back.',
  },
  {
    title: 'Chain Reaction',
    description: 'One weak spot rarely tells the whole story on its own. Follow what it gives you, and see where that leads next.',
    category: 'misc',
    difficulty: 'hard',
    points: 500,
    flag: 'CGS{ch41n3d_bugs_ar3_th3_r34l_thr34t}',
    hint: 'One door doesn\'t open the room, it opens the next door.',
  },
]

async function main() {
  console.log('Seeding challenges...\n')

  const data = challenges.map(({ title, description, category, difficulty, points, flag, hint }) => {
    const hashed = hashFlag(flag)
    console.log(`  [${category.toUpperCase()}] "${title}" — flag hashed`)

    return {
      title,
      description,
      category,
      difficulty,
      points,
      flag: hashed,
      hint,
      published: false,
    }
  })

  let count = 0
  for (const entry of data) {
    const exists = await prisma.challenge.findFirst({ where: { title: entry.title } })
    if (!exists) {
      await prisma.challenge.create({ data: entry })
      count++
    }
  }

  console.log(`\nInserted ${count} challenges (duplicates skipped)`)
  console.log('---')

  const total = await prisma.challenge.count()
  console.log(`Total challenges in database: ${total}`)
}

main()
  .catch((err) => {
    console.error('Failed to seed challenges:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
