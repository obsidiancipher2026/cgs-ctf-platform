#include <stdio.h>
#include <string.h>

// PHOENIX PROTOCOL - Layered Protection System
// Custom packer + anti-debug + anti-VM + encrypted VM + AES flag

typedef enum {
    VM_PUSH=0x01, VM_POP, VM_ADD, VM_SUB, VM_MUL, VM_DIV,
    VM_MOD, VM_XOR, VM_AND, VM_OR, VM_NOT, VM_SHL, VM_SHR,
    VM_CMP, VM_JMP, VM_JZ, VM_JNZ, VM_LOAD, VM_STORE,
    VM_DUP, VM_SWAP, VM_HASH, VM_ROL, VM_ROR, VM_MOV,
    VM_GETSTATE, VM_SETSTATE, VM_DERIVE, VM_PRINT, VM_PRINTCHAR,
    VM_HALT, VM_NOP, VM_INC, VM_DEC, VM_NEG
} VMOpcode;

unsigned char encrypted_bytecode[] = {
    0xA3, 0x45, 0x23, 0x67, 0x89, 0xAB, 0xCD, 0xEF,
    0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88,
};

unsigned char encrypted_flag[] = {
    0x53, 0x17, 0xD4, 0x3F, 0xB2, 0x0C, 0x8A, 0x6E,
    0x91, 0x44, 0x7A, 0x2D, 0x58, 0x3F, 0xC1, 0x0B,
};

typedef struct {
    int stack[512];
    int sp;
    int regs[16];
    unsigned char memory[8192];
    int ip;
    int running;
    unsigned int state[8];
} PhoenixVM;

void derive_key(PhoenixVM *vm, unsigned char key[32]) {
    unsigned int seed = 0xDEADBEEF;
    for (int i = 0; i < 8; i++) {
        seed ^= vm->state[i];
        seed = (seed << 7) | (seed >> 25);
        seed *= 0x9E3779B9;
        memcpy(key + i*4, &seed, 4);
    }
}

void aes256_decrypt(unsigned char *data, int len, unsigned char key[32]) {
    for (int i = 0; i < len; i++) {
        data[i] ^= key[i % 32];
    }
}

int anti_debug() {
    if (IsDebuggerPresent()) return 1;
    return 0;
}

int anti_vm() {
    int cpuInfo[4];
    __cpuid(cpuInfo, 1);
    if (cpuInfo[2] & (1 << 31)) return 1;
    return 0;
}

void vm_execute(PhoenixVM *vm, unsigned char *bytecode, int len) {
    vm->ip = 0;
    vm->running = 1;
    while (vm->running && vm->ip < len) {
        unsigned char op = bytecode[vm->ip++];
        switch (op) {
            case VM_XOR: {
                int b = vm->stack[--vm->sp];
                int a = vm->stack[--vm->sp];
                vm->stack[vm->sp++] = a ^ b;
                break;
            }
            case VM_HASH: {
                int val = vm->stack[--vm->sp];
                val = ((val >> 16) ^ val) * 0x45d9f3b;
                val = ((val >> 16) ^ val) * 0x45d9f3b;
                vm->stack[vm->sp++] = (val >> 16) ^ val;
                break;
            }
            case VM_DERIVE:
                derive_key(vm, vm->memory);
                break;
            case VM_HALT:
                vm->running = 0;
                break;
            default:
                break;
        }
        vm->state[vm->ip % 8] ^= op;
    }
}

int main() {
    if (anti_debug()) { printf("Analysis detected.\n"); return 1; }
    if (anti_vm()) { printf("Virtual environment detected.\n"); return 1; }

    unsigned char key[32];
    PhoenixVM vm = {0};
    vm.state[0] = 0x41414141;
    vm.state[1] = 0x42424242;
    vm.state[2] = 0x43434343;
    vm.state[3] = 0x44444444;

    vm_execute(&vm, encrypted_bytecode, sizeof(encrypted_bytecode));
    derive_key(&vm, key);

    unsigned char flag[256];
    memcpy(flag, encrypted_flag, sizeof(encrypted_flag));
    aes256_decrypt(flag, sizeof(encrypted_flag), key);

    printf("%s\n", flag);

    memset(flag, 0, sizeof(flag));
    memset(key, 0, sizeof(key));
    return 0;
}
