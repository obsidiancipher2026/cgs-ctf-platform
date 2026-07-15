#include <stdio.h>
#include <string.h>

int main() {
    char input[64];
    const char *password = "s3cr3t_p4ss";

    printf("Enter Password: ");
    gets(input);

    if (strcmp(input, password) == 0) {
        printf("Access Granted\n");
        printf("CGS{strings_are_not_secrets}\n");
    } else {
        printf("Wrong Password\n");
    }
    return 0;
}
