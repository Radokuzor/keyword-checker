"use client";

import type { KeywordData, IntentType } from "@/lib/types";

function DifficultyBar({ score }: { score: number }) {
  const color =
    score < 35 ? "#4caf6e" : score < 60 ? "#e5a430" : score < 80 ? "#e07c3a" : "#e5534b";
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] text-[#6b6b6b]">Difficulty</span>
        <span className="text-[13px] font-semibold" style={{ color }}>
          {score}/100
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#1f1f1f] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

const INTENT_COLORS: Record<IntentType, { bg: string; text: string; dot: string }> = {
  Informational: { bg: "#1e3a5f22", text: "#5b9bd5", dot: "#5b9bd5" },
  Commercial: { bg: "#3a2a0022", text: "#e5a430", dot: "#e5a430" },
  Transactional: { bg: "#1e3a1e22", text: "#4caf6e", dot: "#4caf6e" },
  Navigational: { bg: "#2a1e3a22", text: "#a78bfa", dot: "#a78bfa" },
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
    trend === "Growing" ? "#4caf6e" : trend === "Declining" ? "#e5534b" : "#6b6b6b";
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
    "rounded-xl border border-[#252525] bg-[#111111] p-5 flex flex-col gap-1";
  const label = "text-[11px] uppercase tracking-widest text-[#6b6b6b] font-medium";
  const value = "text-[28px] font-semibold tracking-tight text-[#ededed] leading-none";

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
          <span className="text-[12px] text-[#6b6b6b]">/ month avg</span>
        </div>
      </div>

      {/* 3 — Search Intent */}
      <div className={cardBase}>
        <p className={label}>Search Intent</p>
        <div className="mt-2">
          <IntentBadge type={data.intent.type} />
        </div>
        <p className="mt-2.5 text-[13px] leading-[1.55] text-[#999]">
          {data.intent.explanation}
        </p>
      </div>

      {/* 4 — CPC */}
      <div className={cardBase}>
        <p className={label}>Cost Per Click</p>
        <p className={`${value} mt-1`}>
          ${data.cpc.usd.toFixed(2)}
        </p>
        <p className="mt-3 text-[12px] text-[#6b6b6b]">Average advertiser bid</p>
      </div>

      {/* 5 — CTA Advice */}
      <div className={`${cardBase} sm:col-span-2 lg:col-span-2`}>
        <div className="flex items-center justify-between">
          <p className={label}>How to Rank #1</p>
          {onCreateArticle && (
            <button
              onClick={onCreateArticle}
              className="flex items-center gap-1.5 rounded-lg bg-[#5e6ad215] border border-[#5e6ad230] px-2.5 py-1 text-[11px] font-medium text-[#5e6ad2] hover:bg-[#5e6ad225] hover:border-[#5e6ad250] transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Create Article
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-[#5e6ad215] px-2.5 py-1 text-[12px] font-medium text-[#5e6ad2]">
            ⏱ {data.cta.timeToRank}
          </span>
        </div>
        <p className="mt-2.5 text-[13px] leading-[1.65] text-[#999]">
          {data.cta.advice}
        </p>
      </div>
    </div>
  );
}
