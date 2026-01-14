import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

type Post = {
  id: string;
  content: string;
  platform: string;
  scheduled_at: string | null;
  status: string;
  image_url?: string;
  hashtags?: string[];
  ai_generated: boolean;
  created_at: string;
};

const Library = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [businessId, setBusinessId] = useState<string | null>(null);
  const navigate = useNavigate();

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
        await fetchPosts(businesses[0].id);
      } else {
        navigate("/onboarding");
      }
    };

    fetchData();
  }, [navigate]);

  const fetchPosts = async (businessId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setPosts(data);
        setFilteredPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = posts;

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(post => post.status === selectedStatus);
    }

    if (selectedPlatform !== "all") {
      filtered = filtered.filter(post => post.platform === selectedPlatform);
    }

    setFilteredPosts(filtered);
  }, [searchQuery, selectedStatus, selectedPlatform, posts]);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case "facebook":
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case "twitter":
        return <Twitter className="w-4 h-4 text-sky-500" />;
      case "linkedin":
        return <Linkedin className="w-4 h-4 text-blue-700" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "scheduled":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "draft":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      case "failed":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const groupedPosts = {
    all: filteredPosts,
    draft: filteredPosts.filter(p => p.status === "draft"),
    scheduled: filteredPosts.filter(p => p.status === "scheduled"),
    published: filteredPosts.filter(p => p.status === "published"),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading content library...</p>
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
                  <h1 className="text-2xl md:text-3xl font-bold">Content Library</h1>
                  <p className="text-muted-foreground mt-1">
                    Manage all your social media content
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate("/generator")} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="w-full overflow-x-auto justify-start">
                <TabsTrigger value="all">
                  All ({groupedPosts.all.length})
                </TabsTrigger>
                <TabsTrigger value="draft">
                  Drafts ({groupedPosts.draft.length})
                </TabsTrigger>
                <TabsTrigger value="scheduled">
                  Scheduled ({groupedPosts.scheduled.length})
                </TabsTrigger>
                <TabsTrigger value="published">
                  Published ({groupedPosts.published.length})
                </TabsTrigger>
              </TabsList>

              {Object.entries(groupedPosts).map(([key, posts]) => (
                <TabsContent key={key} value={key} className="space-y-4">
                  {posts.length === 0 ? (
                    <Card className="p-12">
                      <div className="text-center text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No posts found</p>
                        <p className="text-sm mt-1">
                          Create your first post to get started
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {posts.map((post) => (
                        <Card key={post.id} className="p-4 hover:shadow-lg transition-shadow">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {getPlatformIcon(post.platform)}
                                <span className="text-sm font-medium capitalize">
                                  {post.platform}
                                </span>
                              </div>
                              <Badge className={getStatusColor(post.status)}>
                                {post.status}
                              </Badge>
                            </div>

                            {/* Content */}
                            <p className="text-sm line-clamp-3">
                              {post.content}
                            </p>

                            {/* Metadata */}
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {post.scheduled_at
                                  ? format(new Date(post.scheduled_at), "MMM d, h:mm a")
                                  : format(new Date(post.created_at), "MMM d, yyyy")}
                              </div>
                              {post.ai_generated && (
                                <Badge variant="outline" className="text-xs">
                                  AI Generated
                                </Badge>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t">
                              <Button variant="ghost" size="sm" className="flex-1">
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button variant="ghost" size="sm" className="flex-1">
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Library;
