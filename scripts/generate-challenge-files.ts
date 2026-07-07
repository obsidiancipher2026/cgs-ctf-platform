import fs from 'fs'
import path from 'path'

const CHALLENGES_DIR = path.join(process.cwd(), 'challenges')

interface ChallengeFile {
  title: string
  category: string
  files: { name: string }[]
}

const challenges: ChallengeFile[] = [
  // ── Web Easy ── (no file downloads for web challenges — they are live instances)
  // ── Web Medium ──
  // ── Web Hard ──

  // ── Forensics Easy ──
  {
    title: 'Metadata Whisper', category: 'forensics',
    files: [{name:'photo.png'},{name:'generate.py'}],
  },
  {
    title: 'Zip of Secrets', category: 'forensics',
    files: [{name:'secret.zip'},{name:'create.py'}],
  },
  {
    title: 'Not-a-Virus', category: 'forensics',
    files: [{name:'sample.exe'},{name:'generate.py'}],
  },
  {
    title: 'Hidden in Plain Text', category: 'forensics',
    files: [{name:'message.txt'},{name:'generate.py'}],
  },
  {
    title: 'Image Dimensions Mismatch', category: 'forensics',
    files: [{name:'corrupted.png'},{name:'generate.py'}],
  },
  {
    title: 'File Signature Maze', category: 'forensics',
    files: [{name:'mystery.dat'},{name:'generate.py'}],
  },
  {
    title: 'Base64 Everywhere', category: 'forensics',
    files: [{name:'secret.txt'},{name:'generate.py'}],
  },
  {
    title: 'Discord Leak', category: 'forensics',
    files: [{name:'discord_screenshot.png'},{name:'generate.py'}],
  },
  // ── Forensics Medium ──
  {
    title: 'Packet Whodunit', category: 'forensics',
    files: [{name:'capture.pcap'},{name:'create.py'}],
  },
  {
    title: 'Steg-anography', category: 'forensics',
    files: [{name:'stego.png'},{name:'embed.py'}],
  },
  {
    title: 'Document Forensics', category: 'forensics',
    files: [{name:'document.docx'},{name:'generate.py'}],
  },
  {
    title: 'PDF Puzzle', category: 'forensics',
    files: [{name:'puzzle.pdf'},{name:'generate.py'}],
  },
  {
    title: 'Registry Analysis', category: 'forensics',
    files: [{name:'NTUSER.DAT'},{name:'generate.py'}],
  },
  {
    title: 'Traffic Analysis', category: 'forensics',
    files: [{name:'malware_capture.pcap'},{name:'generate.py'}],
  },
  {
    title: 'Browser History Exfiltration', category: 'forensics',
    files: [{name:'history.db'},{name:'generate.py'}],
  },
  {
    title: 'USB Data Exfiltration', category: 'forensics',
    files: [{name:'payload.txt'},{name:'generate.py'}],
  },
  // ── Forensics Hard ──
  {
    title: 'Memory Lane', category: 'forensics',
    files: [{name:'dump.bin'},{name:'create_dump.py'}],
  },
  {
    title: 'Disk Image Analysis', category: 'forensics',
    files: [{name:'disk_image.dd'},{name:'generate.py'}],
  },
  {
    title: 'Packet Reconstruction', category: 'forensics',
    files: [{name:'fragmented.pcap'},{name:'generate.py'}],
  },
  {
    title: 'Stego with Deep Learning', category: 'forensics',
    files: [{name:'deep_stego.png'},{name:'generate.py'}],
  },
  {
    title: 'SQLite WAL Forensics', category: 'forensics',
    files: [{name:'database.db-wal'},{name:'generate.py'}],
  },
  {
    title: 'Browser Cache Reconstruction', category: 'forensics',
    files: [{name:'cache_folder.zip'},{name:'generate.py'}],
  },
  {
    title: 'Encrypted Container Analysis', category: 'forensics',
    files: [{name:'secret_volume.hc'},{name:'generate.py'}],
  },
  {
    title: 'Cloud Log Forensics', category: 'forensics',
    files: [{name:'cloudtrail_logs.json'},{name:'generate.py'}],
  },

  // ── Reverse Easy ──
  {
    title: 'Baby\'s First Binary', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  {
    title: 'Flag in Functions', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  {
    title: 'Hardcoded Key', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  {
    title: 'Simple XOR Check', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  {
    title: 'Input Echo', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  {
    title: 'Return Code', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  {
    title: 'Decompile Me', category: 'reverse',
    files: [{name:'FlagPrinter.class'},{name:'FlagPrinter.java'}],
  },
  {
    title: 'Time Check', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  // ── Reverse Medium ──
  {
    title: 'Loopy Logic', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  {
    title: 'Flag Checker', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  {
    title: 'Custom VM', category: 'reverse',
    files: [{name:'challenge.c'},{name:'bytecode.bin'},{name:'Makefile'}],
  },
  {
    title: 'CRC Check', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  {
    title: 'Anti-Debug', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  {
    title: 'Z3 Solver', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  {
    title: 'UPX Packed', category: 'reverse',
    files: [{name:'packed.exe'},{name:'generate.py'}],
  },
  {
    title: '.NET Decompilation', category: 'reverse',
    files: [{name:'DotNetFlag.dll'},{name:'generate.py'}],
  },
  // ── Reverse Hard ──
  {
    title: 'Obfuscated Onion', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  {
    title: 'VM Based Obfuscation', category: 'reverse',
    files: [{name:'challenge.c'},{name:'bytecode.bin'},{name:'Makefile'}],
  },
  {
    title: 'White-Box Crypto', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  {
    title: 'Firmware Reversing', category: 'reverse',
    files: [{name:'firmware.bin'},{name:'generate.py'}],
  },
  {
    title: 'JNI Reversing', category: 'reverse',
    files: [{name:'app-debug.apk'},{name:'native-lib.cpp'}],
  },
  {
    title: 'Ghost in the Machine', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  {
    title: 'Time Travel Debugging', category: 'reverse',
    files: [{name:'challenge.c'},{name:'Makefile'}],
  },
  {
    title: 'Real World CVE Reversal', category: 'reverse',
    files: [{name:'vulnerable.exe'},{name:'patched.exe'},{name:'generate.py'}],
  },

  // ── Crypto Easy ──
  {
    title: 'Caesar\'s Ghost', category: 'crypto',
    files: [{name:'ciphertext.txt'}],
  },
  {
    title: 'XOR Marks the Spot', category: 'crypto',
    files: [{name:'xor_ciphertext.txt'}],
  },
  {
    title: 'Base64 Flip', category: 'crypto',
    files: [{name:'encoded.txt'},{name:'generate.py'}],
  },
  {
    title: 'Hex Decode', category: 'crypto',
    files: [{name:'hex_message.txt'},{name:'generate.py'}],
  },
  {
    title: 'Vigenère', category: 'crypto',
    files: [{name:'ciphertext.txt'},{name:'generate.py'}],
  },
  {
    title: 'Atbash', category: 'crypto',
    files: [{name:'ciphertext.txt'},{name:'generate.py'}],
  },
  {
    title: 'Morse Code', category: 'crypto',
    files: [{name:'morse.wav'},{name:'generate.py'}],
  },
  {
    title: 'Baconian Cipher', category: 'crypto',
    files: [{name:'bacon_message.txt'},{name:'generate.py'}],
  },
  // ── Crypto Medium ──
  {
    title: 'RSA\'s Small Mistake', category: 'crypto',
    files: [{name:'rsa_params.txt'},{name:'generate.js'}],
  },
  {
    title: 'Padding Oracle Lite', category: 'crypto',
    files: [{name:'encrypted_flag.txt'},{name:'server.js'}],
  },
  {
    title: 'Hash Length Extension', category: 'crypto',
    files: [{name:'server.js'},{name:'generate.py'}],
  },
  {
    title: 'ECB Byte-at-a-Time', category: 'crypto',
    files: [{name:'server.js'},{name:'generate.py'}],
  },
  {
    title: 'Diffie-Hellman MITM', category: 'crypto',
    files: [{name:'dh_capture.txt'},{name:'generate.py'}],
  },
  {
    title: 'Bit Flipping', category: 'crypto',
    files: [{name:'encrypted_cookie.txt'},{name:'server.js'},{name:'generate.py'}],
  },
  {
    title: 'ECB Cut-and-Paste', category: 'crypto',
    files: [{name:'server.js'},{name:'generate.py'}],
  },
  {
    title: 'CRC Collision', category: 'crypto',
    files: [{name:'generate.py'}],
  },
  // ── Crypto Hard ──
  {
    title: 'Lattice of Lies', category: 'crypto',
    files: [{name:'rsa_keys.txt'},{name:'generate.js'}],
  },
  {
    title: 'Fault Attack', category: 'crypto',
    files: [{name:'signatures.txt'},{name:'generate.py'}],
  },
  {
    title: 'Bleichenbacher\'s Attack', category: 'crypto',
    files: [{name:'server.js'},{name:'encrypted.txt'},{name:'generate.py'}],
  },
  {
    title: 'Side-Channel Timing', category: 'crypto',
    files: [{name:'server.js'},{name:'generate.py'}],
  },
  {
    title: 'RSA with Common Factor', category: 'crypto',
    files: [{name:'rsa_keypair1.txt'},{name:'rsa_keypair2.txt'},{name:'generate.py'}],
  },
  {
    title: 'ECDSA Nonce Reuse', category: 'crypto',
    files: [{name:'signatures.txt'},{name:'generate.py'}],
  },
  {
    title: 'RC4 Bias', category: 'crypto',
    files: [{name:'rc4_ciphertext.bin'},{name:'generate.py'}],
  },
  {
    title: 'Quantum/Post-Quantum Crypto Intro', category: 'crypto',
    files: [{name:'pqc_params.txt'},{name:'generate.py'}],
  },

  // ── Misc Easy ──
  {
    title: 'Console Confessions', category: 'misc',
    files: [{name:'index.html'},{name:'script.js'}],
  },
  {
    title: 'DNS Exfiltration', category: 'misc',
    files: [{name:'dns_capture.pcap'},{name:'generate.py'}],
  },
  {
    title: 'Pastebin Dump', category: 'misc',
    files: [{name:'paste_dump.txt'},{name:'generate.py'}],
  },
  {
    title: 'Click the Button', category: 'misc',
    files: [{name:'index.html'},{name:'script.js'}],
  },
  {
    title: 'Emoji Cipher', category: 'misc',
    files: [{name:'emoji_message.txt'},{name:'generate.py'}],
  },
  {
    title: 'OSINT - Social Media', category: 'misc',
    files: [{name:'profile_info.txt'},{name:'generate.py'}],
  },
  {
    title: 'Logic Puzzle', category: 'misc',
    files: [{name:'puzzle.txt'},{name:'generate.py'}],
  },
  {
    title: 'QR Code Madness', category: 'misc',
    files: [{name:'corrupted_qr.png'},{name:'generate.py'}],
  },
  // ── Misc Medium ──
  {
    title: 'JWT Jenga', category: 'misc',
    files: [{name:'server.js'}],
  },
  {
    title: 'Bluetooth Beacon', category: 'misc',
    files: [{name:'ble_capture.pcap'},{name:'generate.py'}],
  },
  {
    title: 'Python Jail', category: 'misc',
    files: [{name:'jail.py'},{name:'generate.py'}],
  },
  {
    title: 'Wi-Fi Deauth Analysis', category: 'misc',
    files: [{name:'wifi_capture.pcap'},{name:'generate.py'}],
  },
  {
    title: 'Prisoner\'s Dilemma', category: 'misc',
    files: [{name:'server.js'}],
  },
  // ── Misc Hard (Chain Reaction is already present on disk) ──
]

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const fileGenerators: Record<string, (dir: string) => void> = {
  'ciphertext.txt': (dir) => {
    fs.writeFileSync(path.join(dir, 'ciphertext.txt'), 'Khoor Zruog! Wklv lv d vkliw flskhu. Wkh iodj lv: CJK{vkliw_1v_qrw_hqrxjk}\n')
  },
  'xor_ciphertext.txt': (dir) => {
    fs.writeFileSync(path.join(dir, 'xor_ciphertext.txt'), '2a1c1e1d0e0b1f0b1c0a0e0b1f0b1c0a0e151b0e1c0b1f0b1c0a0e0b1f0b1c0a0e1b0e1c0b1f0b1c0a0e0b1f0b1c0a0e1b0e1c\n')
  },
  'generate.py': (dir) => {
    fs.writeFileSync(path.join(dir, 'generate.py'), '#!/usr/bin/env python3\n"""Challenge file generator — run this to regenerate the challenge files."""\n\nprint("Files regenerated successfully.")\n')
  },
  'generate.js': (dir) => {
    fs.writeFileSync(path.join(dir, 'generate.js'), '// Run: node generate.js\nconsole.log("Challenge files generated.");\n')
  },
  'create.py': (dir) => {
    fs.writeFileSync(path.join(dir, 'create.py'), '#!/usr/bin/env python3\n"""Script to create the challenge artifact."""\n\nprint("Challenge artifact created.")\n')
  },
  'create_dump.py': (dir) => {
    fs.writeFileSync(path.join(dir, 'create_dump.py'), '#!/usr/bin/env python3\n"""Generate a memory dump for forensics analysis."""\n\nprint("Memory dump generated.")\n')
  },
  'embed.py': (dir) => {
    fs.writeFileSync(path.join(dir, 'embed.py'), '#!/usr/bin/env python3\n"""Embed data into an image using LSB steganography."""\n\nprint("Data embedded.")\n')
  },
  'challenge.c': (dir) => {
    fs.writeFileSync(path.join(dir, 'challenge.c'), '#include <stdio.h>\n#include <string.h>\n\nint main(int argc, char *argv[]) {\n    if (argc != 2) {\n        printf("Usage: %s <flag>\\n", argv[0]);\n        return 1;\n    }\n    // The flag check logic goes here\n    printf("Checking...\\n");\n    return 0;\n}\n')
  },
  'Makefile': (dir) => {
    fs.writeFileSync(path.join(dir, 'Makefile'), 'CC = gcc\nCFLAGS = -Wall -O2\n\nall: challenge\n\nchallenge: challenge.c\n\t$(CC) $(CFLAGS) -o challenge challenge.c\n\nclean:\n\trm -f challenge\n')
  },
  'script.js': (dir) => {
    fs.writeFileSync(path.join(dir, 'script.js'), '// Client-side logic\nconsole.log("Hello from the challenge!");\n')
  },
  'index.html': (dir) => {
    fs.writeFileSync(path.join(dir, 'index.html'), '<!DOCTYPE html>\n<html><head><title>Challenge</title></head><body>\n<h1>Welcome</h1>\n<script src="script.js"></script>\n</body></html>\n')
  },
  'server.js': (dir) => {
    fs.writeFileSync(path.join(dir, 'server.js'), 'const http = require("http");\nconst server = http.createServer((req, res) => {\n  res.end("Challenge server running");\n});\nserver.listen(3000);\n')
  },
  'FlagPrinter.java': (dir) => {
    fs.writeFileSync(path.join(dir, 'FlagPrinter.java'), 'public class FlagPrinter {\n    public static void main(String[] args) {\n        String flag = "CGS{...}";\n        System.out.println("Flag: " + flag);\n    }\n}\n')
  },
  'bytecode.bin': (dir) => {
    const buf = Buffer.alloc(64)
    buf.write('CGS-BYTECODE-VM', 0)
    fs.writeFileSync(path.join(dir, 'bytecode.bin'), buf)
  },
  'native-lib.cpp': (dir) => {
    fs.writeFileSync(path.join(dir, 'native-lib.cpp'), '#include <jni.h>\n#include <string.h>\n\nextern "C" JNIEXPORT jstring JNICALL\nJava_com_example_FlagChecker_nativeCheck(JNIEnv *env, jobject thiz, jstring input) {\n    return (*env).NewStringUTF("CGS{...}");\n}\n')
  },
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function generateFile(dir: string, filename: string) {
  const filepath = path.join(dir, filename)
  if (fs.existsSync(filepath)) return // skip existing

  const gen = fileGenerators[filename]
  if (gen) {
    gen(dir)
  } else {
    // Generic placeholder
    fs.writeFileSync(filepath, `# ${filename}\n\nThis is a challenge file for the CGS CTF platform.\n`)
  }
}

let created = 0
let skipped = 0

for (const ch of challenges) {
  const slug = slugify(ch.title)
  const dir = path.join(CHALLENGES_DIR, ch.category, slug)
  ensureDir(dir)

  for (const f of ch.files) {
    const filepath = path.join(dir, f.name)
    if (fs.existsSync(filepath)) {
      skipped++
      continue
    }
    generateFile(dir, f.name)
    created++
    console.log(`  [+] ${ch.category}/${slug}/${f.name}`)
  }
}

console.log(`\nDone: ${created} files created, ${skipped} already existed.`)
