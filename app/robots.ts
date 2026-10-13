import type { MetadataRoute } from "next";

/**
 * robots.txt, generated at build time so it always points at the real domain.
 *
 * The static `robots.txt` this replaces hard-coded a made-up domain and a
 * localhost line, which would have shipped to production. Reading the base URL
 * from NEXT_PUBLIC_SITE_URL keeps the sitemap pointer correct on any host.
 *
 * /admin and /api are kept out of search results: both require a signed-in
 * session, so indexing them only wastes crawler budget and leaks nothing useful.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
