import { serve } from 'https://deno.fresh.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  articleId: string;
  title: string;
  description: string;
  keywords: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { articleId, title, description, keywords } = await req.json() as RequestBody;

    // Prepare the prompt for the AI model
    const prompt = `Generate a detailed article outline for:
Title: ${title}
Description: ${description}
Keywords: ${keywords.join(', ')}

Please provide a structured outline with:
1. Introduction
2. Main sections (3-5)
3. Subsections for each main section
4. Conclusion
5. Key takeaways`;

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
      throw new Error('Failed to generate outline with AI');
    }

    const aiResponse = await openRouterResponse.json();
    const generatedOutline = aiResponse.choices[0].message.content;

    // Store the generated outline in the database
    const { data: outline, error } = await supabaseClient
      .from('outlines')
      .upsert({
        article_id: articleId,
        content: generatedOutline,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify(outline),
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