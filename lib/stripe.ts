import Stripe from 'stripe';

/**
 * Stripe Client Configuration
 * 
 * This client is used for ALL Stripe API requests.
 * The API version is automatically set by the SDK.
 * 
 * REQUIRED: Set STRIPE_SECRET_KEY in your .env.local file
 * Get your keys from: https://dashboard.stripe.com/apikeys
 */
const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error(
    'STRIPE_SECRET_KEY is not set in environment variables.\n' +
    'Please add it to your .env.local file:\n' +
    'STRIPE_SECRET_KEY=sk_live_... or sk_test_...'
  );
}

// Initialize Stripe Client - used for ALL requests
export const stripeClient = new Stripe(secretKey, {
  // API version is automatically set by the SDK
  // No need to manually specify it
});

/**
 * Webhook Secret for validating webhook signatures
 * REQUIRED: Set STRIPE_WEBHOOK_SECRET in .env.local
 * Get it from: https://dashboard.stripe.com/webhooks
 */
export const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  console.warn(
    'STRIPE_WEBHOOK_SECRET is not set. Webhooks will not be validated.\n' +
    'Add STRIPE_WEBHOOK_SECRET=whsec_... to your .env.local'
  );
}
