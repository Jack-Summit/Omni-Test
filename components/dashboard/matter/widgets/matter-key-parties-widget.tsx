
"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UsersRound } from 'lucide-react';
import { MOCK_KEY_PARTIES_DATA } from '@/lib/mock-data';
import type { KeyParty } from '@/lib/types';

interface MatterKeyPartiesWidgetProps {
  matterId: string;
}

export function MatterKeyPartiesWidget({ matterId }: MatterKeyPartiesWidgetProps) {
  const keyParties = useMemo(() => MOCK_KEY_PARTIES_DATA(matterId), [matterId]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Key Parties & Roles</CardTitle>
        <UsersRound className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-2">
        {keyParties.length > 0 ? (
            <ul className="space-y-1.5 text-sm">
                {keyParties.map(party => (
                <li key={party.role} className="flex justify-between p-1.5 bg-muted/30 rounded-md border items-baseline">
                    <span className="font-medium text-muted-foreground text-xs">{party.role}:</span>
                    <span className="text-foreground text-right text-sm">{party.name}</span>
                </li>
                ))}
            </ul>
        ) : (
             <p className="text-muted-foreground text-sm text-center py-4">No key parties defined for this matter.</p>
        )}
      </CardContent>
    </Card>
  );
}
