'use client';

import { useUser } from '@clerk/nextjs';
import { AuthenticatedLayout } from '@/src/components/AuthenticatedLayout';
import { SubscriptionGate } from '@/src/components/SubscriptionGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Todo } from '@/src/lib/db/schema';

export default function DashboardPage() {
  const { user } = useUser();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch('/api/todos');
        if (response.ok) {
          const data = await response.json();
          setTodos(data);
        }
      } catch (error) {
        console.error('Error fetching todos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const stats = {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    pending: todos.filter(todo => !todo.completed).length,
    highPriority: todos.filter(todo => todo.priority === 'high' && !todo.completed).length,
  };

  return (
    <AuthenticatedLayout>
      <SubscriptionGate>
        <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here&apos;s an overview of your todo progress and activity.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Todos</CardTitle>
                <CheckSquare className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.total}</div>
                <p className="text-xs text-gray-600">
                  All your tasks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? '...' : stats.completed}
                </div>
                <p className="text-xs text-gray-600">
                  {loading ? '' : `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {loading ? '...' : stats.pending}
                </div>
                <p className="text-xs text-gray-600">
                  Tasks to complete
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {loading ? '...' : stats.highPriority}
                </div>
                <p className="text-xs text-gray-600">
                  Urgent tasks
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Todos */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Todos</CardTitle>
              <CardDescription>
                Your latest tasks and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : todos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No todos yet. Create your first todo to get started!
                </div>
              ) : (
                <div className="space-y-4">
                  {todos.slice(0, 5).map((todo) => (
                    <div key={todo.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        todo.completed 
                          ? 'bg-green-500' 
                          : todo.priority === 'high' 
                            ? 'bg-red-500' 
                            : todo.priority === 'medium' 
                              ? 'bg-orange-500' 
                              : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <h4 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {todo.title}
                        </h4>
                        {todo.description && (
                          <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {todo.priority}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      </SubscriptionGate>
    </AuthenticatedLayout>
  );
}