"use client";

import type { UrlData } from "@/lib/types";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toString();
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// Ranking Pyramid bar
function PyramidBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-[80px] shrink-0 text-[12px] text-[var(--color-muted)]">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-[var(--color-difficulty-track)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="w-[32px] shrink-0 text-right text-[12px] font-semibold text-[var(--color-fg)] tabular-nums">
        {fmt(count)}
      </span>
    </div>
  );
}

// Domain rank gauge (simple arc-style using a segmented bar)
function AuthorityGauge({ score }: { score: number }) {
  const color =
    score >= 70 ? "#4caf6e" : score >= 40 ? "#e5a430" : score >= 20 ? "#e07c3a" : "#e5534b";
  const label =
    score >= 70 ? "High" : score >= 40 ? "Medium" : score >= 20 ? "Low" : "Very Low";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center w-16 h-16">
        <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
          <circle cx="32" cy="32" r="26" fill="none" stroke="var(--color-difficulty-track)" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${(score / 100) * 163.4} 163.4`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.7s ease" }}
          />
        </svg>
        <span
          className="absolute text-[18px] font-semibold tracking-tight"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      <span className="text-[12px] text-[var(--color-muted)]">{label} Authority</span>
    </div>
  );
}

type TrackState = "idle" | "saving" | "saved";

interface UrlCardsProps {
  data: UrlData;
  onCreateArticle?: () => void;
  onTrack?: () => void;
  trackState?: TrackState;
}

export default function UrlCards({ data, onCreateArticle, onTrack, trackState = "idle" }: UrlCardsProps) {
  const cardBase =
    "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-1";
  const labelCls =
    "text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-medium";
  const bigValue =
    "text-[28px] font-semibold tracking-tight text-[var(--color-fg)] leading-none";

  const dist = data.rankingDistribution;
  const distTotal = dist.total || 1;

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* 1 — Organic Traffic (2/3 width) */}
      <div className={`${cardBase} sm:col-span-2`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className={labelCls}>Organic Traffic</p>
            <p className={`${bigValue} mt-1`}>{fmt(data.traffic.estimatedMonthly)}<span className="text-[16px] font-normal text-[var(--color-muted)] ml-1">/ mo</span></p>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full bg-[#5e6ad215] px-2.5 py-1 text-[12px] font-medium text-[var(--color-accent)]">
                {fmtMoney(data.traffic.estimatedValue)} traffic value / mo
              </span>
            </div>
            <p className="mt-2 text-[12px] text-[var(--color-muted)]">
              Estimated spend to buy this traffic via Google Ads
            </p>
          </div>
          {onTrack && (
            <button
              onClick={onTrack}
              disabled={trackState === "saving" || trackState === "saved"}
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-[12px] font-medium transition-all active:scale-95 disabled:opacity-60"
              style={{
                background: trackState === "saved" ? "#4caf6e15" : "var(--color-surface-raised)",
                color: trackState === "saved" ? "#4caf6e" : "var(--color-fg)",
                borderColor: trackState === "saved" ? "#4caf6e40" : "var(--color-border)",
              }}
            >
              {trackState === "saving" ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
              ) : trackState === "saved" ? (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
              {trackState === "saved" ? "Tracking" : "Track Website"}
            </button>
          )}
        </div>
      </div>

      {/* 2 — Page Authority (1/3 width) */}
      <div className={cardBase}>
        <p className={labelCls}>Page Authority</p>
        <div className="mt-2 flex items-center gap-4">
          <AuthorityGauge score={data.authority.domainRank} />
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-[11px] text-[var(--color-muted)]">Backlinks</p>
              <p className="text-[16px] font-semibold text-[var(--color-fg)] tabular-nums">{fmt(data.authority.totalBacklinks)}</p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--color-muted)]">Ref. Domains</p>
              <p className="text-[16px] font-semibold text-[var(--color-fg)] tabular-nums">{fmt(data.authority.referringDomains)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 — Ranking Distribution */}
      <div className={cardBase}>
        <p className={labelCls}>Ranking Distribution</p>
        <div className="mt-3 flex flex-col gap-2.5">
          <PyramidBar label="Positions 1–3" count={dist.top3} total={distTotal} color="#4caf6e" />
          <PyramidBar label="Positions 4–10" count={dist.top10} total={distTotal} color="#e5a430" />
          <PyramidBar label="Positions 11–20" count={dist.top20} total={distTotal} color="#e07c3a" />
          <PyramidBar label="Positions 21+" count={dist.beyond20} total={distTotal} color="#6b7280" />
        </div>
        <p className="mt-3 text-[12px] text-[var(--color-muted)]">
          {fmt(dist.total)} keywords tracked
        </p>
      </div>

      {/* 4 — Top Competitors */}
      {data.competitors.length > 0 && (
        <div className={cardBase}>
          <p className={labelCls}>Top Competitors</p>
          <div className="mt-3 flex flex-col divide-y divide-[var(--color-border)]">
            {data.competitors.slice(0, 3).map((c) => (
              <div key={c.domain} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="text-[13px] font-medium text-[var(--color-fg)]">{c.domain}</span>
                <span className="text-[12px] text-[var(--color-muted)] tabular-nums">
                  {fmt(c.overlappingKeywords)} shared
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5 — Top Ranking Keywords (full width, highlighted) */}
      {data.insights.topKeywords.length > 0 && (
        <div className={`${cardBase} sm:col-span-2 lg:col-span-3 border-[var(--color-accent)] bg-[#5e6ad208]`}>
          <p className={labelCls}>Top Ranking Keywords</p>
          <p className="mt-1 text-[12px] text-[var(--color-muted)]">Keywords this page currently ranks for in Google search</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.insights.topKeywords.map((kw, i) => (
              <span
                key={kw}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[13px] font-medium text-[var(--color-fg)]"
              >
                <span className="text-[11px] tabular-nums text-[var(--color-muted)]">#{i + 1}</span>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 6 — AI Insights */}
      <div className={`${cardBase} sm:col-span-2 lg:col-span-${data.competitors.length > 0 ? "2" : "3"}`}>
        <p className={labelCls}>AI Insights</p>

        <div className="mt-3 flex flex-col gap-4">
          <div>
            <p className="text-[12px] font-semibold text-[var(--color-fg)] mb-1">Intent Cluster</p>
            <p className="text-[13px] leading-[1.6] text-[var(--color-muted)]">{data.insights.intentCluster}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[var(--color-fg)] mb-1">Content Gap Opportunity</p>
            <p className="text-[13px] leading-[1.6] text-[var(--color-muted)]">{data.insights.contentGap}</p>
          </div>
        </div>
      </div>

      {/* 6 — How to Outrank (2/3 width) */}
      <div className={`${cardBase} sm:col-span-2`}>
        <div className="flex items-center justify-between">
          <p className={labelCls}>How to Outrank This Page</p>
          {onCreateArticle && (
            <button
              onClick={onCreateArticle}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-[var(--color-accent-hover)] active:scale-95 transition-all"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Create Article
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-[#5e6ad215] px-2.5 py-1 text-[12px] font-medium text-[var(--color-accent)]">
            ⏱ {data.cta.timeToRank}
          </span>
        </div>
        <p className="mt-2.5 text-[13px] leading-[1.65] text-[var(--color-muted)]">
          {data.cta.advice}
        </p>
      </div>
    </div>
  );
}
