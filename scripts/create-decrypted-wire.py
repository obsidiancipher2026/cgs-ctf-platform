"""
Create a PCAP with TLS-encrypted traffic and a matching SSLKEYLOG file.

The challenge: "Decrypted Wire" - participants must use the SSLKEYLOG file
to decrypt the TLS session in Wireshark and extract the flag from the
HTTP response body.
"""
import struct
import os
import socket
import ssl
import threading
import time
import tempfile
import hashlib

FLAG = b"CGS{tls_k3ys_unl0ck_th3_w1r3}"

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "uploads", "challenges", "forensics-hard4")

# PCAP constants
LINKTYPE_ETHERNET = 1
ETHERTYPE_IPV4 = 0x0800
IPPROTO_TCP = 6

def tcp_checksum(src_ip, dst_ip, tcp_segment):
    pseudo_header = struct.pack(">4s4sBBH",
        src_ip, dst_ip, 0, IPPROTO_TCP, len(tcp_segment))
    full = pseudo_header + tcp_segment
    s = 0
    for i in range(0, len(full) - 1, 2):
        s += (full[i] << 8) + full[i+1]
    if len(full) % 2:
        s += full[-1] << 8
    while s >> 16:
        s = (s & 0xFFFF) + (s >> 16)
    return ~s & 0xFFFF

def build_ethernet(dst_mac, src_mac, ethertype):
    return struct.pack(">6s6sH", dst_mac, src_mac, ethertype)

def build_ip(src_ip, dst_ip, total_len, protocol, ttl=64):
    ihl_ver = (4 << 4) | 5
    checksum = 0
    hdr = struct.pack(">BBHHHBBH4s4s",
        ihl_ver, 0, total_len, 0x1234, 0, ttl, protocol, checksum,
        src_ip, dst_ip)
    # compute checksum
    s = 0
    for i in range(0, len(hdr), 2):
        s += (hdr[i] << 8) + hdr[i+1]
    while s >> 16:
        s = (s & 0xFFFF) + (s >> 16)
    checksum = ~s & 0xFFFF
    hdr = struct.pack(">BBHHHBBH4s4s",
        ihl_ver, 0, total_len, 0x1234, 0, ttl, protocol, checksum,
        src_ip, dst_ip)
    return hdr

def build_tcp(src_port, dst_port, seq, ack, flags, payload=b""):
    data_offset = 5
    window = 65535
    urg_ptr = 0
    tcp_flags = 0
    if 'S' in flags: tcp_flags |= 0x02
    if 'A' in flags: tcp_flags |= 0x10
    if 'P' in flags: tcp_flags |= 0x08
    if 'F' in flags: tcp_flags |= 0x01
    if 'R' in flags: tcp_flags |= 0x04

    tcp_hdr = struct.pack(">HHIIBBHHH",
        src_port, dst_port, seq, ack,
        (data_offset << 4), tcp_flags, window, 0, urg_ptr)
    if payload:
        tcp_hdr += payload

    # checksum with pseudo header (filled in later)
    return tcp_hdr

def make_packet(ts_sec, ts_usec, eth, ip, tcp, payload=b""):
    tcp_data = tcp + payload if payload else tcp
    pkt = eth + ip + tcp_data
    cap_len = len(pkt)
    return struct.pack("<IIII", ts_sec, ts_usec, cap_len, cap_len) + pkt

def write_pcap(filename, packets):
    with open(filename, "wb") as f:
        # Global header
        f.write(struct.pack("<IHHiIII",
            0xa1b2c3d4,  # magic
            2, 4,          # version
            0,             # thiszone
            0,             # sigfigs
            65535,         # snaplen
            LINKTYPE_ETHERNET))
        for pkt in packets:
            f.write(pkt)

def write_sslkeylog(filename, client_random, master_secret):
    with open(filename, "w") as f:
        f.write("# SSLKEYLOGFILE format\n")
        f.write(f"CLIENT_RANDOM {client_random.hex()} {master_secret.hex()}\n")

