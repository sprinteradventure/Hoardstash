import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/lib/stripe';

/**
 * GET /api/connect/account-status?accountId=acct_...
 * 
 * Retrieves the current onboarding and capability status of a connected account.
 * Uses V1 API (V2 accounts API not yet available in Node SDK v17.7.0).
 */

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get account ID from query params
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required (accountId query param)' },
        { status: 400 }
      );
    }

    /**
     * Retrieve Account (V1 API)
     */
    const account = await stripeClient.accounts.retrieve(accountId);

    /**
     * Check onboarding completion status
     * 
     * requirements.currently_due contains fields that need to be submitted now
     * requirements.past_due contains fields that are overdue
     * If both are empty, onboarding is complete
     */
    const currentlyDue = account.requirements?.currently_due || [];
    const pastDue = account.requirements?.past_due || [];
    const eventuallyDue = account.requirements?.eventually_due || [];
    
    const onboardingComplete = currentlyDue.length === 0 && pastDue.length === 0;
    const needsAttention = currentlyDue.length > 0 || pastDue.length > 0;

    /**
     * Check payment capabilities
     */
    const cardPaymentsStatus = account.capabilities?.card_payments || 'inactive';
    const canProcessPayments = cardPaymentsStatus === 'active';
    const isPending = cardPaymentsStatus === 'pending';

    return NextResponse.json({
      accountId: account.id,
      status: {
        onboardingComplete,
        canProcessPayments,
        isPending,
        needsAttention,
      },
      capabilities: {
        cardPayments: cardPaymentsStatus,
      },
      requirements: {
        currentlyDue,
        eventuallyDue,
        pastDue,
      },
      _debug: {
        email: account.email,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      }
    });

  } catch (error: any) {
    console.error('Error retrieving account status:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to retrieve account status',
        type: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
}
