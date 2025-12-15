-- Create partners table for partnership page
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  website_url text,
  description text,
  map_embed_url text,
  trustpilot_url text,
  facebook_url text,
  twitter_url text,
  linkedin_url text,
  instagram_url text,
  email text,
  phone text,
  address text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Public can view active partners
CREATE POLICY "Anyone can view active partners"
ON public.partners
FOR SELECT
USING (is_active = true);

-- Admins can manage all partners
CREATE POLICY "Admins can manage partners"
ON public.partners
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trading_updated_at();