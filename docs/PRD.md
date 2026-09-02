# Product Requirements Document (PRD)
## Jalu — Galeri Ayam Bangkok (Katalog & Info Penjualan)

| | |
|---|---|
| **Versi** | 1.0 (draf untuk disetujui) |
| **Tanggal** | 2 September 2026 |
| **Status** | Menunggu persetujuan sebelum pengembangan (M0 → M1) |
| **Oleh** | Tim pengembang — disusun bersama pemilik usaha |
| **Produk** | "Jalu" — nama kerja, dapat diganti |

---

## 1. Ringkasan Eksekutif

Pemilik/pengelola ayam Bangkok membutuhkan cara yang **layak dan elegan** untuk menampilkan koleksi ayamnya sekaligus menjualnya. Saat ini promosi biasanya lewat WhatsApp dengan foto seadanya, sehingga calon pembeli sulit melihat data lengkap (usia, berat, kategori, status ketersediaan, galeri foto).

"Jalu" adalah aplikasi web katalog yang menampilkan tiap ayam dengan **kartu yang informatif**: foto utama, galeri multi-foto, spesifikasi, harga, dan status ketersediaan. Sisi pengelola (admin & petugas) mendapat **panel CRUD** untuk menambah/mengubah/menghapus ayam beserta gambarnya, mengelola kategori, dan menerima permintaan dari pengunjung yang tertarik. Aplikasi dirancang dengan **multi-pengguna ber-role** (admin & petugas) serta audit ringan.

Tahap ini (M0) menghasilkan **PRD, ERD, skema basis data, sistem desain, dan mockup** sebagai kontrak sebelum coding.

---

## 2. Tujuan & Bukan Tujuan

### 2.1 Tujuan (Goals)
1. Menampilkan koleksi ayam Bangkok secara profesional: foto bagus + data teknis yang konsisten.
2. Mempercepat transaksi: pembeli melihat harga & status (tersedia/dipesan/terjual) sebelum menghubungi penjual.
3. Meringankan kerja petugas: input data cepat, galeri multi-foto, duplikasi data berkurang.
4. Menjaga kendali: hanya pengguna berhak yang dapat mengubah data (role & log aktivitas).
5. Menjadi **wajah brand** yang berkelas (desain merah bata–krem, otentik, tidak seperti template generik).

### 2.2 Bukan Tujuan (Non-Goals) — versi 1
1. **Bukan toko online penuh** — pembayaran, keranjang, ongkir, dan integrasi marketplace TIDAK termasuk v1. Cukup "minat/permintaan" yang direspons lewat WhatsApp/telepon.
2. **Bukan aplikasi silsilah/breeding** — riwayat kawin, pohon keturunan, genetika hanya catatan kecil (jika ada) dan menjadi kandidat v2.
3. **Bukan sistem multi-kandang/lokasi** — satu usaha, satu database; cabang baru di masa depan = v2.
4. **Bukan media sosial** — tanpa komentar publik, like, atau profil pengguna publik.

---

## 3. Pengguna & Persona

| Persona | Gambaran | Tujuan utama |
|---|---|---|
| **Admin (Pemilik)** | Pemilik usaha / kandang. Memiliki akses penuh. | Mengawasi seluruh data, mengelola pengguna (menambah petugas), menangani permintaan penting, melihat log. |
| **Petugas / Operator** | Karyawan yang memotret & mencatat ayam. | Menambah ayam baru + foto, mengubah data/spesifikasi, mengubah status jual. Tidak boleh menghapus permanen atau mengelola pengguna. |
| **Pengunjung / Kolektor** | Calon pembeli, penggemar ayam laga, kolektor. | Melihat katalog & galeri, memfilter, membaca spesifikasi, lalu menghubungi penjual (form "Saya Tertarik" / WhatsApp). |

### 3.1 Aturan Role (Permission Matrix)

