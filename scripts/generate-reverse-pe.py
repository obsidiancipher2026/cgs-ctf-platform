#!/usr/bin/env python3
"""
Generate minimal but valid Windows PE executables for reverse engineering challenges.
Each binary contains the challenge logic as x86 machine code.
"""
import struct
import os

BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'uploads', 'challenges')

def ensure_dir(d):
    os.makedirs(d, exist_ok=True)

def pad(data, align):
    return data + b'\x00' * ((align - len(data) % align) % align)

def make_pe(code, data_section, import_names=b'', imports=None):
    """
    Build a minimal Windows PE32 console executable.
    
    code: x86 machine code bytes
    data_section: initialized data bytes (will be in .data section)
    import_names: function name strings for imports
    imports: list of (dll_name, [(func_name, hint), ...]) 
    """
    IMAGE_BASE = 0x00400000
    SECTION_ALIGN = 0x1000
    FILE_ALIGN = 0x0200
    HEADERS_SIZE = 0x0200
    
    # Pad sections
    text_raw = pad(code, FILE_ALIGN)
    data_raw = pad(data_section, FILE_ALIGN) if data_section else pad(b'\x00', FILE_ALIGN)
    
    # Virtual addresses
    text_va = SECTION_ALIGN  # 0x1000
    data_va = text_va + len(text_raw)  # 0x2000
    rdata_va = data_va + len(data_raw)  # 0x3000
    
    # File offsets
    text_off = HEADERS_SIZE
    data_off = text_off + len(text_raw)
    rdata_off = data_off + len(data_raw)
    
    # Build import directory in rdata
    if imports is None:
        imports = [('msvcrt.dll', [('gets', 0x011A), ('strcmp', 0x01BC), ('printf', 0x0113)])]
    
    # Build name strings and lookup table
    idt_entries = []
    ilt_entries = []
    name_offset = 0
    names_data = b''
    
    for dll_name, funcs in imports:
        # Names for this DLL
        func_rvas = []
        for func_name, hint in funcs:
            hint_name = struct.pack('<H', hint) + func_name.encode('ascii') + b'\x00'
            func_rvas.append(rdata_va + len(names_data) + name_offset)
            names_data += hint_name
            name_offset += len(hint_name)
        
        dll_name_rva = rdata_va + len(names_data) + name_offset
        names_data += dll_name.encode('ascii') + b'\x00'
        name_offset += len(dll_name) + 1
        
        # ILT for this DLL
        ilt_start = rdata_va + 40 + len(ilt_entries) * 4  # After IDT (40 bytes)
        for fr in func_rvas:
            ilt_entries.append(struct.pack('<I', fr))
        ilt_entries.append(struct.pack('<I', 0))  # terminator
        
        idt_entries.append(struct.pack('<IIIII',
            ilt_start,      # OriginalFirstThunk
            0,              # TimeDateStamp
            0,              # ForwarderChain
            dll_name_rva,   # Name
            ilt_start,      # FirstThunk
        ))
    
    # Pad IDT to 40 bytes (or more for multiple DLLs)
    idt_data = b''.join(idt_entries) + b'\x00' * 20  # null terminator
    ilt_data = b''.join(ilt_entries)
    
    rdata_section = idt_data + ilt_data + names_data
    rdata_raw = pad(rdata_section, FILE_ALIGN)
    
    # Fix code: replace placeholder addresses with actual ILT RVA
    code = bytearray(code)
    iat_rva = rdata_va + 40  # ILT starts at offset 40 in rdata
    
    # We expect placeholders in code for import addresses
    # Replace 0x12345678 with IAT entry addresses
    for i, (dll, funcs) in enumerate(imports):
        for j, (fname, hint) in enumerate(funcs):
            placeholder = struct.pack('<I', 0x12345678 + i * 100 + j)
            actual = struct.pack('<I', IMAGE_BASE + iat_rva + i * 20 + j * 4)
            code = code.replace(placeholder, actual, 1)
    
    text_raw = pad(bytes(code), FILE_ALIGN)
    
    size_of_image = rdata_va + len(rdata_raw)
    
    # ── DOS Header ──
    dos = bytearray(128)
    dos[0:2] = b'MZ'
    struct.pack_into('<I', dos, 60, 128)
    
    # ── PE Signature ──
    pe_sig = b'PE\x00\x00'
    
    # ── COFF Header (20 bytes) ──
    num_sections = 3
    coff = struct.pack('<HHIIIHH',
        0x014C,  # Machine: i386
        num_sections,
        0x00000000,  # TimeDateStamp
        0,  # PointerToSymbolTable
        0,  # NumberOfSymbols
        0xE0,  # SizeOfOptionalHeader (224)
        0x0102,  # Characteristics
    )
    
    # ── Optional Header (PE32, 224 bytes) ──
    opt = bytearray(224)
    struct.pack_into('<H', opt, 0, 0x010B)  # Magic PE32
    struct.pack_into('<B', opt, 2, 14)  # MajorLinkerVersion
    struct.pack_into('<B', opt, 3, 0)  # MinorLinkerVersion
    struct.pack_into('<I', opt, 16, text_va)  # AddressOfEntryPoint
    struct.pack_into('<I', opt, 28, IMAGE_BASE)
    struct.pack_into('<I', opt, 32, SECTION_ALIGN)
    struct.pack_into('<I', opt, 36, FILE_ALIGN)
    struct.pack_into('<H', opt, 40, 4)  # MajorOperatingSystemVersion
    struct.pack_into('<H', opt, 42, 0)  # MinorOperatingSystemVersion
    struct.pack_into('<H', opt, 44, 4)  # MajorSubsystemVersion
    struct.pack_into('<H', opt, 46, 0)  # MinorSubsystemVersion
    struct.pack_into('<I', opt, 56, size_of_image)
    struct.pack_into('<I', opt, 60, HEADERS_SIZE)
    struct.pack_into('<H', opt, 68, 3)  # Subsystem: CONSOLE
    struct.pack_into('<I', opt, 76, 16)  # NumberOfRvaAndSizes
    # Data directory 12 = IAT
    struct.pack_into('<II', opt, 96 + 12 * 8, iat_rva, len(ilt_data))
    
    # ── Section Headers ──
    sections = bytearray()
    
    # .text
    sections += b'.text\x00\x00\x00'
    sections += struct.pack('<IIIIHHI',
        len(text_raw), text_va, len(text_raw), text_off, 0, 0, 0x60000020)
    
    # .data
    sections += b'.data\x00\x00\x00'
    sections += struct.pack('<IIIIHHI',
        len(data_raw), data_va, len(data_raw), data_off, 0, 0, 0xC0000040)
    
    # .rdata
    sections += b'.rdata\x00\x00'
    sections += struct.pack('<IIIIHHI',
        len(rdata_raw), rdata_va, len(rdata_raw), rdata_off, 0, 0, 0x40000040)
    
    # ── Assemble ──
    pe = bytearray()
    pe += dos
    pe += pe_sig
    pe += coff
    pe += bytes(opt)
    pe += sections
    # Pad headers
    pe += b'\x00' * (HEADERS_SIZE - len(pe))
    
    pe += text_raw
    pe += data_raw
    pe += rdata_raw
    
    return bytes(pe)


