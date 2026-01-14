import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingPosts } from "@/components/dashboard/UpcomingPosts";
import type { Database } from "@/integrations/supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type Agent = Database["public"]["Tables"]["ai_agents"]["Row"];

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
            <div className="flex items-start gap-3">
              <SidebarTrigger className="md:hidden mt-1" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome back, {business?.name}
                </h1>
                <p className="text-muted-foreground">
                  Here's how your AI agent is performing
                </p>
              </div>
            </div>

            {/* Dashboard Overview with Stats */}
            <DashboardOverview 
              businessId={business!.id} 
              agent={agent}
              onToggleAgent={toggleAgentStatus}
            />

            {/* Activity and Upcoming Posts */}
            <div className="grid gap-6 md:grid-cols-2">
              <RecentActivity businessId={business!.id} />
              <UpcomingPosts businessId={business!.id} />
            </div>
          </motion.div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
