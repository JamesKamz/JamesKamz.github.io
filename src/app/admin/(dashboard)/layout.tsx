import { signOut } from "@/auth";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { requireAdmin } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <DashboardShell email={session.user.email ?? ""} signOutAction={signOutAction}>
      {children}
    </DashboardShell>
  );
}
