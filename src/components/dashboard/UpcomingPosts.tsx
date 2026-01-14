import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Instagram, Facebook, Twitter, Linkedin } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

type Post = {
  id: string;
  content: string;
  platform: string;
  scheduled_at: string;
  image_url?: string;
};

type Props = {
  businessId: string;
};

export function UpcomingPosts({ businessId }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpcomingPosts = async () => {
      try {
        const { data } = await supabase
          .from("posts")
          .select("*")
          .eq("business_id", businessId)
          .eq("status", "scheduled")
          .gte("scheduled_at", new Date().toISOString())
          .order("scheduled_at", { ascending: true })
          .limit(5);

        if (data) {
          setPosts(data);
        }
      } catch (error) {
        console.error("Error fetching upcoming posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingPosts();

    // Set up realtime subscription
    const channel = supabase
      .channel("upcoming-posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `business_id=eq.${businessId}`,
        },
        () => {
          fetchUpcomingPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId]);

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
        return <Calendar className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Upcoming Posts</h2>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-3 rounded-lg bg-muted animate-pulse h-20" />
          ))}
        </div>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Upcoming Posts</h2>
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No scheduled posts</p>
          <p className="text-sm mt-1">Schedule posts from the calendar</p>
        </div>
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => navigate("/calendar")}
        >
          View Calendar
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Upcoming Posts</h2>
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="mt-1">
              {getPlatformIcon(post.platform)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">
                {post.content.substring(0, 60)}...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(post.scheduled_at), "MMM d, h:mm a")}
              </p>
            </div>
          </div>
        ))}
      </div>
      <Button 
        variant="outline" 
        className="w-full mt-4"
        onClick={() => navigate("/calendar")}
      >
        View All in Calendar
      </Button>
    </Card>
  );
}
