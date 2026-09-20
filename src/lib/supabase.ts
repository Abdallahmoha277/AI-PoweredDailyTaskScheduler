import { createClient } from '@supabase/supabase-js';

// We fall back to empty strings to prevent crashes if env vars are missing during build,
// but you must ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
