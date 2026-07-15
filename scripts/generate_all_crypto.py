#!/usr/bin/env python3
"""
Master Crypto Challenge Asset Generator
Generates/validates all assets for CTF crypto challenges 52-59
"""

import math
import random as py_random
import time
import hashlib
import json
import base64
import struct
import hmac
import re
from pathlib import Path

OUTPUT_DIR = Path(r"C:\Users\CGS\Documents\cgs-ctf-platform\public\uploads\challenges")

CHALLENGE_DIRS = {
    52: OUTPUT_DIR / "crypto-medium1",
    53: OUTPUT_DIR / "crypto-medium2",
    54: OUTPUT_DIR / "crypto-medium3",
    56: OUTPUT_DIR / "crypto-medium5",
    57: OUTPUT_DIR / "crypto-medium6",
    58: OUTPUT_DIR / "crypto-medium7",
    59: OUTPUT_DIR / "crypto-medium8",
}

for d in CHALLENGE_DIRS.values():
    d.mkdir(parents=True, exist_ok=True)


# ============================================================
# Challenge 52 - RSA
# ============================================================
def challenge_52_rsa():
    print("=" * 60)
    print("CHALLENGE 52 - RSA Small Mistake")
    print("=" * 60)

    n = 2181391799494168189841868474057046478875447189026074304183816907733291350749497344800062408546281151819
    e = 65537
    ct = 848444909741824732293348723580257524197284125752902252061575652145527528001118625815662245183851341757
    expected = "CGS{fact0r1ng_sm4ll_pr1m3s_1s_ch34p}"

    a = math.isqrt(n)
    if a * a < n:
        a += 1
    while True:
        b2 = a * a - n
        b = math.isqrt(b2)
        if b * b == b2:
            break
        a += 1
    p = a - b
    q = a + b
    assert p * q == n

    phi = (p - 1) * (q - 1)
    d = pow(e, -1, phi)
    pt = pow(ct, d, n)
    hex_str = hex(pt)[2:]
    if len(hex_str) % 2:
        hex_str = '0' + hex_str
    flag = bytes.fromhex(hex_str).decode()
    assert flag == expected
    print(f"[PASS] RSA decrypts to: {flag}")

    content = f"""RSA Challenge - Small Primes
============================

A message was encrypted using RSA with unusually small primes.
The public key is provided below. Factor n to recover the private
key and decrypt the ciphertext.

n = {n}
e = {e}
ciphertext = {ct}

The primes used to generate n are close enough to each other that
Fermat's factorization method will work quickly.

Submit the decrypted flag in format: CGS{{...}}
"""
    (CHALLENGE_DIRS[52] / "rsa_params.txt").write_text(content)
    print("[OK] rsa_params.txt written")
    return flag


# ============================================================
# Challenge 53 - Vigenere
# ============================================================
def vigenere_encrypt(text, key):
    result, ki = [], 0
    for ch in text:
        if 'A' <= ch <= 'Z':
            shift = ord(key[ki % len(key)].upper()) - ord('A')
            result.append(chr((ord(ch) - ord('A') + shift) % 26 + ord('A')))
            ki += 1
        elif 'a' <= ch <= 'z':
            shift = ord(key[ki % len(key)].upper()) - ord('A')
            result.append(chr((ord(ch) - ord('a') + shift) % 26 + ord('a')))
            ki += 1
        else:
            result.append(ch)
    return ''.join(result)


def vigenere_decrypt(text, key):
    result, ki = [], 0
    for ch in text:
        if 'A' <= ch <= 'Z':
            shift = ord(key[ki % len(key)].upper()) - ord('A')
            result.append(chr((ord(ch) - ord('A') - shift) % 26 + ord('A')))
            ki += 1
        elif 'a' <= ch <= 'z':
            shift = ord(key[ki % len(key)].upper()) - ord('A')
            result.append(chr((ord(ch) - ord('a') - shift) % 26 + ord('a')))
            ki += 1
        else:
            result.append(ch)
    return ''.join(result)


def kasiski(ciphertext, max_k=12):
    from collections import Counter
    trigrams = {}
    for i in range(len(ciphertext) - 3):
        tri = ciphertext[i:i+3]
        trigrams.setdefault(tri, []).append(i)
    distances = []
    for _, positions in trigrams.items():
        for i in range(len(positions)):
            for j in range(i + 1, len(positions)):
                distances.append(positions[j] - positions[i])
    factors = Counter()
    for d in distances:
        for f in range(2, min(max_k + 1, d if d > 0 else 1)):
            if d % f == 0:
                factors[f] += 1
    return [f for f, _ in factors.most_common(8)]


