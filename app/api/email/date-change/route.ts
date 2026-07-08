import { NextRequest, NextResponse } from "next/server";
import { sendBatchEmails, emailTemplate } from "@/lib/email";

export const runtime = "nodejs";

const ADMIN_EMAIL = "admin@gmail.com";

/**
 * POST /api/email/date-change  (admin only)
 * Emails every attending guest that the wedding date has changed.
 * Auth: the admin's Supabase access token in the Authorization header.
 */
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 501 });
  }

  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify the caller is the admin.
  const userRes = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: `Bearer ${token}` },
  });
  const user = (await userRes.json().catch(() => null)) as { email?: string } | null;
  if (!userRes.ok || user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { weddingDate?: string };
  const when = body.weddingDate
    ? new Date(body.weddingDate).toLocaleString("en-GB", {
        timeZone: "Europe/London",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "a new date and time";

  // Read attending guests' emails (RLS allows the admin's token to SELECT).
  const listRes = await fetch(
    `${url}/rest/v1/rsvps?select=name,email&email=not.is.null&status=eq.attending`,
    { headers: { apikey: anon, Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  if (!listRes.ok) {
    return NextResponse.json({ error: "Could not read guest list." }, { status: 502 });
  }
  const rows = (await listRes.json()) as { name: string; email: string }[];

  // De-duplicate by email.
  const seen = new Set<string>();
  const guests = rows.filter((r) => r.email && !seen.has(r.email) && seen.add(r.email));
  if (guests.length === 0) {
    return NextResponse.json({ sent: 0, message: "No guest emails on file yet." });
  }

  const emails = guests.map((g) => ({
    to: g.email,
    subject: "📅 Update: our wedding date has changed",
    html: emailTemplate({
      heading: "Our wedding date has changed",
      body: `<p>Dear ${g.name || "friend"},</p>
        <p>We're writing to let you know the date of our wedding has been updated. The celebration will now take place on:</p>
        <p style="font-size:17px;font-weight:bold;color:#8b4f58;">${when}</p>
        <p>Everything else stays the same — same venue, same joy. Your existing entry pass is still valid. Please update your calendar, and we can't wait to celebrate with you!</p>
        <p>With love,<br/>Abdirahim &amp; Creezel</p>`,
    }),
  }));

  const result = await sendBatchEmails(emails);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({ sent: result.sent });
}
