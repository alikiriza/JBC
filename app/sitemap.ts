import type { MetadataRoute } from "next";

/**
 * The public sitemap. Only the landing page qualifies: `/requests`,
 * `/requests/new` and `/admin` all require a signed-in session, so listing them
 * would advertise pages a crawler can never usefully reach.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
