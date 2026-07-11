# TimeVault — Easy Web Challenge

**Category:** Web | **Difficulty:** Easy | **Points:** 100

## Description

TimeVault is counting down to something classified. The developers were in a rush and pushed their work straight to production. While everyone stares at the ticking clock, the real secret is hidden in how the page is dressed — not in what it does.

## How to Deploy

```bash
cd challenge-02-timevault
vercel --prod
```

## How to Solve

1. Open the page in a browser
2. View page source (`Ctrl+U`) or open DevTools → Elements tab
3. Expand the `<head>` section
4. Find the `<style>` tag
5. Look for `:root {` — the first variable `--vault-key` contains the flag

## Flag

```
CGS{css_v4r1abl3s_4r3_m0r3_th4n_c0l0rs}
```

## Misdirection

The JavaScript countdown timer is deliberately obfuscated with single-letter variable names, bitwise operations, and unnecessary nesting — tricking players into wasting time reverse-engineering it. The timer is entirely innocent. The flag is hidden in plain sight in the CSS.

## Hint System

- **50 pt:** The secret isn't in the JavaScript. Look at how the page is styled.
- **100 pt:** CSS supports custom properties — variables defined at :root. Developers sometimes store things there out of habit. Check the `<style>` tag in the page `<head>`.
