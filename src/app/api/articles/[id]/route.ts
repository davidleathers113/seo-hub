import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/articles/[id] - Get a specific article
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

    // Fetch article with related data
    const { data: article, error } = await supabase
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

    if (error) {
      console.error('Error fetching article:', error);
      return NextResponse.json(
        { error: 'Failed to fetch article' },
        { status: 500 }
      );
    }

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error in GET /api/articles/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[id] - Update an article
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
    const {
      title,
      content,
      status,
      keywords,
      meta_description,
      seo_score = null,
      word_count = null,
      reading_time = null
    } = body;

    // Validate input
    if (title && (typeof title !== 'string' || title.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Invalid title' },
        { status: 400 }
      );
    }

    if (status && !['draft', 'review', 'published', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    if (keywords && !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Keywords must be an array' },
        { status: 400 }
      );
    }

    // Update article
    const updateData: Record<string, any> = {};
    if (title) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content;
    if (status) updateData.status = status;
    if (keywords) updateData.keywords = keywords;
    if (meta_description !== undefined) updateData.meta_description = meta_description;
    if (seo_score !== undefined) updateData.seo_score = seo_score;
    if (word_count !== undefined) updateData.word_count = word_count;
    if (reading_time !== undefined) updateData.reading_time = reading_time;
    updateData.updated_at = new Date().toISOString();

    const { data: article, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
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
      console.error('Error updating article:', error);
      return NextResponse.json(
        { error: 'Failed to update article' },
        { status: 500 }
      );
    }

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error in PUT /api/articles/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id] - Delete an article
export async function DELETE(
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

    // Delete article
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting article:', error);
      return NextResponse.json(
        { error: 'Failed to delete article' },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/articles/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}