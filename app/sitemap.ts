import type { MetadataRoute } from "next";

/**
 * Next.js App Router sitemap. Update the base URL below once you have
 * a custom domain on Vercel (e.g. resumeiq.ai).
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://resumeiq.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
