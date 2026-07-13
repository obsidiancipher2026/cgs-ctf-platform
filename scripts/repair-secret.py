#!/usr/bin/env python3
"""Repair secret.jpg — Multi-Layer Steganography challenge.

Creates a valid baseline JPEG with EXIF GPS data encoding the password "st3g0",
embeds flag.txt via steghide.

Process order:
  1. Create base JPEG with Pillow
  2. Embed flag with steghide (modifies DCT coefficients)
  3. Insert EXIF GPS data with piexif (modifies marker segments, preserves image data)
"""
import os, sys, subprocess, tempfile, struct
from PIL import Image
import piexif

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'public', 'uploads', 'challenges', 'forensics-hard1')
FLAG = b'CGS{l4y3r3d_s3cr3ts_n33d_p4t13nc3}'
PASSWORD = 'st3g0'
STEGHIDE = os.path.join(os.environ.get('TEMP', 'C:\\Temp'), 'steghide', 'steghide', 'steghide.exe')

def make_base_jpeg(width=800, height=600):
    """Create a valid baseline JPEG with real image data."""
    import random
    random.seed(42)
    img = Image.new('RGB', (width, height))
    pixels = img.load()
    for x in range(width):
        for y in range(height):
            v = random.randint(100, 200)
            pixels[x, y] = (v, v, v)
    return img

def build_exif_gps():
    """Build EXIF dict with GPS data encoding password.

    Password "st3g0" hex: s=0x73, t=0x74, 3=0x33, g=0x67, 0=0x30
    GPS Lat: [73, 74, 33]   (hex values of s, t, 3 as decimal)
    GPS Lon: [67, 30, 0]    (hex values of g, 0 as decimal, + padding 0)
    """
    # Values are hex-encoding-as-integers:
    # 's' = 0x73 → hex string "73" → integer 73
    # 't' = 0x74 → hex string "74" → integer 74
    # '3' = 0x33 → hex string "33" → integer 33
    # 'g' = 0x67 → hex string "67" → integer 67
    # '0' = 0x30 → hex string "30" → integer 30
    # Hex encoding seen as integers:
    # s=0x73 → hex str "73" → int 73
    # t=0x74 → hex str "74" → int 74
    # 3=0x33 → hex str "33" → int 33
    # g=0x67 → hex str "67" → int 67
    # 0=0x30 → hex str "30" → int 30
    lat_vals = [73, 74, 33]   # s, t, 3
    lon_vals = [67, 30, 0]    # g, 0, padding

    gps = {
        piexif.GPSIFD.GPSVersionID: (2, 3, 0, 0),
        piexif.GPSIFD.GPSLatitudeRef: 'N',
        piexif.GPSIFD.GPSLatitude: [
            (lat_vals[0], 1),
            (lat_vals[1], 1),
            (lat_vals[2], 1),
        ],
        piexif.GPSIFD.GPSLongitudeRef: 'E',
        piexif.GPSIFD.GPSLongitude: [
            (lon_vals[0], 1),
            (lon_vals[1], 1),
            (lon_vals[2], 1),
        ],
    }
    return gps

def build_exif():
    return {
        '0th': {},
        'Exif': {},
        'GPS': build_exif_gps(),
        'Interop': {},
        '1st': {},
        'thumbnail': None,
    }

def main():
    os.makedirs(OUT, exist_ok=True)

    carrier_path = os.path.join(OUT, 'secret.jpg')
    flag_path = os.path.join(OUT, 'flag.txt')

    # 1. Create base JPEG
    print('[*] Creating base JPEG image (800x600, quality=85)...')
    img = make_base_jpeg(800, 600)
    img.save(carrier_path, 'JPEG', quality=85)
    print(f'  [+] Saved: {carrier_path} ({os.path.getsize(carrier_path)} bytes)')

    # 2. Create flag.txt
    with open(flag_path, 'w') as f:
        f.write(FLAG.decode() + '\n')
    print(f'  [+] flag.txt: {FLAG.decode()}')

    # 3. Embed flag with steghide FIRST (before EXIF insertion)
    if not os.path.exists(STEGHIDE):
        print(f'  [!] steghide not found at {STEGHIDE}')
        print(f'  [!] Please run: steghide embed -cf {carrier_path} -ef {flag_path} -p {PASSWORD}')
        sys.exit(1)

    print('[*] Embedding flag with steghide...')
    cmd = [STEGHIDE, 'embed', '-cf', carrier_path, '-ef', flag_path, '-p', PASSWORD]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f'  [!] steghide embed FAILED')
        print(f'      stderr: {result.stderr}')
        sys.exit(1)
    print(f'  [+] steghide embed SUCCESS')
    print(f'  [+] After embedding: {os.path.getsize(carrier_path)} bytes')

    # 4. Inject EXIF GPS data AFTER steghide (piexif preserves image data)
    print('[*] Injecting EXIF GPS data...')
    exif_bytes = piexif.dump(build_exif())
    piexif.insert(exif_bytes, carrier_path)
    print(f'  [+] EXIF injected: {os.path.getsize(carrier_path)} bytes')

    # 5. Verify
    print()
    print('=== VERIFICATION ===')
    verify(carrier_path)

