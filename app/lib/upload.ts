import { randomBytes } from "crypto";
import { mkdir, rm, writeFile, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { beriWatermark } from "./watermark";
// Penyimpanan objek Vercel Blob dipakai di produksi; di dev tanpa token,
// import ini tetap aman (library hanya aktif saat fungsi dipanggil).
import { put, del } from "@vercel/blob";

export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (batas masukan)
const ALLOWED = new Set<string>(["image/jpeg", "image/png", "image/webp"]);

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
/** Aktif bila di lingkungan Vercel (token Blob tersedia). */
export const BLOB_AKTIF = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Content-type untuk file hasil (selalu WebP). */
export const MIME_WEBP = "image/webp";

export interface SavedImage {
  /** URL publik: "/uploads/...webp" (lokal) atau "https://…blob.vercel-storage.com/…webp" */
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
// Kompresi & konversi otomatis → WebP (kecil + kualitas baik)
// ---------------------------------------------------------------------------

/** Sisi terpanjang maksimum foto galeri setelah dikompres (px). */
export const FOTO_MAX_SISI = 1920;
/** Sisi terpanjang maksimum foto profil setelah dikompres (px). */
export const AVATAR_MAX_SISI = 512;
/**
 * Kualitas WebP hasil (0–100). 82 memberi hasil visual sangat dekat dengan asli
 * untuk foto — rata-rata jauh lebih kecil daripada JPG kualitas setara.
 * (`alphaQuality` hanya dipakai bila gambar punya transparansi; `effort` tinggi
 * sedikit memperlambat enkode tetapi hasilnya lebih ringkas.)
 */
const KUALITAS_WEBP = 82;
const KUALITAS_ALPHA = 90;
const EFFORT = 5;

/**
 * Kompres + ubah satu gambar menjadi WEBP:
 * - sisi terpanjang dipangkas agar tidak melebihi `maxSisi` (rasio tetap,
 *   tanpa pernah memperbesar);
 * - orientasi EXIF dibenahi dan seluruh metadata/EXIF dibuang;
 * - dienkode WebP (transparansi otomatis dipertahankan bila ada).
 * Format apa pun yang masuk (JPG/PNG/WebP) keluar sebagai WebP.
 */
async function kompresWebp(buf: Buffer, maxSisi: number): Promise<Buffer> {
  // Metadata diambil dari input asli (sebelum transformasi).
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

  const img = sharp(buf, { failOn: "none" }).rotate(); // terapkan orientasi EXIF
  const selesai =
    tw === wOut && th === hOut
      ? img
      : img.resize(tw, th, { fit: "inside", withoutEnlargement: true });
  return selesai
    .webp({ quality: KUALITAS_WEBP, alphaQuality: KUALITAS_ALPHA, effort: EFFORT })
    .toBuffer();
}

export async function simpanGambar(file: File): Promise<SavedImage> {
  const check = isAllowed(file);
  if (!check.ok) throw new Error(check.err);
  const nama = `${Date.now()}-${randomBytes(4).toString("hex")}.webp`;
  let buf = Buffer.from(await file.arrayBuffer());
  // Kompresi otomatis + konversi ke WebP (perkecil dimensi, buang EXIF).
  try {
    buf = await kompresWebp(buf, FOTO_MAX_SISI);
  } catch (e) {
    console.error("kompresi gagal, lanjut tanpa kompresi:", e);
  }
  // Tanda air (watermark) otomatis — dienkode ulang sebagai WebP.
  try {
    buf = await beriWatermark(buf, ".webp");
  } catch (e) {
    console.error("watermark gagal, simpan asli:", e);
  }
  if (BLOB_AKTIF) {
    // Produksi: simpan ke Vercel Blob → URL permanen.
    const { url } = await put(`galeri/${nama}`, buf, {
      access: "public",
      contentType: MIME_WEBP,
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
 * Mengikuti pola simpanGambar: dikompres + dikonversi ke WebP, dev lokal ke
 * public/uploads/avatar, produksi ke Vercel Blob berprefix "profil/".
 */
export async function simpanAvatar(file: File): Promise<SavedImage> {
  const check = isAllowed(file);
  if (!check.ok) throw new Error(check.err);
  const nama = `${Date.now()}-${randomBytes(4).toString("hex")}.webp`;
  let buf = Buffer.from(await file.arrayBuffer());
  try {
    buf = await kompresWebp(buf, AVATAR_MAX_SISI);
  } catch (e) {
    console.error("kompresi avatar gagal, lanjut asli:", e);
  }
  if (BLOB_AKTIF) {
    const { url } = await put(`profil/${nama}`, buf, {
      access: "public",
      contentType: MIME_WEBP,
      addRandomSuffix: false,
    });
    return { filePath: url, fileName: nama, sizeKb: Math.round(buf.length / 1024) };
  }
  await mkdir(AVATAR_DIR, { recursive: true });
  await writeFile(path.join(AVATAR_DIR, nama), buf);
  return { filePath: `/uploads/avatar/${nama}`, fileName: nama, sizeKb: Math.round(buf.length / 1024) };
}
