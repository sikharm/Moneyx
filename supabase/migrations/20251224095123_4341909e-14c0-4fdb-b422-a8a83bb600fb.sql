-- Add VPS expire date column to license_subscriptions table
ALTER TABLE public.license_subscriptions
ADD COLUMN vps_expire_date date NULL;