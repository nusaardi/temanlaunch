# Demo Checklist

Checklist ini dibuat supaya presentasi `TemanLaunch` tetap aman walau kondisi backend atau koneksi tidak ideal.

## H-1

- Jalankan `npm run submission:check`.
- Jalankan `npm run demo:preflight -- --web https://temanlaunch.my.id --api https://api.temanlaunch.my.id`.
- Pastikan login normal masih bekerja jika kamu memang ingin demo live.
- Pastikan tombol `Buka Demo Workspace` muncul di layar login.
- Pastikan sample project `TemanLaunch Sprint Demo` masih memuat audience, angle, copy, landing page, dan usage sample.
- Siapkan satu browser/tab untuk flow live dan satu tab cadangan untuk demo mode.

## H-0

- Tutup tab yang tidak dipakai.
- Login sekali ke akun real jika ingin menunjukkan flow backend live.
- Buka tab kedua di halaman login untuk fallback cepat ke `Buka Demo Workspace`.
- Pastikan domain yang akan dipresentasikan sudah benar.
- Nonaktifkan notifikasi desktop yang tidak perlu.
- Siapkan satu brief contoh dan satu URL contoh.

## Urutan Aman Saat Demo

1. Mulai dari login screen dan sebutkan bahwa ada `Demo Workspace` sebagai fallback aman.
2. Jika backend sehat, masuk dengan akun real dan tunjukkan flow singkat.
3. Jika ada delay auth, scrape, atau AI, kembali ke login lalu buka `Demo Workspace`.
4. Lanjutkan presentasi dari launch pack, editor ringkas, dan landing page tanpa menjelaskan gangguan teknis terlalu lama.

## Jika Ada Masalah

- Jika auth gagal: kembali ke login dan klik `Buka Demo Workspace`.
- Jika API lambat: pindah ke sample launch pack dan fokus ke output, bukan proses generate live.
- Jika DB error: jangan buka modal project; tetap di flow demo mode.
- Jika AI timeout: jelaskan bahwa flow live memakai endpoint yang sama, lalu pindah ke hasil preset.

## Titik Demo Yang Harus Tetap Terlihat Bagus

- Header `TemanLaunch` dan badge `Demo Mode`.
- Wizard dengan tiga langkah yang jelas.
- Launch pack berisi audience utama, sudut pesan, dan draft utama.
- Editor ringkas yang memperlihatkan bahwa semua bahan ada dalam satu desktop workflow.
- Landing page preview yang sinkron dengan brief dan offer.
