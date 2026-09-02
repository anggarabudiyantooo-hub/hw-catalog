import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

export type FotoExt = ".jpg" | ".png" | ".webp";

/** Lokasi logo watermark (PNG transparan) di dalam public/. */
const LOGO_PATH = path.join(process.cwd(), "public", "brand", "hw-logo.png");

let logoCache: Promise<Buffer> | null = null;
function logoBuf(): Promise<Buffer> {
  if (!logoCache) logoCache = readFile(LOGO_PATH);
  return logoCache;
}

// Parameter pola diagonal — diatur agar tidak mengganggu foto:
const SUDUT = -45; // semua logo miring diagonal seragam
const OP_EMAS = 0.5; // opasitas logo emas (diturunkan = makin transparan)
const OP_BAYANG = 0.2; // opasitas bayangan halus di belakang logo
const GAP_MAJU = 2.3; // jarak antar logo (× lebar logo) searah garis diagonal
const GAP_BARIS = 1.6; // jarak antar baris diagonal (× lebar logo)

/**
 * Menempelkan watermark LOGO dalam pola diagonal teratur (bukan acak,
 * bukan grid lurus). Logo tetap sepenuhnya transparan tanpa kotak latar,
 * dengan opasitas rendah agar tidak mengganggu foto. Dipanggil otomatis
 * saat foto diunggah.
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
    console.error("logo watermark tidak ditemukan:", LOGO_PATH);
    return buf;
  }
  const lm = await sharp(logo).metadata();
  const lw0 = lm.width ?? 500;
  const lh0 = lm.height ?? 500;
  const rasio = lw0 / lh0;

  const minSisi = Math.min(w, h);
  const base = Math.max(34, Math.round(minSisi * 0.13)); // ukuran dasar logo
  const lw = Math.max(24, Math.round(base * rasio));
  const lh = Math.round(base);

  const rad = (SUDUT * Math.PI) / 180;
  const ux = Math.cos(rad); // arah garis diagonal (sejajar kemiringan logo)
  const uy = Math.sin(rad);
  const ndx = -uy; // tegak lurus terhadap garis diagonal (antar baris)
  const ndy = ux;

  // Logo siap tempel: bayangan (gelap, alpha dipertahankan) & emas.
  const baseLogo = sharp(logo).resize(lw, lh, { fit: "fill" });
  const gelap = await baseLogo
    .clone()
    .recomb([
      [0.07, 0, 0],
      [0, 0.05, 0],
      [0, 0, 0.04],
    ])
    .rotate(SUDUT, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const emas = await baseLogo
    .rotate(SUDUT, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const dm = await sharp(gelap).metadata();
  const bw = dm.width ?? lw;
  const bh = dm.height ?? lh;

  // Kisi diagonal: langkah sepanjang garis (A) & antar garis (B).
  const A = Math.max(1, Math.round(bw * GAP_MAJU));
  const B = Math.max(1, Math.round(bh * GAP_BARIS));

  // Rentang pusat logo agar menutupi seluruh kanvas.
  const extU = (w * Math.abs(ux) + h * Math.abs(uy)) / 2 + bw;
  const extN = (w * Math.abs(ndx) + h * Math.abs(ndy)) / 2 + bh;
  const aMin = Math.floor(-extU / A);
  const aMax = Math.ceil(extU / A);
  const bMin = Math.floor(-extN / B);
  const bMax = Math.ceil(extN / B);

  const overlay: { input: Buffer; left: number; top: number; opacity: number }[] = [];
  const hw = Math.round(bw / 2);
  const hh = Math.round(bh / 2);
  for (let b = bMin; b <= bMax; b++) {
    for (let a = aMin; a <= aMax; a++) {
      const cx = Math.round(a * A * ux + b * B * ndx);
      const cy = Math.round(a * A * uy + b * B * ndy);
      const x0 = cx - hw;
      const y0 = cy - hh;
      if (x0 < 0 || y0 < 0 || x0 + bw > w || y0 + bh > h) continue;
      overlay.push({ input: gelap, left: x0 + 2, top: y0 + 3, opacity: OP_BAYANG });
      overlay.push({ input: emas, left: x0, top: y0, opacity: OP_EMAS });
    }
  }

  if (overlay.length === 0) return buf;

  const komposit = img.rotate().composite(overlay);
  switch (ext) {
    case ".jpg":
      return komposit.jpeg({ quality: 88 }).toBuffer();
    case ".png":
      return komposit.png().toBuffer();
    default:
      return komposit.webp({ quality: 86 }).toBuffer();
  }
}
