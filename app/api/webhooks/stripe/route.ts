import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

// Use Connect webhook secret for marketplace events
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_CONNECT!

// Service role client for database updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`[Stripe Webhook] ${event.type} - ${event.id}`)

  try {
    switch (event.type) {
      // ==================== CONNECT ACCOUNT EVENTS ====================
      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        
        // Find seller by Stripe account ID
        const { data: profile, error: lookupError } = await supabaseAdmin
          .from('profiles')
          .select('id, stripe_account_id')
          .eq('stripe_account_id', account.id)
          .single()

        if (lookupError || !profile) {
          console.error(`[account.updated] No profile found for account ${account.id}`)
          break
        }

        // Update profile with latest Connect status
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            stripe_onboarding_complete: account.details_submitted && account.charges_enabled,
            stripe_requirements_due: (account.requirements?.currently_due?.length || 0) > 0,
            stripe_requirements_status: account.requirements?.disabled_reason || null,
            stripe_card_payments_status: account.capabilities?.card_payments || 'inactive',
          })
          .eq('id', profile.id)

        if (updateError) {
          console.error(`[account.updated] Failed to update profile:`, updateError)
        } else {
          console.log(`[account.updated] Profile ${profile.id} updated. Charges enabled: ${account.charges_enabled}`)
        }
        break
      }

      // ==================== CHECKOUT SESSION EVENTS ====================
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log(`[checkout.session.completed] Session: ${session.id}`)
        console.log(`  - Customer: ${session.customer}`)
        console.log(`  - Payment status: ${session.payment_status}`)
        console.log(`  - Amount: ${session.amount_total} ${session.currency}`)

        // Check if this is a subscription signup
        if (session.subscription) {
          // Update profile subscription status
          const customerId = session.customer as string
          
          // Find profile by customer ID (you may need to store this mapping)
          // For now, log it - implement based on your subscription flow
          console.log(`[checkout.session.completed] Subscription signup: ${session.subscription}`)
          
          // TODO: Update profiles.subscription_status = 'active' based on your subscription price ID
        }

        // If this is a one-time purchase, create order record
        if (session.payment_status === 'paid' && !session.subscription) {
          // TODO: Create order in orders table
          // const { error: orderError } = await supabaseAdmin
          //   .from('orders')
          //   .insert({
          //     stripe_checkout_session_id: session.id,
          //     stripe_payment_intent_id: session.payment_intent,
          //     amount: session.amount_total,
          //     currency: session.currency,
          //     customer_email: session.customer_details?.email,
          //     status: 'paid'
          //   })
          console.log(`[checkout.session.completed] One-time payment received`)
        }
        break
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`[checkout.session.async_payment_succeeded] ${session.id}`)
        // Handle async payment methods (like bank transfers)
        break
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`[checkout.session.async_payment_failed] ${session.id}`)
        // Handle failed async payments
        break
      }

      // ==================== SUBSCRIPTION EVENTS ====================
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[customer.subscription.created] ${subscription.id}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find profile by customer ID and update subscription status
        // You'll need to map Stripe customer IDs to your profiles
        console.log(`[customer.subscription.updated] ${subscription.id} - Status: ${subscription.status}`)
        
        // TODO: Update profile subscription fields
        // const { error } = await supabaseAdmin
        //   .from('profiles')
        //   .update({
        //     subscription_status: subscription.status,
        //     subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        //     subscription_cancel_at_period_end: subscription.cancel_at_period_end
        //   })
        //   .eq('stripe_customer_id', subscription.customer)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[customer.subscription.deleted] ${subscription.id}`)
        
        // TODO: Update profile subscription_status = 'canceled'
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[invoice.payment_succeeded] ${invoice.id}`)
        
        // Recurring payment succeeded
        if (invoice.subscription) {
          // TODO: Update last_payment_date on profile
          console.log(`[invoice.payment_succeeded] Subscription payment: ${invoice.subscription}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[invoice.payment_failed] ${invoice.id}`)
        
        // Handle failed subscription payment
        // Stripe will retry based on your settings
        break
      }

      // ==================== PAYOUT EVENTS ====================
      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer
        console.log(`[transfer.created] ${transfer.id} - Amount: ${transfer.amount}`)
        // Log when a transfer to seller is created
        break
      }

      // Note: transfer.paid removed in newer Stripe API versions
      // Use transfer.created + payout.paid instead

      // ==================== REFUND EVENTS ====================
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        console.log(`[charge.refunded] ${charge.id} - Refunded: ${charge.amount_refunded}`)
        
        // TODO: Update order status to 'refunded' or 'partially_refunded'
        break
      }

      // ==================== DISPUTE EVENTS ====================
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        console.log(`[charge.dispute.created] ${dispute.id} - Reason: ${dispute.reason}`)
        
        // Alert admin about new dispute
        // TODO: Create dispute record, notify admin
        break
      }

      default:
        console.log(`[Unhandled] Event type: ${event.type}`)
    }
  } catch (err: any) {
    console.error(`[Webhook Handler Error] ${event.type}:`, err)
    // Still return 200 to Stripe so they don't retry indefinitely
    // Log the error for investigation
  }

  return NextResponse.json({ received: true })
}
