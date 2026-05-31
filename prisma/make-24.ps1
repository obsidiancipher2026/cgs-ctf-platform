# ---- CHALLENGE #24: Packed Executable ----
$flag24 = "CGS{upp4ck_th3_b1n4ry}"
$xored24 = $flag24.ToCharArray() | ForEach-Object { [byte]($_ -bxor 0xFF) }

$dir24 = "C:\Users\OperationZero\Documents\My Personal Data\Cyber Guardians Society CTF\frontend\public\uploads\challenges\24"
if (-not (Test-Path $dir24)) { New-Item -ItemType Directory -Path $dir24 -Force | Out-Null }

# Build custom "packed" binary
$bin24 = New-Object byte[] 1200
$pos = 0

# PE-like header
$bin24[$pos++] = 0x4D; $bin24[$pos++] = 0x5A  # MZ
$pos += 16
# Signature: PE marker
$bin24[$pos++] = 0x50; $bin24[$pos++] = 0x45  # PE
$pos += 26

# Packer stub annotation
$stub = [Text.Encoding]::ASCII.GetBytes("__UPX0__PACKER_STUB__")
$stub.CopyTo($bin24, $pos)
$pos += $stub.Length + 4

# Fake flags visible in outer section
$fake24 = "DecoyFlag: CGS{unpack_binary}__Debug: CGS{packed_executable}__Build: CGS{upx_unpacking}"
$fakeBytes = [Text.Encoding]::ASCII.GetBytes($fake24)
$fakeBytes.CopyTo($bin24, $pos)
$pos += $fakeBytes.Length + 8

# Compressed-looking section marker
$packed = [Text.Encoding]::ASCII.GetBytes("__PACKED_DATA__")
$packed.CopyTo($bin24, $pos)
$pos += $packed.Length

# XOR'd real flag (looks like compressed/packed data)
$xored24.CopyTo($bin24, $pos)
$pos += $xored24.Length

# Footer
$footer = [Text.Encoding]::ASCII.GetBytes("__UPX1__UNPACK_HERE__upx_-d")
$footer.CopyTo($bin24, $pos)

$fp24 = Join-Path $dir24 "packed.bin"
$fs = [System.IO.File]::Create($fp24)
$fs.Write($bin24, 0, $bin24.Length)
$fs.Close()
Write-Output "#24 created: $(Get-Item $fp24).Length bytes"
