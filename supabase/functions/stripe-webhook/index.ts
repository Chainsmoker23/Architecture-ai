import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe from 'npm:stripe@16.1.0'
import { createClient } from 'npm:@supabase/supabase-js@2.44.2'
import { corsHeaders } from '../_shared/cors.ts'

// This is a type-only declaration to satisfy the linter.
// Deno is a global object in Supabase Edge Functions.
declare const Deno: any;

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SIGNING_SECRET = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Initialize Stripe client
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    if (!STRIPE_WEBHOOK_SIGNING_SECRET || !STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables for webhook.');
    }
    
    const signature = req.headers.get('Stripe-Signature');
    const body = await req.text();

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SIGNING_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(`Checkout session completed for customer: ${session.customer}`);
        // TODO: This is where you would update the user's profile in Supabase.
        // 1. Get the `supabase_id` from the customer's metadata.
        // 2. Look up the subscription details (`session.subscription`).
        // 3. Update the `profiles` table to set the user's `plan` (e.g., 'pro'), 
        //    `subscription_status` ('active'), and `generations_remaining`.
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log(`Subscription ${subscription.status}: ${subscription.id}`);
        // TODO: Handle subscription changes, like cancellations or plan changes.
        // Update the user's `plan` and `subscription_status` in your `profiles` table.
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(`Webhook error: ${err.message}`);
    return new Response(err.message, { status: 400 });
  }
});
