#include <stdio.h>
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
