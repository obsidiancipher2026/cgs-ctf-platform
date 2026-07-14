"""
Create a fragmented disk image for the "Deep Carve" forensics challenge.

The flag CGS{d33p_c4rv1ng_f1nds_fr4gm3nt5} is embedded inside a PNG file
whose data blocks are scattered across non-contiguous clusters on a FAT32-like
disk image. The PNG was "deleted" but its data was never overwritten.

The PNG is large enough (~12KB) to span multiple 4KB clusters, making
reconstruction require following the FAT chain.
"""
import struct
import os
import random
import zlib

random.seed(99)

FLAG = b"CGS{d33p_c4rv1ng_f1nds_fr4gm3nt5}"

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "uploads", "challenges", "forensics-hard5", "disk.dd")

SECTOR_SIZE = 512
SECTORS_PER_CLUSTER = 8
CLUSTER_SIZE = SECTOR_SIZE * SECTORS_PER_CLUSTER  # 4096 bytes
TOTAL_CLUSTERS = 128  # 128 clusters = 512KB disk image
DISK_SIZE = TOTAL_CLUSTERS * CLUSTER_SIZE

data = bytearray(DISK_SIZE)


def build_png_with_flag():
    """Build a valid PNG large enough to span multiple clusters.
    
    Creates a 64x64 RGB image with random pixel data and the flag
    in a tEXt metadata chunk. The resulting PNG is ~10-15KB, spanning
    3-4 clusters at 4KB each.
    """
    # PNG signature
    png_sig = b"\x89PNG\r\n\x1a\n"

    # IHDR: 64x64 pixels, RGB, 8-bit
    width, height = 64, 64
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    ihdr_crc = zlib.crc32(b"IHDR" + ihdr_data) & 0xFFFFFFFF
    ihdr = struct.pack(">I", len(ihdr_data)) + b"IHDR" + ihdr_data + struct.pack(">I", ihdr_crc)

    # IDAT: compressed pixel data for 64x64 RGB image
    # Each row: filter byte (0) + 64*3 RGB bytes = 193 bytes
    raw_rows = bytearray()
    random.seed(42)
    for y in range(height):
        raw_rows.append(0)  # filter: none
        raw_rows.extend(random.randbytes(width * 3))
    
    compressed = zlib.compress(bytes(raw_rows), 9)
    idat_crc = zlib.crc32(b"IDAT" + compressed) & 0xFFFFFFFF
    idat = struct.pack(">I", len(compressed)) + b"IDAT" + compressed + struct.pack(">I", idat_crc)

    # tEXt chunk containing the flag
    tEXt_data = b"Comment" + b"\x00" + FLAG
    tEXt_crc = zlib.crc32(b"tEXt" + tEXt_data) & 0xFFFFFFFF
    tEXt = struct.pack(">I", len(tEXt_data)) + b"tEXt" + tEXt_data + struct.pack(">I", tEXt_crc)

    # tEXt chunk with decoy metadata
    decoy_data = b"Description" + b"\x00" + b"Confidential internal audit image - do not distribute"
    decoy_crc = zlib.crc32(b"tEXt" + decoy_data) & 0xFFFFFFFF
    decoy_tEXt = struct.pack(">I", len(decoy_data)) + b"tEXt" + decoy_data + struct.pack(">I", decoy_crc)

    # IEND chunk
    iend_crc = zlib.crc32(b"IEND") & 0xFFFFFFFF
    iend = struct.pack(">I", 0) + b"IEND" + struct.pack(">I", iend_crc)

    return png_sig + ihdr + idat + tEXt + decoy_tEXt + iend


# ── Build the PNG ──────────────────────────────────────────────────
png_data = build_png_with_flag()
print(f"PNG size: {len(png_data)} bytes ({len(png_data)//1024}KB)")
print(f"Contains flag: {FLAG in png_data}")
print(f"Spans {len(png_data) // CLUSTER_SIZE + 1} clusters (at {CLUSTER_SIZE} bytes each)")

# Verify all CRCs are correct
pos = 8
while pos < len(png_data):
    length = struct.unpack(">I", png_data[pos:pos+4])[0]
    chunk_type = png_data[pos+4:pos+8]
    stored_crc = struct.unpack(">I", png_data[pos+8+length:pos+12+length])[0]
    computed_crc = zlib.crc32(png_data[pos+4:pos+8+length]) & 0xFFFFFFFF
    assert stored_crc == computed_crc, f"CRC mismatch in {chunk_type}"
    pos += 12 + length
print("All PNG CRCs verified OK")