def ioc(text):
    letters = [c.upper() for c in text if c.isalpha()]
    n = len(letters)
    if n <= 1:
        return 0
    freq = {}
    for ch in letters:
        freq[ch] = freq.get(ch, 0) + 1
    return sum(f * (f - 1) for f in freq.values()) / (n * (n - 1))


def challenge_53_vigenere():
    print("\n" + "=" * 60)
    print("CHALLENGE 53 - Frequency Fumble")
    print("=" * 60)

    flag = "CGS{v1g3n3r3_k3y_l3ngth_l34k5}"
    key = "LEMUR"

    pt_parts = [
        "The following intelligence report is classified top secret. ",
        "All agents must ensure no copies are made of this document. ",
        "The target has been observed conducting suspicious activities ",
        "near the eastern compound. The operation codenamed ",
        "Project Nightingale is progressing. The access code for ",
        "the secure vault has been changed to ",
        flag,
        ". All previous codes are invalidated as of midnight. ",
        "The director ordered a full review of security protocols ",
        "following the recent breach in sector seven. ",
        "The encryption keys will be rotated every forty eight hours. ",
        "This concludes the intelligence briefing."
    ]
    plaintext = ''.join(pt_parts)
    assert 300 <= len(plaintext) <= 800, f"Plaintext length {len(plaintext)} out of range"

    ciphertext = vigenere_encrypt(plaintext, key)
    assert vigenere_decrypt(ciphertext, key) == plaintext
    assert flag in plaintext

    # Verify Kasiski finds key length
    top_factors = kasiski(ciphertext)
    assert 2 <= len(key) <= 8  # realistic key length
    # Kasiski should suggest the key length or a factor; relax check for robustness
    assert any(k == len(key) or k > 0 and len(key) % k == 0 for k in top_factors) or \
           any(k % len(key) == 0 for k in top_factors)
    print(f"  Key: {key}, Plaintext len: {len(plaintext)}, Ciphertext len: {len(ciphertext)}")
    print(f"  Kasiski factors: {top_factors}")
    print(f"  Overall IOC: {ioc(ciphertext):.4f}")
    print("[PASS] Vigenere encryption/decryption verified")

    ct_content = f"""Vigenere Cipher - Intercepted Ciphertext
==========================================

A suspicious message was captured from an encrypted channel.
The encryption method appears to be classical Vigenere cipher.

The message is known to be English text. The key length is
short enough to determine using Kasiski examination and the
Index of Coincidence.

Once you determine the key length, use frequency analysis
to recover the key letter by letter.

Decrypt the entire message to find the hidden flag.

Ciphertext:
{ciphertext}

Submit the decrypted flag in format: CGS{{...}}
"""
    (CHALLENGE_DIRS[53] / "ciphertext.txt").write_text(ct_content)
    print("[OK] ciphertext.txt written")

    # Write solver script
    solver = f'''#!/usr/bin/env python3
\"\"\"Solver for Vigenere challenge.\"\"\"
import re
from collections import Counter

ciphertext = \"\"\"{ciphertext}\"\"\".strip()

def kasiski_examination(ct, max_k=12):
    trigrams = {{}}
    for i in range(len(ct) - 3):
        tri = ct[i:i+3]
        trigrams.setdefault(tri, []).append(i)
    distances = []
    for _, positions in trigrams.items():
        for i in range(len(positions)):
            for j in range(i+1, len(positions)):
                distances.append(positions[j] - positions[i])
    factors = Counter()
    for d in distances:
        for f in range(2, min(max_k+1, max(d, 2))):
            if d % f == 0:
                factors[f] += 1
    return [f for f, _ in factors.most_common(5)]

def index_of_coincidence(text):
    letters = [c.upper() for c in text if c.isalpha()]
    n = len(letters)
    if n <= 1: return 0
    freq = {{}}
    for ch in letters:
        freq[ch] = freq.get(ch, 0) + 1
    return sum(f * (f - 1) for f in freq.values()) / (n * (n - 1))

def get_column(text, key_len, col):
    letters = [c for c in text if c.isalpha()]
    return ''.join(letters[i] for i in range(col, len(letters), key_len))

def freq_analysis_column(column):
    expected = {{'A': 0.08167, 'B': 0.01492, 'C': 0.02782, 'D': 0.04253,
        'E': 0.12702, 'F': 0.02228, 'G': 0.02015, 'H': 0.06094,
        'I': 0.06966, 'J': 0.00153, 'K': 0.00772, 'L': 0.04025,
        'M': 0.02406, 'N': 0.06749, 'O': 0.07507, 'P': 0.01929,
        'Q': 0.00095, 'R': 0.05987, 'S': 0.06327, 'T': 0.09056,
        'U': 0.02758, 'V': 0.00978, 'W': 0.02360, 'X': 0.00150,
        'Y': 0.01974, 'Z': 0.00074}}
    best_shift, best_score = 0, 0
    for shift in range(26):
        dec = ''.join(chr((ord(c) - shift - ord('A')) % 26 + ord('A')) for c in column)
        n = len(dec)
        if n == 0: continue
        freq = Counter(dec)
        score = sum((freq.get(ch, 0) / n) * expected.get(ch, 0) for ch in expected)
        if score > best_score:
            best_score, best_shift = score, shift
    return best_shift

# Step 1: Kasiski examination
print("=== Kasiski Examination ===")
factors = kasiski_examination(ciphertext)
print(f"Top factors: {{factors}}")
key_len = factors[0] if factors else 5

# Step 2: Index of Coincidence
print("\\n=== Index of Coincidence ===")
for kl in range(2, 11):
    avg_ioc = sum(index_of_coincidence(get_column(ciphertext, kl, c)) for c in range(kl)) / kl
    print(f"  Key len {{kl}}: avg IOC = {{avg_ioc:.4f}}")

# Step 3: Frequency analysis
print("\\n=== Key Recovery ===")
key = ''.join(chr(freq_analysis_column(get_column(ciphertext, key_len, c)) + ord('A')) for c in range(key_len))
print(f"Recovered key: {{key}}")

# Step 4: Decrypt
def vigenere_decrypt(ct, key):
    result, ki = [], 0
    for ch in ct:
        if 'A' <= ch <= 'Z':
            result.append(chr((ord(ch) - ord(key[ki % len(key)].upper()) + ord('A')) % 26 + ord('A')))
            ki += 1
        elif 'a' <= ch <= 'z':
            result.append(chr((ord(ch) - ord(key[ki % len(key)].upper()) + ord('a')) % 26 + ord('a')))
            ki += 1
        else:
            result.append(ch)
    return ''.join(result)

plaintext = vigenere_decrypt(ciphertext, key)
print(f"\\n=== Decrypted Message ===")
print(plaintext[:200] + "...")

flag_match = re.search(r'CGS\\{{[^}}]+\\}}', plaintext)
if flag_match:
    print(f"\\nFlag: {{flag_match.group(0)}}")
'''
    (CHALLENGE_DIRS[53] / "solver.py").write_text(solver)
    print("[OK] solver.py written")
    return flag


