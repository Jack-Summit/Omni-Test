
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    Infinity as AppLogoIcon, FolderKanban, CalendarDays, CheckSquare, FileText as FileTextIcon, MessageSquare, Bell, BookOpen, 
    Settings, LayoutDashboard, CreditCard, Contact as ContactIcon, DollarSign, Target
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import type { FirmUserRole } from '@/lib/types';
import { 
  SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, useSidebar 
} from '@/components/ui/sidebar';

interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
  pageSlug: string;
  allowedRoles: FirmUserRole[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/attorney/dashboard', pageSlug: 'dashboard', allowedRoles: ['Admin', 'Attorney', 'Paralegal', 'Staff'] },
  { name: 'Lead & Intake', icon: Target, href: '/attorney/leads', pageSlug: 'leads', allowedRoles: ['Admin', 'Attorney', 'Paralegal', 'Staff'] },
  { name: 'Contacts', icon: ContactIcon, href: '/attorney/contacts', pageSlug: 'contacts', allowedRoles: ['Admin', 'Attorney', 'Paralegal', 'Staff'] },
  { name: 'Matters', icon: FolderKanban, href: '/attorney/matters', pageSlug: 'matters', allowedRoles: ['Admin', 'Attorney', 'Paralegal'] },
  { name: 'Calendar', icon: CalendarDays, href: '/attorney/calendar', pageSlug: 'calendar', allowedRoles: ['Admin', 'Attorney', 'Paralegal', 'Staff'] },
  { name: 'Tasks', icon: CheckSquare, href: '/attorney/tasks', pageSlug: 'tasks', allowedRoles: ['Admin', 'Attorney', 'Paralegal', 'Staff'] },
  { name: 'Documents', icon: FileTextIcon, href: '/attorney/documents', pageSlug: 'documents', allowedRoles: ['Admin', 'Attorney', 'Paralegal'] },
  { name: 'Billing', icon: CreditCard, href: '/attorney/billing', pageSlug: 'billing', allowedRoles: ['Admin', 'Attorney'] },
  { name: 'Communications', icon: MessageSquare, href: '/attorney/communications', pageSlug: 'communications', allowedRoles: ['Admin', 'Attorney', 'Paralegal'] },
  { name: 'Reminders', icon: Bell, href: '/attorney/reminders', pageSlug: 'reminders', allowedRoles: ['Admin', 'Attorney', 'Paralegal'] },
  { name: 'Resources', icon: BookOpen, href: '/attorney/resources', pageSlug: 'resources', allowedRoles: ['Admin', 'Attorney', 'Paralegal', 'Staff'] },
  { name: 'Settings', icon: Settings, href: '/attorney/settings', pageSlug: 'settings', allowedRoles: ['Admin', 'Attorney', 'Paralegal', 'Staff'] },
];

export function AttorneySidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { open } = useSidebar(); 

  const currentUserRole = user?.type === 'firmUser' ? user.firmRole : undefined;

  const visibleNavItems = navItems.filter(item => {
    if (!currentUserRole) return false;
    return item.allowedRoles.includes(currentUserRole);
  });

  return (
    <>
      <SidebarHeader className="!p-4 border-b border-sidebar-border">
        <div className={cn("flex items-center", open ? "justify-between" : "justify-center")}>
          <Link href="/attorney/dashboard" className={cn("flex items-center gap-2 text-xl font-semibold text-sidebar-foreground")}>
            <AppLogoIcon className="h-10 w-10 text-primary" />
            {open && <span className="whitespace-nowrap">Omni</span>}
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {visibleNavItems.map(item => {
            const isActivePath = pathname === item.href || 
                                 pathname.startsWith(`${item.href}/`) || 
                                 (pathname.startsWith('/attorney/') && 
                                  item.href !== '/attorney/dashboard' && 
                                  (pathname.includes(`/${item.pageSlug}`) || pathname.includes(`?${item.pageSlug}`)));
            
            const isDashboardActive = item.pageSlug === 'dashboard' && pathname === item.href;
            const finalIsActive = item.pageSlug === 'dashboard' ? isDashboardActive : isActivePath;

            return (
              <SidebarMenuItem key={item.name}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    tooltip={item.name}
                    isActive={finalIsActive}
                    className={cn(
                      finalIsActive 
                        ? 'bg-sidebar-active-background text-sidebar-active-foreground shadow-sm' 
                        : 'hover:bg-sidebar-hover-background hover:text-sidebar-hover-foreground'
                    )}
                  >
                    <item.icon className={cn(
                        "w-5 h-5 transition-transform",
                        finalIsActive ? 'text-sidebar-icon-active' : 'text-sidebar-icon group-hover/menu-button:text-sidebar-icon-hover'
                    )} />
                    {open && <span className="whitespace-nowrap">{item.name}</span>}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-sidebar-border p-2 flex flex-col items-center">
         <SidebarTrigger className={cn("my-2 text-sidebar-foreground hover:text-sidebar-hover-foreground", !open && "mx-auto")} />
        {open ? (
          <p className="text-xs text-sidebar-foreground/60 text-center">Version 1.0.0</p>
        ) : (
          <p className="text-xs text-sidebar-foreground/60 text-center">v1</p>
        )}
      </SidebarFooter>
    </>
  );
}