def verify(path):
    # EXIF GPS check
    print('[*] EXIF GPS check...')
    try:
        exif = piexif.load(path)
        gps = exif.get('GPS', {})
        lat = gps.get(piexif.GPSIFD.GPSLatitude, [])
        lon = gps.get(piexif.GPSIFD.GPSLongitude, [])
        lat_ref = gps.get(piexif.GPSIFD.GPSLatitudeRef, b'')
        lon_ref = gps.get(piexif.GPSIFD.GPSLongitudeRef, b'')

        print(f'  GPSLatitudeRef: {lat_ref}')
        print(f'  GPSLatitude: {lat}')
        print(f'  GPSLongitudeRef: {lon_ref}')
        print(f'  GPSLongitude: {lon}')

        assert len(lat) == 3, f'Expected 3 lat vals, got {len(lat)}'
        assert len(lon) == 3, f'Expected 3 lon vals, got {len(lon)}'

        # Recover password: each value is a hex-encoding byte
        # e.g., 73 → hex str "73" → 0x73 = 's'
        all_vals = [val[0] // val[1] for val in lat]
        for i, val in enumerate(lon):
            if i < 2:
                all_vals.append(val[0] // val[1])

        recovered = ''.join(chr(int(str(v), 16)) for v in all_vals)
        print(f'  Recovered password: "{recovered}"')
        assert recovered == PASSWORD, f'Password mismatch: {recovered} != {PASSWORD}'
        print('  [PASS] GPS password check OK')
    except Exception as e:
        print(f'  [FAIL] GPS check: {e}')
        import traceback
        traceback.print_exc()

    # Steghide extraction check
    print('[*] Verifying steghide extraction...')
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.txt')
    tmp_path = tmp.name
    tmp.close()
    os.unlink(tmp_path)

    try:
        cmd = [STEGHIDE, 'extract', '-sf', path, '-p', PASSWORD, '-xf', tmp_path]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            if os.path.exists(tmp_path):
                with open(tmp_path, 'r') as f:
                    extracted = f.read().strip()
                print(f'  Extracted flag: "{extracted}"')
                assert extracted == FLAG.decode(), f'Flag mismatch: {extracted} != {FLAG.decode()}'
                print('  [PASS] Steghide extraction check OK')
                os.unlink(tmp_path)
            else:
                # Might have extracted to ./flag.txt (default)
                default_path = os.path.join(os.path.dirname(path), 'flag.txt')
                if os.path.exists(default_path):
                    with open(default_path, 'r') as f:
                        extracted = f.read().strip()
                    print(f'  Extracted flag (default path): "{extracted}"')
                    assert extracted == FLAG.decode(), f'Flag mismatch: {extracted} != {FLAG.decode()}'
                    print('  [PASS] Steghide extraction check OK')
        else:
            print(f'  [FAIL] steghide extract: {result.stderr}')
            print(f'  stdout: {result.stdout}')
    except Exception as e:
        print(f'  [FAIL] Steghide extraction: {e}')

    print()
    print('[*] Verification commands for Linux:')
    print('    file secret.jpg')
    print('    jpeginfo -c secret.jpg')
    print('    identify secret.jpg')
    print('    exiftool secret.jpg')
    print('    exiftool -gps:all secret.jpg')
    print('    steghide info secret.jpg')
    print(f'    steghide extract -sf secret.jpg -p {PASSWORD}')
    print('    cat flag.txt')

if __name__ == '__main__':
    main()
