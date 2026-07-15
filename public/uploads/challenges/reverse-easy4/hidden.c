/*
 * Challenge 61: Hidden Function
 * Concept: Unused code is still code - find the secret() function
 * 
 * Compile: x86_64-w64-mingw32-gcc -O2 -o hidden.exe hidden.c
 * 
 * The main() just prints "Nothing to see here."
 * The secret() function is never called but constructs the flag from fragments.
 * 
 * To solve: Load in a disassembler, find the unreachable function,
 * reverse engineer what it constructs.
 */
#include <stdio.h>

/* This function is NEVER called from main() */
void secret(void) {
    /* Flag constructed from 4 fragments */
    char flag[32];
    
    /* Fragment 1 */
    flag[0]  = 'C'; flag[1]  = 'G'; flag[2]  = 'S'; flag[3]  = '{';
    /* Fragment 2 */
    flag[4]  = 'u'; flag[5]  = 'n'; flag[6]  = 'u'; flag[7]  = 's';
    flag[8]  = 'e'; flag[9]  = 'd'; flag[10] = '_';
    /* Fragment 3 */
    flag[11] = 'c'; flag[12] = 'o'; flag[13] = 'd'; flag[14] = 'e';
    flag[15] = '_'; flag[16] = 'i'; flag[17] = 's'; flag[18] = '_';
    /* Fragment 4 */
    flag[19] = 's'; flag[20] = 't'; flag[21] = 'i'; flag[22] = 'l';
    flag[23] = 'l'; flag[24] = '_'; flag[25] = 'c'; flag[26] = 'o';
    flag[27] = 'd'; flag[28] = 'e'; flag[29] = '}';
    flag[30] = '\0';
    
    printf("%s\n", flag);
}

int main(void) {
    printf("Nothing to see here.\n");
    return 0;
}
