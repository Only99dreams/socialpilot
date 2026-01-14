import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const plans = [
  {
    code: "starter",
    name: "Starter",
    description: "Perfect for small businesses just getting started",
    price: 29,
    features: [
      "1 AI Agent",
      "3 Social Platforms",
      "15 Posts per week",
      "Basic Analytics",
      "Email Support",
      "Review Mode Only",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    code: "pro",
    name: "Pro",
    description: "For growing businesses that need more power",
    price: 79,
    features: [
      "1 AI Agent",
      "All 5 Platforms",
      "Daily Posting",
      "Advanced Analytics",
      "Priority Support",
      "Full Autopilot Mode",
      "Custom Brand Voice",
      "A/B Content Testing",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    code: "agency",
    name: "Agency",
    description: "For agencies managing multiple brands",
    price: 199,
    features: [
      "Unlimited AI Agents",
      "Unlimited Brands",
      "All Pro Features",
      "White-label Reports",
      "Team Collaboration",
      "API Access",
      "Dedicated Success Manager",
      "Custom Integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export const Pricing = () => {
  const [priceByCode, setPriceByCode] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    type SubscriptionPlanRow = {
      code: string;
      price_monthly: number;
      is_active: boolean;
    };

    const run = async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("code, price_monthly, is_active")
        .eq("is_active", true)
        .returns<SubscriptionPlanRow[]>();

      if (cancelled) return;
      if (error) return;

      const map: Record<string, number> = {};
      for (const row of data || []) {
        const code = String(row.code || "").toLowerCase();
        const price = Number(row.price_monthly);
        if (code && Number.isFinite(price)) map[code] = price;
      }
      setPriceByCode(map);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const mergedPlans = useMemo(() => {
    return plans.map((p) => ({
      ...p,
      price: priceByCode[p.code] ?? p.price,
    }));
  }, [priceByCode]);

  return (
    <section id="pricing" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium mb-2 block">Pricing</span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Choose the plan that fits your business. All plans include a 14-day free trial.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {mergedPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl border ${
                plan.popular
                  ? "border-primary bg-gradient-to-b from-primary/10 to-transparent glow"
                  : "border-border card-gradient"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="font-display text-5xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/signup" className="block">
                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
