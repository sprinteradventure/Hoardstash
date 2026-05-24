import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

/**
 * Webhook Secret for Connect events
 * Get it from: https://dashboard.stripe.com/webhooks
 */
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_CONNECT || process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST /api/webhooks/stripe-connect
 * 
 * Handles Stripe Connect account-related webhook events.
 * 
 * Events to configure in Stripe Dashboard:
 * - account.updated (for onboarding and capability changes)
 * 
 * Setup: https://dashboard.stripe.com/webhooks
 */

// Initialize Supabase for updating account status
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET_CONNECT not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripeClient.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Received webhook event:', {
      id: event.id,
      type: event.type,
      account: event.account,
    });

    // Handle account.updated event
    if (event.type === 'account.updated') {
      const account = event.data.object;
      await handleAccountUpdated(account);
    } else {
      console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle Account Updated
 * 
 * Triggered when:
 * - Requirements change (new fields needed, fields submitted)
 * - Capabilities change status (active, pending, restricted)
 * - Account status changes
 */
async function handleAccountUpdated(account: any) {
  const accountId = account.id;
  
  if (!accountId) {
    console.error('No account ID in event');
    return;
  }

  // Check if onboarding is complete
  const currentlyDue = account.requirements?.currently_due || [];
  const pastDue = account.requirements?.past_due || [];
  const onboardingComplete = currentlyDue.length === 0 && pastDue.length === 0;

  // Check payment capabilities
  const cardPaymentsStatus = account.capabilities?.card_payments || 'inactive';
  const canProcessPayments = cardPaymentsStatus === 'active';

  console.log('Account updated:', {
    accountId,
    onboardingComplete,
    canProcessPayments,
    cardPaymentsStatus,
  });

  // Update database
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        stripe_onboarding_complete: onboardingComplete,
        stripe_card_payments_status: cardPaymentsStatus,
        stripe_requirements_due: currentlyDue.length > 0 || pastDue.length > 0,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_account_id', accountId);

    if (error) {
      console.error('Database update error:', error);
    } else {
      console.log('Profile updated for account:', accountId);
    }
  }
}
