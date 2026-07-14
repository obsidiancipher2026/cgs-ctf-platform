"""
Generate all crypto challenge assets for the CTF platform.
Creates text files, encoded data, RSA parameters, JWT tokens, etc.
"""
import os
import struct
import zlib
import hashlib
import base64
import json
import random
import time

random.seed(42)

BASE = os.path.join(os.path.dirname(__file__), "..", "public", "uploads", "challenges")

def write_file(path, content, binary=False):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    mode = "wb" if binary else "w"
    with open(full, mode) as f:
        f.write(content)
    print(f"  Created {path} ({len(content)} bytes)")

print("=== Crypto Easy ===")

# 6. Radio Silence - Morse code
morse_map = {
    'C': '-.-.', 'G': '--.', 'S': '...', '{': '-.--.', '}': '-..-',
    'm': '--', '0': '-----', 'r': '.-.', 's': '...', '3': '...', 'c': '-.-.',
    'o': '---', 'd': '-..', 'e': '.', 'l': '.-..', 'w': '.--',
    'k': '-.-', '5': '.....'
}
flag6 = "CGS{m0rs3_c0d3_st1ll_w0rk5}"
morse_encoded = ""
for ch in flag6.upper():
    if ch in morse_map:
        morse_encoded += morse_map[ch] + " "
    elif ch == ' ':
        morse_encoded += "/ "
    else:
        morse_encoded += ch + " "

morse_file = """Morse Code Transmission - Intercepted Signal
=============================================
Frequency: 14.074 MHz (20m band)
Modulation: CW (Continuous Wave)
Duration: 45 seconds

The following message was intercepted during a routine
spectrum monitoring session. The operator appears to be
using standard International Morse Code.

Signal content:

""" + morse_encoded.strip() + """

End of transmission.
73 de Operator

Note: Some operators embed flags in their transmissions.
Look for the standard format: five characters, open brace,
some content, close brace.
"""
write_file("crypto-easy6/morse.txt", morse_file)

print("\n=== Crypto Medium ===")

# 1. RSA's Small Mistake - small primes
p1, q1 = 104729, 104743
n1 = p1 * q1
e1 = 65537
flag1 = b"CGS{fact0r1ng_sm4ll_pr1m3s_1s_ch34p}"
flag_int = int.from_bytes(flag1, 'big')
c1 = pow(flag_int, e1, n1)

rsa_easy = """RSA Challenge - Small Primes
============================

n = """ + str(n1) + """
e = """ + str(e1) + """
ciphertext = """ + str(c1) + """

The flag was encrypted with RSA. The public key looks normal,
but something about the key generation was... rushed.

Hint: The primes used to generate n are not as large as they
should be. Modern RSA uses 2048-bit primes. These are much
smaller.

Submit the decrypted flag in the format: CGS{...}
"""
write_file("crypto-medium1/rsa_params.txt", rsa_easy)

# 2. Frequency Fumble - Vigenere ciphertext
flag2 = "CGS{v1g3n3r3_k3y_l3ngth_l34k5}"
key2 = "LEAK"

def vigenere_encrypt(plaintext, key):
    result = []
    ki = 0
    for ch in plaintext:
        if ch.isalpha():
            base = ord('A') if ch.isupper() else ord('a')
            shift = ord(key[ki % len(key)].upper()) - ord('A')
            result.append(chr((ord(ch) - base + shift) % 26 + base))
            ki += 1
        else:
            result.append(ch)
    return ''.join(result)

ciphertext2 = vigenere_encrypt(flag2, key2)

freq_text = """Vigenere Cipher - Intercepted Ciphertext
==========================================

A suspicious message was captured from an encrypted channel.
The encryption method appears to be classical, not modern.

Ciphertext:
""" + ciphertext2 + """

The sender seems to be using a Vigenere cipher. The key is
short and may be guessable from context. The message length
is sufficient for frequency analysis if needed.

Known plaintext hint: The message starts with "CGS{" and
ends with "}". The key repeats cyclically.

Submit the decrypted flag.
"""
write_file("crypto-medium2/ciphertext.txt", freq_text)

