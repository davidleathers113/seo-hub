import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST /api/subpillars/[id]/research - Research content for a subpillar
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

    // Get request body
    const { query, includeImages } = await request.json();

    // Call the web-research Edge Function
    const { data: research, error } = await supabase.functions.invoke('web-research', {
      body: {
        query,
        subpillarId: params.id,
        includeImages
      }
    });

    if (error) {
      console.error('Error in web research:', error);
      return NextResponse.json(
        { error: 'Failed to perform web research' },
        { status: 500 }
      );
    }

    return NextResponse.json(research, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/subpillars/[id]/research:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}