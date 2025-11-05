// FIX: Add a global declaration for `Deno` to satisfy the TypeScript compiler.
// Supabase Edge Functions run in a Deno environment where `Deno` is a global variable.
declare const Deno: any;

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.2'
import Stripe from 'https://esm.sh/stripe@16.1.0'

// Load environment variables
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId } = await req.json()
    if (!priceId) {
      throw new Error('Missing parameter: priceId')
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) {
      throw new Error('User not found')
    }
    
    // Retrieve or create a Stripe customer
    let { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116: row not found
        throw error;
    }

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_id: user.id },
      })
      customerId = customer.id
      
      // Save the new customer ID to the user's profile
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
        
      if (updateError) throw updateError
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription', // or 'payment' for one-time
      success_url: `${Deno.env.get('SITE_URL')}/sdk?payment=success`,
      cancel_url: `${Deno.env.get('SITE_URL')}/sdk?payment=cancelled`,
    })

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating checkout session:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})