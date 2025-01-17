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

    const { outlineId, outline, title, description, subpillarTitle } = await request.json();

    // Validate outline using OpenRouter
    const prompt = `Review and validate this article outline:
    Title: ${title}
    Description: ${description}
    Part of subpillar: ${subpillarTitle}

    Outline:
    ${JSON.stringify(outline, null, 2)}

    Please analyze the outline for:
    1. Completeness
    2. Logical flow
    3. Coverage of the topic
    4. SEO optimization

    Return a JSON object with:
    - isValid: boolean
    - score: number (0-100)
    - feedback: string
    - suggestedImprovements: string[]`;

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
        { error: 'Failed to validate outline' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const validation = data.choices[0].message.content;

    // Update outline status based on validation
    const { data: updatedOutline, error: dbError } = await supabase
      .from('outlines')
      .update({
        validation_result: validation,
        status: validation.isValid ? 'validated' : 'needs_revision',
        updated_at: new Date().toISOString()
      })
      .eq('id', outlineId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json(updatedOutline);
  } catch (error) {
    console.error('Error in POST /api/generate/outline/validate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}