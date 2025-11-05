import { supabase } from '../supabaseClient';
// This service assumes Stripe.js is loaded globally from a script tag in index.html

let stripe: any = null;

/**
 * Lazily initializes and returns the Stripe.js instance.
 * It reads the publishable key from environment variables.
 */
const getStripe = () => {
  if (!stripe) {
    const publishableKey = (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error("VITE_STRIPE_PUBLISHABLE_KEY is not configured in your .env file.");
    }
    // The 'Stripe' object is available on the window because it's loaded in index.html
    stripe = (window as any).Stripe(publishableKey);
  }
  return stripe;
};

/**
 * Creates a Stripe Checkout session by calling a Supabase Function and redirects the user to the payment page.
 * @param priceId The ID of the Stripe Price object.
 * @param mode The checkout mode ('payment' or 'subscription').
 */
export const redirectToCheckout = async (priceId: string, mode: 'payment' | 'subscription'): Promise<void> => {
  try {
    const stripeInstance = getStripe();
    
    // 1. Call the Supabase Edge Function to create a checkout session
    // The user's JWT is automatically passed in the Authorization header.
    const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session', {
      body: { priceId, mode },
    });

    if (functionError) {
      throw functionError;
    }

    const { sessionId, error: apiError } = data;
    
    if (apiError) {
        throw new Error(apiError);
    }
    
    if (!sessionId) {
      throw new Error('Could not retrieve a session ID from the function.');
    }

    // 2. Redirect to Stripe Checkout using the session ID
    const { error: stripeError } = await stripeInstance.redirectToCheckout({
      sessionId,
    });

    // This point is only reached if there's an immediate error during redirection
    if (stripeError) {
      console.error('Stripe redirection error:', stripeError);
      throw stripeError;
    }
  } catch (error) {
    console.error("Stripe service error:", error);
    if (error instanceof Error) {
        throw new Error(`Could not connect to the payment gateway: ${error.message}`);
    } else {
        throw new Error("Could not connect to the payment gateway. Please try again later.");
    }
  }
};