| Kemampuan | Admin | Petugas | Pengunjung (publik) |
|---|:-:|:-:|:-:|
| Lihat beranda & katalog publik | ✅ | ✅ | ✅ |
| Lihat detail ayam (halaman publik) | ✅ | ✅ | ✅ |
| Tambah / ubah data ayam | ✅ | ✅ | ❌ |
| Unggah / hapus / atur urutan & foto utama | ✅ | ✅ | ❌ |
| Ubah status jual (tersedia/dipesan/terjual) | ✅ | ✅ | ❌ |
| Arsip / nonaktifkan ayam (soft delete) | ✅ | ✅ (sebagai arsip) | ❌ |
| **Hapus permanen** data ayam & gambar | ✅ | ❌ | ❌ |
| Kelola kategori | ✅ | ✅ (tambah/ubah, tidak hapus bila terpakai) | ❌ |
| Kelola permintaan ("Saya Tertarik") | ✅ | ✅ (lihat & ubah status) | (kirim permintaan) |
| **Kelola pengguna** (tambah petugas, ubah role, nonaktifkan) | ✅ | ❌ | ❌ |
| Lihat log aktivitas | ✅ | ❌ | ❌ |
| Hapus akun sendiri / ganti kata sandi | ✅ | ✅ | — |

> Catatan desain: petugas tidak bisa menghapus permanen, sehingga data & gambar tidak hilang karena salah klik. Penghapusan permanen hanya oleh admin dan dicatat di log.

---

## 4. Kebutuhan Fungsional

### 4.A Sisi Publik (tanpa login)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| PF-01 | **Beranda:** menampilkan sapaan singkat (hero), ayam unggulan/featured (maks. 3), kategori yang tersedia, serta tautan katalog. | P0 |
| PF-02 | **Katalog:** grid kartu ayam berisi foto utama, nama/kode, kategori, usia & berat, harga (atau "Hubungi kami"), dan badge status ketersediaan. | P0 |
| PF-03 | **Pencarian & filter katalog:** cari teks (nama/kode), filter kategori, jenis kelamin, status ketersediaan, urutkan (terbaru / termahal / termurah / nama). Ayam berstatus `terjual` tetap bisa ditampilkan sebagai riwayat (opsi "tampilkan yang terjual"). | P1 |
| PF-04 | **Halaman detail ayam:** galeri multi-foto (klik untuk memperbesar + thumbnail), spesifikasi (kategori, jenis kelamin, usia, berat, warna bulu, asal), keunggulan, deskripsi, harga & status, tombol "Saya Tertarik". | P0 |
| PF-05 | **Form "Saya Tertarik":** nama, nomor WhatsApp, kota (opsional), pesan/penawaran (opsional); tersimpan sebagai permintaan untuk admin & menyediakan tautan WhatsApp. | P0 |
| PF-06 | **Tentang & kontak:** narasi singkat kandang, alamat, nomor WhatsApp/telepon, jam layanan (statis di v1). | P2 |
| PF-07 | **Halaman 404** yang ramah serta halaman status (mis. "sedang tidak ada ayam"). | P2 |
| PF-08 | **Responsif**: tampilan desktop, tablet, dan ponsel (katalog 1–4 kolom). | P0 |
| PF-09 | **SEO dasar**: judul & deskripsi meta per halaman, semantic HTML, alt text gambar, sitemap statis. | P2 |
| PF-10 | **Kinerja gambar**: foto diubah otomatis menjadi versi responsif (thumbnail + webp) agar halaman cepat. | P1 |

### 4.B Sisi Pengelola (login admin/petugas)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| AF-01 | **Login** dengan email & kata sandi (hash). Sesi aman; petugas yang dinonaktifkan tidak dapat masuk. | P0 |
| AF-02 | **Dashboard ringkasan:** total ayam, tersedia, dipesan, terjual, permintaan baru (7 hari), ayam terbaru. | P1 |
| AF-03 | **CRUD Ayam:** buat ayam baru; ubah data; arsip (soft delete) & pulihkan; hapus permanen (admin). Field: kode/nomor ring (opsional), nama, kategori, jenis kelamin, umur (bulan), berat (kg), warna bulu, asal, keunggulan, deskripsi, harga (boleh kosong → "Hubungi kami"), status jual, tampil/draft, unggulan (featured). | P0 |
| AF-04 | **Galeri multi-foto per ayam:** unggah banyak gambar, pilih **foto utama**, atur urutan, hapus per gambar, ganti alt text. Validasi tipe & ukuran; thumbnail otomatis. | P0 |
| AF-05 | **Daftar ayam (tabel pengelola):** kolom thumbnail, kode/nama, kategori, status, harga, jumlah foto, pembuat, tanggal; pencarian & filter; aksi (lihat, ubah, arsip, hapus permanen). | P0 |
| AF-06 | **Kelola kategori** (CRUD sederhana): mis. Bangkok Tulen, Bangkok Birma, Bangkok Thailand (F1), Bangkok Lokal. Hapus kategori dicegah bila masih dipakai. | P1 |
| AF-07 | **Kelola permintaan:** daftar permintaan dari pengunjung; ubah status `baru → dihubungi → deal/batal`; tandai petugas yang menangani; tautan cepat ke WhatsApp. | P1 |
| AF-08 | **Manajemen pengguna (admin):** daftar pengguna, tambah petugas (nama, email, no. HP), setel role, aktif/nonaktifkan, reset kata sandi. | P0 |
| AF-09 | **Log aktivitas (admin):** catatan aksi penting (login, tambah/ubah/arsip/hapus ayam & gambar, ubah status, kelola pengguna) dengan siapa & kapan. | P1 |
| AF-10 | **Anti salah-klik:** konfirmasi sebelum hapus; perubahan besar (hapus permanen) butuh konfirmasi kedua dengan mengetik kata kunci. | P2 |

