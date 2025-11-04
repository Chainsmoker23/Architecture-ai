// This declaration is necessary because we're loading Stripe.js via a script tag.
declare const Stripe: any;

const getStripe = () => {
  try {
    const publishableKey = (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error("VITE_STRIPE_PUBLISHABLE_KEY is not set in your .env file.");
    }
    return Stripe(publishableKey);
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
    return null;
  }
};

/**
 * Calls the backend to create a Stripe Checkout session and redirects the user.
 * @param priceId The ID of the Stripe Price object for the selected plan.
 * @param userEmail The email of the currently logged-in user.
 * @param mode The type of checkout session: 'payment' for one-time, 'subscription' for recurring.
 */
export const redirectToCheckout = async (priceId: string, userEmail: string, mode: 'payment' | 'subscription'): Promise<void> => {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe.js has not loaded yet.");
  }
  
  // !!! IMPORTANT !!!
  // Replace this placeholder with the URL of your new Leapcell backend.
  // It will look like: https://your-project.leapcell.app
  const leapcellBackendUrl = "https://your-project.leapcell.app"; // <-- PASTE YOUR LEAPCELL URL HERE

  if (!leapcellBackendUrl || leapcellBackendUrl.includes("your-project.leapcell.app")) {
    throw new Error("Please replace the placeholder URL in `services/stripeService.ts` with your deployed Leapcell backend URL.");
  }

  const checkoutUrl = `${leapcellBackendUrl}/api/create-stripe-checkout-session`;

  try {
    const response = await fetch(checkoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId, userEmail, mode }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Failed to create checkout session: ${errorBody.error || response.statusText}`);
    }

    const session = await response.json();
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.sessionId,
    });

    if (error) {
      console.error('Stripe redirect error:', error);
      throw new Error(error.message || 'An error occurred during the redirect to Stripe.');
    }
  } catch (error) {
    console.error("Stripe service error:", error);
    throw error; // Re-throw the error to be handled by the calling component
  }
};