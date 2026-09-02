import sharp from "sharp";

/** Teks tanda air — ubah di sini bila ingin merek lain (mis. "JALU Catalog"). */
export const WATERMARK_TEKS = "HW Catalog";

export type FotoExt = ".jpg" | ".png" | ".webp";

function esc(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Menempelkan watermark diagonal halus ke gambar (buffer) lalu mengembalikan
 * buffer baru dengan format sama seperti aslinya. Dipakai saat unggah foto.
 */
export async function beriWatermark(buf: Buffer, ext: FotoExt, teks = WATERMARK_TEKS): Promise<Buffer> {
  const img = sharp(buf, { failOn: "none" });
  const meta = await img.metadata();
  const w = meta.width ?? 1200;
  const h = meta.height ?? 1200;

  const fs = Math.max(18, Math.round(Math.min(w, h) * 0.055));
  const tw = Math.ceil(fs * 7.8); // lebar ubin pola (≈ lebar teks + jarak)
  const th = Math.ceil(fs * 3.2); // tinggi ubin pola
  const cx = tw / 2;
  const cy = th / 2;

  const t = esc(teks);
  const font = `font-family="Georgia, 'Times New Roman', 'DejaVu Serif', serif" font-style="italic" font-weight="600" font-size="${fs}" letter-spacing="${Math.round(fs * 0.07)}"`;
  const anchor = `text-anchor="middle" dominant-baseline="central"`;

  // dua lapis: bayangan gelap tipis + lapis terang, agar terbaca di foto
  // terang maupun gelap, namun tetap samar (bukan menutupi detail ayam).
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="wm" width="${tw}" height="${th}" patternUnits="userSpaceOnUse" patternTransform="rotate(-30 0 0)">
      <g ${anchor}>
        <text x="${cx}" y="${cy + 1.4}" ${font} fill="rgba(26,8,5,0.20)">${t}</text>
        <text x="${cx}" y="${cy}" ${font} fill="rgba(255,249,232,0.16)">${t}</text>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#wm)"/>
</svg>`;

  const komposit = img.rotate().composite([{ input: Buffer.from(svg), top: 0, left: 0 }]);

  switch (ext) {
    case ".jpg":
      return komposit.jpeg({ quality: 88 }).toBuffer();
    case ".png":
      return komposit.png().toBuffer();
    default:
      return komposit.webp({ quality: 86 }).toBuffer();
  }
}
