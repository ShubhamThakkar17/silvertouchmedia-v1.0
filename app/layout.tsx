import type { Metadata, Viewport } from "next";
import { brand, theme, themeCssVars } from "@/brand";
import { fontVariables } from "@/brand/fonts";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
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
        <SiteHeader channelCount={channelCount} />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
