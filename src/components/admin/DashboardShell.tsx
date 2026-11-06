"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/** Sidebar + top navbar; owns the mobile drawer state they share. */
export function DashboardShell({ email, signOutAction, children }: { email: string; signOutAction: () => Promise<void>; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:flex">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="min-w-0 flex-1">
        <Topbar email={email} signOutAction={signOutAction} onOpenMenu={() => setOpen(true)} />
        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
