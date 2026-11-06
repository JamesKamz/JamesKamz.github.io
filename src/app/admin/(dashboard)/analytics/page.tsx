import { Activity, Eye, Radio, Users } from "lucide-react";
import Link from "next/link";
import { MonthlyBarChart } from "@/components/admin/MonthlyBarChart";
import { NoDatabase, PageHeader } from "@/components/admin/PageHeader";
import { Prisma } from "@/generated/prisma/client";
import { daysAgo } from "@/lib/admin/leads";
import { getDb } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata = { title: "Statistiques" };

const RANGES = [7, 30, 90] as const;
type Row = { key: string | null; views: number; visitors: number };

const countryName = new Intl.DisplayNames(["fr"], { type: "region" });
const flag = (code: string) => String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)));
const country = (code: string | null) => (code ? `${flag(code)} ${countryName.of(code) ?? code}` : "Inconnu");
const day = (d: Date) => d.toISOString().slice(0, 10);

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  const db = getDb();
  if (!db) return <NoDatabase />;
  const sp = await searchParams;
  const days = RANGES.find((r) => String(r) === sp.range) ?? 30;
  const since = daysAgo(days);

  // Column names come from this fixed list only, never from the request.
  const top = (column: "path" | "referrer" | "country" | "device" | "browser" | "os" | "locale", limit = 8) =>
    db.$queryRaw<Row[]>`
      SELECT ${Prisma.raw(`"${column}"`)} AS key, count(*)::int AS views, count(DISTINCT "visitorId")::int AS visitors
      FROM "PageView" WHERE "createdAt" >= ${since}
      GROUP BY 1 ORDER BY 2 DESC LIMIT ${limit}`;

  const [[totals], [live], daily, pages, referrers, countries, cities, devices, browsers, systems, locales, recent] = await Promise.all([
    db.$queryRaw<{ views: number; visitors: number }[]>`
      SELECT count(*)::int AS views, count(DISTINCT "visitorId")::int AS visitors FROM "PageView" WHERE "createdAt" >= ${since}`,
    db.$queryRaw<{ visitors: number }[]>`
      SELECT count(DISTINCT "visitorId")::int AS visitors FROM "PageView" WHERE "createdAt" >= ${new Date(Date.now() - 5 * 60_000)}`,
    db.$queryRaw<{ day: Date; views: number; visitors: number }[]>`
      SELECT date_trunc('day', "createdAt") AS day, count(*)::int AS views, count(DISTINCT "visitorId")::int AS visitors
      FROM "PageView" WHERE "createdAt" >= ${since} GROUP BY 1 ORDER BY 1`,
    top("path", 10),
    top("referrer"),
    top("country"),
    db.$queryRaw<(Row & { country: string | null })[]>`
      SELECT "city" AS key, "country", count(*)::int AS views, count(DISTINCT "visitorId")::int AS visitors
      FROM "PageView" WHERE "createdAt" >= ${since} AND "city" IS NOT NULL
      GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 8`,
    top("device"),
    top("browser"),
    top("os"),
    top("locale"),
    db.pageView.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  // Fill days without visits so the chart has one bar per day.
  const byDay = new Map(daily.map((d) => [day(d.day), d]));
  const series = Array.from({ length: days }, (_, i) => {
    const date = daysAgo(days - 1 - i);
    const hit = byDay.get(day(date));
    return { label: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), value: hit?.views ?? 0, count: hit?.visitors ?? 0 };
  });

  const tiles = [
    { label: "Pages vues", value: totals?.views ?? 0, icon: Eye },
    { label: "Visiteurs uniques", value: totals?.visitors ?? 0, icon: Users },
    { label: "Pages par visiteur", value: totals?.visitors ? (totals.views / totals.visitors).toFixed(1) : "0", icon: Activity },
    { label: "En ligne (5 min)", value: live?.visitors ?? 0, icon: Radio },
  ];

  return (
    <>
      <PageHeader title="Statistiques" description="Visites du site public, sans cookie. Les visiteurs sont comptés par une empreinte anonyme : aucune adresse IP n'est stockée.">
        <div className="flex rounded-full border border-line p-1 text-sm">
          {RANGES.map((r) => (
            <Link key={r} href={`/admin/analytics?range=${r}`} className={cn("rounded-full px-3 py-1.5 transition", r === days ? "bg-surface-2 text-fg" : "text-muted hover:text-fg")}>
              {r} j
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map(({ label, value, icon: Ico }) => (
          <div key={label} className="card p-5">
            <Ico className="size-5 text-accent" aria-hidden />
            <p className="mt-4 font-display text-3xl font-semibold tabular-nums">{typeof value === "number" ? value.toLocaleString("fr-FR") : value}</p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="card mt-6 p-6">
        <MonthlyBarChart title={`Pages vues par jour (${days} derniers jours)`} data={series} unit="number" valueLabel="Vues" countLabel="Visiteurs" periodLabel="Jour" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TopList title="Pages les plus vues" rows={pages} />
        <TopList title="Sources (sites référents)" rows={referrers} empty="Accès direct uniquement pour l'instant" fallback="Accès direct" />
        <TopList title="Pays" rows={countries.map((r) => ({ ...r, key: country(r.key) }))} />
        <TopList title="Villes" rows={cities.map((r) => ({ ...r, key: `${r.country ? `${flag(r.country)} ` : ""}${r.key}` }))} empty="Disponible une fois le site déployé sur Vercel" />
        <TopList title="Appareils" rows={devices.map((r) => ({ ...r, key: DEVICES[r.key ?? ""] ?? r.key }))} />
        <TopList title="Langue du site" rows={locales.map((r) => ({ ...r, key: (r.key ?? "").toUpperCase() }))} />
        <TopList title="Navigateurs" rows={browsers} />
        <TopList title="Systèmes" rows={systems} />
      </div>

      <section className="card mt-6 overflow-x-auto">
        <h2 className="px-5 pt-5 font-medium">Dernières visites</h2>
        <table className="mt-3 w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-line text-left font-mono text-xs text-muted">
              <th className="px-5 py-3 font-normal">Date</th>
              <th className="px-5 py-3 font-normal">Page</th>
              <th className="px-5 py-3 font-normal">Visiteur</th>
              <th className="px-5 py-3 font-normal">Localisation</th>
              <th className="px-5 py-3 font-normal">Appareil</th>
              <th className="px-5 py-3 font-normal">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {recent.map((v) => (
              <tr key={v.id} className="hover:bg-surface-2">
                <td className="whitespace-nowrap px-5 py-2.5 text-xs text-muted">{v.createdAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                <td className="max-w-[16rem] truncate px-5 py-2.5 font-mono text-xs">{v.path}</td>
                <td className="px-5 py-2.5 font-mono text-xs text-muted" title="Empreinte anonyme du visiteur">#{v.visitorId.slice(0, 6)}</td>
                <td className="px-5 py-2.5">{v.country ? `${flag(v.country)} ${v.city ?? countryName.of(v.country) ?? v.country}` : <span className="text-muted">—</span>}</td>
                <td className="px-5 py-2.5 text-fg-soft">{[DEVICES[v.device] ?? v.device, v.browser, v.os].filter(Boolean).join(" · ")}</td>
                <td className="px-5 py-2.5 text-fg-soft">{v.referrer ?? <span className="text-muted">Direct</span>}</td>
              </tr>
            ))}
            {!recent.length ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">Aucune visite enregistrée pour l&apos;instant.</td></tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </>
  );
}

const DEVICES: Record<string, string> = { desktop: "Ordinateur", mobile: "Mobile", tablet: "Tablette" };

function TopList({ title, rows, empty = "Aucune donnée", fallback = "Inconnu" }: { title: string; rows: Row[]; empty?: string; fallback?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.views));
  return (
    <section className="card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-medium">{title}</h2>
        <span className="font-mono text-[11px] text-muted">vues · visiteurs</span>
      </div>
      <ul className="mt-4 space-y-1.5">
        {rows.map((r, i) => (
          <li key={`${r.key}-${i}`} className="relative flex items-center justify-between gap-3 overflow-hidden rounded-lg px-3 py-1.5 text-sm">
            <span className="absolute inset-y-0 left-0 rounded-lg bg-accent/10" style={{ width: `${(r.views / max) * 100}%` }} aria-hidden />
            <span className="relative truncate">{r.key ?? fallback}</span>
            <span className="relative shrink-0 font-mono text-xs tabular-nums text-fg-soft">
              {r.views.toLocaleString("fr-FR")} · {r.visitors.toLocaleString("fr-FR")}
            </span>
          </li>
        ))}
        {!rows.length ? <li className="py-4 text-center text-sm text-muted">{empty}</li> : null}
      </ul>
    </section>
  );
}
