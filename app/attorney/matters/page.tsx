
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PlusCircle, Edit2, Trash2, Eye, Search as SearchIcon, FolderKanban, FileSignature, Landmark, Scale, Target, AlertTriangle, UserCheck, ArrowUpDown, Filter, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MOCK_MATTERS_DATA, MOCK_CONTACTS_DATA, MOCK_FIRM_USERS_DATA, getFirmUserNameById, getContactNameById } from '@/lib/mock-data'; 
import type { Matter, Contact, MatterFormData, MatterType, MatterStatus, ContactCategory, FirmUserRole, User as FirmUserType, ImportantDateEntry } from '@/lib/types';
import { MATTER_TYPES, CONTACT_STATUSES, statusOptionsByType, NO_ATTORNEY_SELECTED_VALUE_MATTER } from '@/lib/types'; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext'; 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const matterFormSchema = z.object({
  name: z.string().min(3, { message: "Matter name must be at least 3 characters." }),
  type: z.nativeEnum(MATTER_TYPES),
  status: z.string(), 
  linkedClientIds: z.array(z.union([z.string(), z.number()])).min(1, "At least one client must be linked."),
  responsibleAttorneyId: z.string().optional(),
  openDate: z.string().refine((val) => val === '' || !isNaN(Date.parse(val)), { message: "Invalid open date format." }),
  closeDate: z.string().optional().refine((val) => val === '' || !isNaN(Date.parse(val)), { message: "Invalid close date format." }),
  referredBy: z.string().optional(), 
  importantDates: z.array(z.object({ 
    id: z.string().optional(),
    date: z.string().optional().refine(val => !val || val === '' || !isNaN(Date.parse(val)), { message: "Invalid date format."}),
    notes: z.string().optional(),
  })).optional(),
});

const getMatterTypeIcon = (matterType: MatterType): LucideIcon => {
  switch (matterType) {
    case MATTER_TYPES.PROSPECT: return Target;
    case MATTER_TYPES.ESTATE_PLANNING: return FileSignature;
    case MATTER_TYPES.TRUST_ADMINISTRATION: return Landmark;
    case MATTER_TYPES.PROBATE: return Scale;
    default: return FolderKanban;
  }
};

