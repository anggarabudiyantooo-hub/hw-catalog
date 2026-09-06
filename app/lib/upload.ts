import { randomBytes } from "crypto";
import { mkdir, rm, writeFile, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { beriWatermark } from "./watermark";
// Penyimpanan objek Vercel Blob dipakai di produksi; di dev tanpa token,
// import ini tetap aman (library hanya aktif saat fungsi dipanggil).
import { put, del } from "@vercel/blob";

export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
/** Aktif bila di lingkungan Vercel (token Blob tersedia). */
export const BLOB_AKTIF = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export interface SavedImage {
  /** URL publik: "/uploads/..." (lokal) atau "https://…blob.vercel-storage.com/…" */
  filePath: string;
  fileName: string;
  sizeKb: number;
}

export function isAllowed(file: File): { ok: boolean; err?: string } {
  if (!ALLOWED.has(file.type)) return { ok: false, err: "Hanya JPG/PNG/WebP yang diperbolehkan." };
  if (file.size > MAX_BYTES) return { ok: false, err: "Ukuran gambar maksimal 5 MB." };
  if (file.size === 0) return { ok: false, err: "File kosong." };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Kompresi otomatis setiap foto unggahan
// ---------------------------------------------------------------------------

/** Sisi terpanjang maksimum foto galeri setelah dikompres (px). */
export const FOTO_MAX_SISI = 1920;
/** Sisi terpanjang maksimum foto profil setelah dikompres (px). */
export const AVATAR_MAX_SISI = 512;
/** Kualitas enkode (0–100) untuk JPG/WebP hasil kompresi. */
const KUALITAS_JPG = 82;
const KUALITAS_WEBP = 82;

export type FormatFoto = ".jpg" | ".png" | ".webp";

/** Peta content-type per format (dipakai saat menyimpan ke Blob/Vercel). */
export const MIME: Record<FormatFoto, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export interface HasilKompres {
  buf: Buffer;
  ext: FormatFoto;
}

/**
 * Kompres & perkecil satu gambar:
 * - sisi terpanjang dipangkas agar tidak melebihi `maxSisi` (tanpa memperbesar);
 * - orientasi EXIF dibenahi, metadata EXIF dibuang;
 * - PNG yang TIDAK punya transparansi otomatis diubah ke JPG (jauh lebih kecil);
 * - PNG ber-transparansi tetap PNG (level 9); JPG/WebP dienkode kualitas 82.
 * Mengembalikan buffer + format akhir (bisa berbeda dari input, mis. PNG→JPG).
 */
async function kompresFoto(
  buf: Buffer,
  ext: FormatFoto,
  maxSisi: number
): Promise<HasilKompres> {
  // Baca metadata dari input asli (sebelum transformasi).
  const info = await sharp(buf, { failOn: "none" }).metadata();
  const w = info.width ?? 1920;
  const h = info.height ?? 1920;
  const orientasi = info.orientation ?? 1;
  // Orientasi EXIF 90°/270° (5–8) menukar lebar↔tinggi pada keluaran setelah .rotate().
  const swap = orientasi >= 5 && orientasi <= 8;
  const wOut = swap ? h : w;
  const hOut = swap ? w : h;

  const sisi = Math.max(wOut, hOut);
  let tw = wOut;
  let th = hOut;
  if (sisi > maxSisi) {
    const skala = maxSisi / sisi;
    tw = Math.max(1, Math.round(wOut * skala));
    th = Math.max(1, Math.round(hOut * skala));
  }

  // PNG tanpa transparansi nyata → ubah ke JPG agar jauh lebih ringan.
  // "Tanpa transparansi" = tak punya kanal alpha, ATAU kanal alpha-nya nyaris
  // pekat penuh (>250 dari 255) di seluruh gambar (banyak ekspor PNG menyertakan
  // alpha walau sebenarnya foto pekat). PNG semi-transparan tetap dipertahankan.
  let jadiJpg = false;
  if (ext === ".png") {
    if (!info.hasAlpha) {
      jadiJpg = true; // PNG RGB polos (tanpa kanal alpha) → foto, aman jadi JPG.
    } else {
      // Punya kanal alpha: periksa nilai nyatanya. Bila seluruh piksel ≥ 251
      // (nyaris/benar-benar pekat), perlakukan sebagai foto → JPG. PNG yang
      // memakai transparansi sungguhan tetap dipertahankan sebagai PNG.
      const { data } = await sharp(buf, { failOn: "none" })
        .extractChannel(3) // kanal alpha saja → 1 byte/piksel
        .raw()
        .toBuffer({ resolveWithObject: true });
      let pekat = true;
      for (let i = 0; i < data.length; i++) {
        if (data[i] < 251) {
          pekat = false;
          break;
        }
      }
      jadiJpg = pekat;
    }
  }
  const formatAkhir: FormatFoto = jadiJpg ? ".jpg" : ext;

  const img = sharp(buf, { failOn: "none" }).rotate(); // terapkan orientasi EXIF
  const selesai =
    tw === wOut && th === hOut
      ? img
      : img.resize(tw, th, { fit: "inside", withoutEnlargement: true });
  switch (formatAkhir) {
    case ".jpg":
      // flatten putih agar kanal alpha (bila ada) tak membiaskan warna tepi.
      return {
        buf: await selesai.flatten({ background: { r: 255, g: 255, b: 255 } }).jpeg({ quality: KUALITAS_JPG, mozjpeg: true }).toBuffer(),
        ext: ".jpg",
      };
    case ".webp":
      return { buf: await selesai.webp({ quality: KUALITAS_WEBP }).toBuffer(), ext: ".webp" };
    default:
      return { buf: await selesai.png({ compressionLevel: 9 }).toBuffer(), ext: ".png" };
  }
}

export async function simpanGambar(file: File): Promise<SavedImage> {
  const check = isAllowed(file);
  if (!check.ok) throw new Error(check.err);
  const extAwal = (ALLOWED.get(file.type) || ".jpg") as FormatFoto;
  let buf = Buffer.from(await file.arrayBuffer());
  let ext: FormatFoto = extAwal;
  // Kompresi otomatis: perkecil dimensi, enkode ulang, PNG pekat → JPG (buang EXIF).
  try {
    const hasil = await kompresFoto(buf, extAwal, FOTO_MAX_SISI);
    buf = hasil.buf;
    ext = hasil.ext;
  } catch (e) {
    console.error("kompresi gagal, lanjut tanpa kompresi:", e);
  }
  const nama = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  // Tanda air (watermark) otomatis pada setiap foto unggahan.
  try {
    buf = await beriWatermark(buf, ext);
  } catch (e) {
    console.error("watermark gagal, simpan asli:", e);
  }
  if (BLOB_AKTIF) {
    // Produksi: simpan ke Vercel Blob → URL permanen.
    const { url } = await put(`galeri/${nama}`, buf, {
      access: "public",
      contentType: MIME[ext],
      addRandomSuffix: false,
    });
    return { filePath: url, fileName: nama, sizeKb: Math.round(buf.length / 1024) };
  }
  // Dev lokal: tulis ke public/uploads.
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, nama), buf);
  return { filePath: `/uploads/${nama}`, fileName: nama, sizeKb: Math.round(buf.length / 1024) };
}

