// FIX: Use the Supabase Edge Functions runtime types to resolve Deno-related type errors.
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@11.1.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2024-04-10",
  httpClient: Stripe.createFetchHttpClient(),
});

// Create a Supabase admin client to perform elevated actions
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    // Verify the webhook signature to ensure the request is from Stripe
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return new Response(err.message, { status: 400 });
  }

  // Handle the 'checkout.session.completed' event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const stripeCustomerId = session.customer as string;

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;

    // Map Stripe Price IDs to your internal plan names
    const PLAN_MAP: { [key: string]: string } = {
      'price_1PLaGBRsL5ht22L1cDEf6a7b': 'Pro',
      'price_1PLaGZRsL5ht22L1dEfg9h0i': 'Business',
      'price_1PLaF8RsL5ht22L1bA5g4e3f': 'Hobbyist',
    };
    const planName = PLAN_MAP[priceId || ''];

    if (!stripeCustomerId || !planName) {
      console.error(`🔴 Missing stripeCustomerId or could not determine plan for session: ${session.id}`);
      return new Response("Webhook Error: Missing customer or plan information.", { status: 400 });
    }

    try {
      // Find the user's profile in Supabase using the Stripe Customer ID
      const { data: profile, error: findError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", stripeCustomerId)
        .single();

      if (findError || !profile) {
        console.error(`🔴 No user found with Stripe Customer ID: ${stripeCustomerId}`, findError);
        return new Response("User not found.", { status: 404 });
      }

      // Update the user's profile with their new plan
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          plan: planName,
          subscription_status: 'active',
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      console.log(`✅ Payment successful and user plan updated for user ID: ${profile.id}`);
    } catch (dbError) {
      console.error("🔥 Supabase database error during webhook processing:", dbError);
      return new Response("Database error.", { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});