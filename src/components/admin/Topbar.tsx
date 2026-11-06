"use client";

import { ExternalLink, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import Link from "next/link";
import { useRef, useSyncExternalStore } from "react";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { getCollapsed, setCollapsed, subscribe } from "./Sidebar";

const iconButton = "grid size-10 place-items-center rounded-full border border-line text-fg-soft transition hover:border-accent hover:text-accent";
const menuItem = "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-fg-soft transition hover:bg-surface-2 hover:text-fg";

export function Topbar({ email, signOutAction, onOpenMenu }: { email: string; signOutAction: () => Promise<void>; onOpenMenu: () => void }) {
  const collapsed = useSyncExternalStore(subscribe, getCollapsed, () => false);
  const menu = useRef<HTMLDivElement>(null);
  const hideMenu = () => menu.current?.hidePopover();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur-md sm:px-6 lg:px-10">
      <button type="button" onClick={onOpenMenu} aria-label="Ouvrir le menu" className={`${iconButton} lg:hidden`}>
        <Menu className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Déplier la barre latérale" : "Replier la barre latérale"}
        title={collapsed ? "Déplier" : "Replier"}
        className={`${iconButton} hidden lg:grid`}
      >
        {collapsed ? <PanelLeftOpen className="size-4" aria-hidden /> : <PanelLeftClose className="size-4" aria-hidden />}
      </button>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle label="Changer de thème" />
        <button
          type="button"
          popoverTarget="admin-profile-menu"
          aria-label="Menu du profil"
          className="grid size-10 place-items-center rounded-full bg-accent font-display font-semibold uppercase text-accent-fg ring-offset-2 ring-offset-bg transition hover:ring-2 hover:ring-accent"
        >
          {email.charAt(0) || "A"}
        </button>
      </div>

      {/* Native popover: top layer, light dismiss and Esc for free. */}
      <div
        ref={menu}
        id="admin-profile-menu"
        popover="auto"
        className="fixed inset-auto top-[4.5rem] right-4 m-0 w-64 rounded-xl border border-line bg-bg-elev p-2 text-fg shadow-2xl sm:right-6 lg:right-10"
      >
        <div className="border-b border-line px-3 pt-1 pb-3">
          <p className="text-sm font-medium">Administrateur</p>
          <p className="truncate font-mono text-xs text-muted">{email}</p>
        </div>
        <div className="py-1">
          <Link href="/admin/settings" onClick={hideMenu} className={menuItem}>
            <Settings className="size-4" aria-hidden /> Paramètres du site
          </Link>
          <a href="/" target="_blank" onClick={hideMenu} className={menuItem}>
            <ExternalLink className="size-4" aria-hidden /> Voir le site
          </a>
        </div>
        <form action={signOutAction} className="border-t border-line pt-1">
          <button type="submit" className={`${menuItem} hover:text-danger`}>
            <LogOut className="size-4" aria-hidden /> Se déconnecter
          </button>
        </form>
      </div>
    </header>
  );
}
