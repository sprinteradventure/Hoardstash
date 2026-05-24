import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/lib/stripe';

/**
 * POST /api/connect/products
 * 
 * Creates a new product on a connected account.
 * Uses the Stripe-Account header to create products on behalf of the seller.
 * 
 * Request body:
 * {
 *   accountId: 'acct_...',     // Connected account ID (required)
 *   name: 'Product Name',       // Product name (required)
 *   description: '...',         // Product description (optional)
 *   price: 1000,               // Price in cents (required)
 *   currency: 'usd',           // Currency (default: usd)
 *   images: ['url1', 'url2']   // Product images (optional)
 * }
 * 
 * The Stripe-Account header is passed via the options object:
 * stripeClient.products.create(data, { stripeAccount: accountId })
 */

export async function POST(req: NextRequest) {
  try {
    const {
      accountId,
      name,
      description,
      price, // Price in cents
      currency = 'usd',
      images,
    } = await req.json();

    // Validate required fields
    if (!accountId) {
      return NextResponse.json(
        { error: 'Connected account ID (accountId) is required' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    if (!price || price <= 0) {
      return NextResponse.json(
        { error: 'Valid price (in cents) is required' },
        { status: 400 }
      );
    }

    /**
     * Create Product with Default Price
     * 
     * This creates both a Product and a Price in one call using default_price_data.
     * 
     * IMPORTANT: Pass { stripeAccount: accountId } to create on the connected account.
     * Without this, the product would be created on YOUR platform account instead.
     */
    const product = await stripeClient.products.create(
      {
        name,
        description,
        // Create a default price with the product
        default_price_data: {
          unit_amount: price, // Price in cents (e.g., 1000 = $10.00)
          currency: currency.toLowerCase(),
        },
        // Optional: Add product images
        images: images || [],
        // Product is active by default
        active: true,
      },
      {
        // This is the Stripe-Account header
        // It tells Stripe which connected account owns this product
        stripeAccount: accountId,
      }
    );

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: price,
        currency: currency,
        priceId: product.default_price,
        images: product.images,
        url: product.url,
      },
      accountId,
    });

  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create product',
        type: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/connect/products?accountId=acct_...
 * 
 * Lists all products for a connected account.
 * Uses the Stripe-Account header to fetch products from the seller's account.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Connected account ID (accountId query param) is required' },
        { status: 400 }
      );
    }

    /**
     * List Products
     * 
     * - limit: Number of products to return (max 100)
     * - active: true = only active products
     * - expand: ['data.default_price'] = include price details
     * 
     * IMPORTANT: Pass { stripeAccount: accountId } to fetch from connected account
     */
    const products = await stripeClient.products.list(
      {
        limit: 20,
        active: true,
        // Expand default_price to get price details in one call
        expand: ['data.default_price'],
      },
      {
        // Fetch from connected account, not platform
        stripeAccount: accountId,
      }
    );

    /**
     * Format products for frontend
     * 
     * The default_price is expanded, so we can access price details
     */
    const formattedProducts = products.data.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.images,
      // Price info from expanded default_price
      price: product.default_price?.unit_amount,
      currency: product.default_price?.currency,
      priceId: product.default_price?.id,
      // URL for product detail page
      url: `/store/${accountId}/product/${product.id}`,
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      hasMore: products.has_more,
      accountId,
    });

  } catch (error: any) {
    console.error('Error listing products:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to list products',
        type: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
}
