import pyzipper

FLAG = "CGS{p4ssw0rd_w4s_1n_th3_w0rdl1st}"
ZIP_PASSWORD = b"password123"
ZIP_FILENAME = "secret.zip"

def create():
    with pyzipper.AESZipFile(
        ZIP_FILENAME, "w", compression=pyzipper.ZIP_DEFLATED,
        encryption=pyzipper.WZ_AES
    ) as zf:
        zf.setpassword(ZIP_PASSWORD)
        zf.writestr("flag.txt", FLAG)

    with pyzipper.AESZipFile(ZIP_FILENAME, "r") as zf:
        zf.setpassword(ZIP_PASSWORD)
        print(f"[+] Created {ZIP_FILENAME}")
        print(f"[+] Contents: {zf.namelist()}")
        print(f"[+] Verifying flag: {zf.read('flag.txt').decode()}")

if __name__ == "__main__":
    create()
