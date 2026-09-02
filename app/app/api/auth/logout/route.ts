
import { clearSessionCookie, redirectLocal } from "@/lib/auth";

export async function POST(req: Request) {
  await clearSessionCookie();
  return redirectLocal("/panel/login");
}
