#!/usr/bin/env python3
"""
Phoenix Protocol - Hard RE Challenge Generator (v3)
=====================================================
Generates a Windows x64 PE with packer, anti-debug, anti-VM,
custom VM, runtime key derivation, AES-256-CBC.

Flag: CGS{rise_from_the_ashes_of_analysis}
"""

import struct, os, hashlib
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from keystone import Ks, KS_ARCH_X86, KS_MODE_64

FLAG = b'CGS{rise_from_the_ashes_of_analysis}'
AES_IV = bytes([0x4F,0x1A,0x7B,0x2C,0x9E,0x3D,0x56,0x88,
                0xA1,0xF0,0xC4,0x67,0x23,0xB8,0x15,0xDE])
PACKER_KEY = 0xA7
IMAGE_BASE = 0x140000000

def derive_aes_key(seed):
    k = seed
    for _ in range(256):
        k = hashlib.sha256(k).digest()
    k = hashlib.sha256(k + b'PhoenixProtocol').digest()
    k = hashlib.sha256(k + bytes([0xDE,0xAD,0xBE,0xEF])).digest()
    return k

def asm(code):
    ks = Ks(KS_ARCH_X86, KS_MODE_64)
    enc, _ = ks.asm(code)
    return bytes(enc)

def build_pe(text_bytes, rdata_bytes, data_bytes, idata_bytes, entry_rva):
    HDR = 0x400
    FA = 0x200
    VA = 0x1000
    def align(v, a): return ((v + a - 1) // a) * a
    
    text_raw = align(len(text_bytes) or 1, FA)
    rdata_raw = align(len(rdata_bytes) or 1, FA)
    data_raw = align(len(data_bytes) or 1, FA)
    idata_raw = align(len(idata_bytes) or 1, FA)
    img = align(HDR + text_raw + rdata_raw + data_raw + idata_raw, VA)
    
    h = bytearray(HDR)
    h[0:2] = b'MZ'
    struct.pack_into('<I', h, 60, 0x80)
    struct.pack_into('<I', h, 0x80, 0x4550)
    struct.pack_into('<H', h, 0x84, 0x8664)
    struct.pack_into('<H', h, 0x86, 4)
    struct.pack_into('<H', h, 0x94, 0xF0)
    struct.pack_into('<H', h, 0x96, 0x22)
    struct.pack_into('<H', h, 0x98, 0x20B)
    struct.pack_into('B', h, 0x9A, 14)
    struct.pack_into('<I', h, 0x9C, text_raw)
    struct.pack_into('<I', h, 0xA8, entry_rva)
    struct.pack_into('<I', h, 0xAC, 0x1000)
    struct.pack_into('<Q', h, 0xB0, IMAGE_BASE)
    struct.pack_into('<I', h, 0xB8, VA)
    struct.pack_into('<I', h, 0xBC, FA)
    struct.pack_into('<H', h, 0xC0, 6)
    struct.pack_into('<H', h, 0xC8, 6)
    struct.pack_into('<I', h, 0xD0, img)
    struct.pack_into('<I', h, 0xD4, HDR)
    struct.pack_into('<H', h, 0xDC, 3)
    struct.pack_into('<Q', h, 0xE0, 0x100000)
    struct.pack_into('<Q', h, 0xE8, 0x1000)
    struct.pack_into('<Q', h, 0xF0, 0x100000)
    struct.pack_into('<Q', h, 0xF8, 0x1000)
    struct.pack_into('<I', h, 0x104, 16)
    
    secs = [
        (b'.text\x00\x00\x00', 0x1000, text_raw, 0x60000020),
        (b'.rdata\x00\x00', 0x10000, rdata_raw, 0x40000040),
        (b'.data\x00\x00\x00', 0x20000, data_raw, 0xC0000040),
        (b'.idata\x00\x00', 0x30000, idata_raw, 0xC0000040),
    ]
    raws = [HDR, HDR+text_raw, HDR+text_raw+rdata_raw, HDR+text_raw+rdata_raw+data_raw]
    
    so = 0x98 + 0xF0  # After Optional Header (240 bytes)
    for i, (nm, rva, rsz, ch) in enumerate(secs):
        h[so:so+8] = nm
        struct.pack_into('<I', h, so+8, rsz)
        struct.pack_into('<I', h, so+12, rva)
        struct.pack_into('<I', h, so+16, rsz)
        struct.pack_into('<I', h, so+20, raws[i])
        struct.pack_into('<I', h, so+36, ch)
        so += 40
    
    out = bytearray(h)
    out += bytearray(text_bytes.ljust(text_raw, b'\x00'))
    out += bytearray(rdata_bytes.ljust(rdata_raw, b'\x00'))
    out += bytearray(data_bytes.ljust(data_raw, b'\x00'))
    out += bytearray(idata_bytes.ljust(idata_raw, b'\x00'))
    return bytes(out)


def build_text_section(aes_key, enc_flag, vm_bc):
    iat = IMAGE_BASE + 0x30000
    
    # Anti-debug section (labels BEFORE jumps)
    ad = asm(f"""
    sub rsp, 0x28
    mov r15, {hex(iat)}
    .check1:
    call qword ptr [r15 + 0x18]
    test eax, eax
    .fail1:
    jnz .exit_fail
    .check2:
    mov rax, qword ptr gs:[0x60]
    movzx eax, byte ptr [rax + 2]
    test eax, eax
    .fail2:
    jnz .exit_fail
    .check3:
    mov rax, qword ptr gs:[0x60]
    mov eax, dword ptr [rax + 0xBC]
    and eax, 0x70
    test eax, eax
    .fail3:
    jnz .exit_fail
    .check4:
    rdtsc
    shl rdx, 32
    or rax, rdx
    mov r12, rax
    mov rcx, 0x10000
    .busyloop:
    dec rcx
    jnz .busyloop
    rdtsc
    shl rdx, 32
    or rax, rdx
    sub rax, r12
    cmp rax, 0x100000
    .fail4:
    ja .exit_fail
    .done:
    jmp .antidebug_done
    .exit_fail:
    xor ecx, ecx
    inc ecx
    call qword ptr [r15 + 0x10]
    .antidebug_done:
    add rsp, 0x28
    """)
    
    # Anti-VM section
    av = asm(f"""
    push rbx
    mov eax, 1
    cpuid
    test ecx, 0x80000000
    pop rbx
    jnz .vm_exit
    jmp .antivm_done
    .vm_exit:
    sub rsp, 0x28
    mov r15, {hex(iat)}
    mov ecx, 2
    call qword ptr [r15 + 0x10]
    add rsp, 0x28
    .antivm_done:
    """)
    
    # VM interpreter
    vm = asm(f"""
    sub rsp, 0x58
    mov r15, {hex(iat)}
    mov r14, {hex(IMAGE_BASE + 0x20000)}
    xor eax, eax
    mov rdi, r14
    mov rcx, 0x200
    rep stosb
    mov qword ptr [r14 + 0x100], 0x40
    mov rsi, {hex(IMAGE_BASE + 0x10000 + 0x44)}
    .vm_dispatch:
    movzx eax, byte ptr [rsi]
    inc rsi
    cmp al, 0x01
    je .vm_end
    cmp al, 0x02
    je .op_push
    cmp al, 0x0E
    je .op_xor
    cmp al, 0x12
    je .op_rol
    cmp al, 0x1A
    je .op_hash
    cmp al, 0x1B
    je .op_rotate
    cmp al, 0x1C
    je .op_derive
    cmp al, 0x22
    je .op_istore
    cmp al, 0x20
    je .op_printchar
    cmp al, 0x24
    je .op_dup
    jmp .vm_dispatch
    .op_push:
    movzx ecx, byte ptr [rsi]
    inc rsi
    mov rdx, qword ptr [r14 + 0x100]
    mov byte ptr [r14 + rdx + 0x40], cl
    inc qword ptr [r14 + 0x100]
    jmp .vm_dispatch
    .op_xor:
    mov rcx, qword ptr [r14 + 0x100]
    dec rcx
    movzx eax, byte ptr [r14 + rcx + 0x40]
    movzx edx, byte ptr [r14 + rcx + 0x3F]
    xor eax, edx
    mov byte ptr [r14 + rcx + 0x40], al
    mov qword ptr [r14 + 0x100], rcx
    jmp .vm_dispatch
    .op_rol:
    movzx ecx, byte ptr [rsi]
    inc rsi
    mov rdx, qword ptr [r14 + 0x100]
    dec rdx
    movzx eax, byte ptr [r14 + rdx + 0x40]
    rol al, cl
    mov byte ptr [r14 + rdx + 0x40], al
    mov qword ptr [r14 + 0x100], rdx
    jmp .vm_dispatch
    .op_hash:
    mov rcx, qword ptr [r14 + 0x100]
    dec rcx
    movzx eax, byte ptr [r14 + rcx + 0x40]
    imul eax, eax, 0x9E3779B9
    xor eax, 0xDEADBEEF
    mov byte ptr [r14 + rcx + 0x40], al
    mov qword ptr [r14 + 0x100], rcx
    jmp .vm_dispatch
    .op_rotate:
    movzx ecx, byte ptr [rsi]
    inc rsi
    mov rdx, qword ptr [r14 + 0x100]
    dec rdx
    movzx eax, byte ptr [r14 + rdx + 0x40]
    ror al, cl
    mov byte ptr [r14 + rdx + 0x40], al
    mov qword ptr [r14 + 0x100], rdx
    jmp .vm_dispatch
    .op_derive:
    mov rcx, qword ptr [r14 + 0x100]
    dec rcx
    movzx eax, byte ptr [r14 + rcx + 0x40]
    xor eax, 0x37
    shl al, 1
    or al, 0x01
    mov byte ptr [r14 + rcx + 0x40], al
    mov qword ptr [r14 + 0x100], rcx
    jmp .vm_dispatch
    .op_istore:
    movzx ecx, byte ptr [rsi]
    inc rsi
    mov rdx, qword ptr [r14 + 0x100]
    dec rdx
    movzx eax, byte ptr [r14 + rdx + 0x40]
    mov byte ptr [r14 + rcx], al
    mov qword ptr [r14 + 0x100], rdx
    jmp .vm_dispatch
    .op_printchar:
    mov rcx, qword ptr [r14 + 0x100]
    dec rcx
    movzx eax, byte ptr [r14 + rcx + 0x40]
    mov qword ptr [r14 + 0x100], rcx
    mov byte ptr [rsp + 0x40], al
    lea rcx, [rsp + 0x40]
    mov edx, 1
    mov r8, -11
    call qword ptr [r15]
    jmp .vm_dispatch
    .op_dup:
    mov rcx, qword ptr [r14 + 0x100]
    movzx eax, byte ptr [r14 + rcx + 0x3F]
    mov byte ptr [r14 + rcx + 0x40], al
    inc qword ptr [r14 + 0x100]
    jmp .vm_dispatch
    .vm_end:
    xor eax, eax
    mov rdi, r14
    mov rcx, 0x200
    rep stosb
    add rsp, 0x58
    """)
    
    # Flag print section (XOR decrypt with VM-derived key, then WriteConsoleA)
    fp = asm(f"""
    sub rsp, 0x28
    mov r15, {hex(iat)}
    mov r14, {hex(IMAGE_BASE + 0x20000)}
    mov rsi, {hex(IMAGE_BASE + 0x10000)}
    lea rdi, [rsp + 0x30]
    mov rcx, 36
    .dloop:
    movzx eax, byte ptr [rsi]
    movzx edx, byte ptr [r14]
    xor eax, edx
    mov byte ptr [rdi], al
    inc rsi
    inc rdi
    inc r14
    dec rcx
    jnz .dloop
    mov byte ptr [rdi], 0
    lea rcx, [rsp + 0x30]
    mov edx, 36
    lea r8, [rsp + 0x20]
    mov qword ptr [r8], 0
    mov r8, -11
    call qword ptr [r15]
    mov byte ptr [rsp + 0x30], 0x0A
    lea rcx, [rsp + 0x30]
    mov edx, 1
    lea r8, [rsp + 0x20]
    mov qword ptr [r8], 0
    mov r8, -11
    call qword ptr [r15]
    add rsp, 0x28
    """)
    
    # Exit section
    ex = asm(f"""
    mov r15, {hex(iat)}
    mov r14, {hex(IMAGE_BASE + 0x20000)}
    xor eax, eax
    mov rdi, r14
    mov rcx, 0x200
    rep stosb
    xor ecx, ecx
    call qword ptr [r15 + 0x10]
    """)
    
    return ad + av + vm + fp + ex


def main():
    print("=" * 60)
    print("  PHOENIX PROTOCOL - Challenge Generator v3")
    print("=" * 60)
    
    aes_key = derive_aes_key(b'PhoenixProtocol_CGS_2026')
    cipher = AES.new(aes_key, AES.MODE_CBC, AES_IV)
    enc_flag = cipher.encrypt(pad(FLAG, 16))
    
    # Verify AES
    cipher2 = AES.new(aes_key, AES.MODE_CBC, AES_IV)
    pt = unpad(cipher2.decrypt(enc_flag), 16)
    assert pt == FLAG
    print(f"[+] AES: OK")
    
    # Build VM bytecode
    bc = bytearray()
    for b in aes_key[:8]:
        bc += bytes([0x02, b])
    consts = [0x5A,0x3D,0x7E,0x91,0x8B,0x2F,0x4A,0x6C,
              0x1E,0x95,0xD3,0xB7,0xF4,0xC8,0xA2,0x06]
    rots = [3,5,7,1,4,2,6,3,5,7,1,4,2,6,3,5]
    for i in range(16):
        bc += bytes([0x02, consts[i]])
        bc += bytes([0x0E])
        bc += bytes([0x12, rots[i]])
        if i % 3 == 0:   bc += bytes([0x1A])
        elif i % 3 == 1: bc += bytes([0x1B, (i%5)+1])
        else:            bc += bytes([0x1C])
    for i in range(32):
        bc += bytes([0x24])
        bc += bytes([0x02, i*7&0xFF])
        bc += bytes([0x0E])
        bc += bytes([0x22, 0x20+i])
    bc += bytes([0x02, 0x01])
    bc += bytes([0x01])
    
    print(f"[+] VM bytecode: {len(bc)} bytes")
    
    # Build text section
    print("[*] Assembling code...")
    text_code = build_text_section(aes_key, enc_flag, bytes(bc))
    print(f"    Code: {len(text_code)} bytes")
    
    # Pad to 8KB
    text_padded = bytearray(text_code)
    while len(text_padded) < 0x2000:
        text_padded += b'\x90'
    
    # Build .rdata
    rdata = bytearray()
    rdata += enc_flag
    rdata += AES_IV
    rdata += struct.pack('<I', len(bc))
    rdata += bc
    rdata += bytes([PACKER_KEY])
    rdata += hashlib.sha256(aes_key).digest()
    while len(rdata) < 0x1000:
        rdata += b'\x00'
    
    # Build .data
    data = bytearray(0x1000)
    
    # Build .idata
    idata = bytearray(0x1000)
    
    # Apply packer
    print("[*] Packing .text...")
    packed = bytearray(text_padded)
    for i in range(len(packed)):
        packed[i] ^= PACKER_KEY
    
    # Build PE
    print("[*] Building PE...")
    pe = build_pe(bytes(packed), bytes(rdata), bytes(data), bytes(idata), 0x1000)
    
    out_dir = os.path.dirname(os.path.abspath(__file__))
    exe_path = os.path.join(out_dir, 'phoenix.exe')
    with open(exe_path, 'wb') as f:
        f.write(pe)
    print(f"[+] Written: {exe_path} ({len(pe)} bytes)")
    
    # Verify
    import pefile
    p = pefile.PE(exe_path)
    print(f"[+] PE: Machine=0x{p.FILE_HEADER.Machine:04X} Sections={len(p.sections)}")
    for s in p.sections:
        name = s.Name.rstrip(b'\x00').decode()
        print(f"    {name}: VA=0x{s.VirtualAddress:X} Raw=0x{s.SizeOfRawData:X}")
    p.close()
    
    # Generate docs
    docs_dir = os.path.join(out_dir, 'docs')
    os.makedirs(docs_dir, exist_ok=True)
    
    with open(os.path.join(docs_dir, 'writeup.md'), 'w') as f:
        f.write(f"""# Phoenix Protocol - Official Writeup

## Flag: `CGS{{rise_from_the_ashes_of_analysis}}`
## AES Key: {aes_key.hex()}
## AES IV: {AES_IV.hex()}
## Packer Key: 0x{PACKER_KEY:02X}

## Solve Path

1. **Unpack** - XOR decrypt .text with key 0x{PACKER_KEY:02X}
2. **Anti-debug bypass** - Patch jumps to exit_fail
3. **Anti-VM bypass** - Patch CPUID check
4. **Reverse VM interpreter** - 10 opcodes: PUSH/XOR/ROL/HASH/ROTATE/DERIVE/ISTORE/PRINTCHAR/DUP/HALT
5. **Trace bytecode** - 16 rounds of key derivation
6. **Derive AES key** - SHA256 iterated with seed b'PhoenixProtocol_CGS_2026'
7. **Decrypt flag** - AES-256-CBC
""")
    
    with open(os.path.join(docs_dir, 'challenge.md'), 'w') as f:
        f.write("""# Phoenix Protocol

**Category:** Reverse Engineering  
**Difficulty:** Hard (4-8 hours)  
**Points:** 500

A mysterious binary with multiple protection layers. Reverse engineer the
custom VM and derive the AES key to recover the flag.

**Layers:** Packer, Anti-Debug, Anti-VM, Custom VM, Key Derivation, AES-256-CBC
""")
    
    with open(os.path.join(docs_dir, 'vm_architecture.md'), 'w') as f:
        f.write("""# VM Architecture

## Opcodes
| Op | Name | Operand | Description |
|----|------|---------|-------------|
| 0x01 | HALT | - | Stop |
| 0x02 | PUSH | imm8 | Push byte |
| 0x0E | XOR | - | a^b |
| 0x12 | ROL | n | Rotate left |
| 0x1A | HASH | - | Hash |
| 0x1B | ROTATE | n | Rotate right |
| 0x1C | DERIVE | - | Key derive |
| 0x20 | PRINTCHAR | - | Print char |
| 0x22 | ISTORE | addr | Store to state |
| 0x24 | DUP | - | Duplicate |

## Key Derivation
Push 8 seed bytes -> 16 mixing rounds -> Store 32 key bytes
""")
    
    print(f"[+] Docs: {docs_dir}")
    print(f"\n[+] DONE! Flag: {FLAG.decode()}")

if __name__ == '__main__':
    main()
