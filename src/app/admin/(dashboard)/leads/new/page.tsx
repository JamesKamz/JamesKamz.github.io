import Link from "next/link";
import { LeadForm } from "@/components/admin/LeadForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { saveLead } from "@/lib/admin/actions";

export default function NewLead() {
  return (
    <>
      <Link href="/admin/leads" className="font-mono text-xs text-muted hover:text-accent">← Leads</Link>
      <PageHeader title="Nouveau projet client" />
      <LeadForm action={saveLead.bind(null, null)} lead={{ status: "DISCUSSION", amountPaid: 0 }} />
    </>
  );
}
