/*
 * Challenge 60: Arithmetic Lock
 * Concept: Each character is validated with simple arithmetic operations
 * 
 * Compile: x86_64-w64-mingw32-gcc -O2 -o mathlock.exe mathlock.c
 * 
 * The flag is NOT stored as a string - it's built at runtime from byte constants.
 * Reverse engineer the arithmetic to recover each character.
 */
#include <stdio.h>

int main(void) {
    char input[64];
    int i;
    
    /* Arithmetic pairs: each flag char[i] is validated via (char + c1) ^ c2 == expected */
    int c1[] = {3,7,2,5,1,9,4,6,8,3};
    int c2[] = {0x17,0x23,0x11,0x31,0x09,0x19,0x27,0x13,0x37,0x0D};
    
    /* Expected results for each character */
    unsigned char expected[] = {0x5E,0x40,0x38,0x30,0x4C,0x44,0x70,0x54,0x57,0x48,
                                 0x3D,0x63,0x4A,0x44,0x38,0x6D,0x3A,0x27,0x62,0x5E,
                                 0x44,0x37,0x6D,0x68,0x54,0x6A,0x52,0x47,0x64,0x2F};
    
    /* Flag built at runtime from individual bytes */
    char flag[32];
    flag[0]  = 'C'; flag[1]  = 'G'; flag[2]  = 'S'; flag[3]  = '{';
    flag[4]  = 's'; flag[5]  = 'i'; flag[6]  = 'm'; flag[7]  = 'p';
    flag[8]  = 'l'; flag[9]  = 'e'; flag[10] = '_'; flag[11] = 'c';
    flag[12] = 'h'; flag[13] = 'e'; flag[14] = 'c'; flag[15] = 'k';
    flag[16] = 's'; flag[17] = '_'; flag[18] = 'h'; flag[19] = 'i';
    flag[20] = 'd'; flag[21] = 'e'; flag[22] = '_'; flag[23] = 'n';
    flag[24] = 'o'; flag[25] = 't'; flag[26] = 'h'; flag[27] = 'i';
    flag[28] = 'n'; flag[29] = 'g'; flag[30] = '}'; flag[31] = '\0';
    
    printf("Enter the flag: ");
    gets(input);
    
    for (i = 0; i < 30; i++) {
        unsigned char val = (unsigned char)input[i];
        val = (val + c1[i % 10]) ^ c2[i % 10];
        if (val != expected[i]) {
            printf("Wrong flag.\n");
            return 1;
        }
    }
    
    printf("%s\n", flag);
    return 0;
}
