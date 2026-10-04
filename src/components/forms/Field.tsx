"use client";

import { useTranslations } from "next-intl";
import type { FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";

type Key = "name" | "email" | "phone" | "subject" | "message" | "tooLong";
const knownKeys: Key[] = ["name", "email", "phone", "subject", "message", "tooLong"];

export function FieldErrorText({ id, error }: { id: string; error?: FieldError }) {
  const t = useTranslations("validation");
  if (!error?.message) return null;
  const key = knownKeys.includes(error.message as Key) ? (error.message as Key) : null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-danger">
      {key ? t(key) : error.message}
    </p>
  );
}

export function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: FieldError;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(className)}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      <FieldErrorText id={`${id}-error`} error={error} />
    </div>
  );
}

/** Visually hidden honeypot field — humans never see or fill it. */
export function Honeypot(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input type="text" tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  );
}
