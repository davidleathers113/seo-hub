import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/subpillars/[id] - Get a specific subpillar
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

    // Fetch subpillar with pillar data
    const { data: subpillar, error } = await supabase
      .from('subpillars')
      .select('*, pillars(title)')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching subpillar:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subpillar' },
        { status: 500 }
      );
    }

    if (!subpillar) {
      return NextResponse.json(
        { error: 'Subpillar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subpillar);
  } catch (error) {
    console.error('Error in GET /api/subpillars/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/subpillars/[id] - Update a subpillar
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
    const { title, status, content } = body;

    // Validate input
    if (title && (typeof title !== 'string' || title.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Invalid title' },
        { status: 400 }
      );
    }

    if (status && !['draft', 'active', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update subpillar
    const updateData: Record<string, any> = {};
    if (title) updateData.title = title.trim();
    if (status) updateData.status = status;
    if (content !== undefined) updateData.content = content;

    const { data: subpillar, error } = await supabase
      .from('subpillars')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select('*, pillars(title)')
      .single();

    if (error) {
      console.error('Error updating subpillar:', error);
      return NextResponse.json(
        { error: 'Failed to update subpillar' },
        { status: 500 }
      );
    }

    if (!subpillar) {
      return NextResponse.json(
        { error: 'Subpillar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subpillar);
  } catch (error) {
    console.error('Error in PUT /api/subpillars/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/subpillars/[id] - Delete a subpillar
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

    // Delete subpillar
    const { error } = await supabase
      .from('subpillars')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting subpillar:', error);
      return NextResponse.json(
        { error: 'Failed to delete subpillar' },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/subpillars/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}