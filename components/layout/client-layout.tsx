
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield, LogOut, UserCircle, FileText, CalendarDays, DollarSign, Settings, Menu, ChevronDown
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';


interface ClientNavItem {
  name: string;
  icon: LucideIcon;
  href: string;
}

const clientNavItems: ClientNavItem[] = [
  { name: 'My Documents', icon: FileText, href: '/client/documents' },
  { name: 'My Calendar', icon: CalendarDays, href: '/client/calendar' },
  { name: 'My Assets', icon: DollarSign, href: '/client/assets' },
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());


  useEffect(() => {
    if (!isLoading && (!user || user.type !== 'client')) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.type !== 'client') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const NavLinks = ({isSheet = false}: {isSheet?: boolean}) => (
    <nav className={cn(
        "space-y-1.5",
        isSheet ? "flex flex-col p-4" : "hidden md:block w-full md:w-60 p-4 md:border-r md:border-primary/20 bg-primary/5 md:bg-transparent"
    )}>
      {clientNavItems.map(item => (
        <Button
          key={item.name}
          variant={pathname === item.href ? "default" : "ghost"}
          className="w-full justify-start space-x-3 py-3 h-auto text-base"
          onClick={() => {
            router.push(item.href);
            if(isSheet) setIsSheetOpen(false);
          }}
          asChild={!isSheet}
        >
          {isSheet ? (
             <>
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", pathname === item.href ? "text-primary-foreground" : "text-primary/80 group-hover:text-primary")} />
                <span>{item.name}</span>
             </>
          ) : (
            <Link href={item.href} className="flex items-center space-x-3">
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", pathname === item.href ? "text-primary-foreground" : "text-primary/80 group-hover:text-primary")} />
                <span>{item.name}</span>
            </Link>
          )}
        </Button>
      ))}
    </nav>
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-600 via-sky-700 to-gray-800 text-white selection:bg-sky-200 selection:text-sky-900">
      <header className="bg-white/10 backdrop-blur-md shadow-lg p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="text-2xl font-bold flex items-center">
          <Link href="/client/documents" className="flex items-center">
            <Shield className="w-8 h-8 mr-3 text-sky-300" /> Client Portal
          </Link>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 focus-visible:ring-0 focus-visible:ring-offset-0 p-1 sm:p-2 rounded-full sm:rounded-md text-white hover:bg-white/20">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                  <AvatarImage src={`https://picsum.photos/seed/${user?.email}/40/40`} alt={user?.name || "User"} data-ai-hint="professional avatar" />
                  <AvatarFallback className="bg-sky-500 text-white">{user?.name ? getInitials(user.name) : <UserCircle />}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline">{user?.name}</span>
                <ChevronDown className="w-4 h-4 text-white/80 transition-transform group-hover:rotate-180 hidden md:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card text-card-foreground" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/client/settings')}>
                <UserCircle className="w-4 h-4 mr-2 text-muted-foreground" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/client/settings')}>
                <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] p-0 pt-10 bg-primary/10 backdrop-blur-lg border-primary/20 text-white flex flex-col">
                <NavLinks isSheet={true} />
                 <div className="p-4 mt-auto border-t border-white/20 space-y-2">
                    <Button
                      variant={pathname === '/client/settings' ? "default" : "ghost"}
                      className="w-full justify-start space-x-3 py-3 h-auto text-base"
                      onClick={() => {
                          router.push('/client/settings');
                          setIsSheetOpen(false);
                      }}
                    >
                      <Settings className={cn("w-5 h-5 transition-transform group-hover:scale-110", pathname === '/client/settings' ? "text-primary-foreground" : "text-white/80 group-hover:text-white")} />
                      <span>Account Settings</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start space-x-3 py-3 h-auto text-base text-red-400 hover:bg-red-500/20 hover:text-red-300"
                      onClick={() => {
                          logout();
                          setIsSheetOpen(false);
                      }}
                    >
                      <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
                      <span>Sign Out</span>
                    </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        <NavLinks />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      <footer className="text-center p-6 text-sm text-gray-300 border-t border-white/20 mt-8">
        
          {`© ${currentYear} EstateFlow Client Portal. All information is confidential and securely managed.`}
        
      </footer>
    </div>
  );
}

