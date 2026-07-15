import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About FourthWatch Tech — The Story Behind Rank Number 1",
  description:
    "FourthWatch Tech was built by an entrepreneur who spent years mastering SEO and got tired of paying hundreds of dollars a month just to do basic keyword research.",
  openGraph: {
    type: "website",
    title: "About FourthWatch Tech — Rank Number 1",
    description:
      "The story behind Rank Number 1: an entrepreneur who mastered SEO and built the tool he always wished existed.",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/about`,
  },
};

const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ranknumber1.com";

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: `${base}/about`,
  name: "About FourthWatch Tech — Rank Number 1",
  description:
    "FourthWatch Tech was built by an entrepreneur who mastered SEO and was tired of paying $100+/month for tools that were overbuilt for small businesses.",
  mainEntity: {
    "@type": "Organization",
    name: "FourthWatch Tech",
    url: base,
    foundingDate: "2024",
    description:
      "FourthWatch Tech builds affordable SEO intelligence tools for small business owners, solopreneurs, and entrepreneurs. Our flagship product, Rank Number 1, delivers keyword difficulty, search volume, intent, CPC, and AI-generated ranking plans without enterprise pricing.",
    knowsAbout: [
      "Search Engine Optimization",
      "Keyword Research",
      "Content Strategy",
      "Local SEO",
      "Small Business Marketing",
    ],
    product: {
      "@type": "SoftwareApplication",
      name: "Rank Number 1",
      applicationCategory: "BusinessApplication",
      url: base,
    },
  },
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutJsonLd).replace(/</g, "\\u003c"),
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
        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            className="text-[12px] font-medium text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Try the Tool Free
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto">

          {/* Eyebrow */}
          <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--color-accent)] mb-4">
            About FourthWatch Tech
          </p>

          {/* Headline */}
          <h1 className="text-[30px] sm:text-[38px] font-semibold text-[var(--color-fg)] leading-snug tracking-tight mb-6">
            Built by someone who was sick of paying $130/month just to research keywords.
          </h1>

          {/* Divider */}
          <div className="h-px w-16 bg-[var(--color-accent)] mb-8 opacity-60" />

          {/* Story */}
          <div className="space-y-5 text-[15px] text-[var(--color-muted)] leading-relaxed">
            <p>
              FourthWatch Tech was founded by an entrepreneur who spent years building businesses online — and years learning SEO the hard way.
            </p>

            <p>
              He didn't take a course. He didn't hire an agency. He sat with browser tabs open at midnight, reading documentation, testing theories, watching what Google rewarded and punished. He learned which metrics actually predicted whether a page would rank, which keyword structures converted visitors into customers, and which tactics wasted months of effort for zero results.
            </p>

            <p>
              Eventually, he got genuinely good at it. His sites ranked. His businesses grew through organic search. And then he hit a problem he couldn't get past: to do his keyword research properly, he had to pay Semrush $130 a month. Or Ahrefs $99. Tools built for agencies with 30 clients — when he just needed to look up a keyword.
            </p>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 my-8">
              <p className="text-[16px] font-medium text-[var(--color-fg)] leading-relaxed">
                "I kept asking myself why there was no tool that just gave you the data you needed, without the $100+ monthly subscription. The answer was that nobody had built it for people like me."
              </p>
              <p className="mt-3 text-[13px] text-[var(--color-muted)]">
                — Founder, FourthWatch Tech
              </p>
            </div>

            <p>
              So he built it.
            </p>

            <p>
              Rank Number 1 is the tool he always wanted. Enter any keyword and instantly get what actually matters: the difficulty score, monthly search volume, search intent, cost per click, and a concrete step-by-step plan for ranking — all generated by AI trained on real ranking patterns. No bloated dashboards. No features you'll never use. No monthly subscription that drains your account whether you use it or not.
            </p>

            <p>
              FourthWatch Tech is built on the belief that SEO intelligence shouldn't be locked behind enterprise pricing. A bakery owner in Denver, a freelance consultant in Chicago, a boutique founder in Atlanta — they all deserve access to the same data that big brands use to dominate search results. The playing field should be level. It isn't — yet. That's what we're fixing.
            </p>
          </div>

          {/* Values */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Built for builders",
                body: "We made this for the people actually doing the work — not for agencies billing it out at $200/hour.",
              },
              {
                title: "Pay for what you use",
                body: "No subscriptions. No auto-renewals. Credits that don't expire. Your budget, your pace.",
              },
              {
                title: "Honest data",
                body: "We show you the real difficulty, not an inflated number designed to make you feel like you need more features.",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <h3 className="text-[14px] font-semibold text-[var(--color-fg)] mb-2">
                  {v.title}
                </h3>
                <p className="text-[13px] text-[var(--color-muted)] leading-relaxed">
                  {v.body}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-xl border border-[var(--color-accent)] bg-[var(--color-surface)] px-6 py-8 text-center">
            <h2 className="text-[18px] font-semibold text-[var(--color-fg)] mb-2">
              Ready to stop guessing which keywords to target?
            </h2>
            <p className="text-[14px] text-[var(--color-muted)] mb-5 max-w-sm mx-auto leading-relaxed">
              Get your first keyword analysis free — difficulty, volume, intent, CPC, and your ranking plan in under 30 seconds.
            </p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Try Rank Number 1 Free
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--color-border)] px-6 py-4 mt-8">
        <div className="flex items-center justify-center gap-4 text-[12px] text-[var(--color-muted)]">
          <Link href="/" className="hover:text-[var(--color-fg)] transition-colors">
            Rank Number 1
          </Link>
          <span>·</span>
          <Link href="/blog" className="hover:text-[var(--color-fg)] transition-colors">
            Blog
          </Link>
          <span>·</span>
          <Link href="/about" className="hover:text-[var(--color-fg)] transition-colors">
            About
          </Link>
        </div>
      </footer>
    </div>
  );
}
