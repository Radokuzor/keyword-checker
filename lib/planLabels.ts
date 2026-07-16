export function planLabel(plan: string | null): string {
  if (plan === "pro") return "Starter";
  if (plan === "unlimited") return "Pro";
  if (plan === "starter") return "Unlimited";
  if (plan) return plan.charAt(0).toUpperCase() + plan.slice(1);
  return "Free user";
}
