import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Zap, 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  Brain,
  Play,
  Pause,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Business = {
  id: string;
  name: string;
  website_url: string;
  brand_tone: string;
};

type Agent = {
  id: string;
  mode: string;
  status: string;
  business_profile: any;
};

const Dashboard = () => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        setBusiness(businesses[0]);

        // Fetch agent
        const { data: agents } = await supabase
          .from("ai_agents")
          .select("*")
          .eq("business_id", businesses[0].id)
          .limit(1);

        if (agents && agents.length > 0) {
          setAgent(agents[0]);
        }
      } else {
        navigate("/onboarding");
        return;
      }

      setIsLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const toggleAgentStatus = async () => {
    if (!agent) return;
    
    const newStatus = agent.status === "active" ? "paused" : "active";
    
    const { error } = await supabase
      .from("ai_agents")
      .update({ status: newStatus })
      .eq("id", agent.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update agent status",
        variant: "destructive",
      });
      return;
    }

    setAgent({ ...agent, status: newStatus });
    toast({
      title: newStatus === "active" ? "Agent Activated" : "Agent Paused",
      description: newStatus === "active" 
        ? "Your AI agent is now running" 
        : "Your AI agent has been paused",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-500",
    paused: "bg-yellow-500",
    learning: "bg-blue-500",
    inactive: "bg-gray-500",
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-foreground" />
            </div>
            <span className="font-display text-lg font-bold">SocialPilot</span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Button variant="secondary" className="w-full justify-start">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start">
                <Calendar className="w-4 h-4" />
                Content Calendar
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start">
                <Brain className="w-4 h-4" />
                AI Memory
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">
              Welcome back, {business?.name}
            </h1>
            <p className="text-muted-foreground">
              Here's how your AI agent is performing
            </p>
          </div>

          {/* Agent Status Card */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="col-span-full lg:col-span-2 p-6 rounded-2xl card-gradient border border-border">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-semibold mb-1">AI Agent Status</h2>
                  <p className="text-sm text-muted-foreground">
                    Mode: {agent?.mode === "autopilot" ? "Full Autopilot" : "Review Before Posting"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${statusColors[agent?.status || "inactive"]} animate-pulse`} />
                  <span className="text-sm font-medium capitalize">{agent?.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">Posts This Week</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-2xl font-bold">12.4K</p>
                  <p className="text-sm text-muted-foreground">Total Reach</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-2xl font-bold">8.2%</p>
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                </div>
              </div>

              <Button
                onClick={toggleAgentStatus}
                variant={agent?.status === "active" ? "outline" : "hero"}
                className="w-full"
              >
                {agent?.status === "active" ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause Agent
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Activate Agent
                  </>
                )}
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="p-6 rounded-2xl card-gradient border border-border">
              <h2 className="font-display text-xl font-semibold mb-4">Upcoming Posts</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-lg">
                      {i === 1 ? "📸" : i === 2 ? "💼" : "🐦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Scheduled post #{i}</p>
                      <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4">
                View Calendar
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-6 rounded-2xl card-gradient border border-border">
            <h2 className="font-display text-xl font-semibold mb-4">Agent Activity</h2>
            <div className="space-y-4">
              {[
                { icon: "🧠", action: "Analyzed trending topics in your industry", time: "2 min ago" },
                { icon: "✍️", action: "Generated 3 new post drafts", time: "15 min ago" },
                { icon: "📊", action: "Updated performance metrics", time: "1 hour ago" },
                { icon: "📅", action: "Scheduled posts for next week", time: "3 hours ago" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
