
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, NotebookText as NotebookTextIcon, AlertTriangle, Edit2, Trash2, Save } from 'lucide-react';
import { MOCK_MATTERS_DATA, MOCK_CONTACTS_DATA, MOCK_NOTES_DATA, getFirmUserNameById } from '@/lib/mock-data';
import type { Matter, Contact, Note, ContactCategory, FirmUserRole } from '@/lib/types';
import { toast } from "@/hooks/use-toast";
import { MatterActionRibbon } from '@/components/layout/matter-action-ribbon';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MatterNotesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const currentPathname = usePathname();
  const matterId = params.matterId as string;
  const firmId = user?.firmId;

  const [matter, setMatter] = useState<Matter | null>(null);
  const [clients, setClients] = useState<Contact[]>([]);
  const [primaryClientId, setPrimaryClientId] = useState<string | number | undefined>(undefined);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (matterId && firmId) {
      const foundMatter = MOCK_MATTERS_DATA.find(m => m.id === matterId && m.firmId === firmId);
      if (foundMatter) {
        setMatter({
          ...foundMatter,
          responsibleAttorneyName: getFirmUserNameById(foundMatter.responsibleAttorneyId)
        });
        const matterClients = MOCK_CONTACTS_DATA.filter(c => foundMatter.clientIds.includes(c.id) && c.category === "Client" as ContactCategory && c.firmId === firmId);
        setClients(matterClients);
        if (matterClients.length > 0) setPrimaryClientId(matterClients[0].id);
        
        const matterSpecificNotes = MOCK_NOTES_DATA(matterId)
                                  .map((note, index) => ({...note, id: note.id || `note-${matterId}-${index}`}))
                                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNotes(matterSpecificNotes);
      } else {
        setMatter(null);
        toast({ title: "Error", description: "Matter not found or access denied.", variant: "destructive" });
        router.push('/attorney/matters');
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
       if (!firmId) toast({ title: "Error", description: "Firm context not available.", variant: "destructive"});
       if (!matterId) toast({ title: "Error", description: "Matter ID not available.", variant: "destructive"});
    }
  }, [matterId, firmId, router]);

  const handleAddNote = () => {
    if (!newNoteText.trim()) {
      toast({ title: "Cannot Add Empty Note", description: "Please enter some text for your note.", variant: "destructive" });
      return;
    }
    if (!user?.name || !firmId) {
      toast({ title: "Error", description: "User or firm information is missing.", variant: "destructive" });
      return;
    }

    const newNote: Note = {
      id: `note-${matterId}-${Date.now()}`,
      date: new Date().toISOString(), 
      note: newNoteText.trim(),
      author: user.name, 
    };

    const matterNotesArray = MOCK_NOTES_DATA(matterId); // Get the current array for this matter
    matterNotesArray.unshift(newNote); // Modify the array "in place" (or the copy if it's a copy)

    setNotes(prevNotes => [newNote, ...prevNotes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setNewNoteText('');
    toast({ title: "Note Added", description: "Your note has been successfully added." });
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id || null);
    setEditText(note.note);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditText('');
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) {
      toast({ title: "Cannot Save Empty Note", description: "Note content cannot be empty.", variant: "destructive" });
      return;
    }
    if (!editingNoteId) return;

    setNotes(prevNotes =>
      prevNotes.map(n =>
        n.id === editingNoteId ? { ...n, note: editText, date: new Date().toISOString() } : n
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );

    const matterNotesArray = MOCK_NOTES_DATA(matterId);
    const noteIndex = matterNotesArray.findIndex(n => n.id === editingNoteId);
    if (noteIndex !== -1) {
      matterNotesArray[noteIndex] = { ...matterNotesArray[noteIndex], note: editText, date: new Date().toISOString() };
    }
    
    toast({ title: "Note Updated", description: "Your note has been successfully updated." });
    handleCancelEdit();
  };

  const handleDeleteNote = (noteIdToDelete: string) => {
    setNotes(prevNotes => prevNotes.filter(n => n.id !== noteIdToDelete));

    const matterNotesArray = MOCK_NOTES_DATA(matterId);
    const noteIndex = matterNotesArray.findIndex(n => n.id === noteIdToDelete);
    if (noteIndex !== -1) {
      matterNotesArray.splice(noteIndex, 1);
    }
    toast({ title: "Note Deleted", description: "The note has been removed.", variant: "destructive" });
  };
  
  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy, h:mm a');
    } catch (e) {
      try { return format(new Date(dateString), 'MM/dd/yyyy, h:mm a'); }
      catch (err) { return dateString; }
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading notes...</div>;
  }

  if (!matter) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive">Matter not found.</p>
        <Button onClick={() => router.push('/attorney/matters')} variant="outline" className="mt-4">
          Back to Matters
        </Button>
      </div>
    );
  }
  
  const userRole = user?.type === 'firmUser' ? user.firmRole : undefined;
  const canManageNotes = ['Admin', 'Attorney', 'Paralegal', 'Staff'].includes(userRole || '');

  return (
    <div className="space-y-6">
      <MatterActionRibbon matterId={matterId} matterType={matter.type} primaryClientId={primaryClientId} currentPathname={currentPathname} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 p-4 bg-card shadow rounded-lg border">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <NotebookTextIcon className="mr-3 h-8 w-8 text-primary" />
            Notes for Matter: {matter.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Client(s): {clients.map(c => c.name).join(', ') || 'N/A'}
          </p>
        </div>
      </div>

      {canManageNotes && (
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle>Add New Note</CardTitle>
            </CardHeader>
            <CardContent>
            <Textarea
                placeholder="Type your note here..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                rows={4}
                className="mb-3"
            />
            </CardContent>
            <CardFooter className="flex justify-end">
            <Button onClick={handleAddNote}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Note
            </Button>
            </CardFooter>
        </Card>
      )}

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Existing Notes ({notes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length > 0 ? (
            <ScrollArea className="h-[60vh] pr-3">
              <ul className="space-y-4">
                {notes.map((note) => (
                  <li key={note.id} className="p-4 bg-muted/50 rounded-lg border border-border shadow-sm">
                    {editingNoteId === note.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="text-sm"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                          <Button size="sm" onClick={handleSaveEdit}><Save className="mr-1.5 h-3.5 w-3.5"/> Save</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs text-muted-foreground font-medium">
                            {formatDateForDisplay(note.date)}
                            {note.author && <span className="ml-2">by {note.author}</span>}
                          </p>
                          {canManageNotes && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600 hover:bg-blue-100" onClick={() => handleStartEdit(note)}>
                                <Edit2 className="h-3.5 w-3.5" />
                                <span className="sr-only">Edit note</span>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span className="sr-only">Delete note</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the note.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteNote(note.id!)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{note.note}</p>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <AlertTriangle className="mx-auto h-10 w-10 text-primary/50 mb-3" />
              <p className="text-md">No notes found for this matter yet.</p>
              {canManageNotes && <p className="text-sm mt-1">Use the form above to add the first note.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
