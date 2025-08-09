
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { CalendarClock, Video, UserCog } from 'lucide-react'; // UserCog for assigned attorney
import Link from 'next/link';

interface ConsultationScheduleWidgetProps {
  firmId?: string;
}

const MOCK_CONSULTATIONS = [
  { id: 'consult1', leadName: 'Laura Palmer', dateTime: '2024-05-25 02:00 PM', assignedAttorney: 'Demo Attorney', matterId: 'lead_lp123' },
  { id: 'consult2', leadName: 'Dale Cooper', dateTime: '2024-05-28 10:00 AM', assignedAttorney: 'Associate Attorney', matterId: 'lead_dc456' },
  { id: 'consult3', leadName: 'Audrey Horne', dateTime: '2024-06-02 11:30 AM', assignedAttorney: 'Demo Attorney', matterId: 'lead_ah789' },
];

export function ConsultationScheduleWidget({ firmId }: ConsultationScheduleWidgetProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-base font-semibold text-primary">Upcoming Consultations</CardTitle>
        <CalendarClock className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3 pt-4">
        {MOCK_CONSULTATIONS.length > 0 ? (
          <ul className="space-y-3">
            {MOCK_CONSULTATIONS.map(consult => (
              <li key={consult.id} className="p-3 bg-muted/30 rounded-md border border-border/60 hover:shadow-sm transition-shadow">
                <p className="font-semibold text-foreground text-sm">{consult.leadName}</p>
                <p className="text-xs text-muted-foreground">Date & Time: {consult.dateTime}</p>
                <p className="text-xs text-muted-foreground">Assigned: {consult.assignedAttorney}</p>
                <div className="mt-2 pt-2 border-t border-border/30 flex flex-wrap gap-1.5">
                    <Button variant="outline" size="xs"><Video className="mr-1 h-3 w-3"/>Join Meeting</Button>
                    <Button variant="outline" size="xs">Mark Completed</Button>
                    <Button variant="outline" size="xs" asChild>
                        <Link href={`/attorney/matters/${consult.matterId}/prospect`}> {/* Assuming leads have a prospect dashboard */}
                           <UserCog className="mr-1 h-3 w-3"/> View Lead
                        </Link>
                    </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">No upcoming consultations scheduled.</p>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-border mt-auto">
        <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/attorney/calendar?view=consultations">View Full Consultation Schedule</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
