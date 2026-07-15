"""
RSA Challenge Verification Script
Verifies that rsa_params.txt decrypts to the intended flag.
"""
import sys
import re
import math

FLAG = "CGS{fact0r1ng_sm4ll_pr1m3s_1s_ch34p}"
PARAMS_FILE = "public/uploads/challenges/crypto-medium1/rsa_params.txt"

def isqrt(n):
    if n < 0:
        raise ValueError("Square root of negative number")
    if n == 0:
        return 0
    x = n
    y = (x + 1) // 2
    while y < x:
        x = y
        y = (x + n // x) // 2
    return x

def fermat_factor(n):
    a = isqrt(n)
    if a * a == n:
        return a, a
    while True:
        a += 1
        b2 = a * a - n
        b = isqrt(b2)
        if b * b == b2:
            return a - b, a + b

def egcd(a, b):
    if a == 0:
        return b, 0, 1
    g, x1, y1 = egcd(b % a, a)
    return g, y1 - (b // a) * x1, x1

def mod_inv(a, m):
    g, x, y = egcd(a, m)
    if g != 1:
        return None
    return x % m

def main():
    print("=== RSA Challenge Verification ===\n")

    with open(PARAMS_FILE, "r") as f:
        content = f.read()

    n_match = re.search(r'n\s*=\s*(\d+)', content)
    e_match = re.search(r'e\s*=\s*(\d+)', content)
    c_match = re.search(r'ciphertext\s*=\s*(\d+)', content)

    if not n_match or not e_match or not c_match:
        print("FAIL: Could not parse RSA parameters")
        sys.exit(1)

    n = int(n_match.group(1))
    e = int(e_match.group(1))
    c = int(c_match.group(1))

    print(f"n = {n}")
    print(f"e = {e}")
    print(f"ciphertext = {c}")
    print()

    # Step 1: Factor n
    print("Step 1: Factoring n (Fermat method)...")
    p, q = fermat_factor(n)
    if p > q:
        p, q = q, p
    print(f"  p = {p}")
    print(f"  q = {q}")
    print(f"  p * q == n: {p * q == n}")

    # Step 2: Compute phi(n)
    print("\nStep 2: Computing phi(n)...")
    phi = (p - 1) * (q - 1)
    print(f"  gcd(e, phi) = {math.gcd(e, phi) if hasattr(math, 'gcd') else __import__('math').gcd(e, phi)}")

    # Step 3: Compute d
    print("\nStep 3: Computing d...")
    d = mod_inv(e, phi)
    print(f"  d exists: {d is not None}")
    if d is None:
        print("FAIL: d does not exist (gcd(e, phi) != 1)")
        sys.exit(1)

    # Step 4: Decrypt
    print("\nStep 4: Decrypting ciphertext...")
    m_int = pow(c, d, n)

    # Step 5: Convert to bytes
    print("\nStep 5: Converting integer to bytes...")
    hex_str = hex(m_int)[2:]
    if len(hex_str) % 2:
        hex_str = '0' + hex_str
    plaintext_bytes = bytes.fromhex(hex_str)
    plaintext = plaintext_bytes.decode('utf-8')
    print(f"  plaintext: {plaintext}")

    # Step 6: Compare
    print(f"\nStep 6: Comparing with intended flag...")
    print(f"  Expected: {FLAG}")
    print(f"  Got:      {plaintext}")

    if plaintext == FLAG:
        print("\nPASS: Decrypted plaintext matches the intended flag")
        return True
    else:
        print("\nFAIL: Decrypted plaintext does NOT match")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
