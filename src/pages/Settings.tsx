import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Bot,
  Bell,
  Shield,
  RefreshCw,
  Save,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Check,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type Agent = Database["public"]["Tables"]["ai_agents"]["Row"];
type SocialConnection = Database["public"]["Tables"]["social_connections"]["Row"];

type BrandTone = Database["public"]["Enums"]["brand_tone"];
type AgentMode = Database["public"]["Enums"]["agent_mode"];

const Settings = () => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form states
  const [businessForm, setBusinessForm] = useState<{
    name: string;
    website_url: string;
    industry: string;
    brand_tone: BrandTone;
  }>({
    name: "",
    website_url: "",
    industry: "",
    brand_tone: "professional",
  });

  const [agentForm, setAgentForm] = useState<{ mode: AgentMode }>({
    mode: "review",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    performanceAlerts: true,
  });

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
        setBusiness(businesses[0]);
        setBusinessForm({
          name: businesses[0].name,
          website_url: businesses[0].website_url,
          industry: businesses[0].industry || "",
          brand_tone: businesses[0].brand_tone ?? "professional",
        });

        // Fetch agent
        const { data: agents } = await supabase
          .from("ai_agents")
          .select("*")
          .eq("business_id", businesses[0].id)
          .limit(1);

        if (agents && agents.length > 0) {
          setAgent(agents[0]);
          setAgentForm({
            mode: agents[0].mode ?? "review",
          });
        }

        // Fetch social connections
        const { data: socialConnections } = await supabase
          .from("social_connections")
          .select("*")
          .eq("business_id", businesses[0].id);

        if (socialConnections) {
          setConnections(socialConnections);
        }
      } else {
        navigate("/onboarding");
      }

      setIsLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleSaveBusinessInfo = async () => {
    if (!business) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          name: businessForm.name,
          website_url: businessForm.website_url,
          industry: businessForm.industry,
          brand_tone: businessForm.brand_tone,
        })
        .eq("id", business.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business information updated successfully",
      });

      setBusiness({ ...business, ...businessForm });
    } catch (error) {
      console.error("Error updating business:", error);
      toast({
        title: "Error",
        description: "Failed to update business information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAgentSettings = async () => {
    if (!agent) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("ai_agents")
        .update({
          mode: agentForm.mode,
        })
        .eq("id", agent.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "AI Agent settings updated successfully",
      });

      setAgent({ ...agent, ...agentForm });
    } catch (error) {
      console.error("Error updating agent:", error);
      toast({
        title: "Error",
        description: "Failed to update AI Agent settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="w-5 h-5 text-pink-500" />;
      case "facebook":
        return <Facebook className="w-5 h-5 text-blue-600" />;
      case "twitter":
        return <Twitter className="w-5 h-5 text-sky-500" />;
      case "linkedin":
        return <Linkedin className="w-5 h-5 text-blue-700" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
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
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <SidebarTrigger className="md:hidden mt-1" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <SettingsIcon className="w-8 h-8" />
                  Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your account and AI agent preferences
                </p>
              </div>
            </div>

            <Tabs defaultValue="business" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="business">
                  <Building2 className="w-4 h-4 mr-2" />
                  Business
                </TabsTrigger>
                <TabsTrigger value="agent">
                  <Bot className="w-4 h-4 mr-2" />
                  AI Agent
                </TabsTrigger>
                <TabsTrigger value="connections">
                  <Shield className="w-4 h-4 mr-2" />
                  Connections
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </TabsTrigger>
              </TabsList>

              {/* Business Settings */}
              <TabsContent value="business" className="space-y-4">
                <Card className="p-4 md:p-6">
                  <h3 className="text-xl font-bold mb-4">Business Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input
                        id="business-name"
                        value={businessForm.name}
                        onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                        placeholder="Enter your business name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website URL</Label>
                      <Input
                        id="website"
                        type="url"
                        value={businessForm.website_url}
                        onChange={(e) => setBusinessForm({ ...businessForm, website_url: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={businessForm.industry}
                        onChange={(e) => setBusinessForm({ ...businessForm, industry: e.target.value })}
                        placeholder="e.g., Technology, Fashion, Food"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brand-tone">Brand Tone</Label>
                      <Select 
                        value={businessForm.brand_tone} 
                        onValueChange={(value) => setBusinessForm({ ...businessForm, brand_tone: value as BrandTone })}
                      >
                        <SelectTrigger id="brand-tone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="luxury">Luxury</SelectItem>
                          <SelectItem value="playful">Playful</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleSaveBusinessInfo} disabled={isSaving} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* AI Agent Settings */}
              <TabsContent value="agent" className="space-y-4">
                <Card className="p-4 md:p-6">
                  <h3 className="text-xl font-bold mb-4">AI Agent Configuration</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="agent-mode">Agent Mode</Label>
                      <Select 
                        value={agentForm.mode} 
                        onValueChange={(value) => setAgentForm({ ...agentForm, mode: value as AgentMode })}
                      >
                        <SelectTrigger id="agent-mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="autopilot">
                            Full Autopilot - AI posts automatically
                          </SelectItem>
                          <SelectItem value="review">
                            Review Mode - Review before posting
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {agentForm.mode === "autopilot"
                          ? "AI will create and publish posts automatically"
                          : "AI will create drafts for your review before publishing"}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <h4 className="font-medium">Agent Status</h4>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          agent?.status === "active" ? "bg-green-500" :
                          agent?.status === "paused" ? "bg-yellow-500" :
                          "bg-gray-500"
                        } animate-pulse`} />
                        <span className="text-sm capitalize">{agent?.status}</span>
                      </div>
                    </div>

                    <Button onClick={handleSaveAgentSettings} disabled={isSaving} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Social Connections */}
              <TabsContent value="connections" className="space-y-4">
                <Card className="p-4 md:p-6">
                  <h3 className="text-xl font-bold mb-4">Social Media Connections</h3>
                  <div className="space-y-4">
                    {["instagram", "facebook", "twitter", "linkedin"].map((platform) => {
                      const connection = connections.find(c => c.platform === platform);
                      return (
                        <div
                          key={platform}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            {getPlatformIcon(platform)}
                            <div>
                              <p className="font-medium capitalize">{platform}</p>
                              {connection?.is_connected && (
                                <p className="text-sm text-muted-foreground">
                                  @{connection.account_name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {connection?.is_connected ? (
                              <>
                                <Check className="w-4 h-4 text-green-500" />
                                <Button variant="outline" size="sm">
                                  Disconnect
                                </Button>
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 text-muted-foreground" />
                                <Button variant="default" size="sm">
                                  Connect
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </TabsContent>

              {/* Notifications */}
              <TabsContent value="notifications" className="space-y-4">
                <Card className="p-4 md:p-6">
                  <h3 className="text-xl font-bold mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive updates via email
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified in the app
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-sm text-muted-foreground">
                          Summary of your performance
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.weeklyReports}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, weeklyReports: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Performance Alerts</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified of significant changes
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.performanceAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, performanceAlerts: checked })
                        }
                      />
                    </div>

                    <Button className="w-full mt-4">
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
