
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, User, Users2, Building, CreditCard, FileText, SlidersHorizontal, Workflow, Edit, ShieldAlert, PlusCircle, UploadCloud, Trash2, Image as ImageIcon, FileArchive, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { MOCK_FIRM_USERS_DATA, MOCK_LAW_FIRMS_DATA, MOCK_DOCUMENT_TEMPLATES, MOCK_EMAIL_TEMPLATES } from '@/lib/mock-data';
import type { User as FirmUser, FirmUserRole, NewUserFormData, LawFirm, EditUserFormData, ProfileFormData, DocumentTemplate, DocumentTemplateFormData, EmailTemplate } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

const PREDEFINED_AVATARS: { id: string; src: string; alt: string; hint: string }[] = [
  { id: 'scenery1', src: 'https://placehold.co/100x100/A2B2C2/FFFFFF.png?text=Mtn', alt: 'Mountains scenery avatar', hint: 'mountains landscape' },
  { id: 'scenery2', src: 'https://placehold.co/100x100/70A0C0/FFFFFF.png?text=Sea', alt: 'Ocean scenery avatar', hint: 'ocean beach' },
  { id: 'law1', src: 'https://placehold.co/100x100/C0C0C0/000000.png?text=⚖', alt: 'Scales of Justice avatar', hint: 'justice scales' },
  { id: 'law2', src: 'https://placehold.co/100x100/8B4513/FFFFFF.png?text=Gvl', alt: 'Gavel avatar', hint: 'gavel law' },
  { id: 'avatar1', src: 'https://placehold.co/100x100/9B59B6/FFFFFF.png?text=A1', alt: 'Abstract avatar 1', hint: 'abstract pattern' },
  { id: 'avatar2', src: 'https://placehold.co/100x100/3498DB/FFFFFF.png?text=A2', alt: 'Abstract avatar 2', hint: 'geometric avatar' },
  { id: 'initials1', src: 'https://placehold.co/100x100/008080/FFFFFF.png?text=JS', alt: 'Initials avatar JS', hint: 'teal initials' },
  { id: 'initials2', src: 'https://placehold.co/100x100/FFD700/000000.png?text=LG', alt: 'Initials avatar LG', hint: 'gold initials' },
];

const ALL_ROLES: FirmUserRole[] = ['Admin', 'Attorney', 'Paralegal', 'Staff'];

const newUserFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  firmRole: z.enum(ALL_ROLES, { errorMap: () => ({ message: "Role is required."}) }),
});

const editUserFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  firmRole: z.enum(ALL_ROLES, { errorMap: () => ({ message: "Role is required."}) }),
  permissions: z.record(z.boolean()).optional(),
});

const firmSettingsFormSchema = z.object({
  firmName: z.string().optional(),
  firmAddress: z.string().optional(),
  firmPhone: z.string().optional(),
  firmWebsite: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  firmLogoFile: z.any().optional(), 
});
type FirmSettingsFormData = z.infer<typeof firmSettingsFormSchema>;

const documentTemplateFormSchema = z.object({
  name: z.string().min(3, "Template name is required."),
  category: z.string().min(1, "Category is required."),
  templateFile: z.custom<FileList>((val) => val instanceof FileList && val.length > 0, "Template file is required.").optional(), // Optional if editing
});

const MOCK_PERMISSIONS_CONFIG = [
    { id: 'manageBilling', label: 'Manage Billing Records' },
    { id: 'deleteMatters', label: 'Delete Matters' },
    { id: 'accessAllContacts', label: 'Access All Firm Contacts' },
    { id: 'editFirmSettings', label: 'Edit Firm Settings' },
    { id: 'manageUsers', label: 'Manage Users (Add/Edit/Remove)' },
];


