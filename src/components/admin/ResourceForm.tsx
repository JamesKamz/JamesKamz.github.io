"use client";

import { Loader2, Save } from "lucide-react";
import { startTransition, useActionState } from "react";
import { buttonClass } from "@/components/ui/Button";
import type { FormState } from "@/lib/admin/actions";
import type { Field } from "@/lib/admin/resources";
import { AdminField } from "./AdminField";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

export function ResourceForm({
  action,
  fields,
  values,
  submitLabel = "Enregistrer",
}: {
  action: Action;
  fields: Field[];
  values: Record<string, unknown>;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form onSubmit={(e) => {
        // Submitting via a transition (not the `action` prop) keeps user input on validation errors.
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((field) => (
          <AdminField key={field.name} field={field} value={values[field.name]} error={state.errors?.[field.name]} />
        ))}
      </div>
      <div className="sticky bottom-0 -mx-6 flex items-center gap-4 border-t border-line bg-bg/90 px-6 py-4 backdrop-blur">
        <button type="submit" disabled={pending} className={buttonClass("primary")}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {submitLabel}
        </button>
        {state.error ? <p role="alert" className="text-sm text-danger">{state.error}</p> : null}
        {state.ok && state.message ? <p role="status" className="text-sm text-accent-2">{state.message}</p> : null}
      </div>
    </form>
  );
}
