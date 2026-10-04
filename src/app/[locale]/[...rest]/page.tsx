import { notFound } from "next/navigation";

// Catch-all so unknown localized URLs render the localized not-found page.
export default function CatchAll() {
  notFound();
}
