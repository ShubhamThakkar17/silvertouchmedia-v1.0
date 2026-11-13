import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a local production build live beside `next dev` (e.g. NEXT_DIST_DIR=.next-prod).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  // The plan PDF reads its fonts from disk at runtime; make sure they ship with the function.
  outputFileTracingIncludes: {
    "/api/plan": ["./brand/pdf-fonts/**/*"],
  },
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
