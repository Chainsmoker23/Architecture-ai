/**
 * Placeholder for Stripe checkout redirection.
 * This functionality is currently disabled because the backend service has been removed.
 * Attempting to call this function will result in an error.
 *
 * @param priceId The ID of the Stripe Price object.
 * @param userEmail The email of the user.
 * @param mode The checkout mode ('payment' or 'subscription').
 */
export const redirectToCheckout = async (priceId: string, userEmail: string, mode: 'payment' | 'subscription'): Promise<void> => {
  console.warn("Attempted to call redirectToCheckout, but payment functionality is disabled.");
  throw new Error("Payment processing is currently unavailable.");
};
