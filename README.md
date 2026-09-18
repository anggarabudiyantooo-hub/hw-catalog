# HW Catalog — Galeri Ayam Bangkok

> **Status: template/demonstrator.** Aplikasi web etalase satu kandang untuk
> menampilkan ayam Bangkok beserta sarana penjualan. Deploy ke Vercel dengan
> PostgreSQL (Neon) + Vercel Blob.
>
> 🔒 **Data dummy:** seluruh **nama pemilik, nomor WhatsApp, dan email** di
> repo ini adalah **contoh (dummy)** — termasuk nilai bawaan di kode, skema,
> migrasi, seed, dan dokumen. Data asli milik kandang **tidak disimpan di
> repo**: produksi membacanya dari database (tabel `SiteSetting`) yang diisi
> lewat **Panel → Kontak & Info Situs**. Riwayat git juga sudah dibersihkan
> dari data pribadi sehingga repo aman dibagikan.

**HW Catalog** adalah katalog digital yang layak & berkelas (bukan marketplace):
kartu ayam informatif dengan galeri foto, usia otomatis dari tanggal menetas,
rekap riwayat laga, kontak WhatsApp langsung ke pemilik, dan panel CRUD untuk
pengelola. Semua foto unggahan otomatis **dikompresi ke WebP** dan diberi
**tanda air logo** tunggal (±20% sisi pendek, opasitas 0.05 — halus).

## Fitur

**Publik**
- **Papan pengumuman** (dikelola panel, modular): jenis **Peringatan** tampil
  sebagai jendela di tengah layar (gaya dialog Windows: judul merah + pesan +
  tombol OK, muncul setiap kali halaman dimuat); jenis **Iklan/Promo** dan
  **Info** tampil sebagai pita di atas halaman (sekali tutup per sesi).
- Beranda: hero, ayam unggulan, kategori, kutipan pemilik, lokasi & syarat
  kunjungan (wajib reservasi).
- Katalog: penyaringan & urutan **instan di browser** (tanpa reload), URL tersinkron.
- Detail ayam: galeri + perbesar, spesifikasi (postur, tinggi, kaki & sisik,
  jalu), rekap + riwayat laga, keunggulan, harga/status, "Hubungi" WhatsApp,
  tombol "Laporkan", form minat.
- Footer simetris **rasio emas** full-bleed di seluruh halaman; kontak & lokasi
  diambil dari satu sumber data (panel).

**Panel pengelola (`/panel`)**
- **Peran**: `PEMILIK` (semua akses) & `ADMIN` (hanya modul yang diizinkan:
  ayam, kategori, riwayat, permintaan, laporan, log).
- **Kontak & Info Situs** *(pemilik)*: satu-satunya sumber data kontak — nama
  pemilik, nomor & tampilan WA, email, media sosial, alamat, tautan Google
  Maps, jam layanan, catatan kunjungan. Ubah di sini → seluruh halaman publik
  ikut berubah (tanpa sentuh kode).
- **Papan Pengumuman** *(pemilik)*: tambah/ubah/hapus papan, aktif/nonaktif
  satu klik, titik kedap-kedip on/off, urutan.
- CRUD ayam + kategori, status jual (Terjual → foto otomatis hitam-putih),
  arsip/hapus; aturan publikasi: wajib foto Full badan · Kepala · Kaki.
- Galeri multi-foto dengan **pratinjau langsung** (validasi tipe & ukuran);
  unggahan otomatis **WebP + watermark**; avatar pengguna juga WebP otomatis.
- Riwayat tarung (rekap menang/kalah/seri otomatis), permintaan masuk (balas
  via WhatsApp), laporan pengunjung, log aktivitas (perangkat/IP/login),
  pengguna & hak akses, profil + foto avatar.

**Teknis**
- Halaman publik **ISR/SSG** (cache CDN) + pembersihan cache otomatis
  (`revalidatePath`) setiap data diubah lewat panel.
