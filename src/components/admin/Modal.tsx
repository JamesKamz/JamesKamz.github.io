"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Native <dialog> modal (focus trap, Esc, top layer) with a blurred backdrop.
 * Pass `closeHref` for URL-driven modals (server pages), or `open` + `onClose` for local state.
 */
export function Modal({
  title,
  description,
  children,
  open = true,
  onClose,
  closeHref,
  size = "lg",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  open?: boolean;
  onClose?: () => void;
  closeHref?: string;
  size?: "sm" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const close = () => (closeHref ? router.replace(closeHref, { scroll: false }) : onClose?.());

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className={cn(
        "m-auto max-h-[90dvh] w-[calc(100%-2rem)] overflow-hidden rounded-2xl border border-line bg-bg p-0 text-fg shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm open:animate-modal-in motion-reduce:animate-none",
        size === "sm" ? "max-w-md" : "max-w-3xl",
      )}
    >
      <div className="flex max-h-[90dvh] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div className="text-left">
            <h2 className="font-display text-lg font-semibold">{title}</h2>
            {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
          </div>
          <button type="button" onClick={close} aria-label="Fermer" className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg">
            <X className="size-4" aria-hidden />
          </button>
        </header>
        <div className="overflow-y-auto px-6 pt-6">{children}</div>
      </div>
    </dialog>
  );
}
