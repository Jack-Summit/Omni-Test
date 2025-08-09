
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PlusCircle, Edit2, Trash2, Search as SearchIcon, AlertTriangle, Users, Mail, Phone, CalendarDays, Filter, XCircle } from 'lucide-react';
import { MOCK_CONTACTS_DATA, MOCK_MATTERS_DATA } from '@/lib/mock-data'; 
import type { Contact, ContactFormData, ContactStatus, Matter, FirmUserRole, EmailEntry, PhoneEntry, ContactCategory as CCEnum } from '@/lib/types'; 
import { CONTACT_CATEGORIES, CONTACT_STATUSES, ContactCategory } from '@/lib/types'; 
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from "@/hooks/use-toast";
import { MatterActionRibbon } from '@/components/layout/matter-action-ribbon';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { usePathname, useSearchParams } from 'next/navigation';


const emailSchema = z.object({
  address: z.string().email({ message: "Invalid email address." }).min(1, "Email address is required."),
  type: z.string().optional(),
  isPrimary: z.boolean(),
});

const phoneSchema = z.object({
  number: z.string()
    .min(1, "Phone number is required.")
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
 return digits.length === 0 || digits.length >= 10;
    }, {
      message: "Phone number seems too short. Must be at least 10 digits.",
    })
    .refine((value) => {
 return value.replace(/\D/g, '').length <= 11; 
    }, { message: "Phone number seems too long. Max 11 digits allowed." }),

  type: z.string().optional(),
  isPrimary: z.boolean(),
});

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  emails: z.array(emailSchema).min(1, "At least one email is required.").refine(
    (emails) => emails.filter(e => e.isPrimary).length === 1,
    { message: "Exactly one email must be marked as primary." }
  ),
  category: z.nativeEnum(ContactCategory),
  status: z.string(), 
  dob: z.string().optional(),
  phones: z.array(phoneSchema).optional().refine(
    (phones) => {
      if (!phones || phones.length === 0) return true; 
      if (phones.every(p => !p.number)) return true; 
      return phones.filter(p => p.isPrimary).length === 1; 
    },
    { message: "If phone numbers are provided (and not empty), exactly one must be marked as primary." }
  ).refine(
    (phones) => {
        if (!phones || phones.length === 0) return true;
        const numberedPhones = phones.filter(p => p.number && p.number.trim() !== '');
        if (numberedPhones.length > 0 && numberedPhones.filter(p => p.isPrimary).length === 0) {
            return false; 
        }
        return true;
    },
    { message: "If any phone number is filled, one must be selected as primary." }
  ),
 address: z.string().optional(),
  mailingAddress: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  referredBy: z.string().optional(),
});


const canUserManageContact = (role?: FirmUserRole) => ['Admin', 'Attorney', 'Paralegal'].includes(role || '');
const canUserDeleteContact = (role?: FirmUserRole) => ['Admin', 'Attorney'].includes(role || '');

