-- Add onboarding_completed column to profiles table to track tutorial completion
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;