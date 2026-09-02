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

/** PRNG deterministik sederhana (mulberry32) — pola stabil per foto. */
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedDariBuffer(buf: Buffer): number {
  let s = 0x9e3779b9;
  const n = Math.min(buf.length, 256);
  for (let i = 0; i < n; i++) s = (s * 31 + buf[i]) >>> 0;
  return s;
}

/**
 * Menempelkan watermark LOGO secara acak-tersebar (bukan pola garis/grid).
 * Setiap logo miring diagonal dengan sudut & ukuran bervariasi, dan logo
 * tetap sepenuhnya transparan (tanpa kotak latar). Dipanggil otomatis saat
 * foto diunggah.
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

  const rand = prng(seedDariBuffer(buf));
  const minSisi = Math.min(w, h);
  const base = Math.max(34, Math.round(minSisi * 0.13)); // tinggi dasar logo

  // berapa logo tersebar (acak) berdasarkan luas foto
  const cell = (2.7 * base) * (3.3 * base);
  const num = Math.min(16, Math.max(3, Math.round((w * h) / cell)));

  const overlay: { input: Buffer; left: number; top: number; opacity: number }[] = [];
  const placed: { x: number; y: number }[] = [];
  const margin = Math.round(base * 0.9);
  let guard = 0;

  while (overlay.length < num && guard < 140) {
    guard++;
    const skala = 0.85 + rand() * 0.5; // 0.85–1.35
    const lh = Math.round(base * skala);
    const lw = Math.max(24, Math.round(lh * rasio));
    const x = Math.round(margin + rand() * (w - 2 * margin - lw));
    const y = Math.round(margin + rand() * (h - 2 * margin - lh));
    // hindari bertumpuk terlalu dekat
    const terlaluDekat = placed.some(
      (p) => Math.hypot(p.x - (x + lw / 2), p.y - (y + lh / 2)) < base * 1.9
    );
    if (terlaluDekat) continue;

    // sudut miring diagonal acak (kebanyakan antara -75° s.d. -15°)
    const sudut = -(15 + rand() * 60);
    const imgLogo = sharp(logo).resize(lw, lh, { fit: "fill" });
    // bayangan: warnai ulang jadi gelap TANPA menghilangkan transparansi
    const gelap = await imgLogo
      .clone()
      .recomb([
        [0.07, 0, 0],
        [0, 0.05, 0],
        [0, 0, 0.04],
      ])
      .rotate(sudut, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const emas = await imgLogo
      .rotate(sudut, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    const dm = await sharp(gelap).metadata();
    const em = await sharp(emas).metadata();
    // pusat logo asli kira-kira di (x,y)
    const dl = Math.round((dm.width! - lw) / 2);
    const dt = Math.round((dm.height! - lh) / 2);
    overlay.push({ input: gelap, left: x - dl + 2, top: y - dt + 3, opacity: 0.4 });
    overlay.push({ input: emas, left: x - Math.round((em.width! - lw) / 2), top: y - Math.round((em.height! - lh) / 2), opacity: 0.85 });
    placed.push({ x: x + lw / 2, y: y + lh / 2 });
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
