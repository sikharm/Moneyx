-- Remove the unique constraint on account_id since the same account can have multiple licenses
ALTER TABLE license_subscriptions DROP CONSTRAINT IF EXISTS license_subscriptions_account_id_key;