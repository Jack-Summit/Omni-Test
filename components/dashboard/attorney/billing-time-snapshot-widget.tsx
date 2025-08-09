
"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { MOCK_TIME_ENTRIES_DATA } from '@/lib/mock-data';
import type { TimeEntry } from '@/lib/types';
import { format, parseISO, isSameDay, startOfWeek, endOfWeek, isWithinInterval, eachDayOfInterval } from 'date-fns';

interface BillingTimeSnapshotWidgetProps {
  firmId?: string;
  userId?: string;
}

const formatDurationFromMinutes = (totalMinutes: number): string => {
  if (totalMinutes === 0) return "0h 0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

export function BillingTimeSnapshotWidget({ firmId, userId }: BillingTimeSnapshotWidgetProps) {
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Assuming week starts on Monday
  const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const relevantTimeEntries = useMemo(() => {
    if (!firmId || !userId) return [];
    return MOCK_TIME_ENTRIES_DATA.filter(entry =>
      entry.firmId === firmId &&
      entry.attorneyId === userId &&
      entry.isBillable
    );
  }, [firmId, userId]);

  const billableHoursToday = useMemo(() => {
    const totalMinutes = relevantTimeEntries
      .filter(entry => isSameDay(parseISO(entry.date), today))
      .reduce((sum, entry) => sum + entry.durationMinutes, 0);
    return formatDurationFromMinutes(totalMinutes);
  }, [relevantTimeEntries, today]);

  const billableHoursThisWeek = useMemo(() => {
    const totalMinutes = relevantTimeEntries
      .filter(entry => {
        const entryDate = parseISO(entry.date);
        return isWithinInterval(entryDate, { start: currentWeekStart, end: currentWeekEnd });
      })
      .reduce((sum, entry) => sum + entry.durationMinutes, 0);
    return formatDurationFromMinutes(totalMinutes);
  }, [relevantTimeEntries, currentWeekStart, currentWeekEnd]);

  // Placeholder for outstanding invoices logic
  const outstandingInvoicesCount = 3; // Example
  const outstandingInvoicesTotal = 4750.50; // Example

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-base font-semibold text-primary">Billing & Time Snapshot</CardTitle>
        <DollarSign className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-4 pt-4">
        <div className="p-3 bg-muted/30 rounded-md border border-border/60">
          <h4 className="text-sm font-medium text-foreground mb-1 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-primary/70" />
            Billable Hours Logged
          </h4>
          <div className="space-y-1 text-xs">
            <p className="flex justify-between"><span>Today:</span> <span className="font-semibold text-foreground">{billableHoursToday}</span></p>
            <p className="flex justify-between"><span>This Week:</span> <span className="font-semibold text-foreground">{billableHoursThisWeek}</span></p>
          </div>
        </div>

        <div className="p-3 bg-muted/30 rounded-md border border-border/60">
          <h4 className="text-sm font-medium text-foreground mb-1 flex items-center">
            <FileText className="h-4 w-4 mr-2 text-primary/70" />
            Outstanding Invoices
          </h4>
          {outstandingInvoicesCount > 0 ? (
            <div className="space-y-1 text-xs">
              <p className="flex justify-between items-center">
                <span>Count:</span> 
                <span className="font-semibold text-destructive flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" /> 
                  {outstandingInvoicesCount}
                </span>
              </p>
              <p className="flex justify-between"><span>Total:</span> <span className="font-semibold text-destructive">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(outstandingInvoicesTotal)}</span></p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-1">No outstanding invoices.</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          This is a snapshot. For detailed billing records, visit the main billing page.
        </p>
      </CardContent>
      <CardFooter className="p-4 border-t border-border mt-auto">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/attorney/billing">View Full Billing</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
