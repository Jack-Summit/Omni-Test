"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, ShieldAlert } from 'lucide-react';

export default function ClientSettingsPage() {
  const { user } = useAuth();

  return (
    <Card className="bg-white/90 text-card-foreground shadow-xl">
      <CardHeader className="flex flex-row items-center space-x-2">
        <Settings className="h-6 w-6 text-primary" />
        <CardTitle className="text-2xl">Account Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Manage your account preferences and security settings.
        </p>
        
        <div className="space-y-2">
          <Label htmlFor="clientEmail" className="text-base">Email Address</Label>
          <Input 
            id="clientEmail" 
            type="email" 
            value={user?.email || "client@example.com"} 
            disabled 
            className="bg-muted/50 border-border text-base" 
          />
           <p className="text-xs text-muted-foreground">Your email address cannot be changed here. Please contact support if you need to update it.</p>
        </div>

        <div className="space-y-2">
            <Label htmlFor="clientName" className="text-base">Full Name</Label>
            <Input 
                id="clientName" 
                type="text" 
                value={user?.name || "Demo Client"} 
                disabled 
                className="bg-muted/50 border-border text-base" 
            />
        </div>
        
        <div>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 text-base">
            Change Password
          </Button>
        </div>

        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          <div className="flex items-center">
            <ShieldAlert className="inline w-5 h-5 mr-2" />
            <span>For security reasons, always ensure you are on the official EstateFlow portal before entering credentials.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
