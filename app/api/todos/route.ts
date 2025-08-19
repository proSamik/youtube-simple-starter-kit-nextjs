import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { todos } from '@/src/lib/db/schema';
import { desc } from 'drizzle-orm';

/**
 * GET /api/todos - Retrieve all todos
 * Returns todos sorted by creation date (newest first)
 */
export async function GET() {
  try {
    const allTodos = await db.select().from(todos).orderBy(desc(todos.createdAt));
    return NextResponse.json(allTodos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/todos - Create a new todo
 * Body: { title: string, description?: string, priority?: 'low' | 'medium' | 'high' }
 */
export async function POST(request: NextRequest) {
  try {
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
