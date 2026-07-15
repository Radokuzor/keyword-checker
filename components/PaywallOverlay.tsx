"use client";

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "pro",
    name: "Starter",
    price: "$15.99",
    features: [
      "Save & track keywords",
      "Generate articles from research",
      "Unlimited keyword searches",
    ],
  },
  {
    id: "unlimited",
    name: "Pro",
    price: "$25.99",
    features: [
      "Everything in Starter",
      "Save & track websites",
      "Rank change notifications",
    ],
    highlighted: true,
  },
  {
    id: "starter",
    name: "Unlimited",
    price: "$29.99",
    features: [
      "Everything in Pro",
      "Proprietary ranking insights",
      "API access",
    ],
  },
];

const PLAN_LEVEL: Record<string, number> = { pro: 1, unlimited: 2, starter: 3 };

interface PaywallOverlayProps {
  onSelectPlan: (planId: string) => void;
  onClose: () => void;
  isLoading: boolean;
  minPlanId?: "pro" | "unlimited" | "starter";
  feature?: string;
}

export default function PaywallOverlay({
  onSelectPlan,
  onClose,
  isLoading,
  minPlanId = "pro",
  feature,
}: PaywallOverlayProps) {
  const visiblePlans = PLANS.filter(
    (p) => (PLAN_LEVEL[p.id] ?? 0) >= (PLAN_LEVEL[minPlanId] ?? 0)
  );
  const gridCols =
    visiblePlans.length === 1
      ? "grid-cols-1"
      : visiblePlans.length === 2
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-raised)] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Lock icon + heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#5e6ad215] border border-[#5e6ad230] mb-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="#5e6ad2" strokeWidth="1.5" />
              <path
                d="M5 7V5a3 3 0 016 0v2"
                stroke="#5e6ad2"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className="text-[18px] font-semibold text-[var(--color-fg)] tracking-tight">
            Upgrade to continue
          </h2>
          <p className="mt-1 text-[13px] text-[var(--color-muted)]">
            {feature ?? "This feature requires a paid plan"}
          </p>
        </div>

        {/* Pricing cards */}
        <div className={`grid ${gridCols} gap-3`}>
          {visiblePlans.map((plan) => (
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
              <ul className="mt-3 flex flex-col gap-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-[11px] text-[var(--color-muted)]">
                    <svg className="mt-0.5 shrink-0" width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="#5e6ad2" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

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
