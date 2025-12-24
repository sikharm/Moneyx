-- Create license_subscriptions table to match Google Sheet structure
CREATE TABLE public.license_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL UNIQUE,  -- MT5 Account ID (e.g., "96695168")
  license_type TEXT NOT NULL DEFAULT 'full',  -- "full" or "demo"
  expire_date DATE,
  broker TEXT,
  user_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.license_subscriptions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage licenses
CREATE POLICY "Admins can manage all licenses"
ON public.license_subscriptions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_license_subscriptions_updated_at
  BEFORE UPDATE ON public.license_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trading_updated_at();