import type { Metadata, Viewport } from "next";
import { brand, theme, themeCssVars } from "@/brand";
import { fontVariables } from "@/brand/fonts";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Consent } from "@/components/analytics/consent";
import { EventClicks } from "@/components/analytics/event-clicks";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { getChannels } from "@/lib/content/channels";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(brand.seo.siteUrl),
  title: { default: brand.seo.defaultTitle, template: brand.seo.titleTemplate },
  description: brand.seo.description,
  applicationName: brand.name,
  icons: { icon: brand.logo.monogram },
  openGraph: {
    type: "website",
    siteName: brand.name,
    locale: brand.seo.locale,
    title: brand.seo.defaultTitle,
    description: brand.seo.description,
  },
};

function orgJsonLd() {
  const url = brand.seo.siteUrl;
  const sameAs = brand.socials.map((s) => s.url).filter((u) => !/^https:\/\/(www\.)?[a-z]+\.com\/?$/.test(u));
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: brand.name,
      url,
      logo: `${url}${brand.logo.lockup}`,
      email: brand.contact.email,
      telephone: brand.contact.phoneE164,
      ...(sameAs.length ? { sameAs } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: brand.name,
      url,
      image: `${url}${brand.logo.lockup}`,
      description: brand.seo.description,
      telephone: brand.contact.phoneE164,
      email: brand.contact.email,
      areaServed: { "@type": "Country", name: brand.seo.areaServed },
      address: {
        "@type": "PostalAddress",
        addressLocality: brand.address.locality,
        addressRegion: brand.address.region,
        addressCountry: brand.address.countryCode,
      },
      geo: { "@type": "GeoCoordinates", latitude: brand.address.geo.lat, longitude: brand.address.geo.lng },
    },
  ];
}

export const viewport: Viewport = {
  themeColor: theme.colors.ink,
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const channelCount = getChannels().length;
  return (
    <html lang="en-IN" className={fontVariables}>
      <head>
        <style id="brand-tokens" dangerouslySetInnerHTML={{ __html: themeCssVars() }} />
      </head>
      <body className="min-h-dvh antialiased">
        <SmoothScroll />
        <EventClicks />
        <SiteHeader channelCount={channelCount} />
        <main id="main">{children}</main>
        <SiteFooter />
        <Consent ga4Id={process.env.NEXT_PUBLIC_GA4_ID || undefined} pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID || undefined} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd()) }} />
      </body>
    </html>
  );
}
