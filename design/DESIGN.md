# Sistem Desain — "Jalu" Galeri Ayam Bangkok
## Arah Visual: Merah Bata & Krem (Tradisional Jawa, Berkelas)

| | |
|---|---|
| **Versi** | 1.0 |
| **Dipakai di** | mockup: `mockup-beranda.html`, `mockup-detail.html`, `mockup-admin.html` |

Tujuan estetika: terasa seperti **kandang juara yang terhormat** — hangat, otentik Indonesia, dan elegan. Dilarang keras kesan *template AI*: gradasi ungu/glassy, kotak putih dengan bayangan mengambang tanpa jiwa, ikon emoji, stok foto orang asing, atau font sans-serif generik di mana-mana.

---

## 1. Filosofi & Kata Kunci

> **"Warisan. Ketangguhan. Kehormatan."**
> Seperti bulu ayam laga yang hitam legam berkilau tembaga di bawah matahari — desain memadukan **kegelapan yang tenang** (marun tua), **hangatnya tanah** (krem/bata), dan **kilau detail** (emas tua) sebagai aksen yang hemat, bukan hiasan berlebihan.

| Kata kunci | Diterjemahkan menjadi |
|---|---|
| Warisan | Tipografi serif klasik, ornamen geometris halus, margin lebar |
| Ketangguhan | Sudut tegas, kartu dengan garis tipis, tekstur, palet tanah |
| Kehormatan | Status/badge yang jelas, hierarki tipografi, ruang kosong yang lega |

---

## 2. Palet Warna

### 2.1 Tokoh Utama — Merah Bata & Marun

| Token | Hex | Peran |
|---|---|---|
| `--marun-900` | `#3A0F0B` | Latar gelap (hero, footer, panel) |
| `--marun-800` | `#6B1710` | Gradasi hero / blok berani |
| `--bata-700` | `#8A1E1A` | Warna aksi utama, header tabel, teks judul |
| `--bata-600` | `#A32C20` | Tombol utama, garis aktif |
| `--bata-500` | `#C14A32` | Hover, aksen kecil |
| `--bata-tua` | `#7C3B24` | Merah bata "pudar" untuk tekstur/dinding |

### 2.2 Pendamping Hangat — Krem & Tanah

| Token | Hex | Peran |
|---|---|---|
| `--krem-100` | `#F9F0DF` | Latar utama halaman |
| `--krem-200` | `#F1E3C8` | Latar seksi selang-seling |
| `--krem-300` | `#E6D2AC` | Border lembut, chip |
| `--tanah-400` | `#C9A67B` | Garis pemisah dekoratif |
| `--card` | `#FFF9EC` | Kartu/kertas |
| `--paper` | `#FFF6E4` | Bidang isian form |

### 2.3 Aksen Emas Tua (dipakai hemat)

| Token | Hex | Peran |
|---|---|---|
| `--emas-500` | `#B8892F` | Ornamen, angka penting, bingkai foto unggulan |
| `--emas-300` | `#E0BC6C` | Detail hero (garis, butir dekoratif) |
| `--emas-700` | `#8F6A1F` | Teks aksen kecil (kontras di krem) |

### 2.4 Warna Status (semantik, tidak mencolok)

| Status | Hex | Keterangan |
|---|---|---|
| Tersedia | `#3F6B4F` (hijau tua kalem) + krem bg `#E7EFE2` | siap dijual |
| Dipesan | `#96691E` (amber tua) + bg `#F5EAD2` | sudah ada calon |
| Terjual | `#5B4636` (cokelat arang) + bg `#E9E0D4` | riwayat |
| Arsip/Draft | `#7A6A58` + bg `#EFEAE0` | tidak tampil publik |

> Aturan kontras: teks utama selalu `--ink` di atas krem. Merah hanya untuk *aksi & identitas*, bukan untuk seluruh latar teks panjang.

### 2.5 Teks

| Token | Hex | Pemakaian |
|---|---|---|
| `--ink` | `#3D2A22` | Teks utama |
| `--ink-muted` | `#7A6657` | Teks sekunder |
| `--ink-faint` | `#A3907F` | Keterangan halus |
| di atas marun | `#F6E7CE` | Teks terang |

---

## 3. Tipografi

Prinsip: **serif berkarakter** untuk identitas; sistem bersih untuk data (panel). Tanpa wajah font "AI" (seperti font sans bulat terlalu ramah atau script berlebihan).

| Konteks | Font | Ukuran/berat kunci | Catatan |
|---|---|---|---|
| Judul besar (hero) | `Marcellus` → fallback `Georgia` | 40–72 px, 400 | Kapital dengan *letter-spacing* lebar; kesan pahatan batu |
| Subjudul / label | `Georgia`, italic | 15–20 px | Italic serif untuk "nama julukan" & keterangan |
| Kartu nama ayam | `Marcellus`/`Georgia` 22–28 px | 400 | Nama ayam = judul produk |
| Judul panel | `Georgia` bold 18–22 px | 600 | |
| Isi / paragraf | `Georgia` 15–16 px, tinggi baris 1.7 | 400 | Nyaman dibaca panjang |
| Data tabel/panel | `IBM Plex Sans` → fallback `system-ui` 13–14 px | 400/600 | Hanya untuk angka & tabel agar terbaca rapat |
| Label kecil | kapital 11 px, letter-spacing 2 px | 600 | "KATEGORI", "BERAT", tombol kecil |

Tidak memuat font eksternal (offline-friendly); gunakan fallback yang serasi.

---

