
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSessionCookie, redirectLocal, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const fd = await req.formData();
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");

  const user = await prisma.user.findUnique({ where: { email } });
  const okHash = user && (await bcrypt.compare(password, user.passwordHash));

  if (!user || !okHash) {
    return redirectLocal("/panel/login?err=1");
  }

  // tetap set cookie (berfungsi normal di tab/domain standar), lalu bawa token
  // di URL sebagai fallback bila cookie diblokir (iframe lintas-situs).
  await setSessionCookie(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => {});
  return redirectLocal(`/panel?s=${createSession(user.id)}`);
}
