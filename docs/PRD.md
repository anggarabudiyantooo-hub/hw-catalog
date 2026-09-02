# Product Requirements Document (PRD)
## Jalu — Galeri Ayam Bangkok (Katalog & Info Penjualan)

| | |
|---|---|
| **Versi** | 2.0 (revisi sesuai masukan pemilik) |
| **Tanggal** | 2 September 2026 |
| **Status** | Menunggu persetujuan sebelum pengembangan (M0 → M1) |
| **Produk** | "Jalu" — nama kerja, dapat diganti |

**Ringkasan revisi 2.0:**
1. **Umur tidak disimpan bulat** — yang dicatat hanya **tanggal menetas (perkiraan)**; usia dihitung otomatis sistem sehingga selalu terbaru.
2. **Satu peternakan** — kolom & tampilan "asal kota" dihapus; lokasi kandang cukup di halaman Tentang.
3. **Pemilik = penjual = pengelola tunggal** — tidak ada role petugas/multi-admin; cukup satu akun login pemilik.

---

## 1. Ringkasan Eksekutif

Pemilik/pengelola ayam Bangkok membutuhkan cara yang **layak dan elegan** untuk menampilkan koleksi ayamnya sekaligus menjualnya — seperti etalase sebuah kafe/resto yang bersih dan terpercaya, **bukan marketplace ramai** (Shopee/bukalapak). Promosi selama ini biasanya lewat WhatsApp dengan foto seadanya sehingga calon pembeli sulit melihat data lengkap (galeri foto, tanggal menetas → usia yang selalu terbaru, berat, kategori, harga, status ketersediaan).

"Jalu" adalah aplikasi web **etalase satu kandang**: pengunjung melihat kartu ayam yang informatif & elegan, lalu menyatakan minat; pemilik (satu orang, yang juga penjualnya) mengelola semuanya lewat **satu panel CRUD sederhana** yang mencakup unggah banyak foto per ayam.

Tahap ini (M0) menghasilkan PRD, ERD, skema basis data, sistem desain, dan mockup sebagai kontrak sebelum coding.

---

## 2. Tujuan & Bukan Tujuan

### 2.1 Tujuan (Goals)
1. Menampilkan koleksi ayam Bangkok milik satu kandang secara profesional: foto bagus + data teknis konsisten.
2. Mempercepat transaksi: pembeli langsung melihat harga, status, dan usia **yang selalu terhitung otomatis dari tanggal menetas**.
3. Meringankan kerja pemilik: CRUD simpel, galeri multi-foto, tanpa urusan akun/pengguna lain.
4. Menjadi **wajah brand** yang berkelas (desain merah bata–krem, hangat, otentik).

### 2.2 Bukan Tujuan (Non-Goals) — versi 1
1. **Bukan marketplace/toko online penuh** — tanpa keranjang, pembayaran online, ongkir, multi-penjual, ulasan/rating. Cukup "minat/permintaan" yang direspons lewat WhatsApp/telepon.
2. **Bukan sistem multi-user** — satu akun pemilik; tanpa role petugas/admin tambahan, tanpa manajemen pengguna.
3. **Bukan aplikasi silsilah/breeding** penuh — catatan singkat saja; kandidat v2.
4. **Bukan multi-kandang/cabang** — satu lokasi; alamat kandang tetap di halaman Tentang.
5. **Bukan media sosial** — tanpa komentar publik/like/profil pengguna.

---

## 3. Pengguna & Persona

| Persona | Gambaran | Tujuan utama |
|---|---|---|
| **Pemilik (Admin tunggal)** | Pemilik sekaligus peternak & penjual. Satu-satunya yang login. | Menambah/mengubah data ayam + foto, mengelola kategori & status, membalas permintaan pembeli, melihat log perubahannya sendiri. |
| **Pengunjung / Kolektor** | Calon pembeli, penggemar ayam laga, kolektor dari mana saja. | Melihat katalog & galeri, memfilter, membaca spesifikasi & usia terkini, lalu menghubungi/menyatakan minat. |

### 3.1 Peta Akses (dua sisi)

| Kemampuan | Pemilik (login) | Pengunjung (publik) |
|---|:-:|:-:|
| Lihat beranda, katalog, detail, galeri | ✅ | ✅ |
| Tambah / ubah / arsip / hapus ayam + galeri foto | ✅ | ❌ |
| Atur status jual & tampil, harga, unggulan | ✅ | ❌ |
| Kelola kategori | ✅ | ❌ |
| Kelola permintaan ("Saya Tertarik") | ✅ | (mengirim permintaan) |
| Lihat log aktivitas | ✅ | ❌ |

---

## 4. Kebutuhan Fungsional