const getMatterStatusColor = (status: MatterStatus) => {
    switch (status) {
        case 'Open': return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100';
        case 'Closed': return 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200';
        case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100';
        case 'On Hold': return 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-100';
        case 'Lead':
        case 'Contacted':
        case 'Consult Scheduled':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100';
        case 'Not Qualified': return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
};

const canUserManageMatter = (role?: FirmUserRole) => ['Admin', 'Attorney', 'Paralegal'].includes(role || '');
const canUserDeleteMatter = (role?: FirmUserRole) => ['Admin', 'Attorney'].includes(role || '');

const ALL_FILTER_VALUE = "[ALL]";

type SortableMatterKey = keyof Matter | 'clientNames' | 'responsibleAttorneyName';


export default function MatterManagementPage() {
  const { user } = useAuth(); 
  const router = useRouter();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]); 
  const [firmAttorneys, setFirmAttorneys] = useState<FirmUserType[]>([]);
  const [showMatterModal, setShowMatterModal] = useState(false);
  const [editingMatter, setEditingMatter] = useState<Matter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState(''); 
  const [referredBySearchTermMatter, setReferredBySearchTermMatter] = useState(''); 
  const [referredByPopoverOpenMatter, setReferredByPopoverOpenMatter] = useState(false); 
  const firmId = user?.firmId;

  const [filterType, setFilterType] = useState<MatterType | ''>('');
  const [filterAttorneyId, setFilterAttorneyId] = useState<string | ''>('');
  const [filterStatus, setFilterStatus] = useState<MatterStatus | ''>('');

  const [sortConfig, setSortConfig] = useState<{ key: SortableMatterKey; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    if (firmId) {
      setMatters(MOCK_MATTERS_DATA.filter(m => m.firmId === firmId).map(m => ({
        ...m,
        responsibleAttorneyName: getFirmUserNameById(m.responsibleAttorneyId)
      })));
      setContacts(MOCK_CONTACTS_DATA.filter(c => c.firmId === firmId)); 
      setFirmAttorneys(MOCK_FIRM_USERS_DATA.filter(u => u.firmId === firmId && (u.firmRole === 'Admin' || u.firmRole === 'Attorney')));
    }
  }, [firmId]);

  const form = useForm<MatterFormData>({
    resolver: zodResolver(matterFormSchema),
    defaultValues: {
      name: '',
      type: MATTER_TYPES.PROSPECT,
      status: 'Lead',
      linkedClientIds: [],
      responsibleAttorneyId: '',
      openDate: new Date().toISOString().split('T')[0],
      closeDate: '',
      referredBy: '', 
      importantDates: [],
    },
  });
  
  const selectedMatterTypeInForm = form.watch("type");
  const selectedClientIdsInForm = form.watch("linkedClientIds") || [];

  useEffect(() => {
    const validStatuses = statusOptionsByType[selectedMatterTypeInForm] || statusOptionsByType[MATTER_TYPES.OTHER];
    if (validStatuses && !validStatuses.includes(form.getValues("status") as MatterStatus)) {
      form.setValue("status", validStatuses[0]);
    }
  }, [selectedMatterTypeInForm, form]);

  const openMatterModal = (matter: Matter | null = null) => {
    setEditingMatter(matter);
    setClientSearchTerm(''); 
    if (matter) {
      form.reset({
        name: matter.name,
        type: matter.type || MATTER_TYPES.PROSPECT,
        status: matter.status,
        linkedClientIds: matter.clientIds || [],
        responsibleAttorneyId: matter.responsibleAttorneyId || NO_ATTORNEY_SELECTED_VALUE_MATTER,
        openDate: matter.openDate,
        closeDate: matter.closeDate || '',
        referredBy: matter.referredBy || '', 
        importantDates: matter.importantDates || [],
      });
      setReferredBySearchTermMatter(matter.referredBy || ''); 
    } else {
      form.reset({
        name: '',
        type: MATTER_TYPES.PROSPECT,
        status: 'Lead',
        linkedClientIds: [],
        responsibleAttorneyId: NO_ATTORNEY_SELECTED_VALUE_MATTER,
        openDate: new Date().toISOString().split('T')[0],
        closeDate: '',
        referredBy: '', 
        importantDates: [],
      });
      setReferredBySearchTermMatter(''); 
    }
    setReferredByPopoverOpenMatter(false);
    setShowMatterModal(true);
  };

  const closeMatterModal = () => {
    setShowMatterModal(false);
    setEditingMatter(null);
    setReferredBySearchTermMatter('');
    setReferredByPopoverOpenMatter(false);
    form.reset();
  };

  const onSubmit = (data: MatterFormData) => {
    if (!firmId) {
      toast({ title: "Error", description: "Firm ID is missing.", variant: "destructive" });
      return;
    }
    
    const finalResponsibleAttorneyId = data.responsibleAttorneyId === NO_ATTORNEY_SELECTED_VALUE_MATTER || data.responsibleAttorneyId === ''
                                     ? undefined
                                     : data.responsibleAttorneyId;
    const attorneyName = finalResponsibleAttorneyId ? getFirmUserNameById(finalResponsibleAttorneyId) : undefined;
    
    const matterPayload: Omit<Matter, 'id'> & { firmId: string } = { 
      name: data.name,
      type: data.type,
      status: data.status,
      clientIds: data.linkedClientIds, 
      firmId, 
      responsibleAttorneyId: finalResponsibleAttorneyId, 
      responsibleAttorneyName: attorneyName,
      openDate: data.openDate,
      closeDate: data.closeDate || undefined,
      referredBy: data.referredBy || undefined, 
      importantDates: data.importantDates || [],
    };

    if (editingMatter) {
      const updatedMatters = MOCK_MATTERS_DATA.map(m => (m.id === editingMatter.id && m.firmId === firmId) ? { ...editingMatter, ...matterPayload } : m);
      MOCK_MATTERS_DATA.length = 0; 
      MOCK_MATTERS_DATA.push(...updatedMatters); 
      setMatters(MOCK_MATTERS_DATA.filter(m => m.firmId === firmId).map(m => ({...m, responsibleAttorneyName: getFirmUserNameById(m.responsibleAttorneyId)})));
      toast({ title: "Matter Updated", description: `Matter "${data.name}" has been updated.` });
    } else {
      const newMatter: Matter = {
        id: `M${Date.now().toString().slice(-4)}`, 
        ...matterPayload,
      };
      MOCK_MATTERS_DATA.unshift(newMatter);
      setMatters(MOCK_MATTERS_DATA.filter(m => m.firmId === firmId).map(m => ({...m, responsibleAttorneyName: getFirmUserNameById(m.responsibleAttorneyId)})));
      toast({ title: "Matter Added", description: `Matter "${data.name}" has been created.` });
    }
    closeMatterModal();
  };

  const getMatterLink = (matter: Matter): string => {
    if (matter.type === MATTER_TYPES.ESTATE_PLANNING) {
      return `/attorney/matters/${matter.id}/estate-planning`;
    } else if (matter.type === MATTER_TYPES.PROSPECT) {
      return `/attorney/matters/${matter.id}/prospect`;
    } else if (matter.type === MATTER_TYPES.TRUST_ADMINISTRATION) {
      return `/attorney/matters/${matter.id}/trust-administration`;
    }
    return `/attorney/matters/${matter.id}/estate-planning`; 
  };
  
  const handleViewMatter = (matter: Matter) => {
    const path = getMatterLink(matter);
    if (path.endsWith('/estate-planning') && matter.type !== MATTER_TYPES.ESTATE_PLANNING && matter.type !== MATTER_TYPES.OTHER && matter.type !== MATTER_TYPES.PROBATE) { 
         toast({ title: "Navigation Info", description: `Viewing as generic Estate Planning dashboard. A specific dashboard for "${matter.type}" is not yet implemented.`, variant: "default" });
    }
    router.push(path);
  };

  const handleDeleteMatter = (matterId: string) => {
     if (window.confirm("Are you sure you want to delete this matter? This action cannot be undone.")) {
        const index = MOCK_MATTERS_DATA.findIndex(m => m.id === matterId && m.firmId === firmId);
        if (index !== -1) {
            MOCK_MATTERS_DATA.splice(index, 1);
        }
        setMatters(MOCK_MATTERS_DATA.filter(m => m.firmId === firmId).map(m => ({...m, responsibleAttorneyName: getFirmUserNameById(m.responsibleAttorneyId)})));
        toast({ title: "Matter Deleted", description: "The matter has been removed.", variant: "destructive" });
    }
  }

  const filteredMatters = useMemo(() => {
    let processedMatters = matters;

    if (filterType) {
        processedMatters = processedMatters.filter(matter => matter.type === filterType);
    }
    if (filterAttorneyId) {
        processedMatters = processedMatters.filter(matter => matter.responsibleAttorneyId === filterAttorneyId);
    }
    if (filterStatus) {
        processedMatters = processedMatters.filter(matter => matter.status === filterStatus);
    }

    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        processedMatters = processedMatters.filter(matter => {
            const matterClients = MOCK_CONTACTS_DATA.filter(contact => matter.clientIds.includes(contact.id) && contact.firmId === firmId);
            return (
                matter.name.toLowerCase().includes(searchLower) ||
                matter.id.toLowerCase().includes(searchLower) ||
                matter.type.toLowerCase().includes(searchLower) ||
                (matter.responsibleAttorneyName && matter.responsibleAttorneyName.toLowerCase().includes(searchLower)) ||
                (matter.referredBy && matter.referredBy.toLowerCase().includes(searchLower)) ||
                matterClients.some(client => client.name.toLowerCase().includes(searchLower))
            );
        });
    }

    if (sortConfig !== null) {
      processedMatters.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof Matter];
        let bValue: any = b[sortConfig.key as keyof Matter];

        if (sortConfig.key === 'clientNames') {
            aValue = MOCK_CONTACTS_DATA.filter(c => a.clientIds.includes(c.id)).map(c=>c.name).join(', ');
            bValue = MOCK_CONTACTS_DATA.filter(c => b.clientIds.includes(c.id)).map(c=>c.name).join(', ');
        }
        if (sortConfig.key === 'responsibleAttorneyName') {
            aValue = a.responsibleAttorneyName || '';
            bValue = b.responsibleAttorneyName || '';
        }
        
        if (aValue === undefined || aValue === null) aValue = '';
        if (bValue === undefined || bValue === null) bValue = '';

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            if (aValue.toLowerCase() < bValue.toLowerCase()) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue.toLowerCase() > bValue.toLowerCase()) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
        } else { 
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return processedMatters;
  }, [matters, filterType, filterAttorneyId, filterStatus, searchTerm, sortConfig, firmId]);

  const clientContactsForLinking = contacts.filter(contact => contact.category === "Client" as ContactCategory && contact.firmId === firmId);
  const filteredClientContactsForLinking = clientContactsForLinking.filter(contact => 
    contact.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    contact.emails.some(e => e.address.toLowerCase().includes(clientSearchTerm.toLowerCase()))
  );
  
  const potentialReferrersMatter = useMemo(() => {
    if (!referredBySearchTermMatter.trim() || referredBySearchTermMatter.length < 2) return [];
    const searchLower = referredBySearchTermMatter.toLowerCase();
    return contacts.filter(c => 
        c.name.toLowerCase().includes(searchLower) &&
        c.firmId === firmId 
    ).slice(0, 5);
  }, [contacts, referredBySearchTermMatter, firmId]);


  const userRole = user?.type === 'firmUser' ? user.firmRole : undefined;

  const allStatusOptions = useMemo(() => {
    const statuses = new Set<MatterStatus>();
    Object.values(statusOptionsByType).forEach(arr => arr.forEach(s => statuses.add(s)));
    return Array.from(statuses).sort();
  }, []);

  const requestSort = (key: SortableMatterKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: SortableMatterKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
    }
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative sm:w-64 flex-grow sm:flex-grow-0">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search matters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filter Matters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 space-y-3">
              <div>
                <Label htmlFor="filter-type" className="text-xs font-medium">Matter Type</Label>
                <Select value={filterType} onValueChange={(value) => setFilterType(value === ALL_FILTER_VALUE ? '' : value as MatterType)}>
                  <SelectTrigger id="filter-type" className="w-full text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_FILTER_VALUE}>All Types</SelectItem>
                    {Object.values(MATTER_TYPES).map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-attorney" className="text-xs font-medium">Responsible Attorney</Label>
                <Select value={filterAttorneyId} onValueChange={(value) => setFilterAttorneyId(value === ALL_FILTER_VALUE ? '' : value)}>
                  <SelectTrigger id="filter-attorney" className="w-full text-xs"><SelectValue placeholder="All Attorneys" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_FILTER_VALUE}>All Attorneys</SelectItem>
                    {firmAttorneys.map(attorney => <SelectItem key={attorney.id} value={attorney.id}>{attorney.name}</SelectItem>)}
                    <SelectItem value={NO_ATTORNEY_SELECTED_VALUE_MATTER}>Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-status" className="text-xs font-medium">Status</Label>
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value === ALL_FILTER_VALUE ? '' : value as MatterStatus)}>
                  <SelectTrigger id="filter-status" className="w-full text-xs"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_FILTER_VALUE}>All Statuses</SelectItem>
                    {allStatusOptions.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
          {canUserManageMatter(userRole) && (
            <Button onClick={() => openMatterModal()} className="flex-shrink-0">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Matter
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-xl">
        <CardContent className="p-0">
          {filteredMatters.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('id')}>ID {getSortIndicator('id')}</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('name')}>Name {getSortIndicator('name')}</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('type')}>Type {getSortIndicator('type')}</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('clientNames')}>Linked Clients {getSortIndicator('clientNames')}</TableHead> 
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('responsibleAttorneyName')}>Responsible Attorney {getSortIndicator('responsibleAttorneyName')}</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('openDate')}>Open Date {getSortIndicator('openDate')}</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('status')}>Status {getSortIndicator('status')}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatters.map(matter => {
                    const IconComponent = getMatterTypeIcon(matter.type);
                    const clientContactsForMatter = MOCK_CONTACTS_DATA.filter(contact => 
                        matter.clientIds.includes(contact.id) && contact.category === "Client" as ContactCategory && contact.firmId === firmId
                    );
                    return (
                      <TableRow key={matter.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-mono text-xs">{matter.id}</TableCell>
                        <TableCell className="font-medium">
                          <Link href={getMatterLink(matter)} className="text-primary hover:underline">
                            {matter.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center">
                            <IconComponent className="w-4 h-4 mr-2 text-muted-foreground" />
                            {matter.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {clientContactsForMatter.length > 0
                            ? clientContactsForMatter.map((client, index) => (
                                <React.Fragment key={client.id}>
                                  <Link href={`/attorney/contacts/${client.id}?matterId=${matter.id}`} className="text-primary hover:underline">
                                    {client.name}
                                  </Link>
                                  {index < clientContactsForMatter.length - 1 && ', '}
                                </React.Fragment>
                              ))
                            : <span className="text-muted-foreground italic">No client contacts</span>}
                        </TableCell>
                        <TableCell>{matter.responsibleAttorneyName || 'N/A'}</TableCell>
                        <TableCell>{matter.openDate}</TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getMatterStatusColor(matter.status)}`}>
                            {matter.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <TooltipProvider>
                            {canUserManageMatter(userRole) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button onClick={() => openMatterModal(matter)} variant="ghost" size="icon">
                                    <Edit2 className="h-4 w-4 text-blue-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Edit Matter</p></TooltipContent>
                              </Tooltip>
                            )}
                             {canUserDeleteMatter(userRole) && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                    <Button onClick={() => handleDeleteMatter(matter.id)} variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Delete Matter</p></TooltipContent>
                                </Tooltip>
                             )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button onClick={() => handleViewMatter(matter)} variant="outline" size="sm" className="px-2 py-1 h-auto leading-normal">
                                  <Eye className="h-4 w-4 mr-1 sm:mr-2" />
                                  <span className="hidden sm:inline">View</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>View Matter Dashboard</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                <p className="text-lg font-semibold">No Matters Found</p>
                <p className="text-sm">
                    {searchTerm || filterType || filterAttorneyId || filterStatus ? "No matters match your search/filter criteria." : "There are no matters yet."}
                </p>
             </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showMatterModal} onOpenChange={(isOpen) => { if (!isOpen) closeMatterModal(); else setShowMatterModal(true); }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingMatter ? "Edit Matter" : "Add New Matter"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ScrollArea className="h-[60vh] pr-5">
                <div className="py-4 space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Matter Name / ID</FormLabel><FormControl><Input placeholder="e.g., Smith Family Trust 2025 or M003" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="type" render={({ field }) => (
                      <FormItem><FormLabel>Type of Matter</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select matter type" /></SelectTrigger></FormControl>
                        <SelectContent>{Object.values(MATTER_TYPES).map(typeValue => (<SelectItem key={typeValue} value={typeValue}>{typeValue}</SelectItem>))}</SelectContent></Select><FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>{(statusOptionsByType[selectedMatterTypeInForm] || statusOptionsByType[MATTER_TYPES.OTHER]).map(statusValue => (<SelectItem key={statusValue} value={statusValue}>{statusValue}</SelectItem>))}</SelectContent></Select><FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                  <FormField control={form.control} name="responsibleAttorneyId" render={({ field }) => (
                    <FormItem><FormLabel>Responsible Attorney (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''} defaultValue={field.value || ''}>
                        <FormControl><SelectTrigger><SelectValue placeholder="-- Select Attorney --" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value={NO_ATTORNEY_SELECTED_VALUE_MATTER}>-- None --</SelectItem>
                          {firmAttorneys.map(attorney => (<SelectItem key={attorney.id} value={attorney.id}>{attorney.name}</SelectItem>))}
                        </SelectContent>
                      </Select><FormMessage />
                    </FormItem>
                  )}/>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="openDate" render={({ field }) => (
                      <FormItem><FormLabel>Open Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="closeDate" render={({ field }) => (
                      <FormItem><FormLabel>Close Date (Optional)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  </div>
                  <FormField
                    control={form.control}
                    name="referredBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referred By (Optional)</FormLabel>
                        <Popover open={referredByPopoverOpenMatter} onOpenChange={setReferredByPopoverOpenMatter}>
                          <PopoverTrigger asChild>
                            <div className="relative flex items-center">
                              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                              <FormControl>
                                <Input
                                  placeholder="Search existing contacts or enter new name..."
                                  value={referredBySearchTermMatter}
                                  onChange={(e) => {
                                    const newSearchTerm = e.target.value;
                                    setReferredBySearchTermMatter(newSearchTerm);
                                    field.onChange(newSearchTerm); 
                                    if (newSearchTerm.trim().length >= 2) {
                                      setReferredByPopoverOpenMatter(true);
                                    } else {
                                      setReferredByPopoverOpenMatter(false);
                                    }
                                  }}
                                  onFocus={() => {
                                    if (referredBySearchTermMatter.trim().length >= 2 && potentialReferrersMatter.length > 0) {
                                        setReferredByPopoverOpenMatter(true);
                                    }
                                  }}
                                  className="pl-8"
                                  autoComplete="off"
                                />
                              </FormControl>
                              {referredBySearchTermMatter && ( 
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    field.onChange('');
                                    setReferredBySearchTermMatter('');
                                    setReferredByPopoverOpenMatter(false);
                                  }}
                                  className="absolute right-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                                  aria-label="Clear referred by for matter"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="w-[--radix-popover-trigger-width] p-0" 
                            align="start"
                            onOpenAutoFocus={(event) => event.preventDefault()}
                          >
                            { (referredByPopoverOpenMatter && referredBySearchTermMatter.trim().length >= 2) && (
                               <ScrollArea className="h-auto max-h-[200px]">
                                <div className="p-1">
                                  {potentialReferrersMatter.length > 0 ? (
                                    potentialReferrersMatter.map(refContact => (
                                      <Button
                                        key={refContact.id}
                                        variant="ghost"
                                        className="w-full justify-start text-xs h-auto py-1.5 px-2"
                                        onClick={() => {
                                          field.onChange(refContact.name);
                                          setReferredBySearchTermMatter(refContact.name);
                                          setReferredByPopoverOpenMatter(false);
                                        }}
                                      >
                                        {refContact.name} ({refContact.category})
                                      </Button>
                                    ))
                                  ) : (
                                    <p className="p-2 text-xs text-muted-foreground">
                                      No existing contacts found matching "{referredBySearchTermMatter}". You can enter a new name.
                                    </p>
                                  )}
                                </div>
                              </ScrollArea>
                            )}
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="linkedClientIds" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Client Contacts to this Matter</FormLabel>
                      <Popover><PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start font-normal">
                            {selectedClientIdsInForm.length > 0 
                              ? `${selectedClientIdsInForm.length} client(s) selected` 
                              : "Select clients..."}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <div className="p-2 border-b"><Input placeholder="Search clients..." value={clientSearchTerm} onChange={(e) => setClientSearchTerm(e.target.value)} className="h-8"/></div>
                          <ScrollArea className="h-48 p-2"><div className="space-y-1.5">
                            {filteredClientContactsForLinking.length > 0 ? filteredClientContactsForLinking.map(contact => (
                              <FormItem key={contact.id} className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl><Checkbox checked={field.value?.includes(contact.id.toString())}
                                    onCheckedChange={(checked) => {
                                      const currentVal = field.value || []; const contactIdStr = contact.id.toString();
                                      return checked ? field.onChange([...currentVal, contactIdStr]) : field.onChange(currentVal.filter(value => value !== contactIdStr));
                                    }} id={`client-matter-${contact.id}`} />
                                </FormControl><Label htmlFor={`client-matter-${contact.id}`} className="font-normal text-sm">{contact.name}</Label>
                              </FormItem>
                            )) : <p className="text-xs text-muted-foreground text-center py-2">No clients match search.</p>}
                          </div></ScrollArea>
                        </PopoverContent>
                      </Popover><FormMessage />
                    </FormItem>
                  )}/>
                </div>
              </ScrollArea>
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={closeMatterModal}>Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {editingMatter ? "Save Changes" : "Add Matter"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


    
