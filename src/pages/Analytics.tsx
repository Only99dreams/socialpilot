import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  Clock,
  Calendar,
  Bot,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock data for engagement metrics
const engagementData = [
  { day: 'Mon', likes: 234, comments: 45, shares: 12, reach: 1200 },
  { day: 'Tue', likes: 312, comments: 67, shares: 23, reach: 1890 },
  { day: 'Wed', likes: 278, comments: 52, shares: 18, reach: 1450 },
  { day: 'Thu', likes: 456, comments: 89, shares: 34, reach: 2340 },
  { day: 'Fri', likes: 523, comments: 102, shares: 45, reach: 2890 },
  { day: 'Sat', likes: 389, comments: 76, shares: 28, reach: 2100 },
  { day: 'Sun', likes: 290, comments: 54, shares: 19, reach: 1560 },
];

// Best posting times data
const postingTimesData = [
  { hour: '6am', engagement: 23 },
  { hour: '8am', engagement: 45 },
  { hour: '10am', engagement: 67 },
  { hour: '12pm', engagement: 89 },
  { hour: '2pm', engagement: 76 },
  { hour: '4pm', engagement: 54 },
  { hour: '6pm', engagement: 98 },
  { hour: '8pm', engagement: 87 },
  { hour: '10pm', engagement: 56 },
];

// Platform distribution data
const platformData = [
  { name: 'Instagram', value: 45, color: 'hsl(340, 82%, 59%)' },
  { name: 'LinkedIn', value: 28, color: 'hsl(201, 100%, 35%)' },
  { name: 'Facebook', value: 18, color: 'hsl(220, 46%, 48%)' },
  { name: 'X (Twitter)', value: 9, color: 'hsl(203, 89%, 53%)' },
];

// AI Agent performance metrics
const aiMetrics = {
  postsGenerated: 127,
  postsPublished: 98,
  avgEngagement: 4.2,
  learningScore: 87,
  contentScore: 92,
};

const chartConfig = {
  likes: { label: 'Likes', color: 'hsl(199, 89%, 48%)' },
  comments: { label: 'Comments', color: 'hsl(280, 80%, 60%)' },
  shares: { label: 'Shares', color: 'hsl(142, 76%, 36%)' },
  reach: { label: 'Reach', color: 'hsl(38, 92%, 50%)' },
  engagement: { label: 'Engagement', color: 'hsl(199, 89%, 48%)' },
};

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'up' 
}: { 
  title: string; 
  value: string; 
  change: string; 
  icon: React.ElementType; 
  trend?: 'up' | 'down';
}) => (
  <Card className="bg-card border-border">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className={`text-xs mt-1 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? '↑' : '↓'} {change} vs last week
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6"
          >
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">Track your social media performance and AI insights</p>
            </div>
            
            <Tabs value={timeRange} onValueChange={setTimeRange}>
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="7d">7 Days</TabsTrigger>
                <TabsTrigger value="30d">30 Days</TabsTrigger>
                <TabsTrigger value="90d">90 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            <StatCard 
              title="Total Reach" 
              value="24.5K" 
              change="12.3%" 
              icon={Eye} 
              trend="up" 
            />
            <StatCard 
              title="Engagement Rate" 
              value="4.8%" 
              change="0.5%" 
              icon={Heart} 
              trend="up" 
            />
            <StatCard 
              title="Comments" 
              value="485" 
              change="8.2%" 
              icon={MessageCircle} 
              trend="up" 
            />
            <StatCard 
              title="Shares" 
              value="179" 
              change="2.1%" 
              icon={Share2} 
              trend="down" 
            />
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Engagement Over Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Engagement Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <AreaChart data={engagementData}>
                      <defs>
                        <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="likes" 
                        stroke="hsl(199, 89%, 48%)" 
                        fillOpacity={1} 
                        fill="url(#colorLikes)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="comments" 
                        stroke="hsl(280, 80%, 60%)" 
                        fillOpacity={1} 
                        fill="url(#colorComments)" 
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Best Posting Times */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Best Posting Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart data={postingTimesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="engagement" 
                        fill="hsl(199, 89%, 48%)" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI Performance & Platform Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Agent Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    AI Agent Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted/30">
                      <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold">{aiMetrics.postsGenerated}</p>
                      <p className="text-xs text-muted-foreground">Posts Generated</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/30">
                      <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{aiMetrics.postsPublished}</p>
                      <p className="text-xs text-muted-foreground">Posts Published</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/30">
                      <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{aiMetrics.avgEngagement}%</p>
                      <p className="text-xs text-muted-foreground">Avg Engagement</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/30">
                      <Target className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{aiMetrics.learningScore}%</p>
                      <p className="text-xs text-muted-foreground">Learning Score</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/30">
                      <BarChart3 className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{aiMetrics.contentScore}%</p>
                      <p className="text-xs text-muted-foreground">Content Score</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <Bot className="w-10 h-10 text-primary" />
                      <div>
                        <p className="font-semibold">AI Agent Insights</p>
                        <p className="text-sm text-muted-foreground">
                          Your AI agent has learned that posts with questions get 23% more engagement. 
                          Best performing content type: behind-the-scenes stories.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Platform Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-card border-border h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Platform Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {platformData.map((platform) => (
                      <div key={platform.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: platform.color }}
                          />
                          <span className="text-sm">{platform.name}</span>
                        </div>
                        <span className="text-sm font-medium">{platform.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
