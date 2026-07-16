import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { planLabel } from "@/lib/planLabels";

interface AdminUserRow {
  email: string;
  signedUpAt: string | null;
  plan: string | null;
  planLabel: string;
  credits: number | null;
  sites: number;
  keywords: number;
  searches: number;
  articles: number;
}

async function listAllAuthUsers() {
  const users: { email: string; created_at: string }[] = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    for (const u of data.users) {
      if (u.email) users.push({ email: u.email.toLowerCase().trim(), created_at: u.created_at });
    }

    if (data.users.length < perPage) break;
    page += 1;
  }

  return users;
}

function countByEmail(rows: { email: string | null }[] | null): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows ?? []) {
    if (!row.email) continue;
    const key = row.email.toLowerCase().trim();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export async function GET(req: NextRequest) {
  const isAuthed = verifyAdminSessionToken(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [authUsers, urls, keywords, searches, articles, credits] = await Promise.all([
      listAllAuthUsers(),
      supabase.from("tracked_urls").select("email"),
      supabase.from("tracked_keywords").select("email"),
      supabase.from("search_logs").select("email"),
      supabase.from("articles").select("user_email"),
      supabase.from("user_credits").select("email, credits, plan"),
    ]);

    const siteCounts = countByEmail(urls.data);
    const keywordCounts = countByEmail(keywords.data);
    const searchCounts = countByEmail(searches.data);
    const articleCounts = countByEmail(
      (articles.data ?? []).map((a) => ({ email: a.user_email }))
    );
    const creditsByEmail = new Map(
      (credits.data ?? []).map((c) => [c.email.toLowerCase().trim(), c])
    );

    const rows: AdminUserRow[] = authUsers.map((u) => {
      const creditRow = creditsByEmail.get(u.email);
      return {
        email: u.email,
        signedUpAt: u.created_at,
        plan: creditRow?.plan ?? null,
        planLabel: planLabel(creditRow?.plan ?? null),
        credits: creditRow?.credits ?? null,
        sites: siteCounts.get(u.email) ?? 0,
        keywords: keywordCounts.get(u.email) ?? 0,
        searches: searchCounts.get(u.email) ?? 0,
        articles: articleCounts.get(u.email) ?? 0,
      };
    });

    rows.sort((a, b) => (b.signedUpAt ?? "").localeCompare(a.signedUpAt ?? ""));

    return NextResponse.json({ users: rows });
  } catch (err) {
    console.error("[admin users]", err);
    return NextResponse.json({ error: "Failed to load users." }, { status: 500 });
  }
}
