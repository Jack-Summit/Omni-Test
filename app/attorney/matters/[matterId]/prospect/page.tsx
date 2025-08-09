
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronLeft, RefreshCw, MessageSquare, CheckSquare, NotebookText, Users, PlusCircle, UserCheck, Target, Info, FileText, CalendarClock, FileSignatureIcon, FileInput, BarChart3, AlertTriangle, PhoneForwarded, Send, Eye, Edit2 as EditIcon, Search as SearchIcon, XCircle } from 'lucide-react';
import { MOCK_MATTERS_DATA, MOCK_CONTACTS_DATA, MOCK_NOTES_DATA, getFirmUserNameById, getContactNameById, MOCK_FIRM_USERS_DATA } from '@/lib/mock-data';
import type { Matter, Contact, Note, MatterType, MatterStatus, ContactCategory, IntakeFormStatus, FirmUserRole, User as FirmUserType, MatterFormData } from '@/lib/types';
import { MATTER_TYPES, INTAKE_FORM_STATUSES, statusOptionsByType, NO_ATTORNEY_SELECTED_VALUE_MATTER, INTAKE_FORM_TYPES } from '@/lib/types';
import { toast } from "@/hooks/use-toast";
import { MatterActionRibbon } from '@/components/layout/matter-action-ribbon';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from '@/lib/utils';


interface ConvertMatterModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospectMatter: Matter;
  updateMatterDetailsGlobally: (matterId: string, newDetails: Partial<Matter>) => void;
}

const NO_FORM_TYPE_SELECTED_VALUE = "[NO_FORM_TYPE_SELECTED_PROSPECT]";

