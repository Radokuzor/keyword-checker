"use client";

interface RecommendedKeywordsProps {
  keywords: string[];
  activeKeyword?: string;
  onSelect: (keyword: string) => void;
  label?: string;
}

export default function RecommendedKeywords({
  keywords,
  activeKeyword,
  onSelect,
  label = "Related Keywords",
}: RecommendedKeywordsProps) {
  if (!keywords.length) return null;

  return (
    <div className="w-full">
      <p className="mb-3 text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-medium">
        {label}
      </p>
      <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="grid grid-cols-[28px_1fr] gap-3 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
          <span className="text-[11px] uppercase tracking-widest text-[var(--color-muted-2)] font-medium">#</span>
          <span className="text-[11px] uppercase tracking-widest text-[var(--color-muted-2)] font-medium">Keyword</span>
        </div>

        {keywords.map((kw, i) => {
          const isActive = kw === activeKeyword;
          return (
            <button
              key={kw}
              type="button"
              onClick={() => onSelect(kw)}
              className="w-full grid grid-cols-[28px_1fr] gap-3 px-4 py-3 text-left transition-colors border-b border-[var(--color-border)] last:border-b-0"
              style={{
                background: isActive ? "#5e6ad210" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--color-row-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <span
                className="text-[13px] font-medium tabular-nums"
                style={{ color: isActive ? "var(--color-accent)" : "var(--color-muted-2)" }}
              >
                {i + 1}
              </span>
              <span
                className="text-[13px] font-medium"
                style={{ color: isActive ? "var(--color-fg)" : "var(--color-muted)" }}
              >
                {kw}
                {isActive && (
                  <span className="ml-2 text-[11px] font-normal text-[var(--color-accent)]">
                    viewing
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
