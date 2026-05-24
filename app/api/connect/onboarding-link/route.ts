import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/lib/stripe';

/**
 * POST /api/connect/onboarding-link
 * 
 * Creates an Account Link for onboarding a connected account.
 * Account Links allow sellers to complete onboarding requirements on Stripe's hosted page.
 * Uses V1 API.
 * 
 * Request body:
 * {
 *   accountId: 'acct_...'  // The connected account ID
 * }
 */

export async function POST(req: NextRequest) {
  try {
    const { accountId } = await req.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    /**
     * Validate accountId format (basic check)
     */
    if (!accountId.startsWith('acct_')) {
      return NextResponse.json(
        { error: 'Invalid account ID format. Must start with acct_' },
        { status: 400 }
      );
    }

    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.hoardstash.com';

    /**
     * Create Account Link (V1 API)
     * 
     * type: 'account_onboarding' - for onboarding new accounts
     * collection_options: 'currently_due' - collect only currently required info
     */
    const accountLink = await stripeClient.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/seller/dashboard?onboarding=refresh&accountId=${accountId}`,
      return_url: `${baseUrl}/seller/dashboard?onboarding=complete&accountId=${accountId}`,
      type: 'account_onboarding',
      collection_options: {
        fields: 'currently_due',
        future_requirements: 'include',
      },
    });

    return NextResponse.json({
      success: true,
      url: accountLink.url,
      expiresAt: accountLink.expires_at,
      accountId,
    });

  } catch (error: any) {
    console.error('Error creating onboarding link:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create onboarding link',
        type: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
}
