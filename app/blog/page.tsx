import type { Metadata } from "next";
import Link from "next/link";
import { posts, formatDate } from "./data";

export const metadata: Metadata = {
  title: "SEO Blog for Small Businesses — Rank Number 1",
  description:
    "Practical SEO guides, keyword research tips, and tool comparisons written for small business owners who want to rank on Google without the agency price tag.",
  keywords: [
    "seo for small business",
    "keyword research guide",
    "how to rank on google",
    "local seo tips",
    "small business seo tips",
  ],
  openGraph: {
    type: "website",
    title: "SEO Blog for Small Businesses — Rank Number 1",
    description:
      "Practical SEO guides for small business owners. Learn keyword research, local SEO, and how to rank on Google without paying for ads.",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/blog`,
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "SEO Strategy": "var(--color-intent-info-bg)",
  "How-To": "var(--color-intent-trans-bg)",
  "Comparisons": "var(--color-intent-commercial-bg)",
  "Guides": "var(--color-intent-nav-bg)",
  "Common Mistakes": "var(--color-intent-commercial-bg)",
  "Local SEO": "var(--color-intent-trans-bg)",
};

const CATEGORY_TEXT: Record<string, string> = {
  "SEO Strategy": "var(--color-intent-info-text)",
  "How-To": "var(--color-intent-trans-text)",
  "Comparisons": "var(--color-intent-commercial-text)",
  "Guides": "var(--color-intent-nav-text)",
  "Common Mistakes": "var(--color-intent-commercial-text)",
  "Local SEO": "var(--color-intent-trans-text)",
};

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ranknumber1.com";

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  url: `${BASE}/blog`,
  name: "Rank Number 1 — SEO Blog for Small Businesses",
  description:
    "Practical SEO guides, keyword research tips, and tool comparisons written for small business owners who want to rank on Google.",
  publisher: {
    "@type": "Organization",
    name: "FourthWatch Tech",
    url: BASE,
  },
  blogPost: posts.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    url: `${BASE}/blog/${p.slug}`,
    datePublished: p.date,
    author: { "@type": "Organization", name: "FourthWatch Tech" },
  })),
};

export default function BlogIndex() {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const [featured, ...rest] = sorted;


  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-[var(--color-accent)] flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4" stroke="white" strokeWidth="1.5" />
              <path d="M9.5 9.5L12 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[14px] font-semibold text-[var(--color-fg)] tracking-tight">
            Rank Number 1
          </span>
        </Link>
        <Link
          href="/"
          className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          Try the Tool Free
        </Link>
      </header>

      <main className="flex-1 px-4 py-12 sm:py-16 max-w-5xl mx-auto w-full">
        {/* Page heading */}
        <div className="mb-10">
          <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--color-accent)] mb-2">
            Blog
          </p>
          <h1 className="text-[28px] sm:text-[36px] font-semibold tracking-tight text-[var(--color-fg)] leading-tight">
            SEO guides for small business owners
          </h1>
          <p className="mt-3 text-[15px] text-[var(--color-muted)] max-w-xl">
            Practical keyword research and ranking strategies — no fluff, no agency jargon. Built for business owners who want results, not a crash course in SEO theory.
          </p>
        </div>

        {/* Featured post */}
        <Link
          href={`/blog/${featured.slug}`}
          className="block mb-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 hover:border-[var(--color-accent)] transition-colors group"
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{
                background: CATEGORY_COLORS[featured.category] ?? "var(--color-surface-raised)",
                color: CATEGORY_TEXT[featured.category] ?? "var(--color-muted)",
              }}
            >
              {featured.category}
            </span>
            <span className="text-[12px] text-[var(--color-muted)]">
              {formatDate(featured.date)} · {featured.readTime}
            </span>
          </div>
          <h2 className="text-[20px] sm:text-[22px] font-semibold text-[var(--color-fg)] leading-snug group-hover:text-[var(--color-accent)] transition-colors mb-3">
            {featured.title}
          </h2>
          <p className="text-[14px] text-[var(--color-muted)] leading-relaxed mb-4 max-w-2xl">
            {featured.description}
          </p>
          <span className="text-[13px] font-medium text-[var(--color-accent)]">
            Read article →
          </span>
        </Link>

        {/* Post grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-accent)] transition-colors group"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: CATEGORY_COLORS[post.category] ?? "var(--color-surface-raised)",
                    color: CATEGORY_TEXT[post.category] ?? "var(--color-muted)",
                  }}
                >
                  {post.category}
                </span>
              </div>
              <h2 className="text-[15px] font-semibold text-[var(--color-fg)] leading-snug mb-2 group-hover:text-[var(--color-accent)] transition-colors flex-1">
                {post.title}
              </h2>
              <p className="text-[13px] text-[var(--color-muted)] leading-relaxed mb-4 line-clamp-3">
                {post.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-muted)]">
                  {formatDate(post.date)}
                </span>
                <span className="text-[11px] text-[var(--color-muted)]">
                  {post.readTime}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 text-center">
          <h3 className="text-[18px] font-semibold text-[var(--color-fg)] mb-2">
            Ready to find keywords you can actually rank for?
          </h3>
          <p className="text-[14px] text-[var(--color-muted)] mb-5 max-w-md mx-auto">
            Enter any keyword and get difficulty, search volume, intent, and an AI-generated ranking plan — free for your first search.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Try Rank Number 1 Free
          </Link>
        </div>
      </main>

      <footer className="border-t border-[var(--color-border)] px-6 py-4">
        <p className="text-center text-[12px] text-[var(--color-muted)]">
          Rank Number 1 ·{" "}
          <Link href="/blog" className="hover:text-[var(--color-fg)] transition-colors">
            Blog
          </Link>
        </p>
      </footer>
    </div>
  );
}
