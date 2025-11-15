import * as express from 'express';
import { supabaseAdmin } from '../supabaseClient';
import { authenticateUser } from '../userUtils';
import { activatePlanAndUpdateUser } from '../paymentUtils';
import { getVerifiedDodoSessionById, getVerifiedDodoSessionByPaymentId } from './paymentVerification';

export const handleVerifyPaymentStatus = async (req: express.Request, res: express.Response) => {
    const user = await authenticateUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized.' });

    const { subscriptionId } = req.body;
    if (!subscriptionId) return res.status(400).json({ error: 'Subscription ID is required.' });

    try {
        const { data: subscription, error } = await supabaseAdmin.from('subscriptions').select('*').eq('id', subscriptionId).eq('user_id', user.id).single();
        if (error || !subscription) return res.status(404).json({ error: 'Subscription not found.' });
        if (subscription.status === 'active') return res.json({ success: true, message: 'Plan already active.' });
        
        // Check if the subscription is in a state where it can be verified.
        // It must be 'pending' and have a temporary Dodo Session ID (cks_...).
        if (subscription.status !== 'pending' || !subscription.dodo_subscription_id || !subscription.dodo_subscription_id.startsWith('cks_')) {
            return res.status(409).json({ error: 'Subscription is not in a verifiable state (missing session ID).' });
        }

        const dodoSessionId = subscription.dodo_subscription_id;
        const dodoSession = await getVerifiedDodoSessionById(dodoSessionId);
        
        if (dodoSession) {
            console.log(`[Payment Verify] Dodo session ${dodoSessionId} is complete. Manually triggering activation.`);
            
            const mode = dodoSession.metadata?.mode;
            if (!mode) {
                throw new Error('Verification failed: Dodo session is missing mode metadata.');
            }
            
            let referenceId: string | null = null;
            if (mode === 'payment') { // Hobbyist one-time
                referenceId = dodoSession.payment_id || dodoSession.payment_intent;
                if (!referenceId) {
                    throw new Error('Verification failed: One-time payment session is missing its payment identifier.');
                }
            } else if (mode === 'subscription') { // Pro recurring
                referenceId = dodoSession.subscription_id;
                 if (!referenceId) {
                    throw new Error('Verification failed: Recurring subscription session is missing its subscription_id.');
                }
            } else {
                throw new Error(`Verification failed: Unknown session mode '${mode}'.`);
            }
            
            // Overwrite the temporary session ID with the final, permanent ID.
            const subToActivate = { ...subscription, dodo_subscription_id: referenceId };
            await activatePlanAndUpdateUser(user.id, subToActivate);
            res.json({ success: true, message: 'Payment verified and plan updated.' });

        } else {
            res.status(202).json({ success: false, message: 'Payment not yet confirmed.' });
        }

    } catch (err: any) {
        res.status(500).json({ error: `Verification failed: ${err.message}` });
    }
};

export const handleRecoverByPaymentId = async (req: express.Request, res: express.Response) => {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: 'Payment ID is required.' });

    try {
        console.log(`[Payment Recovery] Starting recovery for paymentId: ${paymentId}`);
        const dodoSession = await getVerifiedDodoSessionByPaymentId(paymentId);

        if (!dodoSession) {
            return res.status(202).json({ success: false, message: 'Payment provider has not yet marked this transaction as complete.' });
        }
        
        const userId = dodoSession.metadata?.user_id;
        const ourPendingSubId = dodoSession.metadata?.subscription_id;
        const mode = dodoSession.metadata?.mode;

        if (!userId || !ourPendingSubId || !mode) {
            throw new Error('Transaction is missing essential metadata (user_id, subscription_id, or mode) required for recovery.');
        }

        const { data: subscription, error } = await supabaseAdmin.from('subscriptions').select('*').eq('id', ourPendingSubId).eq('user_id', userId).single();
        if (error || !subscription) {
            throw new Error(`Could not find the corresponding internal subscription record '${ourPendingSubId}' for user '${userId}'.`);
        }
        
        if (subscription.status === 'active') {
             console.log(`[Payment Recovery] Plan for subscription ${subscription.id} is already active.`);
             return res.json({ success: true, message: 'Plan already active.' });
        }

        let referenceId: string | null = null;
        if (mode === 'payment') { // Hobbyist one-time
            referenceId = dodoSession.payment_id || dodoSession.payment_intent;
            if (!referenceId) {
                throw new Error('Recovery failed: One-time payment session is missing its payment identifier.');
            }
        } else if (mode === 'subscription') { // Pro recurring
            referenceId = dodoSession.subscription_id;
            if (!referenceId) {
                throw new Error('Recovery failed: Recurring subscription session is missing its subscription_id.');
            }
        } else {
            throw new Error(`Recovery failed: Unknown session mode '${mode}'.`);
        }
        
        const subToActivate = { ...subscription, dodo_subscription_id: referenceId };
        
        await activatePlanAndUpdateUser(userId, subToActivate);
        
        return res.json({ success: true, message: 'Payment recovered and plan updated.' });

    } catch (err: any) {
        console.error('[Payment Recovery] Error:', err.message);
        res.status(500).json({ error: `An unexpected error occurred during payment recovery: ${err.message}` });
    }
};