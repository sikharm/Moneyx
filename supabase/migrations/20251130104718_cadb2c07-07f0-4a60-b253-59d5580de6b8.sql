-- Add new columns to user_mt5_accounts for tracking latest report data
ALTER TABLE user_mt5_accounts 
ADD COLUMN IF NOT EXISTS last_report_date DATE,
ADD COLUMN IF NOT EXISTS last_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_lots_traded NUMERIC DEFAULT 0;

-- Make MetaAPI fields nullable (they were required before)
ALTER TABLE user_mt5_accounts 
ALTER COLUMN mt5_login DROP NOT NULL,
ALTER COLUMN mt5_password DROP NOT NULL,
ALTER COLUMN mt5_server DROP NOT NULL;

-- Create investment_reports table to store parsed report data
CREATE TABLE public.investment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES user_mt5_accounts(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  report_period_start DATE,
  report_period_end DATE,
  balance NUMERIC NOT NULL DEFAULT 0,
  equity NUMERIC NOT NULL DEFAULT 0,
  gross_profit NUMERIC NOT NULL DEFAULT 0,
  gross_loss NUMERIC NOT NULL DEFAULT 0,
  net_profit NUMERIC NOT NULL DEFAULT 0,
  total_lots NUMERIC NOT NULL DEFAULT 0,
  total_trades INTEGER NOT NULL DEFAULT 0,
  profit_factor NUMERIC,
  raw_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, report_date)
);

-- Enable RLS
ALTER TABLE public.investment_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for investment_reports
CREATE POLICY "Users can view their own reports"
ON public.investment_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_mt5_accounts
    WHERE user_mt5_accounts.id = investment_reports.account_id
    AND user_mt5_accounts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own reports"
ON public.investment_reports
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_mt5_accounts
    WHERE user_mt5_accounts.id = account_id
    AND user_mt5_accounts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own reports"
ON public.investment_reports
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_mt5_accounts
    WHERE user_mt5_accounts.id = investment_reports.account_id
    AND user_mt5_accounts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own reports"
ON public.investment_reports
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_mt5_accounts
    WHERE user_mt5_accounts.id = investment_reports.account_id
    AND user_mt5_accounts.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all reports"
ON public.investment_reports
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all reports"
ON public.investment_reports
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));