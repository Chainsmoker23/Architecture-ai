import DodoPayments from 'dodopayments';
import { getCachedConfig } from './controllers/adminController';

let dodoClientInstance: DodoPayments | null = null;

// Asynchronously get the initialized Dodo Payments client
export const getDodoClient = async (): Promise<DodoPayments> => {
    if (dodoClientInstance) {
        return dodoClientInstance;
    }

    try {
        const config = await getCachedConfig();
        const secretKey = config.dodo_secret_key;

        if (!secretKey) {
            throw new Error('Dodo Payments secret key is not configured on the server.');
        }

        dodoClientInstance = new DodoPayments({ bearerToken: secretKey });
        console.log('[Dodo Client] Dodo Payments client initialized successfully.');
        return dodoClientInstance;

    } catch (error) {
        console.error('[Dodo Client] Failed to initialize Dodo Payments client:', error);
        throw new Error('Could not initialize payment client.');
    }
};
