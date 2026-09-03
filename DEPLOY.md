# Deploy HW Catalog — GitHub + Vercel

Aplikasi **HW Catalog** (Next.js di folder `app/`) disiapkan agar berfungsi penuh
di Vercel:

- **Database**: PostgreSQL produksi (mis. **Neon** free tier). Skema Prisma di
  `app/prisma/schema.prisma`, migrasi awal di `app/prisma/migrations/0_init`.
- **Foto unggahan**: disimpan ke **Vercel Blob** saat `BLOB_READ_WRITE_TOKEN`
  tersedia; tanpa token → fallback ke `public/uploads` (dev lokal).
- **Halaman publik** memakai **ISR/SSG**: beranda & katalog statis, detail ayam
  di-prerender, lalu cache dibersihkan otomatis (`revalidatePath`) setiap data
  diubah lewat panel → **build membutuhkan akses ke database yang sudah diisi**.

---

## 1) Siapkan database PostgreSQL (Neon — gratis)

1. Buka https://neon.tech → daftar (bisa lewat GitHub/Google) → **Create a project**.
2. Buka tab **Connect** → pilih jenis koneksi **Node.js/Prisma**.
3. Salin **connection string** berawalan `postgresql://…` (mode **non-pooling**,
   host tanpa `-pooler`).
4. **Isi tabel** lewat SQL Editor Neon:
   - Buka **SQL Editor** → tempel **seluruh isi `SETUP_NEON.sql`** (file di akar
     repo; membuat 8 tabel + 5 kategori + 6 ayam contoh + 22 foto + akun panel)
     → **Run**. Hanya untuk database **kosong**, cukup sekali.
   - Alternatif dari CLI: `npx prisma migrate deploy && npm run db:seed`
     (menghasilkan akun **`admin@jalu.id` / `jalu1234`**).

> ⚠️ Jangan pernah menjalankan `db:seed`/`SETUP_NEON.sql` berulang — ia menghapus
> seluruh data lalu membuat ulang.

## 2) Repositori GitHub

- Repo: `https://github.com/<user>/hw-catalog` (cabang `main`).
- Akses push memakai **Personal Access Token** (scope `repo`):
  https://github.com/settings/tokens → *Generate new token (classic)*.
- **Identitas git harus milik akun GitHub yang terhubung ke Vercel.** Vercel
  memblokir build (`DEPLOYMENT_BLOCKED`) bila penulis commit tidak bisa dikaitkan
  ke pengguna GitHub (Hobby plan). Pastikan:
  ```bash
  git config user.name  "<Nama di GitHub>"
  git config user.email "<email terdaftar di GitHub>"
  ```

## 3) Vercel — project & environment

1. https://vercel.com → **Add New → Project → Import** repo `hw-catalog`.
2. Atur: **Root Directory = `app`**, framework otomatis **Next.js**.
3. **Settings → Environment Variables**:

   | Nama | Isi |
   |---|---|
   | `DATABASE_URL` | connection string Neon (langkah 1) |
   | `SESSION_SECRET` | string acak panjang (mis. `openssl rand -hex 32`) |
   | `BLOB_READ_WRITE_TOKEN` | token dari **Storage → Create → Blob** (untuk simpan foto unggahan) |

   Beri tanda centang minimal **Production** (tambahkan Preview jika ingin
   mengetes branch/PR).

4. **Deploy.** Build membaca DB saat prerender → pastikan langkah 1.4 selesai
   sebelum deploy pertama.

## 4) Verifikasi & pemeliharaan

- Setiap push ke `main` memicu deployment baru; tunggu status **Ready** di tab
  Deployments, lalu buka URL `https://<project>.vercel.app`.
- Uji: katalog 6 ayam tampil → login `/panel` → tambah foto (ada pratinjau dulu,
  tersimpan ke Blob + watermark) → halaman publik langsung segar (cache dibersihkan).
- Deployment berstatus **Blocked** biasanya karena identitas commit (lihat 2).
  Setelah identitas git benar, push ulang; deployment lama bisa di-*Redeploy*
  dari dashboard atau diabaikan.

## Catatan

- `public/uploads/seed/*.jpg` (foto demo) ikut di-repo sebagai aset statis;
  foto hasil unggahan dinamis tidak ikut git (Blob di produksi, `public/uploads`
  diabaikan `.gitignore`).
- Local dev tanpa token: unggahan masuk `public/uploads` dan hanya hidup selama
  instance lokal.
- Repo bisa dibuat **Public** (Settings → ubah visibility) — berpengaruh ke
  kolaborasi/CI di GitHub, bukan ke jalannya Vercel.
