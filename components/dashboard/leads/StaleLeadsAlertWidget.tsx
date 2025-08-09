
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { AlertTriangle, PhoneForwarded } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface StaleLeadsAlertWidgetProps {
  firmId?: string;
}

const MOCK_STALE_LEADS = [
  { id: 'stale1', name: 'Gary Oldman', lastContact: '2024-05-01', assignedTo: 'Demo Attorney', daysSinceContact: 21 },
  { id: 'stale2', name: 'Helen Mirren', lastContact: '2024-05-10', assignedTo: 'Associate Attorney', daysSinceContact: 12 },
];

export function StaleLeadsAlertWidget({ firmId }: StaleLeadsAlertWidgetProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-base font-semibold text-destructive">Stale Leads Alert</CardTitle>
        <AlertTriangle className="h-5 w-5 text-destructive" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3 pt-4">
        {MOCK_STALE_LEADS.length > 0 ? (
          <ul className="space-y-3">
            {MOCK_STALE_LEADS.map(lead => (
              <li key={lead.id} className="p-3 bg-destructive/10 rounded-md border border-destructive/30 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-destructive text-sm">{lead.name}</p>
                        <p className="text-xs text-destructive/90">Last Contact: {lead.lastContact} ({lead.daysSinceContact} days ago)</p>
                        <p className="text-xs text-destructive/90">Assigned: {lead.assignedTo}</p>
                    </div>
                </div>
                <div className="mt-2 pt-2 border-t border-destructive/20 flex flex-wrap gap-1.5">
                    <Button variant="destructive" size="xs"><PhoneForwarded className="mr-1 h-3 w-3"/>Follow Up Now</Button>
                    <Button variant="outline" size="xs" className="border-destructive/50 text-destructive hover:bg-destructive/20">Snooze Alert</Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">No stale leads requiring attention.</p>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-border mt-auto">
        <Button variant="outline" size="sm" className="w-full">View All Follow-Up Reminders</Button>
      </CardFooter>
    </Card>
  );
}

