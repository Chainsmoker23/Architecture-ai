import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your Supabase project's URL and Anon Key
// You can find these in your Supabase project's API settings
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.error("CRITICAL: Supabase credentials are not configured. Authentication and all backend features (including payments) WILL NOT WORK. Please add your project's URL and anon key to `supabaseClient.ts` to enable the application.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);