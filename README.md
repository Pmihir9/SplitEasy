# SplitEase — React Version

A full-featured Splitwise clone built with React 18, Vite, React Router, and Supabase.
## Tech Stack

| Layer        | Tech                          |
|-------------|-------------------------------|
| Frontend     | React 18 + Vite               |
| Routing      | React Router v6               |
| Icons        | Lucide React                  |
| Auth + DB    | Supabase (free tier)          |
| Styling      | Plain CSS (no Tailwind needed)|

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
Setting Up Supabase (free)
1. Go to [supabase.com](https://supabase.com) 
2. Create a new project
3. Go to SQL Editor → New query
4. Paste the full contents of `supabase/migrations/001_schema.sql` → **Run**
5. Go to **Settings** → **API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

**Deployment Options**
Netlify (easiest)
```bash
npm install -g netlify-cli
netlify login
netlify deploy --build --prod

# Set env vars in Netlify dashboard:
# Site settings → Environment variables → Add:
# VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```
Or drag the `dist` folder to [app.netlify.com/drop](https://app.netlify.com/drop) after running `npm run build`.

### GitHub Pages
1. Push repo to GitHub
2. Add repository secrets: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Go to Settings → Pages → Source: **GitHub Actions**
4. Push to `main` — auto-deploys via `.github/workflows/deploy.yml`


 Features
- Email/password auth via Supabase Auth
  -Demo mode — works with no backend
  -Add expenses with equal, percent, or exact splits
- Groups (Apartment, Trip, Work, Event…)
  -Friends with per-person balance tracking
-Settle up with smart payment suggestions
- Full activity feed
- Mobile responsive
- React Router for proper URL navigation
  -Global state via useReducer + Context API

