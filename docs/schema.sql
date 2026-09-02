-- =====================================================================
--  JALU — Galeri Ayam Bangkok
--  Skema Basis Data MySQL 8.x  (DDL)  — rev.3 sesuai keputusan pemilik
--  Perubahan rev.2:
--    1. Umur TIDAK disimpan (angka cepat basi) — cukup tanggal menetas,
--       usia dihitung otomatis oleh aplikasi saat ditampilkan.
--    2. Kolom "asal kota" dihapus — satu peternakan, satu lokasi.
--    3. Multi-user (admin/petugas) disederhanakan -> SATU akun pemilik.
--    4. ayam_images.jenis_foto (full badan/kepala/kaki/bulu/lainnya) untuk
--       ketentuan foto wajib sebelum publikasi.
--    Catatan: efek "Terjual -> foto hitam-putih" adalah tampilan aplikasi,
--       bukan kolom basis data (file asli selalu berwarna).
--  Sumber referensi: docs/PRD.md dan docs/ERD.md
-- =====================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- 1. USERS — akun pemilik/pengelola (tunggal)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nama           VARCHAR(100)    NOT NULL,
    email          VARCHAR(150)    NOT NULL,
    password_hash  VARCHAR(255)    NOT NULL,          -- bcrypt/argon2
    last_login_at  TIMESTAMP       NULL,
    created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. KATEGORI — golongan ayam (tulen, birma, thailand F1, lokal, ...)
-- ---------------------------------------------------------------------
CREATE TABLE kategori (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nama        VARCHAR(80)     NOT NULL,
    slug        VARCHAR(90)     NOT NULL,
    deskripsi   TEXT            NULL,
    urutan      INT             NOT NULL DEFAULT 0,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_kategori_nama (nama),
    UNIQUE KEY uq_kategori_slug (slug)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. AYAM — entitas pusat katalog
-- ---------------------------------------------------------------------
CREATE TABLE ayam (
    id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug             VARCHAR(120)    NOT NULL,
    kode_ring        VARCHAR(30)     NULL,            -- nomor ring kaki; unik bila diisi
    nama             VARCHAR(120)    NOT NULL,
    kategori_id      BIGINT UNSIGNED NULL,
    jenis_kelamin    ENUM('JANTAN','BETINA') NOT NULL,
    tanggal_menetas  DATE            NULL,            -- perkiraan; usia = dihitung aplikasi
    berat_kg         DECIMAL(5,2)    NOT NULL,        -- berat terakhir yang dicatat
    warna_bulu       VARCHAR(80)     NULL,
    keunggulan       TEXT            NULL,
    deskripsi        TEXT            NULL,
    harga            DECIMAL(12,0)   NULL,            -- NULL = "Hubungi kami"
    status_jual      ENUM('TERSEDIA','DIPESAN','TERJUAL') NOT NULL DEFAULT 'TERSEDIA',
    status_tampil    ENUM('DRAFT','PUBLIKASI') NOT NULL DEFAULT 'DRAFT',
    is_featured      TINYINT(1)      NOT NULL DEFAULT 0, -- unggulan beranda (maks. 3)
    is_arsip         TINYINT(1)      NOT NULL DEFAULT 0, -- soft delete
    published_at     TIMESTAMP       NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_ayam_slug (slug),
    UNIQUE KEY uq_ayam_kode_ring (kode_ring),
    KEY idx_ayam_publik (status_tampil, status_jual, is_arsip),
    KEY idx_ayam_kategori (kategori_id),
    KEY idx_ayam_menetas (tanggal_menetas),
    KEY idx_ayam_featured (is_featured),
    CONSTRAINT fk_ayam_kategori FOREIGN KEY (kategori_id)
        REFERENCES kategori (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. AYAM_IMAGES — galeri foto (1 ayam → banyak gambar)
-- ---------------------------------------------------------------------
CREATE TABLE ayam_images (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ayam_id         BIGINT UNSIGNED NOT NULL,
    file_path       VARCHAR(255)    NOT NULL,         -- path relatif (di luar folder publik di produksi)
    file_path_thumb VARCHAR(255)    NOT NULL,
    ukuran_kb       INT             NULL,
    lebar_px        INT             NULL,
    tinggi_px       INT             NULL,
    alt_text        VARCHAR(255)    NULL,
    jenis_foto      ENUM('FULL_BADAN','KEPALA','KAKI','BULU','LAINNYA') NULL, -- posisi foto; wajib: full badan, kepala, kaki
    is_primary      TINYINT(1)      NOT NULL DEFAULT 0, -- foto utama kartu (maks. 1 per ayam)
    urutan          INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_images_ayam (ayam_id, urutan),
    KEY idx_images_primary (ayam_id, is_primary),
    CONSTRAINT fk_images_ayam FOREIGN KEY (ayam_id)
        REFERENCES ayam (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. PERMINTAAN — form "Saya Tertarik" dari pengunjung (via web publik)
-- ---------------------------------------------------------------------
CREATE TABLE permintaan (
    id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ayam_id          BIGINT UNSIGNED NULL,            -- tetap tersimpan bila ayam dihapus
    nama_pengunjung  VARCHAR(120)    NOT NULL,
    no_wa            VARCHAR(25)     NOT NULL,
    kota             VARCHAR(100)    NULL,            -- domisili calon pembeli (opsional)
    pesan            TEXT            NULL,
    status           ENUM('BARU','DIHUBUNGI','DEAL','BATAL') NOT NULL DEFAULT 'BARU',
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_permintaan_ayam (ayam_id),
    KEY idx_permintaan_status (status, created_at),
    CONSTRAINT fk_permintaan_ayam FOREIGN KEY (ayam_id)
        REFERENCES ayam (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. AKTIVITAS_LOG — jejak perubahan (dilihat pemilik)
-- ---------------------------------------------------------------------
CREATE TABLE aktivitas_log (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id     BIGINT UNSIGNED NULL,                 -- pelaku (pemilik)
    aksi        ENUM('LOGIN','CREATE','UPDATE','DELETE','ARSIP','PULIHKAN',
                     'UBAH_STATUS','LAINNYA') NOT NULL,
    entitas     VARCHAR(50)     NOT NULL,             -- mis. 'ayam', 'ayam_images', 'permintaan'
    entitas_id  BIGINT UNSIGNED NULL,
    detail      JSON            NULL,                 -- ringkasan perubahan
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_log_user (user_id, created_at),
    KEY idx_log_entitas (entitas, entitas_id),
    CONSTRAINT fk_log_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- DATA AWAL (seed minimal)
-- =====================================================================

-- Akun pemilik (kata sandi di-hash saat instalasi aplikasi)
INSERT INTO users (nama, email, password_hash)
VALUES ('H. Suroto', 'admin@jalu.id', '<DIISI_OLEH_APP>');

-- Kategori contoh
INSERT INTO kategori (nama, slug, deskripsi, urutan) VALUES
('Bangkok Tulen',      'bangkok-tulen',        'Ayam Bangkok asli darah Thailand, seleksi ketat garis juara.', 1),
('Bangkok Birma',      'bangkok-birma',        'Kombinasi Bangkok–Birma: pukulan keras, tenaga panjang.',    2),
('Bangkok Thailand F1','bangkok-thailand-f1',  'Hasil impor F1 dari Thailand, postur ideal laga.',              3),
('Bangkok Lokal',      'bangkok-lokal',        'Kualitas tangguh hasil pemeliharaan lokal terpilih.',           4),
('Betina / Indukan',   'betina-indukan',       'Indukan betina terpilih untuk program pembibitan.',              5);
