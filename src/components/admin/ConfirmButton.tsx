"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { buttonClass, buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Modal } from "./Modal";

/** Submits a bound server action after a confirmation modal. */
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
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(true)}
        className={cn("text-sm text-danger hover:underline disabled:opacity-50", className)}
      >
        {children}
      </button>
      <Modal open={open} onClose={() => !pending && setOpen(false)} title={message} description="Cette action est définitive." size="sm">
        <div className="flex justify-end gap-2 pb-6">
          <button type="button" onClick={() => setOpen(false)} disabled={pending} className={buttonClass("secondary", "px-4 py-2")}>
            Annuler
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => start(async () => {
              await action();
              setOpen(false);
            })}
            className={cn(buttonStyles.base, "bg-danger px-4 py-2 text-white hover:opacity-90")}
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
            Supprimer
          </button>
        </div>
      </Modal>
    </>
  );
}
