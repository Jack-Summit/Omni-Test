
"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, Download, FilePlus2 } from 'lucide-react';
import Link from 'next/link';
import { MOCK_DOCUMENTS_DATA } from '@/lib/mock-data';
import type { Document as DocType } from '@/lib/types';

interface MatterDocumentsWidgetProps {
  matterId: string;
}

export function MatterDocumentsWidget({ matterId }: MatterDocumentsWidgetProps) {
  const matterDocuments = useMemo(() => 
    MOCK_DOCUMENTS_DATA.filter(d => d.matterId === matterId).slice(0, 4), // Show up to 4 documents
    [matterId]
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Matter Documents</CardTitle>
        <Archive className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3">
        {matterDocuments.length > 0 ? (
          <ul className="divide-y divide-border">
            {matterDocuments.map(doc => (
              <li key={doc.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-primary hover:underline cursor-pointer">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">Type: {doc.type} | Added: {doc.dateUploaded} | Size: {doc.size}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
              </li>
            ))}
          </ul>
        ) : <p className="text-muted-foreground text-sm text-center py-4">No documents for this matter.</p>}
      </CardContent>
      <div className="p-4 border-t border-border mt-auto flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/attorney/documents?matterId=${matterId}`}>Manage Documents</Link>
        </Button>
         <Button variant="default" size="sm" className="flex-1" asChild>
            <Link href={`/attorney/matters/${matterId}/create-document`}>
                <FilePlus2 className="mr-1.5 h-3.5 w-3.5" /> Create New
            </Link>
        </Button>
      </div>
    </Card>
  );
}
