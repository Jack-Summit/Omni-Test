
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { NotebookText, PlusCircle } from 'lucide-react';
import { MOCK_NOTES_DATA } from '@/lib/mock-data';
import type { Note } from '@/lib/types';
import { toast } from "@/hooks/use-toast";

interface MatterNotesWidgetProps {
  matterId: string;
}

export function MatterNotesWidget({ matterId }: MatterNotesWidgetProps) {
  const [matterNotes, setMatterNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    // In a real app, you'd fetch notes for matterId
    setMatterNotes(MOCK_NOTES_DATA(matterId).map((note, index) => ({...note, id: `note-${matterId}-${index}`})));
  }, [matterId]);

  const handleAddNote = () => {
    if (newNote.trim() === '') {
      toast({ title: "Empty Note", description: "Cannot add an empty note.", variant: "destructive"});
      return;
    }
    const noteToAdd: Note = { 
      id: `note-${matterId}-${Date.now()}`, 
      date: new Date().toLocaleDateString('en-CA'), 
      note: newNote 
    };
    setMatterNotes(prev => [noteToAdd, ...prev]); // Prepend new note
    setNewNote('');
    toast({ title: "Note Added", description: "Your note has been added to the matter." });
  };

  return (
    <Card id="matter-notes-card" className="h-full flex flex-col"> {/* Added ID for potential anchor linking */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Case Notes & Timeline</CardTitle>
        <NotebookText className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col space-y-3 overflow-hidden">
        <Textarea 
          placeholder="Add a new note or log an event..." 
          rows={3} 
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="mb-1 text-sm"
        />
        <div className="text-right">
          <Button size="sm" onClick={handleAddNote}><PlusCircle className="mr-2 h-3 w-3" />Add Note</Button>
        </div>
        <div className="flex-grow mt-2 space-y-2 overflow-y-auto pr-1">
          {matterNotes.length > 0 ? matterNotes.map((noteEntry) => (
            <div key={noteEntry.id || noteEntry.date} className="text-xs p-2 bg-muted/40 rounded border border-border/50">
              <span className="font-semibold text-muted-foreground">{noteEntry.date}:</span>
              <p className="text-foreground whitespace-pre-wrap">{noteEntry.note}</p>
            </div>
          )) : <p className="text-xs text-muted-foreground text-center py-2">No notes added yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
