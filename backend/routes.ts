// FIX: Changed import to simplify type resolution for Request and Response.
import express, { Router, Request, Response } from 'express';
import crypto from 'crypto';
// FIX: Import `User` type from supabase to resolve type inference issues.
import { User } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabaseClient';
import { DodoPayments, mockSessions } from './dodo-payments';

const router = Router();
const DODO_SECRET_KEY = process.env.DODO_SECRET_KEY!;
const SITE_URL = process.env.SITE_URL!;
const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET!;

const dodo = new DodoPayments(DODO_SECRET_KEY);

// --- ROUTES ---

// Endpoint to serve the realistic mock payment page
// FIX: Explicitly type `req` and `res` with imported `Request` and `Response` from Express.
router.get('/mock-payment', (req: Request, res: Response) => {
    const { sessionId } = req.query;
    if (typeof sessionId !== 'string' || !mockSessions.has(sessionId)) {
        return res.status(404).send('Session not found or has expired.');
    }
    const session = mockSessions.get(sessionId);
    res.send(dodo.getPaymentPage(sessionId, session));
});

// Endpoint to handle the form submission from the mock payment page
// FIX: Explicitly type `req` and `res` with imported `Request` and `Response` from Express.
router.post('/confirm-payment', express.urlencoded({ extended: false }), async (req: Request, res: Response) => {
    const { sessionId } = req.body;
    if (typeof sessionId !== 'string' || !mockSessions.has(sessionId)) {
        return res.status(404).send('Session not found or has expired.');
    }
    const session = mockSessions.get(sessionId);

    // Trigger the webhook simulation
    await dodo.simulateWebhook(sessionId, session.customer, session.line_items);

    // Clean up the mock session
    mockSessions.delete(sessionId);
    
    // Redirect back to the app's success URL
    res.redirect(303, session.success_url);
});

// Endpoint to handle incoming webhooks from Dodo Payments
// FIX: Explicitly type `req` and `res` with imported `Request` and `Response` from Express.
router.post('/dodo-webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const signature = req.headers['dodo-signature'];

    if (!signature || typeof signature !== 'string') {
        console.warn('[Backend] Webhook Error: Missing signature header.');
        return res.status(400).send('Webhook Error: Missing signature.');
    }

    try {
        // FIX: Corrected crypto algorithm from 'sha265' to 'sha256'.
        const expectedSignature = crypto
            .createHmac('sha256', DODO_WEBHOOK_SECRET)
            .update(req.body)
            .digest('hex');

        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            console.warn('[Backend] Webhook Error: Invalid signature.');
            return res.status(400).send('Webhook Error: Invalid signature.');
        }
    } catch (err) {
        console.error('[Backend] Webhook Error: Signature verification failed.', err);
        return res.status(400).send('Webhook Error: Invalid signature format.');
    }

    const event = JSON.parse(req.body.toString());
    console.log('[Backend] Webhook received and signature verified:', event.type);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const customerId = session.customer;
        const priceId = session.line_items?.data[0]?.price;

        let plan = 'free';
        if (priceId === 'dodo_price_hobby') plan = 'hobbyist';
        if (priceId === 'dodo_price_pro') plan = 'pro';
        if (priceId === 'dodo_price_biz') plan = 'business';
        
        console.log(`[Backend] Attempting to update user with Dodo customer ID: ${customerId} to plan: ${plan}`);

        const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError || !data) {
            console.error('[Backend] Webhook Error: Could not list users:', listError);
            return res.status(500).send({ error: 'Webhook Error: Could not list users.', details: listError });
        }

        // FIX: Cast `data.users` to `User[]` to fix type inference issue where `u` was incorrectly typed as `never`.
        const user = (data.users as User[]).find(u => u.user_metadata?.dodo_customer_id === customerId);

        if (!user) {
            console.error('[Backend] Webhook Error: Could not find user for customer ID:', customerId);
            return res.status(404).send({ error: 'Webhook Error: User not found.' });
        }

        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
// FIX: Safely spread `user.user_metadata` which can be null or undefined, preventing a runtime error.
            { user_metadata: { ...(user.user_metadata || {}), plan } }
        );

        if (updateError) {
             console.error('[Backend] Webhook Error: Failed to update user plan:', updateError);
             return res.status(500).send({ error: 'Webhook Error: Failed to update user plan.', details: updateError });
        }
        
        console.log(`[Backend] Successfully updated user ${updatedUser.user.id} to plan "${plan}".`);
    }
    
    res.status(200).send({ received: true });
});

// Endpoint for the frontend to create a new checkout session
// FIX: Explicitly type `req` and `res` with imported `Request` and `Response` from Express.
router.post('/create-checkout-session', express.json(), async (req: Request, res: Response) => {
    const { priceId } = req.body;
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ error: 'Unauthorized: No or malformed token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

        if (userError || !user) {
            console.error('[Backend] Auth error:', userError?.message);
            return res.status(401).send({ error: 'Unauthorized: Invalid token.' });
        }

        console.log(`[Backend] User ${user.email} authenticated for checkout.`);

        let dodoCustomerId = user.user_metadata.dodo_customer_id;

        if (!dodoCustomerId) {
            console.log(`[Backend] No Dodo customer ID found for ${user.email}. Creating one.`);
            const customer = await dodo.customers.create({
                email: user.email,
                name: user.user_metadata.full_name,
            });
            dodoCustomerId = customer.id;
            
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                user.id,
                { user_metadata: { ...user.user_metadata, dodo_customer_id: dodoCustomerId } }
            );

            if (updateError) {
                console.error('[Backend] Failed to save new Dodo customer ID to user profile:', updateError.message);
                return res.status(500).send({ error: 'Failed to update user profile.' });
            }
             console.log(`[Backend] Saved new Dodo customer ID ${dodoCustomerId} for user ${user.id}.`);
        } else {
             console.log(`[Backend] Found existing Dodo customer ID ${dodoCustomerId} for user ${user.id}.`);
        }

        const cleanSiteUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;

        const session = await dodo.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: priceId === 'dodo_price_hobby' ? 'payment' : 'subscription',
            success_url: `${cleanSiteUrl}/#sdk?payment=success`,
            cancel_url: `${cleanSiteUrl}/#sdk?payment=cancelled`,
            customer: dodoCustomerId,
        });

        res.send({ redirectUrl: session.url });
    } catch (error: any) {
        console.error('[Backend] Error in /create-checkout-session:', error.message);
        res.status(500).send({ error: 'Internal server error.' });
    }
});


export default router;
