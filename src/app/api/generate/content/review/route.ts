import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
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

    const { articleId, content, title, outline } = await request.json();

    // Review content using OpenRouter
    const prompt = `Review this article content:
    Title: ${title}

    Original Outline:
    ${JSON.stringify(outline, null, 2)}

    Content:
    ${content}

    Please analyze for:
    1. Adherence to outline
    2. Content quality and accuracy
    3. SEO optimization
    4. Grammar and style
    5. Readability

    Return a JSON object with:
    - isApproved: boolean
    - score: number (0-100)
    - feedback: string
    - suggestedImprovements: string[]
    - seoScore: number (0-100)
    - readabilityScore: number (0-100)`;

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
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', await response.text());
      return NextResponse.json(
        { error: 'Failed to review content' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const review = data.choices[0].message.content;

    // Update article with review results
    const { data: updatedArticle, error: dbError } = await supabase
      .from('articles')
      .update({
        review_result: review,
        status: review.isApproved ? 'approved' : 'needs_revision',
        seo_score: review.seoScore,
        readability_score: review.readabilityScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', articleId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Error in POST /api/generate/content/review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}