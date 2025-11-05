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

const getPlanFromPriceId = (priceId: string): string => {
    // This should match the price IDs you created in Stripe and used on the frontend
    const priceIdToPlan: { [key: string]: string } = {
        'price_1Pef8dRxpYpajPMv6NCLcMhT': 'hobbyist',
        'price_1Pef9WRxpYpajPMvg0xOM0kK': 'pro',
        'price_1PefAlRxpYpajPMv0fJdpewU': 'business'
    };
    return priceIdToPlan[priceId] || 'unknown';
}

serve(async (req) => {
  // Handle preflight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

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
            const subscriptionId = session.subscription;
            if (typeof subscriptionId !== 'string') {
                throw new Error('Subscription ID not found in checkout session.');
            }

            // Retrieve the full subscription object to get details
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const customerId = subscription.customer;

            const { data: profile, error } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .single();

            if (error || !profile) {
                throw new Error(error?.message || `User profile not found for customer ${customerId}`);
            }

            const priceId = subscription.items.data[0]?.price.id;
            const plan = getPlanFromPriceId(priceId);

            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    plan: plan,
                    subscription_status: subscription.status,
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                })
                .eq('id', profile.id);

            if (updateError) throw updateError;
            console.log(`User ${profile.id} successfully subscribed to ${plan} plan.`);
            break;
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const customerId = subscription.customer;

            const { data: profile, error } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .single();

            if (error || !profile) {
                 throw new Error(error?.message || `User profile not found for customer ${customerId} on subscription update.`);
            }

            const priceId = subscription.items.data[0]?.price.id;
            const plan = getPlanFromPriceId(priceId);
            
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    plan: subscription.status === 'active' ? plan : 'free',
                    subscription_status: subscription.status,
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                })
                .eq('id', profile.id);

            if (updateError) throw updateError;
            console.log(`Subscription for user ${profile.id} updated to status: ${subscription.status}`);
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