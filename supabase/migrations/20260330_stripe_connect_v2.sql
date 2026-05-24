-- Stripe Connect V2 Database Migration
-- Run this in Supabase SQL Editor before going live

-- First, add the BASE Stripe Connect columns (if they don't exist)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE;

-- Add Stripe Connect V2 tracking columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_requirements_due BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_requirements_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_card_payments_status TEXT;

-- Add subscription tracking columns (for platform billing)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_price_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_quantity INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE;

-- Clear old test data from previous Stripe account (if any exists)
-- ⚠️  Only run the UPDATE if you have existing data to clear
-- UPDATE profiles 
-- SET stripe_account_id = NULL, 
--     stripe_onboarding_complete = FALSE,
--     stripe_requirements_due = FALSE,
--     stripe_requirements_status = NULL,
--     stripe_card_payments_status = NULL,
--     subscription_status = NULL,
--     subscription_price_id = NULL,
--     subscription_quantity = 1,
--     subscription_cancel_at_period_end = FALSE,
--     subscription_current_period_end = NULL,
--     last_payment_date = NULL;

-- Create index for faster lookups by stripe_account_id
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_account_id ON profiles(stripe_account_id);

-- Verify all columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND (column_name LIKE 'stripe_%' 
       OR column_name LIKE 'subscription%' 
       OR column_name LIKE 'last_%')
ORDER BY column_name;
