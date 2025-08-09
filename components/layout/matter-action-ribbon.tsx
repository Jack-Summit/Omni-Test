
"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { FolderOpen, FilePlus2, CheckSquare, MessageSquare, NotebookText, CreditCard, CalendarDays, FileText as FileTextIcon, DollarSign, Users, ClipboardList } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MATTER_TYPES, type MatterType } from '@/lib/types';

interface MatterActionRibbonProps {
  matterId: string;
  matterType: MatterType;
  primaryClientId?: string | number;
  currentPathname: string;
}

export function MatterActionRibbon({ matterId, matterType, primaryClientId, currentPathname }: MatterActionRibbonProps) {
  const searchParams = useSearchParams();

  const matterActionRibbonItems = useMemo(() => {
    let dashboardSlug = 'estate-planning'; // Default
    if (matterType === MATTER_TYPES.TRUST_ADMINISTRATION) {
      dashboardSlug = 'trust-administration';
    } else if (matterType === MATTER_TYPES.PROSPECT) {
      dashboardSlug = 'prospect';
    }
    const dashboardLink = `/attorney/matters/${matterId}/${dashboardSlug}`;
    const notesLink = `/attorney/matters/${matterId}/notes`; // Updated link

    const baseItems = [
      { name: 'Dashboard', href: dashboardLink, icon: FolderOpen, pageSlug: dashboardSlug },
      { name: 'Contacts', href: `/attorney/contacts?matterId=${matterId}`, icon: Users, pageSlug: 'contacts' },
      { name: 'Tasks', href: `/attorney/tasks?matterId=${matterId}`, icon: CheckSquare, pageSlug: 'tasks' },
      { name: 'Communications', href: `/attorney/communications?matterId=${matterId}`, icon: MessageSquare, pageSlug: 'communications' },
      { name: 'Notes', href: notesLink, icon: NotebookText, pageSlug: 'notes' },
      { name: 'Calendar', href: `/attorney/calendar?matterId=${matterId}`, icon: CalendarDays, pageSlug: 'calendar' },
    ];

    if (matterType === MATTER_TYPES.ESTATE_PLANNING) {
      return [
        ...baseItems,
        { name: 'Estate Overview', href: `/attorney/matters/${matterId}/estate-overview`, icon: ClipboardList, pageSlug: 'estate-overview' },
        { name: 'Create Document', href: `/attorney/matters/${matterId}/create-document${primaryClientId ? `?clientId=${primaryClientId}` : ''}`, icon: FilePlus2, pageSlug: 'create-document' },
        { name: 'Documents', href: `/attorney/documents?matterId=${matterId}`, icon: FileTextIcon, pageSlug: 'documents' },
        { name: 'Funding', href: `/attorney/assets?matterId=${matterId}`, icon: DollarSign, pageSlug: 'assets' },
        { name: 'Bills', href: `/attorney/billing?matterId=${matterId}`, icon: CreditCard, pageSlug: 'billing' },
      ].sort((a,b) => {
          const order = ['Dashboard', 'Estate Overview', 'Create Document', 'Documents', 'Funding', 'Calendar', 'Contacts', 'Tasks', 'Communications', 'Notes', 'Bills'];
          return order.indexOf(a.name) - order.indexOf(b.name);
      });
    } else if (matterType === MATTER_TYPES.TRUST_ADMINISTRATION) {
      return [
        ...baseItems,
        { name: 'Estate Overview', href: `/attorney/matters/${matterId}/estate-overview`, icon: ClipboardList, pageSlug: 'estate-overview' },
        { name: 'Documents', href: `/attorney/documents?matterId=${matterId}`, icon: FileTextIcon, pageSlug: 'documents' },
        { name: 'Funding', href: `/attorney/assets?matterId=${matterId}`, icon: DollarSign, pageSlug: 'assets' },
        { name: 'Bills', href: `/attorney/billing?matterId=${matterId}`, icon: CreditCard, pageSlug: 'billing' },
      ].sort((a,b) => {
          const order = ['Dashboard', 'Estate Overview', 'Documents', 'Funding', 'Calendar', 'Contacts', 'Tasks', 'Communications', 'Notes', 'Bills'];
          return order.indexOf(a.name) - order.indexOf(b.name);
      });
    } else if (matterType === MATTER_TYPES.PROSPECT) {
      return [
        baseItems.find(item => item.pageSlug === dashboardSlug)!,
        baseItems.find(item => item.pageSlug === 'contacts')!,
        baseItems.find(item => item.pageSlug === 'tasks')!,
        baseItems.find(item => item.pageSlug === 'communications')!,
        baseItems.find(item => item.pageSlug === 'notes')!,
        baseItems.find(item => item.pageSlug === 'calendar')!,
        { name: 'Documents', href: `/attorney/documents?matterId=${matterId}`, icon: FileTextIcon, pageSlug: 'documents' },
      ].filter(Boolean).sort((a,b) => {
          const order = ['Dashboard', 'Documents', 'Calendar', 'Contacts', 'Tasks', 'Communications', 'Notes'];
          return order.indexOf(a.name) - order.indexOf(b.name);
      });
    }
    return [
        ...baseItems,
        { name: 'Documents', href: `/attorney/documents?matterId=${matterId}`, icon: FileTextIcon, pageSlug: 'documents' },
        { name: 'Bills', href: `/attorney/billing?matterId=${matterId}`, icon: CreditCard, pageSlug: 'billing' },
    ].sort((a,b) => {
        const order = ['Dashboard', 'Documents', 'Calendar', 'Contacts', 'Tasks', 'Communications', 'Notes', 'Bills'];
        return order.indexOf(a.name) - order.indexOf(b.name);
    });
  }, [matterId, matterType, primaryClientId]);

  return (
    <div className="mb-6 border-b border-border">
      <div className="flex space-x-1 overflow-x-auto pb-2">
        {matterActionRibbonItems.map((item) => {
          let finalIsActive = false;
          const itemBaseHref = item.href ? item.href.split('?')[0].split('#')[0] : '';
          const currentMatterIdFromQuery = searchParams.get('matterId');

           if (currentPathname === itemBaseHref) {
             finalIsActive = true;
           } else if (['documents', 'calendar', 'tasks', 'billing', 'communications', 'assets', 'contacts', 'notes'].includes(item.pageSlug)) {
             finalIsActive = currentPathname === `/attorney/${item.pageSlug}` && currentMatterIdFromQuery === matterId;
           } else if (item.pageSlug === 'create-document' && currentPathname.startsWith(itemBaseHref)) {
             finalIsActive = true;
           }


          return (
            <Button
              key={item.name}
              variant={finalIsActive ? "default" : "ghost"}
              size="sm"
              asChild
              className={cn("text-xs sm:text-sm whitespace-nowrap h-9 px-3",
                           finalIsActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Link href={item.href || '#'}>
                {item.icon && <item.icon className="mr-1.5 h-4 w-4" />}
                {item.name}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
