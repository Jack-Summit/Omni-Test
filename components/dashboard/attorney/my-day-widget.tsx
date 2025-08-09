
"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { CalendarCheck, AlertTriangle, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { MOCK_APPOINTMENTS_DATA, MOCK_TASKS_DATA, getContactNameById, getMatterNameById, MOCK_MATTERS_DATA } from '@/lib/mock-data';
import type { Appointment, Task, MatterType } from '@/lib/types';
import { MATTER_TYPES } from '@/lib/types';
import { format, parseISO, isSameDay, setHours, startOfDay } from 'date-fns';

interface MyDayWidgetProps {
  firmId?: string;
  userId?: string;
}

interface MyDayItem {
  id: string;
  time: string; 
  title: string;
  type: 'Appointment' | 'Task' | 'Court Date' | 'Meeting';
  clientName?: string;
  matterName?: string;
  rawDate: Date; 
  originalType: string; 
  clientId?: string | number;
  matterId?: string;
  matterType?: MatterType;
}

const parseEventTimeForDisplay = (eventTime: string | undefined, eventDate: Date): { displayTime: string; sortableDate: Date } => {
  if (!eventTime || eventTime.toLowerCase() === 'all day') {
    return { displayTime: 'All Day', sortableDate: startOfDay(eventDate) };
  }
  try {
    let parsedTime = parseISO(`${format(eventDate, 'yyyy-MM-dd')}T${eventTime}`);
    if (isNaN(parsedTime.getTime())) {
        const timeParts = eventTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (timeParts) {
            let hours = parseInt(timeParts[1], 10);
            const minutes = parseInt(timeParts[2], 10);
            const modifier = timeParts[3];
            if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;
            parsedTime = setHours(startOfDay(eventDate), hours);
            parsedTime.setMinutes(minutes);
        } else { 
            const hourOnlyMatch = eventTime.match(/(\d+)\s*(AM|PM)?/i);
             if (hourOnlyMatch) {
                let hours = parseInt(hourOnlyMatch[1], 10);
                const modifier = hourOnlyMatch[2];
                if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
                if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;
                parsedTime = setHours(startOfDay(eventDate), hours);
             } else {
                const simplerTime = parseISO(`${format(eventDate, 'yyyy-MM-dd')}T${eventTime.padStart(5, '0')}`);
                if(!isNaN(simplerTime.getTime())) parsedTime = simplerTime;
                else return { displayTime: eventTime, sortableDate: startOfDay(eventDate) }; 
             }
        }
    }
    return { displayTime: format(parsedTime, 'h:mm a'), sortableDate: parsedTime };
  } catch (e) {
    console.warn("Could not parse event time for display:", eventTime, e);
    return { displayTime: eventTime, sortableDate: startOfDay(eventDate) };
  }
};


