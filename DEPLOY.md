# Deploy HW Catalog — GitHub + Vercel

Aplikasi **HW Catalog** (Next.js di folder `app/`) disiapkan agar berfungsi penuh
di Vercel:

- **Database**: PostgreSQL produksi (mis. **Neon** free tier). Skema Prisma di
  `app/prisma/schema.prisma`, seluruh migrasi di `app/prisma/migrations/`.
- **Foto unggahan**: disimpan ke **Vercel Blob** saat `BLOB_READ_WRITE_TOKEN`
  tersedia; tanpa token → fallback ke `public/uploads` (dev lokal). Otomatis
  dikompresi ke WebP + watermark.
- **Halaman publik** memakai **ISR/SSG**: beranda & katalog statis, detail ayam
  di-prerender, lalu cache dibersihkan otomatis (`revalidatePath`) setiap data
  diubah lewat panel → **build membutuhkan akses ke database yang sudah diisi**.

> 🔒 **Repo bebas data pribadi.** Nama pemilik/nomor WA/email di repo adalah
> **dummy**. Data asli diisi lewat panel (langkah 1.5) dan tersimpan hanya di
> database Anda.

---

## 1) Siapkan database PostgreSQL (Neon — gratis)

1. Buka https://neon.tech → daftar (bisa lewat GitHub/Google) → **Create a project**.
2. Buka tab **Connect** → pilih jenis koneksi **Node.js/Prisma**.
3. Salin **connection string** berawalan `postgresql://…` (mode **non-pooling**,
   host tanpa `-pooler`).
4. **Isi tabel** — pilih SATU sesuai kondisi database:

   **a) Database masih kosong (baru)** — dari komputer lokal:
   ```bash
   cd app
   DATABASE_URL="<connection-string-neon>" npx prisma migrate deploy
   DATABASE_URL="<connection-string-neon>" npm run db:seed   # akun demo + 6 ayam contoh
   ```
   > ⚠️ `db:seed` **menghapus & membuat ulang seluruh data** — hanya untuk
   > database kosong/baru, cukup sekali. Akun panel hasil seed:
   > **`admin@jalu.id` / `jalu1234`** → segera ganti sandi lewat panel.

   **b) Database sudah dipakai situs berjalan** — lewat **Neon SQL Editor**,
   tempel & jalankan berurutan (keduanya idempotent / aman diulang):
   1. **`docs/MIGRASI_AKUN_LOG.sql`** — akun multi-peran, izin modul, metadata log.
   2. **`docs/MIGRASI_PAPAN_KONTAK.sql`** — tabel papan pengumuman + kontak
      terpusat (`SiteSetting`), beserta baris pengaturan awal (nilai dummy).

5. **WAJIB setelah migrasi — isi kontak asli:** login ke `/panel` (akun pemilik)
   → **Kelola → Kontak & Info Situs** → isi nama pemilik, nomor WhatsApp, email,
   alamat, tautan Google Maps, jam layanan → Simpan. Seluruh halaman publik
   langsung memakai data ini. (Nomor `08…` otomatis dikonversi ke format `628…`.)

## 2) Repositori GitHub

- Repo: `https://github.com/<user>/hw-catalog` (cabang `main`).
- Akses push memakai **Personal Access Token** (scope `repo`):
  https://github.com/settings/tokens → *Generate new token (classic)*.
- **Identitas git harus bisa dikaitkan ke akun GitHub yang terhubung ke
  Vercel.** Vercel memblokir build (`DEPLOYMENT_BLOCKED`) bila penulis commit
  tidak dikenali (Hobby plan). Untuk menjaga privasi alamat email pribadi,
  pakai **email noreply GitHub**:
  ```bash
  git config user.name  "<Nama di GitHub>"
  git config user.email "<username>@users.noreply.github.com"
  ```
  (Email noreply ada di GitHub → Settings → Emails → *Keep my email addresses
  private*.)

## 3) Vercel — project & environment

1. https://vercel.com → **Add New → Project → Import** repo `hw-catalog`.
2. Atur: **Root Directory = `app`**, framework otomatis **Next.js**.
3. **Settings → Environment Variables**:

   | Nama | Isi |
   |---|---|
   | `DATABASE_URL` | connection string Neon (langkah 1) |
   | `SESSION_SECRET` | string acak panjang (mis. `openssl rand -hex 32`) |
   | `BLOB_READ_WRITE_TOKEN` | token dari **Storage → Create → Blob** (untuk simpan foto unggahan) |
   | `FIREBASE_*` (opsional) | lihat `docs/SETUP_FIREBASE.md` bila ingin login via Firebase |

   Beri tanda centang minimal **Production** (tambahkan Preview jika ingin
   menguji branch/PR).

4. **Deploy.** Build membaca DB saat prerender → pastikan langkah 1 selesai
   sebelum deploy pertama.

## 4) Verifikasi & pemeliharaan

- Setiap push ke `main` memicu deployment baru; tunggu status **Ready** di tab
  Deployments, lalu buka URL `https://<project>.vercel.app`.
- Uji: katalog tampil → login `/panel` → **Kontak & Info Situs** terisi data
  asli → tambah foto (ada pratinjau dulu, tersimpan ke Blob + WebP + watermark)
  → halaman publik langsung segar (cache dibersihkan).
- Coba juga **Papan Pengumuman**: buat papan jenis *Peringatan* (jendela di
  tengah layar) atau *Iklan/Info* (pita atas), lalu aktifkan/nonaktifkan.
- Deployment berstatus **Blocked** biasanya karena identitas commit (lihat 2).
  Setelah identitas git benar, push ulang; deployment lama bisa di-*Redepoy*
  dari dashboard atau diabaikan.

## Catatan

- `public/uploads/seed/*.jpg` (foto demo) ikut di-repo sebagai aset statis;
  foto hasil unggahan dinamis tidak ikut git (Blob di produksi, `public/uploads`
  diabaikan `.gitignore`).
- Local dev tanpa token: unggahan masuk `public/uploads` dan hanya hidup selama
  instance lokal.
- Repo bebas data pribadi & aman dibagikan: kontak produksi diatur lewat panel
  (tersimpan di database), `.env` diabaikan git, riwayat commit memakai email
  noreply. Repo bisa dibuat **Public** (Settings → ubah visibility) — berpengaruh
  ke kolaborasi/CI di GitHub, bukan ke jalannya Vercel.
