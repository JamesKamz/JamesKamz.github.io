import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Defense in depth: every admin page and server action re-checks the session. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin/login");
  return session;
}
