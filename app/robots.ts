import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ranknumber1.com";

  return {
    rules: [
      // All crawlers: allow public content, block API routes and auth flows
      {
        userAgent: "*",
        allow: ["/", "/blog", "/blog/", "/about"],
        disallow: ["/api/", "/auth/", "/success"],
      },
      // Explicitly welcome major AI crawlers so they index content for AI search
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/auth/", "/success"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/api/", "/auth/", "/success"],
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: ["/api/", "/auth/", "/success"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/", "/auth/", "/success"],
      },
      {
        userAgent: "Googlebot-Extended",
        allow: "/",
        disallow: ["/api/", "/auth/", "/success"],
      },
      {
        userAgent: "meta-externalagent",
        allow: "/",
        disallow: ["/api/", "/auth/", "/success"],
      },
      {
        userAgent: "cohere-ai",
        allow: "/",
        disallow: ["/api/", "/auth/", "/success"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
