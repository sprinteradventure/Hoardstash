import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

/**
 * Webhook Secret for Subscription events
 * Get it from: https://dashboard.stripe.com/webhooks
 */
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_SUBSCRIPTION || process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST /api/webhooks/subscriptions
 * 
 * Handles subscription-related webhook events.
 * 
 * Events handled:
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.paid
 * - invoice.payment_failed
 * 
 * Configure in Stripe Dashboard: https://dashboard.stripe.com/webhooks
 */

// Initialize Supabase for updating subscription status
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
      console.error('STRIPE_WEBHOOK_SECRET_SUBSCRIPTION not configured');
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

    console.log('Received subscription event:', {
      id: event.id,
      type: event.type,
    });

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(event.data.object);
        break;
      }

      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object);
        break;
      }

      case 'invoice.paid': {
        await handleInvoicePaid(event.data.object);
        break;
      }

      case 'invoice.payment_failed': {
        await handleInvoicePaymentFailed(event.data.object);
        break;
      }

      default: {
        console.log('Unhandled event type:', event.type);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Subscription webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle Subscription Updated
 */
async function handleSubscriptionUpdated(subscription: any) {
  const customerId = subscription.customer;
  
  if (!customerId) {
    console.error('No customer in subscription');
    return;
  }

  // Check for upgrade/downgrade
  const currentPrice = subscription.items.data[0]?.price?.id;
  const previousPrice = subscription.previous_attributes?.items?.data[0]?.price?.id;
  
  if (currentPrice && previousPrice && currentPrice !== previousPrice) {
    console.log(`Subscription upgraded/downgraded for customer ${customerId}`);
  }

  // Check for cancellation
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;
  
  if (cancelAtPeriodEnd) {
    console.log(`Subscription scheduled for cancellation: ${customerId}`);
  }

  // Update database - lookup by stripe_customer_id if you have it
  // For now, logging only since we use account-based lookup elsewhere
  console.log('Subscription status:', subscription.status);
}

/**
 * Handle Subscription Deleted
 */
async function handleSubscriptionDeleted(subscription: any) {
  const customerId = subscription.customer;
  
  if (!customerId) {
    console.error('No customer in subscription');
    return;
  }

  console.log(`Subscription ended for customer: ${customerId}`);
}

/**
 * Handle Invoice Paid
 */
async function handleInvoicePaid(invoice: any) {
  const customerId = invoice.customer;
  
  if (!customerId) {
    console.error('No customer in invoice');
    return;
  }

  console.log(`Invoice paid for customer: ${customerId}, Amount: ${invoice.amount_paid}`);
}

/**
 * Handle Invoice Payment Failed
 */
async function handleInvoicePaymentFailed(invoice: any) {
  const customerId = invoice.customer;
  
  if (!customerId) {
    console.error('No customer in invoice');
    return;
  }

  console.log(`Invoice payment failed for customer: ${customerId}`);
}
