import type { Metadata } from "next";
import { copy } from "@/brand";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = { title: copy.placeholder.pages["terms"], robots: { index: false } };

export default function Page() {
  return <PlaceholderPage page="terms" />;
}
