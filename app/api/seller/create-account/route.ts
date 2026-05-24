import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    // Get the current user from the request (you may need to implement session validation)
    // For now, we'll accept a userId in the request body
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user email from Supabase
    const { data: userData, error: userError } = await getSupabaseAdmin()
      .auth.admin.getUserById(userId);

    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const email = userData.user.email;

    // Create a Standard connected account
    const account = await stripeClient.accounts.create({
      type: 'standard',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Save the stripe_account_id to the user's profile
    const { error: updateError } = await getSupabaseAdmin()
      .from('profiles')
      .upsert({
        id: userId,
        stripe_account_id: account.id,
        stripe_onboarding_complete: false,
      } as any);

    if (updateError) {
      console.error('Error saving stripe account:', updateError);
    }

    // Create an account link for onboarding
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hoardstash.com';
    const accountLink = await stripeClient.accountLinks.create({
      account: account.id,
      refresh_url: `${baseUrl}/seller/dashboard?refresh=true`,
      return_url: `${baseUrl}/seller/dashboard?onboarding=complete`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      accountId: account.id,
      url: accountLink.url,
    });
  } catch (error: any) {
    console.error('Error creating connected account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}
