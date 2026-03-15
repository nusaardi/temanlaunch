# TemanLaunch Production Rollout

Dokumen ini menggantikan rollout VPS lama. Target deployment utama sekarang adalah Render dengan 3 resource:

- `temanlaunch-web`
- `temanlaunch-api`
- `temanlaunch-db`

## 1. Push Ke GitHub

Repo submission yang dituju: `temanlaunch`

Kalau folder ini belum menjadi repo git:

```bash
git init -b main
git remote add origin git@github.com:<github-username>/temanlaunch.git
git add .
git commit -m "Initial TemanLaunch Render blueprint"
git push -u origin main
```

## 2. Create Blueprint Di Render

1. Login ke Render.
2. Pilih `New +` -> `Blueprint`.
3. Hubungkan repo GitHub `temanlaunch`.
4. Pastikan Render membaca file [render.yaml](/Users/Nusaardi/meta-ads-builder/render.yaml).

## 3. Isi Production Secrets

Wajib:

- `JWT_SECRET`
- `AI_CREDENTIALS_ENCRYPTION_KEY`

Database tidak perlu diisi manual jika deploy lewat Blueprint karena `DATABASE_URL` berasal dari Render PostgreSQL.

Opsional untuk server-managed AI:

- `AWS_REGION`
- `MODEL_ID`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

## 4. Pasang Domain

Pasang custom domain berikut:

- Frontend: `temanlaunch.my.id`
- API: `api.temanlaunch.my.id`

App frontend sudah punya fallback host resolution:

- `temanlaunch.my.id` -> `api.temanlaunch.my.id`
- `temanlaunch-web.onrender.com` -> `temanlaunch-api.onrender.com`

Backend juga bisa menerima origin Render bila `CORS_ALLOW_RENDER_ORIGINS=true`.

## 5. Smoke Checks

Setelah semua service selesai deploy:

```bash
curl https://temanlaunch-api.onrender.com/api/health
curl -I https://temanlaunch-web.onrender.com
```

Kalau custom domain sudah aktif:

```bash
curl https://api.temanlaunch.my.id/api/health
curl -I https://temanlaunch.my.id
```

## 6. Demo Safety

Sebelum submission live:

- pastikan frontend bisa dibuka dari domain Render maupun custom domain
- cek login/dev session flow
- cek save project
- cek landing page builder
- cek satu flow generate yang benar-benar akan dipakai saat demo

Untuk flow URL scrape, tetap lakukan verifikasi khusus di Render karena fitur ini bergantung pada Playwright.
