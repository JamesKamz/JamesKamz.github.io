"use client";

import {
  BarChart3,
  Boxes,
  Briefcase,
  Calculator,
  ExternalLink,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessagesSquare,
  Quote,
  Settings,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Activité",
    items: [
      { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
      { href: "/admin/leads", label: "Leads & budgets", icon: Briefcase },
      { href: "/admin/messages", label: "Messages", icon: Mail },
      { href: "/admin/conversations", label: "Conversations IA", icon: MessagesSquare },
    ],
  },
  {
    label: "Contenu",
    items: [
      { href: "/admin/projects", label: "Projets", icon: FolderKanban },
      { href: "/admin/testimonials", label: "Témoignages", icon: Quote },
      { href: "/admin/services", label: "Services", icon: Sparkles },
      { href: "/admin/skills", label: "Compétences", icon: Wrench },
      { href: "/admin/experiences", label: "Expériences", icon: Boxes },
      { href: "/admin/stats", label: "Chiffres clés", icon: BarChart3 },
      { href: "/admin/faq", label: "FAQ chatbot", icon: HelpCircle },
    ],
  },
  {
    label: "Configuration",
    items: [
      { href: "/admin/pricing", label: "Tarifs estimateur", icon: Calculator },
      { href: "/admin/settings", label: "Paramètres du site", icon: Settings },
    ],
  },
];

export function Sidebar({ email, signOutAction }: { email: string; signOutAction: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="font-mono text-sm">jk/admin</span>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Menu" className="grid size-9 place-items-center rounded-lg border border-line">
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-bg-elev transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="grid size-8 place-items-center rounded-lg bg-accent font-display font-bold text-accent-fg">JK</span>
          <span className="font-mono text-sm">
            admin<span className="text-accent">.</span>
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Admin">
          {groups.map((g) => (
            <div key={g.label} className="mt-4">
              <p className="px-3 font-mono text-[10px] uppercase tracking-widest text-muted">{g.label}</p>
              <ul className="mt-2 space-y-0.5">
                {g.items.map(({ href, label, icon: Ico }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                        isActive(href) ? "bg-surface-2 text-fg" : "text-fg-soft hover:bg-surface hover:text-fg",
                      )}
                    >
                      <Ico className={cn("size-4", isActive(href) && "text-accent")} aria-hidden />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-line p-3 text-sm">
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-fg-soft hover:bg-surface">
            <ExternalLink className="size-4" aria-hidden /> Voir le site
          </a>
          <form action={signOutAction}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-fg-soft hover:bg-surface">
              <LogOut className="size-4" aria-hidden /> Déconnexion
            </button>
          </form>
          <p className="truncate px-3 pt-2 font-mono text-[11px] text-muted">{email}</p>
        </div>
      </aside>
      {open ? <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden /> : null}
    </>
  );
}
