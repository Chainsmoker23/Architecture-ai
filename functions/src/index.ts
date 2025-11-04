import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import * as cors from "cors";

admin.initializeApp();

// Initialize Stripe with the secret key from Firebase config
// This is a secure way to store your secret key
const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: "2024-04-10",
});

const corsHandler = cors({origin: true});

export const createStripeCheckoutSession = functions.https.onRequest(
  (req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
      }

      const {priceId, userEmail, mode} = req.body;

      if (!priceId || !userEmail || !mode) {
        res.status(400).send("Missing required parameters: priceId, userEmail, or mode.");
        return;
      }

      if (mode !== 'payment' && mode !== 'subscription') {
        res.status(400).send("Invalid mode. Must be 'payment' or 'subscription'.");
        return;
      }

      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: mode,
          customer_email: userEmail,
          line_items: [{
            price: priceId,
            quantity: 1,
          }],
          // IMPORTANT: Replace these with your app's actual URLs
          success_url: `${req.headers.origin}/?payment_success=true`,
          cancel_url: `${req.headers.origin}/sdk?payment_cancelled=true`,
        });

        if (session.id) {
          res.status(200).json({sessionId: session.id});
        } else {
          res.status(500).send("Failed to create Stripe session.");
        }
      } catch (error) {
        functions.logger.error("Stripe Error:", error);
        if (error instanceof Error) {
          res.status(500).send(`Stripe error: ${error.message}`);
        } else {
          res.status(500).send("An unknown error occurred with Stripe.");
        }
      }
    });
  }
);
