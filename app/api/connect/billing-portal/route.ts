import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/lib/stripe';

/**
 * POST /api/connect/billing-portal
 * 
 * Creates a Billing Portal session for a connected account.
 * Allows sellers to manage their platform subscription.
 * 
 * Request body:
 * {
 *   accountId: 'acct_...',     // Connected account ID (required)
 *   returnUrl: '...',          // Where to return after portal (optional)
 * }
 * 
 * The Billing Portal lets users:
 * - Update payment methods
 * - Upgrade/downgrade plans
 * - Cancel subscriptions
 * - View invoices
 */

export async function POST(req: NextRequest) {
  try {
    const {
      accountId,
      returnUrl,
    } = await req.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'Connected account ID (accountId) is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.hoardstash.com';

    /**
     * Create Billing Portal Session (V1 API)
     * 
     * Uses customer for V1 compatibility.
     */
    const session = await stripeClient.billingPortal.sessions.create({
      customer: accountId,

      // Return URL after they close the portal
      return_url: returnUrl || `${baseUrl}/seller/dashboard`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      accountId,
    });

  } catch (error: any) {
    console.error('Error creating billing portal:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create billing portal session',
        type: error.type || 'unknown_error',
        hint: 'Make sure the connected account has an active subscription'
      },
      { status: 500 }
    );
  }
}
