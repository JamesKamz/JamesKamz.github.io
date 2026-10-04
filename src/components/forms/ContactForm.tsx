"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { buttonClass } from "@/components/ui/Button";
import { contactSchema } from "@/lib/validation";
import { Field, Honeypot } from "./Field";

type Input = z.input<typeof contactSchema>;
type Output = z.output<typeof contactSchema>;

export function ContactForm({ defaultBudget }: { defaultBudget?: string }) {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "success" | "error" | "rate">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Input, unknown, Output>({
    resolver: zodResolver(contactSchema),
    defaultValues: { locale: locale as "fr" | "en", budget: defaultBudget ?? "", website: "" },
  });

  const onSubmit = async (values: Output) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.status === 429) return setStatus("rate");
      if (!res.ok) return setStatus("error");
      reset({ locale: values.locale, website: "" });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div role="status" className="card flex flex-col items-start gap-4 p-8">
        <CheckCircle2 className="size-10 text-accent-2" aria-hidden />
        <p className="text-lg">{t("success")}</p>
        <button type="button" onClick={() => setStatus("idle")} className="font-mono text-sm text-accent hover:underline">
          ← {t("send")}
        </button>
      </div>
    );
  }

  const describedBy = (name: keyof Input) => (errors[name] ? `${name}-error` : undefined);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card relative grid gap-5 p-6 sm:grid-cols-2 sm:p-8" data-testid="contact-form">
      <Honeypot {...register("website")} />
      <input type="hidden" {...register("locale")} />
      <Field id="name" label={t("name")} error={errors.name}>
        <input id="name" className="input" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={describedBy("name")} {...register("name")} />
      </Field>
      <Field id="email" label={t("email")} error={errors.email}>
        <input id="email" type="email" className="input" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={describedBy("email")} {...register("email")} />
      </Field>
      <Field id="phone" label={t("phone")} error={errors.phone}>
        <input id="phone" type="tel" className="input" autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={describedBy("phone")} {...register("phone")} />
      </Field>
      <Field id="budget" label={t("budget")} error={errors.budget}>
        <input id="budget" className="input" placeholder={t("budgetPlaceholder")} aria-invalid={!!errors.budget} {...register("budget")} />
      </Field>
      <Field id="subject" label={t("subject")} error={errors.subject} className="sm:col-span-2">
        <input id="subject" className="input" aria-invalid={!!errors.subject} aria-describedby={describedBy("subject")} {...register("subject")} />
      </Field>
      <Field id="message" label={t("message")} error={errors.message} className="sm:col-span-2">
        <textarea id="message" rows={6} className="input resize-y" aria-invalid={!!errors.message} aria-describedby={describedBy("message")} {...register("message")} />
      </Field>

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-muted">{t("privacy")}</p>
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
