import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
// Fictional Dodo Payments SDK - assuming it has a Stripe-like API
import DodoPayments from 'npm:dodo-payments@1.0.0'
import { createClient } from 'npm:@supabase/supabase-js@2.44.2'

declare const Deno: any;

console.log('Function cold start: dodo-webhook');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const getPlanFromPriceId = (priceId: string): string => {
    const priceIdToPlan: { [key: string]: string } = {
        'dodo_price_hobby': 'hobbyist',
        'dodo_price_pro': 'pro',
        'dodo_price_biz': 'business'
    };
    return priceIdToPlan[priceId] || 'unknown';
}

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Webhook request received: ${req.method}`);

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request.');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const DODO_SECRET_KEY = Deno.env.get('DODO_SECRET_KEY');
    const DODO_WEBHOOK_SIGNING_SECRET = Deno.env.get('DODO_WEBHOOK_SIGNING_SECRET');
    // IMPROVEMENT: Added fallbacks for common alternative env var names.
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('BASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY');

    if (!DODO_WEBHOOK_SIGNING_SECRET || !DODO_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('CRITICAL: Missing one or more environment variables for webhook.');
      throw new Error('Server configuration error: Missing webhook environment variables.');
    }
    console.log('All required webhook environment variables found.');
    
    const dodo = new DodoPayments(DODO_SECRET_KEY);
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log('Webhook clients initialized.');
    
    const signature = req.headers.get('Dodo-Signature');
    if (!signature) {
        throw new Error('Dodo-Signature header is missing.');
    }
    
    const body = await req.text();
    const event = await dodo.webhooks.constructEvent(
      body,
      signature,
      DODO_WEBHOOK_SIGNING_SECRET
    );
    console.log(`Successfully constructed Dodo Payments event: ${event.type}`);

    switch (event.type) {
      // Events that signify an active, paid subscription.
      case 'subscription.plan_changed':
      case 'subscription.renewed': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        console.log(`Processing active subscription event: ${event.type} for customer ${customerId}`);

        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('dodo_customer_id', customerId)
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
        console.log(`SUCCESS: User ${profile.id} subscription is now '${subscription.status}' with plan '${plan}'.`);
        break;
      }

      // Events that signify the end of a subscription and access.
      case 'subscription.expired':
      case 'subscription.failed': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        console.log(`Processing ended subscription event: ${event.type} for customer ${customerId}`);

        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('dodo_customer_id', customerId)
            .single();
        
        if (error || !profile) {
            console.warn(`Webhook received ${event.type} for customer ${customerId}, but no matching profile was found.`);
            break;
        }

        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
                plan: 'free', // Downgrade to free plan
                subscription_status: subscription.status, // e.g., 'expired' or 'past_due'
            })
            .eq('id', profile.id);

        if (updateError) throw updateError;
        console.log(`SUCCESS: Subscription for user ${profile.id} has ended. Plan set to free.`);
        break;
      }
      
      // Events for tracking status without changing the plan immediately.
      case 'subscription.cancelled':
      case 'subscription.on_hold': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        console.log(`Processing status-change event: ${event.type} for customer ${customerId}`);

        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('dodo_customer_id', customerId)
            .single();
        
        if (error || !profile) {
            console.warn(`Webhook received ${event.type} for customer ${customerId}, but no matching profile was found.`);
            break;
        }
        
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
                subscription_status: subscription.status,
            })
            .eq('id', profile.id);

        if (updateError) throw updateError;
        console.log(`INFO: Subscription for user ${profile.id} status updated to '${subscription.status}'. Plan remains active until period end.`);
        break;
      }
        
      default:
        console.log(`INFO: Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(`!!! Webhook Error !!!: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
    });
  }
});