import * as express from 'express';
import crypto from 'crypto';
import { User } from '@supabase/supabase-js';
import { supabaseAdmin } from '../supabaseClient';
import { DodoPayments, mockSessions } from '../dodo-payments';
import { authenticateUser } from '../userUtils';
import { getCachedConfig } from './adminController';


// --- CONTROLLER FUNCTIONS ---

export const confirmMockPayment = async (req: express.Request, res: express.Response) => {
    const { sessionId } = req.body;
    if (typeof sessionId !== 'string' || !mockSessions.has(sessionId)) {
        return res.status(404).json({ error: 'Session not found or has expired.' });
    }
    const session = mockSessions.get(sessionId);

    // Initialize Dodo with the live/cached secret key
    const config = await getCachedConfig();
    
    // FIX: Add a null check for the secret key before using it.
    if (!config.dodo_secret_key) {
        console.error('[Payment Controller] Dodo secret key is not configured.');
        return res.status(500).json({ error: 'Payment processing is not configured on the server.' });
    }
    const dodo = new DodoPayments(config.dodo_secret_key);
    
    await dodo.simulateWebhook(sessionId, session.customer, session.line_items);
    mockSessions.delete(sessionId);
    
    res.json({ success: true, redirectUrl: session.success_url });
};

export const handleDodoWebhook = async (req: express.Request, res: express.Response) => {
    const signature = req.headers['dodo-signature'];
    if (!signature || typeof signature !== 'string') {
        return res.status(400).send('Webhook Error: Missing signature.');
    }

    const config = await getCachedConfig();
    const dodoWebhookSecret = config.dodo_webhook_secret;

    if (!dodoWebhookSecret) {
        return res.status(500).send('Webhook Error: Webhook secret is not configured on the server.');
    }

    try {
        const expectedSignature = crypto
            .createHmac('sha256', dodoWebhookSecret)
            .update(req.body)
            .digest('hex');
        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            return res.status(400).send('Webhook Error: Invalid signature.');
        }
    } catch (err) {
        return res.status(400).send('Webhook Error: Invalid signature format.');
    }

    const event = JSON.parse(req.body.toString());

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const customerId = session.customer;
        const priceId = session.line_items?.data[0]?.price;

        let plan = 'free';
        if (priceId === 'dodo_price_hobby') plan = 'hobbyist';
        if (priceId === 'dodo_price_pro') plan = 'pro';
        if (priceId === 'dodo_price_biz') plan = 'business';
        
        const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError || !data) {
            return res.status(500).send({ error: 'Webhook Error: Could not list users.' });
        }

        const user = (data.users as User[]).find(u => u.user_metadata?.dodo_customer_id === customerId);

        if (!user) {
            return res.status(404).send({ error: 'Webhook Error: User not found.' });
        }

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { user_metadata: { ...(user.user_metadata || {}), plan } }
        );

        if (updateError) {
             return res.status(500).send({ error: 'Webhook Error: Failed to update user plan.' });
        }
    }
    
    res.status(200).send({ received: true });
};

export const createCheckoutSession = async (req: express.Request, res: express.Response) => {
    const { priceId } = req.body;
    const user = await authenticateUser(req);
    
    if (!user) {
        return res.status(401).send({ error: 'Unauthorized: Invalid token.' });
    }

    try {
        const config = await getCachedConfig();
        const dodoSecretKey = config.dodo_secret_key;
        const siteUrl = config.site_url;

        if (!dodoSecretKey || !siteUrl) {
            return res.status(500).send({ error: 'Payment system is not configured correctly on the server.' });
        }

        const dodo = new DodoPayments(dodoSecretKey);
        let dodoCustomerId = user.user_metadata.dodo_customer_id;

        if (!dodoCustomerId) {
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
                return res.status(500).send({ error: 'Failed to update user profile.' });
            }
        }

        const cleanSiteUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
        let plan = 'free';
        if (priceId === 'dodo_price_hobby') plan = 'hobbyist';
        if (priceId === 'dodo_price_pro') plan = 'pro';
        if (priceId === 'dodo_price_biz') plan = 'business';
        
        const session = await dodo.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: priceId === 'dodo_price_hobby' ? 'payment' : 'subscription',
            success_url: `${cleanSiteUrl}/#api?payment=success&plan=${plan}`,
            cancel_url: `${cleanSiteUrl}/#api?payment=cancelled`,
            customer: dodoCustomerId,
        });

        res.send({ sessionId: session.id });
    } catch (error: any) {
        res.status(500).send({ error: 'Internal server error.' });
    }
};