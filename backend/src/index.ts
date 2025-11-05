// FIX: Resolve Node.js type definition errors by removing the conflicting triple-slash reference
// and explicitly importing the `process` module. This ensures `process.exit` is correctly typed.
import 'dotenv/config';
import process from 'node:process';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// --- INITIALIZATION ---

const app = express();
const port = process.env.PORT || 4242;

// --- Supabase Admin Initialization ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("🔴 Supabase URL or Service Role Key is missing. Check your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log("🔥 Supabase Admin Client initialized successfully.");


// --- Stripe and Middleware Initialization ---

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("🔴 Missing Stripe secret key. Check your .env file.");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const allowedOrigins = [
  'http://localhost:3000', // Common CRA port
  'http://localhost:5173', // Common Vite port
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({ origin: allowedOrigins }));


// --- STRIPE WEBHOOK HANDLER ---
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("🔴 Webhook signature or secret is missing.");
    return res.status(400).send('Webhook Error: Missing signature or secret.');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // --- Handle the event ---
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const stripeCustomerId = session.customer as string;

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;
    
    const PLAN_MAP: { [key: string]: string } = {
        'price_1PLaGBRsL5ht22L1cDEf6a7b': 'Pro',
        'price_1PLaGZRsL5ht22L1dEfg9h0i': 'Business',
        'price_1PLaF8RsL5ht22L1bA5g4e3f': 'Hobbyist',
    };
    const planName = PLAN_MAP[priceId || ''];

    if (!stripeCustomerId || !planName) {
        console.error(`🔴 Missing stripeCustomerId or could not determine plan for session: ${session.id}`);
        return res.status(400).send('Webhook Error: Missing customer or plan information.');
    }
    
    try {
        // Find user in 'profiles' table by stripe_customer_id
        const { data: profile, error: findError } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', stripeCustomerId)
            .single();
            
        if (findError || !profile) {
            console.error(`🔴 No user found with Stripe Customer ID: ${stripeCustomerId}`, findError);
            return res.status(404).send('User not found.');
        }

        // Update the user's plan
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                plan: planName,
                subscription_status: 'active', // or handle credits for one-time
            })
            .eq('id', profile.id);

        if (updateError) throw updateError;

        console.log(`✅ Payment successful and user plan updated for user ID: ${profile.id}`);

    } catch (dbError) {
        console.error('🔥 Supabase database error during webhook processing:', dbError);
        return res.status(500).send('Database error.');
    }
  }

  res.json({ received: true });
});

app.use(express.json());


// --- API ROUTES ---

app.get('/', (req, res) => {
  res.send('CubeGen AI Backend is running.');
});

app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, userEmail, uid, mode } = req.body;

  if (!priceId || !userEmail || !uid || !mode) {
    return res.status(400).json({ error: 'Missing required parameters: priceId, userEmail, uid, and mode.' });
  }

  if (!process.env.FRONTEND_URL) {
    const errorMsg = "Critical backend configuration missing: FRONTEND_URL is not set in the .env file.";
    console.error(`🔴 ${errorMsg}`);
    return res.status(500).json({ error: errorMsg });
  }

  try {
    // Check if user profile exists in Supabase
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', uid)
        .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw profileError;
    }
    
    let stripeCustomerId = profile?.stripe_customer_id;

    // Create a Stripe customer if one doesn't exist
    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({ email: userEmail, metadata: { supabaseUID: uid } });
        stripeCustomerId = customer.id;
        // Upsert profile with new Stripe customer ID
        const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({ id: uid, stripe_customer_id: stripeCustomerId });
        if (upsertError) throw upsertError;
        console.log(`Created Stripe customer ${stripeCustomerId} for user ${uid}`);
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode,
      // Redirect back to the SDK/Pricing page with status parameters
      success_url: `${process.env.FRONTEND_URL}/sdk?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/sdk?payment_cancelled=true`,
    });

    res.json({ sessionId: session.id });

  } catch (e: any) {
    console.error("🔴 Stripe session creation failed:", e.message);
    res.status(500).json({ error: e.message });
  }
});


// --- SERVER STARTUP ---

app.listen(port, () => {
  console.log(`🟢 CubeGen AI Backend listening at http://localhost:${port}`);
});