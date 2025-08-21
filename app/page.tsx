'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TodoApp from "@/src/components/TodoApp";
import { AuthenticatedLayout } from '@/src/components/AuthenticatedLayout';
import { SubscriptionGate } from '@/src/components/SubscriptionGate';

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect to sign-in
  }

  return (
    <AuthenticatedLayout>
      <SubscriptionGate>
        <TodoApp />
      </SubscriptionGate>
    </AuthenticatedLayout>
  );
}
