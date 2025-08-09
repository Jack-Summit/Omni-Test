
"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare } from 'lucide-react';
import Link from 'next/link';
import { MOCK_TASKS_DATA } from '@/lib/mock-data';
import type { Task } from '@/lib/types';

interface MatterPendingTasksWidgetProps {
  matterId: string;
}

export function MatterPendingTasksWidget({ matterId }: MatterPendingTasksWidgetProps) {
  const matterTasks = useMemo(() => 
    MOCK_TASKS_DATA.filter(t => t.matterId === matterId && t.status !== 'Completed').slice(0, 5), // Show up to 5 pending tasks
    [matterId]
  );

  const getTaskStatusColor = (status: Task['status']) => {
    if (status === 'In Progress') return 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100';
    if (status === 'Pending' || status === 'To Do') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100';
    if (status === 'Completed') return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
        <CheckSquare className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3">
        {matterTasks.length > 0 ? (
          <ul className="space-y-2.5">
            {matterTasks.map(task => (
              <li key={task.id} className="p-2.5 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getTaskStatusColor(task.status)}`}>{task.status}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="text-muted-foreground text-sm text-center py-4">No pending tasks for this matter.</p>}
      </CardContent>
       <div className="p-4 border-t border-border mt-auto">
        <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/attorney/tasks?matterId=${matterId}`}>View All Tasks</Link>
        </Button>
      </div>
    </Card>
  );
}
