'use client';

import { UserProfile } from '@clerk/nextjs';
import { AuthenticatedLayout } from '@/src/components/AuthenticatedLayout';

export default function ProfilePage() {
  return (
    <AuthenticatedLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your account information and preferences.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm">
            <UserProfile 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0",
                  navbar: "hidden",
                  navbarMobileMenuButton: "hidden",
                  headerTitle: "text-2xl font-bold text-gray-900",
                  headerSubtitle: "text-gray-600",
                  formButtonPrimary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white",
                  socialButtonsBlockButton: "bg-white border-gray-200 hover:bg-gray-50 text-gray-900",
                  footerActionLink: "text-blue-600 hover:text-blue-700"
                }
              }}
            />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}