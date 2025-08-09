
"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Eye } from 'lucide-react';
import Link from 'next/link';
import { MOCK_MATTERS_DATA } from '@/lib/mock-data';
import type { Matter } from '@/lib/types';
import { formatDateToMMDDYYYY } from '@/lib/utils'; // Import the formatter

interface ClientMattersOverviewWidgetProps {
  firmId?: string;
  clientId?: string | number;
}

export function ClientMattersOverviewWidget({ firmId, clientId }: ClientMattersOverviewWidgetProps) {
  const clientMatters = useMemo(() => {
    if (!firmId || !clientId) return [];
    
    return MOCK_MATTERS_DATA.filter(matter => 
      matter.clientIds.includes(clientId) &&
      matter.firmId === firmId // Ensure firmId matches
    );
  }, [firmId, clientId]);

  const getMatterStatusColor = (status: Matter['status']) => {
    if (status === 'Open' || status === 'Lead' || status === 'Contacted' || status === 'Consult Scheduled') return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100';
    if (status === 'Closed' || status === 'Not Qualified') return 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200';
    if (status === 'Pending' || status === 'On Hold') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100';
  };


  return (
    <Card className="h-full bg-card text-card-foreground shadow-lg border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-primary">My Matters</CardTitle>
        <Briefcase className="h-5 w-5 text-primary/70" />
      </CardHeader>
      <CardContent className="space-y-3">
        {clientMatters.length > 0 ? (
          <ul className="space-y-3">
            {clientMatters.map(matter => (
              <li key={matter.id} className="p-3 bg-muted/30 rounded-md border border-border/50">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-medium text-foreground">{matter.name}</h4>
                        <p className="text-xs text-muted-foreground">Type: {matter.type}</p>
                        {matter.openDate && (
                          <p className="text-xs text-muted-foreground">Opened: {formatDateToMMDDYYYY(matter.openDate)}</p>
                        )}
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getMatterStatusColor(matter.status)}`}>
                        {matter.status}
                    </span>
                </div>
                <div className="mt-2 text-right">
                     <Button variant="link" size="sm" className="p-0 h-auto text-primary/80 hover:text-primary text-xs" asChild>
                        <Link href={`/client/assets?matterId=${matter.id}`}>View Related Assets</Link>
                    </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">You currently have no active matters with us.</p>
        )}
         {clientMatters.length > 1 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
                You can manage documents and assets related to specific matters on their respective pages.
            </p>
        )}
      </CardContent>
    </Card>
  );
}