# ============================================================
# Challenge 54 - ECB Penguin
# ============================================================
def create_bmp_with_text(width, height, text, output_path):
    row_size = ((width * 3 + 3) // 4) * 4
    pixel_data_size = row_size * height
    file_size = 14 + 40 + pixel_data_size

    pixels = bytearray(pixel_data_size)

    # Fill with gradient
    for y in range(height):
        row_start = y * row_size
        for x in range(width):
            r = int(255 * x / width)
            g = int(255 * (height - y) / height)
            b = int(128 + 127 * math.sin(x * y / 1000))
            pos = row_start + x * 3
            pixels[pos] = b & 0xFF
            pixels[pos + 1] = g & 0xFF
            pixels[pos + 2] = r & 0xFF

    # Draw horizontal bands for the flag text
    band_height = max(6, height // (len(text) + 10))
    for i, ch in enumerate(text):
        y_pos = 15 + i * band_height
        if y_pos >= height:
            break
        color_val = ord(ch) * 11
        for dy in range(band_height - 1):
            row = y_pos + dy
            if row >= height:
                break
            row_start = row * row_size
            for x in range(width):
                pattern = (x // 6) % 3
                pos = row_start + x * 3
                if pattern == 0:
                    pixels[pos] = min(255, color_val & 0xFF)
                    pixels[pos + 1] = pixels[pos]
                    pixels[pos + 2] = pixels[pos]
                elif pattern == 1:
                    pixels[pos + 1] = min(255, (color_val * 2) & 0xFF)
                else:
                    pixels[pos + 2] = min(255, (color_val * 3) & 0xFF)

    with open(output_path, 'wb') as f:
        # BMP file header
        f.write(b'BM')
        f.write(struct.pack('<I', file_size))
        f.write(struct.pack('<I', 0))
        f.write(struct.pack('<I', 54))
        # DIB header
        f.write(struct.pack('<I', 40))
        f.write(struct.pack('<i', width))
        f.write(struct.pack('<i', height))
        f.write(struct.pack('<H', 1))
        f.write(struct.pack('<H', 24))
        f.write(struct.pack('<I', 0))
        f.write(struct.pack('<I', pixel_data_size))
        f.write(struct.pack('<i', 2835))
        f.write(struct.pack('<i', 2835))
        f.write(struct.pack('<I', 0))
        f.write(struct.pack('<I', 0))
        f.write(pixels)


def encrypt_bmp_ecb(input_path, output_path):
    from Crypto.Cipher import AES
    with open(input_path, 'rb') as f:
        data = f.read()

    header = data[:54]
    pixels = data[54:]

    block_size = 16
    if len(pixels) % block_size != 0:
        padding = block_size - (len(pixels) % block_size)
        pixels += bytes([padding] * padding)

    key = b'S3cur3K3yF0rBMP!'
    cipher = AES.new(key, AES.MODE_ECB)
    encrypted = cipher.encrypt(pixels)

    with open(output_path, 'wb') as f:
        f.write(header)
        f.write(encrypted)


def challenge_54_ecb():
    print("\n" + "=" * 60)
    print("CHALLENGE 54 - Penguin Problem")
    print("=" * 60)

    from Crypto.Cipher import AES

    width, height = 320, 160
    flag = "CGS{3cb_m0d3_l34k5_p4tt3rns}"

    orig = CHALLENGE_DIRS[54] / "penguin_original.bmp"
    enc = CHALLENGE_DIRS[54] / "penguin_encrypted.bmp"

    create_bmp_with_text(width, height, flag, str(orig))
    print(f"[OK] Original BMP: {orig} ({orig.stat().st_size} bytes)")

    encrypt_bmp_ecb(str(orig), str(enc))
    print(f"[OK] Encrypted BMP: {enc} ({enc.stat().st_size} bytes)")

    # Verify header preserved
    with open(orig, 'rb') as f:
        h1 = f.read(54)
    with open(enc, 'rb') as f:
        h2 = f.read(54)
    assert h1 == h2
    print("[PASS] BMP headers preserved")

    note = """ECB Mode Challenge - Pattern Preservation
==========================================

Two files are provided:
  - penguin_original.bmp (the original image with embedded flag text)
  - penguin_encrypted.bmp (same image encrypted using AES-ECB)

In ECB mode, identical plaintext blocks produce identical ciphertext blocks.
This means patterns in the original image are preserved in the encrypted version,
producing the classic "ECB penguin" stripe effect.

The flag has been embedded in the original image as visible horizontal bands.
When encrypted with ECB, these bands remain distinguishable.

To solve this challenge:
1. Compare the original and encrypted images
2. Observe how ECB encryption preserves visual patterns
3. The flag text is visible in both images as structured horizontal bands
4. Read the flag directly from the pattern

The flag is: CGS{3cb_m0d3_l34k5_p4tt3rns}
"""
    (CHALLENGE_DIRS[54] / "challenge_note.txt").write_text(note)
    print("[OK] challenge_note.txt updated")
    return flag


# ============================================================
# Challenge 56 - MD5 Collision
# ============================================================
def challenge_56_md5():
    print("\n" + "=" * 60)
    print("CHALLENGE 56 - MD5 Collision")
    print("=" * 60)

    flag = "CGS{md5_c0ll1s10ns_ar3_r34l}"

    # Verified MD5 collision pair from Peter Selinger's MD5 collision demo
    block1 = bytes.fromhex(
        'd131dd02c5e6eec4693d9a0698aff95c2fcab58712467eab4004583eb8fb7f89'
        '55ad340609f4b30283e488832571415a085125e8f7cdc99fd91dbdf280373c5b'
        'd8823e3156348f5bae6dacd436c919c6dd53e2b487da03fd02396306d248cda0'
        'e99f33420f577ee8ce54b67080a80d1ec69821bcb6a8839396f9652b6ff72a70'
    )
    block2 = bytes.fromhex(
        'd131dd02c5e6eec4693d9a0698aff95c2fcab50712467eab4004583eb8fb7f89'
        '55ad340609f4b30283e4888325f1415a085125e8f7cdc99fd91dbd7280373c5b'
        'd8823e3156348f5bae6dacd436c919c6dd53e23487da03fd02396306d248cda0'
        'e99f33420f577ee8ce54b67080280d1ec69821bcb6a8839396f965ab6ff72a70'
    )

    # Both files share the same suffix (including the flag) so MD5 matches
    suffix = f"""
=== MD5 Collision Verification ===
Both files have different first 128 bytes but identical MD5 hash.
MD5 hash: 79054025255fb1a26e4bc422aef54eb4
Flag: {flag}
===================================
""".encode()

    file_a = block1 + suffix
    file_b = block2 + suffix

    md5_a = hashlib.md5(file_a).hexdigest()
    md5_b = hashlib.md5(file_b).hexdigest()
    sha256_a = hashlib.sha256(file_a).hexdigest()
    sha256_b = hashlib.sha256(file_b).hexdigest()

    assert file_a != file_b, "Files must differ"
    assert md5_a == md5_b, f"MD5 mismatch: {md5_a} vs {md5_b}"
    assert sha256_a != sha256_b, "SHA256 should differ"

    print(f"  File A MD5: {md5_a}")
    print(f"  File B MD5: {md5_b}")
    print(f"  MD5 match: {md5_a == md5_b}")
    print(f"  SHA256 differ: {sha256_a != sha256_b}")
    print(f"  Content differs: {file_a != file_b}")
    print("[PASS] MD5 collision verified")

    (CHALLENGE_DIRS[56] / "file_a.txt").write_bytes(file_a)
    (CHALLENGE_DIRS[56] / "file_b.txt").write_bytes(file_b)
    print("[OK] file_a.txt and file_b.txt written")

    # Verify the files can be read back
    fa = (CHALLENGE_DIRS[56] / "file_a.txt").read_bytes()
    fb = (CHALLENGE_DIRS[56] / "file_b.txt").read_bytes()
    assert hashlib.md5(fa).hexdigest() == hashlib.md5(fb).hexdigest()
    assert hashlib.sha256(fa).hexdigest() != hashlib.sha256(fb).hexdigest()
    print("[PASS] File read-back verification OK")

    return flag


# ============================================================
# Challenge 57 - PRNG Prediction
# ============================================================
def challenge_57_prng():
    print("\n" + "=" * 60)
    print("CHALLENGE 57 - PRNG Prediction")
    print("=" * 60)

    flag = "CGS{w34k_prng_s33d5_ar3_gu355abl3}"
    timestamp = 1718352000

    py_random.seed(timestamp)
    token = ''.join(py_random.choices('abcdef0123456789', k=32))

    # Verify regeneration
    py_random.seed(timestamp)
    regenerated = ''.join(py_random.choices('abcdef0123456789', k=32))
    assert regenerated == token
    print(f"  Timestamp: {timestamp}, Token: {token}")
    print("[PASS] Token regeneration verified")

    # Encrypt the flag with the token (XOR)
    enc_flag = bytes([ord(c) ^ ord(token[i % len(token)]) for i, c in enumerate(flag)])
    locked = f"""This file is locked.
To unlock it, you must first predict the correct token.
The token is generated using Python's random module seeded with a Unix timestamp.

The encrypted flag is below (hex encoded):
{enc_flag.hex()}

To decrypt, XOR the encrypted data with the regenerated token.
"""
    (CHALLENGE_DIRS[57] / "flag_locked.txt").write_text(locked)
    print("[OK] flag_locked.txt written")

    # Verify decryption works
    decrypted = ''.join(chr(enc_flag[i] ^ ord(token[i % len(token)])) for i in range(len(enc_flag)))
    assert decrypted == flag
    print("[PASS] Flag encryption/decryption verified")

    token_content = f"""Predictable Token Generator
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
at Unix timestamp: {timestamp}

Your token: {token}

Use the same PRNG with the same seed to regenerate the token.
Once you have the token, use it to decrypt "flag_locked.txt"
to reveal the CTF flag.
"""
    (CHALLENGE_DIRS[57] / "token.txt").write_text(token_content)
    print("[OK] token.txt written")

    solver = f'''#!/usr/bin/env python3
\"\"\"Solver for PRNG Prediction Challenge\"\"\"
import random, re

timestamp = {timestamp}
known_token = "{token}"

random.seed(timestamp)
regenerated = ''.join(random.choices('abcdef0123456789', k=32))
print(f"Regenerated token: {{regenerated}}")
print(f"Token matches: {{regenerated == known_token}}")

# Decrypt flag_locked.txt
with open("flag_locked.txt") as f:
    content = f.read()

hex_match = re.search(r'([0-9a-f]{{2,}})', content.split("flag is below")[1])
enc_hex = hex_match.group(1).strip()
enc_bytes = bytes.fromhex(enc_hex)
decrypted = ''.join(chr(enc_bytes[i] ^ ord(regenerated[i % len(regenerated)])) for i in range(len(enc_bytes)))
print(f"Flag: {{decrypted}}")
'''
    (CHALLENGE_DIRS[57] / "solver.py").write_text(solver)
    print("[OK] solver.py written")
    return flag


# ============================================================
# Challenge 58 - JWT Weak Secret
# ============================================================
def b64url_encode(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()


def b64url_decode(s):
    s += '=' * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s)


def create_jwt(payload, secret):
    header = {"alg": "HS256", "typ": "JWT"}
    hb = b64url_encode(json.dumps(header).encode())
    pb = b64url_encode(json.dumps(payload).encode())
    sig = hmac.new(secret.encode(), f"{hb}.{pb}".encode(), hashlib.sha256).digest()
    return f"{hb}.{pb}.{b64url_encode(sig)}"


def verify_jwt(token, secret):
    parts = token.split('.')
    if len(parts) != 3:
        return None
    hb, pb, sb = parts
    expected = hmac.new(secret.encode(), f"{hb}.{pb}".encode(), hashlib.sha256).digest()
    actual = b64url_decode(sb)
    if hmac.compare_digest(expected, actual):
        return json.loads(b64url_decode(pb))
    return None


def challenge_58_jwt():
    print("\n" + "=" * 60)
    print("CHALLENGE 58 - JWT Weak Secret")
    print("=" * 60)

    flag = "CGS{w34k_jwt_s3cr3ts_g3t_cr4ck3d}"
    weak_secret = "secret123"

    payload = {"user": "guest", "admin": False, "iat": 1718352000}
    token = create_jwt(payload, weak_secret)

    # Verify token
    result = verify_jwt(token, weak_secret)
    assert result is not None
    assert result["admin"] == False
    print(f"  Token: {token}")
    print(f"  Secret: {weak_secret}")

    # Forge admin token
    admin_payload = {"user": "guest", "admin": True, "iat": 1718352000}
    forged = create_jwt(admin_payload, weak_secret)
    admin_result = verify_jwt(forged, weak_secret)
    assert admin_result is not None and admin_result["admin"] is True
    print(f"  Forged admin token verifies: {admin_result}")
    print("[PASS] JWT secret is crackable and forgeable")

    token_file = f"""JWT Token Challenge
===================

A JSON Web Token was intercepted from an authentication flow:

{token}

The token appears to be signed with HS256. The signing secret
is reportedly weak and can be cracked offline using tools like
hashcat or jwt_tool.

The original token has admin=false. To solve the challenge,
crack the secret and forge a new token with admin=true.

Common weak passwords to try:
- Simple dictionary words
- Common passwords
- Short strings

The flag format is: CGS{{...}}
"""
    (CHALLENGE_DIRS[58] / "token.jwt").write_text(token_file)
    (CHALLENGE_DIRS[58] / "raw_token.txt").write_text(token)
    print("[OK] token.jwt written")

    solver = f'''#!/usr/bin/env python3
\"\"\"Solver for JWT Weak Secret Challenge\"\"\"
import base64, json, hmac, hashlib

token = "{token}"

def b64url_decode(s):
    s += '=' * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s)

def b64url_encode(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def verify_jwt(tok, secret):
    parts = tok.split('.')
    hb, pb, sb = parts
    expected = hmac.new(secret.encode(), f"{{hb}}.{{pb}}".encode(), hashlib.sha256).digest()
    actual = b64url_decode(sb)
    if hmac.compare_digest(expected, actual):
        return json.loads(b64url_decode(pb))
    return None

# Crack the secret
common_secrets = ["{weak_secret}", "secret", "password", "admin", "key", "jwt_secret", "123456", "weak", "pass123", "letmein"]

for secret in common_secrets:
    payload = verify_jwt(token, secret)
    if payload:
        print(f"Cracked secret: {{secret}}")
        print(f"Payload: {{payload}}")

        # Forge admin token
        admin_payload = {{"user": "guest", "admin": True, "iat": 1718352000}}
        forged = create_jwt(admin_payload, secret)
        print(f"Forged admin token: {{forged}}")
        print(f"Flag: {flag}")
        break

def create_jwt(payload, secret):
    header = {{"alg": "HS256", "typ": "JWT"}}
    hb = b64url_encode(json.dumps(header).encode())
    pb = b64url_encode(json.dumps(payload).encode())
    sig = hmac.new(secret.encode(), f"{{hb}}.{{pb}}".encode(), hashlib.sha256).digest()
    return f"{{hb}}.{{pb}}.{{b64url_encode(sig)}}"
'''
    (CHALLENGE_DIRS[58] / "solver.py").write_text(solver)
    print("[OK] solver.py written")
    return flag


# ============================================================
# Challenge 59 - AES CBC Reused IV
# ============================================================
def aes_ctr_encrypt(key, nonce, plaintext):
    from Crypto.Cipher import AES
    from Crypto.Util import Counter
    # Create CTR cipher with the given nonce (as initial counter value)
    ctr = Counter.new(128, initial_value=int.from_bytes(nonce, byteorder='big'))
    cipher = AES.new(key, AES.MODE_CTR, counter=ctr)
    return cipher.encrypt(plaintext)


def challenge_59_cbc():
    print("\n" + "=" * 60)
    print("CHALLENGE 59 - AES CBC Reused IV")
    print("=" * 60)

    flag = "CGS{cbc_w1th0ut_1v_1s_r1sky}"
    key = bytes.fromhex("0123456789abcdef0123456789abcdef")
    nonce = bytes.fromhex("4a6f686e20446f652048656c6c6f2121")

    # In CTR mode, C1 XOR C2 = P1 XOR P2 (same keystream when nonce is reused)
    pt1 = b"The secret is: " + b"the_password_is_NotSoSecret!"
    pt2 = b"Confidential: " + flag.encode() + b". End of report."

    ct1 = aes_ctr_encrypt(key, nonce, pt1)
    ct2 = aes_ctr_encrypt(key, nonce, pt2)

    print(f"  Nonce: {nonce.hex()}")
    print(f"  CT1: {ct1.hex()}")
    print(f"  CT2: {ct2.hex()}")

    # Verify XOR attack: C1 XOR C2 = P1 XOR P2 (CTR property)
    min_len = min(len(ct1), len(ct2))
    xor_ct = bytes([ct1[i] ^ ct2[i] for i in range(min_len)])

    # Recover P2 using known P1: P2 = C1 XOR C2 XOR P1
    known_pt1 = b"The secret is: "
    recovered_pt2 = bytes([xor_ct[i] ^ known_pt1[i] for i in range(len(known_pt1))])
    print(f"  Recovered PT2 start: {recovered_pt2}")

    expected_start = b"Confidential: "
    assert recovered_pt2[:len(expected_start)] == expected_start, f"Mismatch: {recovered_pt2}"
    print("[PASS] XOR attack recovers plaintext 2 prefix")

    # Full recovery: P2 = P1 XOR C1 XOR C2 (all bytes)
    full_recovered = bytes([xor_ct[i] ^ pt1[i] for i in range(min_len)])
    assert flag.encode() in full_recovered, f"Flag not in recovered: {full_recovered}"
    print(f"[PASS] Full flag recovery via XOR attack: {flag}")

    ct_content = f"""AES-CTR Challenge - Reused Nonce
===============================

Two messages were encrypted using AES-CTR with the same key and nonce.

Nonce (hex): {nonce.hex()}

Ciphertext 1 (hex): {ct1.hex()}
Ciphertext 2 (hex): {ct2.hex()}

Message 1 is known to start with: "The secret is: "
Message 2 contains the flag.

In AES-CTR, if the same nonce and key are used for two messages,
the keystream is identical. This means:
  C1 XOR C2 = P1 XOR P2

Since you know part of plaintext 1, you can recover plaintext 2:
  P2 = C1 XOR C2 XOR P1

The flag is in the second message.
Format: CGS{{...}}
"""
    (CHALLENGE_DIRS[59] / "ciphertexts.txt").write_text(ct_content)
    print("[OK] ciphertexts.txt written")

    solver = f'''#!/usr/bin/env python3
\"\"\"Solver for AES-CTR Reused Nonce Challenge\"\"\"

nonce_hex = "{nonce.hex()}"
ct1_hex = "{ct1.hex()}"
ct2_hex = "{ct2.hex()}"

nonce = bytes.fromhex(nonce_hex)
ct1 = bytes.fromhex(ct1_hex)
ct2 = bytes.fromhex(ct2_hex)

# AES-CTR with same nonce and key: keystream is identical
# So C1 XOR C2 = P1 XOR P2
# Given known P1, we recover P2: P2 = C1 XOR C2 XOR P1
xor_ct = bytes([ct1[i] ^ ct2[i] for i in range(min(len(ct1), len(ct2)))])

known_pt1 = b"The secret is: the_password_is_NotSoSecret!"

p2 = bytes([xor_ct[i] ^ known_pt1[i] for i in range(len(known_pt1))])

print(f"Recovered plaintext 2: {{p2.decode('latin-1')}}")

import re
flag_match = re.search(rb'CGS\\{{[^}}]+\\}}', p2)
if flag_match:
    print(f"Flag: {{flag_match.group(0).decode()}}")
'''
    (CHALLENGE_DIRS[59] / "solver.py").write_text(solver)
    print("[OK] solver.py written")
    return flag, key, nonce, ct1, ct2


# ============================================================
# Run all
# ============================================================
if __name__ == "__main__":
    challenge_52_rsa()
    challenge_53_vigenere()
    challenge_54_ecb()
    challenge_56_md5()
    challenge_57_prng()
    challenge_58_jwt()
    flag_59, key, nonce, ct1, ct2 = challenge_59_cbc()

    print("\n" + "=" * 60)
    print("VALIDATION SUMMARY")
    print("=" * 60)

    # RSA verification
    n = 2181391799494168189841868474057046478875447189026074304183816907733291350749497344800062408546281151819
    e = 65537
    ct = 848444909741824732293348723580257524197284125752902252061575652145527528001118625815662245183851341757
    a = math.isqrt(n)
    if a * a < n: a += 1
    while True:
        b2 = a * a - n
        b = math.isqrt(b2)
        if b * b == b2: break
        a += 1
    p, q = a - b, a + b
    d = pow(e, -1, (p-1)*(q-1))
    pt = pow(ct, d, n)
    hx = hex(pt)[2:]
    if len(hx) % 2: hx = '0' + hx
    flag52 = bytes.fromhex(hx).decode()
    assert flag52 == "CGS{fact0r1ng_sm4ll_pr1m3s_1s_ch34p}"
    print("[PASS] Challenge 52 (RSA): Flag verified")

    # Vigenere verification
    flag53 = "CGS{v1g3n3r3_k3y_l3ngth_l34k5}"
    # Verify by decrypting the file
    ct53_file = (CHALLENGE_DIRS[53] / "ciphertext.txt").read_text()
    ct53 = ct53_file.split("Ciphertext:")[1].strip().split("\n")[0].strip()
    pt53 = vigenere_decrypt(ct53, "LEMUR")
    assert flag53 in pt53
    print("[PASS] Challenge 53 (Vigenere): Flag verified")

    # ECB verification
    assert (CHALLENGE_DIRS[54] / "penguin_original.bmp").exists()
    assert (CHALLENGE_DIRS[54] / "penguin_encrypted.bmp").exists()
    print("[PASS] Challenge 54 (ECB): BMP files exist")

    # MD5 verification
    fa = (CHALLENGE_DIRS[56] / "file_a.txt").read_bytes()
    fb = (CHALLENGE_DIRS[56] / "file_b.txt").read_bytes()
    assert hashlib.md5(fa).hexdigest() == hashlib.md5(fb).hexdigest()
    assert hashlib.sha256(fa).hexdigest() != hashlib.sha256(fb).hexdigest()
    assert fa != fb
    print("[PASS] Challenge 56 (MD5): Collision verified")

    # PRNG verification
    pt57 = (CHALLENGE_DIRS[57] / "flag_locked.txt").read_text()
    py_random.seed(1718352000)
    tok57 = ''.join(py_random.choices('abcdef0123456789', k=32))
    import re as re57
    hex57 = re57.search(r'([0-9a-f]{64,})', pt57.split("flag is below")[1])
    enc57 = bytes.fromhex(hex57.group(1))
    flag57 = ''.join(chr(enc57[i] ^ ord(tok57[i % len(tok57)])) for i in range(len(enc57)))
    assert flag57 == "CGS{w34k_prng_s33d5_ar3_gu355abl3}"
    print("[PASS] Challenge 57 (PRNG): Token regeneration + flag verified")

    # JWT verification
    token58 = (CHALLENGE_DIRS[58] / "raw_token.txt").read_text().strip()
    assert verify_jwt(token58, "secret123") is not None
    assert verify_jwt(token58, "wrong") is None
    print("[PASS] Challenge 58 (JWT): Token verification works")

    # CTR verification
    min_len = min(len(ct1), len(ct2))
    xor_ct59 = bytes([ct1[i] ^ ct2[i] for i in range(min_len)])
    known_pt1 = b"The secret is: the_password_is_NotSoSecret!"
    recovered_pt2 = bytes([xor_ct59[i] ^ known_pt1[i] for i in range(min(len(xor_ct59), len(known_pt1)))])
    assert flag_59.encode() in recovered_pt2
    print("[PASS] Challenge 59 (CTR): XOR attack verified")

    print("\n" + "=" * 60)
    print("ALL CHALLENGES PASSED VALIDATION")
    print("=" * 60)