# ── List PNG chunks and their byte ranges ──────────────────────────
png_chunks = []
pos = 8
while pos < len(png_data):
    length = struct.unpack(">I", png_data[pos:pos+4])[0]
    chunk_end = pos + 12 + length
    chunk_type = png_data[pos+4:pos+8].decode()
    png_chunks.append((pos, chunk_end, chunk_type, length))
    pos = chunk_end

print(f"\nPNG has {len(png_chunks)} chunks:")
for start, end, ctype, clen in png_chunks:
    print(f"  {ctype}: bytes {start}-{end} ({end-start} bytes, data={clen})")

# ── MBR / Boot Sector ──────────────────────────────────────────────
mbr = bytearray(SECTOR_SIZE)
mbr[0] = 0xEB; mbr[1] = 0x3C; mbr[2] = 0x90
mbr[3:11] = b"MSDOS5.0"
struct.pack_into("<H", mbr, 11, SECTOR_SIZE)
mbr[13] = SECTORS_PER_CLUSTER
struct.pack_into("<H", mbr, 14, 1)
mbr[16] = 2
struct.pack_into("<H", mbr, 17, 0)
struct.pack_into("<H", mbr, 19, 0)
mbr[21] = 0xF8
struct.pack_into("<H", mbr, 22, 0)
mbr[36] = 128
struct.pack_into("<H", mbr, 44, 2)
mbr[64] = 0x80
mbr[66] = 0x29
mbr[67:71] = b"\x01\x02\x03\x04"
mbr[71:82] = b"CGS DISK   "
mbr[82:90] = b"FAT32   "
mbr[510] = 0x55; mbr[511] = 0xAA
data[0:SECTOR_SIZE] = mbr

# ── Split PNG data into cluster-sized fragments ────────────────────
# Each fragment is up to CLUSTER_SIZE bytes.
# We split at CLUSTER_SIZE boundaries (not chunk boundaries) so that
# each cluster contains exactly one contiguous piece of PNG data.
num_fragments = (len(png_data) + CLUSTER_SIZE - 1) // CLUSTER_SIZE
fragments = []
for i in range(num_fragments):
    start = i * CLUSTER_SIZE
    end = min(start + CLUSTER_SIZE, len(png_data))
    fragments.append(png_data[start:end])

print(f"\nFragment layout ({len(fragments)} fragments, {CLUSTER_SIZE} bytes each):")
for i, frag in enumerate(fragments):
    contains_flag = FLAG in frag
    contains_tEXt = b"tEXt" in frag
    print(f"  Fragment {i}: {len(frag)} bytes, tEXt={contains_tEXt}, flag={contains_flag}")

# ── Choose non-contiguous clusters for fragments ────────────────────
fragment_clusters = [3, 11, 7, 19]
print(f"\nFragment clusters: {fragment_clusters}")
for i, (frag, cluster) in enumerate(zip(fragments, fragment_clusters)):
    print(f"  Fragment {i} -> cluster {cluster}")

# Place fragments on disk
for frag, cluster in zip(fragments, fragment_clusters):
    offset = cluster * CLUSTER_SIZE
    data[offset:offset+len(frag)] = frag

# ── Root directory at cluster 2 ─────────────────────────────────────
root_dir_offset = 2 * CLUSTER_SIZE

# Directory entry for deleted PNG
dir_entry = bytearray(32)
dir_entry[0] = 0xE5                         # deleted marker
dir_entry[1:8] = b"ECRET~1"                 # filename
dir_entry[8:11] = b"PNG"                    # extension
dir_entry[11] = 0x20                        # archive attribute
struct.pack_into("<H", dir_entry, 26, fragment_clusters[0])  # first cluster low
struct.pack_into("<I", dir_entry, 28, len(png_data))         # file size
data[root_dir_offset:root_dir_offset+32] = dir_entry

# Directory entry for NOTES.TXT (active decoy)
dir_entry2 = bytearray(32)
dir_entry2[0:8] = b"NOTES   "
dir_entry2[8:11] = b"TXT"
dir_entry2[11] = 0x20
struct.pack_into("<H", dir_entry2, 26, 5)
struct.pack_into("<I", dir_entry2, 28, 256)
data[root_dir_offset+32:root_dir_offset+64] = dir_entry2

# Decoy content at cluster 5
notes = b"Internal Notes - Do Not Share\r\n"
notes += b"-----------------------------\r\n"
notes += b"The secret image was deleted after the audit.\r\n"
notes += b"But deletion is just a directory change.\r\n"
notes += b"The data still exists on the physical medium.\r\n"
data[5*CLUSTER_SIZE:5*CLUSTER_SIZE+len(notes)] = notes

