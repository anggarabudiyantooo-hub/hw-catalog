import { clearSessionCookie, redirectLocal, readOwnerFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { infodari } from "@/lib/requestinfo";

export async function POST(req: Request) {
  const meta = infodari(req);
  const uid = readOwnerFromRequest(req);
  if (uid) {
    const user = await prisma.user.findUnique({ where: { id: uid } }).catch(() => null);
    await prisma.log.create({
      data: {
        aksi: "LOGOUT",
        entitas: "auth",
        entitasId: uid,
        detail: user ? `Logout: ${user.nama}` : "Logout",
        email: user?.email ?? null,
        ip: meta.ip,
        negara: meta.negara,
        kota: meta.kota,
        perangkat: meta.perangkat,
        browser: meta.browser,
        os: meta.os,
        userId: uid,
      },
    }).catch(() => {});
  }
  await clearSessionCookie();
  return redirectLocal("/panel/login");
}
