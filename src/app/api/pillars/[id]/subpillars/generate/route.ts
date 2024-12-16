import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST /api/pillars/[id]/subpillars/generate - Generate subpillars for a pillar
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

    // Fetch pillar
    const { data: pillar, error: pillarError } = await supabase
      .from('pillars')
      .select('title, status')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (pillarError || !pillar) {
      return NextResponse.json(
        { error: 'Pillar not found' },
        { status: 404 }
      );
    }

    if (pillar.status !== 'active') {
      return NextResponse.json(
        { error: 'Can only generate subpillars for active pillars' },
        { status: 400 }
      );
    }

    // Generate subpillars using OpenRouter
    const prompt = `Generate 3 detailed subpillars for the content pillar: "${pillar.title}".`;
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
        { error: 'Failed to generate subpillars' },
        { status: 500 }
      );
    }

    const aiResponse = await response.json();
    const subpillarTitles = aiResponse.choices[0].message.content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.match(/^\\d+\\./))
      .map(line => line.replace(/^\\d+\\.\\s*/, ''));

    // Create subpillars
    const subpillars = await Promise.all(
      subpillarTitles.map(async (title) => {
        const { data: subpillar, error } = await supabase
          .from('subpillars')
          .insert([
            {
              title: title.trim(),
              pillar_id: params.id,
              user_id: user.id,
              status: 'draft'
            }
          ])
          .select()
          .single();

        if (error) {
          console.error('Error creating subpillar:', error);
          throw error;
        }

        return subpillar;
      })
    );

    return NextResponse.json(subpillars, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/pillars/[id]/subpillars/generate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}