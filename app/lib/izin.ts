import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { getOwner, readOwnerFromRequest } from "./auth";

/**
 * Izin per-modul (dipakai untuk akun berperan "ADMIN"; "PEMILIK" selalu lolos).
 * Kunci izin disimpan di kolom User.izin (String[]).
 */
export const MODUL = [
  { kunci: "ayam", label: "Data Ayam" },
  { kunci: "kategori", label: "Kategori" },
  { kunci: "riwayat", label: "Riwayat Tarung" },
  { kunci: "permintaan", label: "Permintaan Masuk" },
  { kunci: "laporan", label: "Laporan Katalog" },
  { kunci: "log", label: "Log Aktivitas" },
] as const;

export type KunciModul = (typeof MODUL)[number]["kunci"];

export const SEMUA_MODUL: KunciModul[] = MODUL.map((m) => m.kunci);

export function labelModul(kunci: string): string {
  return MODUL.find((m) => m.kunci === kunci)?.label ?? kunci;
}

/** Cek apakah pengguna boleh mengakses modul (PEMILIK selalu boleh). */
export function boleh(user: { role: string; izin: string[] }, kunci: KunciModul): boolean {
  if (user.role === "PEMILIK") return true;
  return user.izin.includes(kunci);
}

/**
 * Pengaman untuk route API panel. Mengembalikan pengguna bila berhak;
 * bila tidak login → redirect ke /panel/login, bila tak berizin → 403.
 */
export async function guardApi(req: Request, kunci: KunciModul) {
  const uid = readOwnerFromRequest(req);
  if (!uid) {
    return { user: null as null, res: NextResponse.redirect(new URL("/panel/login", req.url)) };
  }
  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) return { user: null as null, res: NextResponse.redirect(new URL("/panel/login", req.url)) };
  if (!user.aktif) {
    return { user: null as null, res: NextResponse.json({ err: "Akun dinonaktifkan." }, { status: 403 }) };
  }
  if (!boleh(user, kunci)) {
    return { user: null as null, res: NextResponse.json({ err: "Anda tidak memiliki izin untuk modul ini." }, { status: 403 }) };
  }
  return { user, res: null as null };
}

/** Pengaman khusus PEMILIK (kelola akun, dsb). */
export async function guardPemilik(req: Request) {
  const uid = readOwnerFromRequest(req);
  if (!uid) return { user: null as null, res: NextResponse.redirect(new URL("/panel/login", req.url)) };
  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) return { user: null as null, res: NextResponse.redirect(new URL("/panel/login", req.url)) };
  if (!user.aktif) return { user: null as null, res: NextResponse.json({ err: "Akun dinonaktifkan." }, { status: 403 }) };
  if (user.role !== "PEMILIK") {
    return { user: null as null, res: NextResponse.json({ err: "Hanya pemilik yang bisa mengelola akun." }, { status: 403 }) };
  }
  return { user, res: null as null };
}


/** Untuk halaman server panel: cek apakah pengguna boleh membuka modul ini. */
export async function cekModulHalaman(kunci: KunciModul): Promise<boolean> {
  const u = await getOwner();
  if (!u) return false;
  return boleh(u, kunci);
}
