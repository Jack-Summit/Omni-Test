
"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Info } from 'lucide-react';
import { MOCK_ASSETS_DATA, MOCK_MATTERS_DATA, getCurrentUserMockClient } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import type { Asset } from '@/lib/types';

export default function ClientAssetsPage() {
  const { user } = useAuth();

  const currentUserMockClient = getCurrentUserMockClient(user?.id); // Changed to user?.id
  const clientFirmId = currentUserMockClient?.firmId;

  const clientAssets: Asset[] = useMemo(() => {
    if (!currentUserMockClient || !clientFirmId) return [];

    const clientMatterIds = MOCK_MATTERS_DATA
      .filter(m => m.clientIds.includes(currentUserMockClient.id) && m.firmId === clientFirmId)
      .map(m => m.id);
    
    return MOCK_ASSETS_DATA.filter(asset => 
      clientMatterIds.includes(asset.matterId) &&
      asset.firmId === clientFirmId
    );
  }, [currentUserMockClient, clientFirmId]);

  return (
    <Card className="bg-white/90 text-card-foreground shadow-xl">
      <CardHeader className="flex flex-row items-center space-x-2">
        <DollarSign className="h-6 w-6 text-primary" />
        <CardTitle className="text-2xl">My Assets</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This section displays information about your assets as recorded by your attorney. For any changes or updates, please contact your attorney directly.
        </p>
        
        {clientAssets.length > 0 ? (
          <ul className="space-y-4">
            {clientAssets.map(asset => (
              <li key={asset.id} className="p-4 bg-card border border-border rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-foreground">{asset.name}</h4>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        asset.status === 'Funded' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
                        asset.status === 'Pending Titling' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100' :
                        'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'}`}>{asset.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">Value: {asset.value}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">Related Matter ID: {asset.matterId}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-6">No asset information has been recorded or shared with you yet.</p>
        )}

        <div className="mt-6 p-3 bg-accent/10 border border-accent/30 rounded-lg text-accent-foreground/80 text-sm">
          <div className="flex items-center">
            <Info className="inline w-5 h-5 mr-2 text-accent" />
            <span>Asset information is view-only. Contact your attorney for any modifications.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

