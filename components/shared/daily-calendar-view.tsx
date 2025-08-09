
"use client";

import React from 'react';
import { format, parse, addHours, isSameHour, getHours, parseISO } from 'date-fns'; // Added parseISO
import type { Appointment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, CalendarCheck2, AlertTriangle } from 'lucide-react';

interface DailyCalendarViewProps {
  selectedDate: Date;
  events: Appointment[];
  currentUserId?: string;
  getCalendarOwnerNameById?: (ownerId: string | undefined) => string | undefined;
}

const parseEventTime = (eventTime: string, selectedDate: Date): Date | null => {
  try {
    const referenceDateString = format(selectedDate, 'yyyy-MM-dd');
    let parsedTime = parse(eventTime, 'h:mm a', new Date(referenceDateString));
    if (isNaN(parsedTime.getTime())) {
      parsedTime = parse(eventTime, 'HH:mm', new Date(referenceDateString));
    }
    if (isNaN(parsedTime.getTime())) {
      parsedTime = parse(eventTime, 'h a', new Date(referenceDateString));
    }
    
    if (isNaN(parsedTime.getTime())) {
        const hourMatch = eventTime.match(/^(\d{1,2})/);
        if (hourMatch) {
            const hour = parseInt(hourMatch[1], 10);
            if (hour >=0 && hour <= 23) {
                let tempDate = new Date(selectedDate);
                tempDate.setHours(hour, 0, 0, 0);
                return tempDate;
            }
        }
        return null; 
    }
    return parsedTime;
  } catch (error) {
    console.error("Error parsing event time:", eventTime, error);
    return null;
  }
};


export function DailyCalendarView({ selectedDate, events, currentUserId, getCalendarOwnerNameById }: DailyCalendarViewProps) {
  const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM to 7 PM

  const allDayEvents = events.filter(event => !event.time || event.time.toLowerCase() === 'all day' || event.time.toLowerCase() === 'allday');
  const timedEvents = events.filter(event => event.time && event.time.toLowerCase() !== 'all day' && event.time.toLowerCase() !== 'allday');

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center space-x-2">
        <CalendarCheck2 className="h-5 w-5 text-primary" />
        <CardTitle className="text-xl">
          Schedule for {format(selectedDate, 'PPPP')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allDayEvents.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-foreground mb-2 pb-1 border-b">All-Day Events</h4>
            <ul className="space-y-2">
              {allDayEvents.map(event => {
                 const ownerName = getCalendarOwnerNameById ? getCalendarOwnerNameById(event.ownerId) : undefined;
                 const displayTitle = `${ownerName ? `[${ownerName}] ` : ''}${event.title}`;
                 return (
                    <li key={event.id} className="p-2.5 bg-muted/40 rounded-md border">
                        <p className="font-medium text-sm text-foreground">{displayTitle}</p>
                        {event.type && <Badge variant="secondary" className="text-xs mt-1">{event.type}</Badge>}
                        {event.notes && <p className="text-xs text-muted-foreground mt-1 italic">{event.notes}</p>}
                    </li>
                 );
              })}
            </ul>
          </div>
        )}
        
        {timedEvents.length === 0 && allDayEvents.length === 0 && (
             <div className="text-center py-10 text-muted-foreground">
                <AlertTriangle className="mx-auto h-10 w-10 text-primary/40 mb-3" />
                <p className="text-md font-semibold">No Events Scheduled</p>
                <p className="text-sm">There are no appointments or tasks scheduled for this day.</p>
            </div>
        )}

        {timedEvents.length > 0 && (
            <ScrollArea className="h-[60vh] pr-3">
            <div className="relative grid grid-cols-1 gap-px">
                {hours.map(hour => {
                const hourStart = format(addHours(selectedDate, hour), 'ha');
                const eventsInHour = timedEvents.filter(event => {
                    const eventDate = parseEventTime(event.time, selectedDate);
                    return eventDate && isSameHour(eventDate, addHours(selectedDate, hour));
                }).sort((a,b) => {
                    const timeA = parseEventTime(a.time, selectedDate);
                    const timeB = parseEventTime(b.time, selectedDate);
                    if (timeA && timeB) return timeA.getTime() - timeB.getTime();
                    return 0;
                });

                return (
                    <div key={hour} className="relative flex py-3 border-t border-border/70 first:border-t-0">
                    <div className="w-16 text-right pr-3 pt-0.5">
                        <span className="text-xs font-medium text-muted-foreground">{hourStart}</span>
                    </div>
                    <div className="flex-1 pl-3 border-l border-border/70">
                        {eventsInHour.length > 0 ? (
                        <ul className="space-y-2">
                            {eventsInHour.map(event => {
                                const ownerName = getCalendarOwnerNameById ? getCalendarOwnerNameById(event.ownerId) : undefined;
                                const displayTitle = `${ownerName ? `[${ownerName}] ` : ''}${event.title}`;
                                return (
                                <li key={event.id} className="p-2.5 bg-card rounded-md shadow-sm border border-border/80 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-sm text-foreground">{displayTitle}</p>
                                        <p className="text-xs text-muted-foreground flex items-center">
                                        <Clock size={12} className="mr-1 text-primary/70" /> {event.time}
                                        </p>
                                    </div>
                                    {event.type && <Badge variant={event.type === 'task' ? "destructive" : "outline"} className="text-xs ml-2">{event.type}</Badge>}
                                    </div>
                                    {event.notes && <p className="text-xs text-muted-foreground mt-1 italic pt-1 border-t border-dashed border-border/50">{event.notes}</p>}
                                </li>
                                );
                            })}
                        </ul>
                        ) : (
                        <div className="h-8"></div> 
                        )}
                    </div>
                    </div>
                );
                })}
            </div>
            </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
