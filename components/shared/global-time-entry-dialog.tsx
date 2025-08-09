
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Search, XCircle } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_CONTACTS_DATA, MOCK_MATTERS_DATA, getContactNameById, getMatterNameById } from '@/lib/mock-data';
import type { TimeEntry, TimeEntryFormData, Matter, ContactCategory } from '@/lib/types';
import { toast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const timeEntryFormSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format." }),
  durationHours: z.coerce.number().min(0).max(23),
  durationMinutes: z.coerce.number().min(0).max(59),
  description: z.string().min(1, { message: "Description is required." }),
  clientId: z.string().min(1, { message: "Client association is required (derived from Matter)." }), // Still required for data integrity
  matterId: z.string().min(1, { message: "Matter selection is required." }),
  isBillable: z.boolean(),
}).refine(data => data.durationHours > 0 || data.durationMinutes > 0, {
  message: "Duration must be greater than 0 minutes.",
  path: ["durationHours"], // or path: ["durationMinutes"] or both
});

export function GlobalTimeEntryDialog() {
  const { 
    user,
    showGlobalTimeEntryDialog, 
    closeGlobalTimeEntryDialog, 
    globalTimeEntryEditing, 
    globalTimeEntryInitialData,
    addTimeEntry,
    updateTimeEntry
  } = useAuth();
  const firmId = user?.firmId;

  const [matterSearchTermDialog, setMatterSearchTermDialog] = useState('');
  const [isMatterListOpenDialog, setIsMatterListOpenDialog] = useState(false);

  const form = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntryFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      durationHours: 0,
      durationMinutes: 30,
      description: '',
      clientId: '', // Will be set programmatically
      matterId: '',
      isBillable: true,
    },
  });
  
  const allFirmMattersDialog = useMemo(() => {
    if (!firmId) return [];
    return MOCK_MATTERS_DATA.filter(m => m.firmId === firmId && m.type !== "Prospect");
  }, [firmId]);

  const filteredMattersForDialog = useMemo(() => {
    if (!matterSearchTermDialog.trim()) {
      return [];
    }
    return allFirmMattersDialog.filter(m =>
      m.name.toLowerCase().includes(matterSearchTermDialog.toLowerCase()) ||
      (getContactNameById(m.clientIds[0]) || '').toLowerCase().includes(matterSearchTermDialog.toLowerCase()) ||
      m.id.toLowerCase().includes(matterSearchTermDialog.toLowerCase())
    );
  }, [matterSearchTermDialog, allFirmMattersDialog]);


  useEffect(() => {
    if (showGlobalTimeEntryDialog) {
      setMatterSearchTermDialog(''); // Reset search term when dialog opens/changes
      setIsMatterListOpenDialog(false);
      if (globalTimeEntryEditing) {
        const hours = Math.floor(globalTimeEntryEditing.durationMinutes / 60);
        const minutes = globalTimeEntryEditing.durationMinutes % 60;
        form.reset({
          date: globalTimeEntryEditing.date,
          durationHours: hours,
          durationMinutes: minutes,
          description: globalTimeEntryEditing.description,
          clientId: globalTimeEntryEditing.clientId.toString(), // Ensure clientId is set for form
          matterId: globalTimeEntryEditing.matterId,
          isBillable: globalTimeEntryEditing.isBillable,
        });
        const matterName = MOCK_MATTERS_DATA.find(m => m.id === globalTimeEntryEditing.matterId)?.name;
        if (matterName) setMatterSearchTermDialog(matterName);

      } else if (globalTimeEntryInitialData) {
         form.reset({
          date: globalTimeEntryInitialData.date || new Date().toISOString().split('T')[0],
          durationHours: globalTimeEntryInitialData.durationHours || 0,
          durationMinutes: globalTimeEntryInitialData.durationMinutes || 0,
          description: globalTimeEntryInitialData.description || '',
          clientId: globalTimeEntryInitialData.clientId || '', // Ensure clientId is set for form
          matterId: globalTimeEntryInitialData.matterId || '',
          isBillable: globalTimeEntryInitialData.isBillable !== undefined ? globalTimeEntryInitialData.isBillable : true,
        });
        const matterName = MOCK_MATTERS_DATA.find(m => m.id === globalTimeEntryInitialData.matterId)?.name;
        if (matterName) setMatterSearchTermDialog(matterName);

      } else {
        form.reset({
          date: new Date().toISOString().split('T')[0],
          durationHours: 0,
          durationMinutes: 30,
          description: '',
          clientId: '', // Reset client ID
          matterId: '',
          isBillable: true,
        });
      }
    }
  }, [showGlobalTimeEntryDialog, globalTimeEntryEditing, globalTimeEntryInitialData, form]);

  const handleDialogMatterSelection = (matter: Matter) => {
    form.setValue('matterId', matter.id);
    const primaryClientId = matter.clientIds[0]?.toString() || '';
    form.setValue('clientId', primaryClientId); // Set client ID based on selected matter
    setMatterSearchTermDialog(matter.name);
    setIsMatterListOpenDialog(false);
  };
  
  const handleDialogSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setMatterSearchTermDialog(newSearchTerm);
    if (newSearchTerm.trim().length > 0) {
        setIsMatterListOpenDialog(true);
    } else {
        setIsMatterListOpenDialog(false);
        form.setValue('matterId', '');
        form.setValue('clientId', '');
    }
  };

  const clearDialogMatterSelection = () => {
    setMatterSearchTermDialog('');
    form.setValue('matterId', '');
    form.setValue('clientId', '');
    setIsMatterListOpenDialog(false);
  };

  const onSubmit = (data: TimeEntryFormData) => {
    const totalMinutes = (data.durationHours * 60) + data.durationMinutes;
    const newEntryData: Omit<TimeEntry, 'id' | 'isInvoiced' | 'clientName' | 'matterName' | 'firmId'> = {
      date: data.date,
      durationMinutes: totalMinutes,
      description: data.description,
      clientId: data.clientId, // This is now derived from selected matter
      matterId: data.matterId,
      isBillable: data.isBillable,
      attorneyId: user?.id,
      attorneyName: user?.name,
    };

    if (globalTimeEntryEditing) {
      const updatedEntry: TimeEntry = {
        ...globalTimeEntryEditing,
        ...newEntryData,
        clientName: getContactNameById(data.clientId),
        matterName: getMatterNameById(data.matterId),
        firmId: user?.firmId || '', // Ensure firmId is present
      };
      updateTimeEntry(updatedEntry);
      toast({ title: "Time Entry Updated", description: "The time entry has been successfully updated." });
    } else {
      const newEntry: TimeEntry = {
        id: `TE${Date.now().toString()}`,
        ...newEntryData,
        clientName: getContactNameById(data.clientId),
        matterName: getMatterNameById(data.matterId),
        isInvoiced: false,
        firmId: user?.firmId || '', // Ensure firmId is present
      };
      addTimeEntry(newEntry);
      toast({ title: "Time Entry Added", description: "The time entry has been successfully recorded." });
    }
    closeGlobalTimeEntryDialog();
  };

  if (!showGlobalTimeEntryDialog) {
    return null;
  }

  return (
    <Dialog open={showGlobalTimeEntryDialog} onOpenChange={(isOpen) => { if (!isOpen) closeGlobalTimeEntryDialog(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{globalTimeEntryEditing ? "Edit Time Entry" : "Add New Time Entry"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="durationHours" render={({ field }) => (
                <FormItem><FormLabel>Hours</FormLabel><FormControl><Input type="number" min="0" max="23" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="durationMinutes" render={({ field }) => (
                <FormItem><FormLabel>Minutes</FormLabel><FormControl><Input type="number" min="0" max="59" step="1" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>

            {/* Searchable Matter Field */}
            <FormField
              control={form.control}
              name="matterId"
              render={({ field }) => ( // field is for matterId, but UI uses matterSearchTermDialog
                <FormItem>
                  <FormLabel>Matter</FormLabel>
                  <Popover open={isMatterListOpenDialog} onOpenChange={setIsMatterListOpenDialog}>
                    <PopoverTrigger asChild>
                      <div className="relative flex items-center">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Search and select matter..."
                            value={matterSearchTermDialog}
                            onChange={handleDialogSearchInputChange}
                            onFocus={() => { if (matterSearchTermDialog.trim()) setIsMatterListOpenDialog(true);}}
                            className="h-9 text-xs pl-8 flex-grow"
                            autoComplete="off"
                          />
                        </FormControl>
                        {form.getValues("matterId") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={clearDialogMatterSelection}
                            className="absolute right-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                            aria-label="Clear selected matter"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 mt-1" align="start">
                       <ScrollArea className="h-auto max-h-56">
                          {filteredMattersForDialog.length > 0 ? (
                            filteredMattersForDialog.map(m => (
                              <Button
                                key={m.id}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start text-left h-auto py-1.5 px-2 text-xs",
                                    field.value === m.id && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => handleDialogMatterSelection(m)}
                                type="button" // Important: prevent form submission
                              >
                                <div>
                                    <div className="font-medium">{m.name}</div>
                                    <div className="text-muted-foreground text-[11px]">
                                        Client: {getContactNameById(m.clientIds[0]) || 'N/A'} (ID: {m.id})
                                    </div>
                                </div>
                              </Button>
                            ))
                          ) : (
                            <p className="p-2 text-xs text-center text-muted-foreground">
                                {matterSearchTermDialog.trim().length === 0 ? "Type to search non-prospect matters..." : "No matters found."}
                            </p>
                          )}
                        </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Hidden field to hold clientId, its value is set programmatically */}
            <FormField control={form.control} name="clientId" render={({ field }) => <input type="hidden" {...field} />} />


            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Detailed description of work performed..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="isBillable" render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Billable</FormLabel>
                  <FormDescription>Is this time entry billable to the client?</FormDescription>
                </div>
              </FormItem>
            )}/>
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline" onClick={closeGlobalTimeEntryDialog}>Cancel</Button></DialogClose>
              <Button type="submit">
                <PlusCircle className="mr-2 h-4 w-4" /> {globalTimeEntryEditing ? "Save Changes" : "Add Time Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

