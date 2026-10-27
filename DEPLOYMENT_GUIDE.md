# Deployment Guide — Netlify (Frontend) + Vercel (Backend)

Order matters: **Backend → Frontend → update CORS**.

Project layout (single repo):
```
diary-frontend/        <- Netlify (root)
├── netlify.toml
├── src/ ...
└── backend/           <- Vercel (Root Directory = backend)
    ├── api/index.js   (serverless entry)
    ├── vercel.json
    └── src/ ...
```

## 0. Prerequisites
- Code pushed to GitHub: https://github.com/MuhammadEhtisham60/my-dear-diary.git
  (never commit `.env` files — check `git status` before committing).

  ```bash
  # run in the diary-frontend folder
  git init
  git add .
  git commit -m "Initial commit"
  git branch -M main
  git remote add origin https://github.com/MuhammadEhtisham60/my-dear-diary.git
  git push -u origin main
  ```
  Use this same repo for both Vercel (Root Directory `backend`) and Netlify.
- MongoDB Atlas cluster. In Atlas → **Network Access** → add `0.0.0.0/0`
  (Vercel uses dynamic IPs).
- Generate a JWT secret:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## 1. Deploy Backend on Vercel
1. [vercel.com](https://vercel.com) → **Add New → Project** → import your repo.
2. **Root Directory**: `backend`
3. Framework Preset: **Other**. Leave build/output settings empty.
4. **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | your Atlas connection string (real password) |
   | `MONGODB_DB_NAME` | `chronicle_diary` |
   | `JWT_SECRET` | long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `FRONTEND_URL` | `http://localhost:5173` (temporary, updated in step 3) |

5. Click **Deploy**.
6. Test: open `https://<your-backend>.vercel.app/api/health` → `{"status":"ok"}`.

Or with CLI:
```bash
cd backend
npm i -g vercel
vercel --prod
```

## 2. Deploy Frontend on Netlify
1. [netlify.com](https://netlify.com) → **Add new site → Import from Git** → pick repo.
2. Settings (auto-read from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: *(empty)*
3. **Environment variables**:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://<your-backend>.vercel.app/api` |

4. **Deploy site**. Note your URL, e.g. `https://my-diary.netlify.app`.

> `VITE_*` variables are baked in at build time. After changing one,
> trigger **Deploys → Clear cache and deploy site**.

## 3. Connect them (CORS)
In Vercel → backend project → **Settings → Environment Variables**, set:
```
FRONTEND_URL=https://my-diary.netlify.app
```
(No trailing slash. Multiple origins can be comma-separated, e.g. add
`http://localhost:5173` for local dev.)
Then **Deployments → ⋯ → Redeploy**.

## 4. Verify
- Open the Netlify URL, register/login, create an entry.
- Refresh on a sub-route — should not 404 (handled by `netlify.toml`).
- DevTools → Network: requests go to `*.vercel.app/api/...` with 2xx status.

## Troubleshooting
| Problem | Fix |
|---------|-----|
| CORS error | `FRONTEND_URL` must match the Netlify origin exactly; redeploy backend |
| Requests hit `localhost:5000` | `VITE_API_URL` not set on Netlify; redeploy with cache cleared |
| 500 "Database connection failed" | Check `MONGODB_URI`/password and Atlas IP allowlist `0.0.0.0/0` |
| 404 on page refresh | Ensure `netlify.toml` is in repo root |
| Cold-start slowness | Normal on Vercel free tier; first request after idle is slower |
| Rate limiter behaves oddly | In-memory limits aren't shared across serverless instances |

## Local development (unchanged)
```bash
# backend
cd backend && npm install && npm run dev
# frontend
npm install && npm run dev
```
`.env` (frontend): `VITE_API_URL=http://localhost:5000/api`
