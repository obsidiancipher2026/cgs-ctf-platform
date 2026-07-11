# NovaSec Portal — Easy Web Challenge

**Category:** Web | **Difficulty:** Easy | **Points:** 100

## Description

NovaSec Labs just launched their shiny new company portal. Their security team is confident there's nothing interesting here — "just a clean page," they said. But web servers talk in more ways than one. Sometimes the most important message isn't what gets displayed on screen.

## How to Deploy

```bash
cd challenge-01-novasec-portal
npm install
npm run dev      # local dev on http://localhost:3000
vercel --prod    # deploy to Vercel
```

## How to Solve

1. Open the page in a browser
2. Open DevTools (`F12`) → **Network** tab
3. Reload the page
4. Click the document request (the first request, usually the page URL)
5. Scroll down to **Response Headers**
6. Find: `X-NovaSec-Secret: CGS{h3ad3rs_sp34k_l0ud3r_th4n_p4g3s}`

## Flag

```
CGS{h3ad3rs_sp34k_l0ud3r_th4n_p4g3s}
```

## Misdirection

The "Source Transparency" section shows fake, flag-free HTML source code to trick players into thinking the flag is visible in the page source. A nudge comment (`<!-- Our servers know things this page never will. -->`) hints that HTTP headers carry the secret.

## Hint System

- **50 pt:** Web servers communicate using more than just HTML.
- **100 pt:** Open DevTools → Network tab → Reload → Look at Response Headers of the main document.
