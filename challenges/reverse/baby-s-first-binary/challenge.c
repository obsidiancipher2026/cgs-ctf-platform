#include <stdio.h>
#include <string.h>

int main() {
    char input[64];
    printf("Enter password: ");
    fgets(input, sizeof(input), stdin);
    input[strcspn(input, "\n")] = 0;

    if (strcmp(input, "p4ssw0rd_123") == 0) {
        printf("CGS{str1ngs_d1dnt_l13}\n");
    } else {
        printf("Access denied\n");
    }
    return 0;
}
