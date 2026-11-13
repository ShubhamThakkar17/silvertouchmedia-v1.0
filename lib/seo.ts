/**
 * Search indexing is allowed only once the site has its real domain: NEXT_PUBLIC_SITE_URL set
 * and not a *.vercel.app or localhost address. Until then every page is noindex and robots.txt
 * disallows crawling, so previews and the temporary production URL stay out of search results.
 */
export function isIndexable(): boolean {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return !!url && !/localhost|127\.0\.0\.1|\.vercel\.app/i.test(url);
}
