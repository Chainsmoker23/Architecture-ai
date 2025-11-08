import { createClient } from '@supabase/supabase-js';

// This file is intended for the frontend. It uses public environment variables.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // This error will be thrown in the browser if the .env file is missing the required variables.
  throw new Error('[SupabaseClient] Frontend Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing.');
}

// Create and export the Supabase client for frontend usage.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