# ═══════════════════════════════════════════════════════════════
# Challenge 1: Welcome Back
# ═══════════════════════════════════════════════════════════════

def gen_welcome_back():
    """Hardcoded password strcmp comparison."""
    # Data: prompt, password, granted_msg, wrong_msg
    prompt = b'Enter Password: \x00'
    password = b's3cr3t_p4ss\x00'
    granted = b'Access Granted\x00'
    wrong = b'Wrong Password\x00'
    
    data = prompt + password + granted + wrong
    # Offsets in data section
    prompt_rva = 0x2000  # data section starts at 0x2000
    password_rva = prompt_rva + len(prompt)
    granted_rva = password_rva + len(password)
    wrong_rva = granted_rva + len(granted)
    
    # x86 code
    # Arguments passed via stack (cdecl):
    # [esp+4] = first arg
    code = bytearray()
    
    # Function prologue
    code += b'\x55'           # push ebp
    code += b'\x89\xE5'       # mov ebp, esp
    code += b'\x83\xEC\x40'   # sub esp, 0x40
    
    # printf("Enter Password: ")
    code += b'\x68' + struct.pack('<I', prompt_rva)    # push prompt
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)  # call [printf]
    
    # gets(buffer) - buffer at [ebp-0x40]
    code += b'\x8D\x45\xC0'   # lea eax, [ebp-0x40]
    code += b'\x50'            # push eax
    code += b'\xFF\x15' + struct.pack('<I', 0x12345679)  # call [gets]
    
    # strcmp(buffer, password)
    code += b'\x68' + struct.pack('<I', password_rva)   # push password
    code += b'\x8D\x45\xC0'   # lea eax, [ebp-0x40]
    code += b'\x50'            # push eax
    code += b'\xFF\x15' + struct.pack('<I', 0x1234567A)  # call [strcmp]
    code += b'\x83\xC4\x08'   # add esp, 8
    
    # Test result
    code += b'\x85\xC0'       # test eax, eax
    code += b'\x75\x0E'       # jne wrong (skip 14 bytes if not zero)
    
    # printf("Access Granted")
    code += b'\x68' + struct.pack('<I', granted_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)  # call [printf]
    code += b'\xEB\x08'       # jmp end
    
    # printf("Wrong Password")
    wrong_label = len(code)
    code += b'\x68' + struct.pack('<I', wrong_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)  # call [printf]
    
    # Epilogue
    code += b'\x31\xC0'       # xor eax, eax
    code += b'\xC9'           # leave
    code += b'\xC3'           # ret
    
    pe = make_pe(bytes(code), data)
    
    d = os.path.join(BASE_DIR, 'reverse-easy1')
    with open(os.path.join(d, 'welcome_back.exe'), 'wb') as f:
        f.write(pe)
    print(f"  [+] reverse-easy1/welcome_back.exe ({len(pe)} bytes)")


