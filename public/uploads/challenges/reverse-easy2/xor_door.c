/*
 * Challenge 59: XOR Door
 * Concept: Single-byte XOR is not encryption - easily reversible
 * 
 * Compile: x86_64-w64-mingw32-gcc -O2 -o door.exe xor_door.c
 * 
 * Approach: Find the XOR key by comparing known plaintext with ciphertext,
 * or simply brute-force all 256 possible keys.
 * 
 * XOR key: 0x5A
 * Decryption: XOR each byte of the encoded data with 0x5A
 */
#include <stdio.h>

int main(void) {
    /* Flag XOR-encrypted with key 0x5A - NOT stored as plaintext */
    unsigned char encoded[] = {
        0x17, 0x37, 0x30, 0x6E, 0x22, 0x23, 0x3F, 0x6D,
        0x20, 0x6E, 0x35, 0x78, 0x36, 0x60, 0x61, 0x20,
        0x63, 0x24, 0x39, 0x79, 0x6F, 0x22, 0x3B, 0x6E,
        0x36, 0x72, 0x78, 0x00
    };
    unsigned char key = 0x5A;
    int i;
    
    /* Decrypt and print */
    for (i = 0; encoded[i]; i++) {
        putchar(encoded[i] ^ key);
    }
    putchar('\n');
    
    return 0;
}
