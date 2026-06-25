# NovaSec Portal

**Category:** Web | **Difficulty:** Easy | **Points:** 100

## Concept
A polished corporate website for NovaSec Labs. The flag is hidden in a custom HTTP response header called `X-NovaSec-Secret`. A "Source Transparency" section misdirects players into searching the HTML source.

## Deployment
```bash
npm install
npm run dev     # local testing
vercel --prod   # deploy
```

## Solution
1. Open DevTools → Network tab
2. Reload page
3. Click the document request
4. Scroll to Response Headers
5. Find `X-NovaSec-Secret`
