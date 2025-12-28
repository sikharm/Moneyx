-- Add customer_id column to license_subscriptions table
ALTER TABLE public.license_subscriptions 
ADD COLUMN customer_id INTEGER DEFAULT 0;