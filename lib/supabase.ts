import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Only create client when both env vars are set (avoids "supabaseUrl is required" on Vercel etc.) */
function createSupabaseClient(): SupabaseClient<Database> | null {
  if (typeof url === 'string' && url.length > 0 && typeof anonKey === 'string' && anonKey.length > 0) {
    return createClient<Database>(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return null;
}

const supabaseInstance = createSupabaseClient();

/** Use this in API code; only call when isSupabase is true (client is then non-null). */
export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseInstance) throw new Error('Supabase not configured');
  return supabaseInstance;
}

/** For App.tsx auth.updateUser only – guard with isSupabase before use. */
export const supabase = supabaseInstance;
