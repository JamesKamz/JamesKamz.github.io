"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, RotateCcw, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { buttonClass } from "@/components/ui/Button";
import { computeEstimate, CURRENCIES, formatMoney, type PricingConfig } from "@/lib/budget";
import { cn } from "@/lib/utils";
import { leadSchema } from "@/lib/validation";
import { Field, Honeypot } from "./Field";

const contactPart = leadSchema.pick({ name: true, email: true, phone: true, company: true, message: true, website: true });
type ContactIn = z.input<typeof contactPart>;
type ContactOut = z.output<typeof contactPart>;

const STEPS = ["type", "features", "timeline", "design", "result"] as const;
type Step = (typeof STEPS)[number];

type Option = { key: string; labelFr: string; labelEn: string; hint?: string };

function OptionCard({
  option,
  selected,
  multi,
  onSelect,
  hint,
  locale,
}: {
  option: Option;
  selected: boolean;
  multi?: boolean;
  onSelect: () => void;
  hint?: string;
  locale: string;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group flex w-full items-start gap-3 rounded-xl border p-4 text-left transition",
        selected ? "border-accent bg-accent/10" : "border-line bg-bg-elev hover:border-line-strong",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center border transition",
          multi ? "rounded-md" : "rounded-full",
          selected ? "border-accent bg-accent text-accent-fg" : "border-line-strong",
        )}
        aria-hidden
      >
        {selected ? <Check className="size-3.5" strokeWidth={3} /> : null}
      </span>
      <span>
        <span className="block font-medium">{locale === "en" ? option.labelEn : option.labelFr}</span>
        {hint ? <span className="mt-0.5 block font-mono text-xs text-muted">{hint}</span> : null}
      </span>
    </button>
  );
}

