
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from 'lucide-react';
import Link from 'next/link';
import { MOCK_RECENT_ACTIVITY_DATA } from '@/lib/mock-data';

interface RecentClientActivityWidgetProps {
  firmId?: string;
}

export function RecentClientActivityWidget({ firmId }: RecentClientActivityWidgetProps) {
  const activitiesToDisplay = MOCK_RECENT_ACTIVITY_DATA.filter(
    activity => activity.firmId === firmId
  ).slice(0, 4); // Show up to 4 recent activities

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-base font-semibold text-primary">Recent Client Activity</CardTitle>
        <Users className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3 pt-4">
        {activitiesToDisplay.length > 0 ? (
          <ul className="space-y-3">
            {activitiesToDisplay.map(activity => (
              <li key={activity.id} className="p-3 bg-muted/30 rounded-md border border-border/60 hover:shadow-sm transition-shadow">
                <div className="flex flex-wrap justify-between items-start gap-x-4 gap-y-1">
                  <p className="text-sm text-foreground flex-grow min-w-[150px]">{activity.text}</p>
                  <div className="text-xs text-muted-foreground text-right flex-shrink-0 space-x-2">
                      <span className="font-medium text-primary/80">{activity.type}</span>
                      <span>{activity.time}</span>
                  </div>
                </div>
                 {activity.link && <Link href={activity.link} className="text-xs text-primary hover:underline mt-1 inline-block">View Details</Link>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">No recent client activity for your firm.</p>
        )}
      </CardContent>
      <div className="p-4 border-t border-border mt-auto">
        <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/attorney/communications">View Full Activity Log</Link>
        </Button>
      </div>
    </Card>
  );
}
