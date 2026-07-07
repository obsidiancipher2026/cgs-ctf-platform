#include <stdio.h>
#include <string.h>

int main(int argc, char *argv[]) {
    if (argc != 2) {
        printf("Usage: %s <flag>\n", argv[0]);
        return 1;
    }
    // The flag check logic goes here
    printf("Checking...\n");
    return 0;
}
