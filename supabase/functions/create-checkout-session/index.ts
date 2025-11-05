import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.44.2'
import Stripe from 'npm:stripe@16.1.0'

// This is a type-only declaration to satisfy the linter.
// Deno is a global object in Supabase Edge Functions.
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle preflight OPTIONS request immediately. This is crucial for CORS.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables inside the handler
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SITE_URL = Deno.env.get('SITE_URL');

    // Check for required environment variables
    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SITE_URL) {
      throw new Error('Missing one or more required environment variables in Supabase project settings.');
    }

    // Lazily initialize clients only after the OPTIONS check has passed
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    });
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { priceId } = await req.json();
    if (!priceId) {
      throw new Error('Missing parameter: priceId');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      throw new Error(userError?.message || 'User not found');
    }

    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116: row not found
      throw profileError;
    }

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_id: user.id },
      });
      customerId = customer.id;

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
      if (updateError) throw updateError;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${SITE_URL}/sdk?payment=success`,
      cancel_url: `${SITE_URL}/sdk?payment=cancelled`,
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
