#!/usr/bin/env python3
"""Solver for AES-CTR Reused Nonce Challenge"""

nonce_hex = "4a6f686e20446f652048656c6c6f2121"
ct1_hex = "9d214952f307d98e50c3797c138f92b0491f48ab29151b3aa69e807e852bc22ea62ad77495eb25443cdfe4"
ct2_hex = "8a264214e906df9241de38795a95f183720174b92b391f7cbd84d4549807ac16966ff744b4bf355d20d6eb6bbc774c55ca5d01662c66e6bfe487"

nonce = bytes.fromhex(nonce_hex)
ct1 = bytes.fromhex(ct1_hex)
ct2 = bytes.fromhex(ct2_hex)

# AES-CTR with same nonce and key: keystream is identical
# So C1 XOR C2 = P1 XOR P2
# Given known P1, we recover P2: P2 = C1 XOR C2 XOR P1
xor_ct = bytes([ct1[i] ^ ct2[i] for i in range(min(len(ct1), len(ct2)))])

known_pt1 = b"The secret is: the_password_is_NotSoSecret!"

p2 = bytes([xor_ct[i] ^ known_pt1[i] for i in range(len(known_pt1))])

print(f"Recovered plaintext 2: {p2.decode('latin-1')}")

import re
flag_match = re.search(rb'CGS\{[^}]+\}', p2)
if flag_match:
    print(f"Flag: {flag_match.group(0).decode()}")
