import { createClient } from '@supabase/supabase-js';

// These variables are loaded from the .env file by Vite
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL: Supabase credentials are not configured. Authentication and all backend features (including payments) WILL NOT WORK. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable the application.");
}

// Pass an empty string if the env var is missing to avoid an error, the check above will warn the developer.
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
