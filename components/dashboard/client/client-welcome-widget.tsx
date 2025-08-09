
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { FileText, CalendarDays, DollarSign, UserCircle } from 'lucide-react';

export function ClientWelcomeWidget() {
  const { user } = useAuth();

  return (
    <Card className="h-full bg-card text-card-foreground shadow-lg border-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl text-primary">Welcome, {user?.name || 'Client'}!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          This is your personal portal to manage your estate planning journey with us.
          Access your documents, view upcoming appointments, and keep track of your assets.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start text-left h-auto py-3" asChild>
                <Link href="/client/documents">
                    <FileText className="mr-2 h-5 w-5 text-primary/80" />
                    My Documents
                </Link>
            </Button>
            <Button variant="outline" className="justify-start text-left h-auto py-3" asChild>
                <Link href="/client/calendar">
                    <CalendarDays className="mr-2 h-5 w-5 text-primary/80" />
                    My Calendar
                </Link>
            </Button>
            <Button variant="outline" className="justify-start text-left h-auto py-3" asChild>
                <Link href="/client/assets">
                    <DollarSign className="mr-2 h-5 w-5 text-primary/80" />
                    My Assets
                </Link>
            </Button>
            <Button variant="outline" className="justify-start text-left h-auto py-3" asChild>
                <Link href="/client/settings">
                    <UserCircle className="mr-2 h-5 w-5 text-primary/80" />
                    Account Settings
                </Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
