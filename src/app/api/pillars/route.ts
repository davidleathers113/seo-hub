import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/pillars - List pillars for the authenticated user
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
    const nicheId = searchParams.get('niche_id');

    // Build query
    let query = supabase
      .from('pillars')
      .select('*, niches(name)')
      .eq('user_id', user.id);

    // Filter by niche if provided
    if (nicheId) {
      query = query.eq('niche_id', nicheId);
    }

    // Execute query
    const { data: pillars, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pillars:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pillars' },
        { status: 500 }
      );
    }

    return NextResponse.json(pillars);
  } catch (error) {
    console.error('Error in GET /api/pillars:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/pillars - Create a new pillar
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
    const { title, niche_id, description = null } = body;

    // Validate input
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!niche_id) {
      return NextResponse.json(
        { error: 'Niche ID is required' },
        { status: 400 }
      );
    }

    // Verify niche exists and belongs to user
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('id')
      .eq('id', niche_id)
      .eq('user_id', user.id)
      .single();

    if (nicheError || !niche) {
      return NextResponse.json(
        { error: 'Invalid niche ID' },
        { status: 400 }
      );
    }

    // Create pillar
    const { data: pillar, error } = await supabase
      .from('pillars')
      .insert([
        {
          title: title.trim(),
          niche_id,
          user_id: user.id,
          description,
          status: 'draft'
        }
      ])
      .select('*, niches(name)')
      .single();

    if (error) {
      console.error('Error creating pillar:', error);
      return NextResponse.json(
        { error: 'Failed to create pillar' },
        { status: 500 }
      );
    }

    return NextResponse.json(pillar, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/pillars:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}