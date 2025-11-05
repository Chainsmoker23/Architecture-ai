import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your Supabase project's URL and Anon Key
// You can find these in your Supabase project's API settings
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.error("Supabase credentials are not configured. Please add your project's URL and anon key to `supabaseClient.ts` to enable authentication.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
