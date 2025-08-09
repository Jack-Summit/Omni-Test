
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info, Landmark } from 'lucide-react';

interface TrustAdminOverviewWidgetProps {
  matterId: string;
}

export function TrustAdminOverviewWidget({ matterId }: TrustAdminOverviewWidgetProps) {
  // In a real app, fetch data based on matterId
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Trust Admin Overview</CardTitle>
        <Landmark className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        <div className="text-center py-6 text-muted-foreground">
            <Info className="mx-auto h-8 w-8 text-primary/40 mb-3" />
            <p className="text-sm">
                Trust Administration overview, key dates, and asset gathering status will appear here.
            </p>
            <p className="text-xs mt-1">
                (Feature in development for Trust Admin specific data)
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
    