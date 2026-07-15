# Reference client - uses the correct curve
from server import ec_mul, ec_add, P, A_VALID, B_VALID, Gx, Gy, ORDER

CLIENT_PRIVATE = 12345  # Example client private key
G = (Gx, Gy)

# Client computes public key on the VALID curve
client_Q = ec_mul(CLIENT_PRIVATE, G, A_VALID, P)
print(f"Client public key: Qx={client_Q[0]}, Qy={client_Q[1]}")
