#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    if (argc != 2) {
        printf("Usage: %s <key>\n", argv[0]);
        return 1;
    }

    unsigned char target[] = {65, 154, 109, 56, 157, 79, 35, 147, 151, 155, 159, 163};
    int len = strlen(argv[1]);
    int target_len = sizeof(target);

    if (len != target_len) {
        printf("Wrong key length\n");
        return 1;
    }

    for (int i = 0; i < len; i++) {
        unsigned char result = (argv[1][i] * 3 + i % 7) & 0xFF;
        if (result != target[i]) {
            printf("Wrong key!\n");
            return 1;
        }
    }

    printf("Correct! Flag: CGS{k3yg3n_l00ps_4r3nt_5ecr3t}\n");
    return 0;
}
