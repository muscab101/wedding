// Server-only email helpers built on Resend's HTTP API. Never import this from
// a client component — it reads the secret RESEND_API_KEY.

const BATCH_ENDPOINT = "https://api.resend.com/emails/batch";

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send a batch of individual emails (one per guest — personalised and private).
 * Resend's batch endpoint takes up to 100 messages per call.
 */
export async function sendBatchEmails(
  emails: OutgoingEmail[]
): Promise<{ ok: boolean; sent: number; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Abdirahim & Creezel <onboarding@resend.dev>";
  if (!key) return { ok: false, sent: 0, error: "RESEND_API_KEY is not set on the server." };
  if (emails.length === 0) return { ok: true, sent: 0 };

  try {
    for (let i = 0; i < emails.length; i += 100) {
      const chunk = emails
        .slice(i, i + 100)
        .map((e) => ({ from, to: e.to, subject: e.subject, html: e.html }));
      const res = await fetch(BATCH_ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify(chunk),
      });
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, sent: i, error: `Resend ${res.status}: ${text.slice(0, 300)}` };
      }
    }
    return { ok: true, sent: emails.length };
  } catch (e) {
    return { ok: false, sent: 0, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Wrap body content in a simple, brand-styled responsive email shell. */
export function emailTemplate(opts: { heading: string; body: string; footer?: string }): string {
  return `<!doctype html><html><body style="margin:0;background:#f6f2f3;font-family:Helvetica,Arial,sans-serif;color:#2a2124;">
  <div style="max-width:520px;margin:0 auto;padding:24px;">
    <div style="background:#ffffff;border:1px solid #efe6e8;border-radius:20px;overflow:hidden;">
      <div style="background:#8b4f58;padding:28px;text-align:center;color:#fff;">
        <div style="font-size:26px;letter-spacing:1px;font-family:Georgia,'Times New Roman',serif;">Abdirahim &amp; Creezel</div>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 12px;font-size:20px;font-family:Georgia,'Times New Roman',serif;color:#8b4f58;">${opts.heading}</h1>
        <div style="font-size:15px;line-height:1.6;color:#4a4145;">${opts.body}</div>
      </div>
      <div style="padding:18px 28px;border-top:1px solid #efe6e8;text-align:center;color:#9b8a8e;font-size:12px;">
        ${opts.footer ?? "The Wedding Celebration · Diamond Lounge, London"}
      </div>
    </div>
  </div>
</body></html>`;
}
