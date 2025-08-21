'use client';

import { useState, useEffect } from 'react';
import { PricingTable } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            Choose Your Plan
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-0 top-0 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="mt-6">
          <p className="text-center text-gray-600 mb-6">
            Unlock premium features with a subscription plan
          </p>
          <PricingTable />
        </div>
      </DialogContent>
    </Dialog>
  );
}