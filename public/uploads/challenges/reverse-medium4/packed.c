#include <stdio.h>
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
