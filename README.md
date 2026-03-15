# TemanLaunch

TemanLaunch adalah desktop web app untuk mengubah input produk atau brief menjadi bahan launch awal: audience, angle, ad copy, dan landing page draft dalam satu workspace.

Produk ini diposisikan sebagai `desktop launch workspace` untuk founder, operator campaign, dan tim kecil yang ingin bergerak cepat tanpa memecah konteks campaign ke banyak tools.

## Submission Snapshot

- Positioning: desktop-first launch desk
- Flow utama: `brief / landing page -> audience -> angle -> ad copy -> landing page awal`
- Safety net: `Demo Workspace` yang bisa dibuka dari login saat auth, DB, atau AI sedang bermasalah
- Repo utama: `temanlaunch`
- Frontend domain target: `temanlaunch.my.id`
- API domain yang direkomendasikan: `api.temanlaunch.my.id`

## What Judges Should See

- Wizard flow yang cepat dipahami
- Launch pack yang langsung berisi output awal
- Editor ringkas yang mempertahankan semua konteks campaign
- Landing page builder yang sinkron dengan brief
- Demo mode aman sebagai fallback presentasi

## Core Scripts

- `npm run build`
- `npm run lint:submission`
- `npm run submission:check`
- `npm run demo:preflight -- --web https://temanlaunch.my.id --api https://api.temanlaunch.my.id`

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

## Demo Mode

Kalau backend atau auth sedang tidak sehat, buka aplikasi lalu klik `Buka Demo Workspace` dari layar login.

Demo mode akan memuat sample project yang sudah berisi:

- analysis produk
- audience prioritas
- sudut pesan awal
- draft copy
- landing page awal
- sample usage summary

Mode ini tidak menyimpan perubahan ke server dan memang dibuat untuk jalur presentasi yang aman.

## Deploy To Render

1. Push repo ini ke GitHub repo kosong `temanlaunch`.
2. Di Render, buat Blueprint baru dari repo tersebut.
3. Render akan membaca [render.yaml](/Users/Nusaardi/meta-ads-builder/render.yaml) dan membuat `web + api + postgres`.
4. Isi secret yang diminta di dashboard.
5. Hubungkan custom domain:
   - `temanlaunch.my.id` -> `temanlaunch-web`
   - `api.temanlaunch.my.id` -> `temanlaunch-api`

Panduan lebih lengkap ada di [deploy/production.md](/Users/Nusaardi/meta-ads-builder/deploy/production.md).

## Production Checks

API sudah menyediakan health check di `/api/health`.

Preflight yang direkomendasikan sebelum demo:

```bash
npm run submission:check
npm run demo:preflight -- --web https://temanlaunch.my.id --api https://api.temanlaunch.my.id
```

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

## Submission Docs

- Presentation kit: [docs/competition-kit.md](/Users/Nusaardi/meta-ads-builder/docs/competition-kit.md)
- Demo checklist: [docs/demo-checklist.md](/Users/Nusaardi/meta-ads-builder/docs/demo-checklist.md)

## Current Submission Focus

Scope submission saat ini diarahkan ke:

- Wizard flow
- Editor ringkas / studio
- Launch pack hasil AI
- Landing page builder

Area operasional lain di luar flow utama sengaja tidak dijadikan fokus deployment submission awal.
