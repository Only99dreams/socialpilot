import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { 
  Sparkles, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Clock,
  TrendingUp
} from "lucide-react";

type ActivityItem = {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  icon: string;
};

type Props = {
  businessId: string;
};

export function RecentActivity({ businessId }: Props) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        // Fetch recent posts
        const { data: recentPosts } = await supabase
          .from("posts")
          .select("*")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false })
          .limit(10);

        const activityItems: ActivityItem[] = [];

        if (recentPosts) {
          recentPosts.forEach(post => {
            const timestamp = new Date(post.created_at);
            
            if (post.status === "published") {
              activityItems.push({
                id: post.id,
                type: "published",
                message: `Published post to ${post.platform}`,
                timestamp,
                icon: "✅"
              });
            } else if (post.status === "scheduled") {
              activityItems.push({
                id: post.id,
                type: "scheduled",
                message: `Scheduled post for ${post.platform}`,
                timestamp,
                icon: "📅"
              });
            } else if (post.ai_generated) {
              activityItems.push({
                id: post.id,
                type: "generated",
                message: `AI generated new ${post.platform} post`,
                timestamp,
                icon: "🧠"
              });
            }
          });
        }

        // Sort by timestamp
        activityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setActivities(activityItems.slice(0, 8));
      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();

    // Set up realtime subscription
    const channel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `business_id=eq.${businessId}`,
        },
        () => {
          fetchActivity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "published":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "scheduled":
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case "generated":
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted animate-pulse">
              <div className="w-10 h-10 rounded-full bg-muted-foreground/20" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No recent activity</p>
          <p className="text-sm mt-1">Activity will appear here when you create posts</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="mt-0.5">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{activity.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
