# Deploy HW Catalog — GitHub + Vercel

Aplikasi sudah disiapkan agar berfungsi penuh di Vercel:

- **Database**: PostgreSQL (produksi) — skema di `app/prisma/schema.prisma`,
  migrasi awal di `app/prisma/migrations/0_init`. Sebelumnya SQLite (hanya
  untuk demo lokal, `app/prisma/dev.db`, tidak ikut di-commit).
- **Foto unggahan**: disimpan ke **Vercel Blob** bila `BLOB_READ_WRITE_TOKEN`
  tersedia; tanpa token, otomatis fallback ke `public/uploads` (dev lokal).
- **Foto seed/demo** (`public/uploads/seed/*.jpg`) ikut di-repo sebagai aset
  statis, jadi tetap tampil di Vercel tanpa storage.
- Semua halaman `force-dynamic`, sehingga build tidak perlu akses database.

---

## 1) Siapkan database PostgreSQL (Neon — gratis)

1. Buka https://neon.tech → Sign up (bisa pakai GitHub/Google).
2. **Create a project** (region bebas), lalu buka tab **Connect**.
3. Salin **connection string** yang berawalan `postgresql://…` (mode
   `Prisma`/`Node.js`), misalnya:
   `postgresql://user:pass@ep-xxxx.region.aws.neon.tech/hwcatalog?sslmode=require`
   > Catatan: bila memakai URL `pooler`, Prisma butuh `?pgbouncer=true` dan
   > `direct_url` — disarankan pakai string **non-pooling** biasa.

## 2) Siapkan repositori GitHub

1. Buat akun di https://github.com bila belum punya.
2. Buat **Personal Access Token**:
   https://github.com/settings/tokens → **Generate new token (classic)** →
   centang **`repo`** → Generate → salin token (hanya tampil sekali).
3. (Opsional) Buat repo kosong dulu di GitHub, atau beri tahu nama repo yang
   diinginkan — nanti dibuatkan.

## 3) Siapkan Vercel

1. Daftar di https://vercel.com (sambungkan akun GitHub).
2. Buat **token API**: https://vercel.com/account/settings/tokens →
   **Create Token** (scope: `Full Account` atau minimal `deployment` +
   `project`) → salin token.
3. Buat **Blob store**: Dashboard → **Storage** → **Create** → **Blob** →
   salin **`BLOB_READ_WRITE_TOKEN`**.

## 4) Environment Variables (Vercel)

Set di project Vercel → **Settings → Environment Variables**:

| Nama | Isi |
|---|---|
| `DATABASE_URL` | connection string Neon dari langkah 1 |
| `SESSION_SECRET` | string acak panjang, mis. hasil `openssl rand -hex 32` |
| `BLOB_READ_WRITE_TOKEN` | token Blob dari langkah 3.3 |

## 5) Migrasi + seed (sekali saja)

Jalankan dari mesin lokal (bisa dari folder `app/`):

```bash
cd app
export DATABASE_URL="postgresql://…(URL Neon)…"
npx prisma migrate deploy
npm run db:seed        # membuat akun admin + 6 ayam contoh
```

> **Penting:** `db:seed` menghapus seluruh data lalu membuat ulang — jalankan
> hanya sekali pada DB kosong, JANGAN dijalankan otomatis setiap build.

Akun panel: `admin@jalu.id` / `jalu1234` — segera ganti kata sandi setelah
masuk (atau ubah di `app/prisma/seed.ts` sebelum seed).

## 6) Deploy

1. Push repo ke GitHub, lalu di Vercel: **Add New → Project → Import** repo
   tersebut (framework terdeteksi otomatis: Next.js).
2. Tambahkan environment variables di atas, lalu **Deploy**.
3. Halaman publik, panel login, dan unggah foto (tersimpan ke Blob +
   watermark) semuanya aktif.

---

### Catatan kecil
- Penyimpanan **lokal** tetap jalan tanpa token: file masuk `public/uploads`
  (tidak ikut git). Setiap perubahan hanya diterapkan di deployment bila
  perubahan itu di-commit & di-push ke GitHub.
- Foto yang diunggah lalu ayamnya dihapus otomatis dihapus juga dari Blob.
- URL foto seed lokal (`/uploads/seed/…`) berbeda dari foto unggahan
  (URL Blob `https://….blob.vercel-storage.com/…`) — keduanya didukung.
