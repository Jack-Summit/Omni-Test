
"use client";

import React, { useEffect, useState } // Added useState
from 'react';
import { AttorneySidebar } from '@/components/layout/attorney-sidebar';
import { AttorneyHeader } from '@/components/layout/attorney-header';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, LayoutDashboard, Target, Contact as ContactIcon, FolderKanban, CalendarDays, CheckSquare, FileText as FileTextIcon, MessageSquare, Bell, BookOpen, Settings, CreditCard, DollarSign, NotebookText as NotebookTextIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlobalTimeEntryDialog } from '@/components/shared/global-time-entry-dialog';
import { MOCK_CONTACTS_DATA, MOCK_MATTERS_DATA } from '@/lib/mock-data';
import type { FirmUserRole, MatterType } from '@/lib/types'; // Added MatterType
import { toast } from "@/hooks/use-toast";
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { MATTER_TYPES } from '@/lib/types';


const staticRoutesConfig: { [key: string]: { title: string; icon: LucideIcon } } = {
  '/attorney/dashboard': { title: 'Dashboard', icon: LayoutDashboard },
  '/attorney/leads': { title: 'Lead & Intake Dashboard', icon: Target },
  '/attorney/contacts': { title: 'Contact Management', icon: ContactIcon },
  '/attorney/matters': { title: 'Matter Management', icon: FolderKanban },
  '/attorney/calendar': { title: 'Attorney Calendar', icon: CalendarDays },
  '/attorney/tasks': { title: 'Task Management', icon: CheckSquare },
  '/attorney/documents': { title: 'Document Management', icon: FileTextIcon },
  '/attorney/billing': { title: 'Billing Management', icon: CreditCard },
  '/attorney/assets': { title: 'Asset Tracking', icon: DollarSign },
  '/attorney/communications': { title: 'Communication Logs', icon: MessageSquare },
  '/attorney/reminders': { title: 'Review Reminders', icon: Bell },
  '/attorney/resources': { title: 'Educational Resources', icon: BookOpen },
  '/attorney/settings': { title: 'Settings', icon: Settings },
};

const dynamicRoutesConfig: {
  regex: RegExp;
  paramNames: string[];
  titleFn: (params: any) => string;
  icon: LucideIcon;
}[] = [
  {
    regex: /^\/attorney\/matters\/([^/]+)\/notes$/,
    paramNames: ['matterId'],
    titleFn: (params: { matterId: string }) => {
      const matter = MOCK_MATTERS_DATA.find(m => m.id === params.matterId);
      return matter ? `Notes for Matter: ${matter.name}` : 'Matter Notes';
    },
    icon: NotebookTextIcon,
  },
  {
    regex: /^\/attorney\/matters\/([^/]+)\/estate-planning$/,
    paramNames: ['matterId'],
    titleFn: (params: { matterId: string }) => {
      const matter = MOCK_MATTERS_DATA.find(m => m.id === params.matterId);
      return matter ? `${matter.name} - Estate Planning` : 'Estate Planning';
    },
    icon: FolderKanban,
  },
  {
    regex: /^\/attorney\/matters\/([^/]+)\/prospect$/,
    paramNames: ['matterId'],
    titleFn: (params: { matterId: string }) => {
      const matter = MOCK_MATTERS_DATA.find(m => m.id === params.matterId);
      return matter ? `${matter.name} - Prospect` : 'Prospect Dashboard';
    },
    icon: Target,
  },
  {
    regex: /^\/attorney\/matters\/([^/]+)\/trust-administration$/,
    paramNames: ['matterId'],
    titleFn: (params: { matterId: string }) => {
      const matter = MOCK_MATTERS_DATA.find(m => m.id === params.matterId);
      return matter ? `${matter.name} - Trust Admin` : 'Trust Administration';
    },
    icon: FolderKanban,
  },
  {
    regex: /^\/attorney\/matters\/([^/]+)\/create-document\/summary$/,
    paramNames: ['matterId'],
    titleFn: (params: { matterId: string }) => {
      const matter = MOCK_MATTERS_DATA.find(m => m.id === params.matterId);
      return matter ? `${matter.name} - Doc Summary` : 'Document Summary';
    },
    icon: FileTextIcon,
  },
  {
    regex: /^\/attorney\/matters\/([^/]+)\/create-document$/,
    paramNames: ['matterId'],
    titleFn: (params: { matterId: string }) => {
      const matter = MOCK_MATTERS_DATA.find(m => m.id === params.matterId);
      return matter ? `${matter.name} - Create Document` : 'Create Document';
    },
    icon: FileTextIcon,
  },
  {
    regex: /^\/attorney\/matters\/([^/]+)\/estate-overview$/,
    paramNames: ['matterId'],
    titleFn: (params: { matterId: string }) => {
      const matter = MOCK_MATTERS_DATA.find(m => m.id === params.matterId);
      return matter ? `${matter.name} - Estate Overview` : 'Estate Overview';
    },
    icon: DollarSign,
  },
  {
    regex: /^\/attorney\/contacts\/([^/]+)$/,
    paramNames: ['contactId'],
    titleFn: (params: { contactId: string }) => {
      const contact = MOCK_CONTACTS_DATA.find(c => c.id.toString() === params.contactId);
      return contact ? `Contact Profile: ${contact.name}` : 'Contact Profile';
    },
    icon: ContactIcon,
  },
  // Fallback for generic /attorney/matters/[matterId] if no specific sub-route matched
  {
    regex: /^\/attorney\/matters\/([^/]+)$/,
    paramNames: ['matterId'],
    titleFn: (params: { matterId: string }) => {
      const matter = MOCK_MATTERS_DATA.find(m => m.id === params.matterId);
      if (matter) {
         if (matter.type === MATTER_TYPES.ESTATE_PLANNING) return `${matter.name} - Estate Planning`;
         if (matter.type === MATTER_TYPES.PROSPECT) return `${matter.name} - Prospect`;
         if (matter.type === MATTER_TYPES.TRUST_ADMINISTRATION) return `${matter.name} - Trust Admin`;
         return `${matter.name} Details`; // Generic fallback
      }
      return 'Matter Details';
    },
    icon: FolderKanban,
  },
];


