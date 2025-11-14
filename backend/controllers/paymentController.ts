import * as express from 'express';
import { supabaseAdmin } from '../supabaseClient';
import { getDodoClient } from '../dodo-payments';
import { authenticateUser } from '../userUtils';
import { getCachedConfig } from './adminController';
import crypto from 'crypto';

// --- HELPER: Centralized Webhook Processing Logic ---
const processWebhookEvent = async (event: any) => {
    console.log(`[Webhook Processor] Processing event type: ${event.type}`);

    const updateUserPrimaryPlan = async (userId: string) => {
        const { data: subscriptions, error } = await supabaseAdmin
            .from('subscriptions')
            .select('plan_name')
            .eq('user_id', userId)
            .eq('status', 'active');

        if (error) {
            console.error(`[Webhook] Error fetching active subs for user ${userId} after update:`, error);
            return;
        }

        let newPrimaryPlan = 'free';
        if (subscriptions && subscriptions.length > 0) {
            // Determine the "best" plan. Pro is better than Hobbyist.
            if (subscriptions.some(s => s.plan_name === 'pro')) {
                newPrimaryPlan = 'pro';
            } else if (subscriptions.some(s => s.plan_name === 'hobbyist')) {
                newPrimaryPlan = 'hobbyist';
            }
        }
        
        const { data: { user: oldUser } } = await supabaseAdmin.auth.admin.getUserById(userId);

        const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { user_metadata: { ...oldUser?.user_metadata, plan: newPrimaryPlan } }
        );

        if (updateUserError) {
            console.error(`[Webhook] Failed to update user's primary plan to '${newPrimaryPlan}':`, updateUserError);
        } else {
            console.log(`[Webhook] Updated user ${userId} primary plan to '${newPrimaryPlan}'.`);
        }
    };

    switch (event.type) {
        case 'payment.succeeded':
            const session = event.data.object;
            const metadata = session.metadata || {};
            const dodoCustomerId = session.customer; // This is the Customer ID from Dodo.
            const { user_id: userId, plan_name: planName, subscription_id: ourPendingSubId, mode } = metadata;

            // CRITICAL: Save or update the customer mapping now that we have the official ID.
            if (userId && dodoCustomerId) {
                const { error: upsertError } = await supabaseAdmin
                    .from('customers')
                    .upsert({ id: userId, dodo_customer_id: dodoCustomerId });

                if (upsertError) {
                    console.error(`[Webhook] Failed to upsert customer mapping for user ${userId}:`, upsertError);
                } else {
                    console.log(`[Webhook] Customer mapping for user ${userId} to dodo customer ${dodoCustomerId} confirmed.`);
                }
            } else {
                console.warn(`[Webhook] 'payment.succeeded' event missing userId or dodoCustomerId, cannot update mapping.`);
            }

            if (!userId || !planName || !ourPendingSubId) {
                console.error(`[Webhook] 'payment.succeeded' is missing required data: userId, planName, or subscription_id.`);
                return { success: false, message: 'Webhook Error: Missing required metadata.' };
            }

            // Handle one-time purchase (Hobbyist)
            if (mode === 'payment') {
                const { error: updateError } = await supabaseAdmin
                    .from('subscriptions')
                    .update({ status: 'active' }) // No dodo_subscription_id needed
                    .eq('id', ourPendingSubId)
                    .eq('user_id', userId);

                if (updateError) {
                    console.error(`[Webhook] DB Error activating one-time purchase ${ourPendingSubId}:`, updateError);
                    return { success: false, message: 'Database error during one-time purchase activation.' };
                }
                
                const { data: { user: oldUser } } = await supabaseAdmin.auth.admin.getUserById(userId);

                // Update user metadata for Hobbyist plan (sets generation limit)
                const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
                    userId,
                    { user_metadata: { ...oldUser?.user_metadata, plan: 'hobbyist', generation_count: 0 } }
                );

                if (updateUserError) {
                    console.error(`[Webhook] Failed to update user metadata for Hobbyist plan:`, updateUserError);
                }
                
                console.log(`[Webhook] Successfully processed one-time payment for user ${userId}. Plan: 'hobbyist'`);
            } 
            // Handle subscription purchase (Pro)
            else if (mode === 'subscription') {
                const dodoSubscriptionId = session.subscription;
                if (!dodoSubscriptionId) {
                    console.error(`[Webhook] 'payment.succeeded' for a subscription is missing the subscription ID.`);
                    return { success: false, message: 'Webhook Error: Missing subscription ID for subscription payment.' };
                }

                const { error: updateSubError } = await supabaseAdmin
                    .from('subscriptions')
                    .update({
                        status: 'active',
                        dodo_subscription_id: dodoSubscriptionId,
                    })
                    .eq('id', ourPendingSubId)
                    .eq('user_id', userId);
                
                if (updateSubError) {
                    console.error(`[Webhook] DB Error updating subscription ${ourPendingSubId}:`, updateSubError);
                    return { success: false, message: 'Database error during subscription activation.' };
                }

                // This will correctly set the user's primary plan to 'pro'
                await updateUserPrimaryPlan(userId);
                console.log(`[Webhook] Successfully processed subscription payment for user ${userId}. Plan: 'pro'`);
            } else {
                 console.warn(`[Webhook] 'payment.succeeded' received without a valid 'mode' in metadata.`);
            }
            break;

        case 'subscription.cancelled':
            const subscription = event.data.object;
            const dodoSubIdToCancel = subscription.id;
            
            const { data: cancelledSub, error: cancelError } = await supabaseAdmin
                .from('subscriptions')
                .update({ status: 'cancelled' })
                .eq('dodo_subscription_id', dodoSubIdToCancel)
                .select('user_id')
                .single();

            if (cancelError) {
                console.error(`[Webhook] DB Error cancelling subscription ${dodoSubIdToCancel}:`, cancelError);
                return { success: false, message: 'Database error during subscription cancellation.' };
            }

            if (cancelledSub) {
                await updateUserPrimaryPlan(cancelledSub.user_id);
                console.log(`[Webhook] Successfully processed 'subscription.cancelled' for Dodo sub ${dodoSubIdToCancel}.`);
            }
            break;

        case 'payment.failed':
            const payment = event.data.object;
            const dodoSubIdFailed = payment.subscription;
            
            const { error: failError } = await supabaseAdmin
                .from('subscriptions')
                .update({ status: 'past_due' })
                .eq('dodo_subscription_id', dodoSubIdFailed);

            if (failError) {
                console.error(`[Webhook] DB Error marking subscription as past_due ${dodoSubIdFailed}:`, failError);
                return { success: false, message: 'Database error during payment failure handling.' };
            }
            console.log(`[Webhook] Successfully processed 'payment.failed' for Dodo sub ${dodoSubIdFailed}.`);
            break;

        default:
            console.log(`[Webhook Processor] Unhandled event type: ${event.type}`);
    }
    return { success: true };
};


