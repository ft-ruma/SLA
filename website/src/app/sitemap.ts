import type { MetadataRoute } from "next";
import { COMPETITIONS, NEWS } from "@/content";
import { LANGS } from "@/lib/langs";
import { SITE_URL } from "@/lib/portal";

const STATIC = ["", "/news", "/calendar", "/results", "/rankings", "/records", "/athletes", "/clubs", "/coaches",
  "/development", "/anti-doping", "/about", "/downloads", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...STATIC,
    ...NEWS.map((n) => `/news/${n.slug}`),
    ...COMPETITIONS.map((c) => `/competitions/${c.id}`),
  ];
  return paths.map((path) => ({
    url: `${SITE_URL}/en${path}`,
    alternates: { languages: Object.fromEntries(LANGS.map((l) => [l, `${SITE_URL}/${l}${path}`])) },
  }));
}
