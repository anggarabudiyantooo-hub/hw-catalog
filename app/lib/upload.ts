import { randomBytes } from "crypto";
import { mkdir, rm, writeFile, unlink } from "fs/promises";
import path from "path";

export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export interface SavedImage {
  filePath: string; // path publik mulai "/uploads/..."
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
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = ALLOWED.get(file.type) || ".jpg";
  const nama = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, nama), buf);
  return { filePath: `/uploads/${nama}`, fileName: nama, sizeKb: Math.round(buf.length / 1024) };
}

export async function hapusFile(filePath: string | null | undefined) {
  if (!filePath) return;
  if (!filePath.startsWith("/uploads/")) return; // hanya hapus file upload lokal
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
