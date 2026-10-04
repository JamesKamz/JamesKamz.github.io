import { signOut } from "@/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { requireAdmin } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="lg:flex">
      <Sidebar email={session.user.email ?? ""} signOutAction={signOutAction} />
      <div className="min-w-0 flex-1 px-6 py-8 lg:px-10">{children}</div>
    </div>
  );
}
