
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { UserCheck, MessageCircle, CalendarPlus } from 'lucide-react'; // Assuming UserCheck is a relevant icon
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { LeadStatus } from '@/lib/types';


interface AssignedLeadsWidgetProps {
  firmId?: string;
  userId?: string; // To show "My Assigned Leads"
  showUnassigned?: boolean; // To show "Unassigned Leads"
}

// Mock data for demonstration
const MOCK_ASSIGNED_LEADS = [
  { id: 'lead4', name: 'David Copperfield', lastContact: '2024-05-20', nextFollowUp: '2024-05-27', status: LeadStatus.CONSULTATION_SCHEDULED, assignedTo: 'Demo Attorney' },
  { id: 'lead5', name: 'Eve Harrington', lastContact: '2024-05-18', nextFollowUp: '2024-05-25', status: LeadStatus.INITIAL_CONTACT_MADE, assignedTo: 'Demo Attorney' },
  { id: 'lead6', name: 'Frank N. Stein', lastContact: 'N/A', nextFollowUp: 'ASAP', status: LeadStatus.NEW_INQUIRY, assignedTo: null }, // Unassigned example
];

export function AssignedLeadsWidget({ firmId, userId, showUnassigned = false }: AssignedLeadsWidgetProps) {
  const leadsToDisplay = MOCK_ASSIGNED_LEADS.filter(lead => {
    if (showUnassigned) return !lead.assignedTo;
    return lead.assignedTo === 'Demo Attorney'; // Mocking assignment to current user
  });

  const title = showUnassigned ? "Unassigned Leads" : "My Assigned Leads";

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-base font-semibold text-primary">{title}</CardTitle>
        <UserCheck className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3 pt-4">
        {leadsToDisplay.length > 0 ? (
          <ul className="space-y-3">
            {leadsToDisplay.map(lead => (
              <li key={lead.id} className="p-3 bg-muted/30 rounded-md border border-border/60 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-foreground text-sm">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">Last Contact: {lead.lastContact} | Next Follow-Up: {lead.nextFollowUp}</p>
                    </div>
                    <Badge variant={lead.status === LeadStatus.NEW_INQUIRY ? "destructive" : "secondary"} className="text-xs">{lead.status}</Badge>
                </div>
                <div className="mt-2 pt-2 border-t border-border/30 flex flex-wrap gap-1.5">
                    <Button variant="outline" size="xs"><MessageCircle className="mr-1 h-3 w-3"/>Log Activity</Button>
                    <Button variant="outline" size="xs"><CalendarPlus className="mr-1 h-3 w-3"/>Schedule</Button>
                    {!showUnassigned && <Button variant="outline" size="xs">Update Status</Button>}
                    {showUnassigned && <Button variant="outline" size="xs">Assign Lead</Button>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">{showUnassigned ? "No unassigned leads." : "You have no assigned leads."}</p>
        )}
      </CardContent>
       {leadsToDisplay.length > 0 && (
        <CardFooter className="p-4 border-t border-border mt-auto">
            <Button variant="outline" size="sm" className="w-full">View All My Leads</Button>
        </CardFooter>
       )}
    </Card>
  );
}
