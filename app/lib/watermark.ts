import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

export type FotoExt = ".jpg" | ".png" | ".webp";

/** Lokasi logo watermark (PNG transparan) di dalam public/. */
const LOGO_PATH = path.join(process.cwd(), "public", "brand", "hw-logo.png");

// Uji cepat bahwa logo ada (dipanggil sekali saat modul dipakai).
let logoCache: Promise<Buffer> | null = null;
function logoBuf(): Promise<Buffer> {
  if (!logoCache) logoCache = readFile(LOGO_PATH);
  return logoCache;
}

function bbox(grid: { left: number; top: number }[], w: number, h: number, side: number) {
  // hanya untuk memastikan ada tile yang masuk area
  return grid.some((g) => g.left < w && g.top < h && g.left + side > 0 && g.top + side > 0);
}

/**
 * Menempelkan watermark logo (diagonal, diulang) ke buffer foto lalu
 * mengembalikan buffer dengan format sama seperti aslinya.
 * Dipanggil otomatis setiap kali foto diunggah.
 */
export async function beriWatermark(
  buf: Buffer,
  ext: FotoExt,
  _legacyText?: string
): Promise<Buffer> {
  const img = sharp(buf, { failOn: "none" });
  const meta = await img.metadata();
  const w = meta.width ?? 1200;
  const h = meta.height ?? 1200;

  let logo: Buffer;
  try {
    logo = await logoBuf();
  } catch {
    // bila file logo belum ada, jangan gagalkan unggahan — kirim asli
    console.error("logo watermark tidak ditemukan:", LOGO_PATH);
    return buf;
  }
  const lm = await sharp(logo).metadata();
  const lw0 = lm.width ?? 654;
  const lh0 = lm.height ?? 683;

  // ukuran logo di foto: ±15% dari sisi terpendek
  const lh = Math.max(40, Math.round(Math.min(w, h) * 0.15));
  const lw = Math.max(38, Math.round((lh * lw0) / lh0));

  const logoResized = await sharp(logo).resize(lw, lh, { fit: "fill" }).png().toBuffer();
  // siluet gelap untuk kontras di foto terang (bayangan tipis)
  const shadow = await sharp(logoResized).flatten({ background: "#221408" }).png().toBuffer();

  // rakit posisi tile secara diagonal (mengikuti kemiringan -20°)
  const sx = Math.round(lw * 1.45);
  const sy = Math.round(lh * 2.1);
  const gold: { input: Buffer; left: number; top: number; opacity: number }[] = [];
  const shd: { input: Buffer; left: number; top: number; opacity: number }[] = [];
  const halfLw = lw / 2;

  // jumlah baris menjamin menutupi; offset antar kolom memberi efek miring
  const nCols = Math.ceil(w / sx) + 2;
  const rows = Math.ceil(h / sy) + 2;
  for (let c = -1; c < nCols; c++) {
    for (let r = -1; r < rows; r++) {
      const x = Math.round(c * sx - halfLw + (r % 2) * (sx * 0.5));
      const y = Math.round(r * sy - lh);
      if (x + lw < 0 || y + lh < 0 || x > w || y > h) continue;
      shd.push({ input: shadow, left: x + 1, top: y + 1, opacity: 0.42 });
      gold.push({ input: logoResized, left: x, top: y, opacity: 0.85 });
    }
  }
  if (!bbox([...gold, ...shd], w, h, lw)) return buf;

  const komposit = img.rotate().composite([...shd, ...gold]);

  switch (ext) {
    case ".jpg":
      return komposit.jpeg({ quality: 88 }).toBuffer();
    case ".png":
      return komposit.png().toBuffer();
    default:
      return komposit.webp({ quality: 86 }).toBuffer();
  }
}
