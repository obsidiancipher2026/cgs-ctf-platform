import os
import json
import hashlib
from Crypto.Cipher import AES
from Crypto.Util.number import bytes_to_long, long_to_bytes

FLAG = os.environ.get("FLAG", "CGS{integrity_matters_more_than_secrecy}")
KEY = bytes.fromhex("6bc157aafa87cf29d8155bdb72272c7c")
IV = bytes.fromhex("823d29238ee26659561f181ca32d505d")

def pad(data):
    pad_len = 16 - (len(data) % 16)
    return data + bytes([pad_len] * pad_len)

def encrypt_session(user, role="guest"):
    data = f"AAAAAAAAAAAAAAA|role={{role}}".encode()
    data = pad(data)
    cipher = AES.new(KEY, AES.MODE_CBC, IV)
    return cipher.encrypt(data)

def decrypt_session(cookie_hex):
    ct = bytes.fromhex(cookie_hex)
    decipher = AES.new(KEY, AES.MODE_CBC, IV)
    pt = decipher.decrypt(ct)
    pad_len = pt[-1]
    if 1 <= pad_len <= 16 and pt[-pad_len:] == bytes([pad_len] * pad_len):
        pt = pt[:-pad_len]
    return pt.decode()

def verify_role(cookie_hex):
    try:
        pt = decrypt_session(cookie_hex)
        print(f"Decrypted: {{pt}}")
        if "role=admin" in pt:
            return True, FLAG
        return False, "Access denied"
    except Exception as e:
        return False, f"Error: {{e}}"

def main():
    print("Session Management System")
    print("1. Get session")
    print("2. Verify session")
    choice = input("Choice: ")
    if choice == "1":
        user = input("Username: ")
        cookie = encrypt_session(user).hex()
        print(f"Your session cookie: {{cookie}}")
    elif choice == "2":
        cookie = input("Session cookie: ")
        ok, msg = verify_role(cookie)
        print(msg)

if __name__ == "__main__":
    main()
