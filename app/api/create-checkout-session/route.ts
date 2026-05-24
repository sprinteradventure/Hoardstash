import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { items, shipping, sellerStripeAccountId } = await req.json();

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    // Calculate total for application fee (5% of item price, not shipping)
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const applicationFeeAmount = Math.round(subtotal * 100 * 0.05); // 5% fee

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'https://www.hoardstash.com/order/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://www.hoardstash.com/cart',
      // Marketplace settings
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: sellerStripeAccountId,
        },
      },
    }, {
      stripeAccount: sellerStripeAccountId, // Required for Connect
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
