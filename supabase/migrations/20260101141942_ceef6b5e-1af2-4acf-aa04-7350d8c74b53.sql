-- Add user_id column to license_subscriptions to link licenses to registered users
ALTER TABLE public.license_subscriptions 
ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_license_subscriptions_user_id ON public.license_subscriptions(user_id);

-- Add RLS policy for users to view their own linked licenses
CREATE POLICY "Users can view their own linked licenses"
ON public.license_subscriptions
FOR SELECT
USING (user_id = auth.uid());