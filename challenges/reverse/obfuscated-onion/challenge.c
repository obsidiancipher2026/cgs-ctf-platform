#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <sys/ptrace.h>

int main() {
    if (ptrace(PTRACE_TRACEME, 0, 0, 0) == -1) {
        printf("I feel watched...\n");
        return 1;
    }

    unsigned char encoded[] = {
        0x4E, 0x53, 0x48, 0x59, 0x59, 0x03, 0x04, 0x52,
        0x74, 0x22, 0x34, 0x05, 0x0D, 0x5C, 0x16, 0x45,
        0x0F, 0xF7, 0xD4, 0xE6, 0xAD, 0xCB, 0x94, 0xDD,
        0xEA, 0xCC, 0xF7, 0xBE, 0xE0, 0xEB, 0xB1, 0x85,
        0xDE, 0x89
    };
    int len = sizeof(encoded);

    char decoded[len + 1];
    for (int i = 0; i < len; i++) {
        unsigned char key = (i * 7 + 13) & 0xFF;
        decoded[i] = encoded[i] ^ key;
    }
    decoded[len] = '\0';

    printf("%s\n", decoded);
    return 0;
}
