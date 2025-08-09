
"use client";

import React, { useMemo } from 'react'; // Added useMemo
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare } from 'lucide-react';
import Link from 'next/link';
import { MOCK_TASKS_DATA, MOCK_MATTERS_DATA } from '@/lib/mock-data'; // Added MOCK_MATTERS_DATA
import type { Task, MatterType } from '@/lib/types'; // Added MatterType
import { MATTER_TYPES } from '@/lib/types'; // Added MATTER_TYPES

interface UpcomingTasksWidgetProps {
  firmId?: string;
}

// Helper function to get matter dashboard link
const getMatterDashboardLink = (matterId?: string, matterType?: MatterType): string => {
  if (!matterId || !matterType) return '#';
  let dashboardSlug = 'estate-planning'; // Default
  if (matterType === MATTER_TYPES.TRUST_ADMINISTRATION) {
    dashboardSlug = 'trust-administration';
  } else if (matterType === MATTER_TYPES.PROSPECT) {
    dashboardSlug = 'prospect';
  }
  // Add other matter types if they have specific dashboard slugs
  return `/attorney/matters/${matterId}/${dashboardSlug}`;
};


export function UpcomingTasksWidget({ firmId }: UpcomingTasksWidgetProps) {
  const tasksToDisplay = useMemo(() => {
    return MOCK_TASKS_DATA.filter(
      task => task.firmId === firmId && task.status !== 'Completed'
    ).slice(0, 4).map(task => {
      const matterDetails = task.matterId ? MOCK_MATTERS_DATA.find(m => m.id === task.matterId && m.firmId === firmId) : undefined;
      return {
        ...task,
        matterName: matterDetails?.name,
        matterType: matterDetails?.type,
      };
    });
  }, [firmId]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-base font-semibold text-primary">Upcoming Tasks</CardTitle>
        <CheckSquare className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3 pt-4">
        {tasksToDisplay.length > 0 ? (
          <ul className="space-y-3">
            {tasksToDisplay.map(task => (
              <li key={task.id} className="p-3 bg-muted/30 rounded-md border border-border/60 hover:shadow-sm transition-shadow">
                <div className="flex flex-wrap justify-between items-start gap-x-4 gap-y-1">
                  <div className="flex-grow min-w-[150px]">
                    <p className="font-semibold text-foreground text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.clientId && task.client ? (
                        <>Client: <Link href={`/attorney/contacts/${task.clientId}${task.matterId ? `?matterId=${task.matterId}` : ''}`} className="text-primary hover:underline">{task.client}</Link></>
                      ) : (
                        <>Client: N/A</>
                      )}
                      {task.matterId && task.matterName ? (
                        <> | Matter: <Link href={getMatterDashboardLink(task.matterId, task.matterType)} className="text-primary hover:underline">{task.matterName}</Link></>
                      ) : (
                        task.matterId ? <> | Matter: {task.matterId}</> : ''
                      )}
                    </p>
                  </div>
                  <div className="text-xs text-right space-y-0.5 flex-shrink-0">
                    <span className={`block whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${
                      task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300' :
                      task.status === 'Pending' || task.status === 'To Do' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' :
                      'bg-gray-500/20 text-gray-700 dark:text-gray-300' 
                    }`}>
                      {task.status}
                    </span>
                    <p className="text-muted-foreground">Due: {task.dueDate}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">No upcoming tasks for your firm.</p>
        )}
      </CardContent>
      <div className="p-4 border-t border-border mt-auto">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/attorney/tasks">View All Tasks</Link>
        </Button>
      </div>
    </Card>
  );
}