export default function SettingsPage() {
  const { user, updateCurrentUserName, updateUserAvatar } = useAuth();
  const userRole = user?.type === 'firmUser' ? user.firmRole : undefined;
  const isAdmin = userRole === 'Admin';
  const isAdminOrAttorney = userRole === 'Admin' || userRole === 'Attorney';
  const firmId = user?.firmId;

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [selectedAvatarForEdit, setSelectedAvatarForEdit] = useState<string | null>(user?.avatarUrl || null);
  const [firmUsers, setFirmUsers] = useState<FirmUser[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [currentFirm, setCurrentFirm] = useState<LawFirm | null>(null);
  const [firmLogoPreview, setFirmLogoPreview] = useState<string | null>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingFirmUser, setEditingFirmUser] = useState<FirmUser | null>(null);

  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [showAddDocTemplateModal, setShowAddDocTemplateModal] = useState(false);
  const [selectedDocTemplateFile, setSelectedDocTemplateFile] = useState<File | null>(null);

  useEffect(() => {
    if (firmId) {
      if (isAdmin) {
        setFirmUsers(MOCK_FIRM_USERS_DATA.filter(fu => fu.firmId === firmId));
      }
      const foundFirm = MOCK_LAW_FIRMS_DATA.find(f => f.id === firmId);
      setCurrentFirm(foundFirm || null);
      if (foundFirm?.logoUrl) {
        setFirmLogoPreview(foundFirm.logoUrl);
      }
      // Load templates
      setDocumentTemplates(MOCK_DOCUMENT_TEMPLATES.filter(dt => dt.firmId === firmId));
      setEmailTemplates(MOCK_EMAIL_TEMPLATES.filter(et => et.firmId === firmId));
    }
  }, [isAdmin, firmId]);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: user?.name || '' },
  });

  const newUserForm = useForm<NewUserFormData>({
    resolver: zodResolver(newUserFormSchema),
    defaultValues: { name: '', email: '', firmRole: 'Staff' },
  });

  const editUserForm = useForm<EditUserFormData>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: { name: '', email: '', firmRole: 'Staff', permissions: MOCK_PERMISSIONS_CONFIG.reduce((acc, perm) => ({ ...acc, [perm.id]: false }), {}) },
  });

  const firmSettingsForm = useForm<FirmSettingsFormData>({
    resolver: zodResolver(firmSettingsFormSchema),
    defaultValues: { firmName: '', firmAddress: '', firmPhone: '', firmWebsite: '', firmLogoFile: null },
  });

  const addDocTemplateForm = useForm<DocumentTemplateFormData>({
    resolver: zodResolver(documentTemplateFormSchema),
    defaultValues: { name: '', category: '', templateFile: undefined },
  });


  useEffect(() => {
    if (currentFirm) {
      firmSettingsForm.reset({
        firmName: currentFirm.name,
        firmAddress: currentFirm.address || '123 Law Lane, Suite 400\\nLegal City, LS 54321', 
        firmPhone: currentFirm.phone || '(555) 123-4567',
        firmWebsite: currentFirm.website || 'https://www.examplefirm.com',
        firmLogoFile: null, 
      });
      if(currentFirm.logoUrl) setFirmLogoPreview(currentFirm.logoUrl);
    }
  }, [currentFirm, firmSettingsForm]);


  const handleEditProfileClick = () => {
    profileForm.reset({ name: user?.name || '' });
    setSelectedAvatarForEdit(user?.avatarUrl || null); 
    setShowEditProfileModal(true);
  };

  const onProfileSubmit = (data: ProfileFormData) => {
    if (user) {
      updateCurrentUserName(data.name);
      if (selectedAvatarForEdit) {
        updateUserAvatar(selectedAvatarForEdit);
      } else {
        updateUserAvatar(null); 
      }
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    }
    setShowEditProfileModal(false);
  };

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAvatarForEdit(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePredefinedAvatarSelect = (avatarSrc: string) => {
    setSelectedAvatarForEdit(avatarSrc);
  };

  const handleOpenEditUserModal = (userToEdit: FirmUser) => {
    setEditingFirmUser(userToEdit);
    const initialPermissions = MOCK_PERMISSIONS_CONFIG.reduce((acc, perm) => {
        acc[perm.id] = userToEdit.permissions?.[perm.id] ?? false;
        return acc;
    }, {} as Record<string, boolean>);

    editUserForm.reset({
      name: userToEdit.name,
      email: userToEdit.email,
      firmRole: userToEdit.firmRole,
      permissions: initialPermissions,
    });
    setShowEditUserModal(true);
  };
  
  const onEditUserSubmit = (data: EditUserFormData) => {
    if (!editingFirmUser || !firmId) return;
    const userIndex = MOCK_FIRM_USERS_DATA.findIndex(u => u.id === editingFirmUser.id && u.firmId === firmId);
    if (userIndex !== -1) {
      MOCK_FIRM_USERS_DATA[userIndex] = {
        ...MOCK_FIRM_USERS_DATA[userIndex],
        name: data.name,
        firmRole: data.firmRole,
        permissions: data.permissions,
      };
      setFirmUsers([...MOCK_FIRM_USERS_DATA.filter(fu => fu.firmId === firmId)]);
      toast({ title: "User Updated", description: `${data.name}'s profile and role have been updated.` });
    }
    setShowEditUserModal(false);
    setEditingFirmUser(null);
  };

  const handleConfirmRemoveUser = () => {
    if (!editingFirmUser || !firmId || editingFirmUser.id === user?.id) {
        toast({ title: "Action Denied", description: "Cannot remove the current user or user not found.", variant: "destructive" });
        return;
    }
    const userIndex = MOCK_FIRM_USERS_DATA.findIndex(u => u.id === editingFirmUser.id && u.firmId === firmId);
    if (userIndex !== -1) {
        MOCK_FIRM_USERS_DATA.splice(userIndex, 1);
        setFirmUsers([...MOCK_FIRM_USERS_DATA.filter(fu => fu.firmId === firmId)]);
        toast({ title: "User Removed", description: `${editingFirmUser.name} has been removed from the firm.`, variant: "destructive" });
    }
    setShowEditUserModal(false);
    setEditingFirmUser(null);
  };


  const onAddNewUserSubmit = (data: NewUserFormData) => {
    if (!firmId) {
      toast({ title: "Error", description: "Cannot add user without firm context.", variant: "destructive"});
      return;
    }
    const newUser: FirmUser = {
      id: data.email, 
      name: data.name,
      email: data.email,
      type: 'firmUser',
      firmId: firmId,
      firmRole: data.firmRole,
      permissions: MOCK_PERMISSIONS_CONFIG.reduce((acc, perm) => ({ ...acc, [perm.id]: false }), {}), 
      avatarUrl: PREDEFINED_AVATARS[Math.floor(Math.random() * PREDEFINED_AVATARS.length)].src,
    };
    MOCK_FIRM_USERS_DATA.push(newUser);
    setFirmUsers([...MOCK_FIRM_USERS_DATA.filter(fu => fu.firmId === firmId)]);
    toast({ title: "User Added", description: `${data.name} has been added to the firm.` });
    setShowAddUserModal(false);
    newUserForm.reset();
  };

  const onFirmSettingsSubmit = (data: FirmSettingsFormData) => {
    let logoToSave = currentFirm?.logoUrl; 
    if (firmLogoPreview && firmLogoPreview !== currentFirm?.logoUrl) {
        logoToSave = firmLogoPreview; 
    }
    if (currentFirm) {
        const firmIndex = MOCK_LAW_FIRMS_DATA.findIndex(f => f.id === currentFirm.id);
        if (firmIndex !== -1) {
            MOCK_LAW_FIRMS_DATA[firmIndex] = {
                ...MOCK_LAW_FIRMS_DATA[firmIndex],
                name: data.firmName || MOCK_LAW_FIRMS_DATA[firmIndex].name, 
                address: data.firmAddress,
                phone: data.firmPhone,
                website: data.firmWebsite,
                logoUrl: logoToSave,
            };
            setCurrentFirm(MOCK_LAW_FIRMS_DATA[firmIndex]); 
            toast({ title: "Firm Settings Saved", description: "Firm details have been updated." });
        }
    } else {
        toast({ title: "Error", description: "Could not find firm to update.", variant: "destructive" });
    }
  };

  const handleFirmLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFirmLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFirmLogoPreview(currentFirm?.logoUrl || null); 
    }
  };

  const handleDocTemplateFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedDocTemplateFile(event.target.files[0]);
      addDocTemplateForm.setValue("templateFile", event.target.files); // For validation
    } else {
      setSelectedDocTemplateFile(null);
      addDocTemplateForm.setValue("templateFile", undefined);
    }
  };

  const onAddDocTemplateSubmit = (data: DocumentTemplateFormData) => {
    if (!firmId) {
      toast({ title: "Error", description: "Cannot add template without firm context.", variant: "destructive" });
      return;
    }
    if (!selectedDocTemplateFile) {
      toast({ title: "File Required", description: "Please select a template file to upload.", variant: "destructive" });
      return;
    }
    const newDocTemplate: DocumentTemplate = {
      id: `dtpl-${Date.now()}`,
      name: data.name,
      category: data.category,
      fileName: selectedDocTemplateFile.name,
      dateAdded: new Date().toISOString().split('T')[0],
      firmId,
    };
    MOCK_DOCUMENT_TEMPLATES.push(newDocTemplate);
    setDocumentTemplates([...MOCK_DOCUMENT_TEMPLATES.filter(dt => dt.firmId === firmId)]);
    toast({ title: "Document Template Added", description: `Template "${data.name}" has been added.` });
    setShowAddDocTemplateModal(false);
    addDocTemplateForm.reset();
    setSelectedDocTemplateFile(null);
  };


  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <SettingsIcon className="mr-3 h-8 w-8 text-primary" />
          Settings
        </h1>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile"><User className="mr-1.5 h-4 w-4"/>My Profile</TabsTrigger>
            {isAdminOrAttorney && <TabsTrigger value="firm"><Building className="mr-1.5 h-4 w-4"/>Firm Settings</TabsTrigger>}
            {isAdmin && <TabsTrigger value="users"><Users2 className="mr-1.5 h-4 w-4"/>User Management</TabsTrigger>}
            {isAdminOrAttorney && <TabsTrigger value="templates"><FileArchive className="mr-1.5 h-4 w-4"/>Templates</TabsTrigger>}
            {isAdminOrAttorney && <TabsTrigger value="billingConfig"><CreditCard className="mr-1.5 h-4 w-4"/>Billing Configuration</TabsTrigger>}
            {isAdminOrAttorney && <TabsTrigger value="customFields"><SlidersHorizontal className="mr-1.5 h-4 w-4"/>Custom Fields</TabsTrigger>}
            {isAdminOrAttorney && <TabsTrigger value="workflow"><Workflow className="mr-1.5 h-4 w-4"/>Workflow Automation</TabsTrigger>}
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5 text-primary"/>My Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-4">
                  <Image 
                    src={user?.avatarUrl || `https://placehold.co/80x80/008080/FFFFFF.png?text=${user?.name ? user.name.charAt(0).toUpperCase() : 'U'}`} 
                    alt={user?.name || "User avatar"}
                    width={80}
                    height={80}
                    className="rounded-full object-cover border-2 border-border"
                    data-ai-hint="professional headshot"
                    key={user?.avatarUrl || user?.name}
                  />
                  <div>
                    <p><strong className="text-muted-foreground w-20 inline-block">Name:</strong> {user?.name}</p>
                    <p><strong className="text-muted-foreground w-20 inline-block">Email:</strong> {user?.email}</p>
                    <p><strong className="text-muted-foreground w-20 inline-block">Role:</strong> {userRole}</p>
                  </div>
                </div>
                <Button variant="outline" className="mt-3" onClick={handleEditProfileClick}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {isAdminOrAttorney && (
            <TabsContent value="firm" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Building className="mr-2 h-5 w-5 text-primary"/>Firm Settings</CardTitle>
                  <CardDescription>Manage your law firm's general information and branding.</CardDescription>
                </CardHeader>
                <Form {...firmSettingsForm}>
                  <form onSubmit={firmSettingsForm.handleSubmit(onFirmSettingsSubmit)}>
                    <CardContent className="space-y-6">
                      <FormField control={firmSettingsForm.control} name="firmName" render={({ field }) => (
                          <FormItem><FormLabel>Firm Name</FormLabel><FormControl><Input {...field} readOnly className="bg-muted/50" /></FormControl><FormMessage /></FormItem>
                      )}/>
                       <FormField control={firmSettingsForm.control} name="firmAddress" render={({ field }) => (
                          <FormItem><FormLabel>Firm Address</FormLabel><FormControl><Textarea placeholder="123 Law Lane, Suite 400..." {...field} rows={3} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={firmSettingsForm.control} name="firmPhone" render={({ field }) => (
                            <FormItem><FormLabel>Firm Phone</FormLabel><FormControl><Input type="tel" placeholder="(555) 123-4567" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={firmSettingsForm.control} name="firmWebsite" render={({ field }) => (
                            <FormItem><FormLabel>Firm Website</FormLabel><FormControl><Input type="url" placeholder="https://www.yourfirm.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                      </div>
                      <FormItem>
                        <FormLabel>Firm Logo</FormLabel>
                        <div className="flex items-center gap-4 mt-2">
                            {firmLogoPreview && (
                                <Image 
                                    src={firmLogoPreview} 
                                    alt="Firm logo preview" 
                                    width={100} 
                                    height={100} 
                                    className="rounded-md border object-contain"
                                    data-ai-hint="company logo"
                                />
                            )}
                            <Input
                                id="firmLogoInput"
                                type="file"
                                accept="image/*"
                                onChange={handleFirmLogoFileChange}
                                className="block w-full text-sm text-muted-foreground
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary/10 file:text-primary
                                hover:file:bg-primary/20"
                            />
                        </div>
                        <FormDescription className="text-xs mt-1">Recommended: PNG or JPG, max 2MB.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit">Save Firm Settings</Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="users" className="mt-4">
              <Card className="shadow-xl">
                <CardHeader className="flex flex-row justify-between items-center">
                  <div>
                    <CardTitle>Firm Users</CardTitle>
                    <CardDescription>Manage users and their roles within your firm: {currentFirm?.name || user?.firmId}</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddUserModal(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New User
                  </Button>
                </CardHeader>
                <CardContent>
                  {firmUsers.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <ShieldAlert className="mx-auto h-10 w-10 text-primary/50 mb-3"/>
                      <p>No other users found for your firm, or you are the only user.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Current Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {firmUsers.map((firmUserItem) => (
                            <TableRow key={firmUserItem.id}>
                              <TableCell className="font-medium">{firmUserItem.name}</TableCell>
                              <TableCell>{firmUserItem.email}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                  firmUserItem.firmRole === 'Admin' ? 'bg-primary text-primary-foreground' :
                                  firmUserItem.firmRole === 'Attorney' ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-200' :
                                  firmUserItem.firmRole === 'Paralegal' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-200' :
                                  firmUserItem.firmRole === 'Staff' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-200' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {firmUserItem.firmRole}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                {firmUserItem.id === user?.id ? (
                                  <span className="text-xs text-muted-foreground italic">Current User</span>
                                ) : (
                                  <Button variant="outline" size="sm" onClick={() => handleOpenEditUserModal(firmUserItem)}>
                                    <Edit className="mr-1.5 h-3 w-3" /> Edit
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {isAdminOrAttorney && (
            <TabsContent value="templates" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Document Templates Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle>Document Templates</CardTitle>
                    </div>
                    <Button size="sm" onClick={() => { addDocTemplateForm.reset(); setSelectedDocTemplateFile(null); setShowAddDocTemplateModal(true);}}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Document Template
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {documentTemplates.length > 0 ? (
                      <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>File Name</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {documentTemplates.map(template => (
                            <TableRow key={template.id}>
                              <TableCell>{template.name}</TableCell>
                              <TableCell>{template.category}</TableCell>
                              <TableCell>{template.fileName}</TableCell>
                              <TableCell className="space-x-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3.5 w-3.5 text-blue-600"/></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="h-3.5 w-3.5 text-red-600"/></Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (<p className="text-muted-foreground text-sm text-center py-4">No document templates added yet.</p>)}
                  </CardContent>
                </Card>

                {/* Email Templates Section (Placeholder for now) */}
                <Card>
                   <CardHeader className="flex flex-row items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        <CardTitle>Email Templates</CardTitle>
                     </div>
                    <Button size="sm" variant="outline" disabled><PlusCircle className="mr-2 h-4 w-4"/>Add Email Template</Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm text-center py-4">Email template management coming soon.</p>
                     {emailTemplates.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">Example: "{emailTemplates[0].name}"</div>
                     )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
          
          {isAdminOrAttorney && (
            <TabsContent value="billingConfig" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary"/>Billing Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Set up billing rates, invoice templates, payment integrations, and trust accounting settings. (Coming Soon)</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isAdminOrAttorney && (
            <TabsContent value="customFields" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><SlidersHorizontal className="mr-2 h-5 w-5 text-primary"/>Custom Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Define custom data fields for contacts, matters, assets, etc., to tailor the application to your firm's specific needs. (Coming Soon)</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
           {isAdminOrAttorney && (
            <TabsContent value="workflow" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Workflow className="mr-2 h-5 w-5 text-primary"/>Workflow Automation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Define automated workflows, task sequences based on matter type or triggers, and automated client communications. (Coming Soon)</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <Dialog open={showEditProfileModal} onOpenChange={setShowEditProfileModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 py-4">
                <FormField control={profileForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <div className="space-y-1"><Label>Email Address</Label><Input value={user?.email || ''} disabled className="bg-muted/50" /></div>
                <div className="space-y-1"><Label>Role</Label><Input value={userRole || ''} disabled className="bg-muted/50" /></div>
                <div className="space-y-3 pt-3">
                  <Label className="text-base">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Image src={selectedAvatarForEdit || user?.avatarUrl || `https://placehold.co/100x100/008080/FFFFFF.png?text=${user?.name ? user.name.charAt(0).toUpperCase() : 'U'}`} alt="Current avatar" width={100} height={100} className="rounded-full object-cover border-2 border-primary/30" data-ai-hint="headshot person" key={selectedAvatarForEdit || user?.avatarUrl || 'default-avatar-key'} />
                    <div className="space-y-2">
                        <Label htmlFor="avatarUpload" className="text-sm font-medium text-primary cursor-pointer hover:underline"><UploadCloud className="inline h-4 w-4 mr-1" /> Upload New Picture</Label>
                        <Input id="avatarUpload" type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden"/>
                         <p className="text-xs text-muted-foreground">Or select from below:</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                    {PREDEFINED_AVATARS.map(avatar => (
                      <button type="button" key={avatar.id} onClick={() => handlePredefinedAvatarSelect(avatar.src)} className={`rounded-full border-2 p-0.5 transition-all duration-150 ease-in-out ${selectedAvatarForEdit === avatar.src ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent hover:border-primary/50'}`}>
                        <Image src={avatar.src} alt={avatar.alt} data-ai-hint={avatar.hint} width={60} height={60} className="rounded-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
                <DialogFooter className="pt-4"><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit">Save Changes</Button></DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Add New Firm User</DialogTitle></DialogHeader>
            <Form {...newUserForm}>
              <form onSubmit={newUserForm.handleSubmit(onAddNewUserSubmit)} className="space-y-4 py-4">
                <FormField control={newUserForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter user's full name" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={newUserForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={newUserForm.control} name="firmRole" render={({ field }) => (<FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl><SelectContent>{ALL_ROLES.map(role => (<SelectItem key={role} value={role}>{role}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)}/>
                <DialogFooter className="pt-4"><DialogClose asChild><Button type="button" variant="outline" onClick={() => {setShowAddUserModal(false); newUserForm.reset();}}>Cancel</Button></DialogClose><Button type="submit">Add User</Button></DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {editingFirmUser && (
          <Dialog open={showEditUserModal} onOpenChange={(isOpen) => { if (!isOpen) setEditingFirmUser(null); setShowEditUserModal(isOpen); }}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader><DialogTitle>Edit User: {editingFirmUser.name}</DialogTitle></DialogHeader>
              <Form {...editUserForm}>
                <form onSubmit={editUserForm.handleSubmit(onEditUserSubmit)} className="space-y-4 py-4">
                  <FormField control={editUserForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={editUserForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input {...field} readOnly className="bg-muted/50" /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={editUserForm.control} name="firmRole" render={({ field }) => (<FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={editingFirmUser.id === user?.id}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{ALL_ROLES.map(role => (<SelectItem key={role} value={role}>{role}</SelectItem>))}</SelectContent></Select>{editingFirmUser.id === user?.id && <FormDescription className="text-xs">Cannot change your own role.</FormDescription>}<FormMessage /></FormItem>)}/>
                  <Card className="mt-4"><CardHeader className="pb-2"><CardTitle className="text-base">Application Permissions (Conceptual)</CardTitle><CardDescription className="text-xs">Note: These permissions are illustrative and not enforced by the backend in this prototype.</CardDescription></CardHeader><CardContent className="space-y-2 pt-2">{MOCK_PERMISSIONS_CONFIG.map(perm => (<FormField key={perm.id} control={editUserForm.control} name={`permissions.${perm.id}`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal text-sm">{perm.label}</FormLabel></FormItem>)}/>))}</CardContent></Card>
                  <DialogFooter className="pt-6 border-t mt-4 flex-col-reverse sm:flex-row sm:justify-between"><div>{editingFirmUser.id !== user?.id && (<AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Remove User</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently remove the user <span className="font-semibold">{editingFirmUser.name}</span> from the firm.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmRemoveUser}>Confirm Removal</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>)}</div><div className="flex gap-2"><DialogClose asChild><Button type="button" variant="outline" onClick={() => {setEditingFirmUser(null); setShowEditUserModal(false);}}>Cancel</Button></DialogClose><Button type="submit">Save Changes</Button></div></DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Document Template Modal */}
        <Dialog open={showAddDocTemplateModal} onOpenChange={setShowAddDocTemplateModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Add New Document Template</DialogTitle></DialogHeader>
            <Form {...addDocTemplateForm}>
              <form onSubmit={addDocTemplateForm.handleSubmit(onAddDocTemplateSubmit)} className="space-y-4 py-4">
                <FormField control={addDocTemplateForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Template Name</FormLabel><FormControl><Input placeholder="e.g., Engagement Letter - Standard" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={addDocTemplateForm.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category/Practice Area</FormLabel><FormControl><Input placeholder="e.g., Engagement Letters, Estate Planning - Wills" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={addDocTemplateForm.control} name="templateFile" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template File</FormLabel>
                    <FormControl><Input type="file" accept=".doc,.docx,.pdf" onChange={handleDocTemplateFileChange} /></FormControl>
                    {selectedDocTemplateFile && <FormDescription className="text-xs">Selected: {selectedDocTemplateFile.name}</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}/>
                <DialogFooter className="pt-4"><DialogClose asChild><Button type="button" variant="outline" onClick={() => {setShowAddDocTemplateModal(false); addDocTemplateForm.reset(); setSelectedDocTemplateFile(null);}}>Cancel</Button></DialogClose><Button type="submit">Add Template</Button></DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

    </div>
  );
}
