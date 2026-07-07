# Packet Whodunit

**Category:** Forensics  
**Difficulty:** Medium  
**Points:** 250

## Description
We intercepted some network traffic. Somewhere in these packets, a secret is being transmitted. Can you reassemble the stream?

## Provided Files
- `capture.pcap` — A packet capture file containing network traffic

## Objective
Analyze the pcap and extract the flag from the TCP stream.

## Hints
- Use Wireshark or tshark to follow TCP streams
- `tshark -r capture.pcap -z follow,tcp,ascii,0`
- The flag is in an HTTP response body

## Setup
```bash
pip install -r requirements.txt
python create.py
```
