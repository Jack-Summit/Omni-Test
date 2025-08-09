
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Edit2, User, Mail, Phone, Building, MapPin, StickyNote, Briefcase, AlertTriangle, PlusCircle, Users2, Home, Laptop, Smartphone, Trash2, CalendarDays, Search as SearchIcon, XCircle, Share2, FolderKanban } from 'lucide-react';
import { MOCK_CONTACTS_DATA, MOCK_MATTERS_DATA, getMatterNameById } from '@/lib/mock-data';
import type { Contact, ContactFormData, Matter, ContactCategory as CCEnum, ContactStatus, FirmUserRole, EmailEntry, PhoneEntry, MatterType } from '@/lib/types';
import { CONTACT_CATEGORIES, CONTACT_STATUSES, ContactCategory, MATTER_TYPES } from '@/lib/types';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { MatterActionRibbon } from '@/components/layout/matter-action-ribbon';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; 
import { cn } from '@/lib/utils'; 

const emailSchema = z.object({
  address: z.string().email({ message: "Invalid email address." }),
  type: z.string().optional(),
  isPrimary: z.boolean(),
});

const phoneSchema = z.object({
  number: z.string().min(10, { message: "Phone number seems too short." }),
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
    (phones) => !phones || phones.length === 0 || phones.filter(p => p.isPrimary).length === 1,
    { message: "If phone numbers are provided, exactly one must be marked as primary." }
  ),
  address: z.string().optional(),
  mailingAddress: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  referredBy: z.string().optional(),
});

interface ReferredClientAndMatter {
  referredClientId: string | number;
  referredClientName: string;
  matterId: string;
  matterName: string;
  matterType: MatterType;
}


