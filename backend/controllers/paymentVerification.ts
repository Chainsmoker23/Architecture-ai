import { getDodoClient } from '../dodo-payments';

/**
 * Retrieves a Dodo checkout session by its ID and verifies it is complete and paid.
 * @param sessionId The Dodo Checkout Session ID.
 * @returns The verified Dodo session object if valid, otherwise null.
 */
export const getVerifiedDodoSessionById = async (sessionId: string): Promise<any | null> => {
    try {
        const dodo = await getDodoClient();
        const dodoSession: any = await dodo.checkoutSessions.retrieve(sessionId);

        if (!dodoSession) return null;

        const isPaid = dodoSession.payment_status === 'paid';
        const isSubscriptionCreated = !!dodoSession.subscription_id;

        if (dodoSession.status === 'complete' && (isPaid || isSubscriptionCreated)) {
            return dodoSession;
        }
        return null;
    } catch (error) {
        console.error(`[Dodo Verification] Error retrieving session ${sessionId}:`, error);
        return null;
    }
};

/**
 * Retrieves a Dodo checkout session by its Payment ID and verifies it is complete and paid.
 * This is a robust recovery mechanism that works around the lack of a direct lookup in the Dodo SDK.
 * @param paymentId The Dodo Payment ID (e.g., 'pay_...').
 * @returns The verified Dodo session object if found and valid, otherwise null.
 */
export const getVerifiedDodoSessionByPaymentId = async (paymentId: string): Promise<any | null> => {
    try {
        const dodo = await getDodoClient();
        const { supabaseAdmin } = await import('../supabaseClient');

        // This is a workaround since Dodo SDK doesn't support lookup by payment ID.
        // We find all recent pending subscriptions and check their session IDs one by one.
        const { data: pendingSubs, error } = await supabaseAdmin
            .from('subscriptions')
            .select('id, dodo_subscription_id') // Query the unified column
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(50); // Look at last 50 pending subs to be safe

        if (error || !pendingSubs) {
            console.error('[Verification Engine] Could not fetch pending subs to search for payment ID.', error);
            return null;
        }

        for (const sub of pendingSubs) {
            // Ensure the stored ID is a session ID before trying to retrieve it
            if (!sub.dodo_subscription_id || !sub.dodo_subscription_id.startsWith('cks_')) {
                continue;
            }
            
            const dodoSessionId = sub.dodo_subscription_id;
            const session: any = await dodo.checkoutSessions.retrieve(dodoSessionId);
            const dodoPaymentId = session.payment_id || session.payment_intent_id || session.payment_intent;
            
            if (dodoPaymentId === paymentId) {
                // Found the matching session. Now verify its status.
                const isPaid = session.payment_status === 'paid';
                const isSubscriptionCreated = !!session.subscription_id;

                if (session.status === 'complete' && (isPaid || isSubscriptionCreated)) {
                    console.log(`[Verification Engine] Found matching and complete session ${session.id} for payment ${paymentId}`);
                    return session; // Return the full, verified session object.
                }
            }
        }
        
        console.warn(`[Verification Engine] No matching, complete session found for payment ID ${paymentId} after searching recent pending transactions.`);
        return null;

    } catch (error) {
        console.error(`[Dodo Verification] Error during recovery lookup for payment ID ${paymentId}:`, error);
        return null;
    }
};