const formatPhoneNumber = (value: string): string => {
  if (!value) return "";
  const phoneNumber = value.replace(/\D/g, '');
  const phoneNumberLength = phoneNumber.length;

  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6,10)}`;
};

const ALL_FILTER_VALUE = "[ALL_CONTACT_FILTER]";

export default function ContactManagementPage() {
  const { user } = useAuth(); 
  const currentPathname = usePathname(); 
  const searchParams = useSearchParams();
  const router = useRouter(); 
  const filterByMatterId = searchParams.get('matterId');
  const firmId = user?.firmId;

  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatter, setCurrentMatter] = useState<Matter | null>(null);

  const [filterCategory, setFilterCategory] = useState<CCEnum | typeof ALL_FILTER_VALUE>(ALL_FILTER_VALUE);
  const [filterStatus, setFilterStatus] = useState<ContactStatus | typeof ALL_FILTER_VALUE>(ALL_FILTER_VALUE);

  const [referredBySearchTerm, setReferredBySearchTerm] = useState('');
  const [referredByPopoverOpen, setReferredByPopoverOpen] = useState(false);

  const [newContactNameSearchTerm, setNewContactNameSearchTerm] = useState('');
  const [newContactSuggestionsOpen, setNewContactSuggestionsOpen] = useState(false);

  useEffect(() => {
    if (firmId) {
      setAllContacts(MOCK_CONTACTS_DATA.filter(c => c.firmId === firmId));
      if (filterByMatterId) {
        const matter = MOCK_MATTERS_DATA.find(m => m.id === filterByMatterId && m.firmId === firmId);
        setCurrentMatter(matter || null);
      } else {
        setCurrentMatter(null);
      }
    }
  }, [firmId, filterByMatterId]);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      emails: [{ address: '', type: 'Work', isPrimary: true }],
      category: CONTACT_CATEGORIES[0] as ContactCategory, 
      status: CONTACT_STATUSES[0] as ContactStatus, 
      dob: '', 
      phones: [{ number: '', type: 'Mobile', isPrimary: true }],
      address: '',
      mailingAddress: '',
      company: '',
      notes: '',
      referredBy: '',
    },
  });

  const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({ control: form.control, name: "emails" });
  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({ control: form.control, name: "phones" });

  const handlePrimarySelection = (fieldArrayName: "emails" | "phones", indexToSetPrimary: number) => {
    const currentArray = form.getValues(fieldArrayName) || [];
    const updatedArray = currentArray.map((item, idx) => ({
      ...item,
      isPrimary: idx === indexToSetPrimary,
    }));
    form.setValue(fieldArrayName, updatedArray as any, { shouldValidate: true, shouldDirty: true });
  };


  const openContactModal = (contact: Contact | null = null) => {
    setEditingContact(contact);
    setNewContactNameSearchTerm(''); // Reset for new contact modal
    setNewContactSuggestionsOpen(false);

    if (contact) {
      form.reset({
        name: contact.name,
        emails: contact.emails.length > 0 ? contact.emails : [{ address: '', type: 'Work', isPrimary: true }],
        category: contact.category,
        status: contact.status,
        dob: contact.dob || '',
        phones: contact.phones && contact.phones.length > 0 ? contact.phones : [{ number: '', type: 'Mobile', isPrimary: true }],
        address: contact.address || '',
        mailingAddress: contact.mailingAddress || '',
        company: contact.company || '',
        notes: contact.notes || '',
        referredBy: contact.referredBy || '',
      });
      setReferredBySearchTerm(contact.referredBy || '');
    } else {
      form.reset({
        name: '', 
        emails: [{ address: '', type: 'Work', isPrimary: true }], 
        category: CONTACT_CATEGORIES[0] as ContactCategory, 
        status: CONTACT_STATUSES[0] as ContactStatus,
        dob: '', 
        phones: [{ number: '', type: 'Mobile', isPrimary: true }], 
        address: '', 
        mailingAddress: '', 
        company: '', 
        notes: '', 
        referredBy: ''
      });
      setReferredBySearchTerm('');
    }
    setReferredByPopoverOpen(false);
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setEditingContact(null);
    setReferredBySearchTerm('');
    setReferredByPopoverOpen(false);
    setNewContactNameSearchTerm('');
    setNewContactSuggestionsOpen(false);
    form.reset();
  };

  const onSubmit = (data: ContactFormData) => {
    if (!firmId) {
      toast({ title: "Error", description: "Firm ID is missing.", variant: "destructive" });
      return;
    }
    
    const finalData: Omit<Contact, 'id' | 'lastActivity' | 'relatedContactIds' | 'outstandingBalance' | 'trustAccountBalance'> & { firmId: string } = {
        ...data,
        phones: data.phones?.filter(p => p.number && p.number.trim() !== ''), 
        firmId,
    };

    if (editingContact) {
      const updatedContact: Contact = { ...editingContact, ...finalData };
      const index = MOCK_CONTACTS_DATA.findIndex(c => c.id === editingContact.id && c.firmId === firmId);
      if (index !== -1) {
        MOCK_CONTACTS_DATA[index] = updatedContact; 
      }
      setAllContacts([...MOCK_CONTACTS_DATA.filter(c => c.firmId === firmId)]); 
      toast({ title: "Contact Updated", description: `${data.name}'s profile has been updated.` });
    } else {
      const newContact: Contact = {
        id: `contact-${Date.now()}-${Math.random().toString(36).substring(2,7)}`, 
        ...finalData,
        lastActivity: new Date().toISOString().split('T')[0],
      };
      MOCK_CONTACTS_DATA.unshift(newContact); 
      setAllContacts([...MOCK_CONTACTS_DATA.filter(c => c.firmId === firmId)]); 
      toast({ title: "Contact Added", description: `${data.name} has been added to contacts list.` });
    }
    closeContactModal();
  };

  const handleDeleteContact = (contactId: string | number) => {
    if (window.confirm("Are you sure you want to delete this contact? This action cannot be undone.")) {
        const index = MOCK_CONTACTS_DATA.findIndex(contact => contact.id === contactId && contact.firmId === firmId);
        if (index !== -1) {
            MOCK_CONTACTS_DATA.splice(index, 1); 
        }
        setAllContacts([...MOCK_CONTACTS_DATA.filter(c => c.firmId === firmId)]); 
        toast({ title: "Contact Deleted", description: "The contact has been removed.", variant: "destructive" });
    }
  };

  const contactsToDisplay = useMemo(() => {
    let displayableContacts = allContacts;

    if (filterCategory !== ALL_FILTER_VALUE) {
        displayableContacts = displayableContacts.filter(contact => contact.category === filterCategory);
    }
    if (filterStatus !== ALL_FILTER_VALUE) {
        displayableContacts = displayableContacts.filter(contact => contact.status === filterStatus);
    }

    if (filterByMatterId && currentMatter) {
        displayableContacts = displayableContacts.filter(contact => 
        currentMatter.clientIds.includes(contact.id) && contact.category === ContactCategory.CLIENT
      );
    }

    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        displayableContacts = displayableContacts.filter(contact =>
            contact.name.toLowerCase().includes(searchLower) ||
            contact.emails.some(e => e.address.toLowerCase().includes(searchLower)) ||
            contact.category.toLowerCase().includes(searchLower) ||
            (contact.company && contact.company.toLowerCase().includes(searchLower))
        );
    }
    return displayableContacts;
  }, [allContacts, filterByMatterId, currentMatter, searchTerm, filterCategory, filterStatus]);

  const potentialReferrers = useMemo(() => {
    if (!referredBySearchTerm.trim() || referredBySearchTerm.length < 2) return [];
    const searchLower = referredBySearchTerm.toLowerCase();
    return allContacts.filter(c =>
        c.name.toLowerCase().includes(searchLower) &&
        (!editingContact || c.id !== editingContact.id) 
    ).slice(0, 5);
  }, [allContacts, referredBySearchTerm, editingContact]);

  const potentialNewContactSuggestions = useMemo(() => {
    if (!newContactNameSearchTerm.trim() || newContactNameSearchTerm.length < 2) return [];
    const searchLower = newContactNameSearchTerm.toLowerCase();
    return allContacts.filter(c =>
        c.name.toLowerCase().includes(searchLower)
    ).slice(0, 5); // Limit suggestions
  }, [allContacts, newContactNameSearchTerm]);


  const getStatusBadgeClass = (status: ContactStatus) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100';
      case 'Prospect': return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100'; 
      case 'Inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
      case 'New': return 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100';
      case 'Vendor': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100';
      case 'Referral Source': return 'bg-teal-100 text-teal-800 dark:bg-teal-700 dark:text-teal-100';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100';
    }
  };

  const getPrimaryEmail = (emails: EmailEntry[] | undefined) => emails?.find(e => e.isPrimary)?.address || emails?.[0]?.address || 'N/A';
  const getPrimaryPhone = (phones: PhoneEntry[] | undefined) => {
    const primary = phones?.find(p => p.isPrimary && p.number);
    if (primary) return primary.number;
    const firstNumbered = phones?.find(p => p.number);
    return firstNumbered?.number || 'N/A';
  }
  const primaryClientIdForRibbon = currentMatter?.clientIds[0];
  const userRole = user?.type === 'firmUser' ? user.firmRole : undefined;

  return (
    <div className="space-y-6">
      {filterByMatterId && currentMatter && currentMatter.firmId === firmId && (
        <MatterActionRibbon matterId={filterByMatterId} matterType={currentMatter.type} primaryClientId={primaryClientIdForRibbon} currentPathname={currentPathname} />
      )}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative sm:w-64 flex-grow sm:flex-grow-0">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filter Contacts
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 space-y-3">
              <div>
                <Label htmlFor="filter-contact-category" className="text-xs font-medium">Category</Label>
                <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as CCEnum | typeof ALL_FILTER_VALUE)}>
                  <SelectTrigger id="filter-contact-category" className="w-full text-xs"><SelectValue placeholder="All Categories" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_FILTER_VALUE}>All Categories</SelectItem>
                    {CONTACT_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-contact-status" className="text-xs font-medium">Status</Label>
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as ContactStatus | typeof ALL_FILTER_VALUE)}>
                  <SelectTrigger id="filter-contact-status" className="w-full text-xs"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_FILTER_VALUE}>All Statuses</SelectItem>
                    {CONTACT_STATUSES.map(stat => <SelectItem key={stat} value={stat}>{stat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
          {canUserManageContact(userRole) && (
            <Button onClick={() => openContactModal()} className="flex-shrink-0">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Contact
            </Button>
          )}
        </div>
      </div>
      {filterByMatterId && currentMatter && (
         <h1 className="text-2xl font-semibold text-foreground">Client Contacts for Matter: {currentMatter.name}</h1>
      )}

      <Card className="shadow-xl">
        <CardContent className="p-0">
          {contactsToDisplay.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Primary Email</TableHead>
                    <TableHead>Primary Phone</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    {!filterByMatterId && <TableHead>Associated Matter</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contactsToDisplay.map(contact => {
                    const associatedMatter = MOCK_MATTERS_DATA.find(m => m.clientIds.includes(contact.id) && m.firmId === firmId);
                    const contactProfileLink = filterByMatterId && currentMatter 
                                                ? `/attorney/contacts/${contact.id}?matterId=${currentMatter.id}`
                                                : `/attorney/contacts/${contact.id}`;
                    return (
                        <TableRow key={contact.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                           <Link href={contactProfileLink} className="text-primary hover:underline">
                             {contact.name}
                           </Link>
                        </TableCell>
                        <TableCell>{getPrimaryEmail(contact.emails)}</TableCell>
                        <TableCell>{getPrimaryPhone(contact.phones)}</TableCell>
                        <TableCell>{contact.category}</TableCell>
                        <TableCell>{contact.company || 'N/A'}</TableCell>
                        <TableCell>
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(contact.status)}`}>
                            {contact.status}
                            </span>
                        </TableCell>
                        <TableCell>{contact.lastActivity}</TableCell>
                        {!filterByMatterId && <TableCell>{associatedMatter ? MOCK_MATTERS_DATA.find(m=>m.id === associatedMatter.id)?.name : 'N/A'}</TableCell>}
                        <TableCell className="text-right space-x-1">
                            <TooltipProvider>
                            {canUserManageContact(userRole) && (
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                  <Button onClick={() => openContactModal(contact)} variant="ghost" size="icon">
                                      <Edit2 className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>Edit Contact</p></TooltipContent>
                              </Tooltip>
                            )}
                            {canUserDeleteContact(userRole) && (
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                  <Button onClick={() => handleDeleteContact(contact.id)} variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>Delete Contact</p></TooltipContent>
                              </Tooltip>
                            )}
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
                <p className="text-lg font-semibold">No Contacts Found</p>
                <p className="text-sm">
                    {searchTerm || filterCategory !== ALL_FILTER_VALUE || filterStatus !== ALL_FILTER_VALUE ? "No contacts match your search/filter criteria." : 
                     (filterByMatterId ? "No client contacts associated with this matter." : "There are no contacts in the system yet.")}
                </p>
             </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
            <DialogDescription>
              {editingContact ? `Update the details for ${editingContact.name}.` : "Add a new contact to your firm's directory."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ScrollArea className="h-[60vh] pr-5">
                <div className="py-4 space-y-4">
                  {editingContact ? (
                     <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., John Smith" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  ) : (
                     <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <Popover open={newContactSuggestionsOpen} onOpenChange={setNewContactSuggestionsOpen}>
                            <PopoverTrigger asChild>
                              <div className="relative flex items-center">
                                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                <FormControl>
                                  <Input
                                    placeholder="Start typing name..."
                                    value={newContactNameSearchTerm}
                                    onChange={(e) => {
                                      const newSearch = e.target.value;
                                      setNewContactNameSearchTerm(newSearch);
                                      field.onChange(newSearch); // Update RHF
                                      if (newSearch.trim().length >= 2) {
                                        setNewContactSuggestionsOpen(true);
                                      } else {
                                        setNewContactSuggestionsOpen(false);
                                      }
                                    }}
                                    onFocus={() => {
                                      if (newContactNameSearchTerm.trim().length >= 2 && potentialNewContactSuggestions.length > 0) {
                                        setNewContactSuggestionsOpen(true);
                                      }
                                    }}
                                    className="pl-8"
                                    autoComplete="off"
                                  />
                                </FormControl>
                                {newContactNameSearchTerm && (
                                  <Button
                                    type="button" variant="ghost" size="icon"
                                    onClick={() => {
                                      setNewContactNameSearchTerm('');
                                      field.onChange('');
                                      // Optionally reset other fields if a selection was made
                                      form.reset({ ...form.getValues(), name: '', emails: [{ address: '', type: 'Work', isPrimary: true }], phones: [{ number: '', type: 'Mobile', isPrimary: true }], category: CONTACT_CATEGORIES[0] as ContactCategory, status: CONTACT_STATUSES[0] as ContactStatus, dob:'', address:'', mailingAddress:'', company:'', notes:'' });
                                      setNewContactSuggestionsOpen(false);
                                    }}
                                    className="absolute right-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" onOpenAutoFocus={(event) => event.preventDefault()}>
                              {newContactSuggestionsOpen && newContactNameSearchTerm.trim().length >= 2 && (
                                <ScrollArea className="h-auto max-h-[200px]">
                                  <div className="p-1">
                                    {potentialNewContactSuggestions.length > 0 ? (
                                      potentialNewContactSuggestions.map(suggContact => (
                                        <Button
                                          key={suggContact.id}
                                          variant="ghost"
                                          className="w-full justify-start text-xs h-auto py-1.5 px-2"
                                          onClick={() => {
                                            // Preserve user-entered 'referredBy' before resetting
                                            const currentReferredBy = form.getValues("referredBy");
                                            form.reset({
                                              ...form.getValues(), // Start with current values (especially referredBy)
                                              name: suggContact.name,
                                              emails: suggContact.emails.length > 0 ? suggContact.emails : [{ address: '', type: 'Work', isPrimary: true }],
                                              phones: suggContact.phones && suggContact.phones.length > 0 ? suggContact.phones : [{ number: '', type: 'Mobile', isPrimary: true }],
                                              category: suggContact.category,
                                              status: suggContact.status,
                                              dob: suggContact.dob || '',
                                              address: suggContact.address || '',
                                              mailingAddress: suggContact.mailingAddress || '',
                                              company: suggContact.company || '',
                                              notes: suggContact.notes || '',
                                              referredBy: currentReferredBy, // Explicitly keep current referredBy
                                            });
                                            setNewContactNameSearchTerm(suggContact.name);
                                            field.onChange(suggContact.name); // Ensure RHF gets the selected name
                                            setNewContactSuggestionsOpen(false);
                                          }}
                                        >
                                          {suggContact.name} <span className="ml-2 text-muted-foreground text-[10px]">({suggContact.category})</span>
                                        </Button>
                                      ))
                                    ) : (
                                      <p className="p-2 text-xs text-muted-foreground">No existing contacts found matching "{newContactNameSearchTerm}". Continue typing to add a new contact.</p>
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
                  )}

                  <FormField control={form.control} name="dob" render={({ field }) => ( 
                    <FormItem><FormLabel>Date of Birth (Optional)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  
                  <Card className="p-4 border-border/70">
                    <CardHeader className="p-0 pb-3 mb-3"><CardTitle className="text-md flex items-center"><Mail className="w-4 h-4 mr-2 text-muted-foreground"/>Email Addresses</CardTitle></CardHeader>
                    <CardContent className="p-0 space-y-3">
                      {emailFields.map((field, index) => (
                        <div key={field.id} className="p-3 border rounded-md bg-muted/30 relative">
                          <FormField control={form.control} name={`emails.${index}.address`} render={({ field: emailField }) => (
                            <FormItem><FormLabel>Email Address {index + 1}</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...emailField} /></FormControl><FormMessage /></FormItem>
                          )}/>
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <FormField control={form.control} name={`emails.${index}.type`} render={({ field: typeField }) => (
                              <FormItem><FormLabel>Type (Optional)</FormLabel><FormControl><Input placeholder="e.g., Work, Home" {...typeField} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name={`emails.${index}.isPrimary`} render={({ field: primaryField }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-7">
                                <FormControl><Checkbox checked={primaryField.value} onCheckedChange={() => handlePrimarySelection("emails", index)} /></FormControl>
                                <FormLabel className="font-normal">Primary Email</FormLabel>
                              </FormItem>
                            )}/>
                          </div>
                          {emailFields.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeEmail(index)} className="absolute top-1 right-1 text-destructive hover:bg-destructive/10 p-1 h-auto text-xs">
                              <Trash2 className="w-3 h-3 mr-1" /> Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => appendEmail({ address: '', type: '', isPrimary: emailFields.length === 0 })} className="mt-2">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Another Email
                      </Button>
                    </CardContent>
                  </Card>

                   <Card className="p-4 border-border/70">
                    <CardHeader className="p-0 pb-3 mb-3"><CardTitle className="text-md flex items-center"><Phone className="w-4 h-4 mr-2 text-muted-foreground"/>Phone Numbers</CardTitle></CardHeader>
                    <CardContent className="p-0 space-y-3">
                      {(phoneFields.length > 0 ? phoneFields : [{id: 'temp-phone-0'}]).map((field, index) => ( 
                        <div key={field.id} className="p-3 border rounded-md bg-muted/30 relative">
                          <FormField control={form.control} name={`phones.${index}.number`} render={({ field: phoneField }) => (
                            <FormItem>
                              <FormLabel>Phone Number {index + 1}</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="(555) 123-4567" {...phoneField} onChange={(e) => { const formattedNumber = formatPhoneNumber(e.target.value); phoneField.onChange(formattedNumber); }} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}/>
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <FormField control={form.control} name={`phones.${index}.type`} render={({ field: typeField }) => (
                              <FormItem><FormLabel>Type (Optional)</FormLabel><FormControl><Input placeholder="e.g., Mobile, Work" {...typeField} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name={`phones.${index}.isPrimary`} render={({ field: primaryField }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-7">
                                <FormControl><Checkbox checked={primaryField.value} onCheckedChange={() => handlePrimarySelection("phones", index)} /></FormControl>
                                <FormLabel className="font-normal">Primary Phone</FormLabel>
                              </FormItem>
                            )}/>
                          </div>
                          {phoneFields.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removePhone(index)} className="absolute top-1 right-1 text-destructive hover:bg-destructive/10 p-1 h-auto text-xs">
                              <Trash2 className="w-3 h-3 mr-1" /> Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => appendPhone({ number: '', type: '', isPrimary: phoneFields.length === 0 })} className="mt-2">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Another Phone
                      </Button>
                    </CardContent>
                  </Card>


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem><FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                        <SelectContent>{CONTACT_CATEGORIES.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select><FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>{CONTACT_STATUSES.map(stat => (<SelectItem key={stat} value={stat}>{stat}</SelectItem>))}</SelectContent></Select><FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                  <FormField control={form.control} name="company" render={({ field }) => (
                    <FormItem><FormLabel>Company (Optional)</FormLabel><FormControl><Input placeholder="e.g., Acme Corp" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Physical Address (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., 123 Main St, Anytown, USA" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="mailingAddress" render={({ field }) => (
                    <FormItem><FormLabel>Mailing Address (Optional, if different)</FormLabel><FormControl><Textarea placeholder="e.g., PO Box 100, Anytown, USA" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  
                  <FormField
                    control={form.control}
                    name="referredBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referred By (Optional)</FormLabel>
                        <Popover open={referredByPopoverOpen} onOpenChange={setReferredByPopoverOpen}>
                          <PopoverTrigger asChild>
                            <div className="relative flex items-center">
                               <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                              <FormControl>
                                <Input
                                  placeholder="Search existing or enter new referrer..."
                                  value={referredBySearchTerm}
                                  onChange={(e) => {
                                    const newSearchTerm = e.target.value;
                                    setReferredBySearchTerm(newSearchTerm);
                                    field.onChange(newSearchTerm); 
                                    if (newSearchTerm.trim().length >= 2) {
                                      setReferredByPopoverOpen(true);
                                    } else {
                                      setReferredByPopoverOpen(false);
                                    }
                                  }}
                                  onFocus={() => {
                                    if (referredBySearchTerm.trim().length >= 2 && potentialReferrers.length > 0) {
                                      setReferredByPopoverOpen(true);
                                    }
                                  }}
                                  className="pl-8"
                                  autoComplete="off"
                                />
                              </FormControl>
                              {referredBySearchTerm && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    field.onChange('');
                                    setReferredBySearchTerm('');
                                    setReferredByPopoverOpen(false);
                                  }}
                                  className="absolute right-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                                  aria-label="Clear referred by"
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
                            { (referredByPopoverOpen && referredBySearchTerm.trim().length >= 2) && (
                               <ScrollArea className="h-auto max-h-[200px]">
                                <div className="p-1">
                                  {potentialReferrers.length > 0 ? (
                                    potentialReferrers.map(refContact => (
                                      <Button
                                        key={refContact.id}
                                        variant="ghost"
                                        className="w-full justify-start text-xs h-auto py-1.5 px-2"
                                        onClick={() => {
                                          field.onChange(refContact.name);
                                          setReferredBySearchTerm(refContact.name);
                                          setReferredByPopoverOpen(false);
                                        }}
                                      >
                                        {refContact.name} ({refContact.category})
                                      </Button>
                                    ))
                                  ) : (
                                    <p className="p-2 text-xs text-muted-foreground">
                                      No existing contacts found matching "{referredBySearchTerm}". You can enter a new name.
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


                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Additional notes about this contact..." {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
              </ScrollArea>
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={closeContactModal}>Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {editingContact ? "Save Changes" : "Add Contact"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
    

