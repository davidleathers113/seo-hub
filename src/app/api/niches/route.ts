import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/niches - List niches for the authenticated user
export async function GET() {
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

    // Fetch niches for the user
    const { data: niches, error } = await supabase
      .from('niches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching niches:', error);
      return NextResponse.json(
        { error: 'Failed to fetch niches' },
        { status: 500 }
      );
    }

    return NextResponse.json(niches);
  } catch (error) {
    console.error('Error in GET /api/niches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/niches - Create a new niche
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
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Create niche
    const { data: niche, error } = await supabase
      .from('niches')
      .insert([
        {
          name: name.trim(),
          user_id: user.id,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating niche:', error);
      return NextResponse.json(
        { error: 'Failed to create niche' },
        { status: 500 }
      );
    }

    return NextResponse.json(niche, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/niches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}