"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell, Info } from 'lucide-react';

export default function ReviewRemindersPage() {
  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Review Reminders</h1>
        <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Upcoming Reviews</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                    <Info className="mx-auto h-12 w-12 text-primary/50 mb-4" />
                    <p className="text-lg font-semibold">Feature Coming Soon</p>
                    <p className="text-sm max-w-md mx-auto">
                        This section will display review reminders, dashboard alerts, and a comprehensive notification list. It will help attorneys stay on top of periodic reviews for client estate plans.
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
