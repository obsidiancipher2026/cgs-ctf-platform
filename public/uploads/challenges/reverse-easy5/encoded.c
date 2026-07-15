/*
 * Challenge 62: Base64 Again?
 * Concept: Multiple layers of encoding are not security - just obfuscation
 * 
 * Compile: x86_64-w64-mingw32-gcc -O2 -o encoded.exe encoded.c
 * 
 * Triple encoding: Base64(Base64(ROT13(flag)))
 * 
 * To solve: Decode Base64, decode Base64, then apply ROT13
 * Or: Just decode Base64 twice (ROT13 cancels out for this flag)
 */
#include <stdio.h>

/* Custom base64 decode (no libraries needed) */
static int b64val(char c) {
    if (c >= 'A' && c <= 'Z') return c - 'A';
    if (c >= 'a' && c <= 'z') return c - 'a' + 26;
    if (c >= '0' && c <= '9') return c - '0' + 52;
    if (c == '+') return 62;
    if (c == '/') return 63;
    return -1;
}

static int b64_decode(const char *in, char *out) {
    int len = 0;
    unsigned int buf = 0;
    int bits = 0;
    while (*in) {
        int v = b64val(*in++);
        if (v < 0) continue;
        buf = (buf << 6) | v;
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            out[len++] = (char)((buf >> bits) & 0xFF);
        }
    }
    out[len] = '\0';
    return len;
}

/* ROT13 */
static void rot13(char *s) {
    int i;
    for (i = 0; s[i]; i++) {
        char c = s[i];
        if (c >= 'a' && c <= 'z') s[i] = 'a' + (c - 'a' + 13) % 26;
        else if (c >= 'A' && c <= 'Z') s[i] = 'A' + (c - 'A' + 13) % 26;
    }
}

int main(void) {
    /* Triple-encoded: Base64(Base64(ROT13(flag))) */
    const char *encoded = "VUZSR2UzbHViSEpsWmw5dVpYSmZZV0puWDJaeWNHaGxkbWRzZk1rNUxTME5GVkZGQlJnPT0=";
    
    /* Layer 1: Base64 decode */
    char buf1[128];
    b64_decode(encoded, buf1);
    
    /* Layer 2: Base64 decode */
    char buf2[128];
    b64_decode(buf1, buf2);
    
    /* Layer 3: ROT13 */
    rot13(buf2);
    
    printf("%s\n", buf2);
    return 0;
}
