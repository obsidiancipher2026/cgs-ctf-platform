# TimeVault

**Category:** Web | **Difficulty:** Easy | **Points:** 100

## Concept
A classified countdown page with an animated starfield. The flag is hidden as a CSS custom property (`--vault-key`) in the `:root` style block.

## Deployment
```bash
vercel --prod
```

## Solution
1. View page source (Ctrl+U) or DevTools → Elements
2. Expand `<head>` → find `<style>` block
3. Look at `:root` — the first CSS variable `--vault-key` contains the flag
