import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Signing the JWT uses Node crypto, so this route must run on the Node runtime.
export const runtime = "nodejs";

const PASS_ID_REGEX = /^WD-[A-Z0-9]{6}$/;

/**
 * GET /api/wallet?passId=WD-XXXXXX&name=...&guests=2
 *
 * Builds a signed "Save to Google Wallet" JWT for the event ticket and 302s to
 * the Google Wallet save URL. The class + object are embedded in the JWT (a
 * "fat" JWT), so no pre-creation via the Wallet API is required.
 *
 * Requires these server env vars (set them in Vercel → Project → Settings → Env):
 *   GOOGLE_WALLET_ISSUER_ID                 (from the Google Pay & Wallet Console)
 *   GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL     (service account email)
 *   GOOGLE_WALLET_PRIVATE_KEY               (service account private key; \n-escaped is fine)
 */
export async function GET(req: NextRequest) {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const serviceAccountEmail = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY;

  if (!issuerId || !serviceAccountEmail || !rawPrivateKey) {
    return NextResponse.json(
      { error: "Google Wallet is not configured on the server." },
      { status: 501 }
    );
  }
  // Env vars often store the key with literal "\n" — normalise to real newlines.
  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

  const { searchParams } = new URL(req.url);
  const passId = (searchParams.get("passId") ?? "").trim();
  const name = (searchParams.get("name") ?? "Guest").trim().slice(0, 80) || "Guest";
  const guests = Math.max(1, Math.min(10, parseInt(searchParams.get("guests") ?? "1", 10) || 1));

  if (!PASS_ID_REGEX.test(passId)) {
    return NextResponse.json({ error: "Invalid pass id." }, { status: 400 });
  }

  const classId = `${issuerId}.wedding_event`;
  const objectId = `${issuerId}.${passId.replace(/[^\w.-]/g, "_")}`;

  const eventTicketClass = {
    id: classId,
    issuerName: "Abdirahim & Creezel",
    reviewStatus: "UNDER_REVIEW",
    eventName: {
      defaultValue: { language: "en-US", value: "The Wedding Celebration" },
    },
    venue: {
      name: { defaultValue: { language: "en-US", value: "Diamond Lounge" } },
      address: {
        defaultValue: {
          language: "en-US",
          value: "142 The Broadway, West Ealing, London W13 0TL",
        },
      },
    },
    dateTime: { start: "2026-09-11T18:00:00+01:00" },
    hexBackgroundColor: "#8b4f58",
  };

  const eventTicketObject = {
    id: objectId,
    classId,
    state: "ACTIVE",
    ticketHolderName: name,
    ticketNumber: passId,
    hexBackgroundColor: "#8b4f58",
    barcode: { type: "QR_CODE", value: passId, alternateText: passId },
    textModulesData: [
      { header: "Allowed Guests", body: String(guests), id: "guests" },
    ],
  };

  const claims = {
    iss: serviceAccountEmail,
    aud: "google",
    typ: "savetowallet",
    origins: [new URL(req.url).origin],
    payload: {
      eventTicketClasses: [eventTicketClass],
      eventTicketObjects: [eventTicketObject],
    },
  };

  try {
    const token = jwt.sign(claims, privateKey, { algorithm: "RS256" });
    return NextResponse.redirect(`https://pay.google.com/gp/v/save/${token}`, 302);
  } catch (err) {
    console.error("Google Wallet JWT signing failed:", err);
    return NextResponse.json(
      { error: "Could not generate the wallet pass." },
      { status: 500 }
    );
  }
}
