import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPost, formatDate, type Section } from "../data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/blog/${post.slug}`;

  return {
    title: `${post.title} — Rank Number 1`,
    description: post.description,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.date,
      authors: ["Rank Number 1"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: { canonical: url },
  };
}

function renderSection(section: Section, index: number) {
  switch (section.type) {
    case "h2":
      return (
        <h2
          key={index}
          className="text-[20px] font-semibold text-[var(--color-fg)] mt-8 mb-3 leading-snug"
        >
          {section.text}
        </h2>
      );
    case "h3":
      return (
        <h3
          key={index}
          className="text-[16px] font-semibold text-[var(--color-fg)] mt-5 mb-2 leading-snug"
        >
          {section.text}
        </h3>
      );
    case "p":
      return (
        <p
          key={index}
          className="text-[15px] text-[var(--color-muted)] leading-relaxed mb-4"
        >
          {section.text}
        </p>
      );
    case "ul":
      return (
        <ul key={index} className="mb-4 space-y-1.5 pl-1">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[14px] text-[var(--color-muted)] leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
              {item}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={index} className="mb-4 space-y-1.5 pl-1">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[14px] text-[var(--color-muted)] leading-relaxed">
              <span className="mt-0.5 text-[12px] font-semibold text-[var(--color-accent)] shrink-0 w-5 text-right">
                {i + 1}.
              </span>
              {item}
            </li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <div
          key={index}
          className="my-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-5 py-4"
        >
          <p className="text-[14px] text-[var(--color-fg)] leading-relaxed font-medium">
            {section.text}
          </p>
        </div>
      );
    case "cta":
      return (
        <div
          key={index}
          className="my-8 rounded-xl border border-[var(--color-accent)] bg-[var(--color-surface)] px-6 py-6 text-center"
        >
          <h3 className="text-[17px] font-semibold text-[var(--color-fg)] mb-2">
            {section.heading}
          </h3>
          <p className="text-[14px] text-[var(--color-muted)] mb-5 max-w-md mx-auto leading-relaxed">
            {section.body}
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            {section.label}
          </Link>
        </div>
      );
    default:
      return null;
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const otherPosts = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ranknumber1.com";
  const postUrl = `${base}/blog/${post.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: postUrl,
    author: {
      "@type": "Organization",
      name: "FourthWatch Tech",
      url: base,
    },
    publisher: {
      "@type": "Organization",
      name: "FourthWatch Tech",
      url: base,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    articleSection: post.category,
    keywords: post.title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .filter(Boolean)
      .join(", "),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
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

      <main className="flex-1 px-4 py-10 sm:py-14">
        <article className="max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[12px] text-[var(--color-muted)] mb-6">
            <Link href="/" className="hover:text-[var(--color-fg)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[var(--color-fg)] transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-[var(--color-fg)] truncate max-w-[200px]">
              {post.title}
            </span>
          </nav>

          {/* Meta */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-surface-raised)] text-[var(--color-muted)]">
              {post.category}
            </span>
            <span className="text-[12px] text-[var(--color-muted)]">
              {formatDate(post.date)} · {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--color-fg)] leading-snug mb-5">
            {post.title}
          </h1>

          {/* Intro */}
          <p className="text-[16px] text-[var(--color-fg)] leading-relaxed mb-8 pb-8 border-b border-[var(--color-border)] opacity-80">
            {post.intro}
          </p>

          {/* Content */}
          <div>{post.content.map((section, i) => renderSection(section, i))}</div>
        </article>

        {/* Related posts */}
        {otherPosts.length > 0 && (
          <div className="max-w-2xl mx-auto mt-12 pt-10 border-t border-[var(--color-border)]">
            <h2 className="text-[16px] font-semibold text-[var(--color-fg)] mb-5">
              More SEO guides for small business owners
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {otherPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-accent)] transition-colors group"
                >
                  <p className="text-[11px] text-[var(--color-muted)] mb-1.5">{p.category}</p>
                  <h3 className="text-[13px] font-semibold text-[var(--color-fg)] leading-snug group-hover:text-[var(--color-accent)] transition-colors">
                    {p.title}
                  </h3>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href="/blog"
                className="text-[13px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
              >
                ← View all articles
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[var(--color-border)] px-6 py-4 mt-8">
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
