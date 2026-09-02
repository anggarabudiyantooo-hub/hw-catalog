-- =====================================================================
--  JALU — Galeri Ayam Bangkok
--  Skema Basis Data MySQL 8.x  (DDL)
--  Sumber referensi: docs/PRD.md dan docs/ERD.md
--  Catatan: charset utf8mb4 untuk mendukung emoji/latin penuh & collation
--           case-insensitive Indonesia (ci).
-- =====================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- 1. USERS — pengguna sistem (admin & petugas)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nama           VARCHAR(100)    NOT NULL,
    email          VARCHAR(150)    NOT NULL,
    no_hp          VARCHAR(25)     NULL,
    password_hash  VARCHAR(255)    NOT NULL,           -- bcrypt/argon2
    role           ENUM('ADMIN','PETUGAS') NOT NULL DEFAULT 'PETUGAS',
    is_active      TINYINT(1)      NOT NULL DEFAULT 1,
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
    umur_bulan       INT             NOT NULL,
    berat_kg         DECIMAL(5,2)    NOT NULL,
    warna_bulu       VARCHAR(80)     NULL,
    asal             VARCHAR(120)    NULL,
    keunggulan       TEXT            NULL,
    deskripsi        TEXT            NULL,
    harga            DECIMAL(12,0)   NULL,            -- NULL = "Hubungi kami"
    status_jual      ENUM('TERSEDIA','DIPESAN','TERJUAL') NOT NULL DEFAULT 'TERSEDIA',
    status_tampil    ENUM('DRAFT','PUBLIKASI') NOT NULL DEFAULT 'DRAFT',
    is_featured      TINYINT(1)      NOT NULL DEFAULT 0, -- unggulan beranda (maks. 3)
    is_arsip         TINYINT(1)      NOT NULL DEFAULT 0, -- soft delete
    created_by       BIGINT UNSIGNED NULL,
    published_at     TIMESTAMP       NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_ayam_slug (slug),
    UNIQUE KEY uq_ayam_kode_ring (kode_ring),
    KEY idx_ayam_publik (status_tampil, status_jual, is_arsip),
    KEY idx_ayam_kategori (kategori_id),
    KEY idx_ayam_featured (is_featured),
    KEY idx_ayam_created_by (created_by),
    CONSTRAINT fk_ayam_kategori FOREIGN KEY (kategori_id)
        REFERENCES kategori (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_ayam_created_by FOREIGN KEY (created_by)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. AYAM_IMAGES — galeri foto (1 ayam → banyak gambar)
-- ---------------------------------------------------------------------
CREATE TABLE ayam_images (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ayam_id         BIGINT UNSIGNED NOT NULL,
    file_path       VARCHAR(255)    NOT NULL,         -- path relatif file (di luar publik di produksi)
    file_path_thumb VARCHAR(255)    NOT NULL,
    ukuran_kb       INT             NULL,
    lebar_px        INT             NULL,
    tinggi_px       INT             NULL,
    alt_text        VARCHAR(255)    NULL,
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
-- 5. PERMINTAAN — form "Saya Tertarik" dari pengunjung
-- ---------------------------------------------------------------------
CREATE TABLE permintaan (
    id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ayam_id          BIGINT UNSIGNED NULL,            -- tetap tersimpan bila ayam dihapus
    nama_pengunjung  VARCHAR(120)    NOT NULL,
    no_wa            VARCHAR(25)     NOT NULL,
    kota             VARCHAR(100)    NULL,
    pesan            TEXT            NULL,
    status           ENUM('BARU','DIHUBUNGI','DEAL','BATAL') NOT NULL DEFAULT 'BARU',
    created_by       BIGINT UNSIGNED NULL,            -- NULL = dikirim via web publik
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_permintaan_ayam (ayam_id),
    KEY idx_permintaan_status (status, created_at),
    KEY idx_permintaan_created_by (created_by),
    CONSTRAINT fk_permintaan_ayam FOREIGN KEY (ayam_id)
        REFERENCES ayam (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_permintaan_created_by FOREIGN KEY (created_by)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. AKTIVITAS_LOG — jejak audit ringan (hanya admin yang melihat)
-- ---------------------------------------------------------------------
CREATE TABLE aktivitas_log (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id     BIGINT UNSIGNED NULL,                 -- pelaku; NULL = anonim
    aksi        ENUM('LOGIN','CREATE','UPDATE','DELETE','ARSIP','PULIHKAN',
                     'UBAH_STATUS','KELOLA_USER','KELOLA_KATEGORI','LAINNYA') NOT NULL,
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

-- Pengguna awal: admin@jalu.id / (kata sandi di-hash saat instalasi aplikasi)
INSERT INTO users (nama, email, no_hp, password_hash, role)
VALUES ('Admin Utama', 'admin@jalu.id', NULL, '<DIISI_OLEH_APP>', 'ADMIN');

-- Kategori contoh
INSERT INTO kategori (nama, slug, deskripsi, urutan) VALUES
('Bangkok Tulen',      'bangkok-tulen',        'Ayam Bangkok asli darah Thailand, seleksi ketat garis juara.', 1),
('Bangkok Birma',      'bangkok-birma',        'Kombinasi Bangkok–Birma: pukulan keras, tenaga panjang.',    2),
('Bangkok Thailand F1','bangkok-thailand-f1',  'Hasil impor F1 dari Thailand, postur ideal laga.',              3),
('Bangkok Lokal',      'bangkok-lokal',        'Kualitas tangguh hasil pemeliharaan lokal terpilih.',           4),
('Betina / Indukan',   'betina-indukan',       'Indukan betina terpilih untuk program pembibitan.',              5);
