"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";

/** Submits a bound server action after a confirm() dialog. */
export function ConfirmButton({
  action,
  message = "Confirmer la suppression ?",
  children,
  className,
}: {
  action: () => Promise<void>;
  message?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(message)) start(() => action());
      }}
      className={cn("text-sm text-danger hover:underline disabled:opacity-50", className)}
    >
      {children}
    </button>
  );
}
