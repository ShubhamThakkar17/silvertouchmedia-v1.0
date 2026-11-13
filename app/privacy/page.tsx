import type { Metadata } from "next";
import { LegalPage, readLegal } from "@/components/content/legal-page";

export function generateMetadata(): Metadata {
  return { title: readLegal("privacy").title, alternates: { canonical: "/privacy" } };
}

export default function Page() {
  return <LegalPage slug="privacy" />;
}
