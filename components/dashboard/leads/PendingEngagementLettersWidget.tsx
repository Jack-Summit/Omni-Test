
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { FileSignature, Send, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface PendingEngagementLettersWidgetProps {
  firmId?: string;
}

const MOCK_ENGAGEMENT_LETTERS = [
  { id: 'el1', leadName: 'Harry Truman', dateSent: '2024-05-10', status: 'Sent', matterId: 'lead_ht001' },
  { id: 'el2', leadName: 'Log Lady', dateSent: '2024-05-15', status: 'Viewed', matterId: 'lead_ll002' },
  { id: 'el3', leadName: 'Hawk', dateSent: '2024-04-28', status: 'Sent', matterId: 'lead_hk003' },
];

export function PendingEngagementLettersWidget({ firmId }: PendingEngagementLettersWidgetProps) {
  
  const getStatusBadgeVariant = (status: string) => {
    if (status === 'Sent') return 'secondary';
    if (status === 'Viewed') return 'default'; // Use primary for viewed
    if (status === 'Signed') return 'success'; // Assuming you might have a success variant
    return 'outline';
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-base font-semibold text-primary">Pending Engagement Letters</CardTitle>
        <FileSignature className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3 pt-4">
        {MOCK_ENGAGEMENT_LETTERS.length > 0 ? (
          <ul className="space-y-3">
            {MOCK_ENGAGEMENT_LETTERS.map(letter => (
              <li key={letter.id} className="p-3 bg-muted/30 rounded-md border border-border/60 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-foreground text-sm">{letter.leadName}</p>
                        <p className="text-xs text-muted-foreground">Sent: {letter.dateSent}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(letter.status)} className="text-xs">{letter.status}</Badge>
                </div>
                <div className="mt-2 pt-2 border-t border-border/30 flex flex-wrap gap-1.5">
                    <Button variant="outline" size="xs"><Send className="mr-1 h-3 w-3"/>Send Reminder</Button>
                    <Button variant="outline" size="xs"><UploadCloud className="mr-1 h-3 w-3"/>Upload Signed</Button>
                    <Button variant="default" size="xs">Mark as Client</Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">No engagement letters currently pending.</p>
        )}
      </CardContent>
       <CardFooter className="p-4 border-t border-border mt-auto">
        <Button variant="outline" size="sm" className="w-full">Track All Engagement Letters</Button>
      </CardFooter>
    </Card>
  );
}
