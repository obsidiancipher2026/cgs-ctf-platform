#include <stdio.h>
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
