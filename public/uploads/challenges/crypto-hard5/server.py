import os
import hashlib

P = 115792089210356248762697446949407573530086143415290314195533631308867097853951
A_VALID = 115792089210356248762697446949407573530086143415290314195533631308867097853948
B_VALID = 41058363725152142129326129780047268409114441015993725554835256314039467401291
Gx = 48439561293906451759052585252797914202762949526041747995844080717082404635286
Gy = 36134250956749795798585127919587881956611106672985015071877198253568414405109
ORDER = 115792089210356248762697446949407573529996955224135760342422259061068512044369

SERVER_PRIVATE = 97092073796983986774381980821144125571907651350894568788100992512256398308199

def ec_add(p1, p2, a_coeff, p_mod):
    if p1 is None: return p2
    if p2 is None: return p1
    x1, y1 = p1
    x2, y2 = p2
    if x1 == x2 and y1 == y2:
        lam = (3 * x1 * x1 + a_coeff) * pow(2 * y1, -1, p_mod) % p_mod
    elif x1 == x2:
        return None
    else:
        lam = (y2 - y1) * pow(x2 - x1, -1, p_mod) % p_mod
    x3 = (lam * lam - x1 - x2) % p_mod
    y3 = (lam * (x1 - x3) - y1) % p_mod
    return (x3, y3)

def ec_mul(k, point, a_coeff, p_mod):
    result = None
    addend = point
    while k > 0:
        if k & 1:
            result = ec_add(result, addend, a_coeff, p_mod)
        addend = ec_add(addend, addend, a_coeff, p_mod)
        k >>= 1
    return result

def ecdh_server(client_Qx, client_Qy):
    """Compute shared secret - NO VALIDATION of curve parameters!"""
    Q = (client_Qx, client_Qy)
    shared = ec_mul(SERVER_PRIVATE, Q, A_VALID, P)  # Bug: uses server's a
    if shared is None:
        return None
    return shared[0]  # Return x-coordinate as shared secret

def main():
    print("ECDH Key Exchange Server")
    print("Send your public key point:")
    x = int(input("Qx: "))
    y = int(input("Qy: "))
    secret = ecdh_server(x, y)
    if secret is not None:
        print(f"Shared secret computed: {{secret}}")
    else:
        print("Invalid point")

if __name__ == "__main__":
    main()