## 4. Ornamen & Ikonografi (Senyawa "Jawa–Melayu" yang halus)

1. **Motif "tumpal/silang":** garis-garis tipis diagonal/paralel sebagai pembatas & sudut kartu — mengingatkan batik lereng, digambar SVG tipis (1–2 px) dengan warna `tanah-400`/`emas`.
2. **Belah ketupat + garis** (`❖` SVG geometris) dipakai sebagai penanda pemisah antar seksi (bukan emoji).
3. **Kunci/ring** — ikon kecil untuk nomor ring.
4. Ikon data (umur, berat, asal) digambar **stroke 1.5 px** sederhana (SVG inline), bukan emoji, agar konsisten & tenang.
5. Foto ayam adalah bintang — bingkainya **tipis emas atau marun** dengan sudut 2 px, bukan sudut sangat bulat (maks radius 10 px).

---

## 5. Komponen

### 5.1 Tombol
- **Primer:** latar `bata-700`, teks krem; hover `bata-600` + translasi 1 px; sudut 6 px; teks kapital 12–13 px letter-spacing 1.5.
- **Sekunder:** garis 1.5 px `bata-700`, teks `bata-700`, latar transparan.
- **Tersier (di atas gelap):** garis krem 1 px, teks krem.
- Fokus aksesibilitas: outline emas 2 px.

### 5.2 Kartu Ayam (katalog)
1. Bingkai 1 px `krem-300` di atas `card`, bayangan sangat ringan (0 1px 3px rgba(60,30,10,.08)).
2. Foto 4:5, sudut atas membulat halus.
3. **Badge status** kiri atas foto: chip kecil semi-opak krem dengan titik warna status.
4. Kategori: label kecil kapital emas-tua di atas nama.
5. Nama ayam serif; di bawahnya meta baris: umur · berat · asal.
6. Kaki kartu: harga (`bata-700`, serif, semi-bold) + tombol "Detail".
7. Kartu "Unggulan" berbingkai ganda emas tipis & tab kecil "UNGGULAN".

### 5.2a Kartu Ayam — Status "Terjual" & Jenis Foto
- Kartu/galeri yang berstatus **Terjual** otomatis menampilkan seluruh fotonya **hitam-putih** (`filter: grayscale(1)`) plus watermark kecil "TERJUAL" di atas foto — kesan etalase yang rapi, bukan barang hilang. File asli tetap berwarna (grayscale hanya efek tampilan).
- Setiap foto galeri membawa **label jenis**: `Full badan`, `Kepala`, `Kaki`, `Bulu & ekor`, `Lainnya`. Syarat publikasi ayam: wajib ada Full badan, Kepala, dan Kaki (minimal satu masing-masing).
- Info usia kartu menampilkan dua lapis: angka **usia ± (bulan)** (hasil hitung otomatis, lebih tegas) + **tanggal menetas** (italik kecil) — mis. *"± 18 bulan · menetas 13 Maret 2025"*.

### 5.3 Hero Beranda
Latar `marun-900` dengan **tekstur bata** (SVG pattern garis-garis silang sangat samar, opacity 4–6%), ornamen garis emas, tipografi besar krem, dan baris data pendek (statistik) dengan pemisah belah ketupat kecil.

### 5.4 Formulir
- Label kapital 11 px di atas field; field `paper`, border 1 px `krem-300`, fokus border `bata-600` + ring tipis.
- Select & input diberi gaya penuh (bukan bawaan browser).
- Pesan kesalahan: teks `bata-600` kecil; border merah bila salah.

### 5.5 Panel (Admin)
- **Sidebar** marun gelap (`marun-800`→gradasi), lebar 248 px; item aktif: latar krem-transparan + garis emas kiri; logo atas.
- **Konten**: latar `krem-100`; kartu statistik putih-krem; **tabel** kepala `bata-700` (teks krem), baris zebra sangat tipis, hover krem muda, aksi berupa teks-tombol kecil (Ubah/Arsip/Hapus dengan warna berbeda).
- Tombol bahaya hanya untuk aksi yang benar-benar destruktif.

---

## 6. Grid & Spacing

- Kontainer maks 1180 px, padding halaman 24 px (desktop) / 16 px.
- Grid katalog: 4 kolom (≥1280 px) → 3 → 2 → 1 (di bawah 560 px).
- Skala ruang: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px.
- Seksi publik bergantian latar `krem-100` dan `krem-200` untuk ritme.

## 7. Bahasa Visual Antarmuka (copy)

- Nada: sopan, tenang, sedikit puitis namun jelas. Contoh label tombol: **"Lihat Detail"**, **"Saya Tertarik"**, **"Simpan Ayam"**.
- Penyebut harga: `Rp 3.500.000` atau tulisan **"Hubungi kami"** bila harga dirahasiakan.
- Status disebut apa adanya: **Tersedia · Dipesan · Terjual**.

## 8. Anti-Pola yang Dihindari ("anti AI-slop")

1. ❌ Gradasi ungu-biru-pink & neon.
2. ❌ Glassmorphism, kotak putih melayang dengan shadow tebal bertumpuk.
3. ❌ Emoji sebagai ikon utama.
4. ❌ Font sans-serif generik untuk seluruh tampilan publik.
5. ❌ Stok foto orang asing/barat untuk hero.
6. ❌ Sudut super-bulat (pill) pada semua kartu.
7. ❌ "Lorem ipsum" — gunakan contoh bahasa Indonesia yang relevan.

---
*Panduan ini diterapkan pada seluruh mockup dan menjadi acuan implementasi (M1–M4).*
