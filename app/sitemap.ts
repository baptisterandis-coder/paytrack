import type { MetadataRoute } from "next";

const BASE = "https://paytrak.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE + "/", lastModified: new Date("2026-11-23"), changeFrequency: "monthly", priority: 1 },
    { url: BASE + "/faq", lastModified: new Date("2026-11-23"), changeFrequency: "monthly", priority: 0.8 },
    { url: BASE + "/confidentialite", lastModified: new Date("2026-11-19"), changeFrequency: "yearly", priority: 0.4 },
    { url: BASE + "/mentions-legales", lastModified: new Date("2026-11-19"), changeFrequency: "yearly", priority: 0.3 },
  ];
}
