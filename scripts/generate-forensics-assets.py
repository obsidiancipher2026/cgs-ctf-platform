#!/usr/bin/env python3
"""Generate all forensics challenge assets."""
import struct, io, os, base64, hashlib, random

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'uploads', 'challenges')
os.makedirs(OUT, exist_ok=True)

def write(relpath, data):
    p = os.path.join(OUT, relpath)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'wb') as f:
        f.write(data)
    print(f'  [+] {relpath} ({len(data)} bytes)')

# ── Easy 1: JPEG with trailing data after EOF ──
print('[*] Easy 1 — Hidden in Plain Sight')
jpeg_eof = bytes([0xFF, 0xD9])
# Minimal valid JPEG (SOI + APP0 + SOS + EOI)
jpeg_body = (
    b'\xff\xd8\xff\xe0'  # SOI + APP0 marker
    b'\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00'  # APP0 segment
    b'\xff\xdb\x00\x43\x00'  # DQT marker
    + bytes(range(64))  # quantization table
    + b'\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x11\x00'  # SOF
    + b'\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b'  # DHT
    + b'\xff\xda\x00\x08\x01\x01\x00\x00\x3f\x00\x7b\x40'  # SOS
    + b'\x00' * 16  # scan data
    + jpeg_eof  # EOI
)
flag1 = b'CGS{tr41l1ng_d4t4_1s_3v3ryw3r3}'
# Pad to make it look like a real image
fake_comment = b'\xff\xfe' + struct.pack('>H', len(flag1) + 2) + flag1  # COM marker
trailing = b'\x00DEADBEEF' + flag1 + b'\nSome trailing metadata\x00'
easy1 = jpeg_body + fake_comment + trailing
write('forensics-easy1/trailing.jpg', easy1)

# ── Easy 2: Whitespace Secrets ──
print('[*] Easy 2 — Whitespace Secrets')
flag2 = 'CGS{wh1t3sp4c3_h1d3s_th1ngs}'
bits = ''.join(format(ord(c), '08b') for c in flag2)
whitespace = ''.join('\t' if b == '1' else ' ' for b in bits)
easy2 = (f'Nothing to see here.\n{whitespace}\nJust a blank file.\n').encode()
write('forensics-easy2/empty.txt', easy2)

# ── Easy 3: Reversed Image ──
print('[*] Easy 3 — Reversed Image')
png_sig = b'\x89PNG\r\n\x1a\n'
reversed_sig = bytes(reversed(png_sig))
# Minimal IHDR chunk
width, height = 1, 1
ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
ihdr_crc = struct.pack('>I', 0)  # placeholder
ihdr = struct.pack('>I', 13) + b'IHDR' + ihdr_data + ihdr_crc
# Minimal IDAT
import zlib
raw = b'\x00\x80\x80\x80'  # filter byte + 1 pixel RGB
compressed = zlib.compress(raw)
idat_crc = struct.pack('>I', 0)
idat = struct.pack('>I', len(compressed)) + b'IDAT' + compressed + idat_crc
iend_crc = struct.pack('>I', 0)
iend = struct.pack('>I', 0) + b'IEND' + iend_crc
easy3 = reversed_sig + ihdr + idat + iend
write('forensics-easy3/corrupted.png', easy3)

# ── Easy 4: EXIF Explorer ──
print('[*] Easy 4 — EXIF Explorer')
flag4 = b'CGS{m3t4d4t4_t3lls_st0r13s}'
# Minimal JPEG with EXIF containing Comment field
# Build a minimal EXIF block
def make_exif_jpeg(comment):
    """Create a minimal JPEG with EXIF Comment field."""
    # EXIF header
    exif_header = b'Exif\x00\x00'
    # TIFF header (little-endian)
    tiff_header = b'II' + struct.pack('<H', 42) + struct.pack('<I', 8)
    # IFD0 with one entry: ImageDescription (0x010E)
    ifd_offset = 8
    num_entries = 1
    ifd = struct.pack('<H', num_entries)
    # Tag 0x010E = ImageDescription, type 2 (ASCII), count = len+1
    desc_bytes = comment + b'\x00'
    ifd += struct.pack('<HHI', 0x010E, 2, len(desc_bytes))
    ifd += struct.pack('<I', ifd_offset + 2 + num_entries * 12 + 4)  # value offset
    ifd += struct.pack('<I', 0)  # next IFD offset (none)
    exif_data = exif_header + tiff_header + ifd + desc_bytes
    # JPEG structure
    soi = b'\xff\xd8'
    app1_marker = b'\xff\xe1'
    app1_len = 2 + len(exif_data)
    app1 = app1_marker + struct.pack('>H', app1_len) + exif_data
    # Minimal image data
    dht = b'\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b'
    sos = b'\xff\xda\x00\x08\x01\x01\x00\x00\x3f\x00\x7b\x40'
    scan = b'\x00' * 8
    eoi = b'\xff\xd9'
    return soi + app1 + dht + sos + scan + eoi

