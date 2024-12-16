import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/niches/[id] - Get a specific niche
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

    // Fetch niche
    const { data: niche, error } = await supabase
      .from('niches')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching niche:', error);
      return NextResponse.json(
        { error: 'Failed to fetch niche' },
        { status: 500 }
      );
    }

    if (!niche) {
      return NextResponse.json(
        { error: 'Niche not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(niche);
  } catch (error) {
    console.error('Error in GET /api/niches/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/niches/[id] - Update a niche
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
    const { name, status, progress } = body;

    // Validate input
    if (name && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Invalid name' },
        { status: 400 }
      );
    }

    if (status && !['active', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update niche
    const updateData: Record<string, any> = {};
    if (name) updateData.name = name.trim();
    if (status) updateData.status = status;
    if (typeof progress === 'number') updateData.progress = progress;

    const { data: niche, error } = await supabase
      .from('niches')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating niche:', error);
      return NextResponse.json(
        { error: 'Failed to update niche' },
        { status: 500 }
      );
    }

    if (!niche) {
      return NextResponse.json(
        { error: 'Niche not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(niche);
  } catch (error) {
    console.error('Error in PUT /api/niches/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/niches/[id] - Delete a niche
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

    // Delete niche
    const { error } = await supabase
      .from('niches')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting niche:', error);
      return NextResponse.json(
        { error: 'Failed to delete niche' },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/niches/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}