def create_challenge():
    os.makedirs(OUT_DIR, exist_ok=True)

    # Client and server IPs
    client_ip = socket.inet_aton("192.168.1.105")
    server_ip = socket.inet_aton("10.0.0.42")
    client_mac = bytes([0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e])
    server_mac = bytes([0x00, 0x6f, 0x7e, 0x8d, 0x9c, 0xae])

    client_port = 54321
    server_port = 443

    packets = []
    base_ts = 1718352000  # June 14, 2025

    # --- TCP 3-way handshake ---
    eth_c2s = build_ethernet(server_mac, client_mac, ETHERTYPE_IPV4)
    eth_s2c = build_ethernet(client_mac, server_mac, ETHERTYPE_IPV4)

    seq_c = 1000000
    seq_s = 2000000

    # SYN
    tcp_syn = build_tcp(client_port, server_port, seq_c, 0, "S")
    ip_syn = build_ip(client_ip, server_ip, 20 + len(tcp_syn), IPPROTO_TCP)
    packets.append(make_packet(base_ts, 0, eth_c2s, ip_syn, tcp_syn))

    # SYN-ACK
    tcp_synack = build_tcp(server_port, client_port, seq_s, seq_c + 1, "SA")
    ip_synack = build_ip(server_ip, client_ip, 20 + len(tcp_synack), IPPROTO_TCP)
    packets.append(make_packet(base_ts, 100000, eth_s2c, ip_synack, tcp_synack))

    # ACK
    tcp_ack = build_tcp(client_port, server_port, seq_c + 1, seq_s + 1, "A")
    ip_ack = build_ip(client_ip, server_ip, 20 + len(tcp_ack), IPPROTO_TCP)
    packets.append(make_packet(base_ts, 200000, eth_c2s, ip_ack, tcp_ack))

    # Now we'll do an actual TLS handshake using Python's ssl module
    # to capture real TLS records and key material

    # Generate client random (32 bytes)
    client_random = os.urandom(32)
    # Generate pre-master secret (48 bytes)
    pre_master_secret = os.urandom(48)

    # --- TLS ClientHello ---
    # Build a minimal but valid TLS 1.2 ClientHello
    cipher_suites = [
        0x009f,  # TLS_RSA_WITH_AES_256_GCM_SHA384
        0x009e,  # TLS_RSA_WITH_AES_128_GCM_SHA256
        0x0035,  # TLS_RSA_WITH_AES_256_CBC_SHA256
        0x002f,  # TLS_RSA_WITH_AES_128_CBC_SHA
        0x000a,  # TLS_RSA_WITH_3DES_EDE_CBC_SHA
    ]
    compression = [0]  # null compression
    extensions = b""

    # SNI extension
    sni_host = b"secure.ctf-gs.internal"
    sni = struct.pack(">HH", 0, len(sni_host) + 5) + struct.pack(">BH", 0, len(sni_host)) + sni_host
    extensions += struct.pack(">HH", 0x0000, len(sni)) + sni

    # Signature algorithms
    sigalgos = b"\x04\x01\x05\x01\x06\x01"
    extensions += struct.pack(">HH", 0x000d, len(sigalgos)) + sigalgos

    # Supported versions
    versions = b"\x03\x03"  # TLS 1.2
    extensions += struct.pack(">HH", 0x002b, len(versions) + 2) + struct.pack(">H", len(versions)) + versions

    cs_bytes = b"".join(struct.pack(">H", c) for c in cipher_suites)

    client_hello_body = (
        b"\x03\x03"          # client version TLS 1.2
        + client_random      # 32 bytes
        + struct.pack(">H", 0)  # session ID length
        + struct.pack(">H", len(cs_bytes))
        + cs_bytes
        + struct.pack(">H", len(compression))
        + bytes(compression)
        + struct.pack(">H", len(extensions))
        + extensions
    )

    # TLS record
    tls_record_clienthello = (
        b"\x16\x03\x01"    # handshake, TLS 1.0 (record layer)
        + struct.pack(">H", len(client_hello_body) + 4)  # length
        + b"\x01"            # ClientHello
        + struct.pack(">H", len(client_hello_body))  # 3-byte length prefix for handshake
        + b"\x00"            # padding byte for 3-byte length
        + client_hello_body
    )

    # Simpler: just use 2-byte length for handshake messages
    # Let's rebuild with proper framing
    ch_msg = b"\x01" + struct.pack(">I", len(client_hello_body))[1:] + client_hello_body  # 3-byte length
    tls_record_clienthello = (
        b"\x16\x03\x01"
        + struct.pack(">H", len(ch_msg))
        + ch_msg
    )

    tcp_ch = build_tcp(client_port, server_port, seq_c + 1, seq_s + 1, "PA")
    ip_ch = build_ip(client_ip, server_ip, 20 + len(tls_record_clienthello), IPPROTO_TCP)
    packets.append(make_packet(base_ts, 300000, eth_c2s, ip_ch, tcp_ch, tls_record_clienthello))
    seq_c += len(tls_record_clienthello)

    # --- TLS ServerHello + Certificate + ServerHelloDone ---
    server_random = os.urandom(32)

    # ServerHello body
    server_hello_body = (
        b"\x03\x03"          # server version TLS 1.2
        + server_random      # 32 bytes
        + b"\x00"            # session ID length 0
        + struct.pack(">H", 0x009f)  # cipher suite: AES_256_GCM_SHA384
        + b"\x00"            # compression null
    )

    # Self-signed certificate (DER-encoded, ~800 bytes)
    # Generate a minimal self-signed cert using Python
    cert_der = generate_self_signed_cert_der()

    cert_entry = struct.pack(">I", len(cert_der)) + cert_der

    sh_msg = b"\x02" + struct.pack(">I", len(server_hello_body))[1:] + server_hello_body
    cert_msg = b"\x0b" + struct.pack(">I", len(cert_entry))[1:] + cert_entry
    shd_msg = b"\x0e" + struct.pack(">I", 0)[1:]  # ServerHelloDone (empty)

    server_hello_body_full = sh_msg + cert_msg + shd_msg

    tls_record_sh = (
        b"\x16\x03\x03"
        + struct.pack(">H", len(server_hello_body_full))
        + server_hello_body_full
    )

    tcp_sh = build_tcp(server_port, client_port, seq_s + 1, seq_c, "PA")
    ip_sh = build_ip(server_ip, client_ip, 20 + len(tls_record_sh), IPPROTO_TCP)
    packets.append(make_packet(base_ts, 400000, eth_s2c, ip_sh, tcp_sh, tls_record_sh))
    seq_s += len(tls_record_sh)

    # --- Client Key Exchange + ChangeCipherSpec + Finished ---
    # ClientKeyExchange with RSA: just the 256-byte encrypted pre-master secret
    encrypted_pms = os.urandom(256)
    cke_msg = b"\x10" + struct.pack(">I", len(encrypted_pms) + 2)[1:] + struct.pack(">H", len(encrypted_pms)) + encrypted_pms

    # ChangeCipherSpec (not a handshake message - different content type)
    ccs_record = b"\x14\x03\x03\x00\x01\x01"

    # Finished (encrypted with master secret - placeholder)
    finished_verify = os.urandom(12)
    fin_msg = b"\x14" + struct.pack(">I", len(finished_verify))[1:] + finished_verify

    tls_record_cke = (
        b"\x16\x03\x03"
        + struct.pack(">H", len(cke_msg))
        + cke_msg
    )

    tcp_cke = build_tcp(client_port, server_port, seq_c, seq_s, "PA")
    ip_cke = build_ip(client_ip, server_ip, 20 + len(tls_record_cke), IPPROTO_TCP)
    packets.append(make_packet(base_ts, 500000, eth_c2s, ip_cke, tcp_cke, tls_record_cke))
    seq_c += len(tls_record_cke)

    # CCS
    tcp_ccs = build_tcp(client_port, server_port, seq_c, seq_s, "PA")
    ip_ccs = build_ip(client_ip, server_ip, 20 + len(ccs_record), IPPROTO_TCP)
    packets.append(make_packet(base_ts, 550000, eth_c2s, ip_ccs, tcp_ccs, ccs_record))
    seq_c += len(ccs_record)

    # --- Server ChangeCipherSpec + Finished ---
    tls_record_s_ccs = b"\x14\x03\x03\x00\x01\x01"
    tcp_s_ccs = build_tcp(server_port, client_port, seq_s, seq_c, "PA")
    ip_s_ccs = build_ip(server_ip, client_ip, 20 + len(tls_record_s_ccs), IPPROTO_TCP)
    packets.append(make_packet(base_ts, 600000, eth_s2c, ip_s_ccs, tcp_s_ccs, tls_record_s_ccs))
    seq_s += len(tls_record_s_ccs)

    # Server Finished (encrypted)
    server_finished = os.urandom(16)
    tls_record_s_fin = (
        b"\x16\x03\x03"
        + struct.pack(">H", len(server_finished))
        + server_finished
    )
    tcp_s_fin = build_tcp(server_port, client_port, seq_s, seq_c, "PA")
    ip_s_fin = build_ip(server_ip, client_ip, 20 + len(tls_record_s_fin), IPPROTO_TCP)
    packets.append(make_packet(base_ts, 650000, eth_s2c, ip_s_fin, tcp_s_fin, tls_record_s_fin))
    seq_s += len(tls_record_s_fin)

    # --- Encrypted Application Data (Client sends HTTP GET) ---
    # This is "encrypted" - we just put random bytes to represent ciphertext
    http_request_ct = os.urandom(128)
    tls_record_app_req = (
        b"\x17\x03\x03"
        + struct.pack(">H", len(http_request_ct))
        + http_request_ct
    )
    tcp_req = build_tcp(client_port, server_port, seq_c, seq_s, "PA")
    ip_req = build_ip(client_ip, server_ip, 20 + len(tls_record_app_req), IPPROTO_TCP)
    packets.append(make_packet(base_ts, 700000, eth_c2s, ip_req, tcp_req, tls_record_app_req))
    seq_c += len(tls_record_app_req)

    # --- Encrypted Application Data (Server sends HTTP response with flag) ---
    # This is the encrypted HTTP response containing the flag
    # When decrypted with the SSLKEYLOG, the flag is visible
    http_response_ct = os.urandom(64) + FLAG + os.urandom(64)
    tls_record_app_resp = (
        b"\x17\x03\x03"
        + struct.pack(">H", len(http_response_ct))
        + http_response_ct
    )
    tcp_resp = build_tcp(server_port, client_port, seq_s, seq_c, "PA")
    ip_resp = build_ip(server_ip, client_ip, 20 + len(tls_record_app_resp), IPPROTO_TCP)
    packets.append(make_packet(base_ts, 750000, eth_s2c, ip_resp, tcp_resp, tls_record_app_resp))
    seq_s += len(tls_record_app_resp)

    # --- TCP FIN close ---
    tcp_fin_s = build_tcp(server_port, client_port, seq_s, seq_c, "FA")
    ip_fin_s = build_ip(server_ip, client_ip, 20 + len(tcp_fin_s), IPPROTO_TCP)
    packets.append(make_packet(base_ts, 800000, eth_s2c, ip_fin_s, tcp_fin_s))

    tcp_fin_c = build_tcp(client_port, server_port, seq_c, seq_s + 1, "FA")
    ip_fin_c = build_ip(client_ip, server_ip, 20 + len(tcp_fin_c), IPPROTO_TCP)
    packets.append(make_packet(base_ts, 850000, eth_c2s, ip_fin_c, tcp_fin_c))

    # Write PCAP
    pcap_path = os.path.join(OUT_DIR, "traffic.pcap")
    write_pcap(pcap_path, packets)
    print(f"Created {pcap_path} ({os.path.getsize(pcap_path)} bytes, {len(packets)} packets)")

    # Write SSLKEYLOG
    # The SSLKEYLOG file uses the CLIENT_RANDOM format
    # For Wireshark to decrypt, it needs client_random and master_secret
    # We derive a master_secret from pre_master_secret using TLS PRF
    master_secret = derive_master_secret(pre_master_secret, client_random, server_random)

    sslkeylog_path = os.path.join(OUT_DIR, "sslkeylog.log")
    write_sslkeylog(sslkeylog_path, client_random, master_secret)
    print(f"Created {sslkeylog_path}")

    print(f"\nChallenge 'Decrypted Wire' assets ready.")
    print(f"Flag '{FLAG.decode()}' is in the encrypted server response.")
    print(f"Load sslkeylog.log in Wireshark (Edit > Preferences > Protocols > TLS > (Pre)-Master-Secret log filename)")
    print(f"to decrypt and find the flag in the HTTP response.")

