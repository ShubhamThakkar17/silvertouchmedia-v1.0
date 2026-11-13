import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a local production build live beside `next dev` (e.g. NEXT_DIST_DIR=.next-prod).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  // Inline the (single) stylesheet into the HTML so first paint does not wait on a CSS request.
  experimental: { inlineCss: true },
  // The plan PDF reads its fonts from disk at runtime; make sure they ship with the function.
  outputFileTracingIncludes: {
    "/api/plan": ["./brand/pdf-fonts/**/*"],
    "/opengraph-image": ["./brand/pdf-fonts/**/*"],
    "/channels/[slug]/opengraph-image": ["./brand/pdf-fonts/**/*"],
  },
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
