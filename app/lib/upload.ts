import { randomBytes } from "crypto";
import { mkdir, rm, writeFile, unlink } from "fs/promises";
import path from "path";
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

export async function simpanGambar(file: File): Promise<SavedImage> {
  const check = isAllowed(file);
  if (!check.ok) throw new Error(check.err);
  const ext = (ALLOWED.get(file.type) || ".jpg") as ".jpg" | ".png" | ".webp";
  const nama = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  let buf = Buffer.from(await file.arrayBuffer());
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
      contentType: file.type || "image/jpeg",
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
  const ext = (ALLOWED.get(file.type) || ".jpg") as ".jpg" | ".png" | ".webp";
  const nama = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  if (BLOB_AKTIF) {
    const { url } = await put(`profil/${nama}`, buf, {
      access: "public",
      contentType: file.type || "image/jpeg",
      addRandomSuffix: false,
    });
    return { filePath: url, fileName: nama, sizeKb: Math.round(buf.length / 1024) };
  }
  await mkdir(AVATAR_DIR, { recursive: true });
  await writeFile(path.join(AVATAR_DIR, nama), buf);
  return { filePath: `/uploads/avatar/${nama}`, fileName: nama, sizeKb: Math.round(buf.length / 1024) };
}
