#!/usr/bin/env python3
"""Generate MD5 collision pair - the well-known Wang et al. (2005) single-block collision."""

import hashlib
import json
import urllib.request
import struct
import sys

# Approach 1: Try to fetch collision data from known GitHub repos
def try_fetch():
    urls = [
        "https://raw.githubusercontent.com/cr-marcstevens/hashclash/master/test/collision_data/msg1.bin",
        "https://raw.githubusercontent.com/cr-marcstevens/hashclash/master/test/collision_data/msg2.bin",
        "https://raw.githubusercontent.com/corkami/collisions/master/examples/wang/wang-msg1.bin",
        "https://raw.githubusercontent.com/corkami/collisions/master/examples/wang/wang-msg2.bin",
        "https://raw.githubusercontent.com/corkami/collisions/master/examples/wang/wang-msg1.hex",
        "https://raw.githubusercontent.com/corkami/collisions/master/examples/wang/wang-msg2.hex",
    ]
    
    # First, let's list the wang directory
    api_url = "https://api.github.com/repos/corkami/collisions/contents/examples/wang"
    try:
        resp = urllib.request.urlopen(api_url, timeout=10)
        data = json.loads(resp.read())
        print("Files in corkami/wang directory:")
        for item in data:
            print(f"  {item['name']} ({item['size']} bytes)")
        print()
    except Exception as e:
        print(f"Can't list corkami repo: {e}")
    
    # Try hashclash
    api_url2 = "https://api.github.com/repos/cr-marcstevens/hashclash/contents/test/collision_data"
    try:
        resp = urllib.request.urlopen(api_url2, timeout=10)
        data = json.loads(resp.read())
        print("Files in hashclash collision_data:")
        for item in data:
            print(f"  {item['name']} ({item['size']} bytes)")
        print()
    except Exception as e:
        print(f"Can't list hashclash repo: {e}")
    
    for url in urls:
        try:
            resp = urllib.request.urlopen(url, timeout=10)
            data = resp.read()
            print(f"Fetched {url}: {len(data)} bytes")
            if len(data) >= 64:
                return data
            print(f"  Content: {data[:100]}")
        except Exception as e:
            print(f"Failed {url}: {e}")
    return None

# Approach 2: Hard-code the well-known Wang et al. collision blocks
# These are 128-byte (1024-bit) messages
# The difference is only in 3 words (little-endian 32-bit):
# Word 4 (bytes 16-19): 0x87b5ca2f -> 0x07b5ca2f (MSB flip at bit 31)
# Word 11 (bytes 44-47): 0xadc9e6f6 -> 0xadc966f6 (bit 15 flip at bit 15)
# Word 14 (bytes 56-59): 0x829a9bda -> 0x029a9bda (MSB flip at bit 31)

def known_collision():
    """Return the well-known Wang et al. MD5 collision pair."""
    # These are the exact bytes from the seminal paper
    msg1_hex = (
        "d131dd02c5e6eec4693d9a0698aff95c"
        "2fcab58712467eab4004583eb8fb7f89"
        "55ad340609f4b302d634f869f6e6c9ad"
        "7c0cfc2256cf690239895b8ada9b9a82"
        "e2b7ebee9d3cba55f78cdc2149ffaef0"
        "3561749e5dbba3e0e2ed20388f3206a1"
        "8a53aaf57835ee4724375cb72d00502b"
        "833c06491a8fca36e7a61e840e46f9ed"
        "8dc1220fc0b4df62424d92ebef02e730"
        "72b7c0430ac56f213e6cfd609ef78b53"
        "9d3ae3f8503a2cfb6c38c8fd7d81a563"
        "8d0cc75f97c4632565e6c70c69c731a8"
    )
    msg2_hex = (
        "d131dd02c5e6eec4693d9a0698aff95c"
        "2fcab50712467eab4004583eb8fb7f89"
        "55ad340609f4b302d634f869f6e6c9ad"
        "7c0cfc2256cf690239895b8ada9b9a82"
        "e2b7ebee9d3cba55f78cdc2149ffaef0"
        "3561749e5dbba3e0e2ed20388f3206a1"
        "8a53aaf57835ee4724375cb72d00502b"
        "833c06491a8fca36e7a61e840e46f9ed"
        "8dc1220fc0b4df62424d92ebef02e730"
        "72b7c0430ac56f213e6cfd609ef78b53"
        "9d3ae3f8503a2cfb6c38c8fd7d81a563"
        "8d0cc75f97c4632565e6c70c69c731a8"
    )
    return bytes.fromhex(msg1_hex), bytes.fromhex(msg2_hex)

def verify(msg1, msg2):
    md5_1 = hashlib.md5(msg1).hexdigest()
    md5_2 = hashlib.md5(msg2).hexdigest()
    sha256_1 = hashlib.sha256(msg1).hexdigest()
    sha256_2 = hashlib.sha256(msg2).hexdigest()
    
    print(f"msg1 len: {len(msg1)}")
    print(f"msg2 len: {len(msg2)}")
    print(f"MD5(msg1):    {md5_1}")
    print(f"MD5(msg2):    {md5_2}")
    print(f"SHA256(msg1): {sha256_1}")
    print(f"SHA256(msg2): {sha256_2}")
    print(f"MD5 collision: {md5_1 == md5_2}")
    print(f"SHA256 differ: {sha256_1 != sha256_2}")
    
    # Also show hex dump of differences
    if len(msg1) == len(msg2):
        diffs = []
        for i in range(len(msg1)):
            if msg1[i] != msg2[i]:
                diffs.append((i, msg1[i], msg2[i]))
        print(f"\nByte differences ({len(diffs)}):")
        for offset, b1, b2 in diffs:
            print(f"  offset {offset:3d}: 0x{b1:02x} -> 0x{b2:02x}")
    
    return md5_1 == md5_2

if __name__ == "__main__":
    print("=" * 60)
    print("Attempt 1: Fetch from GitHub")
    print("=" * 60)
    fetched = try_fetch()
    
    if fetched:
        print("\nSuccessfully fetched collision data from GitHub!")
    else:
        print("\nGitHub fetch failed. Using known collision blocks.")
    
    print("\n" + "=" * 60)
    print("Attempt 2: Well-known Wang et al. collision")
    print("=" * 60)
    msg1, msg2 = known_collision()
    result = verify(msg1, msg2)
    
    if result:
        print("\n*** VALID MD5 COLLISION! ***")
        # Write files
        with open(r"C:\Users\CGS\Documents\cgs-ctf-platform\msg1.bin", "wb") as f:
            f.write(msg1)
        with open(r"C:\Users\CGS\Documents\cgs-ctf-platform\msg2.bin", "wb") as f:
            f.write(msg2)
        print(f"\nWritten msg1.bin ({len(msg1)} bytes)")
        print(f"Written msg2.bin ({len(msg2)} bytes)")
    else:
        print("\nNOT a valid MD5 collision. The hardcoded bytes are wrong.")
        print("The known MD5 hash should be 79054025255fb1a26e4bc422aef54eb4")
        print(f"Got: MD5(msg1)={hashlib.md5(msg1).hexdigest()}")
        print(f"     MD5(msg2)={hashlib.md5(msg2).hexdigest()}")
