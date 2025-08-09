
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, AlertTriangle, Landmark, Info, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface FinancialOverviewWidgetProps {
  matterId: string;
}

export function FinancialOverviewWidget({ matterId }: FinancialOverviewWidgetProps) {
  // Placeholder data - replace with actual data fetching
  const financialData = {
    workInProgress: {
      total: 1250.00,
      unbilled: 1000.00,
      draft: 250.00,
    },
    outstandingBalance: 7631.50,
    trustFunds: 500.00,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Card className="h-full flex flex-col shadow-lg border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <CreditCard className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">Financial Overview</CardTitle>
            </div>
            <Button variant="outline" size="sm" asChild>
                <Link href={`/attorney/billing?matterId=${matterId}`}>Manage Billing</Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Work in Progress Card */}
          <Card className="bg-muted/30 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between text-foreground">
                Work in Progress
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent><p>Unbilled and draft billable time/expenses.</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 flex-grow flex flex-col justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(financialData.workInProgress.total)}</p>
                <div className="text-xs text-muted-foreground">
                  <p>Unbilled: {formatCurrency(financialData.workInProgress.unbilled)}</p>
                  <p>Draft: {formatCurrency(financialData.workInProgress.draft)}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="w-full mt-2">Quick Bill</Button>
            </CardContent>
          </Card>

          {/* Outstanding Balance Card */}
          <Card className="bg-muted/30 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between text-foreground">
                Outstanding Balance
                 <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent><p>Total amount due from unpaid invoices.</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex items-center">
                  {financialData.outstandingBalance > 0 && <AlertTriangle className="h-6 w-6 text-destructive mr-2" />}
                  <p className={`text-2xl font-bold ${financialData.outstandingBalance > 0 ? 'text-destructive' : 'text-foreground'}`}>
                    {formatCurrency(financialData.outstandingBalance)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground h-[30px]">
                  {financialData.outstandingBalance > 0 ? "Payment is overdue." : "No outstanding balance."}
                </p>
              </div>
              <Button variant="secondary" size="sm" className="w-full mt-2">View Bills</Button>
            </CardContent>
          </Card>

          {/* Matter Trust Funds Card */}
          <Card className="bg-muted/30 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between text-foreground">
                Matter Trust Funds
                 <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent><p>Funds held in the client's trust account for this matter.</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex items-center">
                  <Landmark className="h-6 w-6 text-green-600 mr-2" />
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(financialData.trustFunds)}</p>
                </div>
                <p className="text-xs text-muted-foreground h-[30px]">
                  {financialData.trustFunds > 0 ? "Funds available." : "No funds in trust."}
                </p>
              </div>
              <Button variant="secondary" size="sm" className="w-full mt-2">New Request</Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
