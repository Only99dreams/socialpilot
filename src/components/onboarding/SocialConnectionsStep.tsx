import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { OnboardingData } from "@/pages/Onboarding";
import type { Database } from "@/integrations/supabase/types";

const platforms = [
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    color: "from-pink-500 to-purple-500",
    description: "Visual storytelling",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "👥",
    color: "from-blue-600 to-blue-400",
    description: "Community building",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: "🐦",
    color: "from-gray-800 to-gray-600",
    description: "Real-time engagement",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    color: "from-blue-700 to-blue-500",
    description: "Professional networking",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    color: "from-pink-600 via-purple-500 to-cyan-400",
    description: "Short-form video",
  },
];

type Props = {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  businessId: string;
  onNext: () => void;
  onBack: () => void;
};

export const SocialConnectionsStep = ({ data, updateData, businessId, onNext, onBack }: Props) => {
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const { toast } = useToast();

  type PlatformId = Database["public"]["Enums"]["social_platform"];

  const handleConnect = async (platformId: PlatformId) => {
    setConnectingPlatform(platformId);

    // Simulate OAuth flow - in production, this would redirect to the platform's OAuth
    // For now, we'll create a placeholder connection
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay

      const { error } = await supabase.from("social_connections").insert({
        business_id: businessId,
        platform: platformId,
        is_connected: true,
        account_name: `@${data.businessName.toLowerCase().replace(/\s+/g, "")}`,
      });

      if (error) throw error;

      updateData({ connectedPlatforms: [...data.connectedPlatforms, platformId] });

      toast({
        title: `${platforms.find((p) => p.id === platformId)?.name} connected!`,
        description: "Your account has been successfully linked.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({
        title: "Connection failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const isConnected = (platformId: PlatformId) => data.connectedPlatforms.includes(platformId);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center text-3xl">
          🔗
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">Connect your platforms</h1>
        <p className="text-muted-foreground">
          Link your social media accounts so your AI agent can publish content automatically.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className={`p-4 rounded-2xl border transition-all ${
              isConnected(platform.id)
                ? "border-primary bg-primary/5"
                : "border-border card-gradient"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-2xl`}
                >
                  {platform.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{platform.name}</h3>
                  <p className="text-sm text-muted-foreground">{platform.description}</p>
                </div>
              </div>

              {isConnected(platform.id as PlatformId) ? (
                <div className="flex items-center gap-2 text-primary">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Connected</span>
                </div>
              ) : (
                <Button
                  onClick={() => handleConnect(platform.id as PlatformId)}
                  variant="outline"
                  disabled={connectingPlatform !== null}
                  className="min-w-[120px]"
                >
                  {connectingPlatform === platform.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-muted/50 border border-border mb-8">
        <p className="text-sm text-muted-foreground text-center">
          <strong>Note:</strong> In production, each platform will redirect you to their official OAuth 
          authorization page. Your credentials are never stored by SocialPilot.
        </p>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost" size="lg">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          variant="hero"
          size="lg"
          className="min-w-[200px]"
        >
          {data.connectedPlatforms.length === 0 ? "Skip for now" : "Continue"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
