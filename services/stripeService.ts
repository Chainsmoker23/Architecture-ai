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
 * Creates a Stripe Checkout session by calling the custom backend and redirects the user to the payment page.
 * @param priceId The ID of the Stripe Price object.
 * @param userEmail The email of the user.
 * @param uid The Firebase User ID.
 * @param mode The checkout mode ('payment' or 'subscription').
 */
export const redirectToCheckout = async (priceId: string, userEmail: string, uid: string, mode: 'payment' | 'subscription'): Promise<void> => {
  try {
    const stripeInstance = getStripe();
    const backendUrl = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4242';

    // 1. Call the backend to create a checkout session
    const response = await fetch(`${backendUrl}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId, userEmail, uid, mode }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || 'Failed to create checkout session.');
    }

    const { sessionId } = await response.json();
    if (!sessionId) {
      throw new Error('Could not retrieve a session ID from the backend.');
    }

    // 2. Redirect to Stripe Checkout using the session ID
    const { error } = await stripeInstance.redirectToCheckout({
      sessionId,
    });

    // This point is only reached if there's an immediate error during redirection
    if (error) {
      console.error('Stripe redirection error:', error);
      throw error;
    }
  } catch (error) {
    console.error("Stripe service error:", error);
    throw new Error("Could not connect to the payment gateway. Please try again later.");
  }
};