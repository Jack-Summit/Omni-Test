
"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Responsive as ResponsiveGrid, WidthProvider, type Layout, type Layouts } from 'react-grid-layout';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Save, PlusCircle, Trash2, Edit3, Target, UserPlus as UserPlusIcon, Users2, Search as SearchIcon, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; 
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MOCK_CONTACTS_DATA, MOCK_MATTERS_DATA, MOCK_FIRM_USERS_DATA } from '@/lib/mock-data';
import type { Contact, Matter, FirmUserRole, User as FirmUserType, LeadContactFormData, NewLeadFormData } from '@/lib/types';
import { ContactCategory, MATTER_TYPES, CONTACT_STATUSES } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Import new Lead Widgets
import { NewLeadsQueueWidget } from '@/components/dashboard/leads/NewLeadsQueueWidget';
import { AssignedLeadsWidget } from '@/components/dashboard/leads/AssignedLeadsWidget';
import { LeadStatusOverviewWidget } from '@/components/dashboard/leads/LeadStatusOverviewWidget';
import { StaleLeadsAlertWidget } from '@/components/dashboard/leads/StaleLeadsAlertWidget';
import { IntakeFormCompletionWidget } from '@/components/dashboard/leads/IntakeFormCompletionWidget';
import { ConsultationScheduleWidget } from '@/components/dashboard/leads/ConsultationScheduleWidget';
import { PendingEngagementLettersWidget } from '@/components/dashboard/leads/PendingEngagementLettersWidget';

const ResponsiveGridLayout = WidthProvider(ResponsiveGrid);

interface LeadDashboardWidgetItem {
  id: string;
  component: React.ElementType<{ firmId?: string, userId?: string, showUnassigned?: boolean, onOpenNewClientIntake?: () => void }>; 
  name: string;
  defaultLayout: { i: string; w: number; h: number; x: number; y: number; minW?: number; minH?: number; static?: boolean; isResizable?: boolean; isDraggable?: boolean };
}

const ALL_AVAILABLE_LEAD_WIDGETS: Omit<LeadDashboardWidgetItem, 'defaultLayout'> & { defaultLayout: Layout }[] = [
  {
    id: 'newLeadsQueue',
    component: NewLeadsQueueWidget,
    name: 'New Leads Queue',
    defaultLayout: { i: 'newLeadsQueue', w: 1, h: 3, x: 0, y: 0, minW: 1, minH: 2 }
  },
  {
    id: 'myAssignedLeads',
    component: AssignedLeadsWidget, 
    name: 'My Assigned Leads',
    defaultLayout: { i: 'myAssignedLeads', w: 1, h: 3, x: 1, y: 0, minW: 1, minH: 2 }
  },
  {
    id: 'leadStatusOverview',
    component: LeadStatusOverviewWidget,
    name: 'Lead Status Overview',
    defaultLayout: { i: 'leadStatusOverview', w: 1, h: 3, x: 0, y: 3, minW: 1, minH: 2 }
  },
  {
    id: 'staleLeadsAlert',
    component: StaleLeadsAlertWidget,
    name: 'Stale Leads Alert',
    defaultLayout: { i: 'staleLeadsAlert', w: 1, h: 3, x: 1, y: 3, minW: 1, minH: 2 }
  },
  {
    id: 'intakeFormCompletion',
    component: IntakeFormCompletionWidget,
    name: 'Intake Form Completion',
    defaultLayout: { i: 'intakeFormCompletion', w: 1, h: 2, x: 0, y: 6, minW: 1, minH: 2 }
  },
  {
    id: 'consultationSchedule',
    component: ConsultationScheduleWidget,
    name: 'Consultation Schedule',
    defaultLayout: { i: 'consultationSchedule', w: 1, h: 2, x: 1, y: 6, minW: 1, minH: 2 }
  },
  {
    id: 'pendingEngagementLetters',
    component: PendingEngagementLettersWidget,
    name: 'Pending Engagement Letters',
    defaultLayout: { i: 'pendingEngagementLetters', w: 2, h: 2, x: 0, y: 8, minW: 1, minH: 2 }
  },
];

