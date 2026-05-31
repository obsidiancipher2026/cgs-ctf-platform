# ---- CHALLENGE #25: Cryptographic Key Extraction ----
$flag25 = "CGS{crypt0_k3y_3xtr4ct}"
$xored25 = $flag25.ToCharArray() | ForEach-Object { [byte]($_ -bxor 0xFF) }

$dir25 = "C:\Users\OperationZero\Documents\My Personal Data\Cyber Guardians Society CTF\frontend\public\uploads\challenges\25"
if (-not (Test-Path $dir25)) { New-Item -ItemType Directory -Path $dir25 -Force | Out-Null }

$bin25 = New-Object byte[] 1400
$pos = 0

# ELF header
$bin25[$pos++] = 0x7F; $bin25[$pos++] = 0x45; $bin25[$pos++] = 0x4C; $bin25[$pos++] = 0x46
$pos += 12

# Key section
$keySection = [Text.Encoding]::ASCII.GetBytes("__AES_KEY__")
$keySection.CopyTo($bin25, $pos)
$pos += $keySection.Length

# Simulated AES key (16 bytes)
$keyBytes = [byte[]](0x2B,0x7E,0x15,0x16,0x28,0xAE,0xD2,0xA6,0xAB,0xF7,0x15,0x88,0x09,0xCF,0x4F,0x3C)
$keyBytes.CopyTo($bin25, $pos)
$pos += $keyBytes.Length + 4

# Encrypted data section
$encSection = [Text.Encoding]::ASCII.GetBytes("__ENCRYPTED_FLAG__")
$encSection.CopyTo($bin25, $pos)
$pos += $encSection.Length

# Store the flag as "encrypted" with XOR (same 0xFF key XOR)
# This simulates the encrypted data that needs the key to decrypt
$encMarker = [Text.Encoding]::ASCII.GetBytes("ENC:")
$encMarker.CopyTo($bin25, $pos)
$pos += $encMarker.Length
$xored25.CopyTo($bin25, $pos)
$pos += $xored25.Length + 4

# S-box / constants section (crypto markers)
$sboxSection = [Text.Encoding]::ASCII.GetBytes("__SBOX__")
$sboxSection.CopyTo($bin25, $pos)
$pos += $sboxSection.Length

# Fake S-box values + annotation
$sboxData = [Text.Encoding]::ASCII.GetBytes("0x63,0x7C,0x77,0x7B,0xF2,0x6B,0x6F,0xC5,AES_SBOX")
$sboxData.CopyTo($bin25, $pos)
$pos += $sboxData.Length + 8

# Fake flags visible
$fake25 = "DebugKey: CGS{crypto_key_extract}__BuildID: CGS{key_extraction}__TestVector: CGS{decrypt_data}"
$fakeBytes = [Text.Encoding]::ASCII.GetBytes($fake25)
$fakeBytes.CopyTo($bin25, $pos)

$fp25 = Join-Path $dir25 "crypto.bin"
$fs = [System.IO.File]::Create($fp25)
$fs.Write($bin25, 0, $bin25.Length)
$fs.Close()
Write-Output "#25 created: $(Get-Item $fp25).Length bytes"
