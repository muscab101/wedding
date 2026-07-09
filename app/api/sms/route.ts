import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ADMIN_EMAIL = "admin@gmail.com";

/**
 * POST /api/sms  (admin only)
 * Sends an SMS broadcast to guests. Placeholder backend: wire in Twilio (or any
 * SMS provider) via the env vars below. Returns a clear status so the admin UI
 * can record it in the communications history.
 *
 * Env vars to enable real sending:
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
 *
 * Note: guest phone numbers aren't collected yet (the rsvps table has no phone
 * column), so there are no recipients until phone capture is added to RSVP.
 */
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 501 });
  }

  // Verify the caller is the admin.
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userRes = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: `Bearer ${token}` },
  });
  const user = (await userRes.json().catch(() => null)) as { email?: string } | null;
  if (!userRes.ok || user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { message?: string };
  const message = (body.message ?? "").trim();
  if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !authToken || !from) {
    return NextResponse.json(
      {
        status: "not-configured",
        error:
          "SMS provider is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER in Vercel.",
      },
      { status: 501 }
    );
  }

  // --- Real send would go here (placeholder) --------------------------------
  // 1) Read guest phone numbers (needs a `phone` column on rsvps):
  //      GET {url}/rest/v1/rsvps?select=phone&phone=not.is.null&status=eq.attending
  // 2) For each number, POST to Twilio:
  //      https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json
  //      Basic auth {sid}:{authToken}, body: From, To, Body=message
  // Since no phone numbers are collected yet, there are no recipients.
  return NextResponse.json({
    status: "no-recipients",
    sent: 0,
    note: "SMS is configured, but no guest phone numbers are on file yet. Add phone capture to the RSVP form to enable sending.",
  });
}
