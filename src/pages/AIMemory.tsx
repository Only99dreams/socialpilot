import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  RefreshCw,
  TrendingUp,
  Target,
  Users,
  MessageSquare,
  Sparkles,
  Save,
  Edit,
  Plus,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AgentRow = Database["public"]["Tables"]["ai_agents"]["Row"];

type AgentProfile = {
  industry_insights?: string[];
  target_audience?: string;
  brand_voice?: string;
  top_performing_topics?: string[];
  best_posting_times?: string[];
  content_preferences?: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.every((item) => typeof item === "string") ? (value as string[]) : [];
}

function parseAgentProfile(profile: AgentRow["business_profile"]): AgentProfile {
  if (!isRecord(profile)) return {};
  return {
    target_audience: asString(profile.target_audience),
    brand_voice: asString(profile.brand_voice),
    industry_insights: asStringArray(profile.industry_insights),
    top_performing_topics: asStringArray(profile.top_performing_topics),
    best_posting_times: asStringArray(profile.best_posting_times),
    content_preferences: asStringArray(profile.content_preferences),
  };
}

const AIMemory = () => {
  const [agent, setAgent] = useState<AgentRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    targetAudience: "",
    brandVoice: "",
    industryInsights: [] as string[],
    topPerformingTopics: [] as string[],
    bestPostingTimes: [] as string[],
    contentPreferences: [] as string[],
  });
  const [newInsight, setNewInsight] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newPreference, setNewPreference] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Fetch business
      const { data: businesses } = await supabase
        .from("businesses")
        .select("*")
        .limit(1);

      if (businesses && businesses.length > 0) {
        setBusinessId(businesses[0].id);
        await fetchAgent(businesses[0].id);
      } else {
        navigate("/onboarding");
      }
    };

    fetchData();
  }, [navigate]);

  const fetchAgent = async (businessId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("business_id", businessId)
        .single();

      if (error) throw error;

      if (data) {
        setAgent(data);
        const profile = parseAgentProfile(data.business_profile);
        setFormData({
          targetAudience: profile.target_audience || "",
          brandVoice: profile.brand_voice || "",
          industryInsights: profile.industry_insights || [],
          topPerformingTopics: profile.top_performing_topics || [],
          bestPostingTimes: profile.best_posting_times || [],
          contentPreferences: profile.content_preferences || [],
        });
      }
    } catch (error) {
      console.error("Error fetching agent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!agent) return;

    try {
      const { error } = await supabase
        .from("ai_agents")
        .update({
          business_profile: {
            target_audience: formData.targetAudience,
            brand_voice: formData.brandVoice,
            industry_insights: formData.industryInsights,
            top_performing_topics: formData.topPerformingTopics,
            best_posting_times: formData.bestPostingTimes,
            content_preferences: formData.contentPreferences,
          }
        })
        .eq("id", agent.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "AI Memory has been updated successfully",
      });
      setIsEditing(false);
      await fetchAgent(businessId!);
    } catch (error) {
      console.error("Error saving agent memory:", error);
      toast({
        title: "Error",
        description: "Failed to update AI Memory",
        variant: "destructive",
      });
    }
  };

  const addItem = (type: string, value: string, setter: (val: string) => void) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type as keyof typeof prev] as string[], value]
    }));
    setter("");
  };

  const removeItem = (type: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: (prev[type as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading AI Memory...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <SidebarTrigger className="md:hidden mt-1" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                    <Brain className="w-8 h-8 text-primary" />
                    AI Memory
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Your AI agent's learned knowledge about your brand and audience
                  </p>
                </div>
              </div>
              <Button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                variant={isEditing ? "default" : "outline"}
                className="w-full sm:w-auto"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </div>

            {/* Learning Status */}
            <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-1">Learning Status</h2>
                  <p className="text-sm text-muted-foreground">
                    AI is continuously learning from your content performance
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    Active Learning
                  </Badge>
                </div>
              </div>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Target Audience */}
              <Card className="p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">Target Audience</h3>
                    <p className="text-xs text-muted-foreground">Who you're reaching</p>
                  </div>
                </div>
                {isEditing ? (
                  <Textarea
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="Describe your target audience..."
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {formData.targetAudience || "Not set yet"}
                  </p>
                )}
              </Card>

              {/* Brand Voice */}
              <Card className="p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">Brand Voice</h3>
                    <p className="text-xs text-muted-foreground">Your communication style</p>
                  </div>
                </div>
                {isEditing ? (
                  <Textarea
                    value={formData.brandVoice}
                    onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
                    placeholder="Describe your brand voice..."
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {formData.brandVoice || "Not set yet"}
                  </p>
                )}
              </Card>
            </div>

            {/* Industry Insights */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold">Industry Insights</h3>
                  <p className="text-xs text-muted-foreground">Key trends and observations</p>
                </div>
              </div>
              {isEditing && (
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newInsight}
                    onChange={(e) => setNewInsight(e.target.value)}
                    placeholder="Add new insight..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addItem('industryInsights', newInsight, setNewInsight);
                      }
                    }}
                  />
                  <Button 
                    onClick={() => addItem('industryInsights', newInsight, setNewInsight)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.industryInsights.length > 0 ? (
                  formData.industryInsights.map((insight, index) => (
                    <Badge key={index} variant="secondary" className="gap-2">
                      {insight}
                      {isEditing && (
                        <button onClick={() => removeItem('industryInsights', index)}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No insights added yet</p>
                )}
              </div>
            </Card>

            {/* Top Performing Topics */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold">Top Performing Topics</h3>
                  <p className="text-xs text-muted-foreground">Content that resonates</p>
                </div>
              </div>
              {isEditing && (
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Add new topic..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addItem('topPerformingTopics', newTopic, setNewTopic);
                      }
                    }}
                  />
                  <Button 
                    onClick={() => addItem('topPerformingTopics', newTopic, setNewTopic)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.topPerformingTopics.length > 0 ? (
                  formData.topPerformingTopics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="gap-2">
                      {topic}
                      {isEditing && (
                        <button onClick={() => removeItem('topPerformingTopics', index)}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No topics tracked yet</p>
                )}
              </div>
            </Card>

            {/* Best Posting Times */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-pink-100 dark:bg-pink-900/20">
                  <Brain className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="font-bold">Best Posting Times</h3>
                  <p className="text-xs text-muted-foreground">When your audience is most active</p>
                </div>
              </div>
              {isEditing && (
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g., Mon-Fri 9am, Weekends 7pm..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addItem('bestPostingTimes', newTime, setNewTime);
                      }
                    }}
                  />
                  <Button 
                    onClick={() => addItem('bestPostingTimes', newTime, setNewTime)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.bestPostingTimes.length > 0 ? (
                  formData.bestPostingTimes.map((time, index) => (
                    <Badge key={index} variant="secondary" className="gap-2">
                      {time}
                      {isEditing && (
                        <button onClick={() => removeItem('bestPostingTimes', index)}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No optimal times identified yet</p>
                )}
              </div>
            </Card>

            {/* Content Preferences */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-cyan-100 dark:bg-cyan-900/20">
                  <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold">Content Preferences</h3>
                  <p className="text-xs text-muted-foreground">What works best for your brand</p>
                </div>
              </div>
              {isEditing && (
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newPreference}
                    onChange={(e) => setNewPreference(e.target.value)}
                    placeholder="Add content preference..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addItem('contentPreferences', newPreference, setNewPreference);
                      }
                    }}
                  />
                  <Button 
                    onClick={() => addItem('contentPreferences', newPreference, setNewPreference)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.contentPreferences.length > 0 ? (
                  formData.contentPreferences.map((pref, index) => (
                    <Badge key={index} variant="secondary" className="gap-2">
                      {pref}
                      {isEditing && (
                        <button onClick={() => removeItem('contentPreferences', index)}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No preferences set yet</p>
                )}
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AIMemory;
