#!/usr/bin/env python3
"""Solver for Vigenere challenge."""
import re
from collections import Counter

ciphertext = """Elq zfwpaqzyk uhkppxcxproy iptalk tw ofrdwuzzph fig diolve. Exf rriznj xyen vywglv ys oigtie uip qmxv zj fbzd hawlxizn. Ksi fuirif brd fqye zfeyigip wfyhgwktrs mldtuwzzye utemhcktie hvlv fbv peenvcr oidasghu. Elq igpvmnzzr oiuprmgvo Tdiapgf Hzrlfcerexy zd tdixciemzyk. Fbv lgoyjd gaxv qsd nyp wqwlci hulwx tuj miqh tsezavo xa WXD{z1s3h3i3_v3c_x3hxel_x34e5}. Rwp blvgmaoj nspyj lvq cegexculxqx rd sr gzoruaye. Xty utvqwkzv alupvqx r qyxf ipzuyn zj eytfvunp avanfnsxm wzpxintrs nyp vqwvyx nlvlgt ce dionfc wqpvy. Xty vygdsgemah bpce qzwp ny izxmnvo ihyij jalkj iuaye laoid. Xtcj nszwcfhqm ksi uhkppxcxproy scmqzzyk.""".strip()

def kasiski_examination(ct, max_k=12):
    trigrams = {}
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
    freq = {}
    for ch in letters:
        freq[ch] = freq.get(ch, 0) + 1
    return sum(f * (f - 1) for f in freq.values()) / (n * (n - 1))

def get_column(text, key_len, col):
    letters = [c for c in text if c.isalpha()]
    return ''.join(letters[i] for i in range(col, len(letters), key_len))

def freq_analysis_column(column):
    expected = {'A': 0.08167, 'B': 0.01492, 'C': 0.02782, 'D': 0.04253,
        'E': 0.12702, 'F': 0.02228, 'G': 0.02015, 'H': 0.06094,
        'I': 0.06966, 'J': 0.00153, 'K': 0.00772, 'L': 0.04025,
        'M': 0.02406, 'N': 0.06749, 'O': 0.07507, 'P': 0.01929,
        'Q': 0.00095, 'R': 0.05987, 'S': 0.06327, 'T': 0.09056,
        'U': 0.02758, 'V': 0.00978, 'W': 0.02360, 'X': 0.00150,
        'Y': 0.01974, 'Z': 0.00074}
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
print(f"Top factors: {factors}")
key_len = factors[0] if factors else 5

# Step 2: Index of Coincidence
print("\n=== Index of Coincidence ===")
for kl in range(2, 11):
    avg_ioc = sum(index_of_coincidence(get_column(ciphertext, kl, c)) for c in range(kl)) / kl
    print(f"  Key len {kl}: avg IOC = {avg_ioc:.4f}")

# Step 3: Frequency analysis
print("\n=== Key Recovery ===")
key = ''.join(chr(freq_analysis_column(get_column(ciphertext, key_len, c)) + ord('A')) for c in range(key_len))
print(f"Recovered key: {key}")

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
print(f"\n=== Decrypted Message ===")
print(plaintext[:200] + "...")

flag_match = re.search(r'CGS\{[^}]+\}', plaintext)
if flag_match:
    print(f"\nFlag: {flag_match.group(0)}")
