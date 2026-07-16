import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/adminSession";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: null }));

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error("[admin login] ADMIN_PASSWORD is not set");
    return NextResponse.json({ error: "Admin login is not configured." }, { status: 500 });
  }

  const a = Buffer.from(typeof password === "string" ? password : "");
  const b = Buffer.from(expected);
  const matches = a.length === b.length && timingSafeEqual(a, b);

  if (!matches) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
