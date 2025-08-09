
"use client";

import React from 'react';
import { format, startOfWeek, endOfWeek, addDays, eachDayOfInterval, isSameDay, parseISO, getHours } from 'date-fns';
import type { Appointment } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface WorkWeekCalendarViewProps {
  selectedDate: Date; // A date within the week to display
  events: Appointment[];
  onEventClick?: (event: Appointment) => void;
  onDateTimeSelect?: (date: Date, hour: number) => void;
}

const parseEventTime = (eventTime: string, dayDate: Date): Date | null => {
  try {
    const referenceDateString = format(dayDate, 'yyyy-MM-dd');
    let parsedTime = parseISO(`${referenceDateString}T${eventTime}`); // Assuming time is like "10:00" or "14:30"
    if (isNaN(parsedTime.getTime())) {
        // Try common AM/PM formats if ISO fails
        const timeParts = eventTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (timeParts) {
            let hours = parseInt(timeParts[1], 10);
            const minutes = parseInt(timeParts[2], 10);
            const modifier = timeParts[3];
            if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0; // Midnight case
            
            const tempDate = new Date(dayDate);
            tempDate.setHours(hours, minutes, 0, 0);
            parsedTime = tempDate;
        } else {
             // Try to parse just hour if that's all that's provided e.g. "9 AM"
            const hourOnlyMatch = eventTime.match(/(\d+)\s*(AM|PM)?/i);
            if (hourOnlyMatch) {
                let hours = parseInt(hourOnlyMatch[1], 10);
                const modifier = hourOnlyMatch[2];
                if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
                if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;
                const tempDate = new Date(dayDate);
                tempDate.setHours(hours, 0, 0, 0);
                parsedTime = tempDate;
            }
        }
    }
    return isNaN(parsedTime.getTime()) ? null : parsedTime;
  } catch (error) {
    console.error("Error parsing event time in WorkWeekView:", eventTime, error);
    return null;
  }
};


export function WorkWeekCalendarView({ selectedDate, events, onEventClick, onDateTimeSelect }: WorkWeekCalendarViewProps) {
  const weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1; // Monday
  const firstDayOfWorkWeek = startOfWeek(selectedDate, { weekStartsOn });
  const workWeekDays = eachDayOfInterval({
    start: firstDayOfWorkWeek,
    end: addDays(firstDayOfWorkWeek, 4), // Monday to Friday
  });

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM (for 12 slots)

  const allDayEventsByDay: { [key: string]: Appointment[] } = {};
  const timedEventsByDayAndHour: { [key: string]: { [hour: number]: Appointment[] } } = {};

  workWeekDays.forEach(day => {
    const dayKey = format(day, 'yyyy-MM-dd');
    allDayEventsByDay[dayKey] = [];
    timedEventsByDayAndHour[dayKey] = {};
    hours.forEach(hour => {
      timedEventsByDayAndHour[dayKey][hour] = [];
    });

    events.forEach(event => {
      const eventDateStr = event.date || event.dueDate;
      if (!eventDateStr) return;
      
      const eventMainDate = parseISO(eventDateStr);
      if (!isSameDay(eventMainDate, day)) return;

      if (!event.time || event.time.toLowerCase() === 'all day' || event.time.toLowerCase() === 'allday') {
        allDayEventsByDay[dayKey].push(event);
      } else {
        const parsedTime = parseEventTime(event.time, day);
        if (parsedTime) {
          const eventHour = getHours(parsedTime);
          if (timedEventsByDayAndHour[dayKey][eventHour]) {
            timedEventsByDayAndHour[dayKey][eventHour].push(event);
          } else if (eventHour >= hours[0] && eventHour <= hours[hours.length -1]) { // if it's an edge case not initialized
            timedEventsByDayAndHour[dayKey][eventHour] = [event];
          }
        }
      }
    });
     // Sort timed events within each hour slot
    hours.forEach(hour => {
        if (timedEventsByDayAndHour[dayKey][hour]) {
            timedEventsByDayAndHour[dayKey][hour].sort((a, b) => {
                const timeA = parseEventTime(a.time, day);
                const timeB = parseEventTime(b.time, day);
                if (timeA && timeB) return timeA.getTime() - timeB.getTime();
                return 0;
            });
        }
    });
  });


  return (
    <Card className="shadow-lg">
      <CardContent className="p-0">
        <ScrollArea className="w-full h-[70vh]" type="auto">
          <div className="grid grid-cols-[auto_repeat(5,1fr)]">
            {/* Header Row */}
            <div className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm text-xs font-medium text-muted-foreground p-2 text-center border-b border-r">Time</div>
            {workWeekDays.map(day => (
              <div key={format(day, 'yyyy-MM-dd')} className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm text-xs font-medium text-muted-foreground p-2 text-center border-b min-w-[120px]">
                {format(day, 'EEE M/d')}
              </div>
            ))}

            {/* All Day Events Row */}
            <div className="text-xs font-medium text-muted-foreground p-2 text-center border-b border-r bg-card sticky left-0 z-[5]">All Day</div>
            {workWeekDays.map(day => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayEvents = allDayEventsByDay[dayKey] || [];
              return (
                <div key={`all-day-${dayKey}`} className="p-1.5 border-b border-l min-h-[60px] bg-card hover:bg-muted/30 transition-colors"
                     onClick={() => onDateTimeSelect && onDateTimeSelect(day, -1)} // -1 for all-day
                >
                  {dayEvents.map(event => (
                    <div key={event.id} title={event.title} className="mb-1 p-1.5 text-[10px] leading-tight bg-primary/10 text-primary-foreground rounded shadow-sm cursor-pointer hover:bg-primary/20"
                         onClick={(e) => { e.stopPropagation(); onEventClick?.(event); }}>
                      {event.title.length > 25 ? event.title.substring(0,22) + '...' : event.title}
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Hourly Rows */}
            {hours.map(hour => (
              <React.Fragment key={hour}>
                <div className="text-xs font-medium text-muted-foreground p-2 text-center border-b border-r h-24 sticky left-0 z-[5] bg-card flex items-center justify-center">
                  {format(new Date(2000, 0, 1, hour), 'ha')}
                </div>
                {workWeekDays.map(day => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const hourEvents = timedEventsByDayAndHour[dayKey]?.[hour] || [];
                  return (
                    <div
                      key={`${dayKey}-${hour}`}
                      className="p-1.5 border-b border-l min-h-[96px] bg-card hover:bg-muted/30 transition-colors overflow-y-auto relative" // Added relative for potential absolute positioning of events
                      onClick={() => onDateTimeSelect && onDateTimeSelect(day, hour)}
                    >
                      {hourEvents.map(event => (
                        <div
                          key={event.id}
                          title={event.title}
                          className={cn(
                            "mb-1 p-1.5 text-xs leading-tight rounded shadow-sm cursor-pointer hover:opacity-80",
                            event.type === 'task' ? 'bg-destructive/20 text-destructive-foreground' : 'bg-primary/80 text-primary-foreground'
                          )}
                          onClick={(e) => { e.stopPropagation(); onEventClick?.(event); }}
                        >
                         <div className="font-semibold truncate">{event.title}</div>
                         {event.time && <div className="text-[10px] opacity-80 flex items-center"><Clock size={10} className="mr-0.5"/>{event.time}</div>}
                         {event.client && <div className="text-[10px] opacity-80 truncate">Client: {event.client}</div>}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

