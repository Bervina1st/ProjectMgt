import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazily create a single browser Supabase client. Returns null when the public
// env vars aren't set, so the app degrades gracefully (auth UI shows a config
// notice) instead of crashing the build/runtime.
let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    cached = null;
    return cached;
  }

  cached = createClient(url, key, {
    auth: {
      // Implicit flow: the session comes back in the link's URL hash, so magic
      // links work even when opened in a different browser (no stored PKCE
      // verifier required). detectSessionInUrl lets the client pick it up.
      flowType: "implicit",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
