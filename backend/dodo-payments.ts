import crypto from 'crypto';

const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET!;

// Store session data in memory for the mock flow
export const mockSessions = new Map<string, any>();

// --- Mock implementation of the fictional Dodo Payments SDK ---
export class DodoPayments {
    private apiKey: string;
    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error("[Dodo Payments Mock] API Key is required.");
        }
        this.apiKey = apiKey;
        console.log('[Dodo Payments Mock] SDK Initialized.');
    }

    customers = {
        create: async (params: { email?: string; name?: string }) => {
            console.log('[Dodo Payments Mock] Creating customer with params:', params);
            const customerId = `cus_mock_${Math.random().toString(36).substring(2, 15)}`;
            return Promise.resolve({ id: customerId });
        }
    };

    checkout = {
        sessions: {
            create: async (params: {
                payment_method_types: string[];
                line_items: any[];
                mode: string;
                success_url: string;
                cancel_url: string;
                customer?: string;
                customer_email?: string;
            }) => {
                console.log('[Dodo Payments Mock] Creating checkout session with params:', params);
                const sessionId = `cs_mock_${Math.random().toString(36).substring(2, 15)}`;

                const planName = params.line_items[0]?.price
                  .replace('dodo_price_', '')
                  .replace('biz', 'business') || 'Unknown Plan';

                // Store details for the mock payment page and webhook
                mockSessions.set(sessionId, {
                    success_url: params.success_url,
                    cancel_url: params.cancel_url,
                    customer: params.customer,
                    line_items: params.line_items,
                    planName: planName,
                });
                
                // The URL is no longer returned; only the session ID.
                return Promise.resolve({ id: sessionId, url: null });
            }
        }
    };

    async simulateWebhook(sessionId: string, customerId: string, lineItems: any[]) {
        console.log(`[Dodo Payments Mock] Simulating webhook for session: ${sessionId}`);
        
        const payload = JSON.stringify({
            type: 'checkout.session.completed',
            data: {
                object: {
                    id: sessionId,
                    customer: customerId,
                    line_items: { data: lineItems }
                }
            }
        });

        // Create a signature to send with the webhook for verification
        const signature = crypto
            .createHmac('sha256', DODO_WEBHOOK_SECRET)
            .update(payload)
            .digest('hex');

        try {
            await fetch('http://localhost:3001/api/dodo-webhook', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'dodo-signature': signature, // Send the signature
                },
                body: payload,
            });
        } catch (error) {
            console.error('[Dodo Payments Mock] Failed to send simulated webhook:', error);
        }
    }
}
