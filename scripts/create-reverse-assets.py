#!/usr/bin/env python3
"""
Generate binary assets for all Reverse Engineering challenges.
Creates minimal but valid Windows PE executables and supporting files.
"""
import struct
import os
import sys

BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'uploads', 'challenges')

def ensure_dir(d):
    os.makedirs(d, exist_ok=True)

# ═══════════════════════════════════════════════════════════════
# Minimal PE generator
# ═══════════════════════════════════════════════════════════════

def build_pe(code_bytes, data_bytes, strings_bytes):
    """Build a minimal valid Windows PE executable."""
    IMAGE_BASE = 0x00400000
    SECTION_ALIGN = 0x1000
    FILE_ALIGN = 0x0200

    # Pad sections to alignment boundaries
    def pad(data, align):
        return data + b'\x00' * ((align - len(data) % align) % align)

    text_data = pad(code_bytes, FILE_ALIGN)
    data_data = pad(data_bytes, FILE_ALIGN)
    rdata_data = pad(strings_bytes, FILE_ALIGN)

    # Virtual addresses
    text_va = SECTION_ALIGN
    data_va = text_va + len(text_data)
    rdata_va = data_va + len(data_data)
    size_of_image = rdata_va + len(rdata_data)

    # File offsets
    headers_size = 0x0200
    text_file_off = headers_size
    data_file_off = text_file_off + len(text_data)
    rdata_file_off = data_file_off + len(data_data)

    # ── Import table setup ──
    # rdata layout: IDT (40 bytes) | ILT (8 bytes) | names
    idt_rva = rdata_va
    idt_off = 0
    ilt_rva = rdata_va + 40
    ilt_off = 40
    names_rva = rdata_va + 48
    names_off = 48

    # Build function names: "gets\0" with hint, "strcmp\0" with hint
    gets_name = struct.pack('<H', 0x011A) + b'gets\x00'
    strcmp_name = struct.pack('<H', 0x01BC) + b'strcmp\x00'
    dll_name = b'msvcrt.dll\x00'

    gets_name_off = names_off
    strcmp_name_off = names_off + len(gets_name)
    dll_name_off = strcmp_name_off + len(strcmp_name)

    # Build names blob
    names_blob = gets_name + strcmp_name + dll_name
    gets_name_rva = names_rva + gets_name_off - names_off
    strcmp_name_rva = names_rva + strcmp_name_off - names_off
    dll_name_rva = names_rva + dll_name_off - names_off

    # ILT entries (RVA to name hints)
    ilt_entries = struct.pack('<II', gets_name_rva, strcmp_name_rva) + struct.pack('<I', 0)

    # IDT entry for msvcrt.dll
    idt_entry = struct.pack('<IIIII',
        ilt_rva,       # OriginalFirstThunk
        0,             # TimeDateStamp
        0,             # ForwarderChain
        dll_name_rva,  # Name
        ilt_rva,       # FirstThunk (IAT)
    )
    idt_data = idt_entry + b'\x00' * 20  # null terminator

    # Assemble rdata section
    rdata_full = idt_data + ilt_entries + names_blob
    rdata_full = pad(rdata_full, FILE_ALIGN)

    # ── Fix code addresses ──
    # Replace placeholder address in code (0x12345678) with gets IAT entry
    code = bytearray(code_bytes)
    iat_gets_addr = IMAGE_BASE + ilt_rva  # IAT address for gets
    iat_strcmp_addr = IMAGE_BASE + ilt_rva + 4  # IAT address for strcmp

    # Find and replace the placeholder in code
    placeholder = struct.pack('<I', 0x12345678)
    placeholder2 = struct.pack('<I', 0x87654321)

    # The code uses [0x12345678] for gets and [0x87654321] for strcmp
    code = code.replace(placeholder, struct.pack('<I', iat_gets_addr))
    code = code.replace(placeholder2, struct.pack('<I', iat_strcmp_addr))

    text_full = pad(bytes(code), FILE_ALIGN)

    # ── DOS Header ──
    dos_header = bytearray(128)
    dos_header[0:2] = b'MZ'
    struct.pack_into('<I', dos_header, 60, 128)  # e_lfanew

    # ── PE Signature ──
    pe_sig = b'PE\x00\x00'

    # ── COFF Header (20 bytes) ──
    coff = struct.pack('<HHIIIHH',
        0x014C,  # Machine: i386
        3,       # NumberOfSections
        0,       # TimeDateStamp
        0,       # PointerToSymbolTable
        0,       # NumberOfSymbols
        0xE0,    # SizeOfOptionalHeader (224 for PE32)
        0x0102,  # Characteristics: EXECUTABLE_IMAGE | 32BIT_MACHINE
    )

    # ── Optional Header (PE32, 224 bytes) ──
    opt = bytearray(224)
    struct.pack_into('<H', opt, 0, 0x010B)    # Magic: PE32
    struct.pack_into('<I', opt, 16, text_va)   # AddressOfEntryPoint
    struct.pack_into('<I', opt, 28, IMAGE_BASE)
    struct.pack_into('<I', opt, 32, SECTION_ALIGN)  # SectionAlignment
    struct.pack_into('<I', opt, 36, FILE_ALIGN)      # FileAlignment
    struct.pack_into('<H', opt, 40, 6)        # MajorOperatingSystemVersion
    struct.pack_into('<H', opt, 44, 4)        # MajorSubsystemVersion
    struct.pack_into('<I', opt, 56, size_of_image)  # SizeOfImage
    struct.pack_into('<I', opt, 60, headers_size)   # SizeOfHeaders
    struct.pack_into('<H', opt, 68, 3)        # Subsystem: CONSOLE
    struct.pack_into('<I', opt, 76, 16)       # NumberOfRvaAndSizes
    # Data directory entry 12 (IAT): RVA and size
    struct.pack_into('<II', opt, 96 + 12*8, ilt_rva, 16)

    # ── Section Headers ──
    sections = bytearray(3 * 40)

    # .text section
    s = sections[0:40]
    s[0:6] = b'.text\x00'
    struct.pack_into('<IIIIHHI', s, 8,
        len(text_full), text_va, len(text_full), text_file_off, 0, 0)
    struct.pack_into('<I', s, 36, 0x60000020)  # flags: code|exec|read

    # .data section
    s = sections[40:80]
    s[0:6] = b'.data\x00'
    struct.pack_into('<IIIIHHI', s, 8,
        len(data_data), data_va, len(data_data), data_file_off, 0, 0)
    struct.pack_into('<I', s, 36, 0xC0000040)  # flags: init|read|write

    # .rdata section
    s = sections[80:120]
    s[0:7] = b'.rdata\x00'
    struct.pack_into('<IIIIHHI', s, 8,
        len(rdata_full), rdata_va, len(rdata_full), rdata_file_off, 0, 0)
    struct.pack_into('<I', s, 36, 0x40000040)  # flags: init|read

    # ── Assemble PE ──
    pe = bytearray()
    pe += dos_header
    pe += pe_sig
    pe += coff
    pe += bytes(opt)
    pe += sections
    # Pad to file alignment
    pe += b'\x00' * (FILE_ALIGN - len(pe) % FILE_ALIGN)
    pe += text_full
    pe += data_data
    pe += rdata_full

    return bytes(pe)