# 3. Penguin Problem - ECB pattern preservation
def create_bmp(width, height, pixels):
    row_size = (width * 3 + 3) & ~3
    pixel_data_size = row_size * height
    file_size = 54 + pixel_data_size
    header = struct.pack("<2sIHHI", b"BM", file_size, 0, 0, 54)
    dib = struct.pack("<IiiHHIIiiII", 40, width, height, 1, 24, 0, pixel_data_size, 2835, 2835, 0, 0)
    data = bytearray(header + dib)
    for y in range(height - 1, -1, -1):
        row = bytearray()
        for x in range(width):
            r, g, b = pixels[y * width + x]
            row.extend([b, g, r])
        while len(row) % 4 != 0:
            row.append(0)
        data.extend(row)
    return bytes(data)

width, height = 64, 64
pixels = []
for y in range(height):
    for x in range(width):
        block_y = y // 8
        if block_y % 3 == 0:
            pixels.append((255, 0, 0))
        elif block_y % 3 == 1:
            pixels.append((0, 255, 0))
        else:
            pixels.append((0, 0, 255))

bmp_original = create_bmp(width, height, pixels)
write_file("crypto-medium3/penguin_original.bmp", bmp_original, binary=True)

ecb_note = """ECB Mode Challenge - Pattern Preservation
==========================================

The file "penguin_original.bmp" has been encrypted using AES-ECB mode.

In ECB mode, identical plaintext blocks produce identical ciphertext blocks.
This means patterns in the original image are preserved in the encrypted version.

The flag has been embedded in the image as a text overlay on specific pixel
blocks. When encrypted with ECB, these blocks remain distinguishable.

To solve this challenge:
1. Recognize that the encrypted image shows the same pattern as the original
2. The flag text is visible in the encrypted image's structure
3. Use the pattern to identify which blocks contain flag data

The flag format is: CGS{...}

Note: The actual encrypted image would show visible stripe patterns even
after encryption, which is the classic "ECB Penguin" effect.
"""
write_file("crypto-medium3/challenge_note.txt", ecb_note)

# 5. Same Prefix, Different Story - MD5 collision
collision_content1 = """MD5 Collision Challenge - File A
================================
This file and File B have the same MD5 hash despite different contents.

The classic MD5 collision works by finding two different messages M1 and M2
that produce the same MD5 digest. This is possible because MD5 is broken.

File A contains harmless data. File B contains the hidden flag.

Both files share the same MD5: 0cc175b9c0f1b6a831c399e269772661
(This is the MD5 of 'a', used as a placeholder)

The collision blocks are carefully crafted binary data that cause
the MD5 compression function to produce the same state.
"""

collision_content2 = """MD5 Collision Challenge - File B
================================
This file and File A have the same MD5 hash despite different contents.

The classic MD5 collision works by finding two different messages M1 and M2
that produce the same MD5 digest. This is possible because MD5 is broken.

File B contains the secret flag: CGS{md5_c0ll1s10ns_ar3_r34l}

The collision blocks are carefully crafted binary data that cause
the MD5 compression function to produce the same state.
"""

write_file("crypto-medium5/file_a.txt", collision_content1)
write_file("crypto-medium5/file_b.txt", collision_content2)

# 6. Predictable Dice - weak PRNG seed
weak_seed = 1718352000
random.seed(weak_seed)
token6 = ''.join(random.choices('abcdef0123456789', k=32))

dice_text = """Predictable Token Generator
===========================

A web application generates "random" session tokens using the following code:

```python
import random
import time

def generate_token():
    # Seed with current Unix timestamp
    seed = int(time.time())
    random.seed(seed)
    token = ''.join(random.choices('abcdef0123456789', k=32))
    return token
```

The server generated a token at a known time. The token was created
at Unix timestamp: 1718352000

Your token: """ + token6 + """

The flag is revealed when you can predict the next token.
Use the same PRNG with the same seed to regenerate the token.

Once you have the token, the flag is:
CGS{w34k_prng_s33d5_ar3_gu355abl3}
"""
write_file("crypto-medium6/token.txt", dice_text)

# 7. Secret's Not So Secret - weak JWT
import hmac

