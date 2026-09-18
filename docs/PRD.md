# Product Requirements Document (PRD)

> **Catatan status:** dokumen ini artefak **fase desain** (nama produk kerja "Jalu", basis data awal MySQL 8). Implementasi yang berjalan kini bernama **HW Catalog** (Next.js + Prisma/PostgreSQL, Vercel Blob) — lihat `README.md` & `DEPLOY.md`. Dokumen tetap disimpan sebagai riwayat desain.

## Jalu — Galeri Ayam Bangkok (Katalog & Info Penjualan)

| | |
|---|---|
| **Versi** | 6.0 (revisi sesuai masukan pemilik) |
| **Tanggal** | 2 September 2026 |
| **Status** | Menunggu persetujuan sebelum pengembangan (M0 → M1) · rev.6 |
| **Produk** | "Jalu" — nama kerja, dapat diganti |

**Ringkasan revisi 2.0:** umur dari tanggal menetas (otomatis); satu peternakan tanpa "asal kota"; pemilik tunggal tanpa role.

**Ringkasan revisi 3.0:**
1. **Sold out = sekali klik, foto otomatis hitam-putih.** Saat status jual dipilih **Terjual**, seluruh foto ayam itu tampil hitam-putih di katalog/galeri & panel. File asli tetap berwarna; bila status dikembalikan, foto kembali berwarna. (Tampilan aplikasi, bukan perubahan file.)
2. **Ketentuan jenis foto wajib.** Tiap foto memiliki label jenis: **Full badan · Kepala · Kaki · Bulu/ekor · Lainnya**. Syarat publikasi: minimal ada **Full badan, Kepala, dan Kaki** (boleh lebih dari satu per jenis; opsional tambah Bulu/ekor & Lainnya).
3. **Usia tetap tampil.** Selain tanggal menetas, kartu/galeri menampilkan **usia ± (bulan) yang dihitung otomatis** dari tanggal menetas — bukan angka yang diketik manual, sehingga selalu terbaru.

