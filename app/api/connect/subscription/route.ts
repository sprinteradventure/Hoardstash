import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/lib/stripe';

/**
 * POST /api/connect/subscription
 * 
 * Creates a subscription checkout session for a connected account.
 * Uses customer_account (V2) to bill the connected account for platform services.
 * 
 * Request body:
 * {
 *   accountId: 'acct_...',     // Connected account ID (required)
 *   priceId: 'price_...',      // Subscription price ID (required)
 *   successUrl: '...',         // Success redirect (optional)
 *   cancelUrl: '...',          // Cancel redirect (optional)
 * }
 * 
 * IMPORTANT: This charges the CONNECTED ACCOUNT (the seller), not their customers.
 * Use this for platform fees, monthly seller subscriptions, etc.
 */

export async function POST(req: NextRequest) {
  try {
    const {
      accountId,
      priceId,
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

    if (!priceId) {
      return NextResponse.json(
        { error: 'Subscription price ID (priceId) is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.hoardstash.com';

    /**
     * Create Subscription Checkout Session (V1 API)
     * 
     * Uses customer (not customer_account) for V1 compatibility.
     * For platform billing, you would look up the customer by their connected account.
     */
    const session = await stripeClient.checkout.sessions.create({
      customer: accountId, // Using account ID as customer reference

      // Subscription mode
      mode: 'subscription',

      // Subscription line items
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      // Success URL - seller returns here after subscribing
      success_url: successUrl || `${baseUrl}/seller/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`,

      // Cancel URL - seller returns here if they cancel
      cancel_url: cancelUrl || `${baseUrl}/seller/dashboard?subscription=cancelled`,

      // Optional: Proration behavior
      subscription_data: {
        // Handle prorations automatically
        proration_behavior: 'create_prorations',
      },

      // Metadata for tracking
      metadata: {
        platform: 'hoardstash',
        account_id: accountId,
        subscription_type: 'platform_fee',
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      accountId,
    });

  } catch (error: any) {
    console.error('Error creating subscription checkout:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create subscription checkout',
        type: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
}
