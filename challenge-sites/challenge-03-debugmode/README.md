# DebugMode

**Category:** Web | **Difficulty:** Easy | **Points:** 100

## Concept
A fake system monitoring dashboard with scrolling logs and animated gauges. After 4 seconds, a styled `console.log` fires in the browser DevTools Console containing the flag — disguised as a debug auth check.

## Deployment
```bash
vercel --prod
```

## Solution
1. Open DevTools → Console tab
2. Wait ~4 seconds
3. A styled green debug message appears with the flag