**Ringkasan revisi 4.0:**
1. **Ukuran & hal yang lazim ditanya pembeli** ditambahkan sebagai kolom opsional pada ayam: **postur/ukuran badan, tinggi punggung, kaki & sisik, jalu**. Bila terisi, tampil di halaman detail (dan ringkas di kartu bila relevan).
2. **Setiap kartu katalog selalu menampilkan tombol "Hubungi"** (WhatsApp pemilik kandang) — kontak tidak pernah hilang, sekaligus menyiapkan kemungkinan penitip iklan/ayam dari pihak lain yang semuanya tetap ditangani satu pengelola.
3. **Bendera "Laporkan" per kartu katalog**: pengunjung bisa melaporkan info yang tidak diperbarui/keliru (mis. sudah laku tapi masih tampil) → masuk ke tabel `laporan`, dikelola pemilik di panel. Laporan tidak mengubah data otomatis.
**Ringkasan revisi 5.0:**
1. **Lokasi & alamat dipertegas**: seksi "Lokasi & Kunjungan" di beranda dan **peta + alamat di footer** seluruh halaman publik, agar calon pembeli tahu posisi kandang.
2. **Kunjungan wajib reservasi (janji temu).** Pengunjung harus menghubungi pemilik lebih dulu untuk mencocokkan jadwal; tanpa janji tidak dilayani datang langsung. Alur: chat WhatsApp → konfirmasi jadwal → datang pada jam disepakati.
**Ringkasan revisi 6.0:**
1. **Riwayat pertarungan** sebagai poin penilaian: setiap laga/uji tercatat (tanggal, lawan, jenis laga, ronde, hasil **Menang/Kalah/Seri**, catatan). Rekap dihitung otomatis.
2. **Kartu katalog** menampilkan rekap ringkas (mis. "Menang 8 · Kalah 1 · Seri 1"); ayam betina/indukan menampilkan "bukan ayam laga".
3. **Halaman detail** menampilkan panel **Rekap Pertarungan**: angka besar M/K/S + rasio kemenangan + daftar riwayat kronologis.
4. **Panel pemilik** mendapat menu **Riwayat Tarung** untuk menambah/mengubah/menghapus baris hasil per ayam.

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
| PF-02 | **Katalog:** grid kartu ayam berisi foto utama, nama/kode, kategori, **tanggal menetas + usia ± otomatis**, berat, harga (atau "Hubungi kami"), badge status, dan **tombol "Hubungi" yang selalu tampil** pada setiap kartu. | P0 |
| PF-03 | **Pencarian & filter:** teks (nama/kode), kategori, jenis kelamin, status ketersediaan; urutkan (terbaru/termahal/termurah/nama). Ayam "terjual" dapat ditampilkan sebagai riwayat (opsi). | P1 |
| PF-04 | **Halaman detail:** galeri multi-foto berlabel jenis (full badan/kepala/kaki/bulu/lainnya), spesifikasi inti (kelamin, tanggal menetas, **usia otomatis**, berat, warna bulu, ring), harga & status, tombol "Saya Tertarik". | P0 |
| PF-05 | **Form "Saya Tertarik":** nama, nomor WhatsApp, kota pembeli (opsional), pesan/penawaran (opsional) → tersimpan sebagai permintaan + tautan WhatsApp. | P0 |
| PF-06 | **Tentang, kontak & lokasi:** narasi kandang, alamat lengkap, **peta lokasi di footer & seksi beranda**, WhatsApp/telepon, jam layanan. | P1 |
| PF-07 | **Detail memuat ukuran & ciri yang lazim ditanya** bila diisi: postur/ukuran badan, tinggi punggung, kaki & sisik, jalu — selain data inti. | P1 |
| PF-08 | **Bendera "Laporkan"** pada setiap kartu/detail ayam: pilih jenis masalah (info tidak update, sudah terjual tapi masih tampil, data/foto keliru, lainnya) + keterangan → tersimpan sebagai laporan untuk pemilik. | P1 |
| PF-09 | Halaman 404 ramah & halaman status kosong. | P2 |
| PF-10 | **Responsif** (desktop/tablet/ponsel). | P0 |
| PF-11 | SEO dasar & kinerja gambar (thumbnail/webp). | P1/P2 |
| PF-12 | Seluruh kartu menyiapkan kontak bagi pihak yang ingin **menitipkan ayam/iklan** — diproses manual pemilik (tetap satu pengelola; kandidat v2 bila menjadi rutin). | P3 |
| PF-13 | **Informasi kunjungan yang jelas:** alamat + peta selalu tampil; keterangan **"kunjungan wajib reservasi"** beserta alur (chat → konfirmasi jadwal → datang) terlihat di seksi lokasi & footer. | P1 |
| PF-14 | **Rekap laga pada kartu katalog**: baris ringkas "Menang x · Kalah y · Seri z" (dihitung otomatis) sebagai poin penilaian cepat saat memilih. Ayam tanpa laga menampilkan keterangan sesuai (mis. "bukan ayam laga"). | P1 |
| PF-15 | **Rekap & riwayat laga pada halaman detail**: angka besar menang/kalah/seri, rasio kemenangan, dan daftar kronologis (tanggal, lawan, jenis laga, ronde, hasil, catatan). | P1 |

