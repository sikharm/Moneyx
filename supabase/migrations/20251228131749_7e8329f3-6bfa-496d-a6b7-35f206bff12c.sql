-- Create trading_systems table for dynamic trading system management
CREATE TABLE public.trading_systems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trading_systems ENABLE ROW LEVEL SECURITY;

-- Create policies - admins can manage, everyone can view active systems
CREATE POLICY "Admins can manage trading systems" 
ON public.trading_systems 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active trading systems" 
ON public.trading_systems 
FOR SELECT 
USING (is_active = true);

-- Insert default trading systems
INSERT INTO public.trading_systems (value, label, display_order) VALUES
  ('moneyx_m1', 'MoneyX M1', 1),
  ('moneyx_m2', 'MoneyX M2 (MaxProfit)', 2),
  ('moneyx_c_m3', 'MoneyX C-M3 (Correlation)', 3),
  ('moneyx_n_m4', 'MoneyX N-M4 (Non-stop)', 4),
  ('moneyx_g1', 'MoneyX G1', 5);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trading_systems_updated_at
BEFORE UPDATE ON public.trading_systems
FOR EACH ROW
EXECUTE FUNCTION public.update_trading_updated_at();