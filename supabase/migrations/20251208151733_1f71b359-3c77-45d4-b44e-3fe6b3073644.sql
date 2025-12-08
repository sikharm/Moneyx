-- Create table to track user terms acceptance
CREATE TABLE public.user_terms_acceptance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  accepted_at timestamptz DEFAULT now() NOT NULL,
  terms_version text DEFAULT '1.0' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_terms_acceptance ENABLE ROW LEVEL SECURITY;

-- Users can view their own acceptance record
CREATE POLICY "Users can view their own acceptance"
ON public.user_terms_acceptance
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own acceptance record
CREATE POLICY "Users can insert their own acceptance"
ON public.user_terms_acceptance
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all acceptance records
CREATE POLICY "Admins can view all acceptance"
ON public.user_terms_acceptance
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));