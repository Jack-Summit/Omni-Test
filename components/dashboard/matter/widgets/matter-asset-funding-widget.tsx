
"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Banknote, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { MOCK_ASSETS_DATA } from '@/lib/mock-data';
import type { Asset } from '@/lib/types';

interface MatterAssetFundingWidgetProps {
  matterId: string;
}

export function MatterAssetFundingWidget({ matterId }: MatterAssetFundingWidgetProps) {
  const fundingAssets = useMemo(() => MOCK_ASSETS_DATA.filter(a => a.matterId === matterId), [matterId]);

  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    return parseFloat(value.replace(/[^0-9.-]+/g,""));
  };

  const totalEstimatedValue = useMemo(() => {
    return fundingAssets.reduce((sum, asset) => sum + parseCurrency(asset.value), 0);
  }, [fundingAssets]);

  const fundingProgress = useMemo(() => {
    if (fundingAssets.length === 0) return 0;
    const fundedCount = fundingAssets.filter(asset => asset.status === 'Funded').length;
    return Math.round((fundedCount / fundingAssets.length) * 100);
  }, [fundingAssets]);
  
  const getAssetStatusColor = (status: Asset['status']) => {
    if (status === 'Funded') return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100';
    if (status === 'Pending Titling') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100';
    if (status === 'Not Funded' || status === 'To Be Titled') return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100';
  };

  const getFundingProgressColorClass = (progress: number): string => {
    if (progress <= 33) {
      return 'bg-destructive'; // Red
    } else if (progress <= 66) {
      return 'bg-accent';    // Yellow/Gold
    } else {
      return 'bg-primary';   // Green/Teal
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Asset Funding Overview</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3">
        <div className="mb-3 p-2 bg-primary/10 rounded text-sm text-primary border border-primary/20">
            <p>Total Estimated Value: <span className="font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalEstimatedValue)}</span></p>
             <div className="flex items-center gap-2 mt-1">
                <span className="text-xs">Funding Progress:</span>
                <div className="flex-grow bg-muted rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full ${getFundingProgressColorClass(fundingProgress)}`} 
                        style={{ width: `${fundingProgress}%` }}
                    ></div>
                </div>
                <span className="font-semibold text-xs">{fundingProgress}%</span>
            </div>
        </div>
        {fundingAssets.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {fundingAssets.slice(0, 5).map(asset => ( // Show up to 5 assets for brevity
              <li key={asset.id} className="p-2 border-b border-border/50 last:border-b-0">
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">{asset.name}</span>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${getAssetStatusColor(asset.status)}`}>{asset.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">Value: {asset.value}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-muted-foreground text-sm text-center py-4">No assets being tracked for this matter.</p>}
      </CardContent>
      <div className="p-4 border-t border-border mt-auto">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/attorney/assets?matterId=${matterId}`}>Manage All Assets & Funding</Link>
        </Button>
      </div>
    </Card>
  );
}
