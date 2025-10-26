Release: 1.0.0 (Stable Candidate)
Date: 2025-10-26

Highlights:
- Fix production API routing: axios baseURL now strictly uses http(s) VITE_API_BASE; otherwise defaults to Railway backend in production (https://backend-production-559d.up.railway.app/api) and /api in dev.
- Remove vite define injection for process.env.VITE_API_BASE to avoid accidental '/api' in production.
- Add docs/404.html as SPA fallback for GitHub Pages deep links (/Usstork/... no longer 404).
- Rebuilt frontend to docs/ with hashed assets.

Verification:
- Local preview http://localhost:5173/Usstork/ shows login/register working.
- DevTools Network confirms POSTs go to Railway backend, not github.io.
- Direct access to /Usstork/register works due to 404.html fallback.

Deployment:
- Publish docs/ to GitHub Pages (branch: default, folder: docs).
- If GitHub Pages shows old assets, use incognito or force redeploy.

Notes:
- To override backend endpoint in a future build, set VITE_API_BASE to a full http(s) URL. Relative paths like '/api' are ignored in production.