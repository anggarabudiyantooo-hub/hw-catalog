# HW Catalog — Galeri Ayam Bangkok

> **Status: produksi.** Aplikasi web etalase satu kandang untuk menampilkan ayam
> Bangkok milik **Pemilik Demo** (Pedan, Kab. Klaten, Jawa Tengah) sekaligus sarana
> penjualan. Ter-deploy di Vercel dengan PostgreSQL (Neon) + Vercel Blob.

**HW Catalog** adalah katalog digital yang layak & berkelas (bukan marketplace):
kartu ayam informatif dengan galeri foto, usia otomatis dari tanggal menetas,
rekap riwayat laga, kontak WhatsApp langsung ke pemilik, dan panel CRUD sederhana
untuk satu pengelola. Semua foto unggahan otomatis diberi **tanda air logo HW**
(pola diagonal zigzag, transparan, tidak mengganggu).

## Fitur

**Publik**
- Beranda: hero, ayam unggulan, kategori, kutipan pemilik, lokasi & syarat kunjungan (wajib reservasi).
- Katalog: penyaringan & urutan **instan di browser** (tanpa reload), URL tersinkron.
- Detail ayam: galeri + perbesar, spesifikasi (postur, tinggi, kaki & sisik, jalu), rekap + riwayat laga, keunggulan, harga/status, "Hubungi" WhatsApp, tombol "Laporkan".
- Peta lokasi & alamat lengkap di footer seluruh halaman.

**Panel pemilik (`/panel`)**
- Login pemilik tunggal (cookie + fallback token `?s=` di URL bila cookie tidak tersedia).
- CRUD ayam + kategori, status jual (Terjual → foto otomatis hitam-putih), arsip/hapus.
- Galeri multi-foto dengan **pratinjau langsung sebelum diunggah** (validasi tipe & 5 MB, label BARU/DITOLAK).
- Riwayat tarung (menang/kalah/seri, rekap otomatis), laporan pengunjung, log aktivitas.
- Aturan publikasi: wajib ada foto Full badan · Kepala · Kaki.

**Teknis**
- Halaman publik memakai **ISR/SSG** (cache CDN) + pembersihan cache otomatis (`revalidatePath`) saat data diubah lewat panel → klik antar halaman cepat.
- Watermark logo (PNG transparan) ditulis oleh `sharp` pada setiap foto baru.
- Upload disimpan ke **Vercel Blob** di produksi; fallback `public/uploads` untuk dev lokal.

## Stack

| Aspek | Pilihan |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Database | PostgreSQL via Prisma ORM (dev/SQLite dulu → kini PostgreSQL, migrasi di `app/prisma/migrations/`) |
| Penyimpanan foto | Vercel Blob (produksi) / `public/uploads` (lokal) |
| Login | `bcryptjs` + sesi cookie, fallback token URL |
| Watermark | `sharp` (logo transparan, pola diagonal acak-diperbarui) |
| Deploy | Vercel (lihat [`DEPLOY.md`](DEPLOY.md)) |

## Struktur

```
ayam-bangkok-studio/
├── app/                  # Aplikasi Next.js (root direktori di Vercel = "app")
│   ├── app/              #   route App Router (publik + /panel)
│   ├── components/       #   komponen React
│   ├── lib/              #   config, prisma, auth, upload, watermark, format
│   ├── prisma/           #   schema + migrasi + seed (6 ayam contoh)
│   ├── public/brand/     #   logo emblem & favicon
│   └── public/uploads/seed/  # foto demo (aset statis)
├── docs/                 # PRD & ERD (kontrak desain awal — lihat catatan)
├── design/               # sistem desain & mockup HTML awal
├── DEPLOY.md             # panduan deploy GitHub + Vercel + Neon + Blob
└── README.md
```

> Dokumen `docs/` dan `design/` adalah artefak **fase desain** (nama produk lama
> "Jalu", basis data awal MySQL 8). Implementasi kini berjalan dengan **HW Catalog**
> + Prisma/PostgreSQL — dokumen tersebut tetap disimpan sebagai riwayat desain.

## Menjalankan Lokal

```bash
cd app
npm install                      # menjalankan prisma generate (postinstall)
cp .env.example .env             # isi DATABASE_URL + SESSION_SECRET
# pastikan PostgreSQL tersedia, lalu:
npx prisma migrate deploy        # terapkan migrasi
npm run db:seed                  # akun admin + 6 ayam contoh
npm run dev                      # http://localhost:3000
```

- Akun panel hasil seed: **`admin@jalu.id` / `jalu1234`** — segera ganti di produksi.
- Tanpa `BLOB_READ_WRITE_TOKEN`, unggahan disimpan ke `public/uploads` (dev lokal).

## Build & Uji

```bash
cd app
DATABASE_URL="postgresql://…" npm run build   # publik di-prerender (butuh DB)
npm start                                     # atau next start
```

## Deploy

Panduan lengkap (Neon, Vercel, Blob, migrasi+seed, pemecahan `DEPLOYMENT_BLOCKED`)
ada di **[`DEPLOY.md`](DEPLOY.md)**.

## Dokumentasi lain

- 📄 PRD → [`docs/PRD.md`](docs/PRD.md)
- 🗂️ ERD → [`docs/ERD.md`](docs/ERD.md) · diagram → [`docs/diagrams/erd.svg`](docs/diagrams/erd.svg)
- 🎨 Sistem desain → [`design/DESIGN.md`](design/DESIGN.md)

---
© HW Catalog · Pedan, Klaten. Kontak: +62 800-0000-0000 (WhatsApp) · kunjungan wajib reservasi.
