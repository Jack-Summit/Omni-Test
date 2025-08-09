
"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { MOCK_REMINDERS_DATA, MOCK_MATTERS_DATA } from '@/lib/mock-data';
import type { Reminder } from '@/lib/types';

interface ReviewRemindersWidgetProps {
  firmId?: string;
}

export function ReviewRemindersWidget({ firmId }: ReviewRemindersWidgetProps) {
  const remindersToDisplay = useMemo(() => {
    if (!firmId) return [];
    return MOCK_REMINDERS_DATA.filter(reminder => {
      const matter = MOCK_MATTERS_DATA.find(m => m.id === reminder.matterId);
      return matter && matter.firmId === firmId;
    }).slice(0, 4); // Show up to 4 reminders
  }, [firmId]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-base font-semibold text-primary">Review Reminders</CardTitle>
        <Bell className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3 pt-4">
        {remindersToDisplay.length > 0 ? (
          <ul className="space-y-3">
            {remindersToDisplay.map(reminder => (
              <li key={reminder.id} className="p-3 bg-muted/30 rounded-md border border-border/60 hover:shadow-sm transition-shadow">
                <div className="flex flex-wrap justify-between items-start gap-x-4 gap-y-1">
                  <div className="flex-grow min-w-[150px]">
                    <p className="text-sm text-foreground">{reminder.text}</p>
                    {reminder.matterId && <p className="text-xs text-primary/70 hover:underline"><Link href={`/attorney/matters/${reminder.matterId}/estate-planning`}>Matter: {reminder.matterId}</Link></p>}
                  </div>
                  <div className="text-xs text-muted-foreground text-right flex-shrink-0 space-x-2">
                      <span className="font-medium text-primary/80">{reminder.type}</span>
                      <span>Due: {reminder.dueDate}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">No upcoming review reminders for your firm.</p>
        )}
      </CardContent>
      <div className="p-4 border-t border-border mt-auto">
        <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/attorney/reminders">View All Reminders</Link>
        </Button>
      </div>
    </Card>
  );
}
