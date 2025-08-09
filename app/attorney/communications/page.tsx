
"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation'; // Added imports
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare, Info } from 'lucide-react';
import { MatterActionRibbon } from '@/components/layout/matter-action-ribbon'; // Import the ribbon
import { MOCK_MATTERS_DATA } from '@/lib/mock-data';
import type { Matter } from '@/lib/types';

export default function CommunicationLogPage() {
  const searchParams = useSearchParams();
  const currentPathname = usePathname();
  const filterByMatterId = searchParams.get('matterId');

  const [currentMatter, setCurrentMatter] = useState<Matter | null>(null);

  useEffect(() => {
    if (filterByMatterId) {
      const matter = MOCK_MATTERS_DATA.find(m => m.id === filterByMatterId);
      setCurrentMatter(matter || null);
    } else {
      setCurrentMatter(null);
    }
  }, [filterByMatterId]);

  const primaryClientIdForRibbon = currentMatter?.clientIds[0];

  return (
    <div className="space-y-6">
        {filterByMatterId && currentMatter && (
          <MatterActionRibbon matterId={filterByMatterId} primaryClientId={primaryClientIdForRibbon} currentPathname={currentPathname} />
        )}
        <h1 className="text-3xl font-bold text-foreground">
          {filterByMatterId ? `Communications for Matter ${currentMatter?.name || filterByMatterId}` : "Communication Logs"}
        </h1>
        <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Activity Stream</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                    <Info className="mx-auto h-12 w-12 text-primary/50 mb-4" />
                    <p className="text-lg font-semibold">Feature Coming Soon</p>
                    <p className="text-sm max-w-md mx-auto">
                        This section will allow attorneys to log calls, emails, and meetings related to specific clients or matters. You'll be able to filter by client, date, type, and more.
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
