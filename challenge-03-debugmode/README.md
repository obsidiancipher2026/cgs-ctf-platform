# DebugMode — Easy Web Challenge

**Category:** Web | **Difficulty:** Easy | **Points:** 100

## Description

CGS SysMonitor is an internal dashboard used to track system health across the Cyber Guardians infrastructure. An engineer left debug mode enabled before deploying to production. The logs on screen look normal. But not everything shows on screen — and not everything the system says is for your eyes. Or is it?

## How to Deploy

```bash
cd challenge-03-debugmode
vercel --prod
```

## How to Solve

1. Open the page in a browser
2. Open DevTools (`F12`) → **Console** tab
3. Wait ~4 seconds
4. A styled green debug message appears:
   `[DEBUG] Auth subsystem check passed. Session token: CGS{c0ns0l3_l0gs_d0nt_l13_t0_y0u}`

## Flag

```
CGS{c0ns0l3_l0gs_d0nt_l13_t0_y0u}
```

## Misdirection

The page shows a convincing live-scrolling terminal log panel with realistic system messages. Players instinctively stare at the on-screen logs. The flag never appears on screen — it's exclusively output to the browser's DevTools Console with CSS styling after a 4-second delay.

## Hint System

- **50 pt:** Developers leave messages while they code. Where do those messages usually go?
- **100 pt:** Open your browser DevTools and click the Console tab. Then wait a few seconds and watch carefully.
