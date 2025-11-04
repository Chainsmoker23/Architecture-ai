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
 */
export const redirectToCheckout = async (priceId: string, userEmail: string): Promise<void> => {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe.js has not loaded yet.");
  }
  
  // NOTE: In a production environment, you would replace this URL
  // with the URL of your deployed Firebase Cloud Function.
  // For local development with the Firebase Emulator, it might be:
  // 'http://localhost:5001/your-project-id/us-central1/createStripeCheckoutSession'
  const checkoutFunctionUrl = `https://us-central1-cubegen-ai.cloudfunctions.net/createStripeCheckoutSession`;

  try {
    const response = await fetch(checkoutFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId, userEmail }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to create checkout session: ${errorBody}`);
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
