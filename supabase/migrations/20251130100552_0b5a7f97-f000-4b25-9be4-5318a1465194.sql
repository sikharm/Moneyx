-- Create user_mt5_accounts table
CREATE TABLE public.user_mt5_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nickname TEXT NOT NULL,
  mt5_login TEXT NOT NULL,
  mt5_server TEXT NOT NULL,
  mt5_password TEXT NOT NULL,
  metaapi_account_id TEXT,
  initial_investment NUMERIC NOT NULL DEFAULT 0,
  rebate_rate_per_lot NUMERIC NOT NULL DEFAULT 0,
  is_cent_account BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_account_earnings table
CREATE TABLE public.user_account_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.user_mt5_accounts(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL DEFAULT 'weekly',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  equity NUMERIC NOT NULL DEFAULT 0,
  profit_loss NUMERIC NOT NULL DEFAULT 0,
  lots_traded NUMERIC NOT NULL DEFAULT 0,
  rebate NUMERIC NOT NULL DEFAULT 0,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_mt5_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_account_earnings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_mt5_accounts
CREATE POLICY "Users can view their own MT5 accounts"
ON public.user_mt5_accounts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own MT5 accounts"
ON public.user_mt5_accounts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MT5 accounts"
ON public.user_mt5_accounts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MT5 accounts"
ON public.user_mt5_accounts
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all MT5 accounts"
ON public.user_mt5_accounts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all MT5 accounts"
ON public.user_mt5_accounts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for user_account_earnings
CREATE POLICY "Users can view their own earnings"
ON public.user_account_earnings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_mt5_accounts
    WHERE id = user_account_earnings.account_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own earnings"
ON public.user_account_earnings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_mt5_accounts
    WHERE id = user_account_earnings.account_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all earnings"
ON public.user_account_earnings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all earnings"
ON public.user_account_earnings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_user_mt5_accounts_updated_at
BEFORE UPDATE ON public.user_mt5_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_trading_updated_at();

-- Create unique constraint to prevent duplicate earnings for same account/period
CREATE UNIQUE INDEX idx_user_account_earnings_unique 
ON public.user_account_earnings(account_id, period_type, period_start, period_end);