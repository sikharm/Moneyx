-- Create site_settings table for non-translated content
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view settings
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Admins can manage settings
CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
  ('contact_email', 'support@xaubot.com'),
  ('contact_phone', '+856 20 1234 5678'),
  ('contact_address', 'Vientiane, Laos'),
  ('facebook_url', 'https://www.facebook.com/profile.php?id=61576225498893'),
  ('office_hours', 'Monday - Friday: 9:00 AM - 6:00 PM');