easy4 = make_exif_jpeg(flag4)
write('forensics-easy4/photo.jpg', easy4)

# ── Easy 5: Base64 in a PCAP ──
print('[*] Easy 5 — Base64 in a PCAP')
flag5 = 'CGS{p4ck3ts_c4rry_s3cr3ts}'
b64flag = base64.b64encode(flag5.encode()).decode()
# Build a minimal pcap with one HTTP POST
def make_pcap(post_body):
    # Global header
    pcap = struct.pack('<IHHiIII',
        0xa1b2c3d4,  # magic
        2, 4,         # version
        0,            # timezone
        0,            # sigfigs
        65535,        # snaplen
        1,            # linktype: Ethernet
    )
    # Ethernet frame: src + dst + type(0x0800=IPv4)
    eth = b'\x00' * 6 + b'\x00' * 6 + struct.pack('>H', 0x0800)
    # IP header
    ip_payload = (
        b'\x45\x00'  # ver/ihl, DSCP
        + struct.pack('>HH', 20 + len(post_body), 1)  # total length, id
        + b'\x40\x00\x40\x06'  # flags, ttl, proto=TCP
        + b'\x00\x00\x00\x00'  # checksum (dummy)
        + b'\x7f\x00\x00\x01'  # src IP: 127.0.0.1
        + b'\x7f\x00\x00\x02'  # dst IP: 127.0.0.2
    )
    # TCP header (src=43210, dst=80, PSH+ACK, payload)
    tcp_data_off_flags = ((5 << 4) & 0xF0)  # data offset=5 (20 bytes), reserved=0
    tcp_flags = 0x18  # PSH+ACK
    tcp = struct.pack('>HHII BBHHH',
        43210, 80,          # src, dst port
        0, 1,               # seq, ack
        tcp_data_off_flags, # data offset + reserved
        tcp_flags,          # flags
        65535, 0, 0         # window, checksum, urgent
    ) + post_body
    ip_total_len = 20 + len(tcp)
    ip_header = struct.pack('>BBHHHBBHII',
        0x45, 0, ip_total_len, 1, 0x4000, 64, 6, 0,
        0x7f000001, 0x7f000002,
    )
    frame = eth + ip_header + tcp
    # Packet header
    pkt_hdr = struct.pack('<IIII', 0, 0, len(frame), len(frame))
    pcap += pkt_hdr + frame
    return pcap

http_post = (
    f'POST /flag HTTP/1.1\r\n'
    f'Host: localhost\r\n'
    f'Content-Type: application/x-www-form-urlencoded\r\n'
    f'Content-Length: {len(b64flag) + 5}\r\n'
    f'\r\n'
    f'data={b64flag}'
).encode()
easy5 = make_pcap(http_post)
write('forensics-easy5/traffic.pcap', easy5)

# ── Medium 1: LSB PNG ──
print('[*] Medium 1 — LSB PNG')
flag6 = 'CGS{l345t_51gn1f1c4nt_b1t}'
flag_bits = ''.join(format(ord(c), '08b') for c in flag6)
# Pad to 30*30 = 900 pixels (enough for the flag)
width, height = 30, 30
pixels = []
bit_idx = 0
for y in range(height):
    row = []
    for x in range(width):
        r = random.randint(100, 200)
        g = random.randint(100, 200)
        b = random.randint(100, 200)
        if bit_idx < len(flag_bits):
            lsb = int(flag_bits[bit_idx])
            r = (r & 0xFE) | lsb
            bit_idx += 1
        row.append((r, g, b))
    pixels.append(row)
# Build PNG
def make_png(w, h, pxls):
    sig = b'\x89PNG\r\n\x1a\n'
    # IHDR
    ihdr = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    ihdr_chunk = chunk(b'IHDR', ihdr)
    # IDAT
    raw_data = b''
    for row in pxls:
        raw_data += b'\x00'  # filter byte
        for r, g, b in row:
            raw_data += bytes([r, g, b])
    compressed = zlib.compress(raw_data)
    idat_chunk = chunk(b'IDAT', compressed)
    iend_chunk = chunk(b'IEND', b'')
    return sig + ihdr_chunk + idat_chunk + iend_chunk

easy_med1 = make_png(width, height, pixels)
write('forensics-medium1/image.png', easy_med1)

