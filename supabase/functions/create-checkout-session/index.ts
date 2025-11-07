// Imports now use bare specifiers resolved by deno.json
import { serve } from 'std/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import DodoPayments from 'dodo-payments'

declare const Deno: any;

console.log('Function cold start: create-checkout-session');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Request received: ${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request.');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const DODO_SECRET_KEY = Deno.env.get('DODO_SECRET_KEY');
    // Rely ONLY on the standard runtime-injected variables for Supabase connection.
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    // This variable should contain the frontend URL for redirects.
    const SITE_URL = Deno.env.get('URL');

    if (!DODO_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SITE_URL) {
      console.error('CRITICAL: Missing one or more environment variables. Check Supabase project settings and your .env file.');
      throw new Error('Server configuration error: Missing environment variables.');
    }
    console.log('All required environment variables found.');

    const dodo = new DodoPayments(DODO_SECRET_KEY);
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log('Dodo Payments and Supabase clients initialized.');

    const { priceId } = await req.json();
    if (!priceId) {
      throw new Error('Missing parameter: priceId in request body');
    }
    console.log(`Received priceId: ${priceId}`);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    console.log('Authorization header found.');

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      throw new Error(userError?.message || 'User not found based on token.');
    }
    console.log(`Authenticated user: ${user.id}`);
    
    // Check if the user already has a profile entry. If not, create one.
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('dodo_customer_id')
      .eq('id', user.id)
      .single();
      
    if (profileError && profileError.code === 'PGRST116') {
        console.log(`No profile found for user ${user.id}. Creating one.`);
        const { data: newProfile, error: insertError } = await supabaseAdmin
            .from('profiles')
            .insert({ id: user.id })
            .select('dodo_customer_id')
            .single();

        if (insertError) throw insertError;
        profile = newProfile;
        console.log(`Profile created for user ${user.id}.`);
    } else if (profileError) {
        throw profileError;
    }


    let customerId = profile?.dodo_customer_id;

    if (customerId) {
        console.log(`Found existing Dodo Payments customer ID: ${customerId}`);
    } else {
        console.log('No Dodo Payments customer ID found. Creating a new one.');
        const customer = await dodo.customers.create({
            email: user.email,
            metadata: { supabase_id: user.id },
        });
        customerId = customer.id;
        console.log(`Created new Dodo customer: ${customerId}`);

        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ dodo_customer_id: customerId })
            .eq('id', user.id);
        if (updateError) throw updateError;
        console.log(`Updated profile for user ${user.id} with new Dodo customer ID.`);
    }

    const session = await dodo.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${SITE_URL}#sdk?payment=success`,
      cancel_url: `${SITE_URL}#sdk?payment=cancelled`,
    });
    console.log(`Successfully created Dodo Payments checkout session: ${session.id}`);

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('!!! Function Error !!!', error.message);
    return new Response(JSON.stringify({ error: `Function failed: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});