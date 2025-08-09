
"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from 'lucide-react';
import Link from 'next/link';
import { MOCK_CLIENT_DOCUMENTS_DATA } from '@/lib/mock-data';
import type { Document as DocType } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface ClientKeyDocumentsWidgetProps {
  firmId?: string;
  clientId?: string | number;
}

export function ClientKeyDocumentsWidget({ firmId, clientId }: ClientKeyDocumentsWidgetProps) {
  const keyDocuments = useMemo(() => {
    if (!firmId || !clientId) return [];
    
    return MOCK_CLIENT_DOCUMENTS_DATA
      .filter(doc => doc.firmId === firmId && doc.clientId === clientId) // Ensure firmId matches
      .sort((a, b) => parseISO(b.dateShared || b.dateUploaded || '1970-01-01').getTime() - parseISO(a.dateShared || a.dateUploaded || '1970-01-01').getTime())
      .slice(0, 3); 
  }, [firmId, clientId]);

  return (
    <Card className="h-full bg-card text-card-foreground shadow-lg border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-primary">Key Documents</CardTitle>
        <FileText className="h-5 w-5 text-primary/70" />
      </CardHeader>
      <CardContent className="space-y-3">
        {keyDocuments.length > 0 ? (
          <ul className="space-y-2">
            {keyDocuments.map(doc => (
              <li key={doc.id} className="p-3 bg-muted/30 rounded-md border border-border/50 text-sm flex justify-between items-center">
                <div>
                  <p className="font-medium text-foreground">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Type: {doc.type} | Shared: {doc.dateShared ? format(parseISO(doc.dateShared), 'MMM d, yyyy') : 'N/A'} | Size: {doc.size}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="text-primary/80 hover:text-primary">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download {doc.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">No key documents shared yet.</p>
        )}
        <Button variant="outline" size="sm" className="w-full mt-4" asChild>
          <Link href="/client/documents">View All Documents</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

