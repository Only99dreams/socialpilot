-- Admin: subscriptions + app settings + admin business access

-- Subscriptions table (managed by admins, visible to business owners)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'business', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Business owners can view their own subscription
CREATE POLICY IF NOT EXISTS "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE user_id = auth.uid()
  )
);

-- Admins can view all subscriptions
CREATE POLICY IF NOT EXISTS "Admins can view all subscriptions"
ON public.subscriptions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage subscriptions
CREATE POLICY IF NOT EXISTS "Admins can insert subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Admins can update subscriptions"
ON public.subscriptions
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Admins can delete subscriptions"
ON public.subscriptions
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Keep updated_at fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER update_subscriptions_updated_at
      BEFORE UPDATE ON public.subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- App settings table (admin-managed)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can view app settings"
ON public.app_settings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Admins can insert app settings"
ON public.app_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Admins can update app settings"
ON public.app_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Admins can delete app settings"
ON public.app_settings
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_app_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_app_settings_updated_at
      BEFORE UPDATE ON public.app_settings
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Allow admins to view and manage all businesses (RLS override via role)
CREATE POLICY IF NOT EXISTS "Admins can view all businesses"
ON public.businesses
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Admins can update all businesses"
ON public.businesses
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Admins can delete all businesses"
ON public.businesses
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