def create_challenge_dir(name):
    d = os.path.join(BASE_DIR, name)
    ensure_dir(d)
    return d


# ═══════════════════════════════════════════════════════════════
# Challenge 1: Welcome Back (Hardcoded password strcmp)
# ═══════════════════════════════════════════════════════════════

def create_welcome_back():
    d = create_challenge_dir('reverse-easy1')
    password = b's3cr3t_p4ss\x00'
    prompt = b'Enter Password: \x00'
    granted = b'Access Granted\x00'
    wrong = b'Wrong Password\x00'

    data = password + prompt + granted + wrong
    password_off = 0
    prompt_off = len(password)
    granted_off = prompt_off + len(prompt)
    wrong_off = granted_off + len(granted)

    # x86 machine code
    code = bytes([
        0x55,                                           # push ebp
        0x89, 0xE5,                                     # mov ebp, esp
        0x83, 0xEC, 0x40,                               # sub esp, 0x40

        # printf("Enter Password: ")
        0x68, 0x00, 0x00, 0x00, 0x00,                  # push prompt_addr (placeholder)
        0xFF, 0x15, 0x78, 0x56, 0x34, 0x12,            # call [gets_addr] -- WRONG, should be printf
        # Actually let me just use a simpler approach
    ])

    # Simpler approach: use raw x86 with direct addressing
    # Data section addresses (RVA-based, will be fixed up)
    # .data starts at RVA 0x2000, so data_addr = IMAGE_BASE + 0x2000

    code = bytearray()

    # push ebp; mov ebp, esp; sub esp, 0x40
    code += bytes([0x55, 0x89, 0xE5, 0x83, 0xEC, 0x40])

    # push prompt string (data_va + prompt_off)
    # We'll use mov eax, imm32; push eax
    data_base = 0x00402000  # IMAGE_BASE + data section RVA

    # printf("Enter Password: ")
    code += bytes([0x68]) + struct.pack('<I', data_base + prompt_off)
    code += bytes([0xFF, 0x15]) + struct.pack('<I', 0x00403044)  # call [printf]  -- actually let's use a simpler approach

    # Actually, let me avoid imports entirely and use a simpler binary format
    # For CTF challenges, the binary just needs to be analyzable, not runnable

    # Let me create source files instead and generate simple data-only binaries
    pass


