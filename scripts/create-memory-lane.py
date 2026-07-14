import struct
import os
import random

random.seed(42)

FLAG = b"CGS{v0l4t1l1ty_n3v3r_f0rg3ts}"

out = os.path.join(os.path.dirname(__file__), "..", "public", "uploads", "challenges", "forensics-hard3", "memory.raw")

data = bytearray()

# --- Fake Linux ELF core dump header (512 bytes) ---
data += b"\x7fELF"          # ELF magic
data += b"\x02"              # 64-bit
data += b"\x01"              # little endian
data += b"\x01"              # ELF version
data += b"\x00" * 9          # padding to offset 16
data += struct.pack("<H", 4)   # ET_CORE
data += struct.pack("<H", 0x3E) # EM_X86_64
data += struct.pack("<I", 1)
data += struct.pack("<Q", 0x400000)  # entry point
data += struct.pack("<Q", 0)         # phoff
data += struct.pack("<Q", 0)         # shoff
data += struct.pack("<I", 0)
data += struct.pack("<H", 64)        # ehsize
data += struct.pack("<H", 56)        # phentsize
data += struct.pack("<H", 0)         # phnum
data += struct.pack("<H", 64)        # shentsize
data += struct.pack("<H", 0)         # shnum
data += struct.pack("<H", 0)         # shstrndx
data += b"\x00" * (512 - len(data))

# --- Fake PT_NOTE program header (describes memory regions) ---
# We'll lay out several "memory regions" with realistic content

regions = []

# Region 1: [kernel] 0xffff880000000000 - fake kernel text
region1 = bytearray()
region1 += b"\x48\x89\xe5\x48\x83\xec\x20\xc7\x45\xfc\x00\x00\x00\x00"
region1 += b"\x48\x8d\x3d\x00\x00\x00\x00\x48\x89\x7d\xf0\xe8\x00\x00\x00\x00"
region1 += random.randbytes(4080)
regions.append(region1)

# Region 2: [stack] - looks like a thread stack with environment variables
region2 = bytearray()
region2 += b"TERM=xterm-256color\x00"
region2 += b"PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\x00"
region2 += b"HOME=/root\x00"
region2 += b"LANG=en_US.UTF-8\x00"
region2 += b"SSH_CLIENT=192.168.1.105 44322 22\x00"
region2 += b"SSH_TTY=/dev/pts/0\x00"
region2 += b"USER=root\x00"
region2 += b"SHELL=/bin/bash\x00"
region2 += b"PS1=[\\u@\\h \\W]\\$ \x00"
region2 += b"LS_COLORS=rs=0:di=01;34:ln=01;36:mh=00:pi=40;33\x00"
region2 += random.randbytes(3800)
regions.append(region2)

# Region 3: [heap] - contains the flag buried in process memory
region3 = bytearray()
region3 += random.randbytes(2048)
# Flag embedded as a "command line argument" or "stored credential"
region3 += b"\x00" * 16
region3 += b"process_name: memory_scanner\x00"
region3 += b"pid: 3847\x00"
region3 += b"ppid: 1204\x00"
region3 += b"user: root\x00"
region3 += b"status: running\x00"
region3 += b"start_time: 2025-06-14T08:32:11\x00"
region3 += b"scan_target: /dev/mem\x00"
region3 += b"scan_depth: full\x00"
region3 += b"result_buffer: "
region3 += FLAG
region3 += b"\x00"
region3 += b"checksum: a3f8b2c1\x00"
region3 += random.randbytes(512)
# More realistic heap data
region3 += b"\x00\x00\x00\x00\x00\x00\x00\x00"
region3 += struct.pack("<Q", 0x7f8a4c001200)
region3 += struct.pack("<Q", 0x7f8a4c002400)
region3 += struct.pack("<Q", 0x7f8a4c003600)
region3 += random.randbytes(1900)
regions.append(region3)

# Region 4: [mmap] - shared library pages
region4 = bytearray()
region4 += b"\x7fELF"  # ELF header of a shared lib
region4 += random.randbytes(3996)
regions.append(region4)

# Region 5: [vdso] - fake vDSO page
region5 = bytearray()
region5 += b"\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00"
region5 += random.randbytes(3984)
regions.append(region5)

# Region 6: [heap cont.] - more process data
region6 = bytearray()
region6 += random.randbytes(1024)
region6 += b"\x00configuration_data\x00"
region6 += b"db_host=localhost\x00"
region6 += b"db_port=5432\x00"
region6 += b"db_name=ctf_platform\x00"
region6 += b"db_user=ctf_admin\x00"
region6 += b"db_pass=Pr0d_S3cur3_2025!\x00"
region6 += random.randbytes(2900)
regions.append(region6)

# Region 7: [anon] - anonymous mapping with flags scattered
region7 = bytearray()
region7 += random.randbytes(3000)
region7 += b"\x00" * 32
region7 += b"scanned_objects:\x00"
region7 += b"  - type: credential_cache\x00"
region7 += b"    value: "
region7 += FLAG
region7 += b"\x00"
region7 += b"  - type: session_token\x00"
region7 += b"    value: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9\x00"
region7 += random.randbytes(800)
regions.append(region7)

# Region 8-12: more noise regions to make the dump larger
for i in range(5):
    r = random.randbytes(4096)
    # Embed some realistic-looking strings
    fake_strings = [
        f"/proc/{3000+i}/mem\x00".encode(),
        f"task_struct_{i}\x00".encode(),
        f"vm_area_struct_{i}\x00".encode(),
        b"SLAB:\x00",
        b"PAGE_TABLE:\x00",
    ]
    pos = random.randint(0, len(r) - 200)
    for s in fake_strings:
        r = r[:pos] + s + r[pos + len(s):]
        pos = (pos + len(s) + random.randint(50, 200)) % len(r)
    regions.append(r)

# Write all regions
for region in regions:
    data += region

# Pad to ensure the flag appears only within the designated regions
# and the file is a reasonable size (~2MB for a realistic small dump)
target_size = 2 * 1024 * 1024  # 2MB
while len(data) < target_size:
    chunk_size = min(4096, target_size - len(data))
    data += random.randbytes(chunk_size)

with open(out, "wb") as f:
    f.write(data)

print(f"Created {out} ({len(data)} bytes)")
print(f"Flag '{FLAG.decode()}' embedded in memory regions 3 and 7")
