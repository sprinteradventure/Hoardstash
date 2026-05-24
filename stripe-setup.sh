#!/bin/bash
# Stripe Production Setup Script
# Run this after enabling Connect in the dashboard to automate webhook creation

set -e

echo "=========================================="
echo "HoardStash Stripe Production Setup"
echo "=========================================="
echo ""

# Check for required environment variables
if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "❌ ERROR: STRIPE_SECRET_KEY not set"
  echo "Export your Stripe secret key first:"
  echo "  export STRIPE_SECRET_KEY=sk_live_..."
  exit 1
fi

if [ -z "$NEXT_PUBLIC_URL" ]; then
  echo "⚠️  WARNING: NEXT_PUBLIC_URL not set, using https://www.hoardstash.com"
  export NEXT_PUBLIC_URL="https://www.hoardstash.com"
fi

echo "✓ STRIPE_SECRET_KEY is set"
echo "✓ Website URL: $NEXT_PUBLIC_URL"
echo ""

# =============================================================================
# CREATE WEBHOOK ENDPOINTS
# =============================================================================

echo "Creating webhook endpoints..."
echo ""

# Create V2 Connect webhook endpoint
echo "→ Creating Connect V2 webhook..."
CONNECT_WEBHOOK=$(curl -s -X POST https://api.stripe.com/v1/webhook_endpoints \
  -u "$STRIPE_SECRET_KEY:" \
  -d "url=${NEXT_PUBLIC_URL}/api/webhooks/stripe-connect" \
  -d "api_version=2025-02-24.acacia" \
  -d "enabled_events[0]=v2.core.account[requirements].updated" \
  -d "enabled_events[1]=v2.core.account[configuration.merchant].capability_status_updated" \
  -d "description=HoardStash Connect V2 Events")

CONNECT_WEBHOOK_ID=$(echo $CONNECT_WEBHOOK | grep -o '"id": "we_[^"]*' | cut -d'"' -f4)
CONNECT_SECRET=$(echo $CONNECT_WEBHOOK | grep -o '"secret": "whsec_[^"]*' | cut -d'"' -f4)

if [ -n "$CONNECT_WEBHOOK_ID" ]; then
  echo "✓ Connect webhook created: $CONNECT_WEBHOOK_ID"
  echo "  Secret: $CONNECT_SECRET"
else
  echo "❌ Failed to create Connect webhook"
  echo "Response: $CONNECT_WEBHOOK"
fi

echo ""

# Create Subscription webhook endpoint
echo "→ Creating Subscription webhook..."
SUB_WEBHOOK=$(curl -s -X POST https://api.stripe.com/v1/webhook_endpoints \
  -u "$STRIPE_SECRET_KEY:" \
  -d "url=${NEXT_PUBLIC_URL}/api/webhooks/subscriptions" \
  -d "api_version=2025-02-24.acacia" \
  -d "enabled_events[0]=customer.subscription.updated" \
  -d "enabled_events[1]=customer.subscription.deleted" \
  -d "enabled_events[2]=invoice.paid" \
  -d "enabled_events[3]=invoice.payment_failed" \
  -d "description=HoardStash Subscription Events")

SUB_WEBHOOK_ID=$(echo $SUB_WEBHOOK | grep -o '"id": "we_[^"]*' | cut -d'"' -f4)
SUB_SECRET=$(echo $SUB_WEBHOOK | grep -o '"secret": "whsec_[^"]*' | cut -d'"' -f4)

if [ -n "$SUB_WEBHOOK_ID" ]; then
  echo "✓ Subscription webhook created: $SUB_WEBHOOK_ID"
  echo "  Secret: $SUB_SECRET"
else
  echo "❌ Failed to create Subscription webhook"
  echo "Response: $SUB_WEBHOOK"
fi

echo ""

# =============================================================================
# OUTPUT RESULTS
# =============================================================================

echo "=========================================="
echo "Setup Complete! Add these to .env.local:"
echo "=========================================="
echo ""

if [ -n "$CONNECT_SECRET" ] && [ -n "$SUB_SECRET" ]; then
  # If both webhooks created, note that you need separate secrets or use one
  echo "# Webhook Secrets (you may need to handle multiple webhooks in code)"
  echo "STRIPE_WEBHOOK_SECRET_CONNECT=$CONNECT_SECRET"
  echo "STRIPE_WEBHOOK_SECRET_SUBSCRIPTION=$SUB_SECRET"
  echo ""
  echo "⚠️  NOTE: You have two webhook endpoints. Update your webhook handlers"
  echo "   to check the endpoint secret based on the event type, or combine them."
else
  echo "STRIPE_WEBHOOK_SECRET=$CONNECT_SECRET"
fi

echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo "1. Copy the webhook secrets above to .env.local"
echo "2. Run database migration (see STRIPE_CHECKLIST.md)"
echo "3. Test with: ./stripe-test-blueprint.sh"
echo "4. Deploy: vercel --prod"
echo ""
echo "=========================================="
echo "Stripe Dashboard Links:"
echo "=========================================="
echo "Webhooks:     https://dashboard.stripe.com/webhooks"
echo "Connect:      https://dashboard.stripe.com/settings/applications"
echo "API Keys:     https://dashboard.stripe.com/apikeys"
echo ""
