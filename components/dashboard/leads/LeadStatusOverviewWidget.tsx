
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, PieChart } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as ChartTooltip, Legend } from 'recharts';
import { LeadStatus, LEAD_STATUS_OPTIONS } from '@/lib/types';

interface LeadStatusOverviewWidgetProps {
  firmId?: string;
}

const MOCK_LEAD_STATUS_DATA = [
  { name: LeadStatus.NEW_INQUIRY, count: 12 },
  { name: LeadStatus.INITIAL_CONTACT_MADE, count: 8 },
  { name: LeadStatus.CONSULTATION_SCHEDULED, count: 5 },
  { name: LeadStatus.PROPOSAL_SENT, count: 3 },
  { name: LeadStatus.CLOSED_WON, count: 10 },
  { name: LeadStatus.CLOSED_LOST, count: 4 },
];

export function LeadStatusOverviewWidget({ firmId }: LeadStatusOverviewWidgetProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-base font-semibold text-primary">Lead Status Overview</CardTitle>
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow pt-4">
        {MOCK_LEAD_STATUS_DATA.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_LEAD_STATUS_DATA} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                tickLine={false} 
                axisLine={false} 
                fontSize={10}
                width={80}
                interval={0}
               />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-1 gap-1.5">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {payload[0].payload.name}
                          </span>
                          <span className="font-bold text-foreground">
                            {payload[0].value} Leads
                          </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">No lead status data available.</p>
        )}
      </CardContent>
    </Card>
  );
}
