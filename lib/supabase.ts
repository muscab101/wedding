import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase env vars are missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (locally in .env.local, and in your Vercel project settings for production)."
  );
}

// Single browser client, reused across the app.
//
// - persistSession + autoRefreshToken: keep the guest signed in across reloads.
// - detectSessionInUrl: on the /auth/callback page, automatically read the
//   OAuth params from the URL and establish the session.
// - flowType "pkce": OAuth returns a short-lived `?code=` that we exchange for a
//   session. This is more reliable in production than the implicit flow (which
//   returns tokens in the URL hash that can be dropped on redirect).
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});