### 4.B Sisi Pemilik (login)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| AF-01 | **Login** satu akun (email + kata sandi, hash). | P0 |
| AF-02 | **Dashboard ringkasan:** total ayam, tersedia, dipesan, permintaan baru, laporan baru. | P1 |
| AF-03 | **CRUD Ayam:** buat/ubah/arsip (soft delete)/pulihkan/hapus permanen. Field: kode/nomor ring, nama, kategori, jenis kelamin, **tanggal menetas (perkiraan)** → usia otomatis, berat (kg), warna bulu, keunggulan, deskripsi, harga (kosong = "Hubungi kami"), status jual, status tampil (draft/publikasi), unggulan. | P0 |
| AF-04 | **Galeri multi-foto:** unggah banyak; setiap foto diberi **jenis foto** (Full badan/Kepala/Kaki/Bulu & ekor/Lainnya); atur foto utama & urutan; hapus; alt text; validasi tipe/ukuran; thumbnail otomatis. | P0 |
| AF-05 | **Kolom ukuran/ciri (opsional)** pada form ayam: postur/ukuran badan, tinggi punggung, kaki & sisik, jalu — disarankan diisi (lazim ditanya pembeli). | P1 |
| AF-06 | **Kelola laporan katalog:** daftar laporan bendera dari pengunjung; ubah status `baru → ditindaklanjuti → selesai/tutup`; akses cepat ke ayam terkait. | P1 |
| AF-07 | **Daftar ayam (tabel):** thumbnail, kode/nama, kategori, status, harga, tanggal menetas/berat; pencarian & filter; aksi. | P0 |
| AF-08 | **Kelola kategori** (CRUD kecil); hapus dicegah bila masih terpakai. | P1 |
| AF-09 | **Kelola permintaan:** daftar minat pembeli; ubah status `baru → dihubungi → deal/batal`; tautan cepat WhatsApp. | P1 |
| AF-10 | **Log aktivitas:** catatan perubahan pemilik (siapa/kapan/aksi). | P2 |
| AF-11 | **Anti salah-klik:** konfirmasi hapus; hapus permanen minta ketik ulang kata kunci. | P2 |
| AF-12 | **Kelola riwayat tarung per ayam:** tambah baris hasil (tanggal, lawan, berat lawan, jenis laga, ronde, hasil M/K/S, catatan); ubah/hapus; rekap menang/kalah/seri & rasio dihitung otomatis. Hanya mencatat laga yang benar-benar terjadi dengan hasil jelas. | P1 |

## 5. Aturan Bisnis (Business Rules)

1. **Usia otomatis & selalu tampil:** aplikasi menyimpan `tanggal_menetas`; **usia tidak disimpan sebagai angka**. Setiap tampilan (kartu/galeri/detail) menampilkan **usia ± (bulan) yang dihitung dari tanggal menetas** sampai hari ini. Jika tanggal menetas kosong, bagian usia tidak ditampilkan.
2. **Sold out otomatis hitam-putih:** memilih status **`TERJUAL`** cukup sekali klik → seluruh foto ayam itu tampil **hitam-putih** di katalog, galeri publik, dan panel. Ini efek tampilan (grayscale) — **file asli selalu tersimpan berwarna**. Jika status diubah dari `terjual` (mis. karena batal), foto otomatis berwarna kembali.
3. **Alur status jual:** `tersedia → dipesan → terjual`. `dipesan` dapat kembali ke `tersedia` bila batal (oleh pemilik). `terjual` adalah status final dari sisi penjualan.
4. **Harga kosong** = "Hubungi kami" (tidak dijual terbuka / nego via chat).
5. **Tampil publik** hanya jika `status_tampil = publikasi`; arsip/draft tidak pernah tampil.
6. **Featured** maks. 3 ayam tampil di beranda.
7. **Jenis foto & syarat publikasi:** setiap foto memiliki `jenis_foto` (Full badan/Kepala/Kaki/Bulu & ekor/Lainnya). Ayam **baru dapat dipublikasikan** bila galerinya memuat minimal **satu Full badan, satu Kepala, dan satu Kaki**. Satu ayam boleh punya banyak foto per jenis.
8. **Satu foto utama** per ayam; bila dihapus, foto urutan berikutnya naik jadi utama.
9. **Tanpa kota asal ayam**: satu kandang, satu lokasi. Hanya data pelanggan (domisili pembeli) yang boleh berisi kota lain.
10. **Nomor ring/kode** unik bila diisi.
11. **Permintaan** tidak terhapus otomatis; `batal` tetap tersimpan sebagai riwayat.
12. **Satu akun** pemilik yang dapat mengubah data; seluruh perubahan dicatat di log.
13. **Kunjungan kandang hanya dengan reservasi (janji temu).** Alamat & peta lokasi selalu tampil (footer & halaman Tentang/beranda). Pengunjung wajib menghubungi pemilik untuk mencocokkan jadwal sebelum datang; tanpa janji tidak dilayani.
14. **Riwayat laga & rekap:** setiap hasil laga/uji dicatat apa adanya di `riwayat_tarung` (menang/kalah/seri). Rekap di kartu, detail, dan panel **dihitung otomatis** dari baris riwayat — tidak ada angka rekap yang diketik manual. Untuk ayam yang tidak diadu (mis. betina/indukan), bagian rekap tidak ditampilkan / berlabel sesuai.

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
2. Usia yang tampil **selalu dihitung ulang** dari tanggal menetas dan tetap ditampilkan (contoh: "± 18 bulan · menetas 13 Maret 2025") — tanpa perlu diedit manual.
2b. Saat status diubah ke **Terjual**, seluruh foto ayam itu otomatis tampil hitam-putih; saat dikembalikan ke Tersedia, foto berwarna kembali. File asli tidak berubah.
3. Tidak ada tampilan/kolom "asal kota" ayam; lokasi kandang hanya di halaman Tentang.
4. Pengunjung memfilter katalog (kategori + status) & melihat galeri detail tanpa error.
5. Permintaan dari form "Saya Tertarik" muncul di panel pemilik berstatus `baru`.
6. Ayam "dipesan"/"terjual"/"arsip" tidak muncul pada daftar tersedia.
7. Halaman inti rapi di ponsel (≥360 px) dan mengikuti sistem desain.
8. Upload non-gambar / >5 MB ditolak ramah; tidak ada crash.
9. Log mencatat: siapa, kapan, aksi apa pada entitas apa.
10. Sistem memblokir publikasi ayam bila galeri belum punya Full badan, Kepala, dan Kaki sekaligus — dengan pesan ramah yang menyebut jenis yang kurang.
11. Setelah pemilik menambah baris hasil laga, rekap "Menang/Kalah/Seri" pada kartu katalog & detail berubah otomatis tanpa edit manual.

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

