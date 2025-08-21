'use client';

import { useSubscription } from '@/src/hooks/useSubscription';
import { SubscriptionModal } from './SubscriptionModal';
import { useState } from 'react';

interface SubscriptionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SubscriptionGate({ children, fallback }: SubscriptionGateProps) {
  const { isSubscribed, isLoading } = useSubscription();
  const [showModal, setShowModal] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // Show subscription modal if not subscribed
  if (!isSubscribed) {
    return (
      <>
        {fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md mx-auto p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Subscription Required
              </h2>
              <p className="text-gray-600 mb-6">
                You need an active subscription to access this feature.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View Plans
              </button>
            </div>
          </div>
        )}
        <SubscriptionModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
        />
      </>
    );
  }

  // User is subscribed, show the protected content
  return <>{children}</>;
}