### 4.A Sisi Publik (tanpa login)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| PF-01 | **Beranda:** sapaan singkat (hero), ayam unggulan/featured (maks. 3), kategori, ajakan menghubungi kandang. | P0 |
| PF-02 | **Katalog:** grid kartu ayam berisi foto utama, nama/kode, kategori, tanggal menetas, berat, harga (atau "Hubungi kami"), badge status. | P0 |
| PF-03 | **Pencarian & filter:** teks (nama/kode), kategori, jenis kelamin, status ketersediaan; urutkan (terbaru/termahal/termurah/nama). Ayam "terjual" dapat ditampilkan sebagai riwayat (opsi). | P1 |
| PF-04 | **Halaman detail:** galeri multi-foto (perbesar + thumbnail), spesifikasi (kategori, kelamin, tanggal menetas, **usia otomatis**, berat, warna bulu, ring), keunggulan, deskripsi, harga & status, tombol "Saya Tertarik". | P0 |
| PF-05 | **Form "Saya Tertarik":** nama, nomor WhatsApp, kota pembeli (opsional), pesan/penawaran (opsional) → tersimpan sebagai permintaan + tautan WhatsApp. | P0 |
| PF-06 | **Tentang & kontak:** narasi kandang, alamat (satu lokasi), WhatsApp/telepon, jam layanan. | P2 |
| PF-07 | Halaman 404 ramah & halaman status kosong. | P2 |
| PF-08 | **Responsif** (desktop/tablet/ponsel). | P0 |
| PF-09 | SEO dasar & kinerja gambar (thumbnail/webp). | P1/P2 |

### 4.B Sisi Pemilik (login)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| AF-01 | **Login** satu akun (email + kata sandi, hash). | P0 |
| AF-02 | **Dashboard ringkasan:** total ayam, tersedia, dipesan, permintaan baru. | P1 |
| AF-03 | **CRUD Ayam:** buat/ubah/arsip (soft delete)/pulihkan/hapus permanen. Field: kode/nomor ring, nama, kategori, jenis kelamin, **tanggal menetas (perkiraan)** → usia otomatis, berat (kg), warna bulu, keunggulan, deskripsi, harga (kosong = "Hubungi kami"), status jual, status tampil (draft/publikasi), unggulan. | P0 |
| AF-04 | **Galeri multi-foto:** unggah banyak, foto utama, urutan, hapus, alt text; validasi tipe/ukuran; thumbnail otomatis. | P0 |
| AF-05 | **Daftar ayam (tabel):** thumbnail, kode/nama, kategori, status, harga, tanggal menetas/berat; pencarian & filter; aksi. | P0 |
| AF-06 | **Kelola kategori** (CRUD kecil); hapus dicegah bila masih terpakai. | P1 |
| AF-07 | **Kelola permintaan:** daftar minat pembeli; ubah status `baru → dihubungi → deal/batal`; tautan cepat WhatsApp. | P1 |
| AF-08 | **Log aktivitas:** catatan perubahan pemilik (siapa/kapan/aksi). | P2 |
| AF-09 | **Anti salah-klik:** konfirmasi hapus; hapus permanen minta ketik ulang kata kunci. | P2 |

---

## 5. Aturan Bisnis (Business Rules)

1. **Usia otomatis:** aplikasi menyimpan `tanggal_menetas`; **usia tidak disimpan sebagai angka**. Saat ditampilkan, usia dihitung dari tanggal menetas hingga hari ini → selalu akurat/terbaru. Jika tanggal menetas kosong, bagian usia tidak ditampilkan.
2. **Alur status jual:** `tersedia → dipesan → terjual`. `dipesan` dapat kembali ke `tersedia` bila batal (oleh pemilik). `terjual` final.
3. **Harga kosong** = "Hubungi kami" (tidak dijual terbuka / nego via chat).
4. **Tampil publik** hanya jika `status_tampil = publikasi`; arsip/draft tidak pernah tampil.
5. **Featured** maks. 3 ayam tampil di beranda.
6. **Satu foto utama** per ayam; **minimal 1 foto** sebelum dipublikasikan.
7. **Tanpa kota asal ayam**: satu kandang, satu lokasi. Hanya data pelanggan (domisili pembeli) yang boleh berisi kota lain.
8. **Nomor ring/kode** unik bila diisi.
9. **Permintaan** tidak terhapus otomatis; `batal` tetap tersimpan sebagai riwayat.
10. **Satu akun** pemilik yang dapat mengubah data; seluruh perubahan dicatat di log.

---

## 6. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan |
|---|---|
| **Desain** | Merah bata & krem, hangat & berkelas; ikuti `design/DESIGN.md`. Tanpa gaya template AI generik (gradasi ungu/glassy, stok orang asing, emoji berlebihan). |
| **Bahasa** | Antarmuka Bahasa Indonesia; nada sopan, seperti etalase kafe yang ramah. |
| **Performa** | Muat publik < 2,5 dtk di koneksi 4G; gambar responsif/webp. |
| **Keamanan** | Kata sandi di-hash; sesi aman (httpOnly cookie); validasi input server-side; upload divalidasi (≤5 MB, cek MIME/ekstensi) & disimpan di luar folder publik eksekusi; proteksi CSRF; rate-limit form publik. |
| **Privasi** | Data permintaan (nama/WhatsApp) hanya untuk penjualan; tidak dibagikan. |
| **Pemeliharaan** | TypeScript; migrasi DB via Prisma; dokumentasi singkat. |
| **Kompatibilitas/Aksesibilitas** | Browser modern 2 versi terakhir; label form jelas, fokus keyboard, alt text. |

