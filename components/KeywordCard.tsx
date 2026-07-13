"use client";

import type { KeywordData, IntentType } from "@/lib/types";

function DifficultyBar({ score }: { score: number }) {
  const color =
    score < 35 ? "#4caf6e" : score < 60 ? "#e5a430" : score < 80 ? "#e07c3a" : "#e5534b";
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] text-[var(--color-muted)]">Difficulty</span>
        <span className="text-[13px] font-semibold" style={{ color }}>
          {score}/100
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--color-difficulty-track)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

const INTENT_COLORS: Record<IntentType, { bg: string; text: string; dot: string }> = {
  Informational: {
    bg: "var(--color-intent-info-bg)",
    text: "var(--color-intent-info-text)",
    dot: "var(--color-intent-info-text)",
  },
  Commercial: {
    bg: "var(--color-intent-commercial-bg)",
    text: "var(--color-intent-commercial-text)",
    dot: "var(--color-intent-commercial-text)",
  },
  Transactional: {
    bg: "var(--color-intent-trans-bg)",
    text: "var(--color-intent-trans-text)",
    dot: "var(--color-intent-trans-text)",
  },
  Navigational: {
    bg: "var(--color-intent-nav-bg)",
    text: "var(--color-intent-nav-text)",
    dot: "var(--color-intent-nav-text)",
  },
};

function IntentBadge({ type }: { type: IntentType }) {
  const c = INTENT_COLORS[type];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: c.dot }}
      />
      {type}
    </span>
  );
}

function formatVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toString();
}

function TrendChip({ trend }: { trend: string }) {
  const color =
    trend === "Growing"
      ? "var(--color-success)"
      : trend === "Declining"
      ? "var(--color-danger)"
      : "var(--color-muted)";
  const arrow = trend === "Growing" ? "↑" : trend === "Declining" ? "↓" : "→";
  return (
    <span className="text-[12px] font-medium" style={{ color }}>
      {arrow} {trend}
    </span>
  );
}

interface CardsProps {
  data: KeywordData;
  onCreateArticle?: () => void;
}

export default function ResultCards({ data, onCreateArticle }: CardsProps) {
  const cardBase =
    "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-1";
  const label = "text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-medium";
  const value = "text-[28px] font-semibold tracking-tight text-[var(--color-fg)] leading-none";

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* 1 — Keyword Difficulty */}
      <div className={cardBase}>
        <p className={label}>Keyword Difficulty</p>
        <p className={`${value} mt-1`}>{data.difficulty.label}</p>
        <DifficultyBar score={data.difficulty.score} />
      </div>

      {/* 2 — Search Volume */}
      <div className={cardBase}>
        <p className={label}>Monthly Searches</p>
        <p className={`${value} mt-1`}>{formatVolume(data.volume.monthly)}</p>
        <div className="mt-3 flex items-center gap-2">
          <TrendChip trend={data.volume.trend} />
          <span className="text-[12px] text-[var(--color-muted)]">/ month avg</span>
        </div>
      </div>

      {/* 3 — Search Intent */}
      <div className={cardBase}>
        <p className={label}>Search Intent</p>
        <div className="mt-2">
          <IntentBadge type={data.intent.type} />
        </div>
        <p className="mt-2.5 text-[13px] leading-[1.55] text-[var(--color-muted)]">
          {data.intent.explanation}
        </p>
      </div>

      {/* 4 — CPC */}
      <div className={cardBase}>
        <p className={label}>Cost Per Click</p>
        <p className={`${value} mt-1`}>
          ${data.cpc.usd.toFixed(2)}
        </p>
        <p className="mt-3 text-[12px] text-[var(--color-muted)]">Average advertiser bid</p>
      </div>

      {/* 5 — CTA Advice */}
      <div className={`${cardBase} sm:col-span-2 lg:col-span-2`}>
        <div className="flex items-center justify-between">
          <p className={label}>How to Rank #1</p>
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
