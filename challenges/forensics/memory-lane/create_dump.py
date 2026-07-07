import os
import random

FLAG = "CGS{v0l4t1l1ty_n3v3r_f0rg3ts}"
OUTPUT = "dump.bin"
DUMP_SIZE = 1024 * 1024  # 1 MB

PROCESS_STRINGS = [
    b"System process 4 running since boot",
    b"smss.exe 344 Session Manager Subsystem",
    b"csrss.exe 500 Client Server Runtime Process",
    b"wininit.exe 584 Windows Start-Up Application",
    b"services.exe 632 Services and Controller app",
    b"lsass.exe 648 Local Security Authority Process",
    b"svchost.exe 768 Host Process for Windows Services",
    b"explorer.exe 1234 Windows Explorer",
    b"firefox.exe 4567 Mozilla Firefox",
    b"cmd.exe 7890 Windows Command Processor",
    b"notepad.exe 4321 Notepad",
]

def create_dump():
    data = bytearray(os.urandom(DUMP_SIZE))

    offset = random.randint(100000, 800000)

    context = b""
    for s in PROCESS_STRINGS:
        context += s + b"\x00"

    context += f"\nFLAG: {FLAG}\n".encode()

    context += b"\x00"
    for s in PROCESS_STRINGS:
        context += s[::-1] + b"\x00"

    context += b"\x00".join([b"EPROCESS", b"KPROCESS", b"_LIST_ENTRY"])
    context += b"\nMemory scan complete. Flag: " + FLAG.encode() + b"\n"

    for i, b_val in enumerate(context):
        if offset + i < len(data):
            data[offset + i] = b_val

    del data[offset + len(context):]
    data.extend(os.urandom(DUMP_SIZE - len(data)))

    with open(OUTPUT, "wb") as f:
        f.write(data)

    print(f"[+] Created {OUTPUT} ({DUMP_SIZE} bytes)")
    print(f"[+] Flag embedded at offset {offset}")
    print(f"[+] Run: strings {OUTPUT} | grep \"CGS{{\"")

if __name__ == "__main__":
    create_dump()
