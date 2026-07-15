#!/usr/bin/env python3
"""
Generate Windows x64 PE executables for Reverse Engineering Easy challenges (58-62).
Uses keystone-engine for x64 assembly. Produces valid PE32+ console executables.
"""
import struct
import os
from keystone import Ks, KS_ARCH_X86, KS_MODE_64

BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'uploads', 'challenges')

def ensure_dir(d):
    os.makedirs(d, exist_ok=True)


class PE64Builder:
    def __init__(self, image_base=0x140000000):
        self.IB = image_base
        self.ks = Ks(KS_ARCH_X86, KS_MODE_64)
        self.code = bytearray()
        self.rodata = bytearray()
        self.data = bytearray()
        self.func_offsets = {}
        self.dll_name_offset = 0
    
    def add_string(self, label, data):
        offset = len(self.rodata)
        if not data.endswith(b'\x00'):
            data += b'\x00'
        self.rodata += data
        return self.IB + 0x10000 + offset
    
    def add_imports(self, dll, func_names):
        hints = {'printf': 0x0113, 'gets': 0x009A, 'strcmp': 0x01BC, 'puts': 0x0145}
        self.dll_name_offset = len(self.rodata)
        self.rodata += dll.encode('ascii') + b'\x00'
        for fn in func_names:
            self.func_offsets[fn] = len(self.rodata)
            h = hints.get(fn, 0x0100)
            self.rodata += struct.pack('<H', h) + fn.encode('ascii') + b'\x00'
    
    def asm(self, text):
        enc, _ = self.ks.asm(text)
        self.code += bytes(enc)
    
    def get_iat_addr(self, func_name):
        idx = list(self.func_offsets.keys()).index(func_name)
        return self.IB + 0x20000 + idx * 8
    
    def build(self):
        def align(data, a):
            return data + b'\x00' * ((a - len(data) % a) % a)
        
        FILE_ALIGN = 0x200
        SEC_ALIGN = 0x1000
        HEADERS = 0x400
        TEXT_RVA = 0x1000
        RDATA_RVA = 0x10000
        DATA_RVA = 0x20000
        
        code_raw = align(self.code, FILE_ALIGN)
        rodata_raw = align(self.rodata, FILE_ALIGN)
        num_imports = len(self.func_offsets)
        iat_size = (num_imports + 1) * 8
        self.data += b'\x00' * (iat_size - len(self.data)) if len(self.data) < iat_size else b''
        data_raw = align(bytes(self.data[:iat_size]), FILE_ALIGN)
        
        size_of_image = ((DATA_RVA + len(data_raw) + SEC_ALIGN - 1) // SEC_ALIGN) * SEC_ALIGN
        
        idt = bytearray()
        for i, fn in enumerate(self.func_offsets):
            fn_rva = RDATA_RVA + self.func_offsets[fn]
            dll_rva = RDATA_RVA + self.dll_name_offset
            idt += struct.pack('<IIIII', DATA_RVA + i * 8, 0, 0, dll_rva, DATA_RVA + i * 8)
        idt += b'\x00' * 20
        
        dos = bytearray(64)
        dos[0:2] = b'MZ'
        struct.pack_into('<I', dos, 60, 64)
        
        coff = struct.pack('<HHIIIHH', 0x8664, 3, 0, 0, 0, 0xF0, 0x0022)
        
        opt = bytearray(240)
        struct.pack_into('<H', opt, 0, 0x020B)
        struct.pack_into('<B', opt, 2, 14)
        struct.pack_into('<I', opt, 4, len(self.code))
        struct.pack_into('<I', opt, 16, TEXT_RVA)
        struct.pack_into('<Q', opt, 24, self.IB)
        struct.pack_into('<I', opt, 32, SEC_ALIGN)
        struct.pack_into('<I', opt, 36, FILE_ALIGN)
        struct.pack_into('<H', opt, 40, 6)
        struct.pack_into('<H', opt, 44, 6)
        struct.pack_into('<I', opt, 56, size_of_image)
        struct.pack_into('<I', opt, 60, HEADERS)
        struct.pack_into('<H', opt, 68, 3)
        struct.pack_into('<Q', opt, 72, 0x100000)
        struct.pack_into('<Q', opt, 80, 0x1000)
        struct.pack_into('<Q', opt, 88, 0x100000)
        struct.pack_into('<Q', opt, 96, 0x1000)
        struct.pack_into('<I', opt, 108, 16)
        struct.pack_into('<II', opt, 120, DATA_RVA, len(idt))
        struct.pack_into('<II', opt, 208, DATA_RVA, iat_size)
        
        sections = bytearray()
        for name, vsize, va, rawsize, rawoff, chars in [
            (b'.text\x00\x00\x00', len(self.code), TEXT_RVA, len(code_raw), HEADERS, 0x60000020),
            (b'.rdata\x00\x00', len(self.rodata), RDATA_RVA, len(rodata_raw), HEADERS + len(code_raw), 0x40000040),
            (b'.data\x00\x00\x00', iat_size, DATA_RVA, len(data_raw), HEADERS + len(code_raw) + len(rodata_raw), 0xC0000040),
        ]:
            s = bytearray(40)
            s[0:len(name)] = name
            struct.pack_into('<II', s, 8, vsize, va)
            struct.pack_into('<II', s, 16, rawsize, rawoff)
            struct.pack_into('<I', s, 36, chars)
            sections += s
        
        pe = bytearray()
        pe += dos + b'PE\x00\x00' + coff + bytes(opt) + sections
        pe += b'\x00' * (HEADERS - len(pe))
        pe += self.code + b'\x00' * (len(code_raw) - len(self.code))
        pe += self.rodata + b'\x00' * (len(rodata_raw) - len(self.rodata))
        pe += data_raw
        pe += b'\x00' * ((SEC_ALIGN - len(pe) % SEC_ALIGN) % SEC_ALIGN)
        return bytes(pe)


# ═══════════════════════════════════════════════════════════════
# Challenge 58: Welcome Back
# ═══════════════════════════════════════════════════════════════

def build_challenge_58():
    print("  [58] Welcome Back...")
    pe = PE64Builder()
    pe.add_imports('msvcrt.dll', ['printf', 'gets', 'strcmp'])
    a_prompt = pe.add_string('prompt', b'Enter Password: ')
    a_pass = pe.add_string('pass', b'sup3r_s3cr3t_p4ssw0rd')
    a_granted = pe.add_string('granted', b'Access Granted')
    a_denied = pe.add_string('denied', b'Access Denied')
    # Flag is NOT stored as a string - it's built at runtime from bytes in code
    iat = 0x140002000
    
    flag = b'CGS{strings_are_not_secrets}\x00'
    flag_bytes = ''.join(f"mov byte ptr [rsp + 0x50 + {i}], {hex(b)}\n" for i, b in enumerate(flag))
    
    pe.asm(f"sub rsp, 0x78\n"
           f"mov r15, {hex(iat)}\n"
           f"{flag_bytes}"
           f"mov rcx, {hex(a_prompt)}\n"
           f"call qword ptr [r15]\n"
           f"lea rcx, [rsp + 0x20]\n"
           f"call qword ptr [r15 + 8]\n"
           f"lea rcx, [rsp + 0x20]\n"
           f"mov rdx, {hex(a_pass)}\n"
           f"call qword ptr [r15 + 16]\n"
           f"test eax, eax\n"
           f"jnz denied\n"
           f"mov rcx, {hex(a_granted)}\n"
           f"call qword ptr [r15]\n"
           f"lea rcx, [rsp + 0x50]\n"
           f"call qword ptr [r15]\n"
           f"jmp done\n"
           f"denied:\n"
           f"mov rcx, {hex(a_denied)}\n"
           f"call qword ptr [r15]\n"
           f"done:\n"
           f"xor eax, eax\n"
           f"add rsp, 0x78\n"
           f"ret\n")
    
    pe_bytes = pe.build()
    out = os.path.join(BASE_DIR, 'reverse-easy1', 'welcome_back.exe')
    ensure_dir(os.path.dirname(out))
    with open(out, 'wb') as f:
        f.write(pe_bytes)
    print(f"    -> {len(pe_bytes)} bytes")


# ═══════════════════════════════════════════════════════════════
# Challenge 59: XOR Door
# ═══════════════════════════════════════════════════════════════

def build_challenge_59():
    print("  [59] XOR Door...")
    flag = b'CGS{xor_is_not_encryption}'
    XOR_KEY = 0x5A
    encrypted = bytes([b ^ XOR_KEY for b in flag])
    
    pe = PE64Builder()
    pe.add_imports('msvcrt.dll', ['printf'])
    a_fmt = pe.add_string('fmt', b'%.*s\n')
    
    enc_off = len(pe.data)
    pe.data += encrypted
    key_off = len(pe.data)
    pe.data += bytes([XOR_KEY])
    iat_off = len(pe.data)
    pe.data += struct.pack('<Q', 0x10000 + pe.func_offsets['printf'])
    pe.data += struct.pack('<Q', 0)
    
    data_base = 0x140002000
    enc_addr = data_base + enc_off
    key_addr = data_base + key_off
    iat_addr = data_base + iat_off
    
    pe.asm(f"sub rsp, 0x78\n"
           f"mov r15, {hex(iat_addr)}\n"
           f"mov rbx, {hex(key_addr)}\n"
           f"mov bl, byte ptr [rbx]\n"
           f"mov rsi, {hex(enc_addr)}\n"
           f"lea rdi, [rsp + 0x20]\n"
           f"xor ecx, ecx\n"
           f"loop_start:\n"
           f"cmp ecx, {len(flag)}\n"
           f"jge loop_done\n"
           f"movzx eax, byte ptr [rsi + rcx]\n"
           f"xor al, bl\n"
           f"mov byte ptr [rdi + rcx], al\n"
           f"inc ecx\n"
           f"jmp loop_start\n"
           f"loop_done:\n"
           f"mov byte ptr [rdi + rcx], 0\n"
           f"mov rcx, {hex(a_fmt)}\n"
           f"mov edx, {len(flag)}\n"
           f"lea r8, [rsp + 0x20]\n"
           f"call qword ptr [r15]\n"
           f"xor eax, eax\n"
           f"add rsp, 0x78\n"
           f"ret\n")
    
    pe_bytes = pe.build()
    out = os.path.join(BASE_DIR, 'reverse-easy2', 'door.exe')
    ensure_dir(os.path.dirname(out))
    with open(out, 'wb') as f:
        f.write(pe_bytes)
    print(f"    -> {len(pe_bytes)} bytes")


# ═══════════════════════════════════════════════════════════════
# Challenge 60: Arithmetic Lock
# ═══════════════════════════════════════════════════════════════

def build_challenge_60():
    print("  [60] Arithmetic Lock...")
    flag = b'CGS{simple_checks_hide_nothing}'
    pairs = [(3,0x17),(7,0x23),(2,0x11),(5,0x31),(1,0x09),
             (9,0x19),(4,0x27),(6,0x13),(8,0x37),(3,0x0D)]
    
    pe = PE64Builder()
    pe.add_imports('msvcrt.dll', ['printf', 'gets'])
    a_prompt = pe.add_string('prompt', b'Enter the flag: ')
    a_fail = pe.add_string('fail', b'Wrong flag.')
    # Success flag is built at runtime from bytes in code
    iat = 0x140002000
    
    success_bytes = ''.join(f"mov byte ptr [rsp + 0x50 + {i}], {hex(b)}\n" for i, b in enumerate(flag + b'\x00'))
    
    checks = ""
    for i, ch in enumerate(flag):
        c1, c2 = pairs[i % len(pairs)]
        expected = (ch + c1) ^ c2
        checks += (f"movzx eax, byte ptr [rsp + {0x20 + i}]\n"
                   f"add al, {c1}\n"
                   f"xor al, {c2}\n"
                   f"cmp al, {expected}\n"
                   f"jne fail\n")
    
    pe.asm(f"sub rsp, 0x78\n"
           f"mov r15, {hex(iat)}\n"
           f"{success_bytes}"
           f"mov rcx, {hex(a_prompt)}\n"
           f"call qword ptr [r15]\n"
           f"lea rcx, [rsp + 0x20]\n"
           f"call qword ptr [r15 + 8]\n"
           f"{checks}"
           f"lea rcx, [rsp + 0x50]\n"
           f"call qword ptr [r15]\n"
           f"jmp done\n"
           f"fail:\n"
           f"mov rcx, {hex(a_fail)}\n"
           f"call qword ptr [r15]\n"
           f"done:\n"
           f"xor eax, eax\n"
           f"add rsp, 0x78\n"
           f"ret\n")
    
    pe_bytes = pe.build()
    out = os.path.join(BASE_DIR, 'reverse-easy3', 'mathlock.exe')
    ensure_dir(os.path.dirname(out))
    with open(out, 'wb') as f:
        f.write(pe_bytes)
    print(f"    -> {len(pe_bytes)} bytes")


# ═══════════════════════════════════════════════════════════════
# Challenge 61: Hidden Function
# ═══════════════════════════════════════════════════════════════

def build_challenge_61():
    print("  [61] Hidden Function...")
    pe = PE64Builder()
    pe.add_imports('msvcrt.dll', ['printf'])
    a_welcome = pe.add_string('welcome', b'Welcome to the challenge.')
    a_nothing = pe.add_string('nothing', b'Nothing to see here.')
    a_fmt = pe.add_string('fmt', b'%s%s%s%s\n')
    a_f1 = pe.add_string('f1', b'CGS{')
    a_f2 = pe.add_string('f2', b'unused_')
    a_f3 = pe.add_string('f3', b'code_is_')
    a_f4 = pe.add_string('f4', b'still_code}')
    iat = 0x140002000
    
    pe.asm(f"sub rsp, 0x38\n"
           f"mov r15, {hex(iat)}\n"
           f"mov rcx, {hex(a_welcome)}\n"
           f"call qword ptr [r15]\n"
           f"mov rcx, {hex(a_nothing)}\n"
           f"call qword ptr [r15]\n"
           f"xor eax, eax\n"
           f"add rsp, 0x38\n"
           f"ret\n"
           f"secret:\n"
           f"sub rsp, 0x38\n"
           f"mov r15, {hex(iat)}\n"
           f"mov rax, {hex(a_f4)}\n"
           f"mov qword ptr [rsp + 0x20], rax\n"
           f"mov rcx, {hex(a_fmt)}\n"
           f"mov rdx, {hex(a_f1)}\n"
           f"mov r8, {hex(a_f2)}\n"
           f"mov r9, {hex(a_f3)}\n"
           f"call qword ptr [r15]\n"
           f"xor eax, eax\n"
           f"add rsp, 0x38\n"
           f"ret\n")
    
    pe_bytes = pe.build()
    out = os.path.join(BASE_DIR, 'reverse-easy4', 'hidden.exe')
    ensure_dir(os.path.dirname(out))
    with open(out, 'wb') as f:
        f.write(pe_bytes)
    print(f"    -> {len(pe_bytes)} bytes")


# ═══════════════════════════════════════════════════════════════
# Challenge 62: Base64 Again?
# ═══════════════════════════════════════════════════════════════

def build_challenge_62():
    print("  [62] Base64 Again?...")
    import base64
    
    flag = b'CGS{layers_are_not_security}'
    def rot13(data):
        r = bytearray()
        for b in data:
            if 65 <= b <= 90: r.append((b - 65 + 13) % 26 + 65)
            elif 97 <= b <= 122: r.append((b - 97 + 13) % 26 + 97)
            else: r.append(b)
        return bytes(r)
    
    layer1 = rot13(flag)
    layer2 = base64.b64encode(layer1)
    layer3 = base64.b64encode(layer2)
    print(f"    Encoded: {layer3.decode()[:50]}...")
    
    pe = PE64Builder()
    pe.add_imports('msvcrt.dll', ['printf'])
    a_result = pe.add_string('result', b'%s\n')
    
    enc_off = len(pe.data)
    pe.data += layer3 + b'\x00'
    work_off = len(pe.data)
    pe.data += b'\x00' * 256
    work2_off = len(pe.data)
    pe.data += b'\x00' * 256
    
    b64_table = bytearray(128)
    for i, c in enumerate(b'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'):
        b64_table[c] = i
    table_off = len(pe.data)
    pe.data += bytes(b64_table)
    
    data_base = 0x140002000
    enc_addr = data_base + enc_off
    work_addr = data_base + work_off
    work2_addr = data_base + work2_off
    table_addr = data_base + table_off
    iat_off = len(pe.data)
    pe.data += struct.pack('<Q', 0x10000 + pe.func_offsets['printf'])
    pe.data += struct.pack('<Q', 0)
    iat_addr = data_base + iat_off
    
    pe.asm(f"sub rsp, 0x78\n"
           f"mov r15, {hex(iat_addr)}\n"
           f"mov r12, {hex(enc_addr)}\n"
           f"mov r13, {hex(work_addr)}\n"
           f"mov rbx, {hex(table_addr)}\n"
           f"mov rsi, r12\n"
           f"mov rdi, r13\n"
           f"b64_pass1:\n"
           f"movzx eax, byte ptr [rsi]\n"
           f"test eax, eax\n"
           f"je b64_pass1_done\n"
           f"movzx eax, byte ptr [rsi]\n"
           f"movzx eax, byte ptr [rbx + rax]\n"
           f"mov ecx, eax\n"
           f"movzx eax, byte ptr [rsi + 1]\n"
           f"movzx eax, byte ptr [rbx + rax]\n"
           f"mov edx, eax\n"
           f"movzx eax, byte ptr [rsi + 2]\n"
           f"movzx eax, byte ptr [rbx + rax]\n"
           f"mov r8d, eax\n"
           f"movzx eax, byte ptr [rsi + 3]\n"
           f"movzx eax, byte ptr [rbx + rax]\n"
           f"mov r9d, eax\n"
           f"shl ecx, 18\n"
           f"shl edx, 12\n"
           f"shl r8d, 6\n"
           f"or ecx, edx\n"
           f"or ecx, r8d\n"
           f"or ecx, r9d\n"
           f"mov eax, ecx\n"
           f"shr eax, 16\n"
           f"mov byte ptr [rdi], al\n"
           f"mov eax, ecx\n"
           f"shr eax, 8\n"
           f"mov byte ptr [rdi + 1], al\n"
           f"mov byte ptr [rdi + 2], cl\n"
           f"add rsi, 4\n"
           f"add rdi, 3\n"
           f"jmp b64_pass1\n"
           f"b64_pass1_done:\n"
           f"mov byte ptr [rdi], 0\n"
           f"mov rsi, r13\n"
           f"lea rdi, [r13 + 128]\n"
           f"b64_pass2:\n"
           f"movzx eax, byte ptr [rsi]\n"
           f"test eax, eax\n"
           f"je b64_pass2_done\n"
           f"movzx eax, byte ptr [rsi]\n"
           f"movzx eax, byte ptr [rbx + rax]\n"
           f"mov ecx, eax\n"
           f"movzx eax, byte ptr [rsi + 1]\n"
           f"movzx eax, byte ptr [rbx + rax]\n"
           f"mov edx, eax\n"
           f"movzx eax, byte ptr [rsi + 2]\n"
           f"movzx eax, byte ptr [rbx + rax]\n"
           f"mov r8d, eax\n"
           f"movzx eax, byte ptr [rsi + 3]\n"
           f"movzx eax, byte ptr [rbx + rax]\n"
           f"mov r9d, eax\n"
           f"shl ecx, 18\n"
           f"shl edx, 12\n"
           f"shl r8d, 6\n"
           f"or ecx, edx\n"
           f"or ecx, r8d\n"
           f"or ecx, r9d\n"
           f"mov eax, ecx\n"
           f"shr eax, 16\n"
           f"mov byte ptr [rdi], al\n"
           f"mov eax, ecx\n"
           f"shr eax, 8\n"
           f"mov byte ptr [rdi + 1], al\n"
           f"mov byte ptr [rdi + 2], cl\n"
           f"add rsi, 4\n"
           f"add rdi, 3\n"
           f"jmp b64_pass2\n"
           f"b64_pass2_done:\n"
           f"mov byte ptr [rdi], 0\n"
           f"lea rsi, [r13 + 128]\n"
           f"rot13_loop:\n"
           f"movzx eax, byte ptr [rsi]\n"
           f"test eax, eax\n"
           f"je rot13_done\n"
           f"cmp al, 0x41\n"
           f"jl rot13_next\n"
           f"cmp al, 0x5A\n"
           f"jg rot13_check_lower\n"
           f"add al, 0x0D\n"
           f"cmp al, 0x5A\n"
           f"jle rot13_store\n"
           f"sub al, 0x1A\n"
           f"jmp rot13_store\n"
           f"rot13_check_lower:\n"
           f"cmp al, 0x61\n"
           f"jl rot13_next\n"
           f"cmp al, 0x7A\n"
           f"jg rot13_next\n"
           f"add al, 0x0D\n"
           f"cmp al, 0x7A\n"
           f"jle rot13_store\n"
           f"sub al, 0x1A\n"
           f"rot13_store:\n"
           f"mov byte ptr [rsi], al\n"
           f"rot13_next:\n"
           f"inc rsi\n"
           f"jmp rot13_loop\n"
           f"rot13_done:\n"
           f"mov rcx, {hex(a_result)}\n"
           f"lea rdx, [r13 + 128]\n"
           f"call qword ptr [r15]\n"
           f"xor eax, eax\n"
           f"add rsp, 0x78\n"
           f"ret\n")
    
    pe_bytes = pe.build()
    out = os.path.join(BASE_DIR, 'reverse-easy5', 'encoded.exe')
    ensure_dir(os.path.dirname(out))
    with open(out, 'wb') as f:
        f.write(pe_bytes)
    print(f"    -> {len(pe_bytes)} bytes")


# ═══════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════

def main():
    print("=== Generating Reverse Engineering Easy Challenges (58-62) ===\n")
    build_challenge_58()
    build_challenge_59()
    build_challenge_60()
    build_challenge_61()
    build_challenge_62()
    print("\n=== Done ===")

if __name__ == '__main__':
    main()
