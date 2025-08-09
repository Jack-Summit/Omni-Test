
"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, CreditCard, Landmark, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUserMockClient } from '@/lib/mock-data';
import type { Contact } from '@/lib/types';

interface ClientFinancialSummaryWidgetProps {
  firmId?: string;
  clientId?: string | number;
}

const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined) return "N/A";
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export function ClientFinancialSummaryWidget({ firmId, clientId }: ClientFinancialSummaryWidgetProps) {
  const clientData = useMemo(() => {
    if (!clientId) return null;
    return getCurrentUserMockClient(clientId.toString());
  }, [clientId]);

  return (
    <Card className="h-full bg-card text-card-foreground shadow-lg border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-primary">My Financial Summary</CardTitle>
        <DollarSign className="h-5 w-5 text-primary/70" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted/30 rounded-md border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 text-destructive mr-2" />
              <p className="text-sm font-medium text-foreground">Outstanding Balance:</p>
            </div>
            <p className={`text-sm font-semibold ${clientData?.outstandingBalance && clientData.outstandingBalance > 0 ? 'text-destructive' : 'text-foreground'}`}>
              {formatCurrency(clientData?.outstandingBalance)}
            </p>
          </div>
           {clientData?.outstandingBalance && clientData.outstandingBalance > 0 && (
             <p className="text-xs text-destructive/80 mt-1 flex items-center"><AlertTriangle size={14} className="mr-1"/>Payment may be due.</p>
           )}
        </div>
        
        <div className="p-3 bg-muted/30 rounded-md border border-border/50">
          <div className="flex items-center justify-between">
             <div className="flex items-center">
              <Landmark className="h-4 w-4 text-green-600 mr-2" />
              <p className="text-sm font-medium text-foreground">Trust Account Funds:</p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(clientData?.trustAccountBalance)}
            </p>
          </div>
           {clientData?.trustAccountBalance !== undefined && clientData.trustAccountBalance <= 0 && (
             <p className="text-xs text-muted-foreground mt-1">No funds currently held in trust.</p>
           )}
        </div>

        <Button variant="outline" size="sm" className="w-full mt-3" asChild>
          <Link href="/client/billing-history">View Billing History</Link>
        </Button>
         <p className="text-xs text-muted-foreground text-center pt-1">
            For detailed statements or payment inquiries, please contact our office.
        </p>
      </CardContent>
    </Card>
  );
}