---

## 7. Alur Penting (User Stories)

| Sebagai… | Saya ingin… | Sehingga… | Prioritas |
|---|---|---|---|
| Pemilik | login sekali & langsung mengelola semuanya | tidak ribet urusan akun/role | P0 |
| Pemilik | mencatat tanggal menetas saja (bukan umur) | usia tampil otomatis & selalu benar | P0 |
| Pemilik | menambah ayam + beberapa foto sekaligus | katalog selalu segar setelah pemotretan | P0 |
| Pemilik | mengubah status menjadi "terjual" | katalog tidak menampilkan barang laku | P0 |
| Pemilik | melihat log perubahan sendiri | ada jejak bila salah input | P2 |
| Pengunjung | memfilter ayam tersedia sesuai budget | tidak bertanya satu per satu | P1 |
| Pengunjung | melihat banyak foto + data lengkap | yakin sebelum datang/menghubungi | P0 |
| Pengunjung | mengirim minat beserta nomor WhatsApp | pemilik bisa menghubungi balik | P0 |

---

## 8. Struktur Halaman (Sitemap v1)

```
Publik (tanpa login)
├── /                       Beranda (hero + unggulan + kategori + ajakan)
├── /katalog                Daftar ayam + filter & pencarian
├── /ayam/[slug]            Detail ayam + galeri + form "Saya Tertarik"
├── /tentang                Tentang kandang & kontak (satu lokasi)
└── (404)

Pengelola (login pemilik)
├── /panel/login            Halaman masuk
├── /panel                  Dashboard ringkasan
├── /panel/ayam             Tabel data ayam (list, filter, aksi)
├── /panel/ayam/baru        Form tambah ayam (+ unggah galeri)
├── /panel/ayam/[id]        Form ubah ayam (+ kelola galeri)
├── /panel/kategori         Kelola kategori
├── /panel/permintaan       Kelola permintaan
└── /panel/log              Log aktivitas
```

---

## 9. Entitas Inti (Ringkasan ERD)

Entitas: **users** (pemilik), **kategori**, **ayam**, **ayam_images**, **permintaan**, **aktivitas_log**.
Detil atribut & relasi → [`docs/ERD.md`](ERD.md) · diagram → [`docs/diagrams/erd.svg`](diagrams/erd.svg) · DDL → [`docs/schema.sql`](schema.sql).

---

## 10. Kriteria Penerimaan Penting (Contoh "Definition of Done")

1. Pemilik login dan dapat menambah ayam + 3 foto; ayam langsung tampil publik setelah "publikasi".
2. Usia yang tampil **selalu dihitung ulang** dari tanggal menetas — tanpa perlu diedit manual.
3. Tidak ada tampilan/kolom "asal kota" ayam; lokasi kandang hanya di halaman Tentang.
4. Pengunjung memfilter katalog (kategori + status) & melihat galeri detail tanpa error.
5. Permintaan dari form "Saya Tertarik" muncul di panel pemilik berstatus `baru`.
6. Ayam "dipesan"/"terjual"/"arsip" tidak muncul pada daftar tersedia.
7. Halaman inti rapi di ponsel (≥360 px) dan mengikuti sistem desain.
8. Upload non-gambar / >5 MB ditolak ramah; tidak ada crash.
9. Log mencatat: siapa, kapan, aksi apa pada entitas apa.

---

## 11. Milestone & Estimasi (untuk dibahas)

| Fase | Cakupan | Estimasi kerja |
|---|---|---|
| **M0 · Desain** *(sekarang)* | PRD, ERD, skema SQL, sistem desain, mockup | ✓ selesai (rev 2.0) |
| **M1 · Pondasi** | Scaffold Next.js, Prisma + migrasi, login pemilik, layout panel | 2–3 hari |
| **M2 · CRUD Ayam** | CRUD ayam, galeri multi-foto, kategori, status jual, perhitungan usia | 4–5 hari |
| **M3 · Publik** | Beranda, katalog + filter, detail + galeri, form "Saya Tertarik", kontak | 4–5 hari |
| **M4 · Rapi & Rilis** | Log aktivitas, pengujian, SEO, deployment, pelatihan pemilik | 2–4 hari |

---

## 12. Pertanyaan Terbuka

1. Nama brand final & nomor WhatsApp resmi?
2. Ayam betina ikut dijual/ditampilkan, atau hanya jantan?
3. Perlu video singkat di v1, atau cukup foto?
4. Domain & hosting: VPS / hosting bersama / Netlify+Vercel (dibahas saat M4)?
5. Perlu pengisian data contoh saat peluncuran, atau kandang mulai kosong?

---

*Dokumen ini hidup (living document); perubahan dicatat versinya.*
