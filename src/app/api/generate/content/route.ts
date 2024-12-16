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

    const { articleId, title, description, outline } = await request.json();

    // Generate article content using OpenRouter
    const prompt = `Write a comprehensive article based on:
    Title: ${title}
    Description: ${description}

    Following this outline:
    ${JSON.stringify(outline, null, 2)}

    Requirements:
    1. Write in a professional, engaging style
    2. Include relevant examples and data
    3. Optimize for SEO
    4. Format using markdown
    5. Include a meta description

    Return a JSON object with:
    - content: string (markdown formatted)
    - metaDescription: string
    - estimatedReadTime: number (in minutes)`;

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
        { error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Store content in database
    const { data: storedContent, error: dbError } = await supabase
      .from('articles')
      .update({
        content: content.content,
        meta_description: content.metaDescription,
        estimated_read_time: content.estimatedReadTime,
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', articleId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json(storedContent);
  } catch (error) {
    console.error('Error in POST /api/generate/content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}