import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// GET /api/workspace - Get user's primary workspace
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

    // Get user's primary workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        creator: {
          email: user.email
        },
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        slug: true,
        workspaceCode: true,
        members: {
          select: {
            email: true,
            teamRole: true,
            status: true
          }
        }
      }
    });

    if (!workspace) {
      return NextResponse.json({ workspace: null });
    }

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error('Error in GET /api/workspace:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/workspace - Create a new workspace
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
    const { name, slug } = await request.json();

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const existingWorkspace = await prisma.workspace.findFirst({
      where: {
        slug: slug.trim(),
        deletedAt: null
      }
    });

    if (existingWorkspace) {
      return NextResponse.json(
        { error: 'Slug is already taken' },
        { status: 400 }
      );
    }

    // Create workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        creator: {
          connect: {
            email: user.email
          }
        },
        members: {
          create: {
            email: user.email!,
            inviter: user.email!,
            status: 'ACCEPTED',
            teamRole: 'OWNER',
            joinedAt: new Date()
          }
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        workspaceCode: true,
        members: {
          select: {
            email: true,
            teamRole: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/workspace:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
