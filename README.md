# SplitEase — React Version

A full-featured Splitwise clone built with React 18, Vite, React Router, and Supabase.

---

## Tech Stack

| Layer        | Tech                          |
|-------------|-------------------------------|
| Frontend     | React 18 + Vite               |
| Routing      | React Router v6               |
| Icons        | Lucide React                  |
| Auth + DB    | Supabase (free tier)          |
| Styling      | Plain CSS (no Tailwind needed)|
| Fonts        | Syne + DM Sans (Google Fonts) |

---

## Project Structure

```
splitease-react/
├── src/
│   ├── main.jsx                  # Entry point
│   ├── App.jsx                   # Root: auth guard + routes
│   ├── index.css                 # All global styles
│   ├── lib/
│   │   └── supabase.js           # Supabase client + helpers
│   ├── context/
│   │   └── AppContext.jsx        # Global state (useReducer)
│   ├── pages/
│   │   ├── AuthPage.jsx          # Login / Sign up
│   │   ├── AppShell.jsx          # Nav + modal orchestration
│   │   ├── Dashboard.jsx         # Balances + recent expenses
│   │   ├── Groups.jsx            # Groups grid
│   │   ├── Friends.jsx           # Friends list
│   │   └── Activity.jsx          # Full activity feed
│   └── components/
│       ├── ExpenseModal.jsx      # Add expense (equal/percent/exact split)
│       └── SettleModal.jsx       # Settle up + Group + Friend + Toast modals
├── supabase/
│   └── migrations/
│       └── 001_schema.sql        # Run this in Supabase SQL Editor
├── index.html
├── vite.config.js
├── package.json
├── .env.example                  # Copy to .env.local with your keys
├── netlify.toml
├── vercel.json
└── .github/workflows/deploy.yml
```

---

## Quick Start (local dev)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key

# 3. Run the database schema
# Go to supabase.com → your project → SQL Editor
# Paste and run: supabase/migrations/001_schema.sql

# 4. Start dev server
npm run dev
# App runs at http://localhost:3000

# 5. Build for production
npm run build
# Output in /dist — deploy this folder
```

---

## Setting Up Supabase (free)

1. Go to [supabase.com](https://supabase.com) → **Start your project**
2. Create a new project (pick a region near you)
3. Go to **SQL Editor** → **New query**
4. Paste the full contents of `supabase/migrations/001_schema.sql` → **Run**
5. Go to **Settings** → **API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

## Deployment Options

### Netlify (recommended — easiest)
```bash
npm install -g netlify-cli
netlify login
netlify deploy --build --prod

# Set env vars in Netlify dashboard:
# Site settings → Environment variables → Add:
# VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```
Or drag the `dist` folder to [app.netlify.com/drop](https://app.netlify.com/drop) after running `npm run build`.

### Vercel
```bash
npm install -g vercel
vercel
# Follow prompts — Vite is auto-detected
# Set env vars in Vercel dashboard → Settings → Environment Variables
```

### GitHub Pages
1. Push repo to GitHub
2. Add repository secrets: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Go to Settings → Pages → Source: **GitHub Actions**
4. Push to `main` — auto-deploys via `.github/workflows/deploy.yml`

### Cloudflare Pages
```bash
npm run build
npx wrangler pages deploy dist --project-name splitease
```
Set env vars in Cloudflare dashboard → Pages → your project → Settings → Environment variables.

### Self-hosted / Docker
```bash
npm run build

# Option A: serve locally
npx serve dist

# Option B: Docker
docker run -p 80:80 -v $(pwd)/dist:/usr/share/nginx/html nginx

# Option C: copy dist/ to any nginx/Apache /var/www/html
```

---

## Features

- ✅ Email/password auth via Supabase Auth
- ✅ Demo mode — works with no backend
- ✅ Add expenses with equal, percent, or exact splits
- ✅ Groups (Apartment, Trip, Work, Event…)
- ✅ Friends with per-person balance tracking
- ✅ Settle up with smart payment suggestions
- ✅ Full activity feed
- ✅ Dark mode (auto via prefers-color-scheme)
- ✅ Mobile responsive
- ✅ React Router for proper URL navigation
- ✅ Global state via useReducer + Context API

---

## Key Architecture Decisions

**Why Context + useReducer instead of Redux?**
The app state is simple enough that Redux would be overkill. `useReducer` gives you the same predictable state transitions without the boilerplate.

**Why plain CSS instead of Tailwind?**
Single `index.css` with CSS variables is easier to hand off and modify. No build-time Tailwind config needed.

**Why Vite instead of Create React App?**
Vite is dramatically faster for dev (instant HMR) and produces smaller production bundles.

**Demo mode:**
If no Supabase keys are set, the app runs entirely in memory with seeded data. This makes it trivially easy to demo without any backend setup.

---

## Extending the App

| Feature              | How to add                                              |
|----------------------|---------------------------------------------------------|
| Email friend invites | Supabase Edge Function + Resend API                     |
| Real-time updates    | `supabase.channel().on('postgres_changes', ...)` hook   |
| Export to CSV        | `Papa.unparse(state.expenses)` + download link          |
| Multi-currency       | Add `currency` column + exchange rate API               |
| Recurring expenses   | Add `recurrence` field + pg_cron scheduled function     |
| Push notifications   | Supabase + web-push or Expo (for mobile)                |
| PWA / offline        | Add vite-plugin-pwa                                     |

---

## License

MIT
