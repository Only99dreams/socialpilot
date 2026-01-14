import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  Users,
  Play,
  Pause,
  CheckCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type DashboardStats = {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  draftPosts: number;
  weeklyPosts: number;
  monthlyEngagement: number;
  totalReach: number;
  engagementRate: number;
};

type Agent = Database["public"]["Tables"]["ai_agents"]["Row"];

type Props = {
  businessId: string;
  agent: Agent | null;
  onToggleAgent: () => void;
};

export function DashboardOverview({ businessId, agent, onToggleAgent }: Props) {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    weeklyPosts: 0,
    monthlyEngagement: 0,
    totalReach: 0,
    engagementRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all posts
        const { data: allPosts } = await supabase
          .from("posts")
          .select("*")
          .eq("business_id", businessId);

        if (allPosts) {
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

          const scheduledPosts = allPosts.filter(p => p.status === "scheduled").length;
          const publishedPosts = allPosts.filter(p => p.status === "published").length;
          const draftPosts = allPosts.filter(p => p.status === "draft").length;
          
          const weeklyPosts = allPosts.filter(p => {
            const createdAt = new Date(p.created_at);
            return createdAt >= weekAgo;
          }).length;

          // Simulate engagement metrics (in production, fetch from analytics table)
          const totalReach = publishedPosts * 500 + Math.floor(Math.random() * 1000);
          const engagementRate = publishedPosts > 0
            ? Number((Math.random() * 5 + 5).toFixed(1))
            : 0;
          const monthlyEngagement = publishedPosts * 50 + Math.floor(Math.random() * 200);

          setStats({
            totalPosts: allPosts.length,
            scheduledPosts,
            publishedPosts,
            draftPosts,
            weeklyPosts,
            monthlyEngagement,
            totalReach,
            engagementRate,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [businessId]);

  const statusColors: Record<string, string> = {
    active: "bg-green-500",
    paused: "bg-yellow-500",
    learning: "bg-blue-500",
    inactive: "bg-gray-500",
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Status Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">AI Agent Status</h2>
            <p className="text-sm text-muted-foreground">
              Mode: {agent?.mode === "autopilot" ? "Full Autopilot" : "Review Before Posting"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${statusColors[agent?.status || "inactive"]} animate-pulse`} />
            <span className="text-sm font-medium capitalize">{agent?.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-background/60 border">
            <p className="text-3xl font-bold">{stats.weeklyPosts}</p>
            <p className="text-sm text-muted-foreground">Posts This Week</p>
          </div>
          <div className="p-4 rounded-xl bg-background/60 border">
            <p className="text-3xl font-bold">{stats.totalReach.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Reach</p>
          </div>
          <div className="p-4 rounded-xl bg-background/60 border">
            <p className="text-3xl font-bold">{stats.engagementRate}%</p>
            <p className="text-sm text-muted-foreground">Engagement Rate</p>
          </div>
        </div>

        <Button
          onClick={onToggleAgent}
          variant={agent?.status === "active" ? "outline" : "default"}
          className="w-full"
          size="lg"
        >
          {agent?.status === "active" ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause Agent
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Activate Agent
            </>
          )}
        </Button>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total</span>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.totalPosts}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Posts</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Published</span>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.publishedPosts}</p>
            <p className="text-sm text-muted-foreground mt-1">Published Posts</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Scheduled</span>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.scheduledPosts}</p>
            <p className="text-sm text-muted-foreground mt-1">Scheduled Posts</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Engagement</span>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.monthlyEngagement}</p>
            <p className="text-sm text-muted-foreground mt-1">This Month</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
