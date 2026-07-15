/*
 * Challenge 58: Welcome Back
 * Concept: Hardcoded password comparison using strcmp()
 * 
 * Compile: x86_64-w64-mingw32-gcc -O2 -o welcome_back.exe welcome_back.c
 * 
 * The password is visible via: strings welcome_back.exe
 * The flag is constructed at runtime (not stored as a string).
 */
#include <stdio.h>
#include <string.h>

int main(void) {
    char input[64];
    const char *password = "sup3r_s3cr3t_p4ssw0rd";
    
    /* Flag characters stored as immediate values in code, not as a string */
    char flag[32];
    flag[0]  = 'C'; flag[1]  = 'G'; flag[2]  = 'S'; flag[3]  = '{';
    flag[4]  = 's'; flag[5]  = 't'; flag[6]  = 'r'; flag[7]  = 'i';
    flag[8]  = 'n'; flag[9]  = 'g'; flag[10] = 's'; flag[11] = '_';
    flag[12] = 'a'; flag[13] = 'r'; flag[14] = 'e'; flag[15] = '_';
    flag[16] = 'n'; flag[17] = 'o'; flag[18] = 't'; flag[19] = '_';
    flag[20] = 's'; flag[21] = 'e'; flag[22] = 'c'; flag[23] = 'r';
    flag[24] = 'e'; flag[25] = 't'; flag[26] = 's'; flag[27] = '}';
    flag[28] = '\0';
    
    printf("Enter Password: ");
    gets(input);
    
    if (strcmp(input, password) == 0) {
        printf("Access Granted\n");
        printf("%s\n", flag);
    } else {
        printf("Access Denied\n");
    }
    
    return 0;
}