---

## 5. Aturan Bisnis (Business Rules)

1. **Alur status jual:** `tersedia → dipesan → terjual`. Admin dapat menarik kembali `dipesan` menjadi `tersedia` bila batal. `terjual` dianggap final (tidak bisa kembali, kecuali oleh admin dan dicatat).
2. **Harga kosong** = ayam tidak untuk dijual / "Hubungi kami". Harga adalah nominal dalam Rupiah.
3. **Status tampilan publik:** ayam hanya tampil bila `draft = publikasi`; ayam berstatus **terarsip** atau `is_published = draft` tidak pernah tampil publik (tetap ada di data).
4. **Featured (unggulan):** maksimal 3 ayam berstatus tampil di beranda.
5. **Satu foto utama** per ayam; tanpa foto, ayam tidak dapat dipublikasikan (wajib minimal 1 foto).
6. **Pembuat & waktu** setiap ayam dicatat (`created_by`); perubahan penting dicatat di log.
7. **Nomor ring/kode** unik bila diisi; boleh kosong.
8. **Permintaan** tidak pernah otomatis terhapus; status `batal` tetap diarsipkan untuk riwayat.
9. **Peran petugas** tidak dapat menghapus permanen atau mengelola pengguna/log (lihat matriks §3.1).

---

## 6. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan |
|---|---|
| **Desain** | Arah visual: **merah bata & krem**, hangat & lokal, berkelas; mengikuti `design/DESIGN.md`. Dilarang gaya template AI generik (gradasi ungu/glassy, stok foto orang asing, emoji berlebihan). |
| **Bahasa** | Antarmuka dalam Bahasa Indonesia; nada sopan namun bersahabat. |
| **Performa** | Waktu muat halaman publik < 2,5 dtk di koneksi 4G (Indonesia). Gambar responsif/webp. |
| **Keamanan** | Kata sandi di-hash (bcrypt/argon2); sesi aman (httpOnly cookie); validasi input server-side; upload divalidasi tipe MIME + ekstensi + ukuran (maks. ±5 MB/gambar) & disimpan di luar folder publik eksekusi; proteksi CSRF; rate-limit form publik; sanitasi teks. |
| **Privasi** | Data permintaan (nama & WhatsApp) hanya untuk keperluan penjualan; tidak dijual/dibagikan. |
| **Ketersediaan** | Backup basis data harian + arsip upload (dokumen operasional). |
| **Kompatibilitas** | Browser modern (Chrome, Edge, Firefox, Safari) — 2 versi terakhir; tampilan rapi di Android/iOS. |
| **Aksesibilitas** | Kontras teks memadai, label form jelas, fokus keyboard terlihat, alt text gambar. |
| **Pemeliharaan** | Kode TypeScript; migrasi basis data via Prisma; dokumentasi singkat di repo. |

---

## 7. Alur Penting (User Stories Ringkas)

| Sebagai… | Saya ingin… | Sehingga… | Prioritas |
|---|---|---|---|
| Admin | menambah akun petugas dengan role terbatas | pekerjaan input data bisa didelegasikan tanpa risiko menghapus data penting | P0 |
| Petugas | menambah ayam baru beserta beberapa foto sekaligus | katalog selalu terbaru setelah pemotretan | P0 |
| Petugas | mengubah status ayam menjadi "terjual" | katalog tidak menampilkan barang yang sudah laku | P0 |
| Admin | melihat log siapa mengubah apa | ada jejak bila terjadi kesalahan data | P1 |
| Pengunjung | memfilter ayam yang tersedia sesuai budget | tidak perlu menanyakan satu per satu | P1 |
| Pengunjung | melihat banyak foto + data teknis satu ayam | lebih yakin sebelum memutuskan datang/menghubungi | P0 |
| Pengunjung | mengirim minat dengan nomor WhatsApp saya | penjual dapat menghubungi balik dengan cepat | P0 |

