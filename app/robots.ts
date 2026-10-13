import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://theoxbloodedit.com").replace(
    /\/$/,
    ""
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
