'use client';

import { useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useSubscription } from '@/src/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  User, 
  Settings,
  CheckSquare,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useUser();
  const { isSubscribed, hasPro, hasPlus, isLoading } = useSubscription();
  const pathname = usePathname();

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      title: 'Todos',
      href: '/',
      icon: CheckSquare,
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: User,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">Todo App</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-left",
                  isActive && "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800",
                  !isActive && "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && item.title}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "h-8 w-8"
              }
            }}
          />
          {!isCollapsed && user && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.fullName || user.emailAddresses[0]?.emailAddress}
                </p>
                {!isLoading && isSubscribed && (
                  <div className="flex items-center space-x-1">
                    <Crown className="h-3 w-3 text-yellow-500" />
                    <span className={cn(
                      "text-xs font-semibold px-1.5 py-0.5 rounded",
                      hasPlus 
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
                        : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    )}>
                      {hasPlus ? "PLUS" : "PRO"}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}