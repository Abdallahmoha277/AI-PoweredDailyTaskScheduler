import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Check your .env file (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).',
  );
}

// =====================================================================
// Clear any stale auth tokens before the Supabase client initializes.
// This prevents 400/403 errors on first page load with expired sessions.
// =====================================================================
function clearStaleAuthTokens() {
  if (typeof window === 'undefined') return;
  try {
    const authKey = Object.keys(window.localStorage).find(
      (key) => key.startsWith('sb-') && key.endsWith('-auth-token'),
    );
    if (!authKey) return;
    const raw = window.localStorage.getItem(authKey);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.expires_at) {
      const expiresMs = parsed.expires_at * 1000;
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      if (expiresMs < oneHourAgo) {
        window.localStorage.removeItem(authKey);
      }
    }
  } catch {
    // Ignore — best-effort cleanup
  }
}

clearStaleAuthTokens();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
