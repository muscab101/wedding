/**
 * Central data models for all Supabase tables.
 * Column names are snake_case to match Postgres; timestamps arrive as ISO
 * strings from the Supabase client (not Firestore Timestamps).
 */

export type RsvpStatus = "attending" | "maybe" | "declined";

/** A row in the `rsvps` table. */
export interface Rsvp {
  id: string;
  name: string;
  total_guests: number;
  status: RsvpStatus;
  pass_id: string;
  scanned: boolean;
  scanned_at: string | null;
  created_at: string;
}

/** The subset persisted to localStorage / shown on the client after RSVP. */
export type RsvpPass = {
  name: string;
  totalGuests: number;
  status: RsvpStatus;
  passId: string;
};

/** A row in the `wishes` table (guest blessings). */
export interface Wish {
  id: string;
  name: string;
  relation: string;
  text: string;
  likes: number;
  created_at: string;
}

/** A row in the `videos` table. */
export interface VideoItem {
  id: string;
  name: string;
  video_url: string;
  created_at: string;
}
