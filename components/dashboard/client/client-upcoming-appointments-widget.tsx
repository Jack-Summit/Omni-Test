
"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Info } from 'lucide-react';
import Link from 'next/link';
import { MOCK_APPOINTMENTS_DATA } from '@/lib/mock-data';
import type { Appointment } from '@/lib/types';
import { format, parseISO, isFuture } from 'date-fns';

interface ClientUpcomingAppointmentsWidgetProps {
  firmId?: string;
  clientId?: string | number;
}

export function ClientUpcomingAppointmentsWidget({ firmId, clientId }: ClientUpcomingAppointmentsWidgetProps) {
  const upcomingAppointments = useMemo(() => {
    if (!firmId || !clientId) return [];

    return MOCK_APPOINTMENTS_DATA
      .filter(appt => 
        appt.clientId === clientId && 
        appt.firmId === firmId && // Ensure firmId matches
        isFuture(parseISO(appt.date))
      )
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 3); 
  }, [firmId, clientId]);

  return (
    <Card className="h-full bg-card text-card-foreground shadow-lg border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-primary">Upcoming Appointments</CardTitle>
        <CalendarDays className="h-5 w-5 text-primary/70" />
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingAppointments.length > 0 ? (
          <ul className="space-y-2">
            {upcomingAppointments.map(appt => (
              <li key={appt.id} className="p-3 bg-muted/30 rounded-md border border-border/50 text-sm">
                <p className="font-medium text-foreground">{appt.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(appt.date), 'EEEE, MMMM d, yyyy')} at {appt.time}
                </p>
                {appt.notes && (
                    <div className="mt-1 flex items-start text-xs text-muted-foreground/80 italic space-x-1 bg-background/50 p-1.5 rounded border">
                        <Info size={14} className="flex-shrink-0 mt-0.5 text-primary/50" /> 
                        <span>{appt.notes}</span>
                    </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">No upcoming appointments scheduled.</p>
        )}
        <Button variant="outline" size="sm" className="w-full mt-4" asChild>
          <Link href="/client/calendar">View Full Calendar</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