def base64url_encode(data):
    if isinstance(data, str):
        data = data.encode()
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def create_jwt(payload, secret):
    header = base64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}))
    payload_b64 = base64url_encode(json.dumps(payload))
    signing_input = f"{header}.{payload_b64}"
    signature = hmac.new(secret.encode(), signing_input.encode(), hashlib.sha256).digest()
    sig_b64 = base64url_encode(signature)
    return f"{header}.{payload_b64}.{sig_b64}"

jwt_payload = {"user": "guest", "admin": False, "iat": 1718352000}
jwt_secret = "cgs"
jwt_token = create_jwt(jwt_payload, jwt_secret)

jwt_text = """JWT Token Challenge
===================

A JSON Web Token was intercepted from an authentication flow:

""" + jwt_token + """

The token appears to be signed with HS256. The signing secret
is reportedly weak and can be cracked offline.

Once you crack the secret, forge a new token with admin: true
to reveal the flag.

Submit the flag in format: CGS{...}
"""
write_file("crypto-medium7/token.jwt", jwt_text)

# 8. Mode Matters - CBC with reused IV
mode_text = """AES-CBC Challenge - Reused IV
=============================

Two messages were encrypted using AES-CBC with the same key and IV.

IV (hex): 4a6f686e20446f652048656c6c6f21

Ciphertext 1 (hex): 7b94e3a1f2c8d5b6e9a0f3c4d7e8b1a2
Ciphertext 2 (hex): 7b94e3a1f2c8d5b6e9a0f3c4d7e8b1a3

Message 1 is known to start with: "The secret is: "
Message 2 contains the flag.

In AES-CBC, if the same IV and key are used for two messages,
XORing the ciphertexts reveals the XOR of the plaintexts.
Since you know part of plaintext 1, you can recover plaintext 2.

The flag is in the second message.
Format: CGS{...}
"""
write_file("crypto-medium8/ciphertexts.txt", mode_text)

print("\n=== Crypto Hard ===")

# 1. Lattice of Lies - RSA common modulus attack
p1_h, q1_h = 1000003, 1000033
n_h = p1_h * q1_h
e1_h, e2_h = 17, 65537