export function BudgetWizard({ pricing }: { pricing: PricingConfig }) {
  const t = useTranslations("budget");
  const tc = useTranslations("contact");
  const locale = useLocale();
  const [step, setStep] = useState<Step>("type");
  const [projectType, setProjectType] = useState<string>("");
  const [features, setFeatures] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<string>("standard");
  const [design, setDesign] = useState<string>("custom");
  const [showError, setShowError] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "rate">("idle");

  const index = STEPS.indexOf(step);
  const estimate = useMemo(() => {
    if (!projectType || !timeline || !design) return null;
    try {
      return computeEstimate(pricing, { projectType, features, timeline, design });
    } catch {
      return null;
    }
  }, [pricing, projectType, features, timeline, design]);

  const canContinue = step === "type" ? Boolean(projectType) : step === "timeline" ? Boolean(timeline) : step === "design" ? Boolean(design) : true;

  const go = (dir: 1 | -1) => {
    if (dir === 1 && !canContinue) return setShowError(true);
    setShowError(false);
    setStep(STEPS[Math.min(STEPS.length - 1, Math.max(0, index + dir))]!);
    if (typeof window !== "undefined") document.getElementById("wizard")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactIn, unknown, ContactOut>({ resolver: zodResolver(contactPart), defaultValues: { website: "" } });

  const onSubmit = async (values: ContactOut) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, projectType, features, timeline, design, locale }),
      });
      if (res.status === 429) return setStatus("rate");
      if (!res.ok) return setStatus("error");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const restart = () => {
    setProjectType("");
    setFeatures([]);
    setTimeline("standard");
    setDesign("custom");
    setStatus("idle");
    setStep("type");
  };

  const multiplierHint = (m: number) => (m === 1 ? "×1" : `×${m.toFixed(2).replace(/0$/, "")}`);

  return (
    <div id="wizard" className="scroll-mt-24">
      {/* Progress */}
      <ol className="mb-8 grid grid-cols-5 gap-2" aria-label={t("step", { current: index + 1, total: STEPS.length })}>
        {STEPS.map((s, i) => (
          <li key={s} className="min-w-0">
            <span className={cn("block h-1 rounded-full transition", i <= index ? "bg-accent" : "bg-line")} />
            <span className={cn("mt-2 hidden truncate font-mono text-[11px] sm:block", i === index ? "text-fg" : "text-muted")} aria-current={i === index ? "step" : undefined}>
              {String(i + 1).padStart(2, "0")} {t(`steps.${s}`)}
            </span>
          </li>
        ))}
      </ol>

      <div className="card p-6 sm:p-8">
        <p className="font-mono text-xs text-muted">{t("step", { current: index + 1, total: STEPS.length })}</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            {step === "type" ? (
              <fieldset>
                <legend className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{t("typeQuestion")}</legend>
                <div role="radiogroup" className="mt-6 grid gap-3 sm:grid-cols-2">
                  {pricing.projectTypes.map((o) => (
                    <OptionCard key={o.key} option={o} locale={locale} selected={projectType === o.key} onSelect={() => setProjectType(o.key)} />
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === "features" ? (
              <fieldset>
                <legend className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{t("featuresQuestion")}</legend>
                <p className="mt-2 text-sm text-muted">{t("featuresHint")}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {pricing.features.map((o) => (
                    <OptionCard
                      key={o.key}
                      option={o}
                      locale={locale}
                      multi
                      selected={features.includes(o.key)}
                      onSelect={() => setFeatures((f) => (f.includes(o.key) ? f.filter((k) => k !== o.key) : [...f, o.key]))}
                    />
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === "timeline" ? (
              <fieldset>
                <legend className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{t("timelineQuestion")}</legend>
                <div role="radiogroup" className="mt-6 grid gap-3 sm:grid-cols-3">
                  {pricing.timelines.map((o) => (
                    <OptionCard key={o.key} option={o} locale={locale} hint={multiplierHint(o.multiplier)} selected={timeline === o.key} onSelect={() => setTimeline(o.key)} />
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === "design" ? (
              <fieldset>
                <legend className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{t("designQuestion")}</legend>
                <div role="radiogroup" className="mt-6 grid gap-3 sm:grid-cols-3">
                  {pricing.designLevels.map((o) => (
                    <OptionCard key={o.key} option={o} locale={locale} hint={multiplierHint(o.multiplier)} selected={design === o.key} onSelect={() => setDesign(o.key)} />
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === "result" && estimate ? (
              <div>
                <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{t("estimate")}</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-3" data-testid="estimate">
                  {CURRENCIES.map((c) => (
                    <div key={c} className="rounded-xl border border-line bg-bg-elev p-5">
                      <p className="font-mono text-xs text-muted">{c}</p>
                      <p className="mt-2 font-display text-xl font-semibold tabular-nums sm:text-2xl">
                        {formatMoney(estimate.ranges[c].min, c, locale)}
                        <span className="text-muted"> – </span>
                        <br className="hidden sm:block lg:hidden" />
                        {formatMoney(estimate.ranges[c].max, c, locale)}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted">{t("disclaimer")}</p>

                <div className="mt-10 border-t border-line pt-8">
                  {status === "success" ? (
                    <div role="status" className="flex flex-col items-start gap-4">
                      <CheckCircle2 className="size-10 text-accent-2" aria-hidden />
                      <p className="text-lg">{t("success")}</p>
                      <button type="button" onClick={restart} className={buttonClass("secondary")}>
                        <RotateCcw className="size-4" aria-hidden /> {t("restart")}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative grid gap-5 sm:grid-cols-2" data-testid="lead-form">
                      <div className="sm:col-span-2">
                        <h3 className="font-display text-xl font-semibold">{t("sendTitle")}</h3>
                        <p className="mt-1 text-sm text-muted">{t("sendSubtitle")}</p>
                      </div>
                      <Honeypot {...register("website")} />
                      <Field id="lead-name" label={tc("name")} error={errors.name}>
                        <input id="lead-name" className="input" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
                      </Field>
                      <Field id="lead-email" label={tc("email")} error={errors.email}>
                        <input id="lead-email" type="email" className="input" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
                      </Field>
                      <Field id="lead-phone" label={tc("phone")} error={errors.phone}>
                        <input id="lead-phone" type="tel" className="input" autoComplete="tel" aria-invalid={!!errors.phone} {...register("phone")} />
                      </Field>
                      <Field id="lead-company" label={t("company")} error={errors.company}>
                        <input id="lead-company" className="input" autoComplete="organization" {...register("company")} />
                      </Field>
                      <Field id="lead-message" label={t("details")} error={errors.message} className="sm:col-span-2">
                        <textarea id="lead-message" rows={4} className="input resize-y" {...register("message")} />
                      </Field>
                      <div className="sm:col-span-2">
                        <button type="submit" disabled={isSubmitting} className={buttonClass("primary")}>
                          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
                          {t("send")}
                        </button>
                        {status === "error" || status === "rate" ? (
                          <p role="alert" className="mt-3 text-sm text-danger">
                            {status === "rate" ? tc("rateLimited") : tc("error")}
                          </p>
                        ) : null}
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {showError ? (
          <p role="alert" className="mt-4 text-sm text-danger">
            {t("required")}
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          <button type="button" onClick={() => go(-1)} disabled={index === 0} className={buttonClass("ghost", "px-0")}>
            <ArrowLeft className="size-4" aria-hidden /> {t("previous")}
          </button>
          {step !== "result" ? (
            <button type="button" onClick={() => go(1)} className={buttonClass("primary")}>
              {step === "design" ? t("seeEstimate") : t("next")} <ArrowRight className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
