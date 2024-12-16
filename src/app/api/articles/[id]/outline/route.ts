import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/articles/[id]/outline - Get the outline for an article
export async function GET(
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

    // Fetch article outline
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, title, outline')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching article outline:', error);
      return NextResponse.json(
        { error: 'Failed to fetch outline' },
        { status: 500 }
      );
    }

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: article.id,
      title: article.title,
      outline: article.outline
    });
  } catch (error) {
    console.error('Error in GET /api/articles/[id]/outline:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[id]/outline - Update the outline for an article
export async function PUT(
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

    // Get request body
    const body = await request.json();
    const { outline } = body;

    if (!outline || typeof outline !== 'string') {
      return NextResponse.json(
        { error: 'Outline is required' },
        { status: 400 }
      );
    }

    // Update article outline
    const { data: article, error } = await supabase
      .from('articles')
      .update({
        outline,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select('id, title, outline')
      .single();

    if (error) {
      console.error('Error updating article outline:', error);
      return NextResponse.json(
        { error: 'Failed to update outline' },
        { status: 500 }
      );
    }

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: article.id,
      title: article.title,
      outline: article.outline
    });
  } catch (error) {
    console.error('Error in PUT /api/articles/[id]/outline:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}