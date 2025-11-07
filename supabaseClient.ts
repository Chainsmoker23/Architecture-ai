import { createClient } from '@supabase/supabase-js';

// These variables are loaded from the .env file in the root of your project.
// This file is used for PUBLIC keys that are safe to expose to a web browser.
//
// IMPORTANT SECURITY NOTICE:
// NEVER put secret keys (like VITE_SUPABASE_SERVICE_ROLE_KEY or VITE_DODO_SECRET_KEY)
// in this file or any frontend code. They will be exposed to anyone visiting your site.
// Secret keys should ONLY be used in backend environments, like Supabase Edge Functions.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL: Supabase credentials are not configured. Authentication and all backend features (including payments) WILL NOT WORK. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable the application.");
} else {
  // Helpful log to confirm which environment the app is pointing to.
  console.log(`Supabase client initialized for URL: ${supabaseUrl}`);
}

// Pass an empty string if the env var is missing to avoid an error, the check above will warn the developer.
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');