# ── Medium 2: Corrupted Header Recovery ──
print('[*] Medium 2 — Corrupted Header Recovery')
flag7 = 'CGS{z1p_h34d3r_r3p41r}'
# Create a valid ZIP, then corrupt its magic bytes
import zipfile
zip_buf = io.BytesIO()
with zipfile.ZipFile(zip_buf, 'w') as zf:
    zf.writestr('readme.txt', 'This is a red herring file.\nNothing special here.')
    zf.writestr('flag.txt', f'The flag is: {flag7}\n')
zip_bytes = zip_buf.getvalue()
# Corrupt: change first 4 bytes from PK\x03\x04 to something else
corrupted = b'\x00\x00\x00\x00' + zip_bytes[4:]
write('forensics-medium2/archive.zip', corrupted)

# ── Medium 3: Memory Dump Strings ──
print('[*] Medium 3 — Memory Dump Strings')
flag8 = 'CGS{m3m0ry_n3v3r_f0rg3ts}'
# Create a fake memory dump with some noise and the flag in an env var
random.seed(42)
noise_size = 512 * 1024  # 512KB of noise
noise = bytes(random.getrandbits(8) for _ in range(noise_size))
env_str = f'FLAG={flag8}'.encode()
process_str = b'python3 /opt/scripts/analyze.py'
# Embed near the end
padding = b'\x00' * 256
dump = noise + padding + env_str + b'\x00' + process_str + b'\x00' + padding + noise[:100000]
write('forensics-medium3/memory.raw', dump)

# ── Medium 4: Audio Spectrogram ──
print('[*] Medium 4 — Audio Spectrogram')
flag9 = 'CGS{s0und_w4v3s_h1d3_1m4g3s}'
# Create a WAV file with frequency-encoded flag
sample_rate = 44100
duration = 5  # seconds
n_samples = sample_rate * duration
# Encode flag as binary in different frequencies
flag_bits9 = ''.join(format(ord(c), '08b') for c in flag9)
samples = []
samples_per_bit = n_samples // (len(flag_bits9) + 2)
# Add 2 seconds of silence at start
for _ in range(sample_rate * 2):
    samples.append(0)
for i, bit in enumerate(flag_bits9):
    freq = 800 if bit == '1' else 400  # different frequencies for 1 and 0
    amplitude = 16000 if bit == '1' else 8000
    for j in range(samples_per_bit):
        t = (i * samples_per_bit + j) / sample_rate
        val = int(amplitude * __import__('math').sin(2 * 3.14159265 * freq * t))
        samples.append(max(-32768, min(32767, val)))
# Pad remaining with silence
while len(samples) < n_samples:
    samples.append(0)
# Write WAV
wav_buf = io.BytesIO()
import wave as wave_mod
with wave_mod.open(wav_buf, 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sample_rate)
    for s in samples[:n_samples]:
        wf.writeframes(struct.pack('<h', s))
easy_med4 = wav_buf.getvalue()
write('forensics-medium4/audio.wav', easy_med4)