- Waktu disimpan **UTC**, ditampilkan **WIB**; usia ayam dihitung otomatis.
- Upload → **Vercel Blob** di produksi; fallback `public/uploads` untuk dev.
- Sesi login: cookie HttpOnly bertanda-tangan HMAC (7 hari) + fallback token
  `?s=` bila cookie diblokir; login pemilik "discreet" lewat tautan kecil
  **Area Pemilik** di footer. Autentikasi Firebase opsional (lihat
  `docs/SETUP_FIREBASE.md`).

## Stack

| Aspek | Pilihan |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Database | PostgreSQL via Prisma ORM (`app/prisma/`) |
| Penyimpanan foto | Vercel Blob (produksi) / `public/uploads` (lokal) |
| Login | `bcryptjs` + sesi cookie HMAC, fallback token URL; Firebase opsional |
| Foto | `sharp` — kompresi WebP otomatis + watermark logo tunggal |

## Struktur

```
ayam-bangkok-studio/
├── app/                     # Aplikasi Next.js (Root Directory Vercel = "app")
│   ├── app/                 #   route App Router (publik + /panel + /api)
│   ├── components/          #   komponen React (PapanBar, PublicLayout, dsb.)
│   ├── lib/                 #   config (dummy), site (sumber data), auth, izin…
│   ├── prisma/              #   schema + migrasi + seed (6 ayam contoh)
│   ├── public/brand/        #   logo emblem & favicon
│   └── public/uploads/seed/ #   foto demo (aset statis)
├── docs/                    # PRD, ERD, schema (artefak desain) + panduan
│   ├── MIGRASI_PAPAN_KONTAK.sql   # migrasi SQL produksi (papan + kontak)
│   └── MIGRASI_AKUN_LOG.sql       # migrasi SQL produksi (akun multi-peran)
├── design/                  # sistem desain & mockup HTML awal
├── DEPLOY.md                # panduan deploy GitHub + Vercel + Neon + Blob
└── README.md
```

## Menjalankan Lokal

```bash
cd app
npm install                      # menjalankan prisma generate (postinstall)
cp .env.example .env             # isi DATABASE_URL + SESSION_SECRET
# pastikan PostgreSQL tersedia, lalu:
npx prisma migrate deploy        # terapkan semua migrasi
npm run db:seed                  # akun demo + 6 ayam contoh (RESET data!)
npm run dev                      # http://localhost:3000
```

- Akun panel hasil seed: **`admin@jalu.id` / `jalu1234`** — segera ganti di produksi.
- Kontak yang tampil adalah **dummy** — isi data asli lewat
  **Panel → Kontak & Info Situs**.
- Tanpa `BLOB_READ_WRITE_TOKEN`, unggahan disimpan ke `public/uploads` (dev lokal).

## Build

```bash
cd app
DATABASE_URL="postgresql://…" npm run build   # publik di-prerender (butuh DB)
npm start                                     # atau next start
```

## Deploy

Panduan lengkap (Neon, Vercel, Blob, migrasi + seed, pemecahan
`DEPLOYMENT_BLOCKED`): **[`DEPLOY.md`](DEPLOY.md)**.

## Dokumentasi lain

- 📄 PRD → [`docs/PRD.md`](docs/PRD.md) (+ addendum kondisi implementasi)
- 🗂️ ERD → [`docs/ERD.md`](docs/ERD.md) (+ perubahan pasca-desain)
- 🗄️ Skema jalan: `app/prisma/schema.prisma` (sumber kebenaran) · artefak
  desain lama: [`docs/schema.sql`](docs/schema.sql) (MySQL, historis)
- 🔥 Firebase (opsional) → [`docs/SETUP_FIREBASE.md`](docs/SETUP_FIREBASE.md)
- 🎨 Sistem desain → [`design/DESIGN.md`](design/DESIGN.md)

---

🔒 **Catatan privasi:** repo ini tidak menyimpan data pribadi (nama, nomor
telepon, email asli) maupun kunci rahasia — `.env` diabaikan git, kredensial
diatur lewat environment Vercel, data kontak diatur lewat panel.
