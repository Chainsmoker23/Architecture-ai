// FIX: Add a triple-slash directive to include Node.js type definitions,
// which resolves errors related to 'Buffer' and 'process'.
/// <reference types="node" />

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import admin from 'firebase-admin';

// --- INITIALIZATION ---

const app = express();
const port = process.env.PORT || 4242;

// --- Firebase Admin Initialization ---
try {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is not set in .env file.");
  }
  const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('ascii');
  const serviceAccount = JSON.parse(serviceAccountJson);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("🔥 Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("🔴 Firebase Admin SDK initialization failed:", error);
  process.exit(1);
}

const db = admin.firestore();


// --- Stripe and Middleware Initialization ---

// Validate essential environment variables
if (!process.env.STRIPE_SECRET_KEY || !process.env.FRONTEND_URL) {
  console.error("🔴 Missing Stripe or Frontend URL environment variables. Check your .env file.");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const corsOptions = {
  origin: process.env.FRONTEND_URL,
};
app.use(cors(corsOptions));

// --- STRIPE WEBHOOK HANDLER ---
// It must be registered *before* express.json().
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

    // Retrieve the line items to determine what was purchased
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;
    
    // Map Price ID to Plan Name
    const PLAN_MAP: { [key: string]: string } = {
        'price_1PLaGBRsL5ht22L1cDEf6a7b': 'Pro',
        'price_1PLaGZRsL5ht22L1dEfg9h0i': 'Business',
        'price_1PLaF8RsL5ht22L1bA5g4e3f': 'Hobbyist', // This is a one-time payment
    };
    const planName = PLAN_MAP[priceId || ''];

    if (!stripeCustomerId || !planName) {
        console.error(`🔴 Missing stripeCustomerId or could not determine plan for session: ${session.id}`);
        return res.status(400).send('Webhook Error: Missing customer or plan information.');
    }
    
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('stripeCustomerId', '==', stripeCustomerId).get();

        if (snapshot.empty) {
            console.error(`🔴 No user found with Stripe Customer ID: ${stripeCustomerId}`);
            return res.status(404).send('User not found.');
        }

        snapshot.forEach(async (doc) => {
            console.log(`Found user ${doc.id}, updating plan to ${planName}...`);
            // Here you can update subscription status, add credits, etc.
            // For a one-time purchase like Hobbyist, you might increment a `generations` count.
            // For a subscription, you'd save the subscription ID and status.
            await doc.ref.update({
                plan: planName,
                subscriptionStatus: 'active', // or 'credits_added' for one-time payments
            });
        });
        console.log(`✅ Payment successful and user plan updated for session: ${session.id}`);

    } catch (dbError) {
        console.error('🔥 Firebase database error during webhook processing:', dbError);
        return res.status(500).send('Database error.');
    }
  }

  res.json({ received: true });
});

// JSON middleware for all other routes
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

  try {
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    
    let stripeCustomerId: string | undefined = userDoc.data()?.stripeCustomerId;

    // Create a Stripe customer if one doesn't exist
    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({ email: userEmail, metadata: { firebaseUID: uid } });
        stripeCustomerId = customer.id;
        // Save the new customer ID to the user's Firestore document
        await userDocRef.set({ stripeCustomerId }, { merge: true });
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