---

## 13. Addendum — Kondisi Implementasi Terkini

> Bagian ini menambahkan dokumen desain di atas agar tetap sesuai kondisi
> implementasi yang berjalan. Sumber kebenaran struktur data kini:
> **`app/prisma/schema.prisma`** (PostgreSQL/Prisma), bukan `docs/schema.sql`
> (artefak desain MySQL lama).

**Diterapkan melebihi PRD awal (v1):**

1. **Akun multi-peran** — `User.role` (`PEMILIK` | `ADMIN`) + `User.izin[]`
   (izin per-modul: ayam, kategori, riwayat, permintaan, laporan, log),
   `User.aktif`, `User.avatarUrl`; modul **Pengguna & Hak Akses** untuk pemilik.
2. **Papan pengumuman publik** (`PapanInfo`) — modular: jenis **PERINGATAN**
   (jendela di tengah layar ala dialog Windows — judul merah + pesan + OK,
   muncul setiap kali halaman dimuat) dan **IKLAN/INFO** (pita di atas
   halaman); dikelola penuh dari panel (aktif/nonaktif, kedip, urutan).
3. **Kontak & info situs terpusat** (`SiteSetting`, satu baris) — nama pemilik,
   nomor & tampilan WA, email, sosmed, alamat, peta, jam layanan, catatan
   kunjungan; diedit lewat panel, dipakai seluruh halaman publik. Repo hanya
   memuat nilai **dummy**.
4. **Log menyeluruh** — `Log` + metadata (email pelaku, IP, negara/kota
   perkiraan, perangkat, browser, OS), mencatat login (sukses/gagal) dan
   seluruh aksi CRUD.
5. **Foto** — kompresi otomatis **WebP** (foto ayam & avatar) + **watermark
   tunggal** logo (±20% sisi pendek, opasitas 0.05); penyimpanan Vercel Blob
   dengan fallback lokal.
6. **Waktu** — disimpan UTC, ditampilkan WIB; usia ayam selalu dihitung ulang.
7. **UI** — footer full-bleed simetris rasio emas; menu hamburger mobile;
   pratinjau publik di panel; ISR + purge cache otomatis.
8. **Login** — sesi cookie HMAC HttpOnly (7 hari) + fallback token `?s=`;
   Firebase Auth opsional; tautan login pemilik "discreet" di footer.

**Jawaban pertanyaan terbuka (no. 12):** (1) brand final = **HW Catalog**,
nomor WhatsApp diatur dari panel (tidak di-hardcode); (2) betina ditampilkan
(kategori Betina/Indukan); (3) v1 cukup foto; (4) hosting = Vercel + Neon +
Vercel Blob; (5) peluncuran memakai data contoh (seed demo).
