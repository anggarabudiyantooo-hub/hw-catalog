import { prisma } from "@/lib/prisma";
import { readOwnerFromRequest, reqBase, redirectLocal } from "@/lib/auth";
import { simpanAvatar } from "@/lib/upload";
import { infodari } from "@/lib/requestinfo";

export async function POST(req: Request) {
  const BASE = reqBase(req);
  const uid = readOwnerFromRequest(req);
  if (!uid) return redirectLocal("/panel/login");

  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) return redirectLocal("/panel/login");
  if (!user.aktif) return redirectLocal("/panel/login?err=2");

  const ref = req.headers.get("referer") || `${BASE}/panel/profil`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    const sTok = new URL(req.url).searchParams.get("s");
    if (sTok) u.searchParams.set("s", sTok);
    return redirectLocal(u.pathname + u.search);
  };

  const fd = await req.formData();
  const act = String(fd.get("act") || "");

  if (act === "avatar") {
    const file = fd.get("avatar");
    if (!(file instanceof File)) return go(undefined, "Pilih berkas gambar dulu.");
    try {
      const saved = await simpanAvatar(file);
      // Hapus avatar lokal lama bila ada
      if (user.avatarUrl?.startsWith("/uploads/avatar/")) {
        try {
          const { unlink } = await import("fs/promises");
          const path = await import("path");
          await unlink(path.join(process.cwd(), "public", user.avatarUrl!)).catch(() => {});
        } catch { /* abaikan */ }
      }
      await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: saved.filePath } });
      await prisma.log.create({
        data: {
          ...infodari(req), userId: user.id, aksi: "UPDATE", entitas: "pengguna", entitasId: user.id,
          detail: `Ubah foto profil ${user.nama}`,
        },
      }).catch(() => {});
      return go("Foto profil diperbarui.");
    } catch (e) {
      return go(undefined, e instanceof Error ? e.message : "Gagal menyimpan foto profil.");
    }
  }

  if (act === "nama") {
    const nama = String(fd.get("nama") || "").trim();
    if (!nama) return go(undefined, "Nama tidak boleh kosong.");
    await prisma.user.update({ where: { id: user.id }, data: { nama } });
    await prisma.log.create({
      data: {
        ...infodari(req), userId: user.id, aksi: "UPDATE", entitas: "pengguna", entitasId: user.id,
        detail: `Ubah nama profil menjadi "${nama}"`,
      },
    }).catch(() => {});
    return go("Nama profil diperbarui.");
  }

  return go(undefined, "Aksi tidak dikenal.");
}
