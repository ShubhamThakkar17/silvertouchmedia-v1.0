import type { Metadata } from "next";
import { LegalPage, readLegal } from "@/components/content/legal-page";

export function generateMetadata(): Metadata {
  return { title: readLegal("terms").title, alternates: { canonical: "/terms" } };
}

export default function Page() {
  return <LegalPage slug="terms" />;
}