---

## 8. Struktur Halaman (Sitemap v1)

```
Publik (tanpa login)
├── /                       Beranda (hero + unggulan + kategori + ajakan)
├── /katalog                Daftar ayam + filter & pencarian
├── /ayam/[slug]            Detail satu ayam + galeri + form "Saya Tertarik"
├── /tentang                Tentang kandang & kontak
└── (404)

Pengelola (login, panel terpisah)
├── /panel/login            Halaman masuk
├── /panel                  Dashboard ringkasan
├── /panel/ayam             Tabel data ayam (list, filter, aksi)
├── /panel/ayam/baru        Form tambah ayam (termasuk unggah gambar)
├── /panel/ayam/[id]        Form ubah ayam (termasuk kelola galeri)
├── /panel/kategori         Kelola kategori
├── /panel/permintaan       Kelola permintaan "Saya Tertarik"
├── /panel/pengguna         (Admin) kelola pengguna
└── /panel/log              (Admin) log aktivitas
```

---

## 9. Entitas Inti (Ringkasan ERD)

Entitas utama: **users**, **kategori**, **ayam**, **ayam_images**, **permintaan**, **aktivitas_log**.
Detil atribut & relasi → [`docs/ERD.md`](ERD.md) · diagram → [`docs/diagrams/erd.svg`](diagrams/erd.svg) · DDL → [`docs/schema.sql`](schema.sql).

---

## 10. Kriteria Penerimaan Penting (Contoh "Definition of Done")

1. Admin dapat menambah petugas; petugas login, menambah ayam + 3 foto, dan ayam langsung tampil di katalog publik setelah status "publikasi".
2. Pengunjung dapat memfilter katalog (kategori + status) tanpa error dan melihat galeri detail.
3. Permintaan dari form "Saya Tertarik" muncul di panel admin dengan status `baru`.
4. Petugas **tidak** melihat menu Pengguna & Log; tombol hapus permanen tidak muncul untuk petugas.
5. Ayam yang "dipesan"/"terjual"/"arsip" tidak muncul pada katalog *tersedia*.
6. Seluruh halaman inti tampil rapi di ponsel (lebar 360 px ke atas) dan mengikuti sistem desain.
7. Unggah file non-gambar / > 5 MB ditolak dengan pesan ramah; tidak ada crash.
8. Log mencatat: siapa, kapan, aksi apa pada entitas apa.

---

## 11. Milestone & Estimasi (untuk dibahas)

| Fase | Cakupan | Estimasi kerja |
|---|---|---|
| **M0 · Desain** *(sekarang)* | PRD, ERD, skema SQL, sistem desain, mockup | ✓ selesai |
| **M1 · Pondasi** | Scaffold Next.js, Prisma + migrasi, autentikasi & sesi, role guard, layout panel | 3–5 hari |
| **M2 · CRUD Ayam** | CRUD ayam, galeri multi-foto + unggah, kategori, status jual, thumbnail | 4–6 hari |
| **M3 · Publik** | Beranda, katalog + filter, detail + galeri, form "Saya Tertarik", kontak | 4–6 hari |
| **M4 · Rapi & Rilis** | Log aktivitas, kelola pengguna, pengujian, SEO, deployment, pelatihan | 3–5 hari |

> Estimasi per fase dihitung 1 hari kerja = 1 orang. Urutan/fokus dapat disesuaikan.

---

## 12. Pertanyaan Terbuka (untuk dikonfirmasi pemilik)

1. Nama brand final & alamat kandang (untuk halaman Tentang & kontak)?
2. Preferensi nomor WhatsApp resmi untuk menerima permintaan?
3. Ayam betina ikut ditampilkan untuk dijual/indukan, atau hanya jantan laga?
4. Perlu fitur "video singkat" ayam di v1, atau cukup foto?
5. Domain & hosting: sewa VPS / hosting bersama / Netlify+Vercel (diskusi saat M4)?
6. Siapa yang mengisi data awal (seed) saat peluncuran — apakah perlu bantuan pengisian contoh?

---

*Dokumen ini hidup (living document); perubahan disepakati bersama dan dicatat versinya.*
