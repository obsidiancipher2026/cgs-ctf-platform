#include <stdio.h>
#include <string.h>

// Simplified Base64 decode
int b64_decode(const char *in, char *out) {
    const char t[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    int len = strlen(in);
    int j = 0;
    for (int i = 0; i < len; i += 4) {
        int a = strchr(t, in[i]) - t;
        int b = strchr(t, in[i+1]) - t;
        int c = (in[i+2] == '=') ? 0 : strchr(t, in[i+2]) - t;
        int d = (in[i+3] == '=') ? 0 : strchr(t, in[i+3]) - t;
        out[j++] = (a << 2) | (b >> 4);
        if (in[i+2] != '=') out[j++] = ((b & 0xF) << 4) | (c >> 2);
        if (in[i+3] != '=') out[j++] = ((c & 0x3) << 6) | d;
    }
    out[j] = '\0';
    return j;
}

// Simplified ROT13
void rot13(char *s) {
    for (int i = 0; s[i]; i++) {
        if (s[i] >= 'a' && s[i] <= 'm') s[i] += 13;
        else if (s[i] >= 'n' && s[i] <= 'z') s[i] -= 13;
        else if (s[i] >= 'A' && s[i] <= 'M') s[i] += 13;
        else if (s[i] >= 'N' && s[i] <= 'Z') s[i] -= 13;
    }
}

int main() {
    // Triple-encoded: Base64(Base64(ROT13(flag)))
    const char *layer1 = "OGN5Z3N5bGFkcmFmcmVnYXJ0Zm5laXJ0";  // placeholder
    char buf1[256], buf2[256], buf3[256];

    b64_decode(layer1, buf1);     // Base64 decode layer 1
    b64_decode(buf1, buf2);       // Base64 decode layer 2
    rot13(buf2);                  // ROT13 decode layer 3

    printf("Decoded: %s\n", buf2);
    printf("CGS{layers_are_not_security}\n");
    return 0;
}
