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
      <p className="mb-3 text-[11px] uppercase tracking-widest text-[#6b6b6b] font-medium">
        {label}
      </p>
      <div className="rounded-xl border border-[#252525] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[28px_1fr] gap-3 px-4 py-2.5 border-b border-[#1e1e1e] bg-[#0e0e0e]">
          <span className="text-[11px] uppercase tracking-widest text-[#4a4a4a] font-medium">#</span>
          <span className="text-[11px] uppercase tracking-widest text-[#4a4a4a] font-medium">Keyword</span>
        </div>

        {keywords.map((kw, i) => {
          const isActive = kw === activeKeyword;
          return (
            <button
              key={kw}
              type="button"
              onClick={() => onSelect(kw)}
              className="w-full grid grid-cols-[28px_1fr] gap-3 px-4 py-3 text-left transition-colors border-b border-[#1a1a1a] last:border-b-0"
              style={{
                background: isActive ? "#5e6ad210" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.background = "#161616";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <span
                className="text-[13px] font-medium tabular-nums"
                style={{ color: isActive ? "#5e6ad2" : "#4a4a4a" }}
              >
                {i + 1}
              </span>
              <span
                className="text-[13px] font-medium"
                style={{ color: isActive ? "#ededed" : "#999" }}
              >
                {kw}
                {isActive && (
                  <span className="ml-2 text-[11px] font-normal text-[#5e6ad2]">
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