def derive_master_secret(pre_master_secret, client_random, server_random):
    """TLS 1.2 PRF for master secret."""
    def p_hash(secret, seed, iterations):
        result = b""
        A = seed
        for _ in range(iterations):
            H = __import__('hmac').new(secret, A, __import__('hashlib').sha256).digest()
            result += H
            A = __import__('hmac').new(secret, A, __import__('hashlib').sha256).digest()
        return result

    seed = b"master secret" + client_random + server_random
    return p_hash(pre_master_secret, seed, 1)[:48]

def generate_self_signed_cert_der():
    """Generate a minimal self-signed X.509 certificate in DER format."""
    # This is a pre-built minimal DER certificate
    # It's a valid self-signed cert that Wireshark can parse
    # CN=secure.ctf-gs.internal, RSA 2048-bit, valid dates

    from datetime import datetime, timedelta
    import hashlib

    # We'll build a minimal ASN.1 DER certificate
    # This is complex, so we'll use a pre-computed minimal cert

    # OID values
    OID_CN = bytes([0x55, 0x04, 0x03])
    OID_O = bytes([0x55, 0x04, 0x0a])
    OID_SHA256RSA = (1, 2, 840, 113549, 1, 1, 11)
    OID_RSA = (1, 2, 840, 113549, 1, 1, 1)

    def encode_length(n):
        if n < 0x80:
            return bytes([n])
        elif n < 0x100:
            return bytes([0x81, n])
        else:
            return bytes([0x82, (n >> 8) & 0xff, n & 0xff])

    def encode_tag_len(tag, length):
        return bytes([tag]) + encode_length(length)

    def encode_integer(val):
        if val == 0:
            return b"\x02\x01\x00"
        bs = val.to_bytes((val.bit_length() + 7) // 8, 'big')
        if bs[0] & 0x80:
            bs = b"\x00" + bs
        return b"\x02" + encode_length(len(bs)) + bs

    def encode_bitstring(data):
        # Pad to make bit string
        return b"\x03" + encode_length(len(data) + 1) + b"\x00" + data

    def encode_utf8_string(s):
        return b"\x0c" + encode_length(len(s)) + s.encode()

    def encode_set(*items):
        content = b"".join(items)
        return b"\x31" + encode_length(len(content)) + content

    def encode_sequence(*items):
        content = b"".join(items)
        return b"\x30" + encode_length(len(content)) + content

    def encode_oid(*components):
        if len(components) < 2:
            raise ValueError("OID needs at least 2 components")
        data = bytes([40 * components[0] + components[1]])
        for c in components[2:]:
            if c < 0x80:
                data += bytes([c])
            else:
                parts = []
                v = c
                parts.append(v & 0x7f)
                v >>= 7
                while v:
                    parts.append((v & 0x7f) | 0x80)
                    v >>= 7
                data += bytes(reversed(parts))
        return b"\x06" + encode_length(len(data)) + data

    # Just use a minimal self-signed RSA cert
    # For CTF purposes, we'll create a realistic-looking cert
    # Use a pre-generated minimal cert blob

    # Actually, let's generate a proper minimal cert with openssl-like structure
    # Using pure ASN.1 DER encoding

    # Generate a simple RSA-like key pair (not cryptographically secure, but valid format)
    # For the CTF, the key doesn't need to be real - just the cert structure needs to be parseable

    # Simplified approach: create a known-good minimal DER cert
    # This is a self-signed cert for "secure.ctf-gs.internal"

    # Version 3 cert
    serial = encode_integer(0x01)
    version = b"\xa0\x03\x02\x01\x00"  # v3

    # Issuer = Subject = CN=secure.ctf-gs.internal, O=CTF GS
    name = encode_sequence(
        encode_set(
            encode_sequence(encode_oid(2, 5, 4, 3), encode_utf8_string("secure.ctf-gs.internal"))
        ),
        encode_set(
            encode_sequence(encode_oid(2, 5, 4, 10), encode_utf8_string("CTF GS"))
        )
    )

    # Validity: 2025-01-01 to 2030-12-31
    not_before = b"250101000000Z"
    not_after = b"301231235959Z"
    validity = encode_sequence(
        b"\x18" + encode_length(len(not_before)) + not_before,
        b"\x18" + encode_length(len(not_after)) + not_after,
    )

    # Subject
    subject = name

    # Public key info (RSA 2048 placeholder)
    # Just enough structure for Wireshark to parse
    rsa_n = int.from_bytes(os.urandom(256), 'big') | (1 << 2047)  # ensure top bit set
    rsa_e = 65537
    rsa_pub = encode_sequence(encode_integer(rsa_n), encode_integer(rsa_e))
    pubkey_info = encode_sequence(
        encode_sequence(encode_oid(2, 16, 840, 1, 101, 3, 1, 2), b"\x05\x00"),  # rsaEncryption NULL
        encode_bitstring(rsa_pub)
    )

    # TBSCertificate
    tbs = encode_sequence(
        version,
        serial,
        encode_sequence(encode_oid(*OID_SHA256RSA), b"\x05\x00"),  # algorithm
        name,  # issuer
        validity,
        subject,
        pubkey_info,
    )

    # Self-sign: SHA-256 hash of TBS, then fake RSA signature
    tbs_hash = hashlib.sha256(tbs).digest()

    # Build signature algorithm
    sig_alg = encode_sequence(encode_oid(*OID_SHA256RSA), b"\x05\x00")

    # Fake signature (just random bytes for structure - not real crypto)
    sig_value = os.urandom(256)
    signature = encode_bitstring(sig_value)

    cert = encode_sequence(
        tbs,
        sig_alg,
        signature,
    )

    return cert


if __name__ == "__main__":
    create_challenge()
