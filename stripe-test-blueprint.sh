#!/bin/bash
# Stripe Integration Test Blueprint for HoardStash
# Run these commands to test your Stripe Connect V2 integration

# =============================================================================
# STEP 0: Install Stripe CLI (if not already installed)
# =============================================================================
# macOS: brew install stripe/stripe-cli/stripe
# Windows: choco install stripe-cli
# Linux: see https://docs.stripe.com/stripe-cli

# Login to Stripe CLI
stripe login

# =============================================================================
# STEP 1: Forward Webhooks Locally (Run this in a separate terminal)
# =============================================================================
echo "=== Starting webhook forwarding... ==="
echo "Keep this running in a separate terminal window"
echo ""

# Forward V2 Connect webhooks to your local dev server
stripe listen \
  --events v2.core.account[requirements].updated,v2.core.account[configuration.merchant].capability_status_updated \
  --forward-to localhost:3000/api/webhooks/stripe-connect

# In ANOTHER terminal, forward subscription webhooks:
# stripe listen \
#   --events customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed \
#   --forward-to localhost:3000/api/webhooks/subscriptions

# =============================================================================
# STEP 2: Test Account Creation (after webhook forwarding is running)
# =============================================================================
echo "=== Testing Account Creation ==="

# Replace with your actual test user ID and email
TEST_USER_ID="00000000-0000-0000-0000-000000000000"
TEST_EMAIL="test@example.com"

# Create a connected account
curl -X POST http://localhost:3000/api/connect/create-account \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$TEST_USER_ID\",
    \"email\": \"$TEST_EMAIL\",
    \"businessName\": \"Test Craft Store\"
  }"

# Expected response: {"success": true, "accountId": "acct_..."}
# Save the accountId from the response

# =============================================================================
# STEP 3: Check Account Status
# =============================================================================
echo "=== Checking Account Status ==="

# Replace with the accountId from Step 2
ACCOUNT_ID="acct_REPLACE_WITH_ACTUAL_ID"

curl "http://localhost:3000/api/connect/account-status?accountId=$ACCOUNT_ID"

# Expected: onboardingComplete: false, canProcessPayments: false

# =============================================================================
# STEP 4: Generate Onboarding Link
# =============================================================================
echo "=== Generating Onboarding Link ==="

curl -X POST http://localhost:3000/api/connect/onboarding-link \
  -H "Content-Type: application/json" \
  -d "{
    \"accountId\": \"$ACCOUNT_ID\"
  }"

# Expected: {"success": true, "url": "https://connect.stripe.com/..."}
# Open the URL in browser and complete onboarding with test data

# =============================================================================
# STEP 5: Create a Product
# =============================================================================
echo "=== Creating Product ==="

# This will fail until onboarding is complete
curl -X POST http://localhost:3000/api/connect/products \
  -H "Content-Type: application/json" \
  -d "{
    \"accountId\": \"$ACCOUNT_ID\",
    \"name\": \"Handmade Ceramic Mug\",
    \"description\": \"Beautiful handcrafted mug\",
    \"price\": 2500,
    \"currency\": \"usd\"
  }"

# Expected: {"success": true, "product": {"id": "prod_...", "priceId": "price_..."}}

# =============================================================================
# STEP 6: List Products
# =============================================================================
echo "=== Listing Products ==="

curl "http://localhost:3000/api/connect/products?accountId=$ACCOUNT_ID"

# =============================================================================
# STEP 7: Create Checkout Session
# =============================================================================
echo "=== Creating Checkout Session ==="

# Replace with actual priceId from Step 5
PRICE_ID="price_REPLACE_WITH_ACTUAL_ID"

curl -X POST http://localhost:3000/api/connect/checkout \
  -H "Content-Type: application/json" \
  -d "{
    \"accountId\": \"$ACCOUNT_ID\",
    \"items\": [{\"priceId\": \"$PRICE_ID\", \"quantity\": 1}],
    \"subtotal\": 2500,
    \"applicationFeePercent\": 5,
    \"successUrl\": \"http://localhost:3000/order/success\",
    \"cancelUrl\": \"http://localhost:3000/store/$ACCOUNT_ID\"
  }"

# Expected: {"success": true, "url": "https://checkout.stripe.com/..."}
# Open the URL and complete payment with test card: 4242 4242 4242 4242

# =============================================================================
# STEP 8: Verify in Stripe Dashboard
# =============================================================================
echo "=== Verification Checklist ==="
echo "1. Go to https://dashboard.stripe.com/connect/accounts"
echo "2. Verify your connected account appears"
echo "3. Check that application fee (5% = \$1.25 on \$25 purchase) appears in your balance"
echo "4. Verify the seller received the remainder (minus Stripe fees)"

# =============================================================================
# TEST CARDS
# =============================================================================
echo "=== Test Cards ==="
echo "Success:           4242 4242 4242 4242"
echo "Decline:           4000 0000 0000 0002"
echo "Require 3D Secure: 4000 0025 0000 3155"
echo ""
echo "Use any future expiry date and any 3-digit CVC"