const INITIAL_VISIBLE_LEAD_WIDGET_IDS = [
    'newLeadsQueue', 'myAssignedLeads', 'leadStatusOverview', 
    'staleLeadsAlert', 'intakeFormCompletion', 'consultationSchedule', 'pendingEngagementLetters'
];

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 2, md: 2, sm: 1, xs: 1, xxs: 1 };

const generateInitialLayoutForBreakpoint = (widgetIds: string[], numCols: number): Layout[] => {
  const layout: Layout[] = [];
  let currentX = 0;
  let currentY = 0;
  let maxHeightInCurrentRow = 0;

  widgetIds.forEach((id) => {
    const widgetConfig = ALL_AVAILABLE_LEAD_WIDGETS.find(w => w.id === id);
    if (!widgetConfig) return;
    
    const defaultW = widgetConfig.defaultLayout.w;
    const defaultH = widgetConfig.defaultLayout.h;
    let w = Math.min(defaultW, numCols); 

    if (currentX + w > numCols && currentX !== 0) { 
      currentX = 0; 
      currentY += maxHeightInCurrentRow; 
      maxHeightInCurrentRow = 0; 
    }
    
    layout.push({
      i: id, 
      x: currentX,
      y: currentY,
      w: w,
      h: defaultH,
      minW: widgetConfig.defaultLayout.minW ? Math.min(widgetConfig.defaultLayout.minW, numCols) : 1,
      maxW: numCols,
      minH: widgetConfig.defaultLayout.minH || 1,
      isDraggable: widgetConfig.defaultLayout.isDraggable ?? true,
      isResizable: widgetConfig.defaultLayout.isResizable ?? true,
      static: widgetConfig.defaultLayout.static ?? false,
    });

    currentX += w; 
    maxHeightInCurrentRow = Math.max(maxHeightInCurrentRow, defaultH); 
    
    if (currentX >= numCols) {
        currentX = 0;
        currentY += maxHeightInCurrentRow;
        maxHeightInCurrentRow = 0;
    }
  });
  return layout;
};

const generateLayoutsForAllBreakpoints = (widgetIds: string[]): Layouts => {
  const layoutsObj: Layouts = {};
  (Object.keys(COLS) as Array<keyof typeof COLS>).forEach(bpKey => {
    layoutsObj[bpKey] = generateInitialLayoutForBreakpoint(widgetIds, COLS[bpKey]);
  });
  return layoutsObj;
};

const NO_ATTORNEY_SELECTED_VALUE = "[NO_ATTORNEY_LEAD]";

const leadContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

const newLeadFormSchema = z.object({
  contact1: leadContactFormSchema,
  addSpouse: z.boolean().optional(),
  contact2: leadContactFormSchema.optional(),
  prospectMatterName: z.string().min(3, "Matter name must be at least 3 characters."),
  responsibleAttorneyId: z.string().optional(),
  potentialServices: z.string().optional(),
  referredBy: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.addSpouse && !data.contact2?.name) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Spouse name is required if 'Add Spouse' is checked.",
      path: ["contact2.name"],
    });
  }
  if (data.addSpouse && !data.contact2?.email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Spouse email is required if 'Add Spouse' is checked.",
      path: ["contact2.email"],
    });
  }
});


