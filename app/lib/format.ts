// Utilitas format & hitung (murni, dipakai server).

export function formatRupiah(n: number | null | undefined): string {
  if (n === null || n === undefined) return "Hubungi kami";
  return "Rp " + n.toLocaleString("id-ID");
}

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 90) || "ayam"
  );
}

export function formatTanggal(d: Date | null | undefined, bulanPanjang = false): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: bulanPanjang ? "long" : "short",
    year: "numeric",
  }).format(new Date(d));
}

export function formatTanggalLengkap(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: undefined,
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(d));
}

export function hariIniISO(): string {
  const d = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Menghitung usia dalam bulan antara tanggal menetas dan sekarang. */
export function usiaInfo(tanggalMenetas: Date | null | undefined): { bulan: number; label: string } | null {
  if (!tanggalMenetas) return null;
  const t = new Date(tanggalMenetas);
  const now = new Date();
  let bulan =
    (now.getFullYear() - t.getFullYear()) * 12 + (now.getMonth() - t.getMonth());
  if (now.getDate() < t.getDate()) bulan -= 1;
  if (bulan < 0) bulan = 0;
  const thn = Math.floor(bulan / 12);
  const sisa = bulan % 12;
  let label: string;
  if (thn >= 1 && sisa === 0) label = `± ${thn} tahun`;
  else if (thn >= 1) label = `± ${thn} th ${sisa} bln`;
  else label = `± ${bulan} bulan`;
  return { bulan, label };
}

export type Rekap = { menang: number; kalah: number; seri: number; total: number };

export function rekapDari(rows: { hasil: string }[]): Rekap {
  const r: Rekap = { menang: 0, kalah: 0, seri: 0, total: rows.length };
  for (const x of rows) {
    if (x.hasil === "MENANG") r.menang++;
    else if (x.hasil === "KALAH") r.kalah++;
    else if (x.hasil === "SERI") r.seri++;
  }
  return r;
}

export const KATEGORI_JENIS_FOTO = [
  { v: "FULL_BADAN", l: "Full badan" },
  { v: "KEPALA", l: "Kepala" },
  { v: "KAKI", l: "Kaki" },
  { v: "BULU", l: "Bulu / ekor" },
  { v: "LAINNYA", l: "Lainnya" },
] as const;

export const FOTO_WAJIB = ["FULL_BADAN", "KEPALA", "KAKI"];

export function labelJenisFoto(v: string | null | undefined): string {
  if (!v) return "Belum diatur";
  return KATEGORI_JENIS_FOTO.find((k) => k.v === v)?.l || v;
}

export function cekSyaratFoto(types: (string | null)[]): { ok: boolean; kurang: string[] } {
  const ada = new Set(types.filter(Boolean) as string[]);
  const kurang = FOTO_WAJIB.filter((f) => !ada.has(f));
  return { ok: kurang.length === 0, kurang };
}

export function statusJualInfo(v: string): { label: string; cls: string } {
  switch (v) {
    case "TERSEDIA": return { label: "Tersedia", cls: "tersedia" };
    case "DIPESAN": return { label: "Dipesan", cls: "dipesan" };
    case "TERJUAL": return { label: "Terjual", cls: "terjual" };
    default: return { label: v, cls: "draft" };
  }
}

export function jualStatusWarna(v: string): string {
  return statusJualInfo(v).cls;
}
