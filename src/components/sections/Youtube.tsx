import { Play } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { BrandIcon } from "@/components/icons/BrandIcon";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClass } from "@/components/ui/Button";
import type { SettingsView, StatView } from "@/lib/types";
import { compactNumber } from "@/lib/utils";
import type { YoutubeChannel } from "@/lib/youtube";

export async function Youtube({
  channel,
  settings,
  stats,
  locale,
}: {
  channel: YoutubeChannel | null;
  settings: SettingsView;
  stats: StatView[];
  locale: string;
}) {
  if (!settings.youtube) return null;
  const t = await getTranslations("youtube");
  const manual = stats.find((s) => s.key === "youtubeSubscribers");
  const subscribers = channel?.subscribers ?? (manual?.visible && manual.value > 0 ? manual.value : null);
  const subscribeUrl = `${settings.youtube.replace(/\/$/, "")}?sub_confirmation=1`;

  return (
    <section className="relative overflow-hidden border-y border-line bg-bg-elev py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading kicker={t("kicker")} title={t("title")} subtitle={t("subtitle")} />
          <div className="flex flex-wrap items-center gap-4">
            {subscribers !== null ? (
              <p className="font-mono text-sm text-fg-soft">
                <span className="font-display text-3xl font-semibold text-fg">{compactNumber(subscribers, locale)}</span>{" "}
                {t("subscribersLabel")}
              </p>
            ) : null}
            <a href={subscribeUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "bg-[#c4001f] text-white")}>
              <BrandIcon brand="youtube" className="size-4" />
              {t("subscribe")}
            </a>
          </div>
        </div>

        {channel && channel.videos.length ? (
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {channel.videos.map((video, i) => (
              <li key={video.id}>
                <Reveal delay={(i % 3) * 0.08}>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card group block overflow-hidden transition hover:-translate-y-1 hover:border-line-strong"
                  >
                    <div className="relative aspect-video overflow-hidden bg-surface-2">
                      {video.thumbnail ? (
                        <Image src={video.thumbnail} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                      ) : null}
                      <span className="absolute inset-0 grid place-items-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                        <span className="grid size-14 place-items-center rounded-full bg-[#ff0033] text-white">
                          <Play className="size-6 fill-current" aria-hidden />
                        </span>
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="line-clamp-2 font-medium">{video.title}</h3>
                      <p className="mt-2 font-mono text-xs text-muted">
                        {new Date(video.publishedAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <a
            href={settings.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="card group mt-14 flex flex-col items-start gap-4 p-8 transition hover:border-line-strong sm:flex-row sm:items-center"
          >
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#ff0033] text-white">
              <BrandIcon brand="youtube" className="size-8" />
            </span>
            <span>
              <span className="block font-display text-2xl font-semibold">@{settings.youtubeHandle ?? "JamesKamz"}</span>
              <span className="mt-1 block text-fg-soft">{t("fallback")}</span>
            </span>
            <span className="font-mono text-sm text-accent sm:ml-auto">{t("watch")} →</span>
          </a>
        )}
      </div>
    </section>
  );
}
