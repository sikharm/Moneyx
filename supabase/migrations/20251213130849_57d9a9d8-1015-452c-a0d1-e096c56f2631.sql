-- Fix 1: Contact Form Input Validation - Add CHECK constraints
ALTER TABLE public.contact_messages 
ADD CONSTRAINT contact_name_length CHECK (length(name) <= 100),
ADD CONSTRAINT contact_subject_length CHECK (length(subject) <= 200),
ADD CONSTRAINT contact_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT contact_email_length CHECK (length(email) <= 255),
ADD CONSTRAINT contact_message_length CHECK (length(message) <= 5000);

-- Fix 2: Secure increment_download_count function with validation
CREATE OR REPLACE FUNCTION public.increment_download_count(file_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only increment if file exists and is accessible to the user
  UPDATE public.files
  SET download_count = download_count + 1
  WHERE id = file_id
  AND (is_public = true OR uploaded_by = auth.uid() OR EXISTS(
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));
END;
$$;

-- Fix 3: Explicit anonymous denial for profiles table
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Fix 4: Explicit denial for non-admin users on contact_messages
-- The existing policy uses has_role check, adding explicit anon denial
CREATE POLICY "Deny anonymous access to contact messages"
ON public.contact_messages
FOR SELECT
TO anon
USING (false);

-- Fix 5: Site settings whitelist approach
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Mark existing contact-related settings as public
UPDATE public.site_settings SET is_public = true 
WHERE setting_key IN ('contact_email', 'contact_phone', 'contact_address', 'facebook_url', 'office_hours', 'whatsapp_number');

-- Drop old policy and create new one that respects is_public flag
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;

CREATE POLICY "Anyone can view public site settings"
ON public.site_settings 
FOR SELECT
USING (is_public = true OR has_role(auth.uid(), 'admin'::app_role));