# ── FAT (File Allocation Table) ────────────────────────────────────
fat_offset = SECTOR_SIZE

# Reserved entries
struct.pack_into("<I", data, fat_offset,      0x0FFFFFF8)
struct.pack_into("<I", data, fat_offset + 4,  0x0FFFFFFF)

# Deleted PNG cluster chain: 3 -> 11 -> 7 -> 19 -> END
struct.pack_into("<I", data, fat_offset + 3*4,  11)
struct.pack_into("<I", data, fat_offset + 11*4, 7)
struct.pack_into("<I", data, fat_offset + 7*4,  19)
struct.pack_into("<I", data, fat_offset + 19*4, 0x0FFFFFFF)

# NOTES.TXT: cluster 5 -> END
struct.pack_into("<I", data, fat_offset + 5*4, 0x0FFFFFFF)

# Root dir: cluster 2 -> END
struct.pack_into("<I", data, fat_offset + 2*4, 0x0FFFFFFF)

# ── Noise / decoy data in unused clusters ──────────────────────────
decoy_strings = [
    b"Lorem ipsum dolor sit amet",
    b"Confidential: Project Midnight",
    b"2025-06-14 System Audit Log",
    b"Admin credentials rotated",
    b"Backup verification complete",
    b"Encrypted volume mounted at /dev/sda1",
    b"Firewall rules updated",
    b"Certificate expiring in 30 days",
    b"Session token: eyJhbGciOiJIUzI1NiJ9",
    b"Database connection pool: 50 max",
]

used_clusters = {2, 3, 5, 7, 11, 19}
for cluster in range(6, TOTAL_CLUSTERS):
    if cluster in used_clusters:
        continue
    offset = cluster * CLUSTER_SIZE
    random.seed(cluster * 1337)
    noise = random.randbytes(CLUSTER_SIZE)
    for s in decoy_strings:
        pos_d = random.randint(0, CLUSTER_SIZE - len(s) - 1)
        noise = noise[:pos_d] + s + noise[pos_d+len(s):]
    data[offset:offset+CLUSTER_SIZE] = noise

# ── Write disk image ───────────────────────────────────────────────
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "wb") as f:
    f.write(data)

print(f"\n{'='*60}")
print(f"Created {OUT}")
print(f"Size: {len(data)} bytes ({len(data)//1024}KB)")
print(f"FAT chain: {' -> '.join(str(c) for c in fragment_clusters)} -> END")
print(f"{'='*60}")

# ── Verify: simulate reconstruction following FAT chain ─────────────
print("\n--- Verification: reconstructing PNG from FAT chain ---")

def read_fat_entry(cluster_num):
    return struct.unpack_from("<I", data, fat_offset + cluster_num * 4)[0]

file_size = len(png_data)
reconstructed = bytearray()
bytes_read = 0
current_cluster = fragment_clusters[0]
steps = []

while bytes_read < file_size and current_cluster < 0x0FFFFFF8:
    read_size = min(CLUSTER_SIZE, file_size - bytes_read)
    offset = current_cluster * CLUSTER_SIZE
    reconstructed += data[offset:offset+read_size]
    bytes_read += read_size
    steps.append(current_cluster)
    
    next_cluster = read_fat_entry(current_cluster)
    current_cluster = next_cluster

print(f"FAT chain followed: {' -> '.join(str(c) for c in steps)} -> END")
print(f"Total bytes read: {bytes_read}")

# Verify PNG signature
assert reconstructed[:8] == b"\x89PNG\r\n\x1a\n", "PNG signature missing!"
print("PNG signature: OK")

# Verify flag is present
assert FLAG in reconstructed, "FLAG NOT FOUND in reconstructed PNG!"
print(f"Flag found: {FLAG.decode()}")

# Verify all CRCs
pos = 8
chunk_count = 0
while pos < len(reconstructed):
    length = struct.unpack(">I", reconstructed[pos:pos+4])[0]
    chunk_type = reconstructed[pos+4:pos+8]
    stored_crc = struct.unpack(">I", reconstructed[pos+8+length:pos+12+length])[0]
    computed_crc = zlib.crc32(reconstructed[pos+4:pos+8+length]) & 0xFFFFFFFF
    assert stored_crc == computed_crc, f"CRC mismatch in {chunk_type}"
    chunk_count += 1
    pos += 12 + length

print(f"All {chunk_count} chunk CRCs: OK")
print(f"Reconstructed PNG: {len(reconstructed)} bytes, VALID!")
print(f"\nChallenge 'Deep Carve' is ready. The flag is in the tEXt metadata chunk.")
