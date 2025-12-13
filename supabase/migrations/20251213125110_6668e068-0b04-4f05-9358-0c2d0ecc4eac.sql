-- Remove MT5 password column from user_mt5_accounts table
ALTER TABLE public.user_mt5_accounts DROP COLUMN IF EXISTS mt5_password;