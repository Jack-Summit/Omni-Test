"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SummarySectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const SummarySection: React.FC<SummarySectionProps> = ({ title, children, className }) => {
  return (
    <Card className={`my-4 shadow-md bg-card ${className}`}>
      <CardHeader className="py-3 px-4 bg-muted/30 border-b">
        <CardTitle className="text-lg font-semibold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-1.5">
        {children}
      </CardContent>
    </Card>
  );
};

interface SummaryItemProps {
  label: string;
  value: any;
  className?: string;
  isSubItem?: boolean;
}

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  };
};

export const renderValue = (value: any, isSubItem?: boolean): React.ReactNode => {
    if (value === null || value === undefined || value === '') {
        return <span className="italic text-muted-foreground/60">N/A</span>;
    }
    if (typeof value === 'boolean') {
        return value ? <span className="font-medium text-green-600">Yes</span> : <span className="font-medium text-red-600">No</span>;
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return <span className="italic text-muted-foreground/60">None</span>;
        return (
            <ul className={`list-disc list-inside pl-4 text-sm space-y-0.5 ${isSubItem ? 'text-xs' : ''}`}>
                {value.map((item, index) => (
                    <li key={index} className="text-foreground">
                        {typeof item === 'object' ? JSON.stringify(item, getCircularReplacer(), 2) : String(item)}
                    </li>
                ))}
            </ul>
        );
    }
    if (typeof value === 'object') {
        try {
            // For inline objects, display them more neatly or consider a specific renderer if structure is known
            const entries = Object.entries(value);
            if (entries.length === 0) return <span className="italic text-muted-foreground/60">Empty Object</span>;
            return (
                 <div className="pl-2 border-l-2 border-muted/50 my-1 space-y-0.5">
                    {entries.map(([key, val]) => (
                        <div key={key} className="flex">
                            <span className="text-muted-foreground/80 text-xs mr-1">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                            <span className="text-foreground text-xs">{renderValue(val, true)}</span>
                        </div>
                    ))}
                </div>
            );
        } catch (error) {
            console.warn("Error processing object in renderValue:", error);
            return <span className="italic text-destructive">[Error displaying object]</span>;
        }
    }
    return String(value);
};


export const SummaryItem: React.FC<SummaryItemProps> = ({ label, value, className, isSubItem }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-start py-1.5 border-b border-border/30 last:border-b-0 ${className} ${isSubItem ? 'py-0.5' : ''}`}>
      <dt className={`text-sm font-medium text-muted-foreground sm:w-2/5 pr-2 ${isSubItem ? 'text-xs sm:w-1/2' : 'sm:w-2/5'}`}>{label}:</dt>
      <dd className={`text-sm text-foreground mt-0.5 sm:mt-0 ${isSubItem ? 'text-xs sm:w-1/2' : 'sm:w-3/5'}`}>{renderValue(value, isSubItem)}</dd>
    </div>
  );
};

// Component for rendering a list of objects in a more structured way
interface SummaryObjectListProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  title?: string;
  className?: string;
}
export const SummaryObjectList: React.FC<SummaryObjectListProps> = ({ items, renderItem, title, className }) => {
  if (!items || items.length === 0) {
    return title ? <SummaryItem label={title} value="None specified" /> : <p className="italic text-muted-foreground/60">None specified</p>;
  }
  return (
    <div className={`space-y-2 ${className}`}>
      {title && <h4 className="font-semibold text-sm text-muted-foreground mt-2">{title}:</h4>}
      {items.map((item, index) => (
        <Card key={index} className="p-3 bg-background/70 shadow-sm border border-border/50">
          {renderItem(item, index)}
        </Card>
      ))}
    </div>
  );
};
