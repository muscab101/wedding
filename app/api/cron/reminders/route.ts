import { NextRequest, NextResponse } from "next/server";
import { sendBatchEmails, emailTemplate } from "@/lib/email";

export const runtime = "nodejs";

/**
 * GET /api/cron/reminders  — run daily by Vercel Cron.
 * Sends an "RSVP closes tomorrow" email 8 days before the wedding (RSVP shuts
 * at wedding - 7 days) and a "see you tomorrow" email the day before.
 * Reads guest emails with the Supabase service-role key (no user context).
 */
export async function GET(req: NextRequest) {
  // Vercel Cron includes Authorization: Bearer <CRON_SECRET> when it's configured.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    return NextResponse.json({ error: "Supabase service role not configured." }, { status: 501 });
  }
  const sHeaders = { apikey: service, Authorization: `Bearer ${service}` };

  const sRes = await fetch(`${url}/rest/v1/app_settings?id=eq.1&select=wedding_date`, {
    headers: sHeaders,
    cache: "no-store",
  });
  const sRows = (await sRes.json()) as { wedding_date?: string }[];
  const weddingIso = sRows?.[0]?.wedding_date;
  if (!weddingIso) return NextResponse.json({ error: "No wedding date set." }, { status: 500 });

  // Whole-day difference in London calendar days.
  const londonDate = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  const daysBetween = Math.round(
    (Date.parse(londonDate(new Date(weddingIso))) - Date.parse(londonDate(new Date()))) / 86400000
  );

  let subject = "";
  let heading = "";
  let intro = "";
  if (daysBetween === 8) {
    subject = "⏰ RSVP closes tomorrow!";
    heading = "RSVP closes tomorrow";
    intro =
      "Just a reminder — RSVPs for our wedding close tomorrow. If you haven't confirmed your attendance and grabbed your digital entry pass yet, please do it today!";
  } else if (daysBetween === 1) {
    subject = "💍 See you tomorrow!";
    heading = "See you tomorrow!";
    intro =
      "The big day is almost here — we can't wait to celebrate with you tomorrow. Please remember to bring your digital entry pass to the gate.";
  } else {
    return NextResponse.json({ skipped: true, daysBetween });
  }

  const listRes = await fetch(
    `${url}/rest/v1/rsvps?select=name,email&email=not.is.null&status=eq.attending`,
    { headers: sHeaders, cache: "no-store" }
  );
  const rows = (await listRes.json()) as { name: string; email: string }[];
  const seen = new Set<string>();
  const guests = rows.filter((r) => r.email && !seen.has(r.email) && seen.add(r.email));
  if (guests.length === 0) return NextResponse.json({ sent: 0, daysBetween });

  const emails = guests.map((g) => ({
    to: g.email,
    subject,
    html: emailTemplate({
      heading,
      body: `<p>Dear ${g.name || "friend"},</p><p>${intro}</p><p>With love,<br/>Abdirahim &amp; Creezel</p>`,
    }),
  }));

  const result = await sendBatchEmails(emails);
  if (!result.ok) return NextResponse.json({ error: result.error, daysBetween }, { status: 502 });
  return NextResponse.json({ sent: result.sent, daysBetween });
}
