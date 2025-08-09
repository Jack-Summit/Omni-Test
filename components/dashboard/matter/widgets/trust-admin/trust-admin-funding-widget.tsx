
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ListChecks } from 'lucide-react';
import Link from 'next/link';

interface TrustAdminFundingWidgetProps {
  matterId: string;
}

export function TrustAdminFundingWidget({ matterId }: TrustAdminFundingWidgetProps) {
  // Placeholder data
  const totalAssetsValue = 1250000;
  const assetsTransferred = 2;
  const totalAssetsToTransfer = 5;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Trust Funding & Asset Transfer</CardTitle>
        <ListChecks className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3">
        <p className="text-sm text-muted-foreground">
          Total Est. Value of Trust Assets: <span className="font-semibold text-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAssetsValue)}</span>
        </p>
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Assets Transferred: {assetsTransferred}/{totalAssetsToTransfer}</p>
            {/* Progress bar could go here */}
        </div>
        <ul className="text-xs space-y-1 text-muted-foreground">
            <li>- Notice to Beneficiaries Sent: [Date]</li>
            <li>- Inventory Filed: [Date/Status]</li>
            <li>- Tax ID (EIN) Obtained: [Yes/No]</li>
        </ul>
         <p className="text-xs text-muted-foreground text-center pt-2">
            (Detailed checklist and transfer tracking coming soon)
        </p>
      </CardContent>
       <div className="p-4 border-t border-border mt-auto">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/attorney/assets?matterId=${matterId}&view=trustAdmin`}>Manage Asset Transfers</Link>
        </Button>
      </div>
    </Card>
  );
}
    