import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/src/lib/db';
import { todos } from '@/src/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

/**
 * GET /api/todos - Retrieve all todos for the authenticated user
 * Returns user's todos sorted by creation date (newest first)
 */
export async function GET() {
  try {
    const { userId, has } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has a subscription
    const hasPro = has({ plan: 'pro' });
    const hasPlus = has({ plan: 'plus' });
    
    if (!hasPro && !hasPlus) {
      return NextResponse.json(
        { error: 'Subscription required. Please upgrade your plan to access todos.' },
        { status: 403 }
      );
    }

    const userTodos = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(desc(todos.createdAt));
      
    return NextResponse.json(userTodos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/todos - Create a new todo for the authenticated user
 * Body: { title: string, description?: string, priority?: 'low' | 'medium' | 'high' }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, has } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has a subscription
    const hasPro = has({ plan: 'pro' });
    const hasPlus = has({ plan: 'plus' });
    
    if (!hasPro && !hasPlus) {
      return NextResponse.json(
        { error: 'Subscription required. Please upgrade your plan to access todos.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, priority = 'medium' } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const newTodo = await db.insert(todos).values({
      title: title.trim(),
      description: description?.trim() || null,
      priority,
      completed: false,
      userId,
    }).returning();

    return NextResponse.json(newTodo[0], { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}
