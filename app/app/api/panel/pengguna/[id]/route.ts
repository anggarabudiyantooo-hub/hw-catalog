import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { guardPemilik, SEMUA_MODUL } from "@/lib/izin";
import { infodari } from "@/lib/requestinfo";
import { reqBase, redirectLocal } from "@/lib/auth";
import { firebaseAktif, firebaseHapusAkun, firebaseSyncSandi } from "@/lib/firebase";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const BASE = reqBase(req);
  const { user: owner, res } = await guardPemilik(req);
  if (res) return res;

  const id = Number(params.id);
  const fd = await req.formData();
  const act = String(fd.get("act") || "");
  const ref = req.headers.get("referer") || `${BASE}/panel/pengguna`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    const sTok = new URL(req.url).searchParams.get("s");
    if (sTok) u.searchParams.set("s", sTok);
    return redirectLocal(u.pathname + u.search);
  };

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return go(undefined, "Pengguna tidak ditemukan.");
  const proteksi = () =>
    target.id === owner!.id
      ? "Tidak bisa mengubah akun sendiri dari halaman ini."
      : target.role === "PEMILIK"
        ? "Akun pemilik tidak bisa diubah dari halaman ini."
        : null;

  const catat = async (aksi: string, detail: string) => {
    await prisma.log.create({
      data: { ...infodari(req), userId: owner!.id, aksi, entitas: "pengguna", entitasId: id, detail },
    }).catch(() => {});
  };

  if (act === "izin") {
    const blok = proteksi();
    if (blok) return go(undefined, blok);
    const izin = fd.getAll("izin").map((v) => String(v).trim()).filter((k) =>
      (SEMUA_MODUL as readonly string[]).includes(k)
    );
    await prisma.user.update({ where: { id }, data: { izin } });
    await catat("UBAH_IZIN", `Ubah izin admin "${target.nama}" -> ${izin.length ? izin.join(", ") : "(kosong)"}`);
    return go(`Izin "${target.nama}" diperbarui.`);
  }

  if (act === "aktif") {
    const blok = proteksi();
    if (blok) return go(undefined, blok);
    const aktif = fd.get("aktif") === "1";
    await prisma.user.update({ where: { id }, data: { aktif } });
    await catat("UBAH_STATUS", `${aktif ? "Aktifkan" : "Nonaktifkan"} akun admin "${target.nama}"`);
    return go(`Akun "${target.nama}" ${aktif ? "diaktifkan" : "dinonaktifkan"}.`);
  }

  if (act === "sandi") {
    const password = String(fd.get("password") || "");
    if (password.length < 6) return go(undefined, "Kata sandi minimal 6 karakter.");
    await prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 10) } });
    // Bila Firebase aktif, selaraskan juga sandinya di Firebase.
    if (firebaseAktif()) await firebaseSyncSandi(target.email, password);
    await catat("UPDATE", `Reset kata sandi admin "${target.nama}"`);
    return go(`Kata sandi "${target.nama}" di-reset.`);
  }

  if (act === "hapus") {
    const blok = proteksi();
    if (blok) return go(undefined, blok);
    await prisma.user.delete({ where: { id } });
    if (firebaseAktif()) await firebaseHapusAkun(target.email);
    await catat("DELETE", `Hapus akun admin "${target.nama}" (${target.email})`);
    return go(`Akun "${target.nama}" dihapus.`);
  }

  return go(undefined, "Aksi tidak dikenal.");
}
