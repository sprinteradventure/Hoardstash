# HoardStash Stripe Production Checklist

## 🔴 Critical - Blockers for Launch

### 1. Stripe Dashboard Setup (Do This First)
- [ ] Go to https://dashboard.stripe.com/settings/applications
- [ ] Click **"Get Started"** under Connect
- [ ] Choose **"Standard"** accounts
- [ ] Complete business verification (may take 1-2 business days)

### 2. Webhook Configuration
Create two webhook endpoints in Stripe Dashboard:

**Endpoint 1 - Connect Events:**
```
URL: https://www.hoardstash.com/api/webhooks/stripe-connect
Events to listen to:
  - v2.core.account[requirements].updated
  - v2.core.account[configuration.merchant].capability_status_updated
Payload: Thin (V2)
```

**Endpoint 2 - Subscriptions:**
```
URL: https://www.hoardstash.com/api/webhooks/subscriptions
Events to listen to:
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.paid
  - invoice.payment_failed
Payload: Snapshot (standard)
```

After creating, add the signing secret to `.env.local`:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Database Migration
Run this in Supabase SQL Editor:
```sql
-- Add Stripe Connect V2 columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_requirements_due BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_requirements_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_card_payments_status TEXT;

-- Add subscription columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_price_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_quantity INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE;

-- Clear old test data
UPDATE profiles 
SET stripe_account_id = NULL, 
    stripe_onboarding_complete = FALSE,
    stripe_requirements_due = FALSE,
    stripe_card_payments_status = NULL;
```

### 4. Environment Variables
Add to `.env.local`:
```
STRIPE_WEBHOOK_SECRET=whsec_...      # From Stripe Dashboard webhooks
```

## 🟡 Important - Before First Seller

### 5. Test Account ID
The seller dashboard currently uses a hardcoded test account:
```typescript
// app/seller/connect/page.tsx
const TEST_ACCOUNT_ID = 'acct_1TGUdbD6UGHzRgsk';
```

**Before production:** Replace with real user lookup from database.

### 6. Application Fee Rate
Currently set to 5% in multiple places:
- `app/api/connect/checkout/route.ts` - default value
- `app/store/[accountId]/StorefrontClient.tsx` - hardcoded

**Verify this is your desired rate.**

### 7. Order Success Page
Create `/app/order/success/page.tsx` to handle post-purchase:
```typescript
// Minimal implementation
export default function OrderSuccessPage({ searchParams }: { searchParams: { session_id?: string } }) {
  const sessionId = searchParams.session_id;
  // Verify payment with Stripe, show confirmation
  return <div>Thank you for your order!</div>;
}
```

## 🟢 Nice to Have

### 8. Connect Branding
In Stripe Dashboard:
- https://dashboard.stripe.com/settings/branding
- Set business name: HoardStash
- Set statement descriptor: HOARDSTASH
- Upload logo (appears during onboarding)

### 9. Support Email
In Stripe Dashboard:
- https://dashboard.stripe.com/settings/account
- Set support email (shown to sellers during onboarding)

### 10. Payout Schedule
In Stripe Dashboard:
- https://dashboard.stripe.com/settings/payouts
- Configure how often sellers receive payouts (default: automatic daily)

## 🧪 Testing Checklist

Before going live, test this flow:

1. **Seller Onboarding:**
   - Create a new user
   - Go to `/seller/connect`
   - Complete Stripe onboarding
   - Verify account status shows "Active"

2. **Product Creation:**
   - Create a product in seller dashboard
   - Verify it appears in product list
   - Check Stripe Dashboard → Connected Accounts → Products

3. **Purchase Flow:**
   - Visit `/store/{accountId}` as a buyer
   - Click "Buy Now"
   - Complete Stripe Checkout with test card: `4242 4242 4242 4242`
   - Verify:
     - Order appears in orders table
     - Application fee (5%) appears in your Stripe Dashboard
     - Seller receives correct amount minus fees

4. **Webhooks:**
   - Check webhook delivery logs in Stripe Dashboard
   - Verify database updates when requirements change

## 🚨 Known Issues

1. **Test Account Hardcoded:** The seller dashboard uses `acct_1TGUdbD6UGHzRgsk` for demo. Must implement real user lookup.

2. **No Cart System:** Currently single-item checkout only. Need cart for multiple items.

3. **Product Images:** Products API accepts images array but storefront shows placeholder.

4. **Shipping:** Checkout collects shipping address but doesn't calculate shipping costs.

## 📚 Files Created/Modified

### New API Routes:
- `app/api/connect/create-account/route.ts`
- `app/api/connect/account-status/route.ts`
- `app/api/connect/onboarding-link/route.ts`
- `app/api/connect/products/route.ts`
- `app/api/connect/checkout/route.ts`
- `app/api/connect/subscription/route.ts`
- `app/api/connect/billing-portal/route.ts`
- `app/api/webhooks/stripe-connect/route.ts`
- `app/api/webhooks/subscriptions/route.ts`

### New Frontend:
- `app/seller/connect/page.tsx`
- `app/store/[accountId]/page.tsx`
- `app/store/[accountId]/StorefrontClient.tsx`

### Modified:
- `lib/stripe.ts`
- `app/api/connect/checkout/route.ts` (added subtotal param)
- `app/store/[accountId]/StorefrontClient.tsx` (added subtotal)

---

*Last updated: March 30, 2026*
