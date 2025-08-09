
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Infinity as AppLogoIcon, LogIn, AlertCircle } from 'lucide-react'; // Changed Briefcase to AppLogoIcon (Infinity)
import type { UserRole } from '@/lib/types'; 
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { user, isLoading: isAuthLoading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserRole>('firmUser'); 
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.type === 'firmUser') {
        router.replace('/attorney/dashboard');
      } else if (user.type === 'client') {
        router.replace('/client/dashboard');
      }
    }
  }, [user, isAuthLoading, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!email || !password) {
      setError('Please enter email and password.');
      setIsSubmitting(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 500)); 

    if (userType === 'firmUser' && email === "attorney@example.com" && password === "password") {
      login('firmUser', 'Demo Attorney', email, 'firm1', 'Admin'); 
    } else if (userType === 'client' && email === "client@example.com" && password === "password") {
      login('client', 'Demo Client', email); 
    } else {
      setError('Invalid credentials. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-gray-900 flex flex-col justify-center items-center p-4 selection:bg-accent/30 selection:text-accent-foreground">
      <Card className="w-full max-w-md shadow-2xl transform transition-all duration-500 ease-in-out">
        <CardHeader className="text-center">
          <AppLogoIcon className="w-16 h-16 text-primary mx-auto mb-4" /> {/* Changed Briefcase to AppLogoIcon */}
          <CardTitle className="text-3xl font-bold">Omni</CardTitle>
          <CardDescription className="mt-1">Securely Manage Your Estate Planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex border border-input rounded-lg p-1 bg-muted/50">
              <Button
                onClick={() => { setUserType('firmUser'); setError(''); }}
                variant={userType === 'firmUser' ? 'default' : 'ghost'}
                className={`w-1/2 ${userType === 'firmUser' ? 'shadow-md' : ''}`}
              >
                Attorney Login
              </Button>
              <Button
                onClick={() => { setUserType('client'); setError(''); }}
                variant={userType === 'client' ? 'default' : 'ghost'}
                className={`w-1/2 ${userType === 'client' ? 'shadow-md' : ''}`}
              >
                Client Portal
              </Button>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                autoComplete="email"
                disabled={isSubmitting || isAuthLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                autoComplete="current-password"
                disabled={isSubmitting || isAuthLoading}
              />
            </div>
            {error && (
              <div className="flex items-center text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}
            <div>
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || isAuthLoading}>
                <LogIn className="mr-2 h-5 w-5" /> {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-center text-foreground pt-6">
          <p className="text-center">
            Hint: attorney@example.com / password OR client@example.com / password
          </p>
         
            {currentYear && (
              <p className="text-center mt-2">
                &copy; {currentYear} Omni. All rights reserved.
              </p>
            )}
         
        </CardFooter>
      </Card>
    </div>
  );
}
