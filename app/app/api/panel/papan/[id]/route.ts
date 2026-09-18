import { purgPublik } from "@/lib/purg";
import { prisma } from "@/lib/prisma";
import { guardPemilik } from "@/lib/izin";
import { infodari } from "@/lib/requestinfo";
import { reqBase, redirectLocal } from "@/lib/auth";

/**
 * Ubah / aktifkan / nonaktifkan / hapus papan pengumuman (khusus pemilik).
 * act = update | aktif | kedip | hapus (pola yang sama dengan modul lain).
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const BASE = reqBase(req);
  const { user, res } = await guardPemilik(req);
  if (res) return res;

  const id = Number(params.id);
  const fd = await req.formData();
  const act = String(fd.get("act") || "update");
  const ref = req.headers.get("referer") || `${BASE}/panel/papan`;
  const go = (ok?: string, err?: string) => {
    const u = new URL(ref, BASE);
    if (ok) u.searchParams.set("ok", ok);
    if (err) u.searchParams.set("err", err);
    return redirectLocal(u.pathname + u.search);
  };

  const papan = await prisma.papanInfo.findUnique({ where: { id } });
  if (!papan) return go(undefined, "Papan tidak ditemukan.");

  if (act === "aktif") {
    const aktif = !papan.aktif;
    await prisma.papanInfo.update({ where: { id }, data: { aktif } });
    await prisma.log.create({
      data: { ...infodari(req), userId: user!.id, aksi: "UPDATE", entitas: "papan", entitasId: id, detail: `${aktif ? "Aktifkan" : "Nonaktifkan"} papan "${papan.judul}"` },
    }).catch(() => {});
    await purgPublik();
    return go(aktif ? "Papan diaktifkan — tampil di situs." : "Papan dinonaktifkan — tidak tampil di situs.");
  }

  if (act === "kedip") {
    const kedip = !papan.kedip;
    await prisma.papanInfo.update({ where: { id }, data: { kedip } });
    await prisma.log.create({
      data: { ...infodari(req), userId: user!.id, aksi: "UPDATE", entitas: "papan", entitasId: id, detail: `${kedip ? "Nyalakan" : "Matikan"} kedip pada papan "${papan.judul}"` },
    }).catch(() => {});
    await purgPublik();
    return go(kedip ? "Kedap-kedip dinyalakan." : "Kedap-kedip dimatikan.");
  }

  if (act === "update") {
    const judul = String(fd.get("judul") || "").trim();
    if (!judul) return go(undefined, "Judul wajib diisi.");
    const jenis = String(fd.get("jenis") || papan.jenis).toUpperCase();
    if (!["PERINGATAN", "IKLAN", "INFO"].includes(jenis)) return go(undefined, "Jenis papan tidak dikenal.");
    await prisma.papanInfo.update({
      where: { id },
      data: {
        judul,
        pesan: String(fd.get("pesan") || "").trim(),
        jenis,
        kedip: fd.get("kedip") === "on",
        aktif: fd.get("aktif") === "on",
        urutan: Number(fd.get("urutan")) || 0,
      },
    });
    await prisma.log.create({
      data: { ...infodari(req), userId: user!.id, aksi: "UPDATE", entitas: "papan", entitasId: id, detail: `Ubah papan "${judul}"` },
    }).catch(() => {});
    await purgPublik();
    return go("Papan diperbarui.");
  }

  if (act === "hapus") {
    await prisma.papanInfo.delete({ where: { id } });
    await prisma.log.create({
      data: { ...infodari(req), userId: user!.id, aksi: "DELETE", entitas: "papan", entitasId: id, detail: `Hapus papan "${papan.judul}"` },
    }).catch(() => {});
    await purgPublik();
    return go("Papan dihapus.");
  }

  return go(undefined, "Aksi tidak dikenal.");
}
