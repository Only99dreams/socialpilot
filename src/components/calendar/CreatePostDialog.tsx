import { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  Image as ImageIcon,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Loader2,
  Hash
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { generateContent, type BusinessProfile } from '@/lib/api/business-intelligence';
import { cn } from '@/lib/utils';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
}

const platforms = [
  { id: 'instagram', icon: Instagram, label: 'Instagram', color: 'text-pink-400' },
  { id: 'facebook', icon: Facebook, label: 'Facebook', color: 'text-blue-400' },
  { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'text-sky-400' },
  { id: 'twitter', icon: Twitter, label: 'X/Twitter', color: 'text-slate-300' },
];

export function CreatePostDialog({ open, onOpenChange, selectedDate }: CreatePostDialogProps) {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(selectedDate || undefined);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');

  const handleAddHashtag = () => {
    if (hashtagInput && !hashtags.includes(hashtagInput)) {
      setHashtags([...hashtags, hashtagInput.replace('#', '')]);
      setHashtagInput('');
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter(h => h !== tag));
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Mock business profile for demo - in real app, fetch from database
      const mockBusinessProfile: BusinessProfile = {
        industry: 'Technology',
        products: ['SaaS Platform', 'AI Tools'],
        targetAudience: 'Small business owners and marketers',
        brandVoice: {
          tone: 'professional',
          keywords: ['innovation', 'growth', 'efficiency', 'AI-powered'],
          uniqueSellingPoints: ['Save time with AI', 'Boost engagement']
        },
        contentThemes: ['productivity tips', 'industry insights', 'product updates', 'customer success'],
        competitors: [],
        summary: 'A SaaS platform that helps businesses automate their social media marketing with AI.'
      };

      const result = await generateContent({
        businessProfile: mockBusinessProfile,
        platform: selectedPlatform,
        topic: topic || undefined
      });

      if (result.success && result.data) {
        setContent(result.data.content);
        setHashtags(result.data.hashtags || []);
        toast({
          title: 'Content generated!',
          description: 'AI has created content based on your brand profile.',
        });
      } else {
        throw new Error(result.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: 'Content required',
        description: 'Please enter or generate some content.',
        variant: 'destructive',
      });
      return;
    }

    // TODO: Save to database
    toast({
      title: 'Post created!',
      description: scheduledDate 
        ? `Your post is scheduled for ${format(scheduledDate, 'MMM d, yyyy h:mm a')}`
        : 'Your post has been saved as a draft.',
    });
    
    onOpenChange(false);
    setContent('');
    setHashtags([]);
    setTopic('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Platform Selection */}
          <div>
            <Label className="mb-3 block">Platform</Label>
            <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <TabsList className="w-full bg-secondary">
                {platforms.map((platform) => (
                  <TabsTrigger 
                    key={platform.id} 
                    value={platform.id}
                    className="flex-1 gap-2"
                  >
                    <platform.icon className={cn("w-4 h-4", platform.color)} />
                    <span className="hidden sm:inline">{platform.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* AI Generation */}
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">AI Content Generator</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter a topic or leave blank for suggestions..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate
              </Button>
            </div>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content" className="mb-2 block">Content</Label>
            <Textarea
              id="content"
              placeholder="What would you like to share?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-muted-foreground">
                {content.length} / {selectedPlatform === 'twitter' ? 280 : 2200}
              </span>
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <Label className="mb-2 block">Hashtags</Label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Add a hashtag"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={handleAddHashtag}>Add</Button>
            </div>
            <AnimatePresence>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-destructive/20"
                      onClick={() => handleRemoveHashtag(tag)}
                    >
                      #{tag} ×
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>

          {/* Schedule */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="mb-2 block">Schedule</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleSubmit}>
              Save as Draft
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              Schedule Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