const pageAccessConfig: { [key: string]: FirmUserRole[] } = {
  '/attorney/billing': ['Admin', 'Attorney'],
  '/attorney/settings': ['Admin', 'Attorney', 'Paralegal', 'Staff'],
  '/attorney/leads': ['Admin', 'Attorney', 'Paralegal', 'Staff'],
};

const NAV_ITEMS_FOR_ACCESS_CHECK = [
  { href: '/attorney/dashboard', pageSlug: 'dashboard', allowedRoles: ['Admin', 'Attorney', 'Paralegal', 'Staff'] },
  { href: '/attorney/leads', pageSlug: 'leads', allowedRoles: ['Admin', 'Attorney', 'Paralegal', 'Staff'] },
  { href: '/attorney/contacts', pageSlug: 'contacts', allowedRoles: ['Admin', 'Attorney', 'Paralegal', 'Staff'] },
  { href: '/attorney/matters', pageSlug: 'matters', allowedRoles: ['Admin', 'Attorney', 'Paralegal'] },
  { href: '/attorney/calendar', pageSlug: 'calendar', allowedRoles: ['Admin', 'Attorney', 'Paralegal', 'Staff'] },
  { href: '/attorney/tasks', pageSlug: 'tasks', allowedRoles: ['Admin', 'Attorney', 'Paralegal', 'Staff'] },
  { href: '/attorney/documents', pageSlug: 'documents', allowedRoles: ['Admin', 'Attorney', 'Paralegal'] },
  { href: '/attorney/billing', pageSlug: 'billing', allowedRoles: ['Admin', 'Attorney'] },
  { href: '/attorney/assets', pageSlug: 'assets', allowedRoles: ['Admin', 'Attorney', 'Paralegal'] },
  { href: '/attorney/communications', pageSlug: 'communications', allowedRoles: ['Admin', 'Attorney', 'Paralegal'] },
  { href: '/attorney/reminders', pageSlug: 'reminders', allowedRoles: ['Admin', 'Attorney', 'Paralegal'] },
  { href: '/attorney/resources', pageSlug: 'resources', allowedRoles: ['Admin', 'Attorney', 'Paralegal', 'Staff'] },
  { href: '/attorney/settings', pageSlug: 'settings', allowedRoles: ['Admin', 'Attorney', 'Paralegal', 'Staff'] },
  { href: '/attorney/matters/[matterId]/notes', pageSlug: 'notes', allowedRoles: ['Admin', 'Attorney', 'Paralegal', 'Staff'] },
];

export default function AttorneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  let title = 'Omni Attorney';
  let PageIconComponent: LucideIcon | null = null;

  const staticMatch = staticRoutesConfig[pathname];
  if (staticMatch) {
    title = staticMatch.title;
    PageIconComponent = staticMatch.icon;
  } else {
    for (const route of dynamicRoutesConfig) {
      const match = pathname.match(route.regex);
      if (match) {
        const params: { [key: string]: string } = {};
        route.paramNames.forEach((name, index) => {
          if (match[index + 1]) {
            params[name] = match[index + 1];
          }
        });
        title = route.titleFn(params);
        PageIconComponent = route.icon;
        break; 
      }
    }
  }


  useEffect(() => {
    if (!isLoading && (!user || user.type !== 'firmUser')) {
      router.replace('/login');
      return;
    }

    if (user && user.type === 'firmUser' && user.firmRole) {
      const currentFirmRole = user.firmRole;
      let isAuthorized = true;

      const navItemMatch = NAV_ITEMS_FOR_ACCESS_CHECK.find(item => {
        const baseItemHref = item.href.split('/[')[0]; 
        return pathname.startsWith(baseItemHref);
      });

      if (navItemMatch && !navItemMatch.allowedRoles.includes(currentFirmRole)) {
          isAuthorized = false;
      } else {
        for (const pathPrefix in pageAccessConfig) {
          if (pathname.startsWith(pathPrefix)) {
            if (!pageAccessConfig[pathPrefix].includes(currentFirmRole)) {
              isAuthorized = false;
              break;
            }
          }
        }
      }

      if (!isAuthorized) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to view this page.",
          variant: "destructive",
        });
        router.replace('/attorney/dashboard');
      }
    }
  }, [user, isLoading, router, pathname]);
  
  useEffect(() => {
    if (typeof document !== 'undefined' && title) {
      document.title = title;
    }
  }, [title]);


  if (isLoading || !user || user.type !== 'firmUser') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-1 min-h-0 bg-secondary/50 selection:bg-primary/20 selection:text-primary-foreground">
        <Sidebar collapsible="icon" side="left" className="border-r border-sidebar-border">
          <AttorneySidebar />
        </Sidebar>
        <SidebarInset> 
          <AttorneyHeader title={title} pageIcon={PageIconComponent} />
          <div className="flex-1 overflow-y-auto p-0"> 
            <div className="p-6"> 
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
      <GlobalTimeEntryDialog />
    </SidebarProvider>
  );
}

