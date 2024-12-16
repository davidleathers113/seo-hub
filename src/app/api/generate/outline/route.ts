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

    const { articleId, title, description, subpillarTitle } = await request.json();

    // Generate outline using OpenRouter
    const prompt = `Generate a detailed article outline for:
    Title: ${title}
    Description: ${description}
    Part of subpillar: ${subpillarTitle}

    The outline should include:
    1. Introduction
    2. 3-5 main sections with subsections
    3. Conclusion

    Format the response as a JSON object with sections and subsections.`;

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
        { error: 'Failed to generate outline' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const outline = data.choices[0].message.content;

    // Store outline in database
    const { data: storedOutline, error: dbError } = await supabase
      .from('outlines')
      .insert([
        {
          article_id: articleId,
          content: outline,
          status: 'draft',
          user_id: user.id
        }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json(storedOutline);
  } catch (error) {
    console.error('Error in POST /api/generate/outline:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}