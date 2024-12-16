import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/pillars/[id]/subpillars - List subpillars for a pillar
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

    // Verify pillar exists and belongs to user
    const { data: pillar, error: pillarError } = await supabase
      .from('pillars')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (pillarError || !pillar) {
      return NextResponse.json(
        { error: 'Pillar not found' },
        { status: 404 }
      );
    }

    // Fetch subpillars
    const { data: subpillars, error } = await supabase
      .from('subpillars')
      .select('*')
      .eq('pillar_id', params.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subpillars:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subpillars' },
        { status: 500 }
      );
    }

    return NextResponse.json(subpillars);
  } catch (error) {
    console.error('Error in GET /api/pillars/[id]/subpillars:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/pillars/[id]/subpillars - Create a new subpillar
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

    // Verify pillar exists and belongs to user
    const { data: pillar, error: pillarError } = await supabase
      .from('pillars')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (pillarError || !pillar) {
      return NextResponse.json(
        { error: 'Pillar not found' },
        { status: 404 }
      );
    }

    // Get request body
    const body = await request.json();
    const { title } = body;

    // Validate input
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create subpillar
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
      return NextResponse.json(
        { error: 'Failed to create subpillar' },
        { status: 500 }
      );
    }

    return NextResponse.json(subpillar, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/pillars/[id]/subpillars:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}