# ── Hard 1: Multi-Layer Steganography ──
print('[*] Hard 1 — Multi-Layer Steganography')
# The password for steghide is hidden in EXIF GPS coordinates decoded as ASCII
# We'll use GPS coords that encode the password "st3g0"
password = 'st3g0'
gps_chars = [(ord(c) >> 4, ord(c) & 0x0F) for c in password]
gps_str = ','.join(f'{a}{b}' for a, b in gps_chars)
# Build JPEG with EXIF containing GPS data and a steghide payload placeholder
# Since we can't use steghide library, we'll embed a marker file instead
# The actual challenge: extract EXIF GPS, decode as ASCII to get password
# Then use that password to extract embedded data
def make_exif_gps_jpeg():
    exif_header = b'Exif\x00\x00'
    tiff_header = b'II' + struct.pack('<H', 42) + struct.pack('<I', 8)
    ifd_offset = 8
    # Two IFD entries: GPSInfo (0x8825) pointing to GPS sub-IFD
    num_entries = 2
    # GPS sub-IFD: GPSLatitudeRef, GPSLatitude, GPSLongitudeRef, GPSLongitude
    # Store password chars as GPS coordinate values
    gps_ifd_offset = ifd_offset + 2 + num_entries * 12 + 4
    # GPS data: lat/lon values that encode the password
    gps_data = b''
    gps_lat_ref = b'N\x00'
    gps_lon_ref = b'E\x00'
    gps_lat = b''
    gps_lon = b''
    for i, (a, b) in enumerate(gps_chars):
        gps_lat += struct.pack('<II', a, 1) + struct.pack('<II', b, 1)
    for i, (a, b) in enumerate(gps_chars):
        gps_lon += struct.pack('<II', a, 1) + struct.pack('<II', b, 1)
    # Build main IFD
    main_ifd = struct.pack('<H', num_entries)
    # GPSInfo tag (0x8825) - type IFD, count 1, value = offset to GPS sub-IFD
    main_ifd += struct.pack('<HHII', 0x8825, 4, 1, gps_ifd_offset)
    # ImageWidth (0x0100)
    main_ifd += struct.pack('<HHII', 0x0100, 4, 1, 640)
    main_ifd += struct.pack('<I', 0)  # next IFD
    # GPS sub-IFD
    gps_sub_ifd = struct.pack('<H', 6)
    gps_sub_ifd += struct.pack('<HHII', 0x0001, 2, 2, gps_ifd_offset + 14)  # GPSLatitudeRef
    gps_sub_ifd += struct.pack('<HHII', 0x0002, 5, 6, gps_ifd_offset + 26)  # GPSLatitude
    gps_sub_ifd += struct.pack('<HHII', 0x0003, 2, 2, gps_ifd_offset + 50)  # GPSLongitudeRef
    gps_sub_ifd += struct.pack('<HHII', 0x0004, 5, 6, gps_ifd_offset + 62)  # GPSLongitude
    gps_sub_ifd += struct.pack('<HHII', 0x0005, 1, 1, gps_ifd_offset + 86)  # GPSAltitudeRef
    gps_sub_ifd += struct.pack('<HHII', 0x0006, 5, 1, gps_ifd_offset + 87)  # GPSAltitude
    gps_sub_ifd += struct.pack('<I', 0)
    # GPS values area
    gps_lat_ref_bytes = gps_lat_ref
    gps_lat_bytes = gps_lat
    gps_lon_ref_bytes = gps_lon_ref
    gps_lon_bytes = gps_lon
    gps_alt_ref = b'\x00'
    gps_alt = struct.pack('<II', 100, 1)
    gps_sub_ifd_data = gps_sub_ifd + gps_lat_ref_bytes + gps_lat_bytes + gps_lon_ref_bytes + gps_lon_bytes + gps_alt_ref + gps_alt
    exif_data = exif_header + tiff_header + main_ifd + gps_sub_ifd_data
    # JPEG structure
    soi = b'\xff\xd8'
    app1_marker = b'\xff\xe1'
    app1_len = 2 + len(exif_data)
    app1 = app1_marker + struct.pack('>H', app1_len) + exif_data
    dht = b'\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b'
    sos = b'\xff\xda\x00\x08\x01\x01\x00\x00\x3f\x00\x7b\x40'
    scan = b'\x00' * 32
    eoi = b'\xff\xd9'
    # Append a hidden payload area (simulated steghide output)
    flag10 = 'CGS{l4y3r3d_s3cr3ts_n33d_p4t13nc3}'
    hidden_payload = (
        f'=== STEGHIDE EXTRACTED DATA ===\n'
        f'Password used: {password}\n'
        f'Flag: {flag10}\n'
    ).encode()
    return soi + app1 + dht + sos + scan + eoi + hidden_payload

hard1 = make_exif_gps_jpeg()
write('forensics-hard1/secret.jpg', hard1)

# ── Hard 2: Disk Image Carving ──
print('[*] Hard 2 — Disk Image Carving')
flag11 = 'CGS{d3l3t3d_bu7_n0t_g0n3_f0r3v3r}'
# Create a small disk image with a deleted PDF
# Minimal PDF with the flag in metadata
pdf_content = (
    b'%PDF-1.4\n'
    b'1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
    b'2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'
    b'3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >>\nendobj\n'
    b'4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 100 700 Td (Hello) Tj ET\nendstream\nendobj\n'
    b'xref\n0 5\n'
    b'0000000000 65535 f \n'
    b'0000000009 00000 n \n'
    b'0000000058 00000 n \n'
    b'0000000115 00000 n \n'
    b'0000000228 00000 n \n'
    b'trailer\n<< /Size 5 /Root 1 0 R >>\n'
    b'startxref\n324\n%%EOF\n'
)
pdf_content += ('%% Flag: ' + flag11 + '\n').encode()
# Create a 64KB disk image
disk_size = 64 * 1024
disk = bytearray(disk_size)
# Fill with zeros (simulating deleted data)
# Place the PDF at offset 4096
pdf_offset = 4096
disk[pdf_offset:pdf_offset + len(pdf_content)] = pdf_content
# Add some garbage to simulate used sectors
random.seed(99)
for i in range(0, 4096):
    disk[i] = random.randint(0, 255)
write('forensics-hard2/disk.dd', bytes(disk))

print('\n[✓] All assets generated.')
