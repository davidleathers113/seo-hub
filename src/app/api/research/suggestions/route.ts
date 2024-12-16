import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST /api/research/suggestions - Generate content suggestions
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

    // Get request body
    const body = await request.json();
    const {
      topic,
      niche,
      target_audience = null,
      content_type = 'article',
      existing_content = [],
      goals = []
    } = body;

    // Validate input
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    if (!niche || typeof niche !== 'string' || niche.trim().length === 0) {
      return NextResponse.json(
        { error: 'Niche is required' },
        { status: 400 }
      );
    }

    // Build prompt for content suggestions
    const prompt = `Generate content suggestions and ideas for:
Topic: "${topic}"
Niche: ${niche}
${target_audience ? `Target Audience: ${target_audience}` : ''}
Content Type: ${content_type}
${goals.length > 0 ? `Content Goals: ${goals.join(', ')}` : ''}
${existing_content.length > 0 ? `Existing Content: ${existing_content.join(', ')}` : ''}

Please provide:
1. Content Ideas (5-8)
   - Title suggestions
   - Main angles/approaches
   - Unique value propositions

2. Content Formats
   - Recommended formats
   - Structure suggestions
   - Multimedia elements

3. Engagement Strategies
   - Hook ideas
   - Engagement points
   - Call-to-action suggestions

4. Content Distribution
   - Platform recommendations
   - Promotion strategies
   - Audience targeting tips

5. Success Metrics
   - KPI suggestions
   - Engagement indicators
   - Conversion opportunities

Format the response as a structured JSON object with these categories.`;

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: new Headers({
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || '',
        'X-Title': 'Content Creation App'
      }),
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
        { error: 'Failed to generate content suggestions' },
        { status: 500 }
      );
    }

    const aiResponse = await response.json();
    let suggestions;
    try {
      // Try to parse the response as JSON
      suggestions = JSON.parse(aiResponse.choices[0].message.content);
    } catch (error) {
      // If parsing fails, return the raw text
      suggestions = {
        raw: aiResponse.choices[0].message.content,
        error: 'Failed to parse AI response as JSON'
      };
    }

    // Store the research results
    const { data: research, error } = await supabase
      .from('research')
      .insert([
        {
          user_id: user.id,
          type: 'suggestions',
          topic,
          niche,
          target_audience,
          content_type,
          goals,
          existing_content,
          results: suggestions,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error storing research results:', error);
      // Continue anyway since we have the results
    }

    return NextResponse.json({
      suggestions,
      research_id: research?.id
    });
  } catch (error) {
    console.error('Error in POST /api/research/suggestions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/research/suggestions - List content suggestions history
export async function GET(request: Request) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const niche = searchParams.get('niche');
    const content_type = searchParams.get('content_type');

    // Build query
    let query = supabase
      .from('research')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'suggestions');

    if (topic) {
      query = query.ilike('topic', `%${topic}%`);
    }
    if (niche) {
      query = query.ilike('niche', `%${niche}%`);
    }
    if (content_type) {
      query = query.eq('content_type', content_type);
    }

    // Execute query
    const { data: research, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching research history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch research history' },
        { status: 500 }
      );
    }

    return NextResponse.json(research);
  } catch (error) {
    console.error('Error in GET /api/research/suggestions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}