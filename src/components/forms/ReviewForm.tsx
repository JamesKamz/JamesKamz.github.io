"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm, useWatch, type FieldError } from "react-hook-form";
import type { z } from "zod";
import { buttonClass } from "@/components/ui/Button";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";
import { testimonialSubmitSchema } from "@/lib/validation";
import { Field, FieldErrorText, Honeypot } from "./Field";

type Input = z.input<typeof testimonialSubmitSchema>;
type Output = z.output<typeof testimonialSubmitSchema>;

export function ReviewForm({ token, name, project }: { token: string; name: string; project: string }) {
  const t = useTranslations("review");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "success" | "error" | "rate" | "invalid">("idle");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Input, unknown, Output>({
    resolver: zodResolver(testimonialSubmitSchema),
    defaultValues: { token, name, project, locale: locale as Locale, website: "" },
  });
  const rating = Number(useWatch({ control, name: "rating" }) ?? 0);

  const onSubmit = async (values: Output) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.status === 429) return setStatus("rate");
      if (res.status === 410) return setStatus("invalid");
      if (!res.ok) return setStatus("error");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success" || status === "invalid") {
    return (
      <div role="status" className="card flex flex-col items-start gap-4 p-8">
        <CheckCircle2 className={cn("size-10", status === "success" ? "text-accent-2" : "text-muted")} aria-hidden />
        <p className="text-lg">{status === "success" ? t("success") : t("invalidText")}</p>
      </div>
    );
  }

  const describedBy = (field: keyof Input) => (errors[field] ? `${field}-error` : undefined);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card relative grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
      <Honeypot {...register("website")} />
      <input type="hidden" {...register("token")} />
      <input type="hidden" {...register("locale")} />
      <Field id="name" label={t("name")} error={errors.name}>
        <input id="name" className="input" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={describedBy("name")} {...register("name")} />
      </Field>
      <Field id="role" label={t("role")} error={errors.role}>
        <input id="role" className="input" autoComplete="organization-title" {...register("role")} />
      </Field>
      <Field id="company" label={t("company")} error={errors.company}>
        <input id="company" className="input" autoComplete="organization" {...register("company")} />
      </Field>
      <Field id="country" label={t("country")} error={errors.country}>
        <input id="country" className="input" autoComplete="country-name" {...register("country")} />
      </Field>
      <Field id="project" label={t("project")} error={errors.project}>
        <input id="project" className="input" {...register("project")} />
      </Field>
      <Field id="email" label={t("email")} error={errors.email}>
        <input id="email" type="email" className="input" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={describedBy("email")} {...register("email")} />
      </Field>

      <fieldset className="sm:col-span-2" aria-describedby={describedBy("rating")}>
        <legend className="label">{t("rating")}</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer rounded-md p-1 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent">
              <input type="radio" value={n} className="sr-only" {...register("rating")} />
              <Star className={cn("size-8 transition", n <= rating ? "fill-accent text-accent" : "text-line-strong hover:text-accent")} aria-hidden />
              <span className="sr-only">{t("star", { count: n })}</span>
            </label>
          ))}
        </div>
        <FieldErrorText id="rating-error" error={errors.rating as FieldError | undefined} />
      </fieldset>

      <Field id="message" label={t("message")} error={errors.message} className="sm:col-span-2">
        <textarea id="message" rows={6} className="input resize-y" placeholder={t("messagePlaceholder")} aria-invalid={!!errors.message} aria-describedby={describedBy("message")} {...register("message")} />
      </Field>

      <div className="sm:col-span-2">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-fg-soft">
          <input type="checkbox" className="mt-0.5 size-4 accent-[var(--accent)]" aria-invalid={!!errors.consent} aria-describedby={describedBy("consent")} {...register("consent")} />
          {t("consent")}
        </label>
        <FieldErrorText id="consent-error" error={errors.consent as FieldError | undefined} />
      </div>

      <div className="sm:col-span-2">
        <button type="submit" disabled={isSubmitting} className={buttonClass("primary")}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
          {isSubmitting ? t("sending") : t("send")}
        </button>
      </div>
      {status === "error" || status === "rate" ? (
        <p role="alert" className="text-sm text-danger sm:col-span-2">
          {status === "rate" ? t("rateLimited") : t("error")}
        </p>
      ) : null}
    </form>
  );
}