export async function hapusFile(filePath: string | null | undefined) {
  if (!filePath) return;
  // Foto Blob (URL http) → hapus dari Vercel Blob.
  if (/^https?:\/\//.test(filePath)) {
    try {
      await del(filePath);
    } catch (e) {
      console.error("gagal hapus blob:", filePath, e);
    }
    return;
  }
  // File lokal: hanya upload dinamis (/uploads/…), JANGAN foto seed demo.
  if (!filePath.startsWith("/uploads/") || filePath.startsWith("/uploads/seed/")) return;
  const full = path.join(process.cwd(), "public", filePath);
  try {
    await unlink(full);
  } catch {
    // file mungkin sudah tidak ada — abaikan
  }
}

/** Baca daftar file dari FormData (field 'images', bisa multipel). */
export function ambilFiles(form: FormData, field = "images"): File[] {
  const out: File[] = [];
  const val = form.getAll(field);
  for (const v of val) {
    if (v instanceof File && v.size > 0) out.push(v);
  }
  return out;
}

/** Hapus folder upload demo bila perlu dibersihkan. */
export async function hapusFileUpload(nama: string) {
  const full = path.join(UPLOAD_DIR, nama);
  try {
    await rm(full, { force: true });
  } catch {}
}

/** Direktori khusus avatar profil (lokal). */
export const AVATAR_DIR = path.join(process.cwd(), "public", "uploads", "avatar");

/**
 * Simpan foto profil (tanpa tanda air, folder terpisah dari galeri ayam).
 * Mengikuti pola simpanGambar: dev lokal ke public/uploads/avatar, produksi ke
 * Vercel Blob berprefix "profil/".
 */
export async function simpanAvatar(file: File): Promise<SavedImage> {
  const check = isAllowed(file);
  if (!check.ok) throw new Error(check.err);
  const extAwal = (ALLOWED.get(file.type) || ".jpg") as FormatFoto;
  // Kompresi otomatis (tanpa tanda air): avatar cukup kecil (ditampilkan ≤ 120px).
  let buf = Buffer.from(await file.arrayBuffer());
  let ext: FormatFoto = extAwal;
  try {
    const hasil = await kompresFoto(buf, extAwal, AVATAR_MAX_SISI);
    buf = hasil.buf;
    ext = hasil.ext;
  } catch (e) {
    console.error("kompresi avatar gagal, lanjut asli:", e);
  }
  const nama = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  if (BLOB_AKTIF) {
    const { url } = await put(`profil/${nama}`, buf, {
      access: "public",
      contentType: MIME[ext],
      addRandomSuffix: false,
    });
    return { filePath: url, fileName: nama, sizeKb: Math.round(buf.length / 1024) };
  }
  await mkdir(AVATAR_DIR, { recursive: true });
  await writeFile(path.join(AVATAR_DIR, nama), buf);
  return { filePath: `/uploads/avatar/${nama}`, fileName: nama, sizeKb: Math.round(buf.length / 1024) };
}
