-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'expiring_soon', 'expired', 'cancelled');

-- Create user_subscriptions table (one subscription per user enforced via unique user_id)
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    product_key TEXT NOT NULL,
    plan_duration TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status subscription_status NOT NULL DEFAULT 'active',
    amount_paid NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription_notifications table (log of sent notifications)
CREATE TABLE public.subscription_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    sent_via TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_notifications table (in-app notifications)
CREATE TABLE public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    related_subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_subscriptions
-- Users can only view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions"
ON public.user_subscriptions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for subscription_notifications
-- Only admins can view/manage notification logs
CREATE POLICY "Admins can manage subscription notifications"
ON public.subscription_notifications
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for admin_notifications
-- Only admins can view/manage admin notifications
CREATE POLICY "Admins can manage admin notifications"
ON public.admin_notifications
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_trading_updated_at();