// --- CONTROLLERS ---

export const handleDodoWebhook = async (req: express.Request, res: express.Response) => {
    const signature = req.headers['dodo-signature'] as string;
    if (!signature) {
        return res.status(400).send('Webhook Error: Missing signature.');
    }

    try {
        const dodo = await getDodoClient();
        const config = await getCachedConfig();
        
        if (!config.dodo_webhook_secret) {
            return res.status(500).send('Webhook Error: Server not configured for payments.');
        }

        const event = dodo.webhooks.constructEvent(req.body, signature, config.dodo_webhook_secret);
        await processWebhookEvent(event);
        res.status(200).send({ received: true });
    } catch (err: any) {
        console.error('[Payment Controller] Webhook error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

export const createCheckoutSession = async (req: express.Request, res: express.Response) => {
    const user = await authenticateUser(req);
    if (!user) {
        return res.status(401).send({ success: false, error: 'Unauthorized.' });
    }

    const { plan: planId } = req.body;
    if (!planId) {
        return res.status(400).json({ success: false, error: 'Missing parameter: plan is required.' });
    }

    try {
        const config = await getCachedConfig();
        
        const { hobbyistProductId, proProductId } = {
            hobbyistProductId: config.dodo_hobbyist_product_id,
            proProductId: config.dodo_pro_product_id,
        };
    
        if (planId === 'one_time' && !hobbyistProductId) throw new Error("Hobbyist product ID is not configured on the server.");
        if (planId === 'subscription' && !proProductId) throw new Error("Pro product ID is not configured on the server.");

        const planName = planId === 'one_time' ? 'hobbyist' : 'pro';
        const mode = planId === 'one_time' ? 'payment' : 'subscription';
        const productId = planId === 'one_time' ? hobbyistProductId! : proProductId!;
        
        const { data: newSubscription, error: insertError } = await supabaseAdmin
            .from('subscriptions')
            .insert({ user_id: user.id, plan_name: planName, status: 'pending' })
            .select('id').single();
    
        if (insertError || !newSubscription) {
            console.error("[Payment Controller] Error creating pending subscription record:", insertError);
            throw new Error('Failed to create a pending purchase record.');
        }
        
        console.log(`[Payment Controller] Created pending record ${newSubscription.id} for user ${user.id}.`);

        const { data: customerData } = await supabaseAdmin
            .from('customers').select('dodo_customer_id').eq('id', user.id).single();

        const dodo = await getDodoClient();
        const cleanSiteUrl = (config.site_url || '').replace(/\/$/, '');
        
        const sessionPayload: any = {
            mode,
            product_cart: [{ product_id: productId, quantity: 1 }],
            return_url: `${cleanSiteUrl}/#api?payment=success&plan=${planName}`,
            cancel_url: `${cleanSiteUrl}/#api?payment=cancelled`,
            billing_address_collection: 'required',
            metadata: { user_id: user.id, plan_name: planName, subscription_id: newSubscription.id, mode },
        };
        
        if (customerData?.dodo_customer_id) {
            sessionPayload.customer = customerData.dodo_customer_id;
        } else {
            if (!user.email) throw new Error('User email is required to create a billing customer.');
            const fallbackName = user.email.split('@')[0];
            sessionPayload.customer = {
                email: user.email,
                name: user.user_metadata?.full_name || fallbackName,
            };
        }

        let session;
        try {
            console.log('[Payment Controller] Attempting to create Dodo session with payload:', JSON.stringify(sessionPayload, null, 2));
            session = await dodo.checkoutSessions.create(sessionPayload);
        } catch (dodoError: any) {
            console.error('[Payment Controller] Dodo SDK Error (Attempt 1):', dodoError);

            if (customerData?.dodo_customer_id && dodoError.message && dodoError.message.toLowerCase().includes('customer')) {
                console.warn(`[Payment Controller] Possible invalid customer ID '${customerData.dodo_customer_id}'. Retrying as a new customer.`);
                delete sessionPayload.customer;
                const fallbackName = user.email ? user.email.split('@')[0] : 'Valued Customer';
                sessionPayload.customer = {
                    email: user.email!,
                    name: user.user_metadata?.full_name || fallbackName,
                };
                
                console.log('[Payment Controller] Retrying Dodo session creation with new customer details:', JSON.stringify(sessionPayload, null, 2));
                session = await dodo.checkoutSessions.create(sessionPayload);
            } else {
                throw dodoError;
            }
        }
        
        console.log('[Payment Controller] Dodo session created successfully.');
        console.log('[Payment Controller] Full session object received:', JSON.stringify(session, null, 2));

        if (!session || !session.checkout_url) {
            console.error('[Payment Controller] CRITICAL: Dodo session was created but is missing the `checkout_url`.');
            throw new Error('Payment provider did not return a valid checkout URL. Please check server logs.');
        }

        console.log('[Payment Controller] Sending success response to client.');
        res.status(200).json({ success: true, checkout_url: session.checkout_url });

    } catch (error: any) {
        console.error(`[Payment Controller] Error in createCheckoutSession:`, error);
        
        let clientErrorMessage = 'An internal server error occurred while creating the checkout session.';
        
        if (error.message) {
            if (error.message.includes('Product') && error.message.includes('does not exist')) {
                clientErrorMessage = `Payment processing error: A configured Product ID is invalid. Please verify settings in the Admin Panel.`;
            } else if (error.message.includes('API key')) {
                 clientErrorMessage = 'Payment provider API key is invalid. Please check server configuration.';
            } else if (error.message.toLowerCase().includes('customer')) {
                clientErrorMessage = 'There was an issue with the customer billing profile. Please try again or contact support.';
            } else {
                clientErrorMessage = error.message;
            }
        }
        
        res.status(500).json({ success: false, error: clientErrorMessage });
    }
};
