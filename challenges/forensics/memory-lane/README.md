# Memory Lane

**Category:** Forensics  
**Difficulty:** Hard  
**Points:** 475

## Description
We captured a memory dump from a compromised machine. Somewhere in all that noise, a secret process left its mark. Can you find the flag?

## Provided Files
- `dump.bin` — A 1 MB memory dump (synthetic)

## Objective
Extract the flag from the memory dump using forensic techniques like `strings`.

## Hints
- Try `strings dump.bin | grep -i cgs`
- The flag is stored in plaintext within the dump
- Tools like `volatility` can be used for real memory dumps, but here `strings` is enough

## Setup
```bash
python create_dump.py
```