export function MyDayWidget({ firmId, userId }: MyDayWidgetProps) {
  const today = startOfDay(new Date());

  const getMatterDashboardLink = (matterId?: string, matterType?: MatterType): string => {
    if (!matterId || !matterType) return '#'; 
    let dashboardSlug = 'estate-planning'; // Default
    if (matterType === MATTER_TYPES.TRUST_ADMINISTRATION) {
      dashboardSlug = 'trust-administration';
    } else if (matterType === MATTER_TYPES.PROSPECT) {
      dashboardSlug = 'prospect';
    }
    return `/attorney/matters/${matterId}/${dashboardSlug}`;
  };

  const todaysItems: MyDayItem[] = useMemo(() => {
    if (!firmId || !userId) return [];

    const todaysAppointments = MOCK_APPOINTMENTS_DATA.filter(appt =>
      appt.firmId === firmId &&
      isSameDay(parseISO(appt.date), today) &&
      appt.ownerIds.includes(userId)
    ).map(appt => {
        const {displayTime, sortableDate} = parseEventTimeForDisplay(appt.time, parseISO(appt.date));
        const matter = appt.matterId ? MOCK_MATTERS_DATA.find(m => m.id === appt.matterId && m.firmId === firmId) : undefined;
        return {
            id: `appt-${appt.id}`,
            time: displayTime,
            title: appt.title,
            type: appt.type as MyDayItem['type'] || 'Appointment',
            clientName: appt.clientId ? getContactNameById(appt.clientId) : undefined,
            clientId: appt.clientId,
            matterName: appt.matterId ? getMatterNameById(appt.matterId) : undefined,
            matterId: appt.matterId,
            matterType: matter?.type,
            rawDate: sortableDate,
            originalType: appt.type || 'Appointment'
        };
    });

    const todaysTasks = MOCK_TASKS_DATA.filter(task =>
      task.firmId === firmId &&
      isSameDay(parseISO(task.dueDate), today) &&
      task.assignedUserIds.includes(userId) &&
      task.status !== 'Completed'
    ).map(task => {
        const matter = task.matterId ? MOCK_MATTERS_DATA.find(m => m.id === task.matterId && m.firmId === firmId) : undefined;
        return {
            id: `task-${task.id}`,
            time: 'Due Today',
            title: task.title,
            type: 'Task' as MyDayItem['type'],
            clientName: task.clientId ? getContactNameById(task.clientId) : undefined,
            clientId: task.clientId,
            matterName: task.matterId ? getMatterNameById(task.matterId) : undefined,
            matterId: task.matterId,
            matterType: matter?.type,
            rawDate: startOfDay(parseISO(task.dueDate)), 
            originalType: 'Task'
        };
    });
    
    return [...todaysAppointments, ...todaysTasks].sort((a, b) => {
        if (a.time === 'All Day' && b.time !== 'All Day') return -1;
        if (a.time !== 'All Day' && b.time === 'All Day') return 1;
        if (a.time === 'Due Today' && b.time !== 'Due Today') return 1; 
        if (a.time !== 'Due Today' && b.time === 'Due Today') return -1;
        return a.rawDate.getTime() - b.rawDate.getTime();
    });

  }, [firmId, userId, today]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-base font-semibold text-primary">My Day - {format(today, 'MMMM d, yyyy')}</CardTitle>
        <CalendarCheck className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3 pt-4">
        {todaysItems.length > 0 ? (
          <ul className="space-y-3">
            {todaysItems.map(item => (
              <li key={item.id} className="p-3 bg-muted/30 rounded-md border border-border/60 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-grow">
                        <p className="font-medium text-foreground text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                            <span className="font-semibold">{item.time}</span> - <span className="text-primary/80">{item.originalType}</span>
                        </p>
                        {(item.clientName || item.matterName) && (
                             <p className="text-xs text-muted-foreground mt-0.5">
                                {item.clientName && item.clientId && (
                                    <>
                                    Client: <Link href={`/attorney/contacts/${item.clientId}${item.matterId ? `?matterId=${item.matterId}` : ''}`} className="text-primary hover:underline">{item.clientName}</Link>
                                    </>
                                )}
                                {item.clientName && item.matterName && " | "}
                                {item.matterName && item.matterId && item.matterType && (
                                    <>
                                    Matter: <Link href={getMatterDashboardLink(item.matterId, item.matterType)} className="text-primary hover:underline">{item.matterName}</Link>
                                    </>
                                )}
                            </p>
                        )}
                    </div>
                    {item.type === 'Task' && <ListChecks className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5"/>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-muted-foreground text-sm text-center py-6 flex flex-col items-center">
             <AlertTriangle className="h-10 w-10 text-primary/30 mb-3" />
            No scheduled items or critical deadlines for today.
          </div>
        )}
      </CardContent>
      <div className="p-4 border-t border-border mt-auto">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/attorney/calendar">View Full Calendar</Link>
        </Button>
      </div>
    </Card>
  );
}

