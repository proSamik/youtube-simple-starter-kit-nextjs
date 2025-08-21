import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/src/lib/db';
import { todos } from '@/src/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Helper function to check subscription
async function checkSubscription() {
  const { userId, has } = await auth();
  
  if (!userId) {
    return { 
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      userId: null 
    };
  }

  const hasPro = has({ plan: 'pro' });
  const hasPlus = has({ plan: 'plus' });
  
  if (!hasPro && !hasPlus) {
    return { 
      error: NextResponse.json(
        { error: 'Subscription required. Please upgrade your plan to access todos.' }, 
        { status: 403 }
      ),
      userId: null 
    };
  }

  return { error: null, userId };
}

/**
 * GET /api/todos/[id] - Retrieve a specific todo by ID for the authenticated user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, userId } = await checkSubscription();
    if (error) return error;

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid todo ID' },
        { status: 400 }
      );
    }

    const todo = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)));
    
    if (todo.length === 0) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(todo[0]);
  } catch (error) {
    console.error('Error fetching todo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todo' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/todos/[id] - Update a specific todo for the authenticated user
 * Body: { title?: string, description?: string, completed?: boolean, priority?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, userId } = await checkSubscription();
    if (error) return error;

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid todo ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, completed, priority } = body;

    // Validate title if provided
    if (title !== undefined && !title?.trim()) {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, string | boolean | Date | null> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (completed !== undefined) updateData.completed = completed;
    if (priority !== undefined) updateData.priority = priority;

    const updatedTodo = await db
      .update(todos)
      .set(updateData)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();

    if (updatedTodo.length === 0) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTodo[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/todos/[id] - Delete a specific todo for the authenticated user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, userId } = await checkSubscription();
    if (error) return error;

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid todo ID' },
        { status: 400 }
      );
    }

    const deletedTodo = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();

    if (deletedTodo.length === 0) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Todo deleted successfully', todo: deletedTodo[0] }
    );
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
