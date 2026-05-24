import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/connect/create-account
 * 
 * Creates a new Stripe Connect Standard account for a seller.
 * Uses V1 API (V2 accounts API not yet available in Node SDK v17.7.0).
 * 
 * Required environment variables:
 * - STRIPE_SECRET_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 * - NEXT_PUBLIC_SUPABASE_URL
 */

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(req: NextRequest) {
  try {
    // Get user info from request body
    const { userId, email, businessName } = await req.json();

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get user from Supabase to verify they exist
    const { data: userData, error: userError } = await supabaseAdmin
      .auth.admin.getUserById(userId);

    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    /**
     * Create a Standard Connected Account (V1 API)
     * 
     * Standard accounts are the simplest for sellers:
     * - Seller gets full Stripe Dashboard access
     * - They handle their own tax obligations
     * - Stripe handles compliance
     */
    const account = await stripeClient.accounts.create({
      type: 'standard',
      email: email,
      business_profile: {
        name: businessName || userData.user.email?.split('@')[0] || 'HoardStash Seller',
      },
      // Request card payments capability
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    /**
     * Store the account mapping in database
     */
    const { error: dbError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        stripe_account_id: account.id,
        stripe_onboarding_complete: false,
        updated_at: new Date().toISOString(),
      } as any);

    if (dbError) {
      console.error('Database error saving account:', dbError);
    }

    return NextResponse.json({
      success: true,
      accountId: account.id,
      message: 'Account created successfully',
    });

  } catch (error: any) {
    console.error('Error creating connected account:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create account',
        details: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
}
