
"use client";

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MonthlyCalendarView } from '@/components/shared/monthly-calendar-view';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MOCK_APPOINTMENTS_DATA, getCurrentUserMockClient } from '@/lib/mock-data';
import type { Appointment } from '@/lib/types';
import { ClipboardList, Info } from 'lucide-react';

export default function ClientCalendarPage() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState<Appointment[]>([]);
  const [selectedCalDate, setSelectedCalDate] = useState<Date | null>(null);

  const clientAppointments = useMemo(() => {
    if (!user) return [];
    const currentUserMockClient = getCurrentUserMockClient(user.id); // Changed to user.id
    if (!currentUserMockClient || !currentUserMockClient.firmId) return [];
    
    return MOCK_APPOINTMENTS_DATA.filter(appt => 
      appt.clientId === currentUserMockClient.id &&
      appt.firmId === currentUserMockClient.firmId
    );
  }, [user]);

  const handleDateClick = (date: Date, eventsOnDate: Appointment[]) => {
    setSelectedCalDate(date);
    setSelectedDateEvents(eventsOnDate);
  };

  return (
    <div className="space-y-6">
       <Card className="bg-white/90 text-card-foreground shadow-xl">
        <CardHeader className="pb-4">
            <CardTitle className="text-2xl">My Calendar</CardTitle>
            <p className="text-sm text-muted-foreground">View your scheduled appointments and important dates.</p>
        </CardHeader>
        <CardContent>
            <MonthlyCalendarView
                events={clientAppointments}
                onDateClick={handleDateClick}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                highlightColor="bg-accent"
            />
        </CardContent>
       </Card>
      
      {selectedCalDate && (
        <Card className="mt-6 bg-white/90 text-card-foreground shadow-lg">
          <CardHeader className="flex flex-row items-center space-x-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              Events for {selectedCalDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <ul className="space-y-3">
                {selectedDateEvents.map(event => (
                  <li key={event.id} className="p-3 bg-card border border-border rounded-lg shadow-sm">
                    <p className="font-semibold text-foreground">{event.title}</p>
                    {event.time && <p className="text-sm text-muted-foreground">Time: {event.time}</p>}
                    {event.type && <p className="text-sm text-muted-foreground">Type: {event.type}</p>}
                    {event.notes && (
                       <div className="mt-1 flex items-start text-xs text-muted-foreground italic space-x-1 bg-background p-2 rounded-md border">
                        <Info size={14} className="flex-shrink-0 mt-0.5 text-primary/70" /> 
                        <span>{event.notes}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-3">No events scheduled for this day.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