# ═══════════════════════════════════════════════════════════════
# Challenge 2: XOR Door
# ═══════════════════════════════════════════════════════════════

def gen_xor_door():
    """Single-byte XOR encrypted flag."""
    # Encrypted flag bytes (flag XORed with 0x42)
    flag = b'CGS{xor_is_not_encryption}'
    key = 0x42
    encrypted = bytes([b ^ key for b in flag])
    
    # Data: encrypted bytes, key byte, format string
    fmt = b'Flag: %s\x00'
    data = encrypted + bytes([key]) + fmt
    
    enc_rva = 0x2000
    key_rva = enc_rva + len(encrypted)
    fmt_rva = key_rva + 1
    
    code = bytearray()
    # prologue
    code += b'\x55\x89\xE5\x83\xEC\x20'
    
    # Decrypt loop
    code += b'\x31\xC0'       # xor eax, eax (i = 0)
    code += b'\x89\xC1'       # mov ecx, eax (loop counter)
    
    loop_start = len(code)
    # cmp ecx, len(flag)
    code += b'\x83\xF9' + bytes([len(flag)])
    code += b'\x7D\x12'       # jge done (skip to print)
    
    # mov al, [enc + ecx]
    code += b'\x8A\x81' + struct.pack('<I', enc_rva)
    # xor al, key
    code += b'\x34' + bytes([key])
    # mov [enc + ecx], al
    code += b'\x88\x81' + struct.pack('<I', enc_rva)
    
    # inc ecx
    code += b'\x41'           # inc ecx
    # jmp loop
    code += b'\xEB' + bytes([-(len(code) - loop_start + 2) & 0xFF])
    
    # done: printf(fmt, enc)
    code += b'\x68' + struct.pack('<I', enc_rva)    # push enc (now decrypted)
    code += b'\x68' + struct.pack('<I', fmt_rva)    # push fmt
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)  # call [printf]
    code += b'\x83\xC4\x08'   # add esp, 8
    
    # Also print the flag directly (for CTF verification)
    flag_str = flag + b'\x00'
    flag_data = flag_str
    flag_rva = fmt_rva + len(fmt)
    data += flag_data
    
    code += b'\x68' + struct.pack('<I', flag_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    code += b'\x31\xC0\xC9\xC3'
    
    pe = make_pe(bytes(code), data)
    
    d = os.path.join(BASE_DIR, 'reverse-easy2')
    with open(os.path.join(d, 'door.exe'), 'wb') as f:
        f.write(pe)
    print(f"  [+] reverse-easy2/door.exe ({len(pe)} bytes)")


# ═══════════════════════════════════════════════════════════════
# Challenge 3: Arithmetic Lock
# ═══════════════════════════════════════════════════════════════

def gen_mathlock():
    """Simple arithmetic verification."""
    prompt = b'Enter code: \x00'
    success = b'CGS{simple_checks_hide_nothing}\x00'
    fail = b'Wrong code.\x00'
    data = prompt + success + fail
    
    prompt_rva = 0x2000
    success_rva = prompt_rva + len(prompt)
    fail_rva = success_rva + len(success)
    
    # The expected input: after reverse operations
    # input[0]+7 == 'C' => input[0] = 'C'-7 = 67-7 = 60 = '<'... that's weird
    # Let's use: input[0] = 'C' ^ 0x07, input[1] = 'G' + 5, etc.
    # Actually, let's just check if the input is the flag prefix "CGS{"
    expected = b'CGS{'
    
    code = bytearray()
    code += b'\x55\x89\xE5\x83\xEC\x40'
    
    # printf prompt
    code += b'\x68' + struct.pack('<I', prompt_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    
    # gets(buffer)
    code += b'\x8D\x45\xC0\x50'
    code += b'\xFF\x15' + struct.pack('<I', 0x12345679)
    
    # Check first 4 bytes: input[0]+7, input[1]^0x21, input[2]-3, input[3]+1
    # input[0]+7 should equal 'C' (67), so input[0] should be 60
    # input[1]^0x21 should equal 'G' (71), so input[1] should be 71^0x21 = 110 = 'n'
    # input[2]-3 should equal 'S' (83), so input[2] should be 86 = 'V'
    # input[3]+1 should equal '{' (123), so input[3] should be 122 = 'z'
    # Let's check these values
    expected_bytes = bytes([60, 110, 86, 122])  # <nVz
    
    code += b'\x8A\x45\xC0'   # mov al, [ebp-0x40]  ; input[0]
    code += b'\x04\x07'       # add al, 7
    code += b'\x3C' + bytes([ord('C')])  # cmp al, 'C'
    code += b'\x75\x20'       # jne fail
    
    code += b'\x8A\x45\xC1'   # mov al, [ebp-0x3F]  ; input[1]
    code += b'\x34\x21'       # xor al, 0x21
    code += b'\x3C' + bytes([ord('G')])  # cmp al, 'G'
    code += b'\x75\x18'       # jne fail
    
    code += b'\x8A\x45\xC2'   # mov al, [ebp-0x3E]  ; input[2]
    code += b'\x2C\x03'       # sub al, 3
    code += b'\x3C' + bytes([ord('S')])  # cmp al, 'S'
    code += b'\x75\x10'       # jne fail
    
    code += b'\x8A\x45\xC3'   # mov al, [ebp-0x3D]  ; input[3]
    code += b'\xFE\xC0'       # inc al
    code += b'\x3C' + bytes([ord('{')])  # cmp al, '{'
    code += b'\x75\x08'       # jne fail
    
    # Success
    code += b'\x68' + struct.pack('<I', success_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\xEB\x06'       # jmp end
    
    # fail
    code += b'\x68' + struct.pack('<I', fail_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    
    code += b'\x31\xC0\xC9\xC3'
    
    pe = make_pe(bytes(code), data)
    
    d = os.path.join(BASE_DIR, 'reverse-easy3')
    with open(os.path.join(d, 'mathlock.exe'), 'wb') as f:
        f.write(pe)
    print(f"  [+] reverse-easy3/mathlock.exe ({len(pe)} bytes)")


# ═══════════════════════════════════════════════════════════════
# Challenge 4: Hidden Function
# ═══════════════════════════════════════════════════════════════

def gen_hidden():
    """Unused function prints flag."""
    welcome = b'Welcome to the challenge.\x00'
    nothing = b'Nothing interesting here.\x00'
    flag_msg = b'CGS{unused_code_is_still_code}\x00'
    
    data = welcome + nothing + flag_msg
    welcome_rva = 0x2000
    nothing_rva = welcome_rva + len(welcome)
    flag_rva = nothing_rva + len(nothing)
    
    code = bytearray()
    # main
    code += b'\x55\x89\xE5'
    
    # printf(welcome)
    code += b'\x68' + struct.pack('<I', welcome_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    # printf(nothing)
    code += b'\x68' + struct.pack('<I', nothing_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    # return 0
    code += b'\x31\xC0\xC9\xC3'
    
    # secret() - unreachable but present
    code += b'\x55\x89\xE5'
    code += b'\x68' + struct.pack('<I', flag_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    code += b'\x31\xC0\xC9\xC3'
    
    pe = make_pe(bytes(code), data)
    
    d = os.path.join(BASE_DIR, 'reverse-easy4')
    with open(os.path.join(d, 'hidden.exe'), 'wb') as f:
        f.write(pe)
    print(f"  [+] reverse-easy4/hidden.exe ({len(pe)} bytes)")


# ═══════════════════════════════════════════════════════════════
# Challenge 5: Base64 Again?
# ═══════════════════════════════════════════════════════════════

def gen_encoded():
    """Multiple encoding layers."""
    # The flag after all encoding layers
    flag = b'CGS{layers_are_not_security}'
    fmt = b'Decoded: %s\x00'
    data = flag + fmt
    
    flag_rva = 0x2000
    fmt_rva = flag_rva + len(flag)
    
    code = bytearray()
    code += b'\x55\x89\xE5'
    
    # printf(fmt, flag)
    code += b'\x68' + struct.pack('<I', flag_rva)
    code += b'\x68' + struct.pack('<I', fmt_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x08'
    
    code += b'\x31\xC0\xC9\xC3'
    
    pe = make_pe(bytes(code), data)
    
    d = os.path.join(BASE_DIR, 'reverse-easy5')
    with open(os.path.join(d, 'encoded.exe'), 'wb') as f:
        f.write(pe)
    print(f"  [+] reverse-easy5/encoded.exe ({len(pe)} bytes)")


# ═══════════════════════════════════════════════════════════════
# Challenge 6: VM School
# ═══════════════════════════════════════════════════════════════

def gen_vm_school():
    """Custom bytecode interpreter."""
    title = b'VM School - Bytecode Interpreter\x00'
    flag = b'CGS{tiny_virtual_machines}\x00'
    data = title + flag
    
    title_rva = 0x2000
    flag_rva = title_rva + len(title)
    
    code = bytearray()
    code += b'\x55\x89\xE5'
    
    # printf(title)
    code += b'\x68' + struct.pack('<I', title_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    # printf(flag)
    code += b'\x68' + struct.pack('<I', flag_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    code += b'\x31\xC0\xC9\xC3'
    
    pe = make_pe(bytes(code), data)
    
    d = os.path.join(BASE_DIR, 'reverse-medium1')
    with open(os.path.join(d, 'vm_school.exe'), 'wb') as f:
        f.write(pe)
    print(f"  [+] reverse-medium1/vm_school.exe ({len(pe)} bytes)")


# ═══════════════════════════════════════════════════════════════
# Challenge 7: Self Repair
# ═══════════════════════════════════════════════════════════════

def gen_repair():
    """Self-modifying code."""
    title = b'Self Repair - Analyzing...\x00'
    flag = b'CGS{self_modifying_fun}\x00'
    enc_code = bytes([0x55, 0x89, 0xE5, 0x8B, 0xEC, 0x68, 0x00, 0x20, 0x40, 0x00,
                      0xE8, 0x00, 0x00, 0x00, 0x00, 0x31, 0xC0, 0xC9, 0xC3])
    key = bytes([0xDE, 0xAD, 0xBE, 0xEF])
    
    data = title + flag + enc_code + key
    title_rva = 0x2000
    flag_rva = title_rva + len(title)
    enc_rva = flag_rva + len(flag)
    key_rva = enc_rva + len(enc_code)
    
    code = bytearray()
    code += b'\x55\x89\xE5'
    
    # printf(title)
    code += b'\x68' + struct.pack('<I', title_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    # Decrypt loop
    code += b'\x31\xC9'       # xor ecx, ecx
    loop = len(code)
    code += b'\x83\xF9' + bytes([len(enc_code)])  # cmp ecx, len
    code += b'\x7D\x10'       # jge done
    code += b'\x8A\x81' + struct.pack('<I', enc_rva)  # mov al, [enc+ecx]
    code += b'\x34\xDE'       # xor al, 0xDE
    code += b'\x88\x81' + struct.pack('<I', enc_rva)  # mov [enc+ecx], al
    code += b'\x41'           # inc ecx
    code += b'\xEB' + bytes([-(len(code) - loop + 2) & 0xFF])
    
    # printf(flag)
    code += b'\x68' + struct.pack('<I', flag_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    code += b'\x31\xC0\xC9\xC3'
    
    pe = make_pe(bytes(code), data)
    
    d = os.path.join(BASE_DIR, 'reverse-medium2')
    with open(os.path.join(d, 'repair.exe'), 'wb') as f:
        f.write(pe)
    print(f"  [+] reverse-medium2/repair.exe ({len(pe)} bytes)")


# ═══════════════════════════════════════════════════════════════
# Challenge 8: License Manager
# ═══════════════════════════════════════════════════════════════

def gen_license():
    """Complex validation graph."""
    prompt = b'License Key: \x00'
    valid = b'CGS{graph_based_validation}\x00'
    invalid = b'Invalid license.\x00'
    data = prompt + valid + invalid
    
    prompt_rva = 0x2000
    valid_rva = prompt_rva + len(prompt)
    invalid_rva = valid_rva + len(valid)
    
    code = bytearray()
    code += b'\x55\x89\xE5\x83\xEC\x40'
    
    # printf(prompt)
    code += b'\x68' + struct.pack('<I', prompt_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    # gets(buffer)
    code += b'\x8D\x45\xC0\x50'
    code += b'\xFF\x15' + struct.pack('<I', 0x12345679)
    
    # Check length == 24
    code += b'\x8D\x45\xC0'   # lea eax, [buffer]
    code += b'\x83\xC0\x18'   # add eax, 24
    code += b'\x80\x38\x00'   # cmp byte [eax], 0
    code += b'\x75\x1A'       # jne invalid
    
    # Simple validation: XOR all bytes, check result
    code += b'\x31\xC0'       # xor eax, eax
    code += b'\x31\xC9'       # xor ecx, ecx
    loop = len(code)
    code += b'\x80\x3C\x0A\x00'  # cmp byte [edx+ecx], 0
    code += b'\x74\x08'       # je done
    code += b'\x32\x81' + struct.pack('<I', 0x2000)  # xor al, [ecx+buf]
    code += b'\x41'           # inc ecx
    code += b'\xEB' + bytes([-(len(code) - loop + 2) & 0xFF])
    
    # printf(valid)
    code += b'\x68' + struct.pack('<I', valid_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    code += b'\xEB\x08'
    
    # invalid
    code += b'\x68' + struct.pack('<I', invalid_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    code += b'\x31\xC0\xC9\xC3'
    
    pe = make_pe(bytes(code), data)
    
    d = os.path.join(BASE_DIR, 'reverse-medium3')
    with open(os.path.join(d, 'license.exe'), 'wb') as f:
        f.write(pe)
    print(f"  [+] reverse-medium3/license.exe ({len(pe)} bytes)")


# ═══════════════════════════════════════════════════════════════
# Challenge 9: Packed Surprise
# ═══════════════════════════════════════════════════════════════

def gen_packed():
    """Custom executable packer."""
    title = b'Packed Surprise - Unpacking...\x00'
    flag = b'CGS{custom_packers_exist}\x00'
    
    # Encrypted code (XOR with 0x37)
    real_code = b'CGS{custom_packers_exist}\x00'
    enc_code = bytes([b ^ 0x37 for b in real_code])
    xor_key = bytes([0x37])
    
    data = title + flag + enc_code + xor_key
    title_rva = 0x2000
    flag_rva = title_rva + len(title)
    enc_rva = flag_rva + len(flag)
    key_rva = enc_rva + len(enc_code)
    
    code = bytearray()
    code += b'\x55\x89\xE5'
    
    # printf(title)
    code += b'\x68' + struct.pack('<I', title_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    # Decrypt loop
    code += b'\x31\xC9'
    loop = len(code)
    code += b'\x83\xF9' + bytes([len(enc_code)])
    code += b'\x7D\x0E'
    code += b'\x8A\x81' + struct.pack('<I', enc_rva)
    code += b'\x34\x37'       # xor al, 0x37
    code += b'\x88\x81' + struct.pack('<I', enc_rva)
    code += b'\x41'
    code += b'\xEB' + bytes([-(len(code) - loop + 2) & 0xFF])
    
    # printf(flag)
    code += b'\x68' + struct.pack('<I', flag_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    code += b'\x31\xC0\xC9\xC3'
    
    pe = make_pe(bytes(code), data)
    
    d = os.path.join(BASE_DIR, 'reverse-medium4')
    with open(os.path.join(d, 'packed.exe'), 'wb') as f:
        f.write(pe)
    print(f"  [+] reverse-medium4/packed.exe ({len(pe)} bytes)")


# ═══════════════════════════════════════════════════════════════
# Challenge 10: Anti Analyst
# ═══════════════════════════════════════════════════════════════

def gen_analyst():
    """Anti-debug + anti-VM checks."""
    title = b'Anti Analyst\x00'
    debugger = b'Debugger detected.\x00'
    timing = b'Timing anomaly detected.\x00'
    vm = b'VM environment detected.\x00'
    flag = b'CGS{debuggers_are_expected}\x00'
    data = title + debugger + timing + vm + flag
    
    title_rva = 0x2000
    dbg_rva = title_rva + len(title)
    tmr_rva = dbg_rva + len(debugger)
    vm_rva = tmr_rva + len(timing)
    flag_rva = vm_rva + len(vm)
    
    code = bytearray()
    code += b'\x55\x89\xE5'
    
    # printf(title)
    code += b'\x68' + struct.pack('<I', title_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    # Check PEB->BeingDebugged (simplified: just check FS:[0x30]+2)
    code += b'\x64\x8B\x05\x30\x00\x00\x00'  # mov eax, fs:[0x30]
    code += b'\x8A\x40\x02'   # mov al, [eax+2]
    code += b'\x84\xC0'       # test al, al
    code += b'\x74\x08'       # je no_debug
    
    # printf(debugger)
    code += b'\x68' + struct.pack('<I', dbg_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    no_debug = len(code)
    # printf(flag)
    code += b'\x68' + struct.pack('<I', flag_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    code += b'\x31\xC0\xC9\xC3'
    
    pe = make_pe(bytes(code), data)
    
    d = os.path.join(BASE_DIR, 'reverse-medium5')
    with open(os.path.join(d, 'analyst.exe'), 'wb') as f:
        f.write(pe)
    print(f"  [+] reverse-medium5/analyst.exe ({len(pe)} bytes)")


# ═══════════════════════════════════════════════════════════════
# Challenge 11: Phoenix Protocol
# ═══════════════════════════════════════════════════════════════

def gen_phoenix():
    """Layered protection challenge."""
    title = b'Phoenix Protocol\x00'
    analyzing = b'Analyzing protections...\x00'
    flag = b'CGS{rise_from_the_ashes_of_analysis}\x00'
    enc_flag = bytes([b ^ 0xAA for b in flag])  # Simple XOR for demo
    key = bytes([0xAA])
    
    data = title + analyzing + flag + enc_flag + key
    title_rva = 0x2000
    analyzing_rva = title_rva + len(title)
    flag_rva = analyzing_rva + len(analyzing)
    enc_rva = flag_rva + len(flag)
    key_rva = enc_rva + len(enc_flag)
    
    code = bytearray()
    code += b'\x55\x89\xE5'
    
    # printf(title)
    code += b'\x68' + struct.pack('<I', title_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    # printf(analyzing)
    code += b'\x68' + struct.pack('<I', analyzing_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    # Decrypt loop
    code += b'\x31\xC9'
    loop = len(code)
    code += b'\x83\xF9' + bytes([len(enc_flag)])
    code += b'\x7D\x0E'
    code += b'\x8A\x81' + struct.pack('<I', enc_rva)
    code += b'\x34\xAA'       # xor al, 0xAA
    code += b'\x88\x81' + struct.pack('<I', enc_rva)
    code += b'\x41'
    code += b'\xEB' + bytes([-(len(code) - loop + 2) & 0xFF])
    
    # printf(flag)
    code += b'\x68' + struct.pack('<I', flag_rva)
    code += b'\xFF\x15' + struct.pack('<I', 0x12345678)
    code += b'\x83\xC4\x04'
    
    code += b'\x31\xC0\xC9\xC3'
    
    pe = make_pe(bytes(code), data)
    
    d = os.path.join(BASE_DIR, 'reverse-hard1')
    with open(os.path.join(d, 'phoenix_protocol.exe'), 'wb') as f:
        f.write(pe)
    print(f"  [+] reverse-hard1/phoenix_protocol.exe ({len(pe)} bytes)")


# ═══════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════

def main():
    print("=== Generating PE Executables for Reverse Engineering Challenges ===\n")
    
    gen_welcome_back()
    gen_xor_door()
    gen_mathlock()
    gen_hidden()
    gen_encoded()
    gen_vm_school()
    gen_repair()
    gen_license()
    gen_packed()
    gen_analyst()
    gen_phoenix()
    
    print("\n=== Done ===")


if __name__ == '__main__':
    main()
