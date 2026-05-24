# Stripe Blueprint Commands

Quick reference for Stripe CLI and API commands to test your HoardStash marketplace.

## 📦 Files in this folder

| File | Purpose |
|------|---------|
| `stripe-setup.sh` | **Production setup** - Creates webhook endpoints automatically |
| `stripe-test-blueprint.sh` | **Local testing** - Step-by-step curl commands to test every API |

---

## 🚀 Quick Start (Production)

### 1. Enable Connect in Dashboard (Manual)
Must be done in browser:
```
https://dashboard.stripe.com/settings/applications
```
Click "Get Started" → Choose "Standard" → Complete verification

### 2. Auto-Create Webhooks
```bash
export STRIPE_SECRET_KEY=sk_live_...
export NEXT_PUBLIC_URL=https://www.hoardstash.com
./stripe-setup.sh
```

This creates webhook endpoints and outputs the secrets to add to `.env.local`.

### 3. Run Database Migration
```bash
# In Supabase SQL Editor
\i supabase/migrations/stripe_connect_v2.sql
```

Or run the SQL from `STRIPE_CHECKLIST.md`.

### 4. Deploy
```bash
vercel --prod
```

---

## 🧪 Local Testing with Stripe CLI

### Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Login
stripe login
```

### Forward Webhooks Locally
```bash
# Terminal 1: Connect V2 webhooks
stripe listen \
  --events v2.core.account[requirements].updated,v2.core.account[configuration.merchant].capability_status_updated \
  --forward-to localhost:3000/api/webhooks/stripe-connect

# Terminal 2: Subscription webhooks  
stripe listen \
  --events customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed \
  --forward-to localhost:3000/api/webhooks/subscriptions
```

### Test Individual APIs

#### Create Connected Account
```bash
curl -X POST http://localhost:3000/api/connect/create-account \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "email": "seller@example.com",
    "businessName": "Test Store"
  }'
```

#### Check Account Status
```bash
curl "http://localhost:3000/api/connect/account-status?accountId=acct_..."
```

#### Create Onboarding Link
```bash
curl -X POST http://localhost:3000/api/connect/onboarding-link \
  -H "Content-Type: application/json" \
  -d '{"accountId": "acct_..."}'
```

#### Create Product
```bash
curl -X POST http://localhost:3000/api/connect/products \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "acct_...",
    "name": "Ceramic Mug",
    "price": 2500,
    "currency": "usd"
  }'
```

#### Create Checkout
```bash
curl -X POST http://localhost:3000/api/connect/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "acct_...",
    "items": [{"priceId": "price_...", "quantity": 1}],
    "subtotal": 2500,
    "applicationFeePercent": 5
  }'
```

---

## 💳 Test Cards

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0025 0000 3155` | Requires 3D Secure |

Use any future expiry date (MM/YY) and any 3-digit CVC.

---

## 🔗 Important URLs

| Purpose | URL |
|---------|-----|
| Stripe Dashboard | https://dashboard.stripe.com |
| API Keys | https://dashboard.stripe.com/apikeys |
| Webhooks | https://dashboard.stripe.com/webhooks |
| Connect Settings | https://dashboard.stripe.com/settings/applications |
| Connect Accounts | https://dashboard.stripe.com/connect/accounts |
| Branding | https://dashboard.stripe.com/settings/branding |

---

## 🐛 Troubleshooting

### "No signatures found matching the expected signature for payload"
Your `STRIPE_WEBHOOK_SECRET` doesn't match. Get the correct secret from:
- Stripe Dashboard → Developers → Webhooks → Click your endpoint → Signing secret

### "Account does not have card_payments capability"
The connected account hasn't completed onboarding. Check:
- Account status endpoint: `canProcessPayments` should be `true`
- Seller needs to complete onboarding at the Connect link

### "No such price"
The price ID doesn't exist on that connected account. Products/prices are **account-specific** — a price created on your platform account won't work on a connected account.

### Application fee not collected
Make sure you're passing `{ stripeAccount: accountId }` as the second argument to `stripeClient.checkout.sessions.create()`. Without this, the checkout is created on your platform account, not the connected account.

---

*Run `./stripe-test-blueprint.sh` for the full interactive testing flow.*
