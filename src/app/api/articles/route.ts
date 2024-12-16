import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/articles - List articles for the authenticated user
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
    const subpillarId = searchParams.get('subpillar_id');
    const status = searchParams.get('status');

    // Build query
    let query = supabase
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
      .eq('user_id', user.id);

    // Apply filters
    if (subpillarId) {
      query = query.eq('subpillar_id', subpillarId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Execute query
    const { data: articles, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch articles' },
        { status: 500 }
      );
    }

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error in GET /api/articles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/articles - Create a new article
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
    const { title, subpillar_id, content = null, keywords = [], meta_description = null } = body;

    // Validate input
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!subpillar_id) {
      return NextResponse.json(
        { error: 'Subpillar ID is required' },
        { status: 400 }
      );
    }

    // Verify subpillar exists and belongs to user
    const { data: subpillar, error: subpillarError } = await supabase
      .from('subpillars')
      .select('id')
      .eq('id', subpillar_id)
      .eq('user_id', user.id)
      .single();

    if (subpillarError || !subpillar) {
      return NextResponse.json(
        { error: 'Invalid subpillar ID' },
        { status: 400 }
      );
    }

    // Create article
    const { data: article, error } = await supabase
      .from('articles')
      .insert([
        {
          title: title.trim(),
          subpillar_id,
          user_id: user.id,
          content,
          keywords,
          meta_description,
          status: 'draft'
        }
      ])
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
      .single();

    if (error) {
      console.error('Error creating article:', error);
      return NextResponse.json(
        { error: 'Failed to create article' },
        { status: 500 }
      );
    }

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/articles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}