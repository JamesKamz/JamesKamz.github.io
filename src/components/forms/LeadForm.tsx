"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { buttonClass } from "@/components/ui/Button";
import { leadSchema } from "@/lib/validation";
import { Field, Honeypot } from "./Field";

const contactPart = leadSchema.pick({ name: true, email: true, phone: true, company: true, message: true, website: true });
type ContactIn = z.input<typeof contactPart>;
export type LeadContact = z.output<typeof contactPart>;

export default function LeadForm({
  onSubmit,
  status,
}: {
  onSubmit: (values: LeadContact) => Promise<void>;
  status: "idle" | "success" | "error" | "rate";
}) {
  const t = useTranslations("budget");
  const tc = useTranslations("contact");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactIn, unknown, LeadContact>({ resolver: zodResolver(contactPart), defaultValues: { website: "" } });

  return (
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
  );
}
