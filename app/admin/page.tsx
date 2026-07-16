"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminUserRow {
  email: string;
  signedUpAt: string | null;
  planLabel: string;
  credits: number | null;
  sites: number;
  keywords: number;
  searches: number;
  articles: number;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const tableHead =
  "text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-medium px-4 py-2.5 text-left border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]";
const tableRow = "border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-row-hover)] transition-colors";
const tableCell = "px-4 py-3 text-[13px]";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Failed to load users.");
        return r.json();
      })
      .then((d) => setUsers(d.users ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, filter]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-sunken)] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[18px] font-semibold text-[var(--color-fg)]">Users</h1>
            <p className="text-[13px] text-[var(--color-muted)]">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-raised)] transition-colors"
          >
            Log out
          </button>
        </div>

        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by email..."
          className="mb-4 w-full max-w-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[13px] text-[var(--color-fg)] outline-none focus:border-[var(--color-accent)]"
        />

        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)]">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
            </div>
          ) : error ? (
            <p className="px-4 py-6 text-center text-[13px] text-[var(--color-danger)]">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={tableHead}>Email</th>
                    <th className={tableHead}>Signed up</th>
                    <th className={tableHead}>Plan</th>
                    <th className={`${tableHead} text-right`}>Credits</th>
                    <th className={`${tableHead} text-right`}>Sites</th>
                    <th className={`${tableHead} text-right`}>Keywords</th>
                    <th className={`${tableHead} text-right`}>Searches</th>
                    <th className={`${tableHead} text-right`}>Articles</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-[13px] text-[var(--color-muted)]">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => (
                      <tr key={u.email} className={tableRow}>
                        <td className={`${tableCell} font-medium text-[var(--color-fg)]`}>{u.email}</td>
                        <td className={`${tableCell} text-[var(--color-muted)] whitespace-nowrap`}>{formatDate(u.signedUpAt)}</td>
                        <td className={tableCell}>
                          <span className="rounded-full bg-[#5e6ad215] px-2.5 py-1 text-[12px] font-medium text-[var(--color-accent)]">
                            {u.planLabel}
                          </span>
                        </td>
                        <td className={`${tableCell} text-right tabular-nums`}>{u.credits ?? 0}</td>
                        <td className={`${tableCell} text-right tabular-nums`}>{u.sites}</td>
                        <td className={`${tableCell} text-right tabular-nums`}>{u.keywords}</td>
                        <td className={`${tableCell} text-right tabular-nums`}>{u.searches}</td>
                        <td className={`${tableCell} text-right tabular-nums`}>{u.articles}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
