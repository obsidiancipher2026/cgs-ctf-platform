"""
Create a fragmented disk image for the "Deep Carve" forensics challenge.

The flag CGS{d33p_c4rv1ng_f1nds_fr4gm3nt5} is split across scattered,
non-contiguous blocks on a simulated FAT-like disk image.

Solvers need to:
1. Recognize this is a raw disk image
2. Carve for known file signatures (PNG, ZIP, PDF, etc.)
3. Reconstruct the fragmented file from scattered blocks
4. Extract the flag from the reassembled file

The flag is hidden inside a PNG file that has been "deleted" - its data
spans multiple non-contiguous clusters on the disk.
"""
import struct
import os
import random

random.seed(99)

FLAG = b"CGS{d33p_c4rv1ng_f1nds_fr4gm3nt5}"

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "uploads", "challenges", "forensics-hard5", "disk.dd")

SECTOR_SIZE = 512
SECTORS_PER_CLUSTER = 8
CLUSTER_SIZE = SECTOR_SIZE * SECTORS_PER_CLUSTER  # 4096 bytes
TOTAL_CLUSTERS = 64  # 64 clusters = 256KB disk image
DISK_SIZE = TOTAL_CLUSTERS * CLUSTER_SIZE  # 256KB

data = bytearray(DISK_SIZE)

# === MBR (Sector 0) ===
# Partition table entry for a FAT32-like partition starting at sector 1
mbr = bytearray(SECTOR_SIZE)
mbr[0] = 0xEB  # Jump boot
mbr[1] = 0x3C
mbr[2] = 0x90
mbr[3:11] = b"MSDOS5.0"  # OEM ID
struct.pack_into("<H", mbr, 11, SECTOR_SIZE)  # Bytes per sector
mbr[13] = SECTORS_PER_CLUSTER  # Sectors per cluster
struct.pack_into("<H", mbr, 14, 1)  # Reserved sectors
mbr[16] = 2  # Number of FATs
struct.pack_into("<H", mbr, 17, 512)  # Root entries
struct.pack_into("<H", mbr, 19, TOTAL_CLUSTERS * SECTORS_PER_CLUSTER)  # Total sectors (16-bit)
mbr[21] = 0xF8  # Media type (fixed disk)
struct.pack_into("<H", mbr, 22, 128)  # Sectors per FAT
struct.pack_into("<H", mbr, 24, 32)  # Sectors per track
struct.pack_into("<H", mbr, 26, 64)  # Number of heads
mbr[64] = 0x80  # Drive number
mbr[66] = 0x29  # Boot signature
mbr[67:71] = b"\x01\x02\x03\x04"  # Volume serial
mbr[71:82] = b"CGS DISK   "  # Volume label
mbr[82:90] = b"FAT32   "  # Filesystem type

# MBR signature
mbr[510] = 0x55
mbr[511] = 0xAA

data[0:SECTOR_SIZE] = mbr

# === Simulate deleted PNG file scattered across disk ===
# PNG signature + IHDR + IDAT chunks containing the flag
# The PNG will be split into 4 fragments scattered across non-contiguous clusters

# Build a minimal valid PNG with the flag as text in a tEXt chunk
def build_png_with_flag():
    import zlib

    # PNG signature
    png_sig = b"\x89PNG\r\n\x1a\n"

    # IHDR chunk (1x1 pixel, RGB, 8-bit)
    ihdr_data = struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)  # width=1, height=1, bit_depth=8, color_type=2 (RGB)
    ihdr_crc = zlib.crc32(b"IHDR" + ihdr_data) & 0xFFFFFFFF
    ihdr = struct.pack(">I", len(ihdr_data)) + b"IHDR" + ihdr_data + struct.pack(">I", ihdr_crc)

    # IDAT chunk (minimal image data: 1 pixel RGB)
    raw_data = b"\x00\xFF\x00\x00"  # filter byte + RGB (green pixel)
    compressed = zlib.compress(raw_data)
    idat_crc = zlib.crc32(b"IDAT" + compressed) & 0xFFFFFFFF
    idat = struct.pack(">I", len(compressed)) + b"IDAT" + compressed + struct.pack(">I", idat_crc)

    # tEXt chunk containing the flag
    tEXt_data = b"Author" + b"\x00" + FLAG
    tEXt_crc = zlib.crc32(b"tEXt" + tEXt_data) & 0xFFFFFFFF
    tEXt = struct.pack(">I", len(tEXt_data)) + b"tEXt" + tEXt_data + struct.pack(">I", tEXt_crc)

    # IEND chunk
    iend_crc = zlib.crc32(b"IEND") & 0xFFFFFFFF
    iend = struct.pack(">I", 0) + b"IEND" + struct.pack(">I", iend_crc)

    return png_sig + ihdr + idat + tEXt + iend

png_data = build_png_with_flag()
print(f"PNG file size: {len(png_data)} bytes")
print(f"PNG hex (first 32 bytes): {png_data[:32].hex()}")

# Split PNG into 4 fragments and scatter across non-contiguous clusters
fragment_size = (len(png_data) + 3) // 4  # round up
fragments = []
for i in range(4):
    start = i * fragment_size
    end = min(start + fragment_size, len(png_data))
    fragments.append(png_data[start:end])
    print(f"Fragment {i}: offset={start}, size={end-start}")

