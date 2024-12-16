import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST /api/articles/[id]/outline/generate - Generate an outline for an article
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch article with related data
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select(`
        *,
        subpillars (
          title,
          pillars (
            title,
            niches (
              name
            )
          )
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (articleError || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Get request body for any additional context
    const body = await request.json();
    const { keywords = [], target_word_count = 2000 } = body;

    // Build context for the AI
    const context = {
      title: article.title,
      niche: article.subpillars.pillars.niches.name,
      pillar: article.subpillars.pillars.title,
      subpillar: article.subpillars.title,
      keywords: keywords.length > 0 ? keywords : article.keywords || [],
      target_word_count
    };

    // Generate outline using OpenRouter
    const prompt = `Create a detailed article outline for:
Title: "${context.title}"
Niche: ${context.niche}
Content Pillar: ${context.pillar}
Subpillar: ${context.subpillar}
Target Word Count: ${context.target_word_count} words
Keywords: ${context.keywords.join(', ')}

The outline should include:
1. Introduction
2. Main sections with subpoints
3. Conclusion
4. Estimated word count for each section

Format the outline with clear hierarchy using numbers and letters.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
        'X-Title': 'Content Creation App'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-2',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', await response.text());
      return NextResponse.json(
        { error: 'Failed to generate outline' },
        { status: 500 }
      );
    }

    const aiResponse = await response.json();
    const outline = aiResponse.choices[0].message.content;

    // Update article with the generated outline
    const { data: updatedArticle, error: updateError } = await supabase
      .from('articles')
      .update({
        outline,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating article with outline:', updateError);
      return NextResponse.json(
        { error: 'Failed to save outline' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      outline,
      article: updatedArticle
    });
  } catch (error) {
    console.error('Error in POST /api/articles/[id]/outline/generate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}