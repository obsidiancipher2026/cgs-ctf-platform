from PIL import Image

FLAG = "CGS{l0w3st_b1ts_h1d3_th3_m0st}"
OUTPUT = "stego.png"

def str_to_bits(s):
    result = []
    for char in s:
        c = ord(char)
        bits = [(c >> i) & 1 for i in range(7, -1, -1)]
        result.extend(bits)
    return result

def embed_lsb(secret, output_path):
    img = Image.new("RGB", (400, 300), (73, 109, 137))
    pixels = list(img.getdata())
    width, height = img.size

    secret_bits = str_to_bits(secret)
    delimiter = [0, 0, 0, 0, 0, 0, 0, 0]
    all_bits = secret_bits + delimiter

    if len(all_bits) > len(pixels) * 3:
        raise ValueError("Image too small to hold the secret")

    new_pixels = []
    bit_idx = 0
    for pixel in pixels:
        r, g, b = pixel[:3]

        if bit_idx < len(all_bits):
            r = (r & 0xFE) | all_bits[bit_idx]
            bit_idx += 1
        if bit_idx < len(all_bits):
            g = (g & 0xFE) | all_bits[bit_idx]
            bit_idx += 1
        if bit_idx < len(all_bits):
            b = (b & 0xFE) | all_bits[bit_idx]
            bit_idx += 1

        new_pixels.append((r, g, b))

    new_img = Image.new("RGB", (width, height))
    new_img.putdata(new_pixels)
    new_img.save(output_path)

    print(f"[+] Embedded flag into {output_path}")

if __name__ == "__main__":
    embed_lsb(FLAG, OUTPUT)