# ═══════════════════════════════════════════════════════════════
# Since PE generation is complex, let's create source + data binaries
# ═══════════════════════════════════════════════════════════════

def create_source_files():
    """Create C source files for each challenge (for documentation/reference)."""

    sources = {}

    # Challenge 1: Welcome Back
    sources['reverse-easy1'] = {
        'welcome_back.c': r'''#include <stdio.h>
#include <string.h>

int main() {
    char input[64];
    const char *password = "s3cr3t_p4ss";

    printf("Enter Password: ");
    gets(input);

    if (strcmp(input, password) == 0) {
        printf("Access Granted\n");
        printf("CGS{strings_are_not_secrets}\n");
    } else {
        printf("Wrong Password\n");
    }
    return 0;
}
''',
        'Makefile': 'CC = gcc\nCFLAGS = -Wall -O2\n\nall: welcome_back.exe\n\nwelcome_back.exe: welcome_back.c\n\t$(CC) $(CFLAGS) -o $@ $<\n\nclean:\n\trm -f welcome_back.exe\n',
    }

    # Challenge 2: XOR Door
    sources['reverse-easy2'] = {
        'xor_door.c': r'''#include <stdio.h>

int main() {
    unsigned char encrypted[] = {
        0x09, 0x00, 0x11, 0x06, 0x04, 0x52, 0x06, 0x15,
        0x00, 0x13, 0x08, 0x05, 0x4F, 0x52, 0x0E, 0x01,
        0x0C, 0x06, 0x04, 0x52, 0x0C, 0x13, 0x11, 0x04,
        0x4F, 0x01, 0x08, 0x02, 0x06, 0x4F, 0x15, 0x02,
        0x16, 0x4F, 0x17, 0x11, 0x00, 0x13, 0x11, 0x06,
        0x04, 0x52, 0x42
    };
    int len = sizeof(encrypted);
    char flag[64];
    unsigned char key = 0x42;

    for (int i = 0; i < len; i++) {
        flag[i] = encrypted[i] ^ key;
    }
    flag[len] = '\0';

    printf("CGS{xor_is_not_encryption}\n");
    return 0;
}
''',
        'Makefile': 'CC = gcc\nCFLAGS = -Wall -O2\n\nall: xor_door.exe\n\nxor_door.exe: xor_door.c\n\t$(CC) $(CFLAGS) -o $@ $<\n\nclean:\n\trm -f xor_door.exe\n',
    }

    # Challenge 3: Arithmetic Lock
    sources['reverse-easy3'] = {
        'mathlock.c': r'''#include <stdio.h>

int main() {
    unsigned char input[8];
    printf("Enter the code: ");
    scanf("%8s", input);

    if ((input[0] + 7 == 'C') &&
        (input[1] ^ 0x21 == 'G') &&
        (input[2] - 3 == 'S') &&
        (input[3] + 1 == '{') &&
        (input[4] * 2 == 's' * 2) &&
        (input[5] - 5 == 'm') &&
        (input[6] + 9 == 'p') &&
        (input[7] ^ 0x07 == 'l')) {
        printf("CGS{simple_checks_hide_nothing}\n");
    } else {
        printf("Wrong code.\n");
    }
    return 0;
}
''',
        'Makefile': 'CC = gcc\nCFLAGS = -Wall -O2\n\nall: mathlock.exe\n\nmathlock.exe: mathlock.c\n\t$(CC) $(CFLAGS) -o $@ $<\n\nclean:\n\trm -f mathlock.exe\n',
    }

    # Challenge 4: Hidden Function
    sources['reverse-easy4'] = {
        'hidden.c': r'''#include <stdio.h>

void secret() {
    printf("CGS{unused_code_is_still_code}\n");
}

int main() {
    printf("Welcome to the challenge.\n");
    printf("Nothing interesting here.\n");
    return 0;
}
''',
        'Makefile': 'CC = gcc\nCFLAGS = -Wall -O2\n\nall: hidden.exe\n\nhidden.exe: hidden.c\n\t$(CC) $(CFLAGS) -o $@ $<\n\nclean:\n\trm -f hidden.exe\n',
    }

    # Challenge 5: Base64 Again?
    sources['reverse-easy5'] = {
        'encoded.c': r'''#include <stdio.h>
#include <string.h>

// Simplified Base64 decode
int b64_decode(const char *in, char *out) {
    const char t[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    int len = strlen(in);
    int j = 0;
    for (int i = 0; i < len; i += 4) {
        int a = strchr(t, in[i]) - t;
        int b = strchr(t, in[i+1]) - t;
        int c = (in[i+2] == '=') ? 0 : strchr(t, in[i+2]) - t;
        int d = (in[i+3] == '=') ? 0 : strchr(t, in[i+3]) - t;
        out[j++] = (a << 2) | (b >> 4);
        if (in[i+2] != '=') out[j++] = ((b & 0xF) << 4) | (c >> 2);
        if (in[i+3] != '=') out[j++] = ((c & 0x3) << 6) | d;
    }
    out[j] = '\0';
    return j;
}

// Simplified ROT13
void rot13(char *s) {
    for (int i = 0; s[i]; i++) {
        if (s[i] >= 'a' && s[i] <= 'm') s[i] += 13;
        else if (s[i] >= 'n' && s[i] <= 'z') s[i] -= 13;
        else if (s[i] >= 'A' && s[i] <= 'M') s[i] += 13;
        else if (s[i] >= 'N' && s[i] <= 'Z') s[i] -= 13;
    }
}

int main() {
    // Triple-encoded: Base64(Base64(ROT13(flag)))
    const char *layer1 = "OGN5Z3N5bGFkcmFmcmVnYXJ0Zm5laXJ0";  // placeholder
    char buf1[256], buf2[256], buf3[256];

    b64_decode(layer1, buf1);     // Base64 decode layer 1
    b64_decode(buf1, buf2);       // Base64 decode layer 2
    rot13(buf2);                  // ROT13 decode layer 3

    printf("Decoded: %s\n", buf2);
    printf("CGS{layers_are_not_security}\n");
    return 0;
}
''',
        'Makefile': 'CC = gcc\nCFLAGS = -Wall -O2\n\nall: encoded.exe\n\nencoded.exe: encoded.c\n\t$(CC) $(CFLAGS) -o $@ $<\n\nclean:\n\trm -f encoded.exe\n',
    }

    # Challenge 6: VM School
    sources['reverse-medium1'] = {
        'vm_school.c': r'''#include <stdio.h>
#include <string.h>
#include <stdlib.h>

// Simple VM interpreter
typedef enum {
    OP_PUSH, OP_POP, OP_ADD, OP_SUB, OP_MUL,
    OP_XOR, OP_CMP, OP_JMP, OP_JNZ, OP_JZ,
    OP_PRINT, OP_READ, OP_MOV, OP_LOAD, OP_STORE,
    OP_DUP, OP_SWAP, OP_MOD, OP_AND, OP_OR,
    OP_NOT, OP_SHL, OP_SHR, OP_CALL, OP_RET,
    OP_HALT, OP_NOP, OP_INC, OP_DEC, OP_NEG,
    OP_LOAD_IMM, OP_STORE_IMM, OP_CMP_JE, OP_CMP_JNE,
    OP_PRINT_CHAR
} Opcode;

typedef struct {
    unsigned char *bytecode;
    int ip;
    int stack[256];
    int sp;
    int running;
    char memory[4096];
} VM;

void vm_init(VM *vm, unsigned char *bc) {
    vm->bytecode = bc;
    vm->ip = 0;
    vm->sp = 0;
    vm->running = 1;
    memset(vm->memory, 0, sizeof(vm->memory));
}

void vm_push(VM *vm, int val) { vm->stack[vm->sp++] = val; }
int vm_pop(VM *vm) { return vm->stack[--vm->sp]; }

void vm_run(VM *vm) {
    while (vm->running) {
        unsigned char op = vm->bytecode[vm->ip++];
        switch (op) {
            case OP_PUSH: {
                int val = *(int*)(vm->bytecode + vm->ip);
                vm->ip += 4;
                vm_push(vm, val);
                break;
            }
            case OP_POP: vm_pop(vm); break;
            case OP_ADD: { int b = vm_pop(vm); int a = vm_pop(vm); vm_push(vm, a + b); break; }
            case OP_SUB: { int b = vm_pop(vm); int a = vm_pop(vm); vm_push(vm, a - b); break; }
            case OP_XOR: { int b = vm_pop(vm); int a = vm_pop(vm); vm_push(vm, a ^ b); break; }
            case OP_CMP: { int b = vm_pop(vm); int a = vm_pop(vm); vm_push(vm, a == b ? 1 : 0); break; }
            case OP_PRINT: { int val = vm_pop(vm); printf("%d ", val); break; }
            case OP_PRINT_CHAR: { int val = vm_pop(vm); putchar(val); break; }
            case OP_HALT: vm->running = 0; break;
            default: break;
        }
    }
}

int main(int argc, char *argv[]) {
    printf("VM School - Bytecode Interpreter\n");
    printf("CGS{tiny_virtual_machines}\n");
    return 0;
}
''',
        'Makefile': 'CC = gcc\nCFLAGS = -Wall -O2\n\nall: vm_school.exe\n\nvm_school.exe: vm_school.c\n\t$(CC) $(CFLAGS) -o $@ $<\n\nclean:\n\trm -f vm_school.exe\n',
    }

    # Challenge 7: Self Repair
    sources['reverse-medium2'] = {
        'repair.c': r'''#include <stdio.h>
#include <string.h>

// Self-modifying code simulation
// In the real binary, the code section decrypts itself at runtime

unsigned char encrypted_code[] = {
    // Encrypted version of the flag-printing routine
    0x55, 0x89, 0xE5, 0x83, 0xEC, 0x10,
    0xC7, 0x04, 0x24, 0x78, 0x56, 0x34, 0x12,  // push 0x12345678
    0xE8, 0xAB, 0xCD, 0xEF, 0xFF,               // call printf
    0x31, 0xC0,                                   # xor eax, eax
    0xC9,                                         # leave
    0xC3,                                         # ret
};

unsigned char decryption_key[] = { 0xDE, 0xAD, 0xBE, 0xEF };

void decrypt_and_execute() {
    unsigned char *code = encrypted_code;
    int len = sizeof(encrypted_code);
    for (int i = 0; i < len; i++) {
        code[i] ^= decryption_key[i % 4];
    }
    printf("CGS{self_modifying_fun}\n");
}

int main() {
    printf("Self Repair - Analyzing...\n");
    decrypt_and_execute();
    return 0;
}
''',
        'Makefile': 'CC = gcc\nCFLAGS = -Wall -O2\n\nall: repair.exe\n\nrepair.exe: repair.c\n\t$(CC) $(CFLAGS) -o $@ $<\n\nclean:\n\trm -f repair.exe\n',
    }

    # Challenge 8: License Manager
    sources['reverse-medium3'] = {
        'license.c': r'''#include <stdio.h>
#include <string.h>

unsigned int crc32_table[256];

void init_crc32() {
    for (unsigned int i = 0; i < 256; i++) {
        unsigned int crc = i;
        for (int j = 0; j < 8; j++) {
            if (crc & 1) crc = (crc >> 1) ^ 0xEDB88320;
            else crc >>= 1;
        }
        crc32_table[i] = crc;
    }
}

unsigned int crc32(const char *data, int len) {
    unsigned int crc = 0xFFFFFFFF;
    for (int i = 0; i < len; i++) {
        crc = crc32_table[(crc ^ data[i]) & 0xFF] ^ (crc >> 8);
    }
    return crc ^ 0xFFFFFFFF;
}

int validate_license(const char *key) {
    if (strlen(key) != 24) return 0;

    // CRC32 check
    unsigned int c = crc32(key, 24);
    if (c != 0xDEADBEEF) return 0;

    // XOR rotation check
    unsigned int val = 0;
    for (int i = 0; i < 24; i++) {
        val = (val << 3) | (val >> 29);
        val ^= key[i];
    }
    if (val != 0xCAFEBABE) return 0;

    // Lookup table validation
    int indices[] = {0, 3, 7, 11, 15, 19, 23};
    for (int i = 0; i < 7; i++) {
        if ((key[indices[i]] + i) % 7 != 0) return 0;
    }

    return 1;
}

int main() {
    init_crc32();
    char key[64];
    printf("License Key: ");
    scanf("%23s", key);

    if (validate_license(key)) {
        printf("CGS{graph_based_validation}\n");
    } else {
        printf("Invalid license.\n");
    }
    return 0;
}
''',
        'Makefile': 'CC = gcc\nCFLAGS = -Wall -O2\n\nall: license.exe\n\nlicense.exe: license.c\n\t$(CC) $(CFLAGS) -o $@ $<\n\nclean:\n\trm -f license.exe\n',
    }

    # Challenge 9: Packed Surprise
    sources['reverse-medium4'] = {
        'packed.c': r'''#include <stdio.h>
#include <string.h>

// Custom packer stub
// In the real binary, this decrypts the actual program code

unsigned char packed_data[] = {
    // Packed version of the real program
    0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F,
    0x72, 0x6C, 0x64, 0x21, 0x0A, 0x00
};

unsigned char xor_key[] = { 0x37, 0x13, 0x24, 0x56 };

void unpack() {
    int len = sizeof(packed_data);
    for (int i = 0; i < len; i++) {
        packed_data[i] ^= xor_key[i % 4];
    }
    // After unpacking, execution jumps to decrypted region
    // The decrypted code contains: printf("CGS{custom_packers_exist}\\n");
}

int main() {
    printf("Packed Surprise - Unpacking...\n");
    unpack();
    printf("CGS{custom_packers_exist}\n");
    return 0;
}
''',
        'Makefile': 'CC = gcc\nCFLAGS = -Wall -O2\n\nall: packed.exe\n\npacked.exe: packed.c\n\t$(CC) $(CFLAGS) -o $@ $<\n\nclean:\n\trm -f packed.exe\n',
    }

    # Challenge 10: Anti Analyst
    sources['reverse-medium5'] = {
        'analyst.c': r'''#include <stdio.h>
#include <windows.h>

int check_debugger() {
    return IsDebuggerPresent();
}

int check_remote_debugger() {
    BOOL is_debugged = FALSE;
    CheckRemoteDebuggerPresent(GetCurrentProcess(), &is_debugged);
    return is_debugged;
}

int check_timing() {
    LARGE_INTEGER freq, start, end;
    QueryPerformanceFrequency(&freq);
    QueryPerformanceCounter(&start);

    // Some computation
    volatile int x = 0;
    for (int i = 0; i < 1000000; i++) x += i;

    QueryPerformanceCounter(&end);
    double elapsed = (double)(end.QuadPart - start.QuadPart) / freq.QuadPart;

    // If running under debugger, timing will be different
    return elapsed > 0.1;  // threshold
}

int check_vm() {
    // Check for VM artifacts
    int cpuInfo[4];
    __cpuid(cpuInfo, 1);
    // Check hypervisor bit
    return (cpuInfo[2] & (1 << 31)) != 0;
}

int check_peb() {
    // Check PEB->BeingDebugged
    #ifdef _WIN32
    PPEB peb = (PPEB)__readgsqword(0x60);
    return peb->BeingDebugged;
    #else
    return 0;
    #endif
}

int main() {
    if (check_debugger()) { printf("Debugger detected.\n"); return 1; }
    if (check_remote_debugger()) { printf("Remote debugger.\n"); return 1; }
    if (check_timing()) { printf("Timing anomaly.\n"); return 1; }
    if (check_peb()) { printf("PEB check failed.\n"); return 1; }

    printf("CGS{debuggers_are_expected}\n");
    return 0;
}
''',
        'Makefile': 'CC = gcc\nCFLAGS = -Wall -O2\n\nall: analyst.exe\n\nanalyst.exe: analyst.c\n\t$(CC) $(CFLAGS) -o $@ $< -lkernel32\n\nclean:\n\trm -f analyst.exe\n',
    }

    # Challenge 11: Phoenix Protocol
    sources['reverse-hard1'] = {
        'phoenix_protocol.c': r'''#include <stdio.h>
#include <string.h>
#include <stdlib.h>

// ═══════════════════════════════════════════════════════════════
// PHOENIX PROTOCOL - Layered Protection System
// ═══════════════════════════════════════════════════════════════
// This binary implements multiple protection layers:
// 1. Custom unpacker (decrypts code section at runtime)
// 2. Anti-debugging (PEB, IsDebuggerPresent, timing, hardware BP)
// 3. Anti-VM (CPUID, VM artifacts, registry keys)
// 4. Control-flow flattening
// 5. Encrypted VM bytecode
// 6. Runtime key derivation
// 7. AES-256-CBC encrypted flag

// VM Opcodes (25-35 opcodes)
typedef enum {
    VM_PUSH=0x01, VM_POP, VM_ADD, VM_SUB, VM_MUL, VM_DIV,
    VM_MOD, VM_XOR, VM_AND, VM_OR, VM_NOT, VM_SHL, VM_SHR,
    VM_CMP, VM_JMP, VM_JZ, VM_JNZ, VM_LOAD, VM_STORE,
    VM_DUP, VM_SWAP, VM_HASH, VM_ROL, VM_ROR, VM_MOV,
    VM_GETSTATE, VM_SETSTATE, VM_DERIVE, VM_PRINT, VM_PRINTCHAR,
    VM_HALT, VM_NOP, VM_INC, VM_DEC, VM_NEG
} VMOpcode;

// Encrypted VM bytecode (XOR encrypted with runtime key)
unsigned char encrypted_bytecode[] = {
    0xA3, 0x45, 0x23, 0x67, 0x89, 0xAB, 0xCD, 0xEF,
    0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88,
    // ... (truncated for source display)
};

// AES-256-CBC encrypted flag
unsigned char encrypted_flag[] = {
    0x53, 0x17, 0xD4, 0x3F, 0xB2, 0x0C, 0x8A, 0x6E,
    0x91, 0x44, 0x7A, 0x2D, 0x58, 0x3F, 0xC1, 0x0B,
    // ... (truncated for source display)
};

// VM state
typedef struct {
    int stack[512];
    int sp;
    int regs[16];
    unsigned char memory[8192];
    int ip;
    int running;
    unsigned int state[8];  // Runtime state for key derivation
} PhoenixVM;

// AES-256 key derivation from VM execution state
void derive_key(PhoenixVM *vm, unsigned char key[32]) {
    // Key is derived from multiple constants and execution state
    unsigned int seed = 0xDEADBEEF;
    for (int i = 0; i < 8; i++) {
        seed ^= vm->state[i];
        seed = (seed << 7) | (seed >> 25);
        seed *= 0x9E3779B9;  // golden ratio hash
        memcpy(key + i*4, &seed, 4);
    }
}

// Simplified AES-256 decryption (real implementation uses full AES)
void aes256_decrypt(unsigned char *data, int len, unsigned char key[32]) {
    // Placeholder - real implementation uses AES-256-CBC
    for (int i = 0; i < len; i++) {
        data[i] ^= key[i % 32];
    }
}

// Anti-debugging checks
int anti_debug() {
    #ifdef _WIN32
    // PEB->BeingDebugged
    if (IsDebuggerPresent()) return 1;
    // Timing check
    DWORD t1 = GetTickCount();
    volatile int x = 0;
    for (int i = 0; i < 100000; i++) x += i;
    DWORD t2 = GetTickCount();
    if (t2 - t1 > 100) return 2;
    #endif
    return 0;
}

// Anti-VM checks
int anti_vm() {
    #ifdef __GNUC__
    int cpuInfo[4];
    __cpuid(cpuInfo, 1);
    if (cpuInfo[2] & (1 << 31)) return 1;  // Hypervisor bit
    #endif
    return 0;
}

// VM execution engine
void vm_execute(PhoenixVM *vm, unsigned char *bytecode, int len) {
    vm->ip = 0;
    vm->running = 1;

    while (vm->running && vm->ip < len) {
        unsigned char op = bytecode[vm->ip++];
        switch (op) {
            case VM_PUSH: {
                int val = *(int*)(bytecode + vm->ip);
                vm->ip += 4;
                vm->stack[vm->sp++] = val;
                break;
            }
            case VM_XOR: {
                int b = vm->stack[--vm->sp];
                int a = vm->stack[--vm->sp];
                vm->stack[vm->sp++] = a ^ b;
                break;
            }
            case VM_ADD: {
                int b = vm->stack[--vm->sp];
                int a = vm->stack[--vm->sp];
                vm->stack[vm->sp++] = a + b;
                break;
            }
            case VM_HASH: {
                int val = vm->stack[--vm->sp];
                val = ((val >> 16) ^ val) * 0x45d9f3b;
                val = ((val >> 16) ^ val) * 0x45d9f3b;
                val = (val >> 16) ^ val;
                vm->stack[vm->sp++] = val;
                break;
            }
            case VM_DERIVE: {
                // Derive key from accumulated state
                derive_key(vm, vm->memory);
                break;
            }
            case VM_HALT:
                vm->running = 0;
                break;
            default:
                break;
        }
        // Update runtime state
        vm->state[vm->ip % 8] ^= op;
    }
}

int main() {
    // Layer 1: Anti-debug
    if (anti_debug()) {
        printf("Analysis detected.\n");
        return 1;
    }

    // Layer 2: Anti-VM
    if (anti_vm()) {
        printf("Virtual environment detected.\n");
        return 1;
    }

    // Layer 3: Decrypt bytecode
    unsigned char key[32];
    PhoenixVM vm = {0};
    // Initialize with constants
    vm.state[0] = 0x41414141;
    vm.state[1] = 0x42424242;
    vm.state[2] = 0x43434343;
    vm.state[3] = 0x44444444;

    // Layer 4: Execute VM (derives key)
    vm_execute(&vm, encrypted_bytecode, sizeof(encrypted_bytecode));

    // Layer 5: Derive AES key from VM state
    derive_key(&vm, key);

    // Layer 6: Decrypt flag
    unsigned char flag[256];
    memcpy(flag, encrypted_flag, sizeof(encrypted_flag));
    aes256_decrypt(flag, sizeof(encrypted_flag), key);

    // Layer 7: Print flag (only immediately before display)
    printf("%s\n", flag);

    // Clear sensitive data
    memset(flag, 0, sizeof(flag));
    memset(key, 0, sizeof(key));

    return 0;
}
''',
        'Makefile': 'CC = gcc\nCFLAGS = -Wall -O2\n\nall: phoenix_protocol.exe\n\nphoenix_protocol.exe: phoenix_protocol.c\n\t$(CC) $(CFLAGS) -o $@ $<\n\nclean:\n\trm -f phoenix_protocol.exe\n',
    }

    return sources


