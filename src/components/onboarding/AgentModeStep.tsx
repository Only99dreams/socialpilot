import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Rocket, Eye, Zap } from "lucide-react";
import type { OnboardingData } from "@/pages/Onboarding";

const modes = [
  {
    id: "autopilot" as const,
    name: "Full Autopilot",
    icon: Rocket,
    color: "from-primary to-accent",
    description: "Your AI agent operates completely autonomously",
    features: [
      "AI creates and publishes content automatically",
      "Optimal posting times selected by AI",
      "Continuous learning and improvement",
      "Zero manual intervention needed",
    ],
    badge: "Recommended",
  },
  {
    id: "review" as const,
    name: "Review Before Posting",
    icon: Eye,
    color: "from-blue-500 to-purple-500",
    description: "Stay in control with approval workflow",
    features: [
      "AI creates content and schedules it",
      "You review and approve before publishing",
      "Make edits or reject suggestions",
      "Perfect for brand-sensitive businesses",
    ],
    badge: null,
  },
];

type Props = {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onComplete: () => void;
  onBack: () => void;
  isLoading: boolean;
};

export const AgentModeStep = ({ data, updateData, onComplete, onBack, isLoading }: Props) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
          <Zap className="w-8 h-8 text-foreground" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">Choose your agent mode</h1>
        <p className="text-muted-foreground">
          Decide how much autonomy your AI agent should have. You can change this anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => updateData({ agentMode: mode.id })}
            className={`relative p-6 rounded-2xl border text-left transition-all ${
              data.agentMode === mode.id
                ? "border-primary bg-primary/5 glow"
                : "border-border card-gradient hover:border-primary/50"
            }`}
          >
            {mode.badge && (
              <span className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-xs font-medium text-foreground">
                {mode.badge}
              </span>
            )}

            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4`}
            >
              <mode.icon className="w-7 h-7 text-white" />
            </div>

            <h3 className="font-display text-xl font-semibold mb-2">{mode.name}</h3>
            <p className="text-muted-foreground text-sm mb-4">{mode.description}</p>

            <ul className="space-y-2">
              {mode.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {data.agentMode === mode.id && (
              <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">What happens next?</h3>
            <p className="text-sm text-muted-foreground">
              Once activated, your AI agent will begin analyzing your website to understand your business, 
              products, brand voice, and target audience. This typically takes 2-5 minutes. You'll then 
              see your first content suggestions in the dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost" size="lg">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onComplete}
          variant="hero"
          size="xl"
          disabled={isLoading}
          className="min-w-[250px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Activating Agent...
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              Activate AI Agent
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
