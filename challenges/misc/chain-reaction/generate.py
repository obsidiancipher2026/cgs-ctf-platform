from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import hashlib

key_seed = "2026-07-01"
key = hashlib.sha256(key_seed.encode()).digest()
iv = b'\x00' * 16

message = b"check the metadata of: /assets/final_message.txt"
cipher = AES.new(key, AES.MODE_CBC, iv)
ct = cipher.encrypt(pad(message, 16))

with open('encrypted.bin', 'wb') as f:
    f.write(ct)

print(f"Encrypted {len(ct)} bytes written to encrypted.bin")
print(f"Key (SHA-256 of '{key_seed}'): {key.hex()}")