export default function ContactProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const currentPathname = usePathname();
  const contactId = params.contactId as string;
  const firmId = user?.firmId;

  const [contact, setContact] = useState<Contact | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [associatedMatters, setAssociatedMatters] = useState<Matter[]>([]);
  const [relatedContacts, setRelatedContacts] = useState<Contact[]>([]);
  const [referredClientsAndMatters, setReferredClientsAndMatters] = useState<ReferredClientAndMatter[]>([]);
  
  const [currentMatterForRibbon, setCurrentMatterForRibbon] = useState<Matter | null>(null);
  const [primaryClientIdForRibbon, setPrimaryClientIdForRibbon] = useState<string | number | undefined>(undefined);
  const searchParams = useSearchParams();
  const matterIdFromQuery = searchParams.get('matterId');

  const [referredBySearchTermEdit, setReferredBySearchTermEdit] = useState('');
  const [referredByPopoverOpenEdit, setReferredByPopoverOpenEdit] = useState(false);

  const allFirmContacts = useMemo(() => MOCK_CONTACTS_DATA.filter(c => c.firmId === firmId), [firmId]);

  const potentialReferrersEdit = useMemo(() => {
    if (!referredBySearchTermEdit.trim() || referredBySearchTermEdit.length < 2) return [];
    const searchLower = referredBySearchTermEdit.toLowerCase();
    return allFirmContacts.filter(c =>
        c.name.toLowerCase().includes(searchLower) &&
        c.id.toString() !== contactId 
    ).slice(0, 5);
  }, [allFirmContacts, referredBySearchTermEdit, contactId]);


  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      emails: [{ address: '', type: 'Work', isPrimary: true }],
      category: CONTACT_CATEGORIES[0] as CCEnum,
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
  
  useEffect(() => {
    const foundContact = MOCK_CONTACTS_DATA.find(c => c.id.toString() === contactId && c.firmId === firmId);
    setContact(foundContact || null);

    if (foundContact) {
      form.reset({
        name: foundContact.name,
        emails: foundContact.emails.length > 0 ? foundContact.emails : [{ address: '', type: 'Work', isPrimary: true }],
        category: foundContact.category,
        status: foundContact.status,
        dob: foundContact.dob || '',
        phones: foundContact.phones && foundContact.phones.length > 0 ? foundContact.phones : [{ number: '', type: 'Mobile', isPrimary: true }],
        address: foundContact.address || '',
        mailingAddress: foundContact.mailingAddress || '',
        company: foundContact.company || '',
        notes: foundContact.notes || '',
        referredBy: foundContact.referredBy || '',
      });
      setReferredBySearchTermEdit(foundContact.referredBy || ''); 
      
      const mattersForContact = MOCK_MATTERS_DATA.filter(m => 
        m.clientIds.includes(foundContact.id) && m.firmId === firmId
      );
      setAssociatedMatters(mattersForContact);
      
      if (foundContact.relatedContactIds && foundContact.relatedContactIds.length > 0) {
        const relContacts = MOCK_CONTACTS_DATA.filter(c => 
          foundContact.relatedContactIds!.includes(c.id) && c.firmId === firmId
        );
        setRelatedContacts(relContacts);
      } else {
        setRelatedContacts([]);
      }

      // Populate referredClientsAndMatters
      const foundReferredItems: ReferredClientAndMatter[] = [];
      const referredMatters = MOCK_MATTERS_DATA.filter(
        m => m.firmId === firmId && m.referredBy === foundContact.name
      );
      for (const matter of referredMatters) {
        for (const clientId of matter.clientIds) {
          const referredClientContact = MOCK_CONTACTS_DATA.find(
            c => c.id.toString() === clientId.toString() && c.firmId === firmId
          );
          if (referredClientContact) {
            foundReferredItems.push({
              referredClientId: referredClientContact.id,
              referredClientName: referredClientContact.name,
              matterId: matter.id,
              matterName: matter.name,
              matterType: matter.type,
            });
          }
        }
      }
      setReferredClientsAndMatters(foundReferredItems);


      if (matterIdFromQuery && firmId) {
        const matterForRibbon = MOCK_MATTERS_DATA.find(m => m.id === matterIdFromQuery && m.firmId === firmId);
         if (matterForRibbon && matterForRibbon.firmId === firmId) { 
            setCurrentMatterForRibbon(matterForRibbon);
            if (matterForRibbon.clientIds.length > 0) {
            if(matterForRibbon.clientIds.includes(foundContact.id)){
                setPrimaryClientIdForRibbon(foundContact.id);
            } else {
                setPrimaryClientIdForRibbon(matterForRibbon.clientIds[0]);
            }
            } else {
            setPrimaryClientIdForRibbon(undefined);
            }
        } else {
            setCurrentMatterForRibbon(null);
            setPrimaryClientIdForRibbon(undefined);
        }
      } else {
        setCurrentMatterForRibbon(null);
        setPrimaryClientIdForRibbon(undefined);
      }

    } else {
      setAssociatedMatters([]);
      setRelatedContacts([]);
      setReferredClientsAndMatters([]);
      setCurrentMatterForRibbon(null);
      setPrimaryClientIdForRibbon(undefined);
    }
  }, [contactId, form, matterIdFromQuery, firmId]);


  const handleEditSubmit = (data: ContactFormData) => {
    if (!contact || !firmId) return;
    const updatedContactData: Contact = { 
        ...contact, 
        ...data, 
        relatedContactIds: contact.relatedContactIds, 
        firmId 
    };
    
    const index = MOCK_CONTACTS_DATA.findIndex(c => c.id === contact.id && c.firmId === firmId);
    if (index !== -1) {
      MOCK_CONTACTS_DATA[index] = updatedContactData;
    }
    setContact(updatedContactData); 
    toast({ title: "Contact Updated", description: `${data.name}'s profile has been updated.` });
    setShowEditModal(false);
  };
  
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

  const getContactTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
        case 'work': return <Laptop className="w-3 h-3 text-muted-foreground/80" />;
        case 'mobile': return <Smartphone className="w-3 h-3 text-muted-foreground/80" />;
        case 'home': return <Home className="w-3 h-3 text-muted-foreground/80" />;
        default: return null;
    }
  }

  const getMatterDashboardLink = (matterId: string, matterType: MatterType): string => {
    let dashboardSlug = 'estate-planning'; // Default
    if (matterType === MATTER_TYPES.TRUST_ADMINISTRATION) {
      dashboardSlug = 'trust-administration';
    } else if (matterType === MATTER_TYPES.PROSPECT) {
      dashboardSlug = 'prospect';
    }
    return `/attorney/matters/${matterId}/${dashboardSlug}`;
  };

  const userRole = user?.type === 'firmUser' ? user.firmRole : undefined;
  const canUserEditContact = ['Admin', 'Attorney', 'Paralegal'].includes(userRole || '');


  if (!contact) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive text-lg">Error: Contact not found or access denied.</p>
        <Button onClick={() => router.push('/attorney/contacts')} variant="outline" className="mt-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Contacts List
        </Button>
      </div>
    );
  }

  const primaryEmail = contact.emails.find(e => e.isPrimary) || contact.emails[0];
  const primaryPhone = contact.phones?.find(p => p.isPrimary) || contact.phones?.[0];
  const referrerContact = allFirmContacts.find(c => c.name === contact.referredBy);


  return (
    <div className="space-y-6">
       {matterIdFromQuery && currentMatterForRibbon && primaryClientIdForRibbon && currentMatterForRibbon.firmId === firmId && (
        <MatterActionRibbon 
          matterId={matterIdFromQuery} 
          matterType={currentMatterForRibbon.type} 
          primaryClientId={primaryClientIdForRibbon} 
          currentPathname={currentPathname} 
        />
      )}
      <Card className="shadow-xl">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className="text-3xl font-bold text-primary flex items-center">
                <User className="mr-3 h-8 w-8" /> {contact.name}
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                <Badge variant="secondary" className="mr-2">{contact.category}</Badge>
                <Badge className={getStatusBadgeClass(contact.status)}>{contact.status}</Badge>
              </CardDescription>
            </div>
            <div className="mt-3 sm:mt-0 flex space-x-2">
                <Button variant="outline" onClick={() => router.push('/attorney/contacts')}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Contacts List
                </Button>
                {canUserEditContact && (
                    <Button onClick={() => {
                        setReferredBySearchTermEdit(contact.referredBy || ''); 
                        setShowEditModal(true);
                    }}>
                    <Edit2 className="mr-2 h-4 w-4" /> Edit Contact
                    </Button>
                )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><User className="mr-2 h-5 w-5 text-primary/70"/>Contact Information</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {contact.dob && <p><strong className="text-muted-foreground w-28 inline-block">Date of Birth:</strong> {contact.dob}</p>}
                    <div>
                        <strong className="text-muted-foreground block mb-1">Email Addresses:</strong>
                        {contact.emails.map((email, idx) => (
                            <div key={idx} className="flex items-center space-x-2 py-0.5">
                                {getContactTypeIcon(email.type)}
                                <a href={`mailto:${email.address}`} className="text-primary hover:underline">{email.address}</a>
                                {email.isPrimary && <Badge variant="outline" className="text-xs px-1.5 py-0">Primary</Badge>}
                                {email.type && <span className="text-xs text-muted-foreground">({email.type})</span>}
                            </div>
                        ))}
                    </div>
                     <div>
                        <strong className="text-muted-foreground block mb-1">Phone Numbers:</strong>
                        {contact.phones && contact.phones.length > 0 ? contact.phones.map((phone, idx) => (
                            <div key={idx} className="flex items-center space-x-2 py-0.5">
                                {getContactTypeIcon(phone.type)}
                                <span>{phone.number}</span>
                                {phone.isPrimary && <Badge variant="outline" className="text-xs px-1.5 py-0">Primary</Badge>}
                                {phone.type && <span className="text-xs text-muted-foreground">({phone.type})</span>}
                            </div>
                        )) : <p className="text-muted-foreground italic">N/A</p>}
                    </div>
                    <p><strong className="text-muted-foreground w-28 inline-block">Physical Address:</strong> {contact.address || 'N/A'}</p>
                    {contact.mailingAddress && <p><strong className="text-muted-foreground w-28 inline-block">Mailing Address:</strong> {contact.mailingAddress}</p>}
                    <p><strong className="text-muted-foreground w-28 inline-block">Company:</strong> {contact.company || 'N/A'}</p>
                    <p>
                      <strong className="text-muted-foreground w-28 inline-block">Referred By:</strong>
                      {referrerContact ? (
                        <Link href={`/attorney/contacts/${referrerContact.id}${matterIdFromQuery ? `?matterId=${matterIdFromQuery}` : ''}`} className="text-primary hover:underline">
                          {contact.referredBy}
                        </Link>
                      ) : (
                        contact.referredBy || 'N/A'
                      )}
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center"><StickyNote className="mr-2 h-5 w-5 text-primary/70"/>Notes</CardTitle>
                    {canUserEditContact && (
                        <Button variant="outline" size="sm" onClick={() => {
                            setReferredBySearchTermEdit(contact.referredBy || '');
                            setShowEditModal(true);
                        }}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add/Edit Note
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.notes || 'No notes for this contact.'}</p>
                </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
             <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary/70"/>Associated Matters</CardTitle></CardHeader>
                <CardContent>
                    {associatedMatters.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                        {associatedMatters.map(matter => (
                            <li key={matter.id} className="hover:bg-muted/30 p-1.5 rounded-md transition-colors">
                            <Link href={getMatterDashboardLink(matter.id, matter.type)} className="text-primary hover:underline">
                                {matter.name} ({matter.type})
                            </Link>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No matters associated with this contact.</p>
                    )}
                </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center"><Share2 className="mr-2 h-5 w-5 text-primary/70"/>Referred Clients</CardTitle></CardHeader>
              <CardContent>
                  {referredClientsAndMatters.length > 0 ? (
                      <ul className="space-y-3 text-sm">
                      {referredClientsAndMatters.map(item => (
                          <li key={`${item.referredClientId}-${item.matterId}`} className="hover:bg-muted/30 p-2 rounded-md transition-colors border">
                            <Link href={`/attorney/contacts/${item.referredClientId}${matterIdFromQuery ? `?matterId=${matterIdFromQuery}` : ''}`} className="text-primary font-medium hover:underline">
                                {item.referredClientName}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                For Matter: <Link href={getMatterDashboardLink(item.matterId, item.matterType)} className="text-primary/80 hover:underline">{item.matterName}</Link> ({item.matterType})
                            </p>
                          </li>
                      ))}
                      </ul>
                  ) : (
                      <p className="text-sm text-muted-foreground">This contact has not referred any clients.</p>
                  )}
              </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary/70" />Activity</CardTitle></CardHeader>
                <CardContent>
                     <p className="text-sm text-muted-foreground">Last Activity: {contact.lastActivity}</p>
                </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center"><Users2 className="mr-2 h-5 w-5 text-primary/70"/>Related Contacts</CardTitle></CardHeader>
              <CardContent>
                  {relatedContacts.length > 0 ? (
                      <ul className="space-y-2 text-sm">
                      {relatedContacts.map(relContact => (
                          <li key={relContact.id} className="hover:bg-muted/30 p-1.5 rounded-md transition-colors">
                          <Link href={`/attorney/contacts/${relContact.id}${matterIdFromQuery ? `?matterId=${matterIdFromQuery}` : ''}`} className="text-primary hover:underline">
                              {relContact.name} <span className="text-xs text-muted-foreground">({relContact.category})</span>
                          </Link>
                          </li>
                      ))}
                      </ul>
                  ) : (
                      <p className="text-sm text-muted-foreground">No related contacts.</p>
                  )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEditModal} onOpenChange={(isOpen) => {
          setShowEditModal(isOpen);
          if (!isOpen) {
              setReferredByPopoverOpenEdit(false); 
              setReferredBySearchTermEdit(contact.referredBy || ''); 
          }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Contact: {contact.name}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
              <ScrollArea className="h-[60vh] pr-5">
                <div className="py-4 space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
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
                            <FormItem><FormLabel>Phone Number {index + 1}</FormLabel><FormControl><Input type="tel" placeholder="(555) 123-4567" {...phoneField} /></FormControl><FormMessage /></FormItem>
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
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>{CONTACT_CATEGORIES.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select><FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>{CONTACT_STATUSES.map(stat => (<SelectItem key={stat} value={stat}>{stat}</SelectItem>))}</SelectContent></Select><FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                  <FormField control={form.control} name="company" render={({ field }) => (
                    <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Physical Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="mailingAddress" render={({ field }) => (
                    <FormItem><FormLabel>Mailing Address (if different)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                   <FormField
                    control={form.control}
                    name="referredBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referred By (Optional)</FormLabel>
                        <Popover open={referredByPopoverOpenEdit} onOpenChange={setReferredByPopoverOpenEdit}>
                          <PopoverTrigger asChild>
                            <div className="relative flex items-center">
                                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                <FormControl>
                                    <Input
                                      placeholder="Search existing or enter new referrer..."
                                      value={referredBySearchTermEdit}
                                      onChange={(e) => {
                                        const newSearchTerm = e.target.value;
                                        setReferredBySearchTermEdit(newSearchTerm);
                                        field.onChange(newSearchTerm);
                                        if (newSearchTerm.trim().length >= 2) {
                                          setReferredByPopoverOpenEdit(true);
                                        } else {
                                          setReferredByPopoverOpenEdit(false);
                                        }
                                      }}
                                      onFocus={() => {
                                        if (referredBySearchTermEdit.trim().length >= 2 && potentialReferrersEdit.length > 0) {
                                            setReferredByPopoverOpenEdit(true);
                                        }
                                      }}
                                      className="pl-8"
                                      autoComplete="off"
                                    />
                                </FormControl>
                                {referredBySearchTermEdit && (
                                    <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        field.onChange('');
                                        setReferredBySearchTermEdit('');
                                        setReferredByPopoverOpenEdit(false);
                                    }}
                                    className="absolute right-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                                    aria-label="Clear referred by"
                                    >
                                    <XCircle className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" onOpenAutoFocus={(event) => event.preventDefault()}>
                            { (referredByPopoverOpenEdit && referredBySearchTermEdit.trim().length >= 2) && (
                               <ScrollArea className="h-auto max-h-[200px]">
                                <div className="p-1">
                                  {potentialReferrersEdit.length > 0 ? (
                                    potentialReferrersEdit.map(refContact => (
                                      <Button
                                        key={refContact.id}
                                        variant="ghost"
                                        className="w-full justify-start text-xs h-auto py-1.5 px-2"
                                        onClick={() => {
                                          field.onChange(refContact.name);
                                          setReferredBySearchTermEdit(refContact.name);
                                          setReferredByPopoverOpenEdit(false);
                                        }}
                                      >
                                        {refContact.name} ({refContact.category})
                                      </Button>
                                    ))
                                  ) : (
                                    <p className="p-2 text-xs text-muted-foreground">
                                      No existing contacts found matching "{referredBySearchTermEdit}". You can enter a new name.
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
                    <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
              </ScrollArea>
              <DialogFooter className="pt-4">
                <DialogClose asChild><Button type="button" variant="outline" onClick={() => {
                    setShowEditModal(false);
                    setReferredByPopoverOpenEdit(false);
                    setReferredBySearchTermEdit(contact.referredBy || ''); 
                }}>Cancel</Button></DialogClose>
                <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" />Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

