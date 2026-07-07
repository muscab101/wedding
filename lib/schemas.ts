import { z } from "zod";

/**
 * Validation schemas + helpers shared by the RSVP form and the gate scanner.
 * Keeping the passId format in one place guarantees the generator and the
 * scanner validator can never drift apart.
 */

/** Pass IDs look like `WD-A1B2C3` (6 uppercase base-36 chars). */
export const PASS_ID_REGEX = /^WD-[A-Z0-9]{6}$/;

/** RSVP form input, validated before it ever touches Firestore. */
export const rsvpInputSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80),
  totalGuests: z.number().int().min(1).max(4),
  status: z.enum(["attending", "maybe", "declined"]),
});

export type RsvpInput = z.infer<typeof rsvpInputSchema>;

/**
 * A value scanned from a QR code. Guards the scanner against random/foreign
 * QR codes so a bad scan surfaces a clean error instead of a stray query.
 */
export const passIdSchema = z
  .string()
  .trim()
  .regex(PASS_ID_REGEX, "Not a valid wedding pass.");

/**
 * Generate a collision-resistant, human-readable pass ID using the Web Crypto
 * API. 36^6 ≈ 2.1 billion combinations — negligible collision risk at wedding
 * scale, and far stronger than Math.random().
 */
export function generatePassId(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let id = "";
  for (const byte of bytes) {
    id += alphabet[byte % alphabet.length];
  }
  return `WD-${id}`;
}
