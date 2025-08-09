
"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation'; 
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusCircle, Edit2, Trash2, Info, AlertTriangle, CreditCard } from 'lucide-react';
import { MOCK_TIME_ENTRIES_DATA, getContactNameById, getMatterNameById, MOCK_MATTERS_DATA } from '@/lib/mock-data';
import type { TimeEntry, Matter, FirmUserRole } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { MatterActionRibbon } from '@/components/layout/matter-action-ribbon';

// RBAC Helper Functions for Billing
const canManageBilling = (role?: FirmUserRole) => ['Admin', 'Attorney', 'Paralegal', 'Staff'].includes(role || ''); // Assuming Staff can add time
const canDeleteTimeEntry = (role?: FirmUserRole) => ['Admin', 'Attorney'].includes(role || '');

export default function BillingManagementPage() {
  const { 
    user,
    openGlobalTimeEntryDialog, 
    timeEntries, setTimeEntries, deleteTimeEntry 
  } = useAuth();
  const searchParams = useSearchParams();
  const currentPathname = usePathname(); 
  const filterByMatterId = searchParams.get('matterId');
  const firmId = user?.firmId;
  
  const [currentMatter, setCurrentMatter] = useState<Matter | null>(null); 

  useEffect(() => {
    if (firmId) {
        if (timeEntries.length === 0 && MOCK_TIME_ENTRIES_DATA.some(entry => entry.firmId === firmId)) { // Check if there are relevant mock entries
            const initialEntries = MOCK_TIME_ENTRIES_DATA
                .filter(entry => entry.firmId === firmId)
                .map(entry => ({
                    ...entry,
                    clientName: getContactNameById(entry.clientId),
                    matterName: getMatterNameById(entry.matterId)
                }));
            setTimeEntries(initialEntries);
        }
        if (filterByMatterId) {
          const matter = MOCK_MATTERS_DATA.find(m => m.id === filterByMatterId && m.firmId === firmId);
          setCurrentMatter(matter || null);
        } else {
          setCurrentMatter(null);
        }
    }
  }, [timeEntries.length, setTimeEntries, filterByMatterId, firmId]);


  const handleDelete = (entryId: string) => {
    if (window.confirm("Are you sure you want to delete this time entry?")) {
      deleteTimeEntry(entryId);
      toast({ title: "Time Entry Deleted", description: "The time entry has been removed.", variant: "destructive" });
    }
  };

  const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const filteredTimeEntries = filterByMatterId
    ? timeEntries.filter(entry => entry.matterId === filterByMatterId && entry.firmId === firmId)
    : timeEntries.filter(entry => entry.firmId === firmId);

  const primaryClientIdForRibbon = currentMatter?.clientIds[0];
  const userRole = user?.type === 'firmUser' ? user.firmRole : undefined;

  return (
    <div className="space-y-6">
      {filterByMatterId && currentMatter && (
        <MatterActionRibbon 
            matterId={filterByMatterId} 
            matterType={currentMatter.type} 
            primaryClientId={primaryClientIdForRibbon} 
            currentPathname={currentPathname} 
        />
      )}
      <h1 className="text-3xl font-bold text-foreground">
        {filterByMatterId && currentMatter ? `Billing for Matter: ${currentMatter.name}` : (filterByMatterId ? `Billing for Matter: ${filterByMatterId}` : "Billing & Time Tracking")}
      </h1>
      <Tabs defaultValue="time-entries">
        <TabsList className="mb-4">
          <TabsTrigger value="time-entries">Time Entries</TabsTrigger>
          <TabsTrigger value="invoicing" disabled>Invoicing (Coming Soon)</TabsTrigger>
        </TabsList>
        <TabsContent value="time-entries" className="space-y-6">
          <Card className="shadow-xl">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle className="flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary" />Recorded Time Entries</CardTitle>
              {canManageBilling(userRole) && (
                <Button 
                    onClick={() => openGlobalTimeEntryDialog(null, { 
                        date: new Date().toISOString().split('T')[0], 
                        isBillable: true, 
                        matterId: filterByMatterId || undefined, 
                        clientId: currentMatter?.clientIds[0]?.toString() || undefined 
                    })} 
                    className="w-full sm:w-auto"
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Manual Entry
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {filteredTimeEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Matter</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Billable</TableHead>
                        <TableHead>Invoiced</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTimeEntries.map(entry => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell>{entry.clientName || getContactNameById(entry.clientId)}</TableCell>
                          <TableCell>{entry.matterName || getMatterNameById(entry.matterId)}</TableCell>
                          <TableCell>{formatDuration(entry.durationMinutes)}</TableCell>
                          <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                          <TableCell>{entry.isBillable ? 'Yes' : 'No'}</TableCell>
                          <TableCell>{entry.isInvoiced ? 'Yes' : 'No'}</TableCell>
                          <TableCell className="text-right space-x-1">
                             <TooltipProvider>
                                {canManageBilling(userRole) && (
                                    <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button onClick={() => openGlobalTimeEntryDialog(entry)} variant="ghost" size="icon">
                                        <Edit2 className="h-4 w-4 text-blue-600" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Edit Entry</p></TooltipContent>
                                    </Tooltip>
                                )}
                                {canDeleteTimeEntry(userRole) && (
                                    <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button onClick={() => handleDelete(entry.id)} variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Delete Entry</p></TooltipContent>
                                    </Tooltip>
                                )}
                             </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle className="mx-auto h-12 w-12 text-primary/50 mb-4" />
                  <p className="text-lg font-semibold">No Time Entries Found</p>
                  <p className="text-sm">{filterByMatterId ? "No time entries for this matter." : "Use the timer in the header or add a manual entry."}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="invoicing">
          <Card className="shadow-xl">
            <CardHeader><CardTitle>Client Invoicing</CardTitle></CardHeader>
            <CardContent>
               <div className="text-center py-12 text-muted-foreground">
                    <Info className="mx-auto h-12 w-12 text-primary/50 mb-4" />
                    <p className="text-lg font-semibold">Feature Coming Soon</p>
                    <p className="text-sm max-w-md mx-auto">
                        This section will allow attorneys to generate invoices from billable time entries, send them to clients, and track payment statuses.
                    </p>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    
