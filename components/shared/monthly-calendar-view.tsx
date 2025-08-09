
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Removed CardHeader
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MonthlyCalendarViewProps {
  events: Appointment[]; // Generic event type
  onDateClick: (date: Date, eventsOnDate: Appointment[]) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void; // This prop might become less relevant or removed if parent handles all nav
  highlightColor?: string; // e.g., 'bg-blue-500'
}

export function MonthlyCalendarView({
  events,
  onDateClick,
  currentMonth,
  setCurrentMonth, // Kept for now, but parent page controls the actual month change
  highlightColor = 'bg-primary', 
}: MonthlyCalendarViewProps) {
  const today = new Date();
  today.setHours(0,0,0,0); // Normalize today's date
  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1).getDay();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const blanks = Array(firstDayOfMonth).fill(null);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getEventsForDate = (day: number): Appointment[] => {
    const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
        const eventDate = event.date || event.dueDate;
        return eventDate === dateStr;
    });
  };

  // Removed handlePrevMonth, handleNextMonth, handleToday as they are in parent

  return (
    <Card>
      {/* CardHeader containing month navigation and Today button has been removed */}
      <CardContent className="pt-2"> {/* Adjusted padding-top as header is gone */}
        <div className="grid grid-cols-7 gap-px border border-border bg-border rounded-lg overflow-hidden">
          {dayNames.map(day => (
            <div key={day} className="py-2 text-center font-medium text-xs text-muted-foreground bg-muted/50">{day}</div>
          ))}
          {blanks.map((_, i) => <div key={`blank-${i}`} className="bg-card border-t border-l border-border"></div>)}
          {daysArray.map(day => {
            const date = new Date(currentYear, currentMonthIndex, day);
            date.setHours(0,0,0,0); // Normalize date for comparison
            const isToday = date.getTime() === today.getTime();
            const dayEvents = getEventsForDate(day);
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={day}
                onClick={() => onDateClick(date, dayEvents)}
                className={cn(
                  "py-2 px-1 h-20 sm:h-24 md:h-28 text-center cursor-pointer transition-colors duration-150 ease-in-out",
                  isToday ? 'bg-accent/20 hover:bg-accent/30' : 'bg-card hover:bg-muted/50',
                  "border-t border-l border-border relative"
                )}
              >
                <span className={cn(
                    "text-xs sm:text-sm",
                    isToday ? 'font-bold text-accent-foreground' : 'text-foreground'
                )}>{day}</span>
                {hasEvents && (
                  <div className="mt-1 flex flex-wrap justify-center gap-0.5 sm:gap-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <TooltipProvider key={event.id || event.title} delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={cn(
                                "block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                                event.type === 'task' ? 'bg-destructive' : // Tasks in red
                                (event.type?.toLowerCase().includes('call') || event.type?.toLowerCase().includes('consultation')) ? 'bg-yellow-500' : // Calls/Consultations in yellow
                                event.type?.toLowerCase().includes('signing') || event.type?.toLowerCase().includes('review') ? 'bg-blue-500' : // Signing/Review in blue
                                'bg-green-500' // Default appointments in green
                            )}></span>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs p-1">
                            <p>{event.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    {dayEvents.length > 3 && (
                       <span className="text-xs text-muted-foreground mt-0.5">+{dayEvents.length -3}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
