# TemanLaunch

TemanLaunch adalah desktop web app untuk mengubah input produk atau brief menjadi bahan launch awal: audience, angle, ad copy, dan landing page draft dalam satu workspace.

Repo ini sedang disiapkan sebagai submission-ready base untuk:
- GitHub repo: `temanlaunch`
- Frontend domain: `temanlaunch.my.id`
- API domain yang direkomendasikan: `api.temanlaunch.my.id`
- Infrastruktur deploy: Render Blueprint via [render.yaml](/Users/Nusaardi/meta-ads-builder/render.yaml)

## Stack

- Frontend: React 19 + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- AI: AWS Bedrock + BYOK provider support
- Scraping: Playwright

## Arsitektur Render

- `temanlaunch-web`: static site untuk UI desktop
- `temanlaunch-api`: Docker web service untuk API dan scraping
- `temanlaunch-db`: Render PostgreSQL

Frontend sekarang bisa menebak API host secara otomatis:
- `temanlaunch.my.id` -> `api.temanlaunch.my.id`
- `temanlaunch-web.onrender.com` -> `temanlaunch-api.onrender.com`

## Local Development

### 1. Start local Postgres

```bash
docker compose -f docker-compose.local.yml up -d
```

### 2. Prepare env files

```bash
cp .env.local.example .env.local
cp server/.env.local.example server/.env.local
```

Recommended local secrets:

```env
JWT_SECRET=temanlaunch-local-jwt-secret
AI_CREDENTIALS_ENCRYPTION_KEY=temanlaunch-local-ai-secret
```

### 3. Start backend

```bash
npm ci --prefix server
npm run dev --prefix server
```

API lokal akan hidup di `http://localhost:3001`.

### 4. Start frontend

```bash
npm ci
npm run dev
```

Frontend lokal akan hidup di `http://localhost:5173`.

## Deploy To Render

1. Push repo ini ke GitHub repo kosong `temanlaunch`.
2. Di Render, buat Blueprint baru dari repo tersebut.
3. Render akan membaca [render.yaml](/Users/Nusaardi/meta-ads-builder/render.yaml) dan membuat `web + api + postgres`.
4. Isi secret yang diminta di dashboard.
5. Hubungkan custom domain:
   - `temanlaunch.my.id` -> `temanlaunch-web`
   - `api.temanlaunch.my.id` -> `temanlaunch-api`

Panduan lebih lengkap ada di [deploy/production.md](/Users/Nusaardi/meta-ads-builder/deploy/production.md).

## Publish To GitHub

Kalau folder ini belum menjadi git repo lokal:

```bash
git init -b main
git remote add origin git@github.com:<github-username>/temanlaunch.git
git add .
git commit -m "Initial TemanLaunch Render blueprint"
git push -u origin main
```

Kalau repo lokal sudah ada, cukup arahkan remote `origin` ke repo `temanlaunch` lalu push branch utama.

## Production Env Notes

Variable inti untuk API production:
- `DATABASE_URL`
- `JWT_SECRET`
- `AI_CREDENTIALS_ENCRYPTION_KEY`
- `CORS_ORIGINS`
- `CORS_ALLOW_RENDER_ORIGINS`

Variable AI server-managed yang opsional:
- `AWS_REGION`
- `MODEL_ID`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

## Current Submission Focus

Scope submission saat ini diarahkan ke:
- Wizard flow
- Editor ringkas / studio
- Campaign pack hasil AI
- Landing page builder

Area operasional lain di luar flow utama sengaja tidak dijadikan fokus deployment submission awal.
