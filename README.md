# ResumeIQ AI

An AI-powered, local-first resume analyzer built with Next.js 15, React 19, and TypeScript. Score your resume against an ATS, match it to any job description, and get actionable suggestions — all in your browser.

## Tech Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** strict mode
- **TailwindCSS** with custom design tokens
- **shadcn/ui-style** primitives (Button, Card, Badge, Tabs, Progress, Skeleton)
- **Framer Motion** for subtle, premium animations
- **Zustand** + `persist` middleware for client state and `localStorage` rehydration
- **PDF.js** + **Mammoth** for local PDF/DOCX parsing
- **next-themes** for dark / light / system theme
- **Sonner** for toast notifications

## Project Structure

```
app/
  layout.tsx              # root layout (fonts, providers, metadata)
  page.tsx                # Landing page
  providers.tsx           # theme + toaster
  globals.css             # design tokens, glassmorphism, gradient utilities
  analyzer/page.tsx       # Resume Analyzer (split panels, demo loader)
  not-found.tsx           # 404
  loading.tsx             # global loading UI
  icon.svg                # favicon (auto-served by Next.js)
  apple-icon.svg          # Apple touch icon
  sitemap.ts              # SEO sitemap

components/
  ui/                     # button, card, badge, progress, skeleton, tabs, input, theme-toggle, charts
  landing/                # hero, features, how-it-works, faq, cta
  navbar.tsx, footer.tsx, logo.tsx, saved-indicator.tsx

features/
  upload/                 # ResumeDropzone, ResumePreview
  jd/                     # JdPanel
  score/                  # ScorePanel (animated circular progress)
  keywords/               # KeywordPanel (matched / missing / recommended)
  analytics/              # AnalyticsPanel (radar + bar chart)
  snapshot/               # ResumeSnapshotCard (parsed basics)
  suggestions/            # SuggestionsList (grouped by severity)
  rewrite/                # BulletRewriterDialog (rule-based rewriter)

hooks/
  use-app-store.ts        # Zustand store (with localStorage persistence)
  use-mounted.ts

lib/
  utils.ts                # cn(), formatNumber, clamp
  demo-resume.ts          # bundled sample resume + JD for ?demo=1
  parse/                  # extract-text (PDF.js + Mammoth), parse-resume
  score/                  # ats-score, jd-match, suggestions, rewriter
  report/                 # build-report (Markdown export)

types/
  resume.ts               # ParsedResume, AtsResult, JdMatchResult, Suggestion, etc.
```

## Scripts

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm start
```

## Deployment (Vercel)

This is a Vercel-first project — zero config needed, but a few niceties are wired in:

### One-click deploy

1. Push the repo to GitHub.
2. Import it in Vercel — the framework (`Next.js`) is auto-detected.
3. Hit **Deploy**. No environment variables required — everything runs locally in the browser.

### Vercel CLI

```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

### Environment variables (optional)

| Var | Default | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://resumeiq.ai` | Used by `sitemap.ts` and OpenGraph `metadataBase`. Set this once you have a custom domain. |

### What's pre-configured

- **`vercel.json`** — security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) and `Cache-Control: immutable` for `/_next/static/*` and image/font assets.
- **`next.config.mjs`** — `compress: true`, `productionBrowserSourceMaps: false`, `poweredByHeader: false`, plus `optimizePackageImports` for `framer-motion` and `lucide-react` (smaller First Load JS).
- **`public/robots.txt`** — disallows `/analyzer` (tool page, not content), points to the sitemap.
- **`app/sitemap.ts`** — auto-generated `sitemap.xml` from the public site URL.
- **`app/icon.svg` / `app/apple-icon.svg`** — branded favicons, auto-served by the App Router.

### Verifying a deploy

After the first deploy:

```bash
curl -I https://<your-domain>/         # 200 OK
curl -I https://<your-domain>/analyzer  # 200 OK
curl https://<your-domain>/robots.txt  # see disallow rules
curl https://<your-domain>/sitemap.xml # one <urlset> entry
```

Open the page and confirm:

- Browser tab shows the gradient `R` mark (favicon).
- Theme toggle switches dark ↔ light without flash.
- `/analyzer?demo=1` populates the full report instantly.
- Upload a real PDF/DOCX — score, categories, JD match, keywords, suggestions, and snapshot all appear.
- Reload the analyzer — your last report is restored from `localStorage`.

## Design Direction

Inspired by Linear, Stripe, Framer, and Raycast. Dark & light mode, large
typography, gradient accents, glassmorphism cards, smooth motion, rounded
components, premium spacing.
