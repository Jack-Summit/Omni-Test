
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Info } from 'lucide-react';
import { MOCK_CLIENT_DOCUMENTS_DATA, getCurrentUserMockClient } from '@/lib/mock-data';
import type { Document as DocType } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientDocumentsPage() {
  const { user } = useAuth();
  
  const currentUserMockClient = getCurrentUserMockClient(user?.id); // Changed to user?.id
  const clientFirmId = currentUserMockClient?.firmId;

  const clientDocuments: DocType[] = React.useMemo(() => {
    if (!clientFirmId || !currentUserMockClient) return [];
    return MOCK_CLIENT_DOCUMENTS_DATA.filter(doc => 
      doc.firmId === clientFirmId && 
      (!doc.clientId || doc.clientId === currentUserMockClient.id)
    );
  }, [clientFirmId, currentUserMockClient]);

  return (
    <Card className="bg-white/90 text-card-foreground shadow-xl">
      <CardHeader className="flex flex-row items-center space-x-2">
        <FileText className="h-6 w-6 text-primary" />
        <CardTitle className="text-2xl">My Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-6">
          Here are the documents securely shared with you by your attorney. You can download them by clicking the download button.
        </p>
        {clientDocuments.length > 0 ? (
          <ul className="space-y-4">
            {clientDocuments.map(doc => (
              <li 
                key={doc.id} 
                className="p-4 bg-card border border-border rounded-xl shadow-sm hover:shadow-lg transition-all duration-150 ease-in-out flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div className="flex-grow">
                  <h3 className="font-semibold text-primary hover:underline cursor-pointer text-lg">{doc.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Type: {doc.type} | Shared: {doc.dateShared} | Size: {doc.size}
                  </p>
                </div>
                <Button variant="default" size="md" className="w-full sm:w-auto mt-2 sm:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Info className="mx-auto h-12 w-12 text-primary/50 mb-4" />
            <p className="text-lg">No documents have been shared with you yet.</p>
            <p className="text-sm mt-1">Your attorney will upload documents here when they are ready.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

