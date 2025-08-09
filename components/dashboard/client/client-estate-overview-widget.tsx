
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { NotebookText, Info } from 'lucide-react'; // Using NotebookText as an example icon

export function ClientEstateOverviewWidget() {
  return (
    <Card className="h-full bg-card text-card-foreground shadow-lg border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-primary">Estate Overview</CardTitle>
        <NotebookText className="h-5 w-5 text-primary/70" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center py-6 text-muted-foreground">
            <Info className="mx-auto h-8 w-8 text-primary/40 mb-3" />
            <p className="text-sm">
                Detailed estate overview information will appear here once shared by your attorney.
            </p>
            <p className="text-xs mt-1">
                This section will provide a summary of your estate plan key details.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
