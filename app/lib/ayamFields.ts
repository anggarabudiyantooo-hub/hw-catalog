// Mengurai field umum ayam dari FormData (create & update).
export interface AyamData {
  nama: string;
  kodeRing: string | null;
  kategoriId: number | null;
  jenisKelamin: string;
  tanggalMenetas: Date | null;
  beratKg: number;
  warnaBulu: string | null;
  postur: string | null;
  tinggiCm: number | null;
  kakiSisik: string | null;
  jalu: string | null;
  keunggulan: string | null;
  deskripsi: string | null;
  harga: number | null;
  statusJual: string;
  statusTampil: string;
  isFeatured: boolean;
}

export function parseAyam(fd: FormData): { ok: true; data: AyamData } | { ok: false; err: string } {
  const str = (k: string) => {
    const v = fd.get(k);
    return typeof v === "string" ? v.trim() : "";
  };
  const strOrNull = (k: string) => {
    const v = str(k);
    return v ? v : null;
  };

  const nama = str("nama");
  if (!nama) return { ok: false, err: "Nama ayam wajib diisi." };

  const beratKg = parseFloat(str("beratKg").replace(",", "."));
  if (!isFinite(beratKg) || beratKg <= 0) return { ok: false, err: "Berat badan wajib diisi (angka, mis. 3.6)." };

  const kategoriIdRaw = Number(str("kategoriId"));
  const kategoriId = str("kategoriId") && isFinite(kategoriIdRaw) && kategoriIdRaw > 0 ? kategoriIdRaw : null;

  const tgl = str("tanggalMenetas");
  const tanggalMenetas = tgl && !isNaN(Date.parse(tgl)) ? new Date(tgl + "T00:00:00") : null;

  const tinggi = parseFloat(str("tinggiCm").replace(",", "."));
  const tinggiCm = str("tinggiCm") && isFinite(tinggi) && tinggi > 0 ? tinggi : null;

  const hargaStr = str("harga").replace(/[^0-9]/g, "");
  const harga = hargaStr ? parseInt(hargaStr, 10) : null;

  return {
    ok: true,
    data: {
      nama,
      kodeRing: strOrNull("kodeRing"),
      kategoriId,
      jenisKelamin: str("jenisKelamin") === "BETINA" ? "BETINA" : "JANTAN",
      tanggalMenetas,
      beratKg,
      warnaBulu: strOrNull("warnaBulu"),
      postur: strOrNull("postur"),
      tinggiCm,
      kakiSisik: strOrNull("kakiSisik"),
      jalu: strOrNull("jalu"),
      keunggulan: strOrNull("keunggulan"),
      deskripsi: strOrNull("deskripsi"),
      harga,
      statusJual: ["TERSEDIA", "DIPESAN", "TERJUAL"].includes(str("statusJual")) ? str("statusJual") : "TERSEDIA",
      statusTampil: str("statusTampil") === "PUBLIKASI" ? "PUBLIKASI" : "DRAFT",
      isFeatured: fd.get("isFeatured") === "on",
    },
  };
}

export function cekJenisFotoTerpenuhi(jenis: (string | null | undefined)[]): string[] {
  const ada = new Set(jenis.filter(Boolean) as string[]);
  const wajib = ["FULL_BADAN", "KEPALA", "KAKI"];
  return wajib.filter((w) => !ada.has(w));
}
