import { brand } from "@/brand";

/** https://wa.me/<number>?text=<encoded> — number comes from brand.config. */
export function whatsappUrl(text: string = brand.contact.whatsappDefaultText) {
  return `https://wa.me/${brand.contact.whatsappE164}?text=${encodeURIComponent(text)}`;
}