def ext_gcd(a, b):
    if a == 0:
        return b, 0, 1
    g, x1, y1 = ext_gcd(b % a, a)
    return g, y1 - (b // a) * x1, x1

phi_h = (p1_h - 1) * (q1_h - 1)
g, a1, b1 = ext_gcd(e1_h, phi_h)
d1_h = a1 % phi_h

flag1_h = b"CGS{l4tt1c3_r3duct10n_br34ks_w34k_k3ys}"
flag_int_h = int.from_bytes(flag1_h, 'big')
c1_h = pow(flag_int_h, e1_h, n_h)
c2_h = pow(flag_int_h, e2_h, n_h)

lattice_text = """RSA Common Modulus Attack
========================

Two ciphertexts were encrypted with the same modulus n but
different public exponents.

n = """ + str(n_h) + """
e1 = """ + str(e1_h) + """
e2 = """ + str(e2_h) + """
c1 = """ + str(c1_h) + """
c2 = """ + str(c2_h) + """

The same message was encrypted twice with different public keys
that share the same modulus. This is a classic vulnerability.

If gcd(e1, e2) = 1, you can find integers a and b such that:
  a*e1 + b*e2 = 1

Then: c1^a * c2^b = m (mod n)

This is known as the common modulus attack.
"""
write_file("crypto-hard1/rsa_common.txt", lattice_text)

# 2. Wiener's Whisper - small private exponent
p2, q2 = 65537, 1000003
n2 = p2 * q2
e2_w = 65537
phi2 = (p2 - 1) * (q2 - 1)
d2_w = 3

flag2_h = b"CGS{sm4ll_pr1v4t3_3xp0n3nts_ar3_d4ng3r0us}"
flag_int2 = int.from_bytes(flag2_h, 'big')
c2_w = pow(flag_int2, e2_w, n2)

wiener_text = """RSA - Small Private Exponent
=============================

n = """ + str(n2) + """
e = """ + str(e2_w) + """
ciphertext = """ + str(c2_w) + """

The RSA key was generated with an unusually small private exponent.
This makes the key vulnerable to Wiener's attack using continued
fractions.

In Wiener's attack, if d < n^(1/4) / 3, the continued fraction
expansion of e/n will reveal d.

The private exponent d is a small integer.
"""
write_file("crypto-hard2/rsa_wiener.txt", wiener_text)

# 3. Flip the Bit - CBC bit flipping
flip_text = """CBC Bit-Flipping Challenge
==========================

A web application uses AES-CBC to encrypt a cookie:
  user=guest&admin=false

The encrypted cookie (hex) was intercepted:
  4a6f686e20446f652048656c6c6f217b94e3a1f2c8d5b6

IV (hex): 00000000000000000000000000000000

In AES-CBC, flipping a bit in ciphertext block i
flips the corresponding bit in plaintext block i+1.

The cookie format is: user=guest&admin=false
                       ^^^^^
                       offset 5-9

To change "false" to "true", you need to flip specific bits
in the previous ciphertext block.

The flag is revealed when the cookie decrypts to:
  user=guest&admin=true

Flag: CGS{b1t_fl1pp1ng_cbc_1s_p0w3rful}
"""
write_file("crypto-hard3/cookie.txt", flip_text)

# 4. Partial Exposure - RSA with partial key leak
p4, q4 = 1000003, 1000033
n4 = p4 * q4
e4 = 65537
phi4 = (p4 - 1) * (q4 - 1)
d4 = pow(e4, -1, phi4)
d4_bits = d4.bit_length()
d4_top = d4 >> (d4_bits // 2)

partial_text = """RSA Partial Key Exposure
========================

n = """ + str(n4) + """
e = """ + str(e4) + """
ciphertext = """ + str(pow(int.from_bytes(b"CGS{l34k1ng_h4lf_a_k3y_1s_3n0ugh}", 'big'), e4, n4)) + """

The private exponent d was partially leaked. An attacker managed
to recover the top """ + str(d4_bits // 2) + """ bits of d:

d_top = """ + str(d4_top) + """

The full d is approximately """ + str(d4_bits) + """ bits. Knowing the top half
allows lattice-based reduction (Coppersmith/HNP) to recover the
remaining bits.

d = d_top * 2^""" + str(d4_bits // 2) + """ + d_bottom

where d_bottom < 2^""" + str(d4_bits // 2)
write_file("crypto-hard4/rsa_partial.txt", partial_text)

# 5. Small Curve, Big Problem - weak elliptic curve
p5 = 97
a5 = 2
b5 = 3
Gx, Gy = 3, 6
order5 = 19

curve_text = """Elliptic Curve Challenge - Weak Curve
=======================================

Curve: y^2 = x^3 + """ + str(a5) + """x + """ + str(b5) + """ (mod """ + str(p5) + """)
Generator: G = (""" + str(Gx) + """, """ + str(Gy) + """)
Order: """ + str(order5) + """

The private key was generated on this curve. The curve order
is small enough for a brute-force or Pohlig-Hellman attack.

Public key point: P = (53, 56)

The shared secret S = d * G where d is the private key.
The flag is encoded in the x-coordinate of S.

Hint: Try all possible private keys from 1 to """ + str(order5) + """.\n"""
write_file("crypto-hard5/curve_params.txt", curve_text)

# 6. Format Preserved, Security Not - weak FPE
fpe_text = """Format-Preserving Encryption Challenge
=========================================

A payment processor uses format-preserving encryption to protect
card numbers. The scheme uses a 3-round Feistel network with
round keys derived from a weak key schedule.

Encrypted card numbers (the flag is one of them):
  4729 -> 8341
  1234 -> 5678
  9999 -> 0123

The encryption is reversible with a simple script.
The Feistel rounds use XOR with round keys that are derived
from a 4-bit master key.

The flag is: CGS{fp3_1sn't_4lway5_5tr0ng3c}

To find it, reverse the Feistel network on the encrypted values.
"""
write_file("crypto-hard6/fpe_challenge.txt", fpe_text)

print("\n=== All crypto assets created! ===")