function ConvertMatterModal({ isOpen, onClose, prospectMatter, updateMatterDetailsGlobally }: ConvertMatterModalProps) {
  const router = useRouter();
  const billableMatterTypes = Object.values(MATTER_TYPES).filter(type => type !== MATTER_TYPES.PROSPECT);
  
  const [newMatterType, setNewMatterType] = useState<MatterType>(billableMatterTypes[0] || MATTER_TYPES.ESTATE_PLANNING);
  const [newMatterName, setNewMatterName] = useState(
    prospectMatter.name.replace(/Inquiry|Prospect/gi, "File").trim() || `Retained - ${prospectMatter.name}`
  );

  useEffect(() => {
    if (prospectMatter) {
      setNewMatterName(prospectMatter.name.replace(/Inquiry|Prospect/gi, "File").trim() || `Retained - ${prospectMatter.name}`);
      setNewMatterType(billableMatterTypes[0] || MATTER_TYPES.ESTATE_PLANNING);
    }
  }, [prospectMatter, billableMatterTypes]);


  const handleConvert = () => {
    if (!newMatterName.trim()) {
        toast({ title: "Validation Error", description: "New matter name cannot be empty.", variant: "destructive"});
        return;
    }
    updateMatterDetailsGlobally(prospectMatter.id, {
      type: newMatterType,
      name: newMatterName,
      status: 'Open', 
    });
    toast({ title: "Prospect Converted", description: `Matter "${newMatterName}" is now an official ${newMatterType} matter.`});
    onClose();
    
    let newPathSegment = 'estate-planning'; 
    if (newMatterType === MATTER_TYPES.TRUST_ADMINISTRATION) newPathSegment = 'trust-administration';
    // Add more else if for other matter types and their specific dashboard paths
    
    router.push(`/attorney/matters/${prospectMatter.id}/${newPathSegment}`); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Convert Prospect: {prospectMatter.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            You are about to retain this prospect and convert them to an official matter. Please confirm the new matter details.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="newMatterNameModal">New Matter Name</Label>
            <Input
              id="newMatterNameModal"
              value={newMatterName}
              onChange={(e) => setNewMatterName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newMatterTypeModal">Official Matter Type</Label>
             <Select onValueChange={(value) => setNewMatterType(value as MatterType)} defaultValue={newMatterType}>
              <SelectTrigger id="newMatterTypeModal">
                <SelectValue placeholder="Select matter type" />
              </SelectTrigger>
              <SelectContent>
                {billableMatterTypes.map(typeValue => (
                  <SelectItem key={typeValue} value={typeValue}>{typeValue}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="pt-4">
          <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleConvert} className="bg-green-600 hover:bg-green-700 text-white">
            <RefreshCw className="mr-2 h-4 w-4" /> Confirm Conversion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const matterFormSchema = z.object({
  name: z.string().min(3, { message: "Matter name must be at least 3 characters." }),
  type: z.nativeEnum(MATTER_TYPES),
  status: z.string(),
  linkedClientIds: z.array(z.union([z.string(), z.number()])).min(1, "At least one client must be linked."),
  responsibleAttorneyId: z.string().optional(),
  openDate: z.string().refine((val) => val === '' || !isNaN(Date.parse(val)), { message: "Invalid open date format." }),
  closeDate: z.string().optional().refine((val) => !val || val === '' || !isNaN(Date.parse(val)), { message: "Invalid close date format." }),
  consultationDate1: z.string().optional().refine((val) => !val || val === '' || !isNaN(Date.parse(val)), { message: "Invalid consultation date 1 format." }),
  consultationDate2: z.string().optional().refine((val) => !val || val === '' || !isNaN(Date.parse(val)), { message: "Invalid consultation date 2 format." }),
  engagementLetterSentDate: z.string().optional().refine((val) => !val || val === '' || !isNaN(Date.parse(val)), { message: "Invalid engagement letter sent date format." }),
  expectedDecisionDate: z.string().optional().refine((val) => !val || val === '' || !isNaN(Date.parse(val)), { message: "Invalid expected decision date format." }),
  importantDate: z.string().optional().refine((val) => !val || val === '' || !isNaN(Date.parse(val)), { message: "Invalid important date format." }),
  importantDateNotes: z.string().optional(),
  referredBy: z.string().optional(),
});


export default function ProspectDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const currentPathname = usePathname();
  const matterId = params.matterId as string;
  const firmId = user?.firmId;

  const [matter, setMatter] = useState<Matter | null>(null);
  const [clients, setClients] = useState<Contact[]>([]);
  const [primaryClientId, setPrimaryClientId] = useState<string | number | undefined>(undefined);
  const [prospectNotes, setProspectNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showConvertModal, setShowConvertModal] = useState(false);

  const [selectedIntakeFormType, setSelectedIntakeFormType] = useState<string>(NO_FORM_TYPE_SELECTED_VALUE);
  const MOCK_INTAKE_FORM_TYPES_LOCAL = [ 
      INTAKE_FORM_TYPES.ESTATE_PLANNING,
      INTAKE_FORM_TYPES.ESTATE_PLAN_UPDATE,
      INTAKE_FORM_TYPES.TRUST_ADMINISTRATION,
      INTAKE_FORM_TYPES.PROBATE,
      INTAKE_FORM_TYPES.BUSINESS,
      INTAKE_FORM_TYPES.GENERAL_INQUIRY,
    ];


  const [showEditMatterModal, setShowEditMatterModal] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [referredBySearchTermEditProspect, setReferredBySearchTermEditProspect] = useState('');
  const [referredByPopoverOpenEditProspect, setReferredByPopoverOpenEditProspect] = useState(false);


  const firmAttorneys = useMemo(() =>
    firmId ? MOCK_FIRM_USERS_DATA.filter(u => u.firmId === firmId && (u.firmRole === 'Admin' || u.firmRole === 'Attorney')) : [],
  [firmId]);

  const contactsForFirm = useMemo(() =>
    firmId ? MOCK_CONTACTS_DATA.filter(c => c.category === "Client" as ContactCategory && c.firmId === firmId) : [],
  [firmId]);
  
  const allFirmContactsForProspectEdit = useMemo(() => 
    firmId ? MOCK_CONTACTS_DATA.filter(c => c.firmId === firmId) : [], 
  [firmId]);

  const potentialReferrersEditProspect = useMemo(() => {
    if (!referredBySearchTermEditProspect.trim() || referredBySearchTermEditProspect.length < 2) return [];
    const searchLower = referredBySearchTermEditProspect.toLowerCase();
    return allFirmContactsForProspectEdit.filter(c =>
        c.name.toLowerCase().includes(searchLower)
    ).slice(0, 5);
  }, [allFirmContactsForProspectEdit, referredBySearchTermEditProspect]);


  const filteredClientContacts = useMemo(() =>
    contactsForFirm.filter(contact =>
      contact.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      (contact.emails && contact.emails[0] && contact.emails[0].address.toLowerCase().includes(clientSearchTerm.toLowerCase()))
    ), [contactsForFirm, clientSearchTerm]);

  const matterForm = useForm<MatterFormData>({
    resolver: zodResolver(matterFormSchema),
  });
  const selectedMatterTypeInForm = matterForm.watch("type");


  const updateMatterDetailsGlobally = (id: string, newDetails: Partial<Matter>) => {
    const index = MOCK_MATTERS_DATA.findIndex(m => m.id === id && m.firmId === firmId);
    if (index !== -1) {
      MOCK_MATTERS_DATA[index] = { ...MOCK_MATTERS_DATA[index], ...newDetails };
      setMatter(prev => prev ? { ...prev, ...newDetails, responsibleAttorneyName: newDetails.responsibleAttorneyId ? getFirmUserNameById(newDetails.responsibleAttorneyId) : undefined } : null);
    }
  };

  useEffect(() => {
    if (matterId && firmId) {
      const foundMatter = MOCK_MATTERS_DATA.find(m => m.id === matterId && m.firmId === firmId);
      if (foundMatter) {
        setMatter({
          ...foundMatter,
          responsibleAttorneyName: getFirmUserNameById(foundMatter.responsibleAttorneyId)
        });
        const matterClients = MOCK_CONTACTS_DATA.filter(c => foundMatter.clientIds.includes(c.id) && c.category === "Client" as ContactCategory && c.firmId === firmId);
        setClients(matterClients);
        if (matterClients.length > 0) setPrimaryClientId(matterClients[0].id);
        setProspectNotes(MOCK_NOTES_DATA(matterId).map((note, index) => ({...note, id: `note-${matterId}-${index}`})));
        setSelectedIntakeFormType(foundMatter.intakeFormType || NO_FORM_TYPE_SELECTED_VALUE);
      } else {
        setMatter(null);
         toast({ title: "Error", description: "Prospect matter not found or access denied.", variant: "destructive" });
        router.push('/attorney/matters');
      }
    }
  }, [matterId, firmId, router]);

  const openEditMatterModal = () => {
    if (matter) {
      matterForm.reset({
        name: matter.name,
        type: matter.type,
        status: matter.status,
        linkedClientIds: matter.clientIds,
        responsibleAttorneyId: matter.responsibleAttorneyId || NO_ATTORNEY_SELECTED_VALUE_MATTER,
        openDate: matter.openDate,
        closeDate: matter.closeDate || '',
        consultationDate1: matter.consultationDate1 || '',
        consultationDate2: matter.consultationDate2 || '',
        engagementLetterSentDate: matter.engagementLetterSentDate || '',
        expectedDecisionDate: matter.expectedDecisionDate || '',
        importantDate: matter.importantDate || '',
        importantDateNotes: matter.importantDateNotes || '',
        referredBy: matter.referredBy || '',
      });
      setReferredBySearchTermEditProspect(matter.referredBy || '');
      setClientSearchTerm(''); 
      setShowEditMatterModal(true);
    }
  };

  const onEditMatterSubmit = (data: MatterFormData) => {
    if (!matter || !firmId) return;
    const finalResponsibleAttorneyId = data.responsibleAttorneyId === NO_ATTORNEY_SELECTED_VALUE_MATTER || data.responsibleAttorneyId === ''
                                     ? undefined
                                     : data.responsibleAttorneyId;
    
    updateMatterDetailsGlobally(matter.id, {
        name: data.name,
        type: data.type,
        status: data.status,
        clientIds: data.linkedClientIds,
        responsibleAttorneyId: finalResponsibleAttorneyId,
        openDate: data.openDate,
        closeDate: data.closeDate || undefined,
        consultationDate1: data.consultationDate1 || undefined,
        consultationDate2: data.consultationDate2 || undefined,
        engagementLetterSentDate: data.engagementLetterSentDate || undefined,
        expectedDecisionDate: data.expectedDecisionDate || undefined,
        importantDate: data.importantDate || undefined,
        importantDateNotes: data.importantDateNotes || undefined,
        referredBy: data.referredBy || undefined,
    });
    toast({ title: "Matter Updated", description: `Matter "${data.name}" has been updated.` });
    setShowEditMatterModal(false);
  };


  if (!matter) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive text-lg">Loading prospect matter data...</p>
        <Button onClick={() => router.push('/attorney/matters')} variant="outline" className="mt-4">
          Return to Matters List
        </Button>
      </div>
    );
  }

  const handleAddNote = () => {
    if (newNote.trim() === '') {
      toast({ title: "Empty Note", description: "Cannot add an empty note.", variant: "destructive"});
      return;
    }
    const noteToAdd: Note = { id: `note-${matterId}-${Date.now()}`, date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }), note: newNote };
    MOCK_NOTES_DATA(matterId).unshift(noteToAdd); 
    setProspectNotes(prev => [noteToAdd, ...prev]);
    setNewNote('');
    toast({ title: "Note Added", description: "Your note has been added." });
  };
  
  const handleSendIntakeForm = () => {
    if (!selectedIntakeFormType || selectedIntakeFormType === NO_FORM_TYPE_SELECTED_VALUE) {
      toast({ title: "Form Type Required", description: "Please select an intake form type to send.", variant: "destructive" });
      return;
    }
    updateMatterDetailsGlobally(matter.id, {
      intakeFormStatus: 'Sent',
      intakeFormSentDate: new Date().toISOString().split('T')[0],
      intakeFormType: selectedIntakeFormType as IntakeFormType,
    });
    toast({ title: "Intake Form Sent", description: `The "${selectedIntakeFormType}" has been marked as sent.` });
  };

  const handleMarkIntakeComplete = () => {
     updateMatterDetailsGlobally(matter.id, {
      intakeFormStatus: 'Completed',
      intakeFormCompletedDate: new Date().toISOString().split('T')[0],
    });
    toast({ title: "Intake Marked Complete", description: "The intake form has been marked as completed." });
  };


  const getStatusColor = (status: MatterStatus) => {
    if (status === 'Lead' || status === 'Contacted' || status === 'Consult Scheduled') return 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  };
  
  const primaryClient = clients[0]; 

  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full -m-6 p-6">
      {matter.type && <MatterActionRibbon matterId={matterId} matterType={matter.type} primaryClientId={primaryClientId?.id} currentPathname={currentPathname} />}
      
      <div className="mb-6 p-4 bg-card shadow rounded-lg border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{matter.name}</h1>
            <p className="text-sm text-muted-foreground">
              ID: {matter.id} | Type: <span className="font-semibold text-purple-600 dark:text-purple-400">{matter.type}</span> | Status:
              <span className={`ml-1 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(matter.status)}`}>
                {matter.status}
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
                Open Date: {formatDateForDisplay(matter.openDate)} {matter.closeDate && `| Close Date: ${formatDateForDisplay(matter.closeDate)}`}
            </p>
            {matter.responsibleAttorneyName && (
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <UserCheck className="w-4 h-4 mr-1.5 text-primary/70"/>
                    Assigned: <span className="font-medium ml-1">{matter.responsibleAttorneyName}</span>
                </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
            <Button onClick={() => router.push('/attorney/matters')} variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Matters
            </Button>
            <Button onClick={openEditMatterModal} variant="outline">
                <EditIcon className="mr-2 h-4 w-4" /> Edit Matter
            </Button>
            <Button onClick={() => setShowConvertModal(true)} className="bg-green-600 hover:bg-green-700 text-white focus:ring-green-500">
              <RefreshCw className="mr-2 h-4 w-4" /> Retain & Convert Matter
            </Button>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center"><Target className="h-5 w-5 mr-2 text-primary"/>At-a-Glance Summary</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-muted-foreground">Prospect Name:</span>{' '}
                {primaryClient ? (
                  <Link href={`/attorney/contacts/${primaryClient.id}?matterId=${matterId}`} className="text-primary hover:underline">
                    {matter.name}
                  </Link>
                ) : (
                  matter.name
                )}
              </div>
              <div><span className="font-semibold text-muted-foreground">Current Status:</span> <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(matter.status)}`}>{matter.status}</span></div>
              <div><span className="font-semibold text-muted-foreground">Assigned To:</span> {matter.responsibleAttorneyName || "N/A"}</div>
              <div>
                <span className="font-semibold text-muted-foreground">Potential Services/Needs:</span>{' '}
                <span className="text-foreground">{matter.potentialServicesNotes || "Not specified"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-muted-foreground">Referred By:</span>{' '}
                {matter.referredBy ? (
                  (() => {
                    const referrerContact = allFirmContactsForProspectEdit.find(c => c.name === matter.referredBy);
                    if (referrerContact) {
                      return (
                        <Link href={`/attorney/contacts/${referrerContact.id}?matterId=${matterId}`} className="text-primary hover:underline">
                          {matter.referredBy}
                        </Link>
                      );
                    }
                    return <span className="text-foreground">{matter.referredBy}</span>;
                  })()
                ) : (
                  <span className="italic text-muted-foreground/70">Not specified</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center"><Users className="h-5 w-5 mr-2 text-primary"/>Detailed Contact Information</CardTitle></CardHeader>
            <CardContent>
              {clients.map(client => (
                <div key={client.id} className="p-3 border-b last:border-b-0">
                  <p className="font-semibold text-lg text-foreground mb-1">{client.name}</p>
                  {client.emails.map(e => <p key={e.address} className="text-sm text-muted-foreground">{e.type || 'Email'}: <a href={`mailto:${e.address}`} className="text-primary hover:underline">{e.address}</a> {e.isPrimary && <span className="text-xs text-accent">(Primary)</span>}</p>)}
                  {client.phones?.map(p => <p key={p.number} className="text-sm text-muted-foreground">{p.type || 'Phone'}: {p.number} {p.isPrimary && <span className="text-xs text-accent">(Primary)</span>}</p>)}
                  {client.address && <p className="text-sm text-muted-foreground mt-1">Address: {client.address}</p>}
                  {client.company && <p className="text-sm text-muted-foreground">Company: {client.company}</p>}
                </div>
              ))}
              {clients.length === 0 && <p className="text-muted-foreground">No client contacts linked.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center"><Info className="h-5 w-5 mr-2 text-primary"/>Lead Source & Acquisition</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><span className="font-semibold text-muted-foreground">Initial Contact Date:</span> {formatDateForDisplay(matter.openDate)}</p>
              <p><span className="font-semibold text-muted-foreground">Lead Source:</span> {matter.referredBy || primaryClient?.referredBy || <span className="italic text-muted-foreground/70">Not specified</span>}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center"><NotebookText className="h-5 w-5 mr-2 text-primary"/>Follow-Up Log & Notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea placeholder="Add a new note or log follow-up activity..." rows={4} value={newNote} onChange={(e) => setNewNote(e.target.value)} className="mb-2"/>
              <div className="text-right">
                <Button size="sm" variant="secondary" onClick={handleAddNote}><PlusCircle className="mr-2 h-4 w-4" />Add Note</Button>
              </div>
              <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                {prospectNotes.length > 0 ? prospectNotes.map((entry) => (
                  <div key={entry.id || entry.date} className="p-3 bg-muted/30 rounded-md border border-border/50">
                    <p className="text-xs text-muted-foreground font-medium">{formatDateForDisplay(entry.date)}</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{entry.note}</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground text-center py-3">No notes yet.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center text-base"><CalendarClock className="h-5 w-5 mr-2 text-primary"/>Key Dates & Timeline</CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={openEditMatterModal} aria-label="Edit Key Dates">
                    <EditIcon className="h-4 w-4"/>
                </Button>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><span className="font-semibold text-muted-foreground">Initial Inquiry:</span> {formatDateForDisplay(matter.openDate)}</p>
              <p><span className="font-semibold text-muted-foreground">Intake Form Sent:</span> {formatDateForDisplay(matter.intakeFormSentDate)}</p>
              <p><span className="font-semibold text-muted-foreground">Intake Form Received:</span> {formatDateForDisplay(matter.intakeFormCompletedDate)}</p>
              <p><span className="font-semibold text-muted-foreground">Consultation Date 1:</span> {formatDateForDisplay(matter.consultationDate1)}</p>
              <p><span className="font-semibold text-muted-foreground">Consultation Date 2:</span> {formatDateForDisplay(matter.consultationDate2)}</p>
              <p><span className="font-semibold text-muted-foreground">Engagement Letter Sent:</span> {formatDateForDisplay(matter.engagementLetterSentDate)}</p>
              <p><span className="font-semibold text-muted-foreground">Expected Decision Date:</span> {formatDateForDisplay(matter.expectedDecisionDate)}</p>
              <p><span className="font-semibold text-muted-foreground">Important Dates:</span> {formatDateForDisplay(matter.importantDate)}</p>
              {matter.importantDateNotes && <p className="text-xs text-muted-foreground/80 italic mt-1">Important Date Notes: {matter.importantDateNotes}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><FileInput className="h-5 w-5 mr-2 text-primary"/>Intake Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <Label htmlFor="intakeFormTypeSelect" className="text-xs font-medium">Form Type</Label>
                    <Select 
                        value={selectedIntakeFormType} 
                        onValueChange={setSelectedIntakeFormType}
                        disabled={matter.intakeFormStatus === 'Sent' || matter.intakeFormStatus === 'Completed'}
                    >
                        <SelectTrigger id="intakeFormTypeSelect" className="h-9 text-xs">
                            <SelectValue placeholder="-- Select Form Type --" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NO_FORM_TYPE_SELECTED_VALUE}>-- Select Form Type --</SelectItem>
                            {MOCK_INTAKE_FORM_TYPES_LOCAL.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {matter.intakeFormType && <p className="text-xs text-muted-foreground mt-1">Currently selected: {matter.intakeFormType}</p>}
                </div>
                <div>
                    <p className="text-xs font-medium">Status: <span className="font-normal text-foreground">{matter.intakeFormStatus || 'Not Sent'}</span></p>
                    {matter.intakeFormSentDate && <p className="text-xs text-muted-foreground">Sent: {formatDateForDisplay(matter.intakeFormSentDate)}</p>}
                    {matter.intakeFormCompletedDate && <p className="text-xs text-muted-foreground">Completed: {formatDateForDisplay(matter.intakeFormCompletedDate)}</p>}
                </div>
                <div className="flex flex-col gap-2">
                    {matter.intakeFormStatus !== 'Completed' && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleSendIntakeForm}
                            disabled={!selectedIntakeFormType || selectedIntakeFormType === NO_FORM_TYPE_SELECTED_VALUE}
                        >
                            <Send className="mr-2 h-4 w-4"/> 
                            {matter.intakeFormStatus === 'Sent' ? 'Resend Form' : 'Send Form'}
                        </Button>
                    )}
                    {(matter.intakeFormStatus === 'Sent' || matter.intakeFormStatus === 'Started') && (
                        <Button variant="secondary" size="sm" onClick={handleMarkIntakeComplete}>
                            <CheckSquare className="mr-2 h-4 w-4"/> Mark as Completed
                        </Button>
                    )}
                    {matter.intakeFormStatus === 'Completed' && (
                         <Button variant="default" size="sm" onClick={() => toast({title: "Placeholder", description: "Viewing submitted form..."})}>
                            <Eye className="mr-2 h-4 w-4"/> View Submitted Form
                        </Button>
                    )}
                </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="flex items-center"><FileText className="h-5 w-5 mr-2 text-primary"/>Prospect Documents</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground italic">Prospect-specific document storage coming soon.</p></CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="flex items-center"><CheckSquare className="h-5 w-5 mr-2 text-primary"/>Prospect Tasks</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground italic">Prospect-specific task management coming soon.</p></CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="flex items-center"><PhoneForwarded className="h-5 w-5 mr-2 text-primary"/>Lead Temperature</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground italic">Internal lead temperature check feature coming soon.</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center"><FileSignatureIcon className="h-5 w-5 mr-2 text-primary"/>Engagement Letter</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground italic">Engagement letter status and actions coming soon.</p></CardContent>
          </Card>
        </div>
      </div>

      {matter && <ConvertMatterModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        prospectMatter={matter}
        updateMatterDetailsGlobally={updateMatterDetailsGlobally}
      />}

       {/* Edit Matter Dialog */}
      <Dialog open={showEditMatterModal} onOpenChange={setShowEditMatterModal}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Prospect Matter: {matter?.name}</DialogTitle>
          </DialogHeader>
          <Form {...matterForm}>
            <form onSubmit={matterForm.handleSubmit(onEditMatterSubmit)} className="space-y-4 py-4">
              <ScrollArea className="h-[60vh] pr-5">
                <div className="space-y-4">
                  <FormField control={matterForm.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Matter Name / ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={matterForm.control} name="type" render={({ field }) => (
                      <FormItem><FormLabel>Type of Matter</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>{Object.values(MATTER_TYPES).map(typeValue => (<SelectItem key={typeValue} value={typeValue}>{typeValue}</SelectItem>))}</SelectContent></Select>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">Matter type is Prospect and cannot be changed here. Use "Retain &amp; Convert".</p>
                      </FormItem>
                    )}/>
                    <FormField control={matterForm.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>{(statusOptionsByType[MATTER_TYPES.PROSPECT]).map(statusValue => (<SelectItem key={statusValue} value={statusValue}>{statusValue}</SelectItem>))}</SelectContent></Select><FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                  <FormField control={matterForm.control} name="responsibleAttorneyId" render={({ field }) => (
                    <FormItem><FormLabel>Responsible Attorney (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder="-- Select Attorney --" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value={NO_ATTORNEY_SELECTED_VALUE_MATTER}>-- None --</SelectItem>
                        {firmAttorneys.map(attorney => (<SelectItem key={attorney.id} value={attorney.id}>{attorney.name}</SelectItem>))}
                      </SelectContent></Select><FormMessage />
                    </FormItem>
                  )}/>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={matterForm.control} name="openDate" render={({ field }) => (
                      <FormItem><FormLabel>Open Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={matterForm.control} name="closeDate" render={({ field }) => (
                      <FormItem><FormLabel>Close Date (Optional)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  </div>
                  
                  <FormField
                    control={matterForm.control}
                    name="referredBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referred By (Optional)</FormLabel>
                        <Popover open={referredByPopoverOpenEditProspect} onOpenChange={setReferredByPopoverOpenEditProspect}>
                          <PopoverTrigger asChild>
                            <div className="relative flex items-center">
                                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                <FormControl>
                                    <Input
                                      placeholder="Search existing contacts or enter new name..."
                                      value={referredBySearchTermEditProspect}
                                      onChange={(e) => {
                                        const newSearchTerm = e.target.value;
                                        setReferredBySearchTermEditProspect(newSearchTerm);
                                        field.onChange(newSearchTerm);
                                        if (newSearchTerm.trim().length >= 2) {
                                          setReferredByPopoverOpenEditProspect(true);
                                        } else {
                                          setReferredByPopoverOpenEditProspect(false);
                                        }
                                      }}
                                      onFocus={() => {
                                        if (referredBySearchTermEditProspect.trim().length >= 2 && potentialReferrersEditProspect.length > 0) {
                                            setReferredByPopoverOpenEditProspect(true);
                                        }
                                      }}
                                      className="pl-8"
                                      autoComplete="off"
                                    />
                                </FormControl>
                                {referredBySearchTermEditProspect && (
                                    <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        field.onChange('');
                                        setReferredBySearchTermEditProspect('');
                                        setReferredByPopoverOpenEditProspect(false);
                                    }}
                                    className="absolute right-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                                    aria-label="Clear referred by for prospect"
                                    >
                                    <XCircle className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" onOpenAutoFocus={(event) => event.preventDefault()}>
                            { (referredByPopoverOpenEditProspect && referredBySearchTermEditProspect.trim().length >= 2) && (
                               <ScrollArea className="h-auto max-h-[200px]">
                                <div className="p-1">
                                  {potentialReferrersEditProspect.length > 0 ? (
                                    potentialReferrersEditProspect.map(refContact => (
                                      <Button
                                        key={refContact.id}
                                        variant="ghost"
                                        className="w-full justify-start text-xs h-auto py-1.5 px-2"
                                        onClick={() => {
                                          field.onChange(refContact.name);
                                          setReferredBySearchTermEditProspect(refContact.name);
                                          setReferredByPopoverOpenEditProspect(false);
                                        }}
                                      >
                                        {refContact.name} ({refContact.category})
                                      </Button>
                                    ))
                                  ) : (
                                    <p className="p-2 text-xs text-muted-foreground">
                                      No existing contacts found matching "{referredBySearchTermEditProspect}". You can enter a new name.
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t mt-4">
                     <FormField control={matterForm.control} name="consultationDate1" render={({ field }) => (
                        <FormItem><FormLabel>Consultation Date 1</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={matterForm.control} name="consultationDate2" render={({ field }) => (
                        <FormItem><FormLabel>Consultation Date 2</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={matterForm.control} name="engagementLetterSentDate" render={({ field }) => (
                        <FormItem><FormLabel>Eng. Letter Sent</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={matterForm.control} name="expectedDecisionDate" render={({ field }) => (
                        <FormItem><FormLabel>Expected Decision Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  </div>
                  <FormField control={matterForm.control} name="importantDate" render={({ field }) => (
                      <FormItem><FormLabel>Important Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={matterForm.control} name="importantDateNotes" render={({ field }) => (
                      <FormItem><FormLabel>Important Date Notes</FormLabel><FormControl><Textarea placeholder="Details about important dates, SOL, court dates, etc." {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                  )}/>

                  <FormField control={matterForm.control} name="linkedClientIds" render={({ field }) => (
                    <FormItem className="pt-2 border-t mt-4">
                      <FormLabel>Link Client Contacts to this Matter</FormLabel>
                      <Popover><PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start font-normal">
                            {field.value?.length > 0 ? `${field.value.length} client(s) selected` : "Select clients..."}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <div className="p-2 border-b"><Input placeholder="Search clients..." value={clientSearchTerm} onChange={(e) => setClientSearchTerm(e.target.value)} className="h-8"/></div>
                          <ScrollArea className="h-48 p-2"><div className="space-y-1.5">
                            {filteredClientContacts.length > 0 ? filteredClientContacts.map(contact => (
                              <FormItem key={contact.id} className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl><Checkbox checked={field.value?.includes(contact.id.toString())}
                                    onCheckedChange={(checked) => {
                                      const currentVal = field.value || []; const contactIdStr = contact.id.toString();
                                      return checked ? field.onChange([...currentVal, contactIdStr]) : field.onChange(currentVal.filter(value => value !== contactIdStr));
                                    }} id={`client-${contact.id}-edit`} />
                                </FormControl><Label htmlFor={`client-${contact.id}-edit`} className="font-normal text-sm">{contact.name}</Label>
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
                <DialogClose asChild><Button type="button" variant="outline" onClick={() => {
                    setShowEditMatterModal(false);
                    setReferredBySearchTermEditProspect(''); 
                }}>Cancel</Button></DialogClose>
                <Button type="submit"><EditIcon className="mr-2 h-4 w-4" />Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

