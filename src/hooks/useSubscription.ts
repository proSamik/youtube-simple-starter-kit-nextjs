'use client';

import { useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export function useSubscription() {
  const { has, isLoaded } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [hasPro, setHasPro] = useState<boolean>(false);
  const [hasPlus, setHasPlus] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) {
      setIsLoading(true);
      return;
    }

    try {
      // Check if user has either pro or plus plan
      const proAccess = has({ plan: 'pro' });
      const plusAccess = has({ plan: 'plus' });
      
      setHasPro(proAccess);
      setHasPlus(plusAccess);
      setIsSubscribed(proAccess || plusAccess);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setIsSubscribed(false);
      setHasPro(false);
      setHasPlus(false);
    } finally {
      setIsLoading(false);
    }
  }, [has, isLoaded]);

  return {
    isSubscribed,
    isLoading,
    hasPro,
    hasPlus,
  };
}