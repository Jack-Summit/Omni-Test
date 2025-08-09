
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Megaphone } from 'lucide-react';
import type { Announcement } from '@/lib/types';
import { MOCK_ANNOUNCEMENTS_DATA } from '@/lib/mock-data';

interface AnnouncementsWidgetProps {
  firmId?: string;
}

export function AnnouncementsWidget({ firmId }: AnnouncementsWidgetProps) {
  const announcementsToDisplay = MOCK_ANNOUNCEMENTS_DATA.filter(
    ann => !ann.firmId || ann.firmId === firmId
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-base font-semibold text-primary">Announcements</CardTitle>
        <Megaphone className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3 pt-4">
        {announcementsToDisplay.length > 0 ? (
          <ul className="space-y-3">
            {announcementsToDisplay.slice(0,3).map(ann => ( 
              <li key={ann.id} className="p-3 bg-muted/30 rounded-md border border-border/60 hover:shadow-sm transition-shadow">
                <h4 className="font-semibold text-sm text-foreground mb-0.5">{ann.title}</h4>
                <p className="text-xs text-muted-foreground mb-1.5">Posted: {ann.date}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{ann.text}</p>
              </li>
            ))}
          </ul>
        ) : (
           <p className="text-muted-foreground text-sm text-center py-4">No current announcements for your firm.</p>
        )}
      </CardContent>
       {announcementsToDisplay.length > 3 && (
        <div className="p-4 border-t border-border mt-auto">
          <Button variant="link" size="sm" className="w-full px-0">View all announcements</Button>
        </div>
      )}
    </Card>
  );
}
