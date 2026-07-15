# Phoenix Protocol - Official Writeup

## Flag: `CGS{rise_from_the_ashes_of_analysis}`
## AES Key: 6e4d10f5c554977f3caeac536a33aded4e4d50f2726794c0f3e1214233556f5a
## AES IV: 4f1a7b2c9e3d5688a1f0c46723b815de
## Packer Key: 0xA7

## Solve Path

1. **Unpack** - XOR decrypt .text with key 0xA7
2. **Anti-debug bypass** - Patch jumps to exit_fail
3. **Anti-VM bypass** - Patch CPUID check
4. **Reverse VM interpreter** - 10 opcodes: PUSH/XOR/ROL/HASH/ROTATE/DERIVE/ISTORE/PRINTCHAR/DUP/HALT
5. **Trace bytecode** - 16 rounds of key derivation
6. **Derive AES key** - SHA256 iterated with seed b'PhoenixProtocol_CGS_2026'
7. **Decrypt flag** - AES-256-CBC
