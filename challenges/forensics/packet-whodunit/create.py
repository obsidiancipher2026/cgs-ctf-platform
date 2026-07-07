import struct
import time
import os

FLAG = "CGS{tcp_str34ms_r3m3mb3r_3v3ryth1ng}"
PCAP_FILE = "capture.pcap"

PCAP_MAGIC = 0xa1b2c3d4
PCAP_VERSION_MAJOR = 2
PCAP_VERSION_MINOR = 4
PCAP_THISZONE = 0
PCAP_SIGFIGS = 0
PCAP_SNAPLEN = 65535
PCAP_NETWORK = 1  # Ethernet

ETHERNET_HEADER_LEN = 14

def write_pcap(filename):
    with open(filename, "wb") as f:
        pcap_hdr = struct.pack("<IHHiIII",
            PCAP_MAGIC,
            PCAP_VERSION_MAJOR,
            PCAP_VERSION_MINOR,
            PCAP_THISZONE,
            PCAP_SIGFIGS,
            PCAP_SNAPLEN,
            PCAP_NETWORK
        )
        f.write(pcap_hdr)

        ts_base = int(time.time())

        def write_packet(f, data, ts_offset=0):
            ts_sec = ts_base + ts_offset
            ts_usec = 0
            pkt_len = len(data)
            pkt_hdr = struct.pack("<IIII", ts_sec, ts_usec, pkt_len, pkt_len)
            f.write(pkt_hdr)
            f.write(data)

        def eth_ip_tcp_payload(src_mac, dst_mac, src_ip, dst_ip,
                               src_port, dst_port, tcp_payload,
                               seq_num=1000, ack_num=0, flags=0x18):
            eth_hdr = struct.pack("!6s6sH",
                bytes.fromhex(dst_mac.replace(":", "")),
                bytes.fromhex(src_mac.replace(":", "")),
                0x0800
            )

            ip_ihl = 5
            ip_ver = 4
            ip_tos = 0
            ip_id = 0x1234
            ip_flags_offset = 0
            ip_ttl = 64
            ip_proto = 6
            ip_src = bytes([int(x) for x in src_ip.split(".")])
            ip_dst = bytes([int(x) for x in dst_ip.split(".")])

            tcp_data_offset = 5
            tcp_reserved = 0
            tcp_flags = flags
            tcp_window = 65535
            tcp_urgent = 0

            tcp_hdr_no_checksum = struct.pack("!HHIIBBHHH",
                src_port, dst_port, seq_num, ack_num,
                (tcp_data_offset << 4) | tcp_reserved,
                tcp_flags, tcp_window,
                0, tcp_urgent
            )

            tcp_len = len(tcp_hdr_no_checksum) + len(tcp_payload)
            ip_total_len = ip_ihl * 4 + tcp_len

            ip_hdr = struct.pack("!BBHHHBBH4s4s",
                (ip_ver << 4) | ip_ihl,
                ip_tos,
                ip_total_len,
                ip_id,
                ip_flags_offset,
                ip_ttl,
                ip_proto,
                0,
                ip_src,
                ip_dst
            )

            ip_checksum = ip_checksum_calc(ip_hdr)
            ip_hdr = struct.pack("!BBHHHBBH4s4s",
                (ip_ver << 4) | ip_ihl,
                ip_tos,
                ip_total_len,
                ip_id,
                ip_flags_offset,
                ip_ttl,
                ip_proto,
                ip_checksum,
                ip_src,
                ip_dst
            )

            pseudo_hdr = struct.pack("!4s4sBBH",
                ip_src, ip_dst, 0, ip_proto, tcp_len
            )
            tcp_checksum = ip_checksum_calc(pseudo_hdr + tcp_hdr_no_checksum + tcp_payload)

            tcp_hdr = struct.pack("!HHIIBBHHH",
                src_port, dst_port, seq_num, ack_num,
                (tcp_data_offset << 4) | tcp_reserved,
                tcp_flags, tcp_window,
                tcp_checksum, tcp_urgent
            )

            return eth_hdr + ip_hdr + tcp_hdr + tcp_payload

        def ip_checksum_calc(data):
            if len(data) % 2 != 0:
                data += b"\x00"
            s = 0
            for i in range(0, len(data), 2):
                w = (data[i] << 8) + data[i + 1]
                s += w
            while s >> 16:
                s = (s & 0xFFFF) + (s >> 16)
            return ~s & 0xFFFF

        def build_dns_query():
            eth_src = "00:1a:2b:3c:4d:5e"
            eth_dst = "00:11:22:33:44:55"
            src_ip = "192.168.1.10"
            dst_ip = "8.8.8.8"
            src_port = 34567
            dst_port = 53

            dns_id = 0x1234
            dns_flags = 0x0100  # standard query
            dns_qdcount = 1
            dns_ancount = 0
            dns_nscount = 0
            dns_arcount = 0

            dns_header = struct.pack("!HHHHHH",
                dns_id, dns_flags, dns_qdcount,
                dns_ancount, dns_nscount, dns_arcount
            )

            qname = b"\x07example\x03com\x00"
            qtype = 1
            qclass = 1
            dns_question = qname + struct.pack("!HH", qtype, qclass)

            dns_payload = dns_header + dns_question

            udp_len = 8 + len(dns_payload)

            udp_hdr = struct.pack("!HHHH", src_port, dst_port, udp_len, 0)

            ip_ihl = 5
            ip_ver = 4
            ip_tos = 0
            ip_id = 0x5678
            ip_flags_offset = 0
            ip_ttl = 64
            ip_proto = 17
            ip_src = bytes([int(x) for x in src_ip.split(".")])
            ip_dst = bytes([int(x) for x in dst_ip.split(".")])
            ip_total_len = ip_ihl * 4 + udp_len

            ip_hdr = struct.pack("!BBHHHBBH4s4s",
                (ip_ver << 4) | ip_ihl, ip_tos, ip_total_len,
                ip_id, ip_flags_offset, ip_ttl, ip_proto, 0,
                ip_src, ip_dst
            )
            ip_checksum = ip_checksum_calc(ip_hdr)
            ip_hdr = struct.pack("!BBHHHBBH4s4s",
                (ip_ver << 4) | ip_ihl, ip_tos, ip_total_len,
                ip_id, ip_flags_offset, ip_ttl, ip_proto,
                ip_checksum, ip_src, ip_dst
            )

            eth_hdr = struct.pack("!6s6sH",
                bytes.fromhex(eth_dst.replace(":", "")),
                bytes.fromhex(eth_src.replace(":", "")),
                0x0800
            )

            return eth_hdr + ip_hdr + udp_hdr + dns_payload

        http_response = (
            "HTTP/1.1 200 OK\r\n"
            "Server: nginx/1.18.0\r\n"
            "Content-Type: text/html\r\n"
            "Content-Length: 245\r\n"
            "Connection: keep-alive\r\n"
            "\r\n"
            "<!DOCTYPE html>\n"
            "<html>\n"
            "<head><title>Welcome</title></head>\n"
            "<body>\n"
            f"<h1>Secret Page</h1>\n"
            f"<!-- The flag is hidden here: {FLAG} -->\n"
            "<p>Welcome to the hidden page.</p>\n"
            "</body>\n"
            "</html>\n"
        ).encode()

        syn_pkt = eth_ip_tcp_payload(
            "00:1a:2b:3c:4d:5e", "00:11:22:33:44:55",
            "10.0.0.1", "10.0.0.2",
            54321, 80,
            b"",
            seq_num=1000, ack_num=0, flags=0x02
        )
        write_packet(f, syn_pkt, ts_offset=0)

        synack_pkt = eth_ip_tcp_payload(
            "00:11:22:33:44:55", "00:1a:2b:3c:4d:5e",
            "10.0.0.2", "10.0.0.1",
            80, 54321,
            b"",
            seq_num=2000, ack_num=1001, flags=0x12
        )
        write_packet(f, synack_pkt, ts_offset=1)

        ack_pkt = eth_ip_tcp_payload(
            "00:1a:2b:3c:4d:5e", "00:11:22:33:44:55",
            "10.0.0.1", "10.0.0.2",
            54321, 80,
            b"",
            seq_num=1001, ack_num=2001, flags=0x10
        )
        write_packet(f, ack_pkt, ts_offset=2)

        http_get = (
            "GET /secret HTTP/1.1\r\n"
            "Host: internal.cgs.ctf\r\n"
            "User-Agent: Mozilla/5.0\r\n"
            "Accept: */*\r\n"
            "\r\n"
        ).encode()

        get_pkt = eth_ip_tcp_payload(
            "00:1a:2b:3c:4d:5e", "00:11:22:33:44:55",
            "10.0.0.1", "10.0.0.2",
            54321, 80,
            http_get,
            seq_num=1001, ack_num=2001, flags=0x18
        )
        write_packet(f, get_pkt, ts_offset=3)

        dns_pkt = build_dns_query()
        write_packet(f, dns_pkt, ts_offset=4)

        http_resp_pkt = eth_ip_tcp_payload(
            "00:11:22:33:44:55", "00:1a:2b:3c:4d:5e",
            "10.0.0.2", "10.0.0.1",
            80, 54321,
            http_response,
            seq_num=2001, ack_num=1001 + len(http_get), flags=0x18
        )
        write_packet(f, http_resp_pkt, ts_offset=5)

        fin_pkt = eth_ip_tcp_payload(
            "00:11:22:33:44:55", "00:1a:2b:3c:4d:5e",
            "10.0.0.2", "10.0.0.1",
            80, 54321,
            b"",
            seq_num=2001 + len(http_response), ack_num=1001 + len(http_get),
            flags=0x11
        )
        write_packet(f, fin_pkt, ts_offset=6)

        ping_payload = b"\x08\x00\x00\x00\x00\x00\x00\x00" + b"ping_payload"
        icmp_type = 8
        icmp_code = 0
        icmp_checksum = 0
        icmp_hdr = struct.pack("!BBHHH", icmp_type, icmp_code, icmp_checksum, 0, 0)
        icmp_pkt = icmp_hdr + ping_payload
        icmp_checksum = ip_checksum_calc(icmp_pkt)
        icmp_hdr = struct.pack("!BBHHH", icmp_type, icmp_code, icmp_checksum, 0, 0)

        ip_ihl = 5
        ip_ver = 4
        ip_src = bytes([10, 0, 0, 1])
        ip_dst = bytes([10, 0, 0, 3])
        ip_total_len = ip_ihl * 4 + len(icmp_hdr + ping_payload)
        ip_hdr = struct.pack("!BBHHHBBH4s4s",
            (ip_ver << 4) | ip_ihl, 0, ip_total_len,
            0x9abc, 0, 64, 1, 0, ip_src, ip_dst
        )
        ip_checksum = ip_checksum_calc(ip_hdr)
        ip_hdr = struct.pack("!BBHHHBBH4s4s",
            (ip_ver << 4) | ip_ihl, 0, ip_total_len,
            0x9abc, 0, 64, 1, ip_checksum, ip_src, ip_dst
        )

        eth_hdr = struct.pack("!6s6sH",
            bytes.fromhex("001122334455"),
            bytes.fromhex("001a2b3c4d5e"),
            0x0800
        )
        ping_pkt_full = eth_hdr + ip_hdr + icmp_hdr + ping_payload
        write_packet(f, ping_pkt_full, ts_offset=7)

    print(f"[+] Created {filename} with {FLAG} embedded in TCP stream")

if __name__ == "__main__":
    write_pcap(PCAP_FILE)
