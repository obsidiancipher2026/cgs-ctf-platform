#include <stdio.h>

int main() {
    unsigned char input[8];
    printf("Enter the code: ");
    scanf("%8s", input);

    if ((input[0] + 7 == 'C') &&
        (input[1] ^ 0x21 == 'G') &&
        (input[2] - 3 == 'S') &&
        (input[3] + 1 == '{') &&
        (input[4] * 2 == 's' * 2) &&
        (input[5] - 5 == 'm') &&
        (input[6] + 9 == 'p') &&
        (input[7] ^ 0x07 == 'l')) {
        printf("CGS{simple_checks_hide_nothing}\n");
    } else {
        printf("Wrong code.\n");
    }
    return 0;
}
