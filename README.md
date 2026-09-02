# Jalu — Galeri Ayam Bangkok

> **Status proyek: Fase Desain (M0).** Repository berisi PRD, ERD, skema basis data, sistem desain, dan mockup visual awal.
> Nama produk "Jalu" adalah *working title* dan mudah diganti.

Sistem web **etalase satu kandang** untuk menampilkan ayam Bangkok sekaligus sarana penjualan: **CRUD lengkap termasuk unggah banyak gambar per ayam**, usia yang dihitung otomatis dari tanggal menetas, login pemilik tunggal, dan penerimaan permintaan ("Saya Tertarik") dari pengunjung. (rev 2.0)

- 📄 **PRD** → [`docs/PRD.md`](docs/PRD.md)
- 🗂️ **ERD** → [`docs/ERD.md`](docs/ERD.md) · diagram SVG → [`docs/diagrams/erd.svg`](docs/diagrams/erd.svg)
- 🗃️ **Skema SQL (MySQL 8)** → [`docs/schema.sql`](docs/schema.sql)
- 🎨 **Sistem Desain** → [`design/DESIGN.md`](design/DESIGN.md)
- 🖼️ **Mockup (mandiri, buka langsung di browser)** →
  - Beranda publik → [`design/mockup-beranda.html`](design/mockup-beranda.html)
  - Katalog + filter → [`design/mockup-katalog.html`](design/mockup-katalog.html)
  - Detail ayam + form minat → [`design/mockup-detail.html`](design/mockup-detail.html)
  - Panel Admin (CRUD) → [`design/mockup-admin.html`](design/mockup-admin.html)

## Keputusan Teknis Awal (hasil kesepakatan)

| Aspek | Keputusan |
|---|---|
| Stack | Next.js (App Router) + React, TypeScript |
| Basis data | MySQL 8 (via Prisma ORM), skema awal di `docs/schema.sql` |
| Tujuan | Katalog display **+ info penjualan** (harga & status) |
| Hak akses | **Pemilik tunggal** (satu akun login) + pengunjung publik |
| Desain | **Merah bata & krem** — hangat, lokal, berkelas (bukan template AI generik) |

## Struktur Folder

```
ayam-bangkok-studio/
├── docs/            # PRD, ERD, skema SQL, diagram
├── design/          # sistem desain + mockup HTML & aset gambar
├── assets/          # (cadangan) aset lain di masa depan
└── README.md
```

## Peta Jalan Singkat

1. **M0 · Desain (sekarang):** PRD, ERD, skema, sistem desain, mockup — *sedang direvisi → disetujui.*
2. **M1 · Pondasi:** Scaffold Next.js + Prisma, login pemilik tunggal, layout panel.
3. **M2 · CRUD Ayam:** Manajemen data ayam + multi-gambar + kategori + status jual.
4. **M3 · Publik:** Beranda, katalog + filter, halaman detail, form "Saya Tertarik".
5. **M4 · Rapi & Rilis:** Log aktivitas, pengaturan, pengujian, deployment.
