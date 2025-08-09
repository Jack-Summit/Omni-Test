
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"; // Added CardFooter
import { Scale } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface TrustAdminUtcRequirementsWidgetProps {
  matterId: string;
}

export function TrustAdminUtcRequirementsWidget({ matterId }: TrustAdminUtcRequirementsWidgetProps) {
  // Placeholder - In a real app, this would fetch OR/WA specific UTC data
  // or link to relevant internal resources.
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">UTC & State Requirements</CardTitle>
        <Scale className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-2">
        <p className="text-xs text-muted-foreground">
          Summary of key Uniform Trust Code (UTC) and state-specific (OR/WA)
          requirements for trust administration.
        </p>
        <ul className="text-xs list-disc list-inside space-y-1 text-muted-foreground">
            <li>Notice to Beneficiaries (UTC §813)</li>
            <li>Duty to Inform and Report (UTC §813)</li>
            <li>Annual Accountings (State Specific)</li>
            <li>Prudent Investor Rule (UTC §902)</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-2">
          (Detailed checklist and state-specific guidance coming soon)
        </p>
      </CardContent>
      <CardFooter className="pt-4 border-t">
          <Button variant="link" size="sm" className="p-0 h-auto text-xs">
              View State Compliance Guide
          </Button>
      </CardFooter>
    </Card>
  );
}
    
