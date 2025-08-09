"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Info } from 'lucide-react';

export default function EducationalResourcesPage() {
  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Educational Resources</h1>
        <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                    <Info className="mx-auto h-12 w-12 text-primary/50 mb-4" />
                    <p className="text-lg font-semibold">Feature Coming Soon</p>
                    <p className="text-sm max-w-md mx-auto">
                       This space will be dedicated to educational content, including articles, diagrams, and contextual information. Attorneys can use this to access helpful information or provide resources to their clients on various estate planning topics.
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
