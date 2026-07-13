"use client";

interface RecommendedKeywordsProps {
  keywords: string[];
  activeKeyword?: string;
  onSelect: (keyword: string) => void;
  label?: string;
  onAdd?: (keyword: string) => void;
  trackedKeywords?: Set<string>;
}

export default function RecommendedKeywords({
  keywords,
  activeKeyword,
  onSelect,
  label = "Related Keywords",
  onAdd,
  trackedKeywords,
}: RecommendedKeywordsProps) {
  if (!keywords.length) return null;

  return (
    <div className="w-full">
      <p className="mb-3 text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-medium">
        {label}
      </p>
      <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="grid grid-cols-[28px_1fr_auto] gap-2 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
          <span className="text-[11px] uppercase tracking-widest text-[var(--color-muted-2)] font-medium">#</span>
          <span className="text-[11px] uppercase tracking-widest text-[var(--color-muted-2)] font-medium">Keyword</span>
          {onAdd && <span className="w-6" />}
        </div>

        {keywords.map((kw, i) => {
          const isActive = kw === activeKeyword;
          const isTracked = trackedKeywords?.has(kw) ?? false;
          return (
            <div
              key={kw}
              className="grid grid-cols-[28px_1fr_auto] gap-2 px-4 py-3 border-b border-[var(--color-border)] last:border-b-0 items-center"
              style={{ background: isActive ? "#5e6ad210" : "transparent" }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLDivElement).style.background = "var(--color-row-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              <span
                className="text-[13px] font-medium tabular-nums"
                style={{ color: isActive ? "var(--color-accent)" : "var(--color-muted-2)" }}
              >
                {i + 1}
              </span>
              <button
                type="button"
                onClick={() => onSelect(kw)}
                className="text-left text-[13px] font-medium truncate"
                style={{ color: isActive ? "var(--color-fg)" : "var(--color-muted)" }}
              >
                {kw}
                {isActive && (
                  <span className="ml-2 text-[11px] font-normal text-[var(--color-accent)]">
                    viewing
                  </span>
                )}
              </button>
              {onAdd && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onAdd(kw); }}
                  disabled={isTracked}
                  title={isTracked ? "Already tracking" : "Track this keyword"}
                  className="flex items-center justify-center w-6 h-6 rounded-md transition-colors disabled:opacity-40"
                  style={{
                    background: isTracked ? "#4caf6e15" : "var(--color-surface-raised)",
                    color: isTracked ? "#4caf6e" : "var(--color-muted)",
                    border: `1px solid ${isTracked ? "#4caf6e40" : "var(--color-border)"}`,
                  }}
                >
                  {isTracked ? (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
