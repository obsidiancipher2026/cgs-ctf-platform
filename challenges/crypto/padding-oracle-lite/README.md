# Padding Oracle Lite

**Category:** Crypto  
**Difficulty:** Medium  
**Points:** 300  

## Description

The server tells you when your padding is wrong. That's the only weakness.

## Files

- `encrypted_flag.txt` — The encrypted flag (IV + ciphertext)
- `server.js` — The oracle source code

## Hints

- CBC mode has a well-known vulnerability when padding errors are exposed.
- Each byte of plaintext can be recovered with up to 256 queries per byte.
