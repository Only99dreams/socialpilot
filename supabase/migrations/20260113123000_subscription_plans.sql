-- Subscription plan catalog for admin-managed pricing

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Public read access (prices are not sensitive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscription_plans'
      AND policyname = 'Anyone can view subscription plans'
  ) THEN
    CREATE POLICY "Anyone can view subscription plans"
    ON public.subscription_plans
    FOR SELECT
    TO public
    USING (true);
  END IF;
END $$;

-- Admin management
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscription_plans'
      AND policyname = 'Admins can insert subscription plans'
  ) THEN
    CREATE POLICY "Admins can insert subscription plans"
    ON public.subscription_plans
    FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscription_plans'
      AND policyname = 'Admins can update subscription plans'
  ) THEN
    CREATE POLICY "Admins can update subscription plans"
    ON public.subscription_plans
    FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscription_plans'
      AND policyname = 'Admins can delete subscription plans'
  ) THEN
    CREATE POLICY "Admins can delete subscription plans"
    ON public.subscription_plans
    FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Keep updated_at fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_subscription_plans_updated_at'
  ) THEN
    CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Seed default plans if they don't exist
INSERT INTO public.subscription_plans (code, name, price_monthly, currency, is_active, sort_order)
VALUES
  ('starter', 'Starter', 29, 'USD', true, 1),
  ('pro', 'Pro', 79, 'USD', true, 2),
  ('agency', 'Agency', 199, 'USD', true, 3)
ON CONFLICT (code) DO NOTHING;
