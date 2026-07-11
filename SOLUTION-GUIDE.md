# CGS CTF Platform — Complete Challenge Solution Guide

> **Warning:** This guide contains spoilers for ALL challenges. Only read if you are stuck or reviewing solutions.

---

## Table of Contents

1. [Web Challenges](#1-web-challenges-22-challenges)
2. [Forensics Challenges](#2-forensics-challenges-24-challenges)
3. [Reverse Engineering Challenges](#3-reverse-engineering-challenges-24-challenges)
4. [Crypto Challenges](#4-crypto-challenges-24-challenges)
5. [Misc Challenges](#5-misc-challenges-13-challenges)

---

## 1. Web Challenges (22 Challenges)

### Easy

#### 1.1 Hidden in Plain Sight
- **Slug:** `hidden-in-plain-sight`
- **Points:** 100
- **Hint:** "Sometimes the answer isn't in the room, it's in the envelope."
- **Solution:** The landing page appears empty, but the flag is hidden in the HTTP response headers sent by the server. Use browser DevTools (Network tab) or `curl -I` to inspect response headers.
- **Flag:** `CGS{h34d3rs_h1d3_th1ngs_t00}`

#### 1.2 Cookie Jar
- **Slug:** `cookie-jar`
- **Points:** 100
- **Hint:** "Trust, but decode."
- **Solution:** The handler checks for a cookie named `role` with value `admin`. In the playground, set the cookie field to `role=admin` and click Send. The flag is returned when the server detects the admin role cookie.
- **Flag:** `CGS{c00k13s_ar3nt_j5t_f0r_b4k1ng}`

#### 1.3 View Source
- **Slug:** `view-source`
- **Points:** 100
- **Hint:** "The browser loads more than what you see on screen. Check what files are being requested."
- **Solution:** The challenge page redirects to an external landing page (`/challenge-instances/20/`). View the page source — the flag is NOT displayed directly. Instead, the page loads `script.js`. Open that file to find the flag hidden as an obfuscated character array that reconstructs the flag string.
- **Flag:** `CGS{m1n1f13d_d03snt_m34n_h1dd3n}`

#### 1.4 Guest vs Admin
- **Slug:** `guest-vs-admin`
- **Points:** 100
- **Hint:** "What you carry defines who you are."
- **Solution:** The handler checks `cookies['token']` or the `Authorization` header for `admin-token-123` (or anything containing "admin"). In the playground, set the cookie field to `token=admin-token-123` and click Send, or set the headers field to `Authorization: admin-token-123`.
- **Flag:** `CGS{r0l3_b4s3d_4cc3ss_1s_just_b3l13f}`

#### 1.5 Path as a Parameter
- **Slug:** `path-as-a-parameter`
- **Points:** 100
- **Hint:** "When the app adds a folder, you can always go back."
- **Solution:** The app takes a path parameter and reads a file. Use path traversal (`../`) to escape the intended directory and read `/flag.txt` or similar sensitive files.
- **Flag:** `CGS{s4mpl3_4pp_l34ks_f1l3s}`

#### 1.6 API Rate Limit Race
- **Slug:** `api-rate-limit-race`
- **Points:** 100
- **Hint:** "Patience is a virtue, but speed is a weapon."
- **Solution:** The API endpoint has a rate limit that resets after a certain time window. Send multiple concurrent requests (race condition) to bypass the rate check and trigger the flag response.
- **Flag:** `CGS{r4c3_th3_l1m1t_y0u_w1n}`

### Medium

#### 1.7 SQLi Speakeasy
- **Slug:** `sqli-speakeasy`
- **Points:** 250
- **Hint:** "Ask it a question it wasn't trained to refuse."
- **Solution:** The login form is vulnerable to SQL injection. Use a UNION-based injection to bypass authentication or extract data from the database: `' OR 1=1 --` or `' UNION SELECT flag FROM flags --`
- **Flag:** `CGS{uni0n_s3l3ct_y0ur_w4y_1n}`

#### 1.8 Path Less Traveled
- **Slug:** `path-less-traveled`
- **Points:** 250
- **Hint:** "Every road leads back if you know how to walk backward."
- **Solution:** The file viewer blocks access to certain paths but does not properly sanitize `../` sequences. Use path traversal to read files outside the allowed directory, e.g., `../secret/flag.txt`.
- **Flag:** `CGS{p4th_tr4v3rs4l_1s_a_cl4ss1c}`

#### 1.9 Blind SQLi
- **Slug:** `blind-sqli`
- **Points:** 250
- **Hint:** "The truth is binary, you just have to ask enough questions."
- **Solution:** The application does not show database results directly, but responds differently for true/false conditions. Perform a blind SQL injection using boolean-based or time-based techniques to extract the flag character by character: `' OR (SELECT SUBSTR(flag,1,1) FROM flags)='C' --`
- **Flag:** `CGS{bl1nd_1nputs_st1ll_sp34k_l0udly}`

#### 1.10 NoSQL Injection
- **Slug:** `nosql-injection`
- **Points:** 250
- **Hint:** "Sometimes the query operator is the password."
- **Solution:** The application uses MongoDB (or similar NoSQL). Inject operator syntax like `$ne` or `$gt` into JSON input to bypass authentication: `{"username": "admin", "password": {"$ne": ""}}`
- **Flag:** `CGS{n0sql_1nj3ct_1s_th3_n3w_sql}`

#### 1.11 SSTI
- **Slug:** `ssti`
- **Points:** 250
- **Hint:** "The curly braces are a feature, not a bug."
- **Solution:** The application renders user input in a template engine (e.g., Jinja2, Handlebars). Inject template syntax to execute arbitrary code: `{{ config }}` or `{{ ''.__class__.__mro__[1].__subclasses__() }}`
- **Flag:** `CGS{t3mpl4t3s_d0nt_3sc4p3_3v3ryth1ng}`

#### 1.12 Open Redirect
- **Slug:** `open-redirect`
- **Points:** 250
- **Hint:** "The path forward leads somewhere unexpected."
- **Solution:** The app accepts a redirect URL parameter without sufficient validation. Use an open redirect to an external site, but the flag is revealed when you craft a specific redirect to a protected internal path.
- **Flag:** `CGS{0p3n_r3d1r3ct_n0t_just_f1sh1ng}`

#### 1.13 CORS Misconfig
- **Slug:** `cors-misconfig`
- **Points:** 250
- **Hint:** "The server doesn't care where the request came from."
- **Solution:** The server has a permissive CORS policy (e.g., `Access-Control-Allow-Origin: *` or reflects the Origin header). Craft a cross-origin request to exfiltrate sensitive data from the API.
- **Flag:** `CGS{c0rs_th1nk1ng_y0u_c4n_r34d}`

#### 1.14 IDOR
- **Slug:** `idor`
- **Points:** 250
- **Hint:** "The number on the URL is just a suggestion."
- **Solution:** The app uses sequential numeric IDs for user resources. Change the ID parameter in the URL to access another user's data (e.g., `/user/1` → `/user/0` for admin).
- **Flag:** `CGS{d1r3ct_0bj3ct_r3f3r3nc3_byp4ss}`

### Hard

#### 1.15 SSRF to the Crown Jewels
- **Slug:** `ssrf-to-the-crown-jewels`
- **Points:** 450
- **Hint:** "It fetches for you, it just doesn't ask where 'you' really are."
- **Solution:** The app fetches images from user-supplied URLs. Use the SSRF to target internal services (e.g., `http://localhost:8080/`, `http://127.0.0.1/`, `http://metadata.google.internal/`) and retrieve the flag from an internal endpoint.
- **Flag:** `CGS{m3t4d4t4_s3rv1c3s_tru5t_t00_much}`

#### 1.16 XSS to Admin
- **Slug:** `xss-to-admin`
- **Points:** 450
- **Hint:** "The admin sees what you see. Make it worth their visit."
- **Solution:** Find a stored or reflected XSS vulnerability. Submit a payload that steals the admin's cookie or performs actions on their behalf. The admin bot visits the page with the payload.
- **Flag:** `CGS{xss_th3_adm1ns_c00k13_pl34s3}`

#### 1.17 Prototype Pollution
- **Slug:** `prototype-pollution`
- **Points:** 450
- **Hint:** "The blueprint of every object can be rewritten by anyone who touches it."
- **Solution:** The app merges user-controlled objects unsafely. Use prototype pollution via `__proto__` or `constructor.prototype` to inject properties that bypass security checks.
- **Flag:** `CGS{pr0t0typ3_p0llut10n_1s_s3lf_m0d1fy}`

#### 1.18 JWT Algorithm Confusion
- **Slug:** `jwt-algorithm-confusion`
- **Points:** 450
- **Hint:** "If the token says it's HMAC, the server might believe it with the public key."
- **Solution:** The server uses RSA for JWT verification but exposes the public key. Change the JWT algorithm from `RS256` to `HS256` and sign the token using the public key as the HMAC secret.
- **Flag:** `CGS{jwt_alg_n0n3_byp4ss_l34ds_t0_rce}`

#### 1.19 CSRF Token Bypass
- **Slug:** `csrf-token-bypass`
- **Points:** 450
- **Hint:** "The cookie thinks it's a fortress, but it's the key to the gate."
- **Solution:** The app uses CSRF tokens but ties them to session cookies. If the token validation does not check the token-to-session binding, use your own valid token with the victim's session.
- **Flag:** `CGS{csrf_byp4ss_w1th_c00k13_s3cr3ts}`

#### 1.20 XXE
- **Slug:** `xxe`
- **Points:** 450
- **Hint:** "The XML document can include content from anywhere it wants."
- **Solution:** The app parses XML input with external entity processing enabled. Inject an XXE payload to read local files or trigger SSRF: `<!ENTITY xxe SYSTEM "file:///flag.txt">`
- **Flag:** `CGS{xxe_st1ll_w0rks_1n_2k24}`

#### 1.21 Race Condition
- **Slug:** `race-condition`
- **Points:** 450
- **Hint:** "The gap between checking and spending is all the room you need."
- **Solution:** The app has a TOCTOU (Time-of-Check Time-of-Use) vulnerability in a financial or resource transfer operation. Send concurrent requests to exploit the race window.
- **Flag:** `CGS{r4c3_c0nd1t10n_d0ubl3_sp3nd}`

#### 1.22 Cache Poisoning
- **Slug:** `cache-poisoning`
- **Points:** 450
- **Hint:** "What the cache remembers, the world inherits."
- **Solution:** The app uses a caching layer (e.g., CDN, reverse proxy). Inject crafted headers (e.g., `X-Forwarded-Host`) to poison the cache and serve malicious content to other users.
- **Flag:** `CGS{p01s0n_th3_c4ch3_t0_w1n_th3_g4m3}`

---

## 2. Forensics Challenges (24 Challenges)

### Easy

#### 2.1 Metadata Whisper
- **File:** `photo.png`
- **Hint:** "The picture tells a story the eyes can't read."
- **Solution:** Use `exiftool` or `Get-ItemProperty` to read the PNG's EXIF metadata. The flag is hidden in a metadata field (e.g., Comment, Artist, or Description).
- **Tool:** `exiftool photo.png`
- **Flag:** `CGS{3x1f_kn0ws_wh3r3_y0u_b33n}`

#### 2.2 Zip of Secrets
- **File:** `secret.zip`
- **Hint:** "The lock looks strong until you ask it nicely."
- **Solution:** The ZIP is password-protected. Use `fcrackzip` or `john` with `rockyou.txt` to crack the password.
- **Tool:** `fcrackzip -u -D -p /usr/share/wordlists/rockyou.txt secret.zip`
- **Flag:** `CGS{p4ssw0rd_w4s_1n_th3_w0rdl1st}`

#### 2.3 Not-a-Virus
- **File:** `sample.exe`
- **Hint:** "Not all text is code."
- **Solution:** Run `strings` on the executable to extract human-readable text. The flag is embedded as a string in the binary.
- **Tool:** `strings sample.exe | grep CGS`
- **Flag:** `CGS{str1ngs_n0t_just_f0r_b1n4r13s}`

#### 2.4 Hidden in Plain Text
- **File:** `message.txt`
- **Hint:** "The spaces aren't all empty."
- **Solution:** The file contains invisible Unicode characters (zero-width spaces, zero-width joiners). Use a hex editor or specialized tool (e.g., `https://330k.github.io/misc_tools/unicode_steganography.html`) to extract the hidden message.
- **Flag:** `CGS{1nv1s1bl3_ch4rs_4r3_v1s1bl3_t00}`

#### 2.5 Image Dimensions Mismatch
- **File:** `corrupted.png`
- **Hint:** "The image knows its real size, but it's not telling the whole truth."
- **Solution:** The PNG's IHDR chunk has incorrect height/width values. Use a hex editor to correct the dimensions (or brute-force CRC until the image displays properly). The flag appears when the correct dimensions are set.
- **Flag:** `CGS{1hdr_h1d3s_m0r3_th4n_h31ght}`

#### 2.6 File Signature Maze
- **File:** `mystery.dat`
- **Hint:** "The extension is a suggestion. The first bytes are the truth."
- **Solution:** Check the file header magic bytes. The `.dat` file might be a ZIP, PNG, PDF, or other format. Rename with the correct extension or extract with the appropriate tool.
- **Flag:** `CGS{m4g1c_byt3s_n3v3r_l13_4b0ut_f1l3s}`

#### 2.7 Base64 Everywhere
- **File:** `secret.txt`
- **Hint:** "Peel the onion one layer at a time."
- **Solution:** The file contains a string that has been Base64-encoded multiple times. Repeatedly decode until the flag appears:
  ```
  cat secret.txt | base64 -d | base64 -d | base64 -d ...
  ```
- **Flag:** `CGS{l4y3rs_0f_b64_1s_n0t_3ncrypt10n}`

#### 2.8 Discord Leak
- **File:** `discord_screenshot.png`
- **Hint:** "Sometimes what's outside the crop matters."
- **Solution:** The screenshot was cropped but still contains hidden content below the visible area. Open in an image editor and expand the canvas downward, or use `zsteg`/`stegsolve` to reveal the cropped content.
- **Flag:** `CGS{d1sc0rd_l34ks_h4pp3n_3v3ry_d4y}`

### Medium

#### 2.9 Packet Whodunit
- **File:** `capture.pcap`
- **Hint:** "The conversation happened, you just weren't listening at the right layer."
- **Solution:** Open the pcap in Wireshark. Look for TCP streams (Follow → TCP Stream) or HTTP objects. The flag is transmitted in one of the application-layer streams.
- **Tool:** Wireshark, `tshark`
- **Flag:** `CGS{tcp_str34ms_r3m3mb3r_3v3ryth1ng}`

#### 2.10 Steg-anography
- **File:** `stego.png`
- **Hint:** "The picture isn't lying, it's just not telling everything at once."
- **Solution:** Use LSB steganography tools to extract hidden data from the image.
- **Tool:** `zsteg stego.png`, `stegsolve`, `steghide`
- **Flag:** `CGS{l0w3st_b1ts_h1d3_th3_m0st}`

#### 2.11 Document Forensics
- **File:** `document.docx`
- **Hint:** "The document has layers of history that most viewers skip."
- **Solution:** A `.docx` file is a ZIP archive. Extract it (`unzip document.docx`) and examine the XML files inside. Look at `docProps/`, `word/document.xml`, and embedded objects for hidden content.
- **Flag:** `CGS{0l3_0bj3cts_l34k_m0r3_th4n_t3xt}`

#### 2.12 PDF Puzzle
- **File:** `puzzle.pdf`
- **Hint:** "Not everything visible is text, and not everything invisible is missing."
- **Solution:** The PDF has hidden layers, invisible text, or embedded files. Use `pdftotext`, `pdf-parser`, or `qpdf` to extract all content layers.
- **Tool:** `qpdf --qdf puzzle.pdf out.qdf`, `pdf-parser.py`
- **Flag:** `CGS{pdf_l4y3rs_c4n_b3_str3am3d}`

#### 2.13 Registry Analysis
- **File:** `NTUSER.DAT`
- **Hint:** "Windows remembers everything you tell it, even if you wish it wouldn't."
- **Solution:** Open the registry hive using a registry viewer (e.g., `regedit` → Load Hive, or `regipy`). Search through registry keys for the flag, likely in `Software\Microsoft\...` or `RunMRU` entries.
- **Flag:** `CGS{r3g1stry_k3ys_c0nt41n_s3cr3ts}`

#### 2.14 Traffic Analysis
- **File:** `malware_capture.pcap`
- **Hint:** "The beacon hides among the noise. Find the pattern."
- **Solution:** The pcap contains C2 (Command & Control) traffic. Filter for unusual periodic connections, DNS queries to suspicious domains, or HTTP requests with encoded data.
- **Tool:** Wireshark, Brim, Zeek
- **Flag:** `CGS{c2_tr4ff1c_l00ks_l1k3_n0rm4l_n01s3}`

#### 2.15 Browser History Exfiltration
- **File:** `history.db`
- **Hint:** "Your browser writes everything down, even when you're offline."
- **Solution:** The file is a SQLite database (Chrome/Firefox history). Open with `sqlite3` and query the `urls` table for suspicious URLs:
  ```sql
  SELECT * FROM urls WHERE url LIKE '%flag%' OR url LIKE '%CGS%';
  ```
- **Flag:** `CGS{br0ws3r_h1st0ry_t3lls_3v3ryth1ng}`

#### 2.16 USB Data Exfiltration
- **File:** `payload.txt`
- **Hint:** "The keystrokes don't belong to a person."
- **Solution:** The file contains a Rubber Ducky/USB Rubber Ducky script. Decode the DuckyScript keystroke commands to reconstruct the exfiltrated data:
  ```
  STRING something
  DELAY 100
  CONTROL a
  CONTROL c
  ...
  ```
- **Flag:** `CGS{ducky_scr1pt_exf1ltrat3s_d4ta}`

### Hard

#### 2.17 Memory Lane
- **File:** `dump.bin`
- **Hint:** "The computer forgot to forget."
- **Solution:** The file is a memory dump. Use Volatility 3 to analyze processes, network connections, and extract files from memory:
  ```
  vol -f dump.bin windows.pslist
  vol -f dump.bin windows.cmdline
  vol -f dump.bin windows.filescan
  ```
- **Flag:** `CGS{v0l4t1l1ty_n3v3r_f0rg3ts}`

#### 2.18 Disk Image Analysis
- **File:** `disk_image.dd`
- **Hint:** "Deleted doesn't mean gone."
- **Solution:** The disk image contains deleted files in unallocated space. Use `foremost`, `scalpel`, or `photorec` to recover deleted files:
  ```
  foremost -i disk_image.dd -o output/
  ```
- **Flag:** `CGS{d1sk_1m4g3_rcv3ry_un4ll0c4t3d}`

#### 2.19 Packet Reconstruction
- **File:** `fragmented.pcap`
- **Hint:** "The pieces are all there, just out of order."
- **Solution:** The pcap contains fragmented or out-of-order packets. Follow TCP streams in Wireshark and export the reassembled HTTP objects (File → Export Objects → HTTP).
- **Flag:** `CGS{r3c0nstruct1ng_fr4gm3nt3d_f1l3s}`

#### 2.20 Stego with Deep Learning
- **File:** `deep_stego.png`
- **Hint:** "The neural net learned to hide where humans never look."
- **Solution:** Neural-network-based steganography requires a decoder model. Run the provided `decode.py` script to extract the hidden data using the trained model.
- **Tool:** `python decode.py deep_stego.png`
- **Flag:** `CGS{n3ur4l_st3g0_h1d3s_d33ply}`

#### 2.21 SQLite WAL Forensics
- **File:** `database.db-wal`
- **Hint:** "The database's memory outlives the database itself."
- **Solution:** The main `.db` file was deleted, but the Write-Ahead Log (`.db-wal`) survives. Use `sqlite3` to open the WAL file directly or reconstruct by copying the WAL as the database file:
  ```
  cp database.db-wal recovered.db
  sqlite3 recovered.db
  ```
- **Flag:** `CGS{w4l_f1l3s_p3rs1st_4ft3r_d3l3t10n}`

#### 2.22 Browser Cache Reconstruction
- **File:** `cache_folder.zip`
- **Hint:** "The browser saves everything it downloads, even fragments."
- **Solution:** Extract the cache folder and analyze cached HTTP resources. Look for partial downloads or reconstructed page content from cache metadata.
- **Flag:** `CGS{c4ch3d_p4g3s_c4n_b3_r3c0v3r3d}`

#### 2.23 Encrypted Container Analysis
- **File:** `secret_volume.hc`
- **Hint:** "The container is locked, but the key is guessable."
- **Solution:** The file is a VeraCrypt container. Use `hashcat` to crack the volume password, then mount with VeraCrypt:
  ```
  veracrypt -t -k "" --pim=0 --protect-hidden=no secret_volume.hc /mnt/vault
  ```
- **Flag:** `CGS{v3r4cr1pt_w34k_p4ssw0rd_cr4ck3d}`

#### 2.24 Cloud Log Forensics
- **File:** `cloudtrail_logs.json`
- **Hint:** "Every API call leaves a permanent record."
- **Solution:** Parse the AWS CloudTrail JSON logs. Search for anomalous API calls, suspicious IP addresses, or `GetObject` calls to sensitive S3 buckets that reveal the flag.
- **Flag:** `CGS{cl0udtr41l_l0gs_d0nt_l13_3v3r}`

---

## 3. Reverse Engineering Challenges (24 Challenges)

### Easy

#### 3.1 Baby's First Binary
- **File:** compiled binary from `challenge.c`
- **Hint:** "It talks before it thinks. Listen to what it says to itself."
- **Solution:** Run `strings` on the binary. The flag is embedded as a string literal.
- **Tool:** `strings ./challenge | grep CGS`
- **Flag:** `CGS{str1ngs_d1dnt_l13}`

#### 3.2 Flag in Functions
- **File:** compiled binary from `challenge.c`
- **Hint:** "The function names are the programmer's notes to you."
- **Solution:** List exported symbols with `nm` or `objdump -t`. The flag may be spread across function names or found in a function named after the flag.
- **Flag:** `CGS{symb0ls_t3ll_3v3ryth1ng}`

#### 3.3 Hardcoded Key
- **File:** compiled binary from `challenge.c`
- **Hint:** "The secret is in the source, just not in plain text."
- **Solution:** Disassemble with `objdump` or Ghidra. Find the hardcoded encryption key/byte array and XOR/decrypt the encrypted buffer to recover the flag.
- **Flag:** `CGS{h4rdc0d3d_k3ys_n3v3r_s3cur3}`

#### 3.4 Simple XOR Check
- **File:** compiled binary from `challenge.c`
- **Hint:** "XOR is a two-way street."
- **Solution:** The binary XORs input against a known buffer. Reverse the XOR by XORing the known buffer with expected output:
  ```python
  # Given buffer and expected result, XOR to find input
  flag = ''.join(chr(b ^ k) for b, k in zip(buffer, key))
  ```
- **Flag:** `CGS{x0r_ch3cksums_n0t_s3cur3}`

#### 3.5 Input Echo
- **File:** compiled binary from `challenge.c`
- **Hint:** "It repeats what you say, but it's listening for something specific."
- **Solution:** Run the binary and enter various inputs. Look for a specific input that triggers the flag output. Reverse the conditional check to find the magic value.
- **Flag:** `CGS{3ch0_c0nd1t10n4l_0utput}`

#### 3.6 Return Code
- **File:** compiled binary from `challenge.c`
- **Hint:** "The program never speaks, but it always leaves a number."
- **Solution:** Run the binary and capture the exit code for each invocation. The exit code corresponds to a character:
  ```bash
  ./challenge A; echo $?
  ./challenge B; echo $?
  ```
  Or use `strace` to observe exit codes programmatically.
- **Flag:** `CGS{3x1t_c0d3s_4r3_m3ss4g3s_t00}`

#### 3.7 Decompile Me
- **File:** `FlagPrinter.class`
- **Hint:** "Java bytecode is just another language."
- **Solution:** Decompile the `.class` file using `javap -c` or a decompiler like CFR/Procyon:
  ```bash
  javap -c FlagPrinter.class
  ```
  The flag is visible in the bytecode or constant pool.
- **Flag:** `CGS{d3c0mp1l3_m3_1m_4n_0p3n_b00k}`

#### 3.8 Time Check
- **File:** compiled binary from `challenge.c`
- **Hint:** "The program checks its watch before it speaks."
- **Solution:** The binary checks the system time and only runs at a specific time. Set the system clock to the target time or NOP out the time check in a debugger (GDB).
  ```bash
  gdb ./challenge
  (gdb) break *0x401234  # break at time check
  (gdb) jump *0x401567  # jump past check
  ```
- **Flag:** `CGS{t1m3_ch3cks_d0nt_st0p_r3v3rs3rs}`

### Medium

#### 3.9 Loopy Logic
- **File:** compiled binary from `challenge.c`
- **Hint:** "It counts, it checks, it forgives nothing — but it repeats itself."
- **Solution:** The binary implements a keygen-style loop that validates input with arithmetic. Extract the validation logic and reverse it to compute valid input.
- **Flag:** `CGS{k3yg3n_l00ps_4r3nt_5ecr3t}`

#### 3.10 Flag Checker
- **File:** compiled binary from `challenge.c`
- **Hint:** "Every constraint is a clue in disguise."
- **Solution:** The binary checks multiple constraints (e.g., character ranges, sum checks, parity). Model the constraints as equations and solve for the valid input. Use Z3 or manually reverse each check.
- **Flag:** `CGS{c0nstr41nts_4r3_r3v3rs1bl3}`

#### 3.11 Custom VM
- **File:** `bytecode.bin` + compiled VM from `challenge.c`
- **Hint:** "The real program isn't the one you can disassemble."
- **Solution:** The binary is a VM interpreter. Analyze the VM dispatch loop to understand the instruction set, then disassemble `bytecode.bin` to find the flag-checking logic.
- **Flag:** `CGS{v1rtu4l_m4ch1n3_byt3c0d3_r3v3rs1ng}`

#### 3.12 CRC Check
- **File:** compiled binary from `challenge.c`
- **Hint:** "Cyclic redundancy is not cryptographic."
- **Solution:** The binary calculates a CRC of the input. Since CRC is reversible, compute a valid input that produces the expected CRC (or brute-force short inputs).
- **Flag:** `CGS{crC_1s_f0r_3rr0r_n0t_s3cur1ty}`

#### 3.13 Anti-Debug
- **File:** compiled binary from `challenge.c`
- **Hint:** "It checks if it's being watched. Trick it into thinking it's alone."
- **Solution:** The binary calls `ptrace(PTRACE_TRACEME)`. Bypass by:
  1. Patching the `ptrace` call to return 0 (NOP or change jump)
  2. Using `LD_PRELOAD` to override `ptrace`
  3. Using GDB's `catch syscall`
- **Flag:** `CGS{ptrac3_ch3ck_n0t_d3bug_pr00f}`

#### 3.14 Z3 Solver
- **File:** compiled binary from `challenge.c`
- **Hint:** "Let the math do the work."
- **Solution:** Extract the flag-checking constraints and encode them in Z3:
  ```python
  from z3 import *
  solver = Solver()
  # ... encode constraints ...
  ```
- **Flag:** `CGS{symb0l1c_3x3cut10n_s0lv3s_4ll}`

#### 3.15 UPX Packed
- **File:** `packed.exe`
- **Hint:** "The binary is wearing a disguise. Remove it to see its true face."
- **Solution:** The binary is packed with UPX. Unpack with:
  ```bash
  upx -d packed.exe -o unpacked.exe
  strings unpacked.exe | grep CGS
  ```
- **Flag:** `CGS{upx_p4ck1ng_1s_tr4nsp4r3nt}`

#### 3.16 .NET Decompilation
- **File:** `DotNetFlag.dll`
- **Hint:** ".NET programs carry their source code's skeleton."
- **Solution:** Decompile with `ildasm` or a .NET decompiler (e.g., dnSpy, ILSpy):
  ```bash
  ildasm DotNetFlag.dll /OUT=output.il
  ```
  The flag is visible in the IL code.
- **Flag:** `CGS{n3t_d3c0mp1l4t10n_w1th_1ld4sm}`

### Hard

#### 3.17 Obfuscated Onion
- **File:** compiled binary from `challenge.c`
- **Hint:** "Peel it wrong and it peels back."
- **Solution:** The binary has multiple layers of obfuscation and anti-analysis tricks. Used controlled environment debugging (rr, GDB) and systematically bypass each layer. The flag is revealed after multiple decryption stages.
- **Flag:** `CGS{p33l1ng_l4y3rs_t4k3s_p4t13nc3}`

#### 3.18 VM Based Obfuscation
- **File:** `bytecode.bin` + compiled VM from `challenge.c`
- **Hint:** "The interpreter applies everywhere. The bytecode is the real program."
- **Solution:** Similar to Custom VM, but the instruction set is more complex with obfuscated dispatch. Extract the bytecode and emulate it in Python to understand the flag check.
- **Flag:** `CGS{vm_pr0t3ct10n_n0t_1mp0ss1bl3}`

#### 3.19 White-Box Crypto
- **File:** compiled binary from `challenge.c`
- **Hint:** "The key isn't hidden, it's just spread across many numbers."
- **Solution:** The binary implements white-box AES with key-embedded lookup tables. Extract the tables and reverse the white-box implementation to recover the AES key.
- **Flag:** `CGS{wh1t3b0x_a3s_t4bl3s_l34k_k3ys}`

#### 3.20 Firmware Reversing
- **File:** `firmware.bin`
- **Hint:** "The microcontroller never forgets its secrets."
- **Solution:** Analyze the firmware binary for the ARM Cortex-M architecture. Use Ghidra with ARM plugin to disassemble and find the flag in the firmware strings or decompiled code.
- **Flag:** `CGS{f1rmw4r3_r3v3rs1ng_0n_4rm}`

#### 3.21 JNI Reversing
- **Files:** `app-debug.apk`, `native-lib.cpp`
- **Hint:** "The Java layer is just the messenger."
- **Solution:** Decompile the APK's DEX files to find the JNI call. The native library (`.so`) contains the flag-checking logic. Reverse the native ARM code.
- **Flag:** `CGS{jni_n4t1v3_c0d3_r3v34ls_4ll}`

#### 3.22 Ghost in the Machine
- **File:** compiled binary from `challenge.c`
- **Hint:** "The program writes its own rules as it runs."
- **Solution:** The binary is self-modifying. Use a debugger with hardware breakpoints to catch the write to code section, then analyze the dynamically generated code.
- **Flag:** `CGS{s3lf_m0d1fy1ng_c0d3_gh0stly}`

#### 3.23 Time Travel Debugging
- **File:** compiled binary from `challenge.c`
- **Hint:** "Sometimes the best way forward is to step back."
- **Solution:** Use `rr` (Record and Replay) or WinDbg reverse debugging to step backward through the flag check. Record the execution, run to the end, then step backward to trace the flag construction.
- **Flag:** `CGS{t1m3_tr4v3l_d3bugg1ng_w1ns}`

#### 3.24 Real World CVE Reversal
- **Files:** `vulnerable.exe`, `patched.exe`
- **Hint:** "Compare the two versions. The difference is the vulnerability."
- **Solution:** Binary diff the patched and vulnerable executables (using Diaphora, Bindiff, or `diff` on hex). The changed bytes reveal the vulnerability. Craft an exploit to trigger it and read the flag.
- **Flag:** `CGS{p4tch_d1ff1ng_r3v34ls_vulns}`

---

## 4. Crypto Challenges (24 Challenges)

### Easy

#### 4.1 Caesar's Ghost
- **File:** `ciphertext.txt`
- **Hint:** "Julius liked round numbers, but this one's off by a coin flip."
- **Solution:** Try all Caesar shift values (ROT1-25). One of them produces the flag. The hint suggests the shift might not be the standard ROT13.
- **Flag:** `CGS{sh1ft_h4pp3ns}`

#### 4.2 XOR Marks the Spot
- **File:** `xor_ciphertext.txt`, `generate.js`
- **Hint:** "One key, many doors, only one fits without breaking the lock."
- **Solution:** The ciphertext is XORed with a single-byte key. Brute-force all 256 possible keys and look for the one that produces readable text starting with `CGS`:
  ```python
  for key in range(256):
      decoded = ''.join(chr(b ^ key) for b in ciphertext)
      if decoded.startswith('CGS'): print(decoded)
  ```
- **Flag:** `CGS{s1ngl3_byt3_x0r_1s_n0_l0ck}`

#### 4.3 Base64 Flip
- **File:** `encoded.txt`, `generate.py`
- **Hint:** "Every layer peels off the same way."
- **Solution:** The string has been Base64-encoded multiple times. Repeatedly decode:
  ```python
  import base64
  data = open('encoded.txt').read().strip()
  while 'CGS' not in data:
      data = base64.b64decode(data).decode()
  print(data)
  ```
- **Flag:** `CGS{b64_d3c0d1ng_1s_n0t_crypt0}`

#### 4.4 Hex Decode
- **File:** `hex_message.txt`, `generate.py`
- **Hint:** "Every two characters become one byte."
- **Solution:** The file contains hex-encoded bytes. Convert hex to ASCII:
  ```python
  bytes.fromhex(open('hex_message.txt').read()).decode()
  ```
- **Flag:** `CGS{h3x_d3c0d3_n0t_3ncrypt10n}`

#### 4.5 Vigenère
- **File:** `ciphertext.txt`, `generate.py`
- **Hint:** "A repeating key eventually repeats itself."
- **Solution:** The ciphertext is encrypted with a short Vigenère key. Use a Vigenère solver (e.g., `xortool` or online tool) or brute-force short keys. The key is a common English word.
- **Flag:** `CGS{v1g3n3r3_k3y_w4s_t00_sh0rt}`

#### 4.6 Atbash
- **File:** `ciphertext.txt`, `generate.py`
- **Hint:** "A is Z, B is Y — the alphabet folded in half."
- **Solution:** Apply the Atbash cipher (reverse alphabet substitution: A↔Z, B↔Y, etc.):
  ```python
  def atbash(text):
      result = []
      for c in text:
          if 'a' <= c <= 'z': result.append(chr(ord('z') - (ord(c) - ord('a'))))
          elif 'A' <= c <= 'Z': result.append(chr(ord('Z') - (ord(c) - ord('A'))))
          else: result.append(c)
      return ''.join(result)
  ```
- **Flag:** `CGS{4tb4sh_c1ph3r_r3v3rs3d}`

#### 4.7 Morse Code
- **File:** `morse.wav`
- **Hint:** "The beeps are a language older than radio."
- **Solution:** The WAV file contains Morse code audio. Use an audio decoder (e.g., `morsecode` library, or visually inspect the waveform in Audacity). Transcribe the dots/dashes to letters.
- **Flag:** `CGS{m0rs3_c0d3_b33ps_n0t_music}`

#### 4.8 Baconian Cipher
- **File:** `bacon_message.txt`, `generate.py`
- **Hint:** "The letters carry two meanings: one you read, one you decode."
- **Solution:** The text groups letters in fives. Each letter has a subtle formatting difference (font A vs font B, or uppercase/lowercase). Extract the binary pattern (A=0, B=1) and decode as Baconian cipher.
- **Flag:** `CGS{b4c0n_c1ph3r_b1n4ry_h1dd3n}`

### Medium

#### 4.9 RSA's Small Mistake
- **File:** `rsa_params.txt`, `generate.js`
- **Hint:** "Even giants trip on small stones."
- **Solution:** The RSA primes are too small. Factor `n` using a simple factorization tool (e.g., `factordb.com`, Pollard's rho, or msieve):
  ```bash
  python -c "from sympy import factorint; print(factorint(n))"
  ```
  Then compute private key `d` and decrypt.
- **Flag:** `CGS{fact0r1ng_sm4ll_pr1m3s_1s_ch34p}`

#### 4.10 Padding Oracle Lite
- **Files:** `encrypted_flag.txt`, `server.js`
- **Hint:** "The error message is more honest than it means to be."
- **Solution:** The server decrypts ciphertexts and reveals padding errors. Use the padding oracle attack to decrypt the ciphertext byte by byte:
  ```python
  # For each byte position, modify the previous ciphertext block
  # until the server no longer returns a padding error
  ```
- **Flag:** `CGS{th3_3rr0r_t0ld_0n_1ts3lf}`

#### 4.11 Hash Length Extension
- **Files:** `server.js`, `generate.py`
- **Hint:** "The hash continues from where the original left off."
- **Solution:** Given `MD5(key + message)` and the message, forge `MD5(key + message + padding + extension)` without knowing `key`. Use `hashpumpy` or `hash_extender`:
  ```bash
  hash_extender --data <original> --secret <unknown> --append <extension> --signature <hash> --format md5
  ```
- **Flag:** `CGS{h4sh_l3ngth_3xt3ns10n_br34ks_md5}`

#### 4.12 ECB Byte-at-a-Time
- **Files:** `server.js`, `generate.py`
- **Hint:** "ECB treats each block in isolation. That's its weakness."
- **Solution:** Send incremental inputs to the oracle and detect block boundaries, then recover the secret suffix one byte at a time by crafting aligned plaintext blocks.
- **Flag:** `CGS{3cb_byt3_4t_t1m3_0r4cl3}`

#### 4.13 Diffie-Hellman MITM
- **File:** `dh_capture.txt`, `generate.py`
- **Hint:** "The shared secret is only a secret if nobody else can compute it."
- **Solution:** The DH parameters are weak (small prime, smooth order). Compute the discrete log to recover the private key and decrypt the shared secret:
  ```python
  from sympy.ntheory.residue_ntheory import discrete_log
  ```
- **Flag:** `CGS{dh_m1tm_w1th_sm4ll_pr1m3}`

#### 4.14 Bit Flipping
- **Files:** `encrypted_cookie.txt`, `server.js`, `generate.py`
- **Hint:** "In CBC, changing the previous block changes the next block's plaintext."
- **Solution:** The CBC-encrypted cookie contains `admin=false` in one block. XOR the previous block to change it to `admin=true `:
  ```python
  # modified_prev[i] = prev[i] XOR 'false'[i] XOR 'true ' [i]
  ```
- **Flag:** `CGS{cbc_b1t_fl1pp1ng_t0_4dm1n}`

#### 4.15 ECB Cut-and-Paste
- **Files:** `server.js`, `generate.py`
- **Hint:** "ECB blocks can be rearranged without detection."
- **Solution:** ECB encrypts each block independently. Craft input so that the "admin" block aligns at block boundaries, then replace the user role block with the admin block.
- **Flag:** `CGS{3cb_cut_p4st3_r0l3_3sc4l4t3}`

#### 4.16 CRC Collision
- **File:** `generate.py`
- **Hint:** "CRC is for error detection, not security."
- **Solution:** CRC32 is a linear function. Given a target CRC, compute a message that produces the same CRC (CRC collision). Use CRC32 properties to craft a modified file.
- **Flag:** `CGS{cr32_c0ll1s10ns_4r3_tr1v14l}`

### Hard

#### 4.17 Lattice of Lies
- **Files:** `rsa_keys.txt`, `generate.js`
- **Hint:** "The numbers are polite until you rearrange the furniture."
- **Solution:** Two RSA keys share related primes (generated from the same random pool). Use lattice reduction (LLL) to factor both moduli:
  ```python
  from sage.all import *
  M = matrix(ZZ, [[n1, 0], [0, n2]])
  # ... lattice attack
  ```
- **Flag:** `CGS{l4tt1c3_r3duct10n_br34ks_w34k_k3ys}`

#### 4.18 Fault Attack
- **File:** `signatures.txt`, `generate.py`
- **Hint:** "One mistake is all it takes to undo the math."
- **Solution:** Given one correct and one faulty RSA signature on the same message, recover the private key:
  ```
  p = GCD(sig_correct - sig_faulty, n)
  ```
- **Flag:** `CGS{f4ult_4n4lys1s_r3v34ls_th3_k3y}`

#### 4.19 Bleichenbacher's Attack
- **Files:** `encrypted.txt`, `server.js`, `generate.py`
- **Hint:** "The oracle answers one bit at a time, but that's enough."
- **Solution:** The server reveals PKCS#1 v1.5 padding validity. Use Bleichenbacher's million-message attack to iteratively narrow the plaintext interval.
- **Flag:** `CGS{bl31ch3nb4ch3r_pkcs15_0r4cl3}`

#### 4.20 Side-Channel Timing
- **Files:** `server.js`, `generate.py`
- **Hint:** "The faster it fails, the earlier the mistake."
- **Solution:** The password comparison returns early on first mismatch. Measure response time to guess each character position:
  ```python
  import time, requests
  # For each position, try all chars and measure response time
  ```
- **Flag:** `CGS{t1m1ng_s1d3_ch4nn3l_byt3_by_byt3}`

#### 4.21 RSA with Common Factor
- **Files:** `rsa_keypair1.txt`, `rsa_keypair2.txt`, `generate.py`
- **Hint:** "Two keys can share a secret without knowing it."
- **Solution:** Compute GCD of the two moduli to find the shared prime factor:
  ```python
  from math import gcd
  p = gcd(n1, n2)
  ```
  Then factor each `n` and decrypt.
- **Flag:** `CGS{rs4_c0mm0n_f4ct0r_w34k_n33ds}`

#### 4.22 ECDSA Nonce Reuse
- **File:** `signatures.txt`, `generate.py`
- **Hint:** "Reusing a nonce in ECDSA is like reusing a one-time pad key."
- **Solution:** Two signatures share the same `k` value. Recover `k` and then the private key:
  ```python
  k = (z1 - z2) / (s1 - s2) mod n
  private_key = (s1 * k - z1) / r1 mod n
  ```
- **Flag:** `CGS{3cds4_n0nc3_r3us3_f4t4l_3rr0r}`

#### 4.23 RC4 Bias
- **File:** `rc4_ciphertext.bin`, `generate.py`
- **Hint:** "The first bytes of RC4 are predictable enough to be useful."
- **Solution:** RC4's first output bytes have measurable biases (e.g., byte 2 is more likely to be 0). XOR the ciphertext with the bias values to recover parts of the plaintext. With many ciphertexts, the biases become statistically significant.
- **Flag:** `CGS{rc4_b14s_s1ngl3_byt3_pr3d1ct4bl3}`

#### 4.24 Quantum/Post-Quantum Crypto Intro
- **File:** `pqc_params.txt`, `generate.py`
- **Hint:** "Quantum resistance requires math that's hard even for quantum computers."
- **Solution:** The lattice parameters are too small. Use LLL to find the short vector or recover the secret key:
  ```python
  from fpylll import IntegerMatrix, LLL
  ```
- **Flag:** `CGS{p0st_qu4ntum_w1th_w34k_p4r4ms}`

---

## 5. Misc Challenges (13 Challenges)

### Easy

#### 5.1 Console Confessions
- **File:** `index.html`, `script.js`
- **Hint:** "The page is quiet, but it's not silent."
- **Solution:** Open the browser DevTools console (F12). The page logs the flag to the console, possibly as a log message or comment.
- **Flag:** `CGS{f12_1s_y0ur_fr13nd}`

#### 5.2 DNS Exfiltration
- **File:** `dns_capture.pcap`
- **Hint:** "Every domain name tells a story."
- **Solution:** Extract DNS query domain names from the pcap. Each subdomain prefix contains a Base64 fragment. Concatenate and decode:
  ```bash
  tshark -r dns_capture.pcap -Y "dns.qry.name" -T fields -e dns.qry.name | \
    cut -d'.' -f1 | tr -d '\n' | base64 -d
  ```
- **Flag:** `CGS{dns_tunn3l1ng_3xfl1tr4t3s_d4t4}`

#### 5.3 Pastebin Dump
- **File:** `paste_dump.txt`, `generate.py`
- **Hint:** "The paste looks real, but someone's been there before you."
- **Solution:** The paste contains credentials and data that looks like a flag but is subtly modified. Compare with the original or diff to find the altered parts that form the real flag.
- **Flag:** `CGS{p4st3b1n_dumps_4r3_g0ldm1n3s}`

#### 5.4 Click the Button
- **File:** `index.html`, `script.js`
- **Hint:** "The button has thumbs, you have code."
- **Solution:** The button moves away from the cursor. Use browser console to programmatically click it:
  ```javascript
  setInterval(() => document.querySelector('button').click(), 100)
  ```
  Or use `curl` to POST to the underlying API directly.
- **Flag:** `CGS{cl1ck1ng_4ut0m4t10n_byp4ss3s_gu1}`

#### 5.5 Emoji Cipher
- **File:** `emoji_message.txt`, `generate.py`
- **Hint:** "Apple is A. The pattern is simpler than it looks."
- **Solution:** Each emoji represents a letter (e.g., 🍎 = A, 🍌 = B). Map emojis to letters using the first letter of the emoji name (or the provided mapping):
  ```python
  emoji_map = {'🍎': 'A', '🍌': 'B', '🐱': 'C', ...}
  ```
- **Flag:** `CGS{3m0j1_crypt0_1s_n0t_s3cur3}`

#### 5.6 OSINT - Social Media
- **File:** `profile_info.txt`, `generate.py`
- **Hint:** "People leave digital footprints everywhere."
- **Solution:** The file references a social media profile. Search for the username/handle on Twitter, Instagram, LinkedIn, etc. The flag is in a bio or post.
- **Flag:** `CGS{s0c1al_m3d14_0s1nt_sk1lls}`

#### 5.7 Logic Puzzle
- **File:** `puzzle.txt`, `generate.py`
- **Hint:** "The clues are rules, not suggestions. Every rule narrows the answer."
- **Solution:** The file contains a logic puzzle (e.g., Zebra puzzle, Einstein's riddle). Use constraint propagation or a SAT solver to find the solution that spells the flag.
- **Flag:** `CGS{l0g1c_puzzl3s_n33d_p4tt3rns}`

#### 5.8 QR Code Madness
- **File:** `corrupted_qr.png`, `generate.py`
- **Hint:** "QR codes have error correction for a reason."
- **Solution:** The QR code is partially corrupted. Use the QR code's error correction capability or manually repair the damaged modules. Tools like `qrazybox` can help reconstruct.
- **Flag:** `CGS{qr_c0d3_r3c0nstruct10n_sk1lls}`

### Medium

#### 5.9 JWT Jenga
- **File:** `server.js`
- **Hint:** "The signature is only as strong as the person who forgot to check it."
- **Solution:** The JWT verification code has a bypass. Set the algorithm to `none` (case variation) or modify the payload and omit/truncate the signature:
  ```json
  {"alg": "None", "typ": "JWT"}
  ```
- **Flag:** `CGS{n0n3_alg_m34ns_n0_pr00f}`

#### 5.10 Bluetooth Beacon
- **File:** `ble_capture.pcap`
- **Hint:** "Bluetooth devices broadcast all the time. Listen carefully."
- **Solution:** The pcap contains BLE advertisement packets. Use Wireshark (or a BLE parser) to extract advertisement data. The flag is in a manufacturer-specific data field.
- **Flag:** `CGS{blu3t00th_b34c0n_h1dden_d4t4}`

#### 5.11 Python Jail
- **Files:** `jail.py`, `generate.py`
- **Hint:** "Python is full of ways to say the same thing."
- **Solution:** The Python jail blocks keywords like `import`, `os`, `system`, `eval`. Use workarounds:
  - `__builtins__['__imp' + 'ort__']('o' + 's')`
  - `().__class__.__bases__[0].__subclasses__()`
  - Unicode variations, octal escapes, `getattr()`
- **Flag:** `CGS{pyth0n_j41l_3sc4p3_ch4r_byp4ss}`

#### 5.12 Wi-Fi Deauth Analysis
- **File:** `wifi_capture.pcap`, `generate.py`
- **Hint:** "The 802.11 management frames are chatty."
- **Solution:** The pcap contains deauthentication frames. Extract the reason codes from each deauth frame and convert them to characters (ASCII):
  ```bash
  tshark -r wifi_capture.pcap -Y "wlan.fc.type_subtype==12" -T fields -e wlan.reason_code
  ```
- **Flag:** `CGS{d34uth_fr4m3s_t3ll_4_st0ry}`

#### 5.13 Prisoner's Dilemma
- **File:** `server.js`
- **Hint:** "The strategy that wins in the long run is usually the kindest."
- **Solution:** The API simulates iterated PD rounds. Implement the "Tit-for-Tat" strategy (cooperate on first move, then mirror opponent's last move). Accumulate enough points to receive the flag.
- **Flag:** `CGS{1t3r4t3d_pr1s0n3rs_d1l3mm4_s0lv3d}`

---

## Quick Reference: All Flags

### Web
| Challenge | Flag |
|---|---|
| Hidden in Plain Sight | `CGS{h34d3rs_h1d3_th1ngs_t00}` |
| Cookie Jar | `CGS{c00k13s_ar3nt_j5t_f0r_b4k1ng}` |
| View Source | `CGS{m1n1f13d_d03snt_m34n_h1dd3n}` |
| Guest vs Admin | `CGS{r0l3_b4s3d_4cc3ss_1s_just_b3l13f}` |
| Path as a Parameter | `CGS{s4mpl3_4pp_l34ks_f1l3s}` |
| API Rate Limit Race | `CGS{r4c3_th3_l1m1t_y0u_w1n}` |
| SQLi Speakeasy | `CGS{uni0n_s3l3ct_y0ur_w4y_1n}` |
| Path Less Traveled | `CGS{p4th_tr4v3rs4l_1s_a_cl4ss1c}` |
| Blind SQLi | `CGS{bl1nd_1nputs_st1ll_sp34k_l0udly}` |
| NoSQL Injection | `CGS{n0sql_1nj3ct_1s_th3_n3w_sql}` |
| SSTI | `CGS{t3mpl4t3s_d0nt_3sc4p3_3v3ryth1ng}` |
| Open Redirect | `CGS{0p3n_r3d1r3ct_n0t_just_f1sh1ng}` |
| CORS Misconfig | `CGS{c0rs_th1nk1ng_y0u_c4n_r34d}` |
| IDOR | `CGS{d1r3ct_0bj3ct_r3f3r3nc3_byp4ss}` |
| SSRF to the Crown Jewels | `CGS{m3t4d4t4_s3rv1c3s_tru5t_t00_much}` |
| XSS to Admin | `CGS{xss_th3_adm1ns_c00k13_pl34s3}` |
| Prototype Pollution | `CGS{pr0t0typ3_p0llut10n_1s_s3lf_m0d1fy}` |
| JWT Algorithm Confusion | `CGS{jwt_alg_n0n3_byp4ss_l34ds_t0_rce}` |
| CSRF Token Bypass | `CGS{csrf_byp4ss_w1th_c00k13_s3cr3ts}` |
| XXE | `CGS{xxe_st1ll_w0rks_1n_2k24}` |
| Race Condition | `CGS{r4c3_c0nd1t10n_d0ubl3_sp3nd}` |
| Cache Poisoning | `CGS{p01s0n_th3_c4ch3_t0_w1n_th3_g4m3}` |

### Forensics
| Challenge | Flag |
|---|---|
| Metadata Whisper | `CGS{3x1f_kn0ws_wh3r3_y0u_b33n}` |
| Zip of Secrets | `CGS{p4ssw0rd_w4s_1n_th3_w0rdl1st}` |
| Not-a-Virus | `CGS{str1ngs_n0t_just_f0r_b1n4r13s}` |
| Hidden in Plain Text | `CGS{1nv1s1bl3_ch4rs_4r3_v1s1bl3_t00}` |
| Image Dimensions Mismatch | `CGS{1hdr_h1d3s_m0r3_th4n_h31ght}` |
| File Signature Maze | `CGS{m4g1c_byt3s_n3v3r_l13_4b0ut_f1l3s}` |
| Base64 Everywhere | `CGS{l4y3rs_0f_b64_1s_n0t_3ncrypt10n}` |
| Discord Leak | `CGS{d1sc0rd_l34ks_h4pp3n_3v3ry_d4y}` |
| Packet Whodunit | `CGS{tcp_str34ms_r3m3mb3r_3v3ryth1ng}` |
| Steg-anography | `CGS{l0w3st_b1ts_h1d3_th3_m0st}` |
| Document Forensics | `CGS{0l3_0bj3cts_l34k_m0r3_th4n_t3xt}` |
| PDF Puzzle | `CGS{pdf_l4y3rs_c4n_b3_str3am3d}` |
| Registry Analysis | `CGS{r3g1stry_k3ys_c0nt41n_s3cr3ts}` |
| Traffic Analysis | `CGS{c2_tr4ff1c_l00ks_l1k3_n0rm4l_n01s3}` |
| Browser History Exfiltration | `CGS{br0ws3r_h1st0ry_t3lls_3v3ryth1ng}` |
| USB Data Exfiltration | `CGS{ducky_scr1pt_exf1ltrat3s_d4ta}` |
| Memory Lane | `CGS{v0l4t1l1ty_n3v3r_f0rg3ts}` |
| Disk Image Analysis | `CGS{d1sk_1m4g3_rcv3ry_un4ll0c4t3d}` |
| Packet Reconstruction | `CGS{r3c0nstruct1ng_fr4gm3nt3d_f1l3s}` |
| Stego with Deep Learning | `CGS{n3ur4l_st3g0_h1d3s_d33ply}` |
| SQLite WAL Forensics | `CGS{w4l_f1l3s_p3rs1st_4ft3r_d3l3t10n}` |
| Browser Cache Reconstruction | `CGS{c4ch3d_p4g3s_c4n_b3_r3c0v3r3d}` |
| Encrypted Container Analysis | `CGS{v3r4cr1pt_w34k_p4ssw0rd_cr4ck3d}` |
| Cloud Log Forensics | `CGS{cl0udtr41l_l0gs_d0nt_l13_3v3r}` |

### Reverse Engineering
| Challenge | Flag |
|---|---|
| Baby's First Binary | `CGS{str1ngs_d1dnt_l13}` |
| Flag in Functions | `CGS{symb0ls_t3ll_3v3ryth1ng}` |
| Hardcoded Key | `CGS{h4rdc0d3d_k3ys_n3v3r_s3cur3}` |
| Simple XOR Check | `CGS{x0r_ch3cksums_n0t_s3cur3}` |
| Input Echo | `CGS{3ch0_c0nd1t10n4l_0utput}` |
| Return Code | `CGS{3x1t_c0d3s_4r3_m3ss4g3s_t00}` |
| Decompile Me | `CGS{d3c0mp1l3_m3_1m_4n_0p3n_b00k}` |
| Time Check | `CGS{t1m3_ch3cks_d0nt_st0p_r3v3rs3rs}` |
| Loopy Logic | `CGS{k3yg3n_l00ps_4r3nt_5ecr3t}` |
| Flag Checker | `CGS{c0nstr41nts_4r3_r3v3rs1bl3}` |
| Custom VM | `CGS{v1rtu4l_m4ch1n3_byt3c0d3_r3v3rs1ng}` |
| CRC Check | `CGS{crC_1s_f0r_3rr0r_n0t_s3cur1ty}` |
| Anti-Debug | `CGS{ptrac3_ch3ck_n0t_d3bug_pr00f}` |
| Z3 Solver | `CGS{symb0l1c_3x3cut10n_s0lv3s_4ll}` |
| UPX Packed | `CGS{upx_p4ck1ng_1s_tr4nsp4r3nt}` |
| .NET Decompilation | `CGS{n3t_d3c0mp1l4t10n_w1th_1ld4sm}` |
| Obfuscated Onion | `CGS{p33l1ng_l4y3rs_t4k3s_p4t13nc3}` |
| VM Based Obfuscation | `CGS{vm_pr0t3ct10n_n0t_1mp0ss1bl3}` |
| White-Box Crypto | `CGS{wh1t3b0x_a3s_t4bl3s_l34k_k3ys}` |
| Firmware Reversing | `CGS{f1rmw4r3_r3v3rs1ng_0n_4rm}` |
| JNI Reversing | `CGS{jni_n4t1v3_c0d3_r3v34ls_4ll}` |
| Ghost in the Machine | `CGS{s3lf_m0d1fy1ng_c0d3_gh0stly}` |
| Time Travel Debugging | `CGS{t1m3_tr4v3l_d3bugg1ng_w1ns}` |
| Real World CVE Reversal | `CGS{p4tch_d1ff1ng_r3v34ls_vulns}` |

### Crypto
| Challenge | Flag |
|---|---|
| Caesar's Ghost | `CGS{sh1ft_h4pp3ns}` |
| XOR Marks the Spot | `CGS{s1ngl3_byt3_x0r_1s_n0_l0ck}` |
| Base64 Flip | `CGS{b64_d3c0d1ng_1s_n0t_crypt0}` |
| Hex Decode | `CGS{h3x_d3c0d3_n0t_3ncrypt10n}` |
| Vigenère | `CGS{v1g3n3r3_k3y_w4s_t00_sh0rt}` |
| Atbash | `CGS{4tb4sh_c1ph3r_r3v3rs3d}` |
| Morse Code | `CGS{m0rs3_c0d3_b33ps_n0t_music}` |
| Baconian Cipher | `CGS{b4c0n_c1ph3r_b1n4ry_h1dd3n}` |
| RSA's Small Mistake | `CGS{fact0r1ng_sm4ll_pr1m3s_1s_ch34p}` |
| Padding Oracle Lite | `CGS{th3_3rr0r_t0ld_0n_1ts3lf}` |
| Hash Length Extension | `CGS{h4sh_l3ngth_3xt3ns10n_br34ks_md5}` |
| ECB Byte-at-a-Time | `CGS{3cb_byt3_4t_t1m3_0r4cl3}` |
| Diffie-Hellman MITM | `CGS{dh_m1tm_w1th_sm4ll_pr1m3}` |
| Bit Flipping | `CGS{cbc_b1t_fl1pp1ng_t0_4dm1n}` |
| ECB Cut-and-Paste | `CGS{3cb_cut_p4st3_r0l3_3sc4l4t3}` |
| CRC Collision | `CGS{cr32_c0ll1s10ns_4r3_tr1v14l}` |
| Lattice of Lies | `CGS{l4tt1c3_r3duct10n_br34ks_w34k_k3ys}` |
| Fault Attack | `CGS{f4ult_4n4lys1s_r3v34ls_th3_k3y}` |
| Bleichenbacher's Attack | `CGS{bl31ch3nb4ch3r_pkcs15_0r4cl3}` |
| Side-Channel Timing | `CGS{t1m1ng_s1d3_ch4nn3l_byt3_by_byt3}` |
| RSA with Common Factor | `CGS{rs4_c0mm0n_f4ct0r_w34k_n33ds}` |
| ECDSA Nonce Reuse | `CGS{3cds4_n0nc3_r3us3_f4t4l_3rr0r}` |
| RC4 Bias | `CGS{rc4_b14s_s1ngl3_byt3_pr3d1ct4bl3}` |
| Quantum/Post-Quantum Crypto Intro | `CGS{p0st_qu4ntum_w1th_w34k_p4r4ms}` |

### Misc
| Challenge | Flag |
|---|---|
| Console Confessions | `CGS{f12_1s_y0ur_fr13nd}` |
| DNS Exfiltration | `CGS{dns_tunn3l1ng_3xfl1tr4t3s_d4t4}` |
| Pastebin Dump | `CGS{p4st3b1n_dumps_4r3_g0ldm1n3s}` |
| Click the Button | `CGS{cl1ck1ng_4ut0m4t10n_byp4ss3s_gu1}` |
| Emoji Cipher | `CGS{3m0j1_crypt0_1s_n0t_s3cur3}` |
| OSINT - Social Media | `CGS{s0c1al_m3d14_0s1nt_sk1lls}` |
| Logic Puzzle | `CGS{l0g1c_puzzl3s_n33d_p4tt3rns}` |
| QR Code Madness | `CGS{qr_c0d3_r3c0nstruct10n_sk1lls}` |
| JWT Jenga | `CGS{n0n3_alg_m34ns_n0_pr00f}` |
| Bluetooth Beacon | `CGS{blu3t00th_b34c0n_h1dden_d4t4}` |
| Python Jail | `CGS{pyth0n_j41l_3sc4p3_ch4r_byp4ss}` |
| Wi-Fi Deauth Analysis | `CGS{d34uth_fr4m3s_t3ll_4_st0ry}` |
| Prisoner's Dilemma | `CGS{1t3r4t3d_pr1s0n3rs_d1l3mm4_s0lv3d}` |
