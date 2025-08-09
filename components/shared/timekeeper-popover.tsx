"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TimerIcon, Play, Square, RotateCcw, ListChecks, Search, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_MATTERS_DATA, getContactNameById } from '@/lib/mock-data';
import type { Matter } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TimekeeperPopoverProps {
  triggerButton: React.ReactNode;
}

export function TimekeeperPopover({ triggerButton }: TimekeeperPopoverProps) {
  const {
    user,
    isGlobalTimerRunning, globalElapsedSeconds, formatTimer,
    startGlobalTimer, stopGlobalTimerAndLog, resetGlobalTimer,
    openGlobalTimeEntryDialog,
    globalTimerClient, setGlobalTimerClient,
    globalTimerMatter, setGlobalTimerMatter
  } = useAuth();
  const router = useRouter();
  const firmId = user?.firmId;

  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date());
  const [matterSearchTerm, setMatterSearchTerm] = useState('');
  const [isMatterListOpen, setIsMatterListOpen] = useState(false); // Controls visibility of the suggestions box

  useEffect(() => {
    if (globalTimerMatter && firmId) {
      const selectedMatterDetails = MOCK_MATTERS_DATA.find(m => m.id === globalTimerMatter && m.firmId === firmId);
      if (selectedMatterDetails) {
        if (selectedMatterDetails.name !== matterSearchTerm) {
          setMatterSearchTerm(selectedMatterDetails.name);
        }
        setIsMatterListOpen(false); // A matter is selected, close the list
      } else {
        // If globalTimerMatter is set but not found, clear search (could be an invalid ID)
        setMatterSearchTerm('');
        setIsMatterListOpen(false);
      }
    }
    // IMPORTANT: Do NOT add an 'else' clause here to clear matterSearchTerm if globalTimerMatter is empty.
    // Doing so would wipe out user input as they type before a matter is selected.
    // Clearing is handled by the 'X' button or by the user deleting text.
  }, [globalTimerMatter, firmId]); // matterSearchTerm intentionally omitted from deps


  const handleMatterSelectionChange = (matterId: string) => {
    const matter = MOCK_MATTERS_DATA.find(m => m.id === matterId && m.firmId === firmId);
    if (matter) {
      setGlobalTimerMatter(matterId);
      setMatterSearchTerm(matter.name);
      if (matter.clientIds.length > 0) {
        const primaryClientId = matter.clientIds[0].toString();
        setGlobalTimerClient(primaryClientId);
      } else {
        setGlobalTimerClient('');
      }
      setIsMatterListOpen(false); // Close the list after selection
    }
  };

  const handleTimerToggle = () => {
    if (isGlobalTimerRunning) {
      stopGlobalTimerAndLog();
    } else {
      if (!globalTimerMatter) {
        toast({title: "Matter Required", description: "Please select a matter to start the timer.", variant: "destructive"});
        return;
      }
      startGlobalTimer(globalTimerClient, globalTimerMatter);
      setIsMatterListOpen(false); // Close suggestions when timer starts
    }
  };

  const handleResetAndClearSearch = () => {
    resetGlobalTimer();
    setMatterSearchTerm(''); // Explicitly clear search term
    setIsMatterListOpen(false); // Ensure suggestions list is closed
  };
  
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setMatterSearchTerm(newSearchTerm);

    if (!isGlobalTimerRunning) {
      if (newSearchTerm.trim().length > 0) {
        setIsMatterListOpen(true); // Open the list if there's text
      } else {
        setIsMatterListOpen(false); // Close if text is cleared
        // If input is cleared, also clear global selection if one was made
        if (globalTimerMatter) {
            setGlobalTimerMatter('');
            setGlobalTimerClient('');
        }
      }
    }
  };

  const filteredMatters = useMemo(() => {
    if (!firmId) return [];
    const firmMatters = MOCK_MATTERS_DATA.filter(m => m.firmId === firmId && m.type !== "Prospect");
    if (!matterSearchTerm.trim()) {
      return []; // Return empty if no search term, so nothing shows initially
    }
    return firmMatters.filter(m =>
      m.name.toLowerCase().includes(matterSearchTerm.toLowerCase()) ||
      (getContactNameById(m.clientIds[0]) || '').toLowerCase().includes(matterSearchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(matterSearchTerm.toLowerCase())
    );
  }, [matterSearchTerm, firmId]);
  
  return (
    <Popover onOpenChange={(open) => { if (isGlobalTimerRunning && !open) return; /* Prevent closing if timer running */ }}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none text-lg text-foreground">Timekeeper</h4>
            <Button variant="ghost" size="sm" onClick={() => router.push('/attorney/billing')}>
                <ListChecks className="mr-2 h-4 w-4" /> View All
            </Button>
          </div>
          
          <div className="text-3xl font-mono text-center p-3 bg-background rounded-md border">
            {formatTimer(globalElapsedSeconds)}
          </div>

          <div className="space-y-1">
            <label htmlFor="matterSearchInput" className="text-xs font-medium text-muted-foreground">Search & Select Matter</label>
            <div className="relative flex items-center">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                    id="matterSearchInput"
                    type="text"
                    placeholder="Type to search matters..."
                    value={matterSearchTerm}
                    onChange={handleSearchInputChange}
                    onFocus={() => { 
                        if (!isGlobalTimerRunning && matterSearchTerm.trim().length > 0) {
                            setIsMatterListOpen(true); 
                        }
                    }}
                    disabled={isGlobalTimerRunning}
                    className="h-9 text-xs pl-8 flex-grow"
                />
                {globalTimerMatter && !isGlobalTimerRunning && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleResetAndClearSearch}
                        className="absolute right-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                        aria-label="Clear selected matter"
                    >
                        <XCircle className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {isMatterListOpen && !isGlobalTimerRunning && (
                <div className="relative mt-1"> {/* This div is the "box below" the user refers to */}
                    <div className="absolute z-10 w-full bg-popover border rounded-md shadow-lg max-h-60">
                        <ScrollArea className="h-auto max-h-56">
                            {filteredMatters.length > 0 ? (
                                filteredMatters.map(m => (
                                <Button
                                    key={m.id}
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start text-left h-auto py-1.5 px-2 text-xs",
                                        globalTimerMatter === m.id && "bg-accent text-accent-foreground"
                                    )}
                                    onClick={() => handleMatterSelectionChange(m.id)}
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
                                    {matterSearchTerm.trim().length === 0 ? "Type to search non-prospect matters..." : "No matters found."}
                                </p>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            )}
          </div>


          <div className="flex justify-center space-x-2 pt-2">
            <Button 
              onClick={handleTimerToggle} 
              variant={isGlobalTimerRunning ? "destructive" : "default"} 
              size="sm" 
              className="flex-1"
              disabled={!globalTimerMatter && !isGlobalTimerRunning}
            >
              {isGlobalTimerRunning ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isGlobalTimerRunning ? 'Stop & Log' : 'Start Timer'}
            </Button>
            <Button onClick={handleResetAndClearSearch} variant="outline" size="sm" disabled={globalElapsedSeconds === 0 && !isGlobalTimerRunning && !globalTimerMatter}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground py-2 border-t mt-2">
             {globalTimerMatter 
                ? <p className="text-xs">Timing for: <span className="font-semibold">{MOCK_MATTERS_DATA.find(m=>m.id===globalTimerMatter)?.name || globalTimerMatter}</span></p>
                : <p className="text-xs">No matter selected for timer.</p>
            }
          </div>

          <Button 
            onClick={() => {
                const currentMatterDetails = MOCK_MATTERS_DATA.find(m => m.id === globalTimerMatter);
                const clientForTimer = currentMatterDetails && currentMatterDetails.clientIds.length > 0 
                                     ? currentMatterDetails.clientIds[0].toString() 
                                     : '';

                openGlobalTimeEntryDialog(null, {
                clientId: clientForTimer, 
                matterId: globalTimerMatter || undefined, 
                date: currentDisplayDate.toISOString().split('T')[0] 
                });
            }} 
            variant="default" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!globalTimerMatter}
          >
            <TimerIcon className="mr-2 h-4 w-4" /> New Manual Time Entry
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
