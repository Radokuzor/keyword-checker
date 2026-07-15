"use client";

interface Plan {
  id: string;
  name: string;
  price: string;
  searches: string;
  note: string;
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "pro",
    name: "Starter",
    price: "$15.99",
    searches: "5,000 searches",
    note: "per month",
  },
  {
    id: "unlimited",
    name: "Pro",
    price: "$25.99",
    searches: "Unlimited",
    note: "1,000/day · per month",
    highlighted: true,
  },
  {
    id: "starter",
    name: "Unlimited",
    price: "$29.99",
    searches: "Unlimited",
    note: "per month",
  },
];

interface PaywallOverlayProps {
  onSelectPlan: (planId: string) => void;
  isLoading: boolean;
}

export default function PaywallOverlay({ onSelectPlan, isLoading }: PaywallOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl px-4"
      style={{
        background:
          "linear-gradient(to bottom, var(--gradient-overlay-start) 0%, var(--gradient-overlay-mid) 20%, var(--gradient-overlay-end) 50%)",
      }}
    >
      <div className="w-full max-w-lg mt-auto pb-6">
        {/* Lock icon + heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#5e6ad215] border border-[#5e6ad230] mb-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="#5e6ad2" strokeWidth="1.5" />
              <path d="M5 7V5a3 3 0 016 0v2" stroke="#5e6ad2" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-[18px] font-semibold text-[var(--color-fg)] tracking-tight">
            Free search used
          </h2>
          <p className="mt-1 text-[13px] text-[var(--color-muted)]">
            Unlock more searches to continue your research
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-3 gap-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => onSelectPlan(plan.id)}
              disabled={isLoading}
              className={`relative flex flex-col rounded-xl border p-4 text-left transition-all disabled:opacity-60 cursor-pointer ${
                plan.highlighted
                  ? "border-[#5e6ad2] bg-[#5e6ad210] hover:bg-[#5e6ad218]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-raised)]"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                  Most popular
                </span>
              )}
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-medium">
                {plan.name}
              </p>
              <p className="mt-2 text-[26px] font-semibold text-[var(--color-fg)] leading-none">
                {plan.price}
              </p>
              <p className="mt-2 text-[12px] font-medium text-[var(--color-fg)]">
                {plan.searches}
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-muted)]">{plan.note}</p>

              <div
                className={`mt-3 rounded-lg py-1.5 text-center text-[12px] font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-surface-raised)] text-[var(--color-fg)]"
                }`}
              >
                {isLoading ? "..." : "Get started →"}
              </div>
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] text-[var(--color-muted-2)]">
          Secure payment via Stripe · Cancel anytime
        </p>
      </div>
    </div>
  );
}
