
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Eye, User, FolderOpen, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { MOCK_COMMUNICATION_LOGS_DATA, getContactNameById, getMatterNameById, MOCK_MATTERS_DATA } from '@/lib/mock-data';
import type { CommunicationLogItem, CommunicationTypes, CommunicationDirections } from '@/lib/types';
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge'; // Added Badge import

interface ClientCommunicationCenterWidgetProps {
  firmId?: string;
  userId?: string; // Logged-in attorney's ID
}

export function ClientCommunicationCenterWidget({ firmId, userId }: ClientCommunicationCenterWidgetProps) {
  const [unreadCommunications, setUnreadCommunications] = useState<CommunicationLogItem[]>([]);

  useEffect(() => {
    if (firmId) {
      const firmComms = MOCK_COMMUNICATION_LOGS_DATA.filter(comm => 
        comm.firmId === firmId && 
        comm.isRead === false &&
        comm.direction === "Incoming" // Assuming incoming messages are for the firm/attorney
        // In a real app, you might have a specific recipient ID or queue for the logged-in attorney
      ).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()); // Newest first
      setUnreadCommunications(firmComms);
    }
  }, [firmId]);

  const handleMarkAsRead = (commId: string) => {
    // Simulate marking as read
    const index = MOCK_COMMUNICATION_LOGS_DATA.findIndex(c => c.id === commId);
    if (index !== -1) {
      MOCK_COMMUNICATION_LOGS_DATA[index].isRead = true;
    }
    setUnreadCommunications(prev => prev.filter(c => c.id !== commId));
    toast({ title: "Communication Marked as Read", description: "This item will no longer appear in unread." });
  };

  const getMatterType = (matterId?: string): string | undefined => {
    if (!matterId) return undefined;
    const matter = MOCK_MATTERS_DATA.find(m => m.id === matterId);
    if (!matter) return undefined;
    if (matter.type === "Estate Planning") return "estate-planning";
    if (matter.type === "Trust Administration") return "trust-administration";
    if (matter.type === "Prospect") return "prospect";
    return "estate-planning"; // default
  };


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-base font-semibold text-primary">Client Communication Center</CardTitle>
        <Mail className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden pt-4">
        {unreadCommunications.length > 0 ? (
          <ScrollArea className="h-full pr-3">
            <ul className="space-y-3">
              {unreadCommunications.slice(0, 5).map(comm => ( // Show up to 5 for brevity
                <li key={comm.id} className="p-3 bg-muted/30 rounded-md border border-border/60 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{comm.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        From: {comm.clientName || comm.participants || 'Unknown Sender'}
                        {comm.matterName && ` | Matter: ${comm.matterName}`}
                      </p>
                      {comm.snippet && <p className="text-xs text-muted-foreground italic mt-0.5">"{comm.snippet}"</p>}
                    </div>
                    <Badge variant={comm.type === "Client Portal Message" ? "default" : "secondary"} className="text-xs shrink-0">
                        {comm.type === "Client Portal Message" ? <MessageSquare className="w-3 h-3 mr-1"/> : <Mail className="w-3 h-3 mr-1"/>}
                        {comm.type}
                    </Badge>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/30 flex flex-wrap gap-2">
                    <Button variant="outline" size="xs" onClick={() => toast({title: "Placeholder", description: "Viewing full communication details..."})}>
                      <Eye className="mr-1 h-3 w-3" /> View
                    </Button>
                    {comm.clientId && (
                      <Button variant="outline" size="xs" asChild>
                        <Link href={`/attorney/contacts/${comm.clientId}${comm.matterId ? `?matterId=${comm.matterId}` : ''}`}>
                          <User className="mr-1 h-3 w-3" /> View Client
                        </Link>
                      </Button>
                    )}
                    {comm.matterId && (
                      <Button variant="outline" size="xs" asChild>
                        <Link href={`/attorney/matters/${comm.matterId}/${getMatterType(comm.matterId)}`}>
                          <FolderOpen className="mr-1 h-3 w-3" /> View Matter
                        </Link>
                      </Button>
                    )}
                    <Button variant="secondary" size="xs" onClick={() => handleMarkAsRead(comm.id)}>
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Mark Read
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">No new unread communications.</p>
        )}
      </CardContent>
      {unreadCommunications.length > 0 && (
        <CardFooter className="p-4 border-t border-border mt-auto">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/attorney/communications">View All Communications</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

