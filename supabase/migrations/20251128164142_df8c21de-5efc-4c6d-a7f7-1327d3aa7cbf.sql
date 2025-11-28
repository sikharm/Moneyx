-- Create trading_accounts table
CREATE TABLE public.trading_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  initial_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trades table
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  trade_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trader_preferences table
CREATE TABLE public.trader_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT NOT NULL DEFAULT 'dark',
  display_mode TEXT NOT NULL DEFAULT 'currency',
  default_currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trader_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for trading_accounts (admin only)
CREATE POLICY "Admins can manage trading accounts"
ON public.trading_accounts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for trades (admin only)
CREATE POLICY "Admins can manage trades"
ON public.trades
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.trading_accounts ta
    WHERE ta.id = trades.account_id
    AND public.has_role(auth.uid(), 'admin')
  )
);

-- RLS policies for trader_preferences (admin only)
CREATE POLICY "Admins can manage trader preferences"
ON public.trader_preferences
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_trading_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_trading_accounts_updated_at
BEFORE UPDATE ON public.trading_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_trading_updated_at();

CREATE TRIGGER update_trader_preferences_updated_at
BEFORE UPDATE ON public.trader_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_trading_updated_at();