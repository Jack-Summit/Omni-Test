
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { UserPlus, Eye, CheckSquare, Link as LinkIcon, FilePlus, MessageCircleQuestion } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface MockNewLead {
  id: string;
  name: string;
  contact: string; // email or phone
  date: string;
  source: string;
  contactId?: string | number;
  matterId?: string;
  rawMessage?: string; // For new inquiries
}

// Mock data for demonstration
const MOCK_NEW_LEADS: MockNewLead[] = [
  { id: 'lead1', name: 'Alice Wonderland', contact: 'alice@example.com', date: '2024-05-22 10:30 AM', source: 'Website Form', rawMessage: 'Interested in setting up a family trust.' },
  { id: 'lead2', name: 'Bob The Builder', contact: 'bob@example.com', date: '2024-05-22 09:15 AM', source: 'Referral - J. Smith', rawMessage: 'John Smith referred me. Looking for estate planning advice.' },
  { 
    id: 'lead_cw', 
    name: 'Charlie White (Processed)', 
    contact: 'charlie@example.com', 
    date: '2024-05-23 11:00 AM', 
    source: 'Networking Event',
    contactId: 5, 
    matterId: 'M005'
  },
  { id: 'lead3', name: 'Carol Danvers', contact: 'carol@example.com', date: '2024-05-21 04:00 PM', source: 'Phone Inquiry', rawMessage: 'Called to ask about will preparation process and fees.' },
];

interface NewLeadsQueueWidgetProps {
  firmId?: string;
  onOpenNewClientIntake: () => void; // New prop to open the dialog
}

export function NewLeadsQueueWidget({ firmId, onOpenNewClientIntake }: NewLeadsQueueWidgetProps) {
  const leadsToDisplay = MOCK_NEW_LEADS;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-base font-semibold text-primary">New Leads Queue</CardTitle>
        <UserPlus className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3 pt-4">
        {leadsToDisplay.length > 0 ? (
          <ul className="space-y-3">
            {leadsToDisplay.map(lead => (
              <li key={lead.id} className={`p-3 rounded-md border hover:shadow-sm transition-shadow ${!lead.matterId ? 'bg-amber-50/50 border-amber-300/70' : 'bg-muted/30 border-border/60'}`}>
                <div className="flex flex-wrap justify-between items-start gap-x-4 gap-y-1">
                  <div className="flex-grow min-w-[150px]">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground text-sm">{lead.name}</p>
                        {lead.matterId ? (
                            <Badge variant="secondary" className="text-xs h-5">
                                <LinkIcon className="w-3 h-3 mr-1" /> Processed
                            </Badge>
                        ) : (
                            <Badge variant="destructive" className="text-xs h-5 bg-amber-500 hover:bg-amber-600">
                                New Inquiry
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">{lead.contact}</p>
                    <p className="text-xs text-muted-foreground">Source: {lead.source}</p>
                  </div>
                  <div className="text-xs text-muted-foreground text-right flex-shrink-0">
                    <span>Received: {lead.date}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-border/30 flex flex-wrap gap-1.5">
                    {!lead.matterId ? (
                        <>
                            <Button 
                                variant="outline" 
                                size="xs" 
                                onClick={() => toast({ title: "View Inquiry Details", description: `Showing details for ${lead.name}. Source: ${lead.source}. Message: ${lead.rawMessage || 'N/A'}. Contact: ${lead.contact}.`, duration: 7000})}
                            >
                                <MessageCircleQuestion className="mr-1 h-3 w-3"/>View Inquiry
                            </Button>
                            <Button 
                                variant="default" 
                                size="xs" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={onOpenNewClientIntake} // Use the passed prop
                            >
                                <UserPlus className="mr-1 h-3 w-3"/>New Client Intake
                            </Button>
                        </>
                    ) : (
                         <Button variant="outline" size="xs" asChild>
                            <Link href={`/attorney/matters/${lead.matterId}/prospect`}>
                                <Eye className="mr-1 h-3 w-3"/>View Prospect Dashboard
                            </Link>
                        </Button>
                    )}
                    <Button variant="outline" size="xs" onClick={() => toast({ title: "Assign Lead", description: `Assigning ${lead.name}. (Feature placeholder)`})}>
                        <CheckSquare className="mr-1 h-3 w-3"/>Assign Lead
                    </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">No new leads in the queue.</p>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-border mt-auto">
        <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/attorney/leads?filter=all">View All Leads</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