export default function LeadIntakeDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const firmId = user?.firmId;
  const userId = user?.id; 
  const [isClient, setIsClient] = useState(false);
  const [visibleWidgetIds, setVisibleWidgetIds] = useState<string[]>(INITIAL_VISIBLE_LEAD_WIDGET_IDS);
  
  const [layouts, setLayouts] = useState<Layouts>(() => generateLayoutsForAllBreakpoints(INITIAL_VISIBLE_LEAD_WIDGET_IDS)); 
  
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof typeof COLS>('lg');
  const [isEditMode, setIsEditMode] = useState(false);
  const isInitialMount = useRef(true);

  const [referredBySearchTermNewLead, setReferredBySearchTermNewLead] = useState('');
  const [referredByPopoverOpenNewLead, setReferredByPopoverOpenNewLead] = useState(false);

  const firmAttorneys = MOCK_FIRM_USERS_DATA.filter(u => u.firmId === firmId && (u.firmRole === 'Admin' || u.firmRole === 'Attorney'));
  
  const allFirmContacts = useMemo(() => MOCK_CONTACTS_DATA.filter(c => c.firmId === firmId), [firmId]);

  const potentialReferrersNewLead = useMemo(() => {
    if (!referredBySearchTermNewLead.trim() || referredBySearchTermNewLead.length < 2) return [];
    const searchLower = referredBySearchTermNewLead.toLowerCase();
    return allFirmContacts.filter(c =>
        c.name.toLowerCase().includes(searchLower)
    ).slice(0, 5);
  }, [allFirmContacts, referredBySearchTermNewLead]);

  const newLeadForm = useForm<NewLeadFormData>({
    resolver: zodResolver(newLeadFormSchema),
    defaultValues: {
      contact1: { name: '', email: '', phone: '', address: '', notes: '' },
      addSpouse: false,
      contact2: { name: '', email: '', phone: '', address: '', notes: '' },
      prospectMatterName: '',
      responsibleAttorneyId: NO_ATTORNEY_SELECTED_VALUE,
      potentialServices: '',
      referredBy: '',
    }
  });
  const watchAddSpouse = newLeadForm.watch("addSpouse");
  const watchContact1Name = newLeadForm.watch("contact1.name");

  useEffect(() => {
    if (watchContact1Name && newLeadForm.getValues("prospectMatterName") === '') {
      newLeadForm.setValue("prospectMatterName", `${watchContact1Name} Inquiry`);
    } else if (!watchContact1Name && newLeadForm.getValues("prospectMatterName") !== '') {
      // Optionally clear if contact name is cleared, or leave as is
    }
  }, [watchContact1Name, newLeadForm]);


  useEffect(() => {
    setIsClient(true);
    if (!firmId) return; 

    const storageKey = `leadDashboardLayouts_attorney_${firmId}`;
    const visibleWidgetsKey = `leadDashboardVisibleWidgets_attorney_${firmId}`;

    const savedLayoutsString = localStorage.getItem(storageKey);
    const savedVisibleWidgetsString = localStorage.getItem(visibleWidgetsKey);

    let currentVisibleIds = INITIAL_VISIBLE_LEAD_WIDGET_IDS;
    if (savedVisibleWidgetsString) {
      try {
        currentVisibleIds = JSON.parse(savedVisibleWidgetsString);
      } catch (error) {
        console.error("Failed to parse saved lead visible widgets, using default:", error);
      }
    }
    setVisibleWidgetIds(currentVisibleIds);
    
    let initialLayouts = generateLayoutsForAllBreakpoints(currentVisibleIds);
    if (savedLayoutsString) {
      try {
        const parsedLayouts = JSON.parse(savedLayoutsString);
        (Object.keys(initialLayouts) as Array<keyof typeof COLS>).forEach(bpKey => {
            if (initialLayouts[bpKey]) {
                initialLayouts[bpKey] = initialLayouts[bpKey].map(defaultItem => {
                    const savedItem = parsedLayouts[bpKey]?.find((item: Layout) => item.i === defaultItem.i);
                    return savedItem ? { ...defaultItem, ...savedItem, h: savedItem.h, w: savedItem.w } : defaultItem;
                });
            }
        });
        setLayouts(initialLayouts);
      } catch (error) {
        console.error("Failed to parse saved lead dashboard layouts, using default:", error);
        setLayouts(initialLayouts);
      }
    } else {
      setLayouts(initialLayouts);
    }
    isInitialMount.current = false;
  }, [firmId]);


  useEffect(() => {
    if (!isInitialMount.current && firmId && visibleWidgetIds.length > 0) { 
      setLayouts(prevLayouts => {
        const newGeneratedLayouts = generateLayoutsForAllBreakpoints(visibleWidgetIds);
        const mergedLayouts: Layouts = {};
        (Object.keys(newGeneratedLayouts) as Array<keyof typeof COLS>).forEach(bpKey => {
            mergedLayouts[bpKey] = newGeneratedLayouts[bpKey].map(newItem => {
                const existingItem = prevLayouts[bpKey]?.find(oldItem => oldItem.i === newItem.i);
                return existingItem ? { ...newItem, w: existingItem.w, h: existingItem.h } : newItem;
            });
        });
        return mergedLayouts;
      });
    }
  }, [visibleWidgetIds, firmId]);


  const onBreakpointChange = useCallback((newBreakpoint: keyof typeof COLS) => {
    setCurrentBreakpoint(newBreakpoint);
  }, []);

  const onLayoutChange = useCallback((_currentLayout: Layout[], allLayouts: Layouts) => {
    if (isEditMode && allLayouts && Object.keys(allLayouts).length > 0 && !isInitialMount.current) {
        setLayouts(allLayouts); 
    }
  }, [isEditMode]); 

  const handleToggleEditMode = () => {
    if (isEditMode) { 
      if (firmId) {
        const storageKey = `leadDashboardLayouts_attorney_${firmId}`;
        const visibleWidgetsKey = `leadDashboardVisibleWidgets_attorney_${firmId}`;
        localStorage.setItem(storageKey, JSON.stringify(layouts));
        localStorage.setItem(visibleWidgetsKey, JSON.stringify(visibleWidgetIds));
        toast({title: "Layout Saved", description: "Your lead dashboard layout has been saved."});
      }
    } else {
        if(!isInitialMount.current){ 
             toast({title: "Layout Editing Enabled", description: "You can now move and resize widgets."});
        }
    }
    setIsEditMode(prev => !prev);
  };

  const handleAddWidget = (widgetId: string) => {
    if (visibleWidgetIds.includes(widgetId)) return;
    
    const widgetConfig = ALL_AVAILABLE_LEAD_WIDGETS.find(w => w.id === widgetId);
    if (!widgetConfig) return;

    setVisibleWidgetIds(prev => [...prev, widgetId]);
    toast({title: "Widget Added", description: `${widgetConfig.name} added. Remember to save your layout.`});
  };

  const handleRemoveWidget = (widgetId: string) => {
    const newVisibleIds = visibleWidgetIds.filter(id => id !== widgetId);
    setVisibleWidgetIds(newVisibleIds);
    
    const widgetConfig = ALL_AVAILABLE_LEAD_WIDGETS.find(w => w.id === widgetId);
    toast({title: "Widget Removed", description: `${widgetConfig?.name || 'Widget'} removed. Remember to save your layout.`});
  };

  const onSubmitNewLead = (data: NewLeadFormData) => {
    if (!firmId) {
      toast({ title: "Error", description: "Firm context is missing.", variant: "destructive" });
      return;
    }
    const contactIds: (string | number)[] = [];

    // Create Contact 1
    const contact1: Contact = {
      id: `contact-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.contact1.name,
      emails: [{ address: data.contact1.email, isPrimary: true, type: 'Primary' }],
      phones: data.contact1.phone ? [{ number: data.contact1.phone, isPrimary: true, type: 'Primary' }] : [],
      address: data.contact1.address,
      notes: data.contact1.notes,
      category: ContactCategory.CLIENT,
      status: CONTACT_STATUSES[1], // Prospect
      lastActivity: new Date().toISOString().split('T')[0],
      firmId,
    };
    MOCK_CONTACTS_DATA.unshift(contact1);
    contactIds.push(contact1.id);

    // Create Contact 2 if applicable
    if (data.addSpouse && data.contact2) {
      const contact2: Contact = {
        id: `contact-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // ensure unique ID
        name: data.contact2.name,
        emails: [{ address: data.contact2.email, isPrimary: true, type: 'Primary' }],
        phones: data.contact2.phone ? [{ number: data.contact2.phone, isPrimary: true, type: 'Primary' }] : [],
        address: data.contact2.address,
        notes: data.contact2.notes,
        category: ContactCategory.CLIENT,
        status: CONTACT_STATUSES[1], // Prospect
        lastActivity: new Date().toISOString().split('T')[0],
        firmId,
      };
      MOCK_CONTACTS_DATA.unshift(contact2);
      contactIds.push(contact2.id);
    }

    // Create Prospect Matter
    const newMatterId = `M${Date.now().toString().slice(-5)}`;
    const newMatter: Matter = {
      id: newMatterId,
      name: data.prospectMatterName,
      clientIds: contactIds,
      status: 'Lead',
      type: MATTER_TYPES.PROSPECT,
      firmId,
      responsibleAttorneyId: data.responsibleAttorneyId === NO_ATTORNEY_SELECTED_VALUE ? undefined : data.responsibleAttorneyId,
      openDate: new Date().toISOString().split('T')[0],
      potentialServicesNotes: data.potentialServices, 
      referredBy: data.referredBy,
    };
    MOCK_MATTERS_DATA.unshift(newMatter);

    toast({ title: "New Client Lead Created", description: `Matter "${newMatter.name}" for ${contact1.name} ${data.addSpouse && data.contact2 ? `and ${data.contact2.name}` : ''} has been created.` });
    setShowNewClientModal(false);
    newLeadForm.reset();
    setReferredBySearchTermNewLead('');
    setReferredByPopoverOpenNewLead(false);
    router.push(`/attorney/matters/${newMatterId}/prospect`);
  };


  const visibleWidgets = ALL_AVAILABLE_LEAD_WIDGETS.filter(w => visibleWidgetIds.includes(w.id));

  if (!isClient) {
    return (
        <div className="space-y-6 p-6">
            <p>Loading dashboard...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button onClick={() => {
            newLeadForm.reset(); // Reset form before opening
            setReferredBySearchTermNewLead(''); // Clear search term
            setReferredByPopoverOpenNewLead(false); // Close popover
            setShowNewClientModal(true);
        }} variant="default" size="lg" className="bg-green-600 hover:bg-green-700 text-white focus:ring-green-500">
            <UserPlusIcon className="mr-2 h-5 w-5" /> New Client Intake
        </Button>
        <div className="flex-grow"></div> 
        <div className="flex items-center space-x-2">
          {isEditMode && (
            <Dialog open={isAddWidgetModalOpen} onOpenChange={setIsAddWidgetModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Widget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Widgets to Lead Dashboard</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {ALL_AVAILABLE_LEAD_WIDGETS.map(widget => (
                    <div key={widget.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`add-${widget.id}`}
                        checked={visibleWidgetIds.includes(widget.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleAddWidget(widget.id);
                          } else {
                            handleRemoveWidget(widget.id);
                          }
                        }}
                        disabled={widget.defaultLayout.static} 
                      />
                      <Label htmlFor={`add-${widget.id}`} className="font-medium text-sm">
                        {widget.name} {widget.defaultLayout.static && "(Static)"}
                      </Label>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="default" onClick={handleToggleEditMode}>
            {isEditMode ? <Save className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4"/>}
            {isEditMode ? 'Save Layout' : 'Change Layout'}
          </Button>
        </div>
      </div>

      {Object.keys(layouts).length > 0 && visibleWidgets.length > 0 ? (
        <ResponsiveGridLayout
          layouts={layouts} 
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={100} 
          onLayoutChange={onLayoutChange}
          onBreakpointChange={onBreakpointChange}
          isDraggable={isEditMode} 
          isResizable={isEditMode} 
          resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']} 
          className="min-h-[600px] bg-muted/30 rounded-lg border"
          margin={[8, 8]} 
          containerPadding={[8, 8]} 
          compactType="vertical" 
          preventCollision={false} 
          draggableHandle=".drag-handle-lead" 
        >
          {visibleWidgets.map(widgetConfig => {
            const WidgetComponent = widgetConfig.component;
            const layoutItem = layouts[currentBreakpoint]?.find(l => l.i === widgetConfig.id) ?? 
                               layouts.lg?.find(l => l.i === widgetConfig.id) ?? 
                               widgetConfig.defaultLayout; 
            
            const widgetProps: any = { firmId, userId };
            if (widgetConfig.id === 'myAssignedLeads') widgetProps.showUnassigned = false;
            if (widgetConfig.id === 'newLeadsQueue') widgetProps.onOpenNewClientIntake = () => {
                newLeadForm.reset(); 
                setReferredBySearchTermNewLead('');
                setShowNewClientModal(true);
            };
            
            return (
              <div
                key={widgetConfig.id} 
                data-grid={layoutItem} 
                className="flex flex-col relative group/widget" 
              >
                {(isEditMode && (layoutItem?.isDraggable ?? widgetConfig.defaultLayout.isDraggable ?? true) && !(layoutItem?.static ?? widgetConfig.defaultLayout.static ?? false)) &&
                  <div className="drag-handle-lead p-1 bg-primary cursor-move text-center text-xs text-primary-foreground opacity-80 hover:opacity-100 transition-opacity">Drag</div>
                }
                <WidgetComponent {...widgetProps} />
                {isEditMode && !(layoutItem?.static ?? widgetConfig.defaultLayout.static ?? false) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 p-1 h-6 w-6 text-muted-foreground hover:text-destructive z-10 opacity-50 group-hover/widget:opacity-100 transition-opacity"
                    onClick={() => handleRemoveWidget(widgetConfig.id)}
                    title="Remove widget"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </ResponsiveGridLayout>
      ) : (
        <div className="min-h-[600px] flex items-center justify-center bg-muted/30 rounded-lg border">
            <p className="text-muted-foreground text-center">
              {visibleWidgets.length === 0 ? "No widgets selected. Click 'Change Layout' then 'Add Widget' to get started." : "Initializing lead dashboard layout..."}
            </p>
        </div>
      )}

      {/* New Client/Prospect Modal */}
      <Dialog open={showNewClientModal} onOpenChange={(isOpen) => {
        if (!isOpen) {
            newLeadForm.reset();
            setReferredBySearchTermNewLead('');
            setReferredByPopoverOpenNewLead(false);
        }
        setShowNewClientModal(isOpen);
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Client / Prospect Intake</DialogTitle>
            <DialogDescription>
              Enter details for the new client (and spouse/partner if applicable) and a prospect matter will be created.
            </DialogDescription>
          </DialogHeader>
          <Form {...newLeadForm}>
            <form onSubmit={newLeadForm.handleSubmit(onSubmitNewLead)} className="space-y-4">
              <ScrollArea className="h-[65vh] pr-5">
                <div className="space-y-6 py-4">
                  {/* Contact 1 Fields */}
                  <Card className="p-4 border-border/70">
                    <CardHeader className="p-0 pb-3 mb-3"><CardTitle className="text-md flex items-center"><UserPlusIcon className="w-4 h-4 mr-2 text-primary"/>Primary Contact</CardTitle></CardHeader>
                    <CardContent className="p-0 space-y-3">
                      <FormField control={newLeadForm.control} name="contact1.name" render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., John Smith" {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                       <FormField control={newLeadForm.control} name="contact1.email" render={({ field }) => (
                        <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="john.smith@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         <FormField control={newLeadForm.control} name="contact1.phone" render={({ field }) => (
                          <FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><Input type="tel" placeholder="(555) 123-4567" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={newLeadForm.control} name="contact1.address" render={({ field }) => (
                          <FormItem><FormLabel>Address (Optional)</FormLabel><FormControl><Input placeholder="123 Main St, Anytown" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                      </div>
                      <FormField control={newLeadForm.control} name="contact1.notes" render={({ field }) => (
                        <FormItem><FormLabel>Initial Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Initial inquiry details, referral source, etc." {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                      )}/>
                    </CardContent>
                  </Card>

                  {/* Add Spouse Checkbox */}
                  <FormField control={newLeadForm.control} name="addSpouse" render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Add Spouse / Partner Information</FormLabel></FormItem>
                  )}/>

                  {/* Contact 2 Fields (Conditional) */}
                  {watchAddSpouse && (
                    <Card className="p-4 border-border/70 bg-muted/30">
                      <CardHeader className="p-0 pb-3 mb-3"><CardTitle className="text-md flex items-center"><Users2 className="w-4 h-4 mr-2 text-primary"/>Spouse / Partner Contact</CardTitle></CardHeader>
                      <CardContent className="p-0 space-y-3">
                         <FormField control={newLeadForm.control} name="contact2.name" render={({ field }) => (
                          <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., Jane Smith" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={newLeadForm.control} name="contact2.email" render={({ field }) => (
                          <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="jane.smith@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           <FormField control={newLeadForm.control} name="contact2.phone" render={({ field }) => (
                            <FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><Input type="tel" placeholder="(555) 987-6543" {...field} /></FormControl><FormMessage /></FormItem>
                          )}/>
                           <FormField control={newLeadForm.control} name="contact2.address" render={({ field }) => (
                            <FormItem><FormLabel>Address (Optional)</FormLabel><FormControl><Input placeholder="If different from primary" {...field} /></FormControl><FormMessage /></FormItem>
                          )}/>
                        </div>
                        <FormField control={newLeadForm.control} name="contact2.notes" render={({ field }) => (
                          <FormItem><FormLabel>Notes for Spouse (Optional)</FormLabel><FormControl><Textarea placeholder="Any specific notes for spouse/partner..." {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                        )}/>
                      </CardContent>
                    </Card>
                  )}

                  {/* Prospect Matter Fields */}
                  <Card className="p-4 border-border/70">
                    <CardHeader className="p-0 pb-3 mb-3"><CardTitle className="text-md flex items-center"><Target className="w-4 h-4 mr-2 text-primary"/>Prospect Matter Details</CardTitle></CardHeader>
                    <CardContent className="p-0 space-y-3">
                      <FormField control={newLeadForm.control} name="prospectMatterName" render={({ field }) => (
                        <FormItem><FormLabel>Prospect Matter Name</FormLabel><FormControl><Input placeholder="e.g., John Smith Inquiry" {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={newLeadForm.control} name="responsibleAttorneyId" render={({ field }) => (
                        <FormItem><FormLabel>Assign to Attorney (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} defaultValue={NO_ATTORNEY_SELECTED_VALUE}>
                            <FormControl><SelectTrigger><SelectValue placeholder="-- Select Attorney --" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value={NO_ATTORNEY_SELECTED_VALUE}>-- Unassigned --</SelectItem>
                              {firmAttorneys.map(attorney => (
                                <SelectItem key={attorney.id} value={attorney.id}>{attorney.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        <FormMessage /></FormItem>
                      )}/>
                       <FormField control={newLeadForm.control} name="potentialServices" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Potential Services/Needs (Optional)</FormLabel>
                          <FormControl><Textarea placeholder="e.g., RLT, Will, POAs, Trust Funding..." {...field} rows={3} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField
                        control={newLeadForm.control}
                        name="referredBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Referred By (Optional)</FormLabel>
                            <Popover open={referredByPopoverOpenNewLead} onOpenChange={setReferredByPopoverOpenNewLead}>
                              <PopoverTrigger asChild>
                                <div className="relative flex items-center">
                                    <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                    <FormControl>
                                        <Input
                                          placeholder="Search existing contacts or enter new name..."
                                          value={referredBySearchTermNewLead}
                                          onChange={(e) => {
                                            const newSearchTerm = e.target.value;
                                            setReferredBySearchTermNewLead(newSearchTerm);
                                            field.onChange(newSearchTerm);
                                            if (newSearchTerm.trim().length >= 2) {
                                              setReferredByPopoverOpenNewLead(true);
                                            } else {
                                              setReferredByPopoverOpenNewLead(false);
                                            }
                                          }}
                                          onFocus={() => {
                                            if (referredBySearchTermNewLead.trim().length >= 2 && potentialReferrersNewLead.length > 0) {
                                                setReferredByPopoverOpenNewLead(true);
                                            }
                                          }}
                                          className="pl-8"
                                          autoComplete="off"
                                        />
                                    </FormControl>
                                    {referredBySearchTermNewLead && (
                                        <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            field.onChange('');
                                            setReferredBySearchTermNewLead('');
                                            setReferredByPopoverOpenNewLead(false);
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
                                { (referredByPopoverOpenNewLead && referredBySearchTermNewLead.trim().length >= 2) && (
                                  <ScrollArea className="h-auto max-h-[200px]">
                                    <div className="p-1">
                                      {potentialReferrersNewLead.length > 0 ? (
                                        potentialReferrersNewLead.map(refContact => (
                                          <Button
                                            key={refContact.id}
                                            variant="ghost"
                                            className="w-full justify-start text-xs h-auto py-1.5 px-2"
                                            onClick={() => {
                                              field.onChange(refContact.name);
                                              setReferredBySearchTermNewLead(refContact.name);
                                              setReferredByPopoverOpenNewLead(false);
                                            }}
                                          >
                                            {refContact.name} ({refContact.category})
                                          </Button>
                                        ))
                                      ) : (
                                        <p className="p-2 text-xs text-muted-foreground">
                                          No existing contacts found matching "{referredBySearchTermNewLead}". You can enter a new name.
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
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
              <DialogFooter className="pt-4 border-t mt-4">
                <DialogClose asChild><Button type="button" variant="outline" onClick={() => { 
                    setShowNewClientModal(false); 
                    newLeadForm.reset(); 
                    setReferredBySearchTermNewLead(''); 
                    setReferredByPopoverOpenNewLead(false); 
                }}>Cancel</Button></DialogClose>
                <Button type="submit">Create New Client &amp; Prospect Matter</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

