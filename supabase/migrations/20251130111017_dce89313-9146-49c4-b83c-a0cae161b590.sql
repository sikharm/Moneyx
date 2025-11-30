-- Enable realtime for user_mt5_accounts table
ALTER TABLE public.user_mt5_accounts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_mt5_accounts;