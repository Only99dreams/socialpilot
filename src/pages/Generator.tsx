import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Globe,
  Loader2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Copy,
  RefreshCw,
  Check,
  Lightbulb,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { analyzeWebsite, generateContent, type BusinessProfile, type GeneratedPost } from '@/lib/api/business-intelligence';
import { cn } from '@/lib/utils';

const platforms = [
  { id: 'instagram', icon: Instagram, label: 'Instagram', color: 'text-pink-400 bg-pink-500/10' },
  { id: 'facebook', icon: Facebook, label: 'Facebook', color: 'text-blue-400 bg-blue-500/10' },
  { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'text-sky-400 bg-sky-500/10' },
  { id: 'twitter', icon: Twitter, label: 'X/Twitter', color: 'text-slate-300 bg-slate-500/10' },
];

const contentTypes = [
  { id: 'promotional', label: 'Promotional', icon: TrendingUp },
  { id: 'educational', label: 'Educational', icon: Lightbulb },
  { id: 'engagement', label: 'Engagement', icon: Zap },
];

export default function Generator() {
  const { toast } = useToast();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [selectedContentType, setSelectedContentType] = useState('promotional');
  const [topic, setTopic] = useState('');
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl) {
      toast({
        title: 'URL required',
        description: 'Please enter your website URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeWebsite(websiteUrl);
      
      if (result.success && result.data) {
        setBusinessProfile(result.data);
        toast({
          title: 'Website analyzed!',
          description: `Discovered ${result.data.products?.length || 0} products and identified your brand voice.`,
        });
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!businessProfile) {
      toast({
        title: 'Analyze first',
        description: 'Please analyze your website before generating content.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateContent({
        businessProfile,
        platform: selectedPlatform,
        contentType: selectedContentType,
        topic: topic || undefined
      });

      if (result.success && result.data) {
        setGeneratedPosts([result.data, ...generatedPosts]);
        toast({
          title: 'Content generated!',
          description: 'Your AI-powered content is ready.',
        });
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-start gap-3">
              <SidebarTrigger className="md:hidden mt-1" />
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-primary" />
                AI Content Generator
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Analyze your brand and generate on-brand social content in seconds
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Configuration */}
            <div className="lg:col-span-1 space-y-6">
              {/* Website Analysis */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Globe className="w-5 h-5 text-primary" />
                      Brand Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="website">Website URL</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          id="website"
                          placeholder="https://yourwebsite.com"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                        />
                        <Button 
                          onClick={handleAnalyzeWebsite}
                          disabled={isAnalyzing}
                          size="icon"
                        >
                          {isAnalyzing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Business Profile Summary */}
                    {businessProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Profile Loaded</span>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            Active
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Industry:</span>{' '}
                            <span className="text-foreground">{businessProfile.industry}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tone:</span>{' '}
                            <Badge variant="outline" className="ml-1 capitalize">
                              {businessProfile.brandVoice?.tone}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Products:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {businessProfile.products?.slice(0, 3).map((p, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {p}
                                </Badge>
                              ))}
                              {(businessProfile.products?.length || 0) > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{businessProfile.products!.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Generation Options */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Generation Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Platform Selection */}
                    <div>
                      <Label className="mb-2 block">Platform</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {platforms.map((platform) => (
                          <Button
                            key={platform.id}
                            variant={selectedPlatform === platform.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedPlatform(platform.id)}
                            className={cn(
                              "justify-start gap-2",
                              selectedPlatform !== platform.id && platform.color
                            )}
                          >
                            <platform.icon className="w-4 h-4" />
                            {platform.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Content Type */}
                    <div>
                      <Label className="mb-2 block">Content Type</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {contentTypes.map((type) => (
                          <Button
                            key={type.id}
                            variant={selectedContentType === type.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedContentType(type.id)}
                            className="justify-start gap-2"
                          >
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Topic Input */}
                    <div>
                      <Label htmlFor="topic">Topic (optional)</Label>
                      <Textarea
                        id="topic"
                        placeholder="Enter a specific topic or leave blank for AI suggestions..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="mt-1.5 resize-none"
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !businessProfile}
                      className="w-full gap-2"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      Generate Content
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Generated Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card className="bg-card border-border h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Generated Content</span>
                    {generatedPosts.length > 0 && (
                      <Badge variant="secondary">{generatedPosts.length} posts</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">No content yet</h3>
                      <p className="text-muted-foreground max-w-md">
                        Analyze your website and click "Generate Content" to create AI-powered posts tailored to your brand.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {generatedPosts.map((post, index) => {
                        const platform = platforms.find(p => p.id === post.platform);
                        const Icon = platform?.icon || Sparkles;
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-lg bg-secondary/50 border border-border"
                          >
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <div className={cn("p-2 rounded-lg", platform?.color)}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="font-medium capitalize">{post.platform}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {new Date(post.generatedAt).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopy(post.content, index)}
                                >
                                  {copiedIndex === index ? (
                                    <Check className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>
                            
                            {post.hashtags && post.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {post.hashtags.map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs text-primary">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {post.bestTimeToPost && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <span className="text-xs text-muted-foreground">
                                  💡 Best time to post: {post.bestTimeToPost}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
