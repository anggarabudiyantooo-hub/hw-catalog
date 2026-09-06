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

// Parameter pola watermark — logo besar, satu lapis, opasitas seragam:
const TILTS = [-45, 45]; // miring selang-seling: logo berikutnya kiri/kanan bergantian
const OP_LOGO = 0.05; // opasitas logo — sangat samar, seolah-olah tak terlihat (0.05)
const UKURAN = 0.2; // ukuran logo = 20% sisi terkecil foto (diperbesar dari 13%)
const GAP_MAJU = 2.5; // jarak antar logo (× lebar logo) searah garis diagonal
const GAP_BARIS = 1.8; // jarak antar baris diagonal (× lebar logo)
const STAGGER = true; // tiap baris digeser setengah langkah → efek zigzag

/**
 * Menempelkan watermark LOGO: posisi pada kisi diagonal dengan miring yang
 * SELANG-SELING (-45°/+45°) sehingga antar logo tampak zigzag, plus tiap
 * baris digeser setengah langkah. Satu lapis transparan sangat rendah (0.05)
 * sehingga nyaris tak terlihat; ukuran logo dibuat besar agar tetap terbaca
 * bila diperhatikan. Dipanggil otomatis saat foto diunggah.
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
  const base = Math.max(44, Math.round(minSisi * UKURAN)); // ukuran dasar logo
  const lw = Math.max(24, Math.round(base * rasio));
  const lh = Math.round(base);

  // Logo siap tempel untuk tiap kemiringan (alpha dipertahankan, tanpa lapis bayangan).
  const tiles: { emas: Buffer; bw: number; bh: number }[] = [];
  for (const t of TILTS) {
    const emas = await sharp(logo)
      .resize(lw, lh, { fit: "fill" })
      .rotate(t, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const m = await sharp(emas).metadata();
    tiles.push({ emas, bw: m.width ?? lw, bh: m.height ?? lh });
  }
  const bw = tiles[0].bw;
  const bh = tiles[0].bh;

  // Kisi diagonal: langkah sepanjang garis (A) & antar garis (B).
  const A = Math.max(1, Math.round(bw * GAP_MAJU));
  const B = Math.max(1, Math.round(bh * GAP_BARIS));

  const rad = (TILTS[0] * Math.PI) / 180; // arah baris mengikuti kemiringan dasar
  const ux = Math.cos(rad);
  const uy = Math.sin(rad);
  const ndx = -uy;
  const ndy = ux;

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
    // geser setengah langkah pada baris ganjil → pola tidak sejajar lurus
    const stag = STAGGER && (b & 1) !== 0 ? 0.5 * A : 0;
    const ox = stag * ux;
    const oy = stag * uy;
    for (let a = aMin; a <= aMax; a++) {
      const cx = Math.round(a * A * ux + b * B * ndx + ox);
      const cy = Math.round(a * A * uy + b * B * ndy + oy);
      const x0 = cx - hw;
      const y0 = cy - hh;
      if (x0 < 0 || y0 < 0 || x0 + bw > w || y0 + bh > h) continue;
      const tile = tiles[(a + b) & 1]; // miring selang-seling antar logo
      overlay.push({ input: tile.emas, left: x0, top: y0, opacity: OP_LOGO });
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
