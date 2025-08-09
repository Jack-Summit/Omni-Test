
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.type === 'firmUser') { // Corrected from 'attorney' to 'firmUser'
          router.replace('/attorney/dashboard');
        } else if (user.type === 'client') {
          router.replace('/client/dashboard');
        } else {
          // Fallback if user type is unknown, though ideally this shouldn't happen
          router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  // Display loading indicator while AuthContext is resolving the user state
  // or while redirection is in progress.
  if (isLoading || (!isLoading && !user)) { // Show loading if still loading or if user is null (about to redirect to login)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Omni...</p>
      </div>
    );
  }
  
  // If user is loaded and about to be redirected to their dashboard,
  // this also acts as a brief loading/transition state.
  return (
     <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Redirecting...</p>
      </div>
  );
}
