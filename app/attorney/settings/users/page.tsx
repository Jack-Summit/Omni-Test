
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"; // Added CardDescription
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Users2, ShieldAlert } from 'lucide-react';
import { MOCK_FIRM_USERS_DATA } from '@/lib/mock-data';
import type { User as FirmUser, FirmUserRole } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const ALL_ROLES: FirmUserRole[] = ['Admin', 'Attorney', 'Paralegal', 'Staff'];

export default function UserManagementPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [firmUsers, setFirmUsers] = useState<FirmUser[]>([]);
  const firmId = user?.firmId;

  useEffect(() => {
    if (!isAuthLoading && (!user || user.type !== 'firmUser' || user.firmRole !== 'Admin')) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to view this page.",
        variant: "destructive",
      });
      router.replace('/attorney/dashboard');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (firmId) {
      setFirmUsers(MOCK_FIRM_USERS_DATA.filter(fu => fu.firmId === firmId));
    }
  }, [firmId]);

  const handleRoleChange = (userId: string, newRole: FirmUserRole) => {
    if (userId === user?.id) {
      toast({ title: "Action Denied", description: "You cannot change your own role.", variant: "destructive" });
      return;
    }
    // In a real app, this would be an API call
    const userIndex = MOCK_FIRM_USERS_DATA.findIndex(u => u.id === userId && u.firmId === firmId);
    if (userIndex !== -1) {
      MOCK_FIRM_USERS_DATA[userIndex].firmRole = newRole;
      setFirmUsers([...MOCK_FIRM_USERS_DATA.filter(fu => fu.firmId === firmId)]); // Update local state
      toast({ title: "Role Updated", description: `User's role changed to ${newRole}.` });
    }
  };

  if (isAuthLoading || !user || user.type !== 'firmUser' || user.firmRole !== 'Admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading or unauthorized...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <Users2 className="mr-3 h-8 w-8 text-primary" />
          User Management
        </h1>
        <Button variant="outline" onClick={() => router.push('/attorney/settings')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Settings
        </Button>
      </div>

      {firmUsers.length === 0 && (
        <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
                <ShieldAlert className="mx-auto h-10 w-10 text-primary/50 mb-3"/>
                <p>No other users found for your firm, or you are the only user.</p>
            </CardContent>
        </Card>
      )}

      {firmUsers.length > 0 && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Firm Users</CardTitle>
            <CardDescription>Manage roles for users in your firm: {user?.firmId}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead className="w-[200px]">Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {firmUsers.map((firmUser) => (
                    <TableRow key={firmUser.id}>
                      <TableCell className="font-medium">{firmUser.name}</TableCell>
                      <TableCell>{firmUser.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          firmUser.firmRole === 'Admin' ? 'bg-primary text-primary-foreground' :
                          firmUser.firmRole === 'Attorney' ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-200' :
                          firmUser.firmRole === 'Paralegal' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-200' :
                          firmUser.firmRole === 'Staff' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-200' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {firmUser.firmRole}
                        </span>
                      </TableCell>
                      <TableCell>
                        {firmUser.id === user.id ? (
                          <span className="text-xs text-muted-foreground italic">Cannot change own role</span>
                        ) : (
                          <Select
                            value={firmUser.firmRole}
                            onValueChange={(newRole) => handleRoleChange(firmUser.id, newRole as FirmUserRole)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {ALL_ROLES.map(role => (
                                <SelectItem key={role} value={role} className="text-xs">
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
