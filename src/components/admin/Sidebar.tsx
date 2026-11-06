"use client";

import {
  BarChart3,
  Boxes,
  Briefcase,
  Calculator,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  LineChart,
  Mail,
  MailPlus,
  MessagesSquare,
  Quote,
  Settings,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Activité",
    items: [
      { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Statistiques", icon: LineChart },
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
      { href: "/admin/invitations", label: "Inviter un client", icon: MailPlus },
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

// Desktop collapsed state, persisted per browser.
const KEY = "admin-sidebar";
const EVENT = "admin-sidebar-change";
export function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
export function getCollapsed() {
  try {
    return localStorage.getItem(KEY) === "collapsed";
  } catch {
    return false;
  }
}
export function setCollapsed(value: boolean) {
  try {
    localStorage.setItem(KEY, value ? "collapsed" : "expanded");
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function Sidebar({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  const stored = useSyncExternalStore(subscribe, getCollapsed, () => false);
  // The mobile drawer always shows labels.
  const collapsed = stored && !open;
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  const rowClass = "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition";

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-bg-elev transition-[transform,width] duration-200 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-[76px]" : "lg:w-64",
        )}
      >
        <div className={cn("mb-4 flex h-16 shrink-0 items-center gap-2 border-b border-line px-4", collapsed && "lg:justify-center lg:px-0")}>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent font-display font-bold text-accent-fg">JK</span>
          <span className={cn("font-mono text-sm", collapsed && "lg:hidden")}>
            admin<span className="text-accent">.</span>
          </span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Fermer le menu" className="ml-auto grid size-9 place-items-center rounded-lg text-muted hover:bg-surface lg:hidden">
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4" aria-label="Admin">
          {groups.map((g) => (
            <div key={g.label} className="mt-4 first:mt-0">
              <p className={cn("px-3 font-mono text-[10px] uppercase tracking-widest text-muted", collapsed && "lg:sr-only")}>{g.label}</p>
              <ul className="mt-2 space-y-1">
                {g.items.map(({ href, label, icon: Ico }) => {
                  const active = isActive(href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        title={collapsed ? label : undefined}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          rowClass,
                          "relative",
                          collapsed && "lg:justify-center lg:px-0",
                          active ? "bg-accent/10 font-medium text-fg" : "text-fg-soft hover:bg-surface hover:text-fg",
                        )}
                      >
                        {active ? <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent" aria-hidden /> : null}
                        <Ico className={cn("size-[18px] shrink-0", active && "text-accent")} aria-hidden />
                        <span className={cn("truncate", collapsed && "lg:sr-only")}>{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {open ? <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} aria-hidden /> : null}
    </>
  );
}
