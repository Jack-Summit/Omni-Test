
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { FileCheck2, MailWarning, FileInput } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDateToMMDDYYYY } from '@/lib/utils'; // <-- Added import

interface IntakeFormCompletionWidgetProps {
  firmId?: string;
}

const MOCK_INTAKE_FORMS = [
  { id: 'if1', leadName: 'Ingrid Bergman', status: 'Completed', dateSent: '2024-05-15', dateCompleted: '2024-05-17' },
  { id: 'if2', leadName: 'James Stewart', status: 'Sent', dateSent: '2024-05-20', dateCompleted: null },
  { id: 'if3', leadName: 'Katherine Hepburn', status: 'In Progress', dateSent: '2024-05-18', dateCompleted: null },
];

export function IntakeFormCompletionWidget({ firmId }: IntakeFormCompletionWidgetProps) {
  
  const getStatusBadgeVariant = (status: string) => {
    if (status === 'Completed') return 'default';
    if (status === 'Sent') return 'outline';
    if (status === 'In Progress') return 'secondary';
    return 'secondary';
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-base font-semibold text-primary">Intake Form Status</CardTitle>
        <FileInput className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3 pt-4">
        {MOCK_INTAKE_FORMS.length > 0 ? (
          <ul className="space-y-3">
            {MOCK_INTAKE_FORMS.map(form => (
              <li key={form.id} className="p-3 bg-muted/30 rounded-md border border-border/60 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-foreground text-sm">{form.leadName}</p>
                        <p className="text-xs text-muted-foreground">Sent: {formatDateToMMDDYYYY(form.dateSent)} {form.dateCompleted && `| Completed: ${formatDateToMMDDYYYY(form.dateCompleted)}`}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(form.status)} className="text-xs">{form.status}</Badge>
                </div>
                <div className="mt-2 pt-2 border-t border-border/30 flex flex-wrap gap-1.5">
                    {form.status !== 'Completed' && <Button variant="outline" size="xs"><MailWarning className="mr-1 h-3 w-3"/>Resend Form</Button>}
                    {form.status === 'Completed' && <Button variant="outline" size="xs"><FileCheck2 className="mr-1 h-3 w-3"/>Review Form</Button>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">No intake forms currently tracked.</p>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-border mt-auto">
        <Button variant="outline" size="sm" className="w-full">Manage Intake Forms</Button>
      </CardFooter>
    </Card>
  );
}
