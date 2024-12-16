import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { ContentSuggestionsRequestBody, RequestWithBody } from '../types.ts';

serve(async (req: RequestWithBody<ContentSuggestionsRequestBody>) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { niche, keywords, competitors } = await req.json();

    // Prepare the prompt for the AI model
    const prompt = `Generate content suggestions for the ${niche} niche based on:
Keywords: ${keywords.join(', ')}
Competitor URLs: ${competitors.join(', ')}

Please provide:
1. Content pillar ideas (3-5 main topics)
2. Subpillar suggestions for each pillar (3-4 per pillar)
3. Article ideas for each subpillar (2-3 per subpillar)
4. Content formats to consider
5. Unique angles and perspectives
6. Target audience segments
7. Content differentiation strategy
8. Content distribution channels`;

    // Call OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-2',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!openRouterResponse.ok) {
      throw new Error('Failed to generate content suggestions with AI');
    }

    const aiResponse = await openRouterResponse.json();
    const suggestions = aiResponse.choices[0].message.content;

    // Store the content suggestions
    const { data: research, error } = await supabaseClient
      .from('content_suggestions')
      .insert({
        niche,
        keywords,
        competitors,
        suggestions,
        status: 'completed',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ data: research }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});