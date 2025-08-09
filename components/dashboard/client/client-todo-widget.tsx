
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ListTodo } from 'lucide-react';
import { MOCK_CLIENT_TODO_DATA, MOCK_MATTERS_DATA } from '@/lib/mock-data';
import type { ClientToDoItem } from '@/lib/types';

interface ClientToDoWidgetProps {
  firmId?: string;
  clientId?: string | number;
}

const ClientToDoWidgetComponent: React.FC<ClientToDoWidgetProps> = ({ firmId, clientId }) => {
  const [clientTodos, setClientTodos] = useState<ClientToDoItem[]>([]);

  useEffect(() => {
    if (firmId && typeof clientId !== 'undefined' && clientId !== null) {
      const currentClientIdStr = clientId.toString();
      const clientMatterIds = MOCK_MATTERS_DATA
        .filter(m => m.firmId === firmId && m.clientIds.includes(currentClientIdStr))
        .map(m => m.id);

      // Initialize local state from a snapshot of the mock data
      const todosForClient = MOCK_CLIENT_TODO_DATA.filter(todo =>
        todo.firmId === firmId && todo.matterId && clientMatterIds.includes(todo.matterId)
      ).map(todo => ({ ...todo })); // Create shallow copies for local state

      setClientTodos(todosForClient.sort((a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()));
    } else {
      setClientTodos([]);
    }
  }, [firmId, clientId]);

  const handleToggleComplete = useCallback((todoId: string) => {
    setClientTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === todoId
          ? {
              ...todo,
              isCompleted: !todo.isCompleted,
              dateCompleted: !todo.isCompleted ? new Date().toISOString().split('T')[0] : undefined,
            }
          : todo
      )
    );
    // Removed direct modification of MOCK_CLIENT_TODO_DATA
  }, []); // No external dependencies needed for local state update logic

  const incompleteTodos = useMemo(() => clientTodos.filter(todo => !todo.isCompleted), [clientTodos]);
  const completedTodos = useMemo(() => clientTodos.filter(todo => todo.isCompleted), [clientTodos]);

  return (
    <Card className="h-full flex flex-col bg-card text-card-foreground shadow-lg border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-primary">My To-Do List</CardTitle>
        <ListTodo className="h-5 w-5 text-primary/70" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3 pr-1">
        {clientTodos.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">You have no assigned to-do items at the moment.</p>
        ) : (
          <>
            {incompleteTodos.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Pending Items</h4>
                <ul className="space-y-1.5">
                  {incompleteTodos.map(todo => (
                    <li key={todo.id} className="flex items-start space-x-2 p-2.5 bg-muted/30 border rounded-md hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id={`client-todo-${todo.id}`}
                        checked={todo.isCompleted}
                        onCheckedChange={() => handleToggleComplete(todo.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-grow">
                        <label htmlFor={`client-todo-${todo.id}`} className="text-sm font-medium leading-none text-foreground cursor-pointer">
                          {todo.title}
                        </label>
                        {todo.description && <p className="text-xs text-muted-foreground">{todo.description}</p>}
                        <p className="text-xs text-muted-foreground/70">Added: {todo.dateAdded}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {completedTodos.length > 0 && incompleteTodos.length > 0 && <hr className="my-3 border-border/50"/>}
            {completedTodos.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Completed Items</h4>
                <ul className="space-y-1.5">
                  {completedTodos.map(todo => (
                    <li key={todo.id} className="flex items-start space-x-2 p-2.5 bg-muted/20 border border-transparent rounded-md opacity-70">
                      <Checkbox
                        id={`client-todo-${todo.id}`}
                        checked={todo.isCompleted}
                        onCheckedChange={() => handleToggleComplete(todo.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-grow">
                        <label htmlFor={`client-todo-${todo.id}`} className="text-sm font-medium leading-none line-through text-muted-foreground cursor-pointer">
                          {todo.title}
                        </label>
                        {todo.description && <p className="text-xs line-through text-muted-foreground/70">{todo.description}</p>}
                        <p className="text-xs text-muted-foreground/60">Completed: {todo.dateCompleted}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const ClientToDoWidget = React.memo(ClientToDoWidgetComponent);
