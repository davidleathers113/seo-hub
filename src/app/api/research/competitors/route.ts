import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST /api/research/competitors - Generate competitor analysis
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
      competitors = [],
      target_audience = null,
      content_type = 'article'
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

    // Build prompt for competitor analysis
    const prompt = `Analyze content strategy and provide recommendations for:
Topic: "${topic}"
Niche: ${niche}
${target_audience ? `Target Audience: ${target_audience}` : ''}
Content Type: ${content_type}
${competitors.length > 0 ? `Competitors to analyze: ${competitors.join(', ')}` : ''}

Please provide:
1. Content Gap Analysis
   - Identify underserved subtopics
   - Highlight unique angles
   - Suggest content opportunities

2. Content Structure Analysis
   - Common content formats
   - Typical content length
   - Content organization patterns

3. Engagement Factors
   - Key value propositions
   - Engagement techniques
   - User experience elements

4. Differentiation Opportunities
   - Unique selling points
   - Content innovation ideas
   - Competitive advantages

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
        { error: 'Failed to generate competitor analysis' },
        { status: 500 }
      );
    }

    const aiResponse = await response.json();
    let analysis;
    try {
      // Try to parse the response as JSON
      analysis = JSON.parse(aiResponse.choices[0].message.content);
    } catch (error) {
      // If parsing fails, return the raw text
      analysis = {
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
          type: 'competitors',
          topic,
          niche,
          target_audience,
          competitors,
          content_type,
          results: analysis,
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
      analysis,
      research_id: research?.id
    });
  } catch (error) {
    console.error('Error in POST /api/research/competitors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/research/competitors - List competitor analysis history
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

    // Build query
    let query = supabase
      .from('research')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'competitors');

    if (topic) {
      query = query.ilike('topic', `%${topic}%`);
    }
    if (niche) {
      query = query.ilike('niche', `%${niche}%`);
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
    console.error('Error in GET /api/research/competitors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}