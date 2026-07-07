import os
from PIL import Image, PngImagePlugin

FLAG = "CGS{3x1f_kn0ws_wh3r3_y0u_b33n}"

def generate():
    img = Image.new("RGB", (800, 600), color=(41, 128, 185))

    info = PngImagePlugin.PngInfo()
    info.add_text("Comment", f"Flag: {FLAG}")
    info.add_text("Author", "CGS CTF")
    info.add_text("Description", "A simple image with hidden metadata")

    img.save("photo.png", "PNG", pnginfo=info)
    print(f"[+] Generated photo.png with embedded flag")

if __name__ == "__main__":
    generate()
