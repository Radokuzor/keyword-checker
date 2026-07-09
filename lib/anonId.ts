const STORAGE_KEY = "kiq_anon_id";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function getAnonId(): string {
  if (typeof window === "undefined") return "";

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const id = generateUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    // localStorage blocked (e.g. private browsing with strict settings)
    return generateUUID();
  }
}
