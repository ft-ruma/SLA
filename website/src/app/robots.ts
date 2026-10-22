import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/portal";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/*/athlete/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
