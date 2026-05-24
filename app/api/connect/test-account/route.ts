import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/connect/test-account
 * 
 * Returns the test connected account ID for demonstration purposes.
 * In production, you would look up the user's account from your database.
 */

// TODO: Replace this with a real database lookup
// This is the test account you provided earlier
const TEST_ACCOUNT_ID = 'acct_1TGUdbD6UGHzRgsk';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    testAccountId: TEST_ACCOUNT_ID,
    message: 'This is a test account for demonstration purposes.',
    note: 'In production, look up the account ID from your database based on the logged-in user.',
  });
}
