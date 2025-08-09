
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, ListTodo, ClipboardCheck, CalendarPlus } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MOCK_CLIENT_TODO_DATA } from '@/lib/mock-data';
import type { ClientToDoItem, ClientToDoItemFormData } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface MatterClientToDoWidgetProps {
  matterId: string;
}

const clientToDoItemFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
});

export function MatterClientToDoWidget({ matterId }: MatterClientToDoWidgetProps) {
  const { user } = useAuth();
  const [todos, setTodos] = useState<ClientToDoItem[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const firmId = user?.firmId; // Assuming firmId is available from user context

  useEffect(() => {
    if (firmId) {
      setTodos(MOCK_CLIENT_TODO_DATA.filter(todo => todo.matterId === matterId && todo.firmId === firmId));
    }
  }, [matterId, firmId]);

  const form = useForm<ClientToDoItemFormData>({
    resolver: zodResolver(clientToDoItemFormSchema),
    defaultValues: { title: '', description: '' },
  });

  const handleAddToDo = (data: ClientToDoItemFormData) => {
    if (!firmId) {
      toast({ title: "Error", description: "Cannot add to-do without firm context.", variant: "destructive" });
      return;
    }
    const newTodo: ClientToDoItem = {
      id: `todo-${Date.now()}`,
      matterId,
      firmId,
      title: data.title,
      description: data.description,
      isCompleted: false,
      dateAdded: new Date().toISOString().split('T')[0],
      addedByAttorneyName: user?.name || 'Firm User',
    };
    MOCK_CLIENT_TODO_DATA.unshift(newTodo); // Add to global mock data
    setTodos(prev => [newTodo, ...prev]); // Update local state
    setShowAddDialog(false);
    form.reset();
    toast({ title: "To-Do Added", description: `"${data.title}" has been added to the client's checklist.` });
  };

  const handleToggleComplete = (todoId: string) => {
    const todoIndex = MOCK_CLIENT_TODO_DATA.findIndex(t => t.id === todoId && t.firmId === firmId);
    if (todoIndex !== -1) {
      const updatedTodo = { 
        ...MOCK_CLIENT_TODO_DATA[todoIndex], 
        isCompleted: !MOCK_CLIENT_TODO_DATA[todoIndex].isCompleted,
        dateCompleted: !MOCK_CLIENT_TODO_DATA[todoIndex].isCompleted ? new Date().toISOString().split('T')[0] : undefined
      };
      MOCK_CLIENT_TODO_DATA[todoIndex] = updatedTodo;
      setTodos(prev => prev.map(t => t.id === todoId ? updatedTodo : t));
    }
  };

  const handleApplyTemplate = () => {
    toast({
      title: "Feature Placeholder",
      description: "Applying a checklist template would be implemented here.",
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">Client To-Do Checklist</CardTitle>
          <span className="text-xs text-muted-foreground">(Items are sent directly to Client Portal)</span>
        </div>
        <ListTodo className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-2 pr-1">
        {todos.length > 0 ? (
          <ul className="space-y-2">
            {todos.map(todo => (
              <li key={todo.id} className="flex items-center space-x-2 p-2 bg-muted/40 border rounded-md hover:bg-muted/70 transition-colors">
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.isCompleted}
                  onCheckedChange={() => handleToggleComplete(todo.id)}
                />
                <div className="flex-grow">
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={`text-sm font-medium leading-none ${todo.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                  >
                    {todo.title}
                  </label>
                  {todo.description && <p className={`text-xs ${todo.isCompleted ? 'line-through text-muted-foreground/70' : 'text-muted-foreground'}`}>{todo.description}</p>}
                  <p className="text-xs text-muted-foreground/60">Added: {todo.dateAdded} {todo.dateCompleted ? `| Completed: ${todo.dateCompleted}` : ''}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">No to-do items for the client on this matter yet.</p>
        )}
      </CardContent>
      <CardFooter className="pt-4 border-t flex-col sm:flex-row gap-2">
        <Button variant="outline" size="sm" className="w-full sm:flex-1" onClick={() => setShowAddDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add To-Do Item
        </Button>
        <Button variant="secondary" size="sm" className="w-full sm:flex-1" onClick={handleApplyTemplate}>
          <CalendarPlus className="mr-2 h-4 w-4" /> Apply Template
        </Button>
      </CardFooter>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client To-Do Item</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddToDo)} className="space-y-4 py-2">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Sign Engagement Letter" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Additional details for the client..." {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <DialogFooter className="pt-4">
                <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                <Button type="submit">Add Item</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
    