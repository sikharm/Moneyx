-- Add trading_system and account_size columns to license_subscriptions
ALTER TABLE license_subscriptions 
ADD COLUMN trading_system text,
ADD COLUMN account_size numeric DEFAULT 0;