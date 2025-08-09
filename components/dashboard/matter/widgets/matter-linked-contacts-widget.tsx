
"use client";

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, Link as LinkIcon } from 'lucide-react';
import NextLink from 'next/link'; // Using NextLink to avoid conflict with lucide-react Link icon
import { MOCK_MATTERS_DATA, MOCK_CONTACTS_DATA } from '@/lib/mock-data';
import type { Contact, Matter } from '@/lib/types';

interface MatterLinkedContactsWidgetProps {
  matterId: string;
}

export function MatterLinkedContactsWidget({ matterId }: MatterLinkedContactsWidgetProps) {
  const matter = useMemo(() => MOCK_MATTERS_DATA.find(m => m.id === matterId), [matterId]);

  const linkedContacts = useMemo(() => {
    if (!matter || !matter.firmId) return [];
    return matter.clientIds
      .map(clientId => MOCK_CONTACTS_DATA.find(c => c.id.toString() === clientId.toString() && c.firmId === matter.firmId))
      .filter(contact => contact !== undefined) as Contact[];
  }, [matter]);

  const getPrimaryEmail = (contact: Contact): string | undefined => {
    return contact.emails?.find(e => e.isPrimary)?.address || contact.emails?.[0]?.address;
  };

  const getPrimaryPhone = (contact: Contact): string | undefined => {
    return contact.phones?.find(p => p.isPrimary)?.number || contact.phones?.[0]?.number;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Linked Contacts</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-3 pr-1">
        {linkedContacts.length > 0 ? (
          <ul className="space-y-3">
            {linkedContacts.map(contact => (
              <li key={contact.id} className="p-2.5 bg-muted/40 rounded-md border border-border/50">
                <div className="flex justify-between items-start">
                  <NextLink href={`/attorney/contacts/${contact.id}?matterId=${matterId}`} className="font-semibold text-primary hover:underline text-sm">
                    {contact.name}
                  </NextLink>
                  <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                    {contact.category}
                  </span>
                </div>
                {getPrimaryEmail(contact) && (
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center">
                    <Mail size={12} className="mr-1.5 text-primary/70" /> {getPrimaryEmail(contact)}
                  </p>
                )}
                {getPrimaryPhone(contact) && (
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center">
                    <Phone size={12} className="mr-1.5 text-primary/70" /> {getPrimaryPhone(contact)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">No contacts directly linked to this matter as clients.</p>
        )}
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <NextLink href={`/attorney/contacts?matterId=${matterId}`}>
            <LinkIcon className="mr-2 h-4 w-4" /> View All Matter Contacts
          </NextLink>
        </Button>
      </CardFooter>
    </Card>
  );
}
