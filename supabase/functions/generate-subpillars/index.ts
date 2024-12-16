import { serve } from 'https://deno.fresh.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  pillarId: string;
  title: string;
  description: string;
  niche: string;
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

    const { pillarId, title, description, niche } = await req.json() as RequestBody;

    // Prepare the prompt for the AI model
    const prompt = `Generate a list of subpillars for a content pillar:
Title: ${title}
Description: ${description}
Niche: ${niche}

Please provide:
1. 5-8 subpillars that comprehensively cover this topic
2. Brief description for each subpillar
3. Target audience considerations
4. Key points to cover in each subpillar`;

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
      throw new Error('Failed to generate subpillars with AI');
    }

    const aiResponse = await openRouterResponse.json();
    const generatedContent = aiResponse.choices[0].message.content;

    // Parse the AI response and create subpillars
    const subpillars = generatedContent.split('\n\n')
      .filter(section => section.trim().length > 0)
      .map(section => ({
        pillar_id: pillarId,
        title: section.split('\n')[0].replace(/^\d+\.\s*/, ''),
        description: section.split('\n').slice(1).join('\n'),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

    // Store the generated subpillars in the database
    const { data, error } = await supabaseClient
      .from('subpillars')
      .insert(subpillars)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
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