export const FREE_SEARCH_LIMIT = 1;

const SEARCHES_KEY = "kiq_searches";
const EMAIL_KEY = "kiq_email";

export function getSearchesUsed(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(SEARCHES_KEY) ?? "0", 10);
}

export function incrementSearchesUsed(): void {
  localStorage.setItem(SEARCHES_KEY, String(getSearchesUsed() + 1));
}

export function getStoredEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function setStoredEmail(email: string): void {
  localStorage.setItem(EMAIL_KEY, email);
}
