// FIX: Add a global declaration for `Deno` to satisfy the TypeScript compiler.
// Supabase Edge Functions run in a Deno environment where `Deno` is a global variable.
declare const Deno: any;

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
// FIX: Use modern `npm:` specifiers for Deno imports for better reliability.
import Stripe from 'npm:stripe@16.1.0'
import { createClient } from 'npm:@supabase/supabase-js@2.44.2'
import { corsHeaders } from '../_shared/cors.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
)

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()

  let event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')
    )
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new Response(err.message, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log(`Checkout session completed for customer: ${session.customer}`)
        // TODO: This is where you would update the user's profile in Supabase.
        // 1. Get the `supabase_id` from the customer's metadata.
        // 2. Look up the subscription details (`session.subscription`).
        // 3. Update the `profiles` table to set the user's `plan` (e.g., 'pro'), 
        //    `subscription_status` ('active'), and `generations_remaining`.
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        console.log(`Subscription ${subscription.status}: ${subscription.id}`)
        // TODO: Handle subscription changes, like cancellations or plan changes.
        // Update the user's `plan` and `subscription_status` in your `profiles` table.
        break
      }
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Error handling webhook event:', error.message)
    return new Response('Webhook handler failed', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})