import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { KeywordResearchRequestBody, RequestWithBody } from '../types.ts';

serve(async (req: RequestWithBody<KeywordResearchRequestBody>) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { query, niche } = await req.json();

    // Prepare the prompt for the AI model
    const prompt = `Generate a comprehensive list of keyword ideas for:
Query: ${query}
Niche: ${niche}

Please provide:
1. Primary keywords (3-5 main topics)
2. Long-tail variations (8-10 specific phrases)
3. Related questions (5-7 common questions)
4. Search intent analysis for each keyword
5. Estimated competition level (low/medium/high)`;

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
      throw new Error('Failed to generate keyword research with AI');
    }

    const aiResponse = await openRouterResponse.json();
    const generatedKeywords = aiResponse.choices[0].message.content;

    // Store the keyword research results
    const { data: research, error } = await supabaseClient
      .from('keyword_research')
      .insert({
        query,
        niche,
        results: generatedKeywords,
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