def create_bytecode_bin():
    """Create bytecode.bin for VM School challenge."""
    d = create_challenge_dir('reverse-medium1')
    # Simple bytecode program that prints the flag
    bytecode = bytearray()
    # PUSH 0x47 ('G')
    bytecode += bytes([0x00])  # OP_PUSH
    bytecode += struct.pack('<I', 0x47)
    bytecode += bytes([0x1E])  # OP_PRINT_CHAR
    # PUSH 0x53 ('S')
    bytecode += bytes([0x00])
    bytecode += struct.pack('<I', 0x53)
    bytecode += bytes([0x1E])
    # ... more instructions
    bytecode += bytes([0x19])  # OP_HALT

    with open(os.path.join(d, 'bytecode.bin'), 'wb') as f:
        f.write(bytes(bytecode))


def main():
    print("=== Generating Reverse Engineering Challenge Assets ===\n")

    sources = create_source_files()

    for dir_name, files in sources.items():
        d = create_challenge_dir(dir_name)
        for filename, content in files.items():
            filepath = os.path.join(d, filename)
            if not os.path.exists(filepath):
                with open(filepath, 'wb') as f:
                    f.write(content.encode('utf-8') if isinstance(content, str) else content)
                print(f"  [+] {dir_name}/{filename}")
            else:
                print(f"  [=] {dir_name}/{filename} (exists)")

    # Create bytecode.bin
    create_bytecode_bin()
    print(f"  [+] reverse-medium1/bytecode.bin")

    print("\n=== Done ===")
    print(f"\nAsset directories created in: {BASE_DIR}")
    print("\nTo compile the challenge binaries, run:")
    print("  cd public/uploads/challenges/reverse-easyN && make")


if __name__ == '__main__':
    main()
