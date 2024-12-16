import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/pillars/[id] - Get a specific pillar
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

    // Fetch pillar with niche data
    const { data: pillar, error } = await supabase
      .from('pillars')
      .select('*, niches(name)')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching pillar:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pillar' },
        { status: 500 }
      );
    }

    if (!pillar) {
      return NextResponse.json(
        { error: 'Pillar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pillar);
  } catch (error) {
    console.error('Error in GET /api/pillars/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/pillars/[id] - Update a pillar
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
    const { title, status, description, content } = body;

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

    // Update pillar
    const updateData: Record<string, any> = {};
    if (title) updateData.title = title.trim();
    if (status) updateData.status = status;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;

    const { data: pillar, error } = await supabase
      .from('pillars')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select('*, niches(name)')
      .single();

    if (error) {
      console.error('Error updating pillar:', error);
      return NextResponse.json(
        { error: 'Failed to update pillar' },
        { status: 500 }
      );
    }

    if (!pillar) {
      return NextResponse.json(
        { error: 'Pillar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pillar);
  } catch (error) {
    console.error('Error in PUT /api/pillars/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/pillars/[id] - Delete a pillar
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

    // Delete pillar
    const { error } = await supabase
      .from('pillars')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting pillar:', error);
      return NextResponse.json(
        { error: 'Failed to delete pillar' },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/pillars/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}