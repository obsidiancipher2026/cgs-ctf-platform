#!/usr/bin/env python3
"""Solver for PRNG Prediction Challenge"""
import random, re

timestamp = 1718352000
known_token = "e05588b2b6bfe25b6aedd37a3b20b056"

random.seed(timestamp)
regenerated = ''.join(random.choices('abcdef0123456789', k=32))
print(f"Regenerated token: {regenerated}")
print(f"Token matches: {regenerated == known_token}")

# Decrypt flag_locked.txt
with open("flag_locked.txt") as f:
    content = f.read()

hex_match = re.search(r'([0-9a-f]{2,})', content.split("flag is below")[1])
enc_hex = hex_match.group(1).strip()
enc_bytes = bytes.fromhex(enc_hex)
decrypted = ''.join(chr(enc_bytes[i] ^ ord(regenerated[i % len(regenerated)])) for i in range(len(enc_bytes)))
print(f"Flag: {decrypted}")
