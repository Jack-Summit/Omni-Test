
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, FileText as FileTextIcon, Download, Trash2, Info, AlertTriangle, Search, FolderPlus, Folder } from 'lucide-react';
import { MOCK_DOCUMENTS_DATA, MOCK_CONTACTS_DATA, MOCK_MATTERS_DATA, getContactNameById } from '@/lib/mock-data';
import type { Document as DocType, ContactCategory, Matter, FirmUserRole } from '@/lib/types';
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { MatterActionRibbon } from '@/components/layout/matter-action-ribbon';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

// RBAC Helper Functions
const canManageDocuments = (role?: FirmUserRole) => ['Admin', 'Attorney', 'Paralegal'].includes(role || '');
const canDeleteDocument = (role?: FirmUserRole) => ['Admin', 'Attorney'].includes(role || '');

export default function DocumentManagementPage() {
  const { user } = useAuth(); // Get user for role checks
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPathname = usePathname();
  const filterByMatterId = searchParams.get('matterId');
  const firmId = user?.firmId;

  const [documents, setDocuments] = useState<DocType[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadContactId, setUploadContactId] = useState('');
  const [uploadMatter, setUploadMatter] = useState(filterByMatterId || '');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFolderPath, setUploadFolderPath] = useState(''); 
  const [newFolderName, setNewFolderName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatter, setCurrentMatter] = useState<Matter | null>(null);
  const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(null); 

  useEffect(() => {
    if (firmId) {
      setDocuments(MOCK_DOCUMENTS_DATA.filter(doc => doc.firmId === firmId));
      if (filterByMatterId) {
        const matter = MOCK_MATTERS_DATA.find(m => m.id === filterByMatterId && m.firmId === firmId);
        setCurrentMatter(matter || null);
        setSelectedFolderPath(null); 
      } else {
        setCurrentMatter(null);
      }
    }
  }, [firmId, filterByMatterId]);
  
  useEffect(() => {
    setUploadMatter(filterByMatterId || '');
    setUploadFolderPath(selectedFolderPath || ''); 
  }, [filterByMatterId, selectedFolderPath]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileToUpload(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!fileToUpload) {
      toast({ title: "No File Selected", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }
    if (!uploadContactId) {
      toast({ title: "Contact Not Selected", description: "Please associate with a contact.", variant: "destructive" });
      return;
    }
    if (!firmId) {
        toast({ title: "Error", description: "Firm context not found.", variant: "destructive"});
        return;
    }

    const newDocument: DocType = {
      id: Date.now().toString(), 
      name: fileToUpload.name,
      client: getContactNameById(uploadContactId) || 'Unknown Contact',
      clientId: uploadContactId,
      matterId: uploadMatter,
      dateUploaded: new Date().toISOString().split('T')[0],
      size: `${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`,
      type: fileToUpload.name.split('.').pop()?.toUpperCase() || 'File',
      folderPath: uploadFolderPath.trim() || undefined, 
      firmId,
    };
    MOCK_DOCUMENTS_DATA.unshift(newDocument); // Add to global mock data
    setDocuments([...MOCK_DOCUMENTS_DATA.filter(doc => doc.firmId === firmId)]); // Update local state
    toast({ title: "Document Uploaded", description: `${fileToUpload.name} has been uploaded${uploadFolderPath ? ` to folder '${uploadFolderPath}'` : ''}.` });
    
    setFileToUpload(null);
    setUploadContactId('');
    setUploadMatter(filterByMatterId || '');
    setUploadDescription('');
    setUploadFolderPath(selectedFolderPath || ''); 
    setShowUploadModal(false);
  };

  const handleDeleteDocument = (docId: string | number) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
        const index = MOCK_DOCUMENTS_DATA.findIndex(d => d.id === docId && d.firmId === firmId);
        if (index !== -1) {
            MOCK_DOCUMENTS_DATA.splice(index, 1);
        }
        setDocuments([...MOCK_DOCUMENTS_DATA.filter(doc => doc.firmId === firmId)]);
        toast({ title: "Document Deleted", description: "The document has been removed.", variant: "destructive" });
    }
  };
  
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast({ title: "Folder Name Required", description: "Please enter a name for the new folder.", variant: "destructive" });
      return;
    }
    const fullNewFolderPath = selectedFolderPath ? `${selectedFolderPath}/${newFolderName.trim()}` : newFolderName.trim();
    toast({ title: "Folder Creation (Simulated)", description: `Folder "${fullNewFolderPath}" would be created.` });
    setShowCreateFolderModal(false);
    setNewFolderName('');
  };

  const handleGenerateDocument = () => {
    if (!uploadContactId && !currentMatter?.clientIds[0]) { 
         toast({ title: "Contact Not Selected", description: "Please select a contact to generate a document, or ensure the matter has an associated client.", variant: "destructive" });
        return;
    }
    if (!uploadMatter && !filterByMatterId) {
        toast({ title: "Matter Not Selected", description: "Please select a matter to generate a document, or navigate from a matter's dashboard.", variant: "destructive" });
        return;
    }
    
    const targetMatterId = filterByMatterId || uploadMatter;
    const targetClientId = uploadContactId || currentMatter?.clientIds[0]?.toString();

    if (!targetMatterId || !targetClientId) {
         toast({ title: "Contact/Matter Missing", description: "Could not determine contact or matter for document generation.", variant: "destructive"});
        return;
    }
    router.push(`/attorney/matters/${targetMatterId}/create-document?clientId=${targetClientId}`);
  }

  const matterSpecificDocuments = useMemo(() => {
    return filterByMatterId ? documents.filter(doc => doc.matterId === filterByMatterId) : documents;
  }, [documents, filterByMatterId]);

  const uniqueFolderPaths = useMemo(() => {
    const paths = new Set<string>();
    matterSpecificDocuments.forEach(doc => {
      if (doc.folderPath) {
        paths.add(doc.folderPath);
        const parts = doc.folderPath.split('/');
        let current = '';
        for (let i = 0; i < parts.length -1; i++) {
            current = current ? `${current}/${parts[i]}` : parts[i];
            paths.add(current);
        }
      }
    });
    return Array.from(paths).sort();
  }, [matterSpecificDocuments]);

  const filteredDocuments = useMemo(() => {
    return matterSpecificDocuments.filter(doc => 
      (selectedFolderPath === null 
        ? !doc.folderPath 
        : doc.folderPath === selectedFolderPath
      ) &&
      (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (doc.client && doc.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (doc.matterId && doc.matterId.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (doc.folderPath && doc.folderPath.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [matterSpecificDocuments, selectedFolderPath, searchTerm]);
  
  const clientContacts = MOCK_CONTACTS_DATA.filter(c => c.category === "Client" as ContactCategory && c.firmId === firmId);
  const mattersForFirm = MOCK_MATTERS_DATA.filter(m => m.firmId === firmId);
  const primaryClientIdForRibbon = currentMatter?.clientIds[0];
  const userRole = user?.type === 'firmUser' ? user.firmRole : undefined;

  return (
    <div className="space-y-6">
      {filterByMatterId && currentMatter && (
        <MatterActionRibbon matterId={filterByMatterId} matterType={currentMatter.type} primaryClientId={primaryClientIdForRibbon} currentPathname={currentPathname} />
      )}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">
          {filterByMatterId ? `Documents for Matter ${currentMatter?.name || filterByMatterId}` : "All Documents"}
          {selectedFolderPath && <span className="text-lg text-muted-foreground ml-2">/ {selectedFolderPath}</span>}
        </h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
           <div className="relative sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          {canManageDocuments(userRole) && (
            <div className="flex gap-2 flex-shrink-0">
                {filterByMatterId && (
                <Button variant="outline" onClick={() => setShowCreateFolderModal(true)}>
                    <FolderPlus className="mr-2 h-4 w-4" /> Create Folder
                </Button>
                )}
                <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
                <Button variant="outline" onClick={handleGenerateDocument}>
                <FileTextIcon className="mr-2 h-4 w-4" /> Generate
                </Button>
            </div>
          )}
        </div>
      </div>

      {filterByMatterId && uniqueFolderPaths.length > 0 && (
        <Card className="shadow-md">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base">Folders</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 items-center">
            <Button 
              variant={selectedFolderPath === null ? "default" : "outline"} 
              size="sm" 
              onClick={() => setSelectedFolderPath(null)}
              className="text-xs"
            >
              <Folder className="mr-2 h-4 w-4" /> Root / All
            </Button>
            {uniqueFolderPaths.map(path => (
              <Button 
                key={path} 
                variant={selectedFolderPath === path ? "default" : "outline"} 
                size="sm" 
                onClick={() => setSelectedFolderPath(path)}
                className="text-xs"
              >
                <Folder className="mr-2 h-4 w-4" /> {path}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-xl">
        <CardContent className="p-0">
          {filteredDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Client Contact</TableHead>
                    <TableHead>Matter</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Folder</TableHead>
                    <TableHead>Date Uploaded</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map(doc => (
                    <TableRow key={doc.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium text-primary hover:underline cursor-pointer">{doc.name}</TableCell>
                      <TableCell>{doc.client || "N/A"}</TableCell>
                      <TableCell>{doc.matterId || "N/A"}</TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell>
                        {doc.folderPath ? 
                          <Badge variant="secondary" className="text-xs">{doc.folderPath}</Badge> : 
                          <span className="text-xs text-muted-foreground italic">Root</span>
                        }
                      </TableCell>
                      <TableCell>{doc.dateUploaded}</TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon"><Download className="h-4 w-4 text-blue-600" /></Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Download Document</p></TooltipContent>
                          </Tooltip>
                          {canDeleteDocument(userRole) && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                <Button onClick={() => handleDeleteDocument(doc.id)} variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Delete Document</p></TooltipContent>
                            </Tooltip>
                          )}
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                <p className="text-lg font-semibold">No Documents Found</p>
                <p className="text-sm">
                    {searchTerm ? "No documents match your search criteria." : 
                     (selectedFolderPath ? `No documents found in folder "${selectedFolderPath}".` : 
                     (filterByMatterId ? "No documents found for this matter." : "There are no documents in the system yet."))} 
                    Upload or generate a document to get started.
                </p>
             </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="documentFile">Select File</Label>
              <Input id="documentFile" type="file" onChange={handleFileChange} className="mt-1"/>
            </div>
            <Select onValueChange={setUploadContactId} value={uploadContactId}>
              <SelectTrigger><SelectValue placeholder="-- Select Client Contact --" /></SelectTrigger>
              <SelectContent>
                {clientContacts.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.category})</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={setUploadMatter} value={uploadMatter}>
              <SelectTrigger><SelectValue placeholder="-- Select Matter (Optional) --" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- No Specific Matter --</SelectItem>
                {mattersForFirm.map(m => <SelectItem key={m.id} value={m.id}>{m.name} ({m.id})</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Description / Notes (Optional)" value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} />
            <div>
              <Label htmlFor="uploadFolderPath">Folder Path (Optional)</Label>
              <Input id="uploadFolderPath" type="text" placeholder="e.g., Pleadings/Motions or leave blank for root" value={uploadFolderPath} onChange={(e) => setUploadFolderPath(e.target.value)} className="mt-1"/>
              <p className="text-xs text-muted-foreground mt-1">Current folder: {selectedFolderPath || "Root"}</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => { setFileToUpload(null); setShowUploadModal(false); }}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpload} disabled={!fileToUpload || !uploadContactId}>
              <Upload className="mr-2 h-4 w-4" /> Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateFolderModal} onOpenChange={setShowCreateFolderModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
             <div className="text-sm text-muted-foreground">
                Create a new folder within: <Badge variant="secondary" className="ml-1">{selectedFolderPath || "Root"}</Badge>
            </div>
            <div>
              <Label htmlFor="newFolderName">Folder Name</Label>
              <Input 
                id="newFolderName" 
                value={newFolderName} 
                onChange={(e) => setNewFolderName(e.target.value)} 
                placeholder="Enter folder name" 
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => { setShowCreateFolderModal(false); setNewFolderName(''); }}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateFolder}>
              <FolderPlus className="mr-2 h-4 w-4" /> Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
    
