import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessProfile, platform, contentType, topic } = await req.json();
    
    if (!businessProfile || !platform) {
      return new Response(
        JSON.stringify({ success: false, error: 'Business profile and platform are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableKey) {
      console.error('Missing LOVABLE_API_KEY');
      return new Response(
        JSON.stringify({ success: false, error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const platformGuidelines: Record<string, string> = {
      instagram: 'Instagram: Visual-first, use emojis, 2200 char limit, 3-5 relevant hashtags at end',
      facebook: 'Facebook: Conversational tone, can be longer, encourage engagement with questions',
      twitter: 'Twitter/X: Concise (280 chars), witty, use 1-2 hashtags max',
      linkedin: 'LinkedIn: Professional tone, industry insights, thought leadership style',
      tiktok: 'TikTok: Trendy, casual, hook in first line, use trending sounds/hashtags references'
    };

    const toneDescriptions: Record<string, string> = {
      professional: 'authoritative, polished, and business-focused',
      friendly: 'warm, approachable, and conversational',
      luxury: 'sophisticated, exclusive, and premium',
      playful: 'fun, energetic, and light-hearted',
      bold: 'confident, daring, and attention-grabbing',
      minimal: 'clean, concise, and understated'
    };

    const tone = businessProfile.brandVoice?.tone || 'professional';
    const keywords = businessProfile.brandVoice?.keywords?.join(', ') || '';
    const products = businessProfile.products?.join(', ') || '';
    const themes = businessProfile.contentThemes?.join(', ') || '';

    console.log('Generating content for:', platform, 'Topic:', topic || 'general');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are a social media content expert. Generate engaging ${platform} content for a business.

Brand Voice: ${toneDescriptions[tone] || 'professional'}
Platform Guidelines: ${platformGuidelines[platform] || 'Standard social media best practices'}

Business Context:
- Industry: ${businessProfile.industry || 'Unknown'}
- Products/Services: ${products}
- Target Audience: ${businessProfile.targetAudience || 'General'}
- Brand Keywords: ${keywords}
- Content Themes: ${themes}
- Business Summary: ${businessProfile.summary || ''}

Generate content that:
1. Matches the brand voice exactly
2. Is optimized for ${platform}
3. Drives engagement (likes, comments, shares)
4. Includes a clear call-to-action when appropriate
5. Uses relevant hashtags for discoverability`
          },
          {
            role: 'user',
            content: topic 
              ? `Create a ${platform} post about: ${topic}. Content type: ${contentType || 'general post'}`
              : `Create an engaging ${platform} post. Content type: ${contentType || 'general post'}. Pick from these themes: ${themes}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_social_post',
              description: 'Generate a social media post with content and hashtags',
              parameters: {
                type: 'object',
                properties: {
                  content: { 
                    type: 'string',
                    description: 'The main post content without hashtags'
                  },
                  hashtags: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'Array of relevant hashtags without # symbol'
                  },
                  imagePrompt: {
                    type: 'string',
                    description: 'A prompt for generating an accompanying image'
                  },
                  bestTimeToPost: {
                    type: 'string',
                    description: 'Suggested best time to post (e.g., "Tuesday 10am" or "Weekday mornings")'
                  }
                },
                required: ['content', 'hashtags']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_social_post' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits exhausted. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Content generation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let post;
    if (toolCall?.function?.arguments) {
      post = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback to parsing content
      const content = data.choices?.[0]?.message?.content || '';
      post = {
        content,
        hashtags: [],
        imagePrompt: '',
        bestTimeToPost: 'Weekday mornings'
      };
    }

    console.log('Content generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          ...post,
          platform,
          generatedAt: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating content:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
