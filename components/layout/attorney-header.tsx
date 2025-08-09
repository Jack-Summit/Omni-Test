
"use client";

import React, { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Bell, UserCircle, Settings, LogOut, ChevronDown, TimerIcon, Play, Square } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TimekeeperPopover } from '@/components/shared/timekeeper-popover';
import { toast } from "@/hooks/use-toast";
import Link from 'next/link'; 
import { useRouter } from 'next/navigation'; 

interface AttorneyHeaderProps {
  title: string;
  pageIcon?: LucideIcon | null;
}

export function AttorneyHeader({ title, pageIcon: PageIcon }: AttorneyHeaderProps) {
  const { 
    user, logout, 
    isGlobalTimerRunning, globalElapsedSeconds, formatTimer, 
    startGlobalTimer, stopGlobalTimerAndLog,
    globalTimerClient, 
    globalTimerMatter, 
  } = useAuth();
  const router = useRouter(); 

  const handleTimerToggle = useCallback(() => {
    if (isGlobalTimerRunning) {
      stopGlobalTimerAndLog();
    } else {
      if (globalTimerClient && globalTimerMatter) {
        startGlobalTimer(globalTimerClient, globalTimerMatter);
      } else {
        toast({ 
            title: "Select Client/Matter", 
            description: "Please use the Timekeeper (clock icon) to select a client and matter before starting the timer.", 
            variant: "default", 
            duration: 6000 
        });
      }
    }
  }, [isGlobalTimerRunning, stopGlobalTimerAndLog, globalTimerClient, globalTimerMatter, startGlobalTimer]);
  
  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <header className="bg-card shadow-md p-4 flex justify-between items-center sticky top-0 z-40 border-b">
      <div className="flex items-center gap-2">
        {PageIcon && <PageIcon className="mr-1 h-7 w-7 text-primary" />}
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Global Search..."
                className="pl-8 h-9 w-40 sm:w-64" 
            />
        </div>

        <div className="flex items-center space-x-1 p-1.5 border rounded-md bg-muted/50">
          <Button onClick={handleTimerToggle} variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10">
            {isGlobalTimerRunning ? <Square className="h-4 w-4 text-red-600" /> : <Play className="h-4 w-4 text-green-600" />}
          </Button>
          <span className="font-mono text-sm text-foreground min-w-[70px] text-center">{formatTimer(globalElapsedSeconds)}</span>
          <TimekeeperPopover
             triggerButton={
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10">
                    <TimerIcon className="w-4 h-4 text-primary" />
                    <span className="sr-only">Open Timekeeper</span>
                </Button>
             }
          />
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-card bg-destructive animate-pulse"></span>
                <span className="sr-only">Notifications</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 focus-visible:ring-0 focus-visible:ring-offset-0">
              <Avatar className="h-9 w-9">
                 <AvatarImage src={user?.avatarUrl || `https://placehold.co/40x40/E0E0E0/B0B0B0.png?text=${user?.name ? getInitials(user.name).toUpperCase() : 'U'}`} alt={user?.name || "User"} data-ai-hint="professional portrait" />
                <AvatarFallback>{user?.name ? getInitials(user.name) : <UserCircle />}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline text-foreground">{user?.name}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-hover:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push('/attorney/settings')}>
              <UserCircle className="w-4 h-4 mr-2 text-muted-foreground" />
              My Profile
            </DropdownMenuItem>
            {/* "Account Settings" item removed */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
