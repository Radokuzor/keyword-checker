export function isUrl(query: string): boolean {
  const t = query.trim();
  if (/^https?:\/\//i.test(t)) return true;
  // Match domain.com or domain.com/path — no spaces, must have a valid TLD
  return (
    !t.includes(" ") &&
    /^[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}(\/[^\s]*)?$/.test(t)
  );
}

export function normalizeUrl(query: string): string {
  const t = query.trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}