# Choose non-contiguous cluster positions for the fragments
# Avoid cluster 0 (MBR) and cluster 1 (reserved)
fragment_clusters = [2, 8, 15, 22]  # non-contiguous!
print(f"Fragment clusters: {fragment_clusters}")

# Place fragments on disk
for i, (frag, cluster) in enumerate(zip(fragments, fragment_clusters)):
    offset = cluster * CLUSTER_SIZE
    data[offset:offset+len(frag)] = frag
    print(f"Placed fragment {i} at cluster {cluster} (offset 0x{offset:x})")

# === Add some fake directory entries to make it look like a real disk ===
# Create a fake root directory at cluster 3
root_dir_offset = 3 * CLUSTER_SIZE

# Fake FAT32 directory entry for "SECRET~1.PNG" (deleted)
dir_entry = bytearray(32)
dir_entry[0:8] = b"SECRET~1"      # filename (8.3)
dir_entry[8:11] = b"PNG"           # extension
dir_entry[11] = 0x20               # archive attribute
dir_entry[20:22] = b"\x00\x00"     # create time
dir_entry[22:24] = b"\x00\x00"     # create date
dir_entry[26:28] = struct.pack("<H", fragment_clusters[0])  # first cluster (low word)
dir_entry[28:30] = struct.pack("<H", 0)   # first cluster (high word)
struct.pack_into("<I", dir_entry, 28, len(png_data))  # file size

# Mark first byte as 0xE5 (deleted)
dir_entry[0] = 0xE5

data[root_dir_offset:root_dir_offset+32] = dir_entry

# Add a second fake directory entry for "NOTES.TXT" (active, decoy)
dir_entry2 = bytearray(32)
dir_entry2[0:8] = b"NOTES   "
dir_entry2[8:11] = b"TXT"
dir_entry2[11] = 0x20
struct.pack_into("<H", dir_entry2, 26, 4)  # cluster 4
struct.pack_into("<I", dir_entry2, 28, 128)  # file size

data[root_dir_offset+32:root_dir_offset+64] = dir_entry2

# Write fake content for NOTES.TXT at cluster 4
notes_content = b"Internal Notes - Do Not Share\r\n"
notes_content += b"-----------------------------\r\n"
notes_content += b"The secret image was deleted after the audit.\r\n"
notes_content += b"But deletion is just a directory change.\r\n"
notes_content += b"The data still exists on the physical medium.\r\n"
notes_content += b"Remember: the disk doesn't forget.\r\n"

notes_offset = 4 * CLUSTER_SIZE
data[notes_offset:notes_offset+len(notes_content)] = notes_content

# === Write a fake FAT (File Allocation Table) at sector 1 ===
# FAT starts at sector 1, spans 128 sectors
fat_offset = 1 * SECTOR_SIZE
# First two FAT entries are reserved
struct.pack_into("<I", data, fat_offset, 0x0FFFFFF8)  # media type
struct.pack_into("<I", data, fat_offset + 4, 0x0FFFFFFF)  # end of chain

# Mark fragment clusters as end-of-chain for the deleted file
# (In a real scenario these would be scattered, not sequential)
for i, cluster in enumerate(fragment_clusters):
    fat_entry_offset = fat_offset + cluster * 4
    if i < len(fragment_clusters) - 1:
        struct.pack_into("<I", data, fat_entry_offset, fragment_clusters[i+1])
    else:
        struct.pack_into("<I", data, fat_entry_offset, 0x0FFFFFFF)  # end of chain

# Mark cluster 4 (NOTES.TXT) as end of chain
struct.pack_into("<I", data, fat_offset + 4 * 4, 0x0FFFFFFF)

# === Add noise/decoy data in other clusters ===
decoy_strings = [
    b"Lorem ipsum dolor sit amet",
    b"Confidential: Project Midnight",
    b"2025-06-14 System Audit Log",
    b"Admin credentials rotated",
    b"Backup verification complete",
    b"Encrypted volume mounted at /dev/sda1",
    b"Firewall rules updated",
    b"Certificate expiring in 30 days",
]

for cluster in range(5, TOTAL_CLUSTERS):
    if cluster in fragment_clusters:
        continue
    offset = cluster * CLUSTER_SIZE
    # Fill with pseudo-random but deterministic data
    random.seed(cluster * 1337)
    noise = random.randbytes(CLUSTER_SIZE)
    # Embed some decoy strings at random positions
    for s in decoy_strings:
        pos = random.randint(0, CLUSTER_SIZE - len(s) - 1)
        noise = noise[:pos] + s + noise[pos+len(s):]
    data[offset:offset+CLUSTER_SIZE] = noise

# Write the disk image
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "wb") as f:
    f.write(data)

print(f"\nCreated {OUT} ({len(data)} bytes / {len(data)//1024}KB)")
print(f"Flag '{FLAG.decode()}' is inside a deleted PNG file.")
print(f"PNG fragments scattered across clusters: {fragment_clusters}")
print(f"Solve with: foremost -t png -i disk.dd -o output/")
print(f"Or: binwalk -e disk.dd")
