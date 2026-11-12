import { z } from "zod";
import { INDUSTRY_IDS, type IndustryId } from "@/data/industries";

/** Indian mobile: optional +91 / 0 prefix, then 10 digits starting 6–9. Spaces and dashes allowed. */
export const normalisePhone = (s: string) => s.replace(/[\s-]/g, "").replace(/^(\+91|0091|91(?=\d{10}$)|0)/, "");
export const isIndianMobile = (s: string) => /^[6-9]\d{9}$/.test(normalisePhone(s));

/**
 * Contact form lead. Messages are keys into copy.contactPage.form so the schema stays
 * free of display strings (the form maps them).
 */
export const ContactLead = z.object({
  name: z.string().trim().min(2, "required").max(80),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().refine(isIndianMobile, "invalidPhone"),
  email: z.string().trim().email("invalidEmail").max(160).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  industry: z.enum(INDUSTRY_IDS as [IndustryId, ...IndustryId[]]).optional().or(z.literal("")),
  budget: z.string().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  /** Honeypot: real users never see or fill this. */
  website: z.string().max(0).optional().or(z.literal("")),
});
export type ContactLead = z.infer<typeof ContactLead>;
