import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/lib/stripe';

/**
 * POST /api/connect/checkout
 * 
 * Creates a Checkout Session for purchasing from a connected account.
 * Uses Direct Charges with application fees.
 * 
 * Direct Charges: The payment goes directly to the connected account,
 * and the platform takes a fee (application_fee_amount).
 * 
 * Request body:
 * {
 *   accountId: 'acct_...',           // Connected account ID (required)
 *   items: [{                         // Cart items (required)
 *     priceId: 'price_...',           // Stripe Price ID
 *     quantity: 1
 *   }],
 *   applicationFeePercent: 5,         // Platform fee % (default: 5%)
 *   successUrl: 'https://...',        // Redirect after success (optional)
 *   cancelUrl: 'https://...',         // Redirect after cancel (optional)
 * }
 * 
 * The Stripe-Account header is passed in the options object.
 */

export async function POST(req: NextRequest) {
  try {
    const {
      accountId,
      items,
      subtotal, // Total in cents (required for fee calculation)
      applicationFeePercent = 5, // Default 5% platform fee
      successUrl,
      cancelUrl,
    } = await req.json();

    // Validate required fields
    if (!accountId) {
      return NextResponse.json(
        { error: 'Connected account ID (accountId) is required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.priceId) {
        return NextResponse.json(
          { error: 'Each item must have a priceId' },
          { status: 400 }
        );
      }
      if (!item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: 'Each item must have a quantity >= 1' },
          { status: 400 }
        );
      }
    }

    if (!subtotal || subtotal <= 0) {
      return NextResponse.json(
        { error: 'Subtotal (in cents) is required for fee calculation' },
        { status: 400 }
      );
    }

    // Calculate application fee (platform's cut)
    const applicationFeeAmount = Math.round(subtotal * (applicationFeePercent / 100));

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.hoardstash.com';

    /**
     * Create Checkout Session with Direct Charge
     * 
     * Direct Charge means:
     * - Payment goes to connected account
     * - Platform takes application_fee_amount
     * - Connected account receives (total - fees)
     * 
     * application_fee_amount is in cents (e.g., 100 = $1.00)
     * 
     * IMPORTANT: Pass { stripeAccount: accountId } as the LAST argument
     * This creates the checkout session ON the connected account
     */
    const session = await stripeClient.checkout.sessions.create(
      {
        // Payment method types to accept
        payment_method_types: ['card'],

        // Line items from cart
        line_items: items.map((item: any) => ({
          price: item.priceId,
          quantity: item.quantity,
        })),

        // One-time payment mode
        mode: 'payment',

        // Success URL - buyer returns here after payment
        // {CHECKOUT_SESSION_ID} is replaced by Stripe
        success_url: successUrl || `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,

        // Cancel URL - buyer returns here if they cancel
        cancel_url: cancelUrl || `${baseUrl}/cart`,

        // Direct Charge configuration
        payment_intent_data: {
          /**
           * Application Fee (Platform's Cut)
           * 
           * This is calculated based on your platform fee percentage.
           * In production, calculate this from the actual cart total.
           * 
           * Example: 5% of $100 = $5.00 = 500 cents
           */
          application_fee_amount: applicationFeeAmount || 100, // Minimum $1.00

          /**
           * Transfer Data
           * 
           * This ensures the payment is transferred to the connected account
           * after Stripe deducts their fees and your application fee.
           */
          transfer_data: {
            destination: accountId,
          },
        },

        // Optional: Collect shipping address
        shipping_address_collection: {
          allowed_countries: ['US', 'CA'],
        },

        // Optional: Customer email (prefills checkout)
        // customer_email: customerEmail,

        // Metadata for your records
        metadata: {
          platform: 'hoardstash',
          seller_account_id: accountId,
          application_fee_percent: String(applicationFeePercent),
        },
      },
      {
        // CRITICAL: This creates the session on the connected account
        // Without this, the session is created on your platform account
        stripeAccount: accountId,
      }
    );

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url, // Redirect buyer to this URL
      accountId,
    });

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create checkout session',
        type: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
}
