#include <stdio.h>
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
