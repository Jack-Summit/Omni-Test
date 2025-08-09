
"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Responsive as ResponsiveGrid, WidthProvider, type Layout, type Layouts } from 'react-grid-layout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Save, PlusCircle, Trash2, Edit3, LayoutGrid, ChevronLeft, UserCheck, Edit2 as EditIcon, Search, XCircle, Mail, Phone } from 'lucide-react'; 
import { toast } from "@/hooks/use-toast";
import Link from 'next/link';
import { MOCK_MATTERS_DATA, MOCK_CONTACTS_DATA, getFirmUserNameById, MOCK_FIRM_USERS_DATA } from '@/lib/mock-data';
import type { Matter, Contact, ContactCategory, FirmUserRole, User as FirmUserType, MatterFormData, ImportantDateEntry } from '@/lib/types'; 
import { MATTER_TYPES, statusOptionsByType, NO_ATTORNEY_SELECTED_VALUE_MATTER } from '@/lib/types'; 
import { MatterActionRibbon } from '@/components/layout/matter-action-ribbon';
import { FinancialOverviewWidget } from '@/components/dashboard/matter/financial-overview-widget';
import { MatterPendingTasksWidget } from '@/components/dashboard/matter/widgets/matter-pending-tasks-widget';
import { MatterDocumentsWidget } from '@/components/dashboard/matter/widgets/matter-documents-widget';
import { MatterAssetFundingWidget } from '@/components/dashboard/matter/widgets/matter-asset-funding-widget';
import { MatterKeyPartiesWidget } from '@/components/dashboard/matter/widgets/matter-key-parties-widget';
import { MatterNotesWidget } from '@/components/dashboard/matter/widgets/matter-notes-widget';
import { MatterClientToDoWidget } from '@/components/dashboard/matter/widgets/matter-client-todo-widget';
import { MatterLinkedContactsWidget } from '@/components/dashboard/matter/widgets/matter-linked-contacts-widget';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from "react-hook-form"; 
import { zodResolver } from "@hookform/resolvers/zod"; 
import * as z from "zod"; 

const ResponsiveGridLayout = WidthProvider(ResponsiveGrid);

interface MatterDashboardWidgetItem {
  id: string;
  component: React.ElementType<{ matterId: string }>;
  name: string;
  defaultLayout: { i: string; w: number; h: number; x: number; y: number; minW?: number; minH?: number; static?: boolean; isResizable?: boolean; isDraggable?: boolean };
}

const ALL_AVAILABLE_MATTER_WIDGETS: Omit<MatterDashboardWidgetItem, 'defaultLayout'> & { defaultLayout: Layout }[] = [
  {
    id: 'financialOverview',
    component: FinancialOverviewWidget,
    name: 'Financial Overview',
    defaultLayout: { i: 'financialOverview', w: 2, h: 3, x: 0, y: 0, minW: 1, minH: 2, isDraggable: true, isResizable: true } // Changed minW to 1
  },
  {
    id: 'assetFunding',
    component: MatterAssetFundingWidget,
    name: 'Asset Funding Overview',
    defaultLayout: { i: 'assetFunding', w: 1, h: 3, x: 0, y: 3, minW: 1, minH: 2, isDraggable: true, isResizable: true }
  },
  {
    id: 'pendingTasks',
    component: MatterPendingTasksWidget,
    name: 'Pending Tasks',
    defaultLayout: { i: 'pendingTasks', w: 1, h: 3, x: 1, y: 3, minW: 1, minH: 2, isDraggable: true, isResizable: true }
  },
  {
    id: 'matterClientToDo',
    component: MatterClientToDoWidget,
    name: 'Client To-Do List',
    defaultLayout: { i: 'matterClientToDo', w: 1, h: 3, x: 0, y: 6, minW: 1, minH: 2, isDraggable: true, isResizable: true }
  },
  {
    id: 'matterDocuments',
    component: MatterDocumentsWidget,
    name: 'Matter Documents',
    defaultLayout: { i: 'matterDocuments', w: 1, h: 2, x: 1, y: 6, minW: 1, minH: 2, isDraggable: true, isResizable: true }
  },
  {
    id: 'keyParties',
    component: MatterKeyPartiesWidget,
    name: 'Key Parties & Roles',
    defaultLayout: { i: 'keyParties', w: 1, h: 2, x: 0, y: 9, minW: 1, minH: 2, isDraggable: true, isResizable: true }
  },
  {
    id: 'caseNotes',
    component: MatterNotesWidget,
    name: 'Case Notes & Timeline',
    defaultLayout: { i: 'caseNotes', w: 1, h: 2, x: 1, y: 9, minW: 1, minH: 2, isDraggable: true, isResizable: true }
  },
  { 
    id: 'linkedContacts',
    component: MatterLinkedContactsWidget,
    name: 'Linked Contacts',
    defaultLayout: { i: 'linkedContacts', w: 2, h: 2, x: 0, y: 11, minW: 1, minH: 2, isDraggable: true, isResizable: true }
  },
];

const INITIAL_VISIBLE_MATTER_WIDGET_IDS = ['financialOverview', 'assetFunding', 'pendingTasks', 'matterClientToDo', 'matterDocuments', 'keyParties', 'caseNotes', 'linkedContacts'];

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 2, md: 2, sm: 1, xs: 1, xxs: 1 };

const generateInitialLayoutForBreakpoint = (widgetIds: string[], numCols: number): Layout[] => {
  const layout: Layout[] = [];
  let currentX = 0;
  let currentY = 0;
  let maxHeightInCurrentRow = 0;

  widgetIds.forEach((id) => {
    const widgetConfig = ALL_AVAILABLE_MATTER_WIDGETS.find(w => w.id === id);
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
      i: id, x: currentX, y: currentY, w: w, h: defaultH,
      minW: widgetConfig.defaultLayout.minW ? Math.min(widgetConfig.defaultLayout.minW, numCols) : 1,
      maxW: numCols, minH: widgetConfig.defaultLayout.minH || 1,
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

const matterFormSchema = z.object({
  name: z.string().min(3, { message: "Matter name must be at least 3 characters." }),
  type: z.nativeEnum(MATTER_TYPES),
  status: z.string(),
  linkedClientIds: z.array(z.union([z.string(), z.number()])).min(1, "At least one client must be linked."),
  responsibleAttorneyId: z.string().optional(),
  openDate: z.string().refine((val) => val === '' || !isNaN(Date.parse(val)), { message: "Invalid open date format." }),
  closeDate: z.string().optional().refine((val) => val === '' || !isNaN(Date.parse(val)), { message: "Invalid close date format." }),
  importantDates: z.array(z.object({
    id: z.string().optional(),
    date: z.string().optional().refine(val => !val || val === '' || !isNaN(Date.parse(val)), { message: "Invalid date format."}),
    notes: z.string().optional(),
  })).optional(),
  referredBy: z.string().optional(),
});

export default function EstatePlanningDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const currentPathname = usePathname();
  const matterId = params.matterId as string;
  const firmId = user?.firmId;

  const [matter, setMatter] = useState<Matter | null>(null);
  const [clients, setClients] = useState<Contact[]>([]);
  const [primaryClientId, setPrimaryClientId] = useState<string | number | undefined>(undefined);

  const [isClientSide, setIsClientSide] = useState(false);
  const [visibleWidgetIds, setVisibleWidgetIds] = useState<string[]>(INITIAL_VISIBLE_MATTER_WIDGET_IDS);
  const [layouts, setLayouts] = useState<Layouts>(() => generateLayoutsForAllBreakpoints(INITIAL_VISIBLE_MATTER_WIDGET_IDS));
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof typeof COLS>('lg');
  const [isEditMode, setIsEditMode] = useState(false);
  const isInitialMount = useRef(true);

  const [showEditMatterModal, setShowEditMatterModal] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [referredBySearchTermMatter, setReferredBySearchTermMatter] = useState('');
  const [referredByPopoverOpenMatter, setReferredByPopoverOpenMatter] = useState(false);
  
  const firmAttorneys = useMemo(() =>
    firmId ? MOCK_FIRM_USERS_DATA.filter(u => u.firmId === firmId && (u.firmRole === 'Admin' || u.firmRole === 'Attorney')) : [],
  [firmId]);

  const contactsForFirm = useMemo(() =>
    firmId ? MOCK_CONTACTS_DATA.filter(c => c.category === "Client" as ContactCategory && c.firmId === firmId) : [],
  [firmId]);
  
  const allFirmContacts = useMemo(() => 
    firmId ? MOCK_CONTACTS_DATA.filter(c => c.firmId === firmId) : [],
  [firmId]);

  const potentialReferrersMatter = useMemo(() => {
    if (!referredBySearchTermMatter.trim() || referredBySearchTermMatter.length < 2) return [];
    const searchLower = referredBySearchTermMatter.toLowerCase();
    return allFirmContacts.filter(c =>
        c.name.toLowerCase().includes(searchLower)
    ).slice(0, 5);
  }, [allFirmContacts, referredBySearchTermMatter]);


  const filteredClientContacts = useMemo(() =>
    contactsForFirm.filter(contact =>
      contact.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      contact.emails.some(e => e.address.toLowerCase().includes(clientSearchTerm.toLowerCase()))
    ), [contactsForFirm, clientSearchTerm]);

  const matterForm = useForm<MatterFormData>({
    resolver: zodResolver(matterFormSchema),
    // Default values will be set when opening the modal
  });
  const selectedMatterTypeInForm = matterForm.watch("type");

  useEffect(() => {
    setIsClientSide(true);
    if (matterId && user?.firmId) {
      const foundMatter = MOCK_MATTERS_DATA.find(m => m.id === matterId && m.firmId === user.firmId);
      if (foundMatter) {
        setMatter({
          ...foundMatter,
          responsibleAttorneyName: getFirmUserNameById(foundMatter.responsibleAttorneyId)
        });
        const matterClients = MOCK_CONTACTS_DATA.filter(c => foundMatter.clientIds.includes(c.id) && c.category === "Client" as ContactCategory && c.firmId === user.firmId);
        setClients(matterClients);
        if (matterClients.length > 0) setPrimaryClientId(matterClients[0].id);
      } else {
        setMatter(null); 
        toast({ title: "Error", description: "Matter not found or access denied.", variant: "destructive" });
        router.push('/attorney/matters');
      }
    }

    const storageKey = `matterDashboardLayouts_${matterId}_estate-planning`;
    const visibleWidgetsKey = `matterDashboardVisibleWidgets_${matterId}_estate-planning`;
    const savedLayouts = localStorage.getItem(storageKey);
    const savedVisibleWidgets = localStorage.getItem(visibleWidgetsKey);

    let currentVisibleIds = INITIAL_VISIBLE_MATTER_WIDGET_IDS;
    if(savedVisibleWidgets) {
        try {
            currentVisibleIds = JSON.parse(savedVisibleWidgets);
        } catch (error) {
            console.error("Failed to parse saved visible widgets for matter dashboard:", error);
        }
    }
    setVisibleWidgetIds(currentVisibleIds);
    
    let initialLayouts = generateLayoutsForAllBreakpoints(currentVisibleIds);
    if (savedLayouts) {
      try {
        const parsedLayouts = JSON.parse(savedLayouts);
        (Object.keys(initialLayouts) as Array<keyof typeof COLS>).forEach(bpKey => {
            if (initialLayouts[bpKey]) {
                initialLayouts[bpKey] = initialLayouts[bpKey].map(defaultItem => {
                    const savedItem = parsedLayouts[bpKey]?.find((item: Layout) => item.i === defaultItem.i);
                    return savedItem ? { ...defaultItem, ...savedItem } : defaultItem;
                });
            }
        });
        setLayouts(initialLayouts);
      } catch (error) {
        console.error("Failed to parse saved matter dashboard layouts:", error);
        setLayouts(initialLayouts);
      }
    } else {
      setLayouts(initialLayouts);
    }
    isInitialMount.current = false;
  }, [matterId, user?.firmId, router]);

  useEffect(() => {
    if (!isInitialMount.current && firmId) {
        setLayouts(prevLayouts => {
            const newGeneratedLayouts = generateLayoutsForAllBreakpoints(visibleWidgetIds);
            const mergedLayouts: Layouts = {};
            (Object.keys(newGeneratedLayouts) as Array<keyof typeof COLS>).forEach(bpKey => {
                mergedLayouts[bpKey] = newGeneratedLayouts[bpKey].map(newItem => {
                    const existingItem = prevLayouts[bpKey]?.find(oldItem => oldItem.i === newItem.i);
                    return existingItem ? { ...newItem, w: existingItem.w, h: existingItem.h, x: existingItem.x, y: existingItem.y } : newItem;
                });
            });
            return mergedLayouts;
        });
    }
  }, [visibleWidgetIds, firmId]);

  const openEditMatterModal = () => {
    if (matter) {
      matterForm.reset({
        name: matter.name,
        type: matter.type,
        status: matter.status,
        linkedClientIds: matter.clientIds,
        responsibleAttorneyId: matter.responsibleAttorneyId || '',
        openDate: matter.openDate,
        closeDate: matter.closeDate || '',
        importantDates: matter.importantDates || [],
        referredBy: matter.referredBy || '',
      });
      setClientSearchTerm(''); 
      setReferredBySearchTermMatter(matter.referredBy || '');
      setShowEditMatterModal(true);
    }
  };

  const onEditMatterSubmit = (data: MatterFormData) => {
    if (!matter || !firmId) return;
    
    const finalResponsibleAttorneyId = data.responsibleAttorneyId === NO_ATTORNEY_SELECTED_VALUE_MATTER || data.responsibleAttorneyId === ''
                                     ? undefined
                                     : data.responsibleAttorneyId;
    const attorneyName = finalResponsibleAttorneyId ? getFirmUserNameById(finalResponsibleAttorneyId) : undefined;
    
    const updatedMatterPayload: Matter = { 
      ...matter,
      name: data.name,
      type: data.type,
      status: data.status,
      clientIds: data.linkedClientIds, 
      firmId, 
      responsibleAttorneyId: finalResponsibleAttorneyId, 
      responsibleAttorneyName: attorneyName,
      openDate: data.openDate,
      closeDate: data.closeDate || undefined,
      importantDates: data.importantDates || [],
      referredBy: data.referredBy || undefined,
    };

    const matterIndex = MOCK_MATTERS_DATA.findIndex(m => m.id === matter.id && m.firmId === firmId);
    if (matterIndex !== -1) {
      MOCK_MATTERS_DATA[matterIndex] = updatedMatterPayload;
    }
    setMatter(updatedMatterPayload); 
    toast({ title: "Matter Updated", description: `Matter "${data.name}" has been updated.` });
    setShowEditMatterModal(false);
  };


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
      localStorage.setItem(`matterDashboardLayouts_${matterId}_estate-planning`, JSON.stringify(layouts));
      localStorage.setItem(`matterDashboardVisibleWidgets_${matterId}_estate-planning`, JSON.stringify(visibleWidgetIds));
      toast({title: "Layout Saved", description: "Matter dashboard layout has been saved."});
    } else {
       if (!isInitialMount.current) {
         toast({title: "Layout Editing Enabled", description: "You can now move and resize widgets."});
       }
    }
    setIsEditMode(prev => !prev);
  };

  const handleAddWidget = (widgetIdToAdd: string) => {
    if (visibleWidgetIds.includes(widgetIdToAdd)) return;
    const widgetConfig = ALL_AVAILABLE_MATTER_WIDGETS.find(w => w.id === widgetIdToAdd);
    if (!widgetConfig) return;
    setVisibleWidgetIds(prev => [...prev, widgetIdToAdd]);
    toast({title: "Widget Added", description: `${widgetConfig.name} added. Save your layout.`});
  };

  const handleRemoveWidget = (widgetIdToRemove: string) => {
    const widgetConfig = ALL_AVAILABLE_MATTER_WIDGETS.find(w => w.id === widgetIdToRemove);
    if (widgetConfig && widgetConfig.defaultLayout.static) {
      toast({title: "Cannot Remove", description: "This widget is static and cannot be removed.", variant: "destructive"});
      return;
    }
    setVisibleWidgetIds(prev => prev.filter(id => id !== widgetIdToRemove));
    toast({title: "Widget Removed", description: `${widgetConfig?.name || 'Widget'} removed. Save your layout.`});
  };

  const visibleWidgetsToRender = ALL_AVAILABLE_MATTER_WIDGETS.filter(w => visibleWidgetIds.includes(w.id));

  if (!isClientSide || !matter) {
    return (
      <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 min-h-full -m-6">
          <p>Loading matter dashboard...</p>
      </div>
    );
  }

  const getMatterStatusColor = (status: Matter['status']) => {
    if (status === 'Open') return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100';
    if (status === 'Closed') return 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100';
  };

  return (
    <div className="space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full -m-6 p-6">
      <MatterActionRibbon matterId={matterId} matterType={matter.type} primaryClientId={primaryClientId} currentPathname={currentPathname} />
      
      <div className="mb-6 p-4 bg-card shadow rounded-lg border">
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div className="flex flex-1 flex-col md:flex-row md:gap-x-8 w-full">
            <div className="flex-grow mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-foreground">{matter.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                ID: {matter.id} | Type: <span className="font-semibold">{matter.type}</span> | Status:
                <span className={`ml-1 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getMatterStatusColor(matter.status)}`}>
                  {matter.status}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                  Open Date: {matter.openDate} {matter.closeDate && `| Close Date: ${matter.closeDate}`}
              </p>
              {matter.responsibleAttorneyName && (
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <UserCheck className="w-4 h-4 mr-1.5 text-primary/70"/>
                      Responsible Attorney: <span className="font-medium ml-1">{matter.responsibleAttorneyName}</span>
                  </p>
              )}
               {matter.referredBy && (
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                      Referred By: <span className="font-medium ml-1">{matter.referredBy}</span>
                  </p>
              )}
            </div>

            <div className="flex-shrink-0 md:w-2/5 lg:w-1/3">
              <h3 className="text-sm font-medium text-muted-foreground">Linked Clients:</h3>
              {clients.length > 0 ? (
                clients.map((client) => {
                  const primaryEmail = client.emails.find(e => e.isPrimary)?.address;
                  const primaryPhone = client.phones?.find(p => p.isPrimary)?.number;
                  return (
                    <div key={client.id} className="text-sm mt-1.5">
                        <Link href={`/attorney/contacts/${client.id}?matterId=${matterId}`} className="text-primary hover:underline font-semibold block">
                          {client.name}
                        </Link>
                        {primaryEmail && (
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Mail className="w-3 h-3 mr-1.5 text-primary/60" /> {primaryEmail}
                          </p>
                        )}
                        {primaryPhone && (
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Phone className="w-3 h-3 mr-1.5 text-primary/60" /> {primaryPhone}
                          </p>
                        )}
                    </div>
                  );
                })
              ) : <p className="text-sm text-muted-foreground italic">None</p>}
            </div>
          </div>

          <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-2 mt-3 sm:mt-0 sm:ml-auto flex-shrink-0">
            <Button onClick={() => router.push('/attorney/matters')} variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Matters
            </Button>
            <Button onClick={openEditMatterModal} variant="outline">
                <EditIcon className="mr-2 h-4 w-4" /> Edit Matter
            </Button>
            {isEditMode && (
                <Dialog open={isAddWidgetModalOpen} onOpenChange={setIsAddWidgetModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Widget
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Widgets to Dashboard</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {ALL_AVAILABLE_MATTER_WIDGETS.map(widget => (
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
      </div>

      {Object.keys(layouts || {}).length > 0 && visibleWidgetsToRender.length > 0 ? (
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
          className="min-h-[600px] bg-muted/20 rounded-lg border"
          margin={[8, 8]} 
          containerPadding={[8, 8]}
          compactType="vertical"
          preventCollision={false}
          draggableHandle=".drag-handle-matter"
        >
          {visibleWidgetsToRender.map(widgetConfig => {
            const WidgetComponent = widgetConfig.component;
            const layoutItem = layouts[currentBreakpoint]?.find(l => l.i === widgetConfig.id) || widgetConfig.defaultLayout;
            return (
              <div
                key={widgetConfig.id}
                data-grid={layoutItem}
                className="flex flex-col relative group/widget" 
              >
                {(isEditMode && (layoutItem.isDraggable ?? true) && !layoutItem.static) &&
                  <div className="drag-handle-matter p-1 bg-primary cursor-move text-center text-xs text-primary-foreground opacity-80 hover:opacity-100 transition-opacity">Drag</div>
                }
                <div className="flex-grow h-full overflow-y-auto"> 
                  <WidgetComponent matterId={matterId} />
                </div>
                {isEditMode && !(layoutItem.static ?? false) && (
                  <Button
                    variant="ghost" size="sm"
                    className="absolute top-1 right-1 p-1 h-6 w-6 text-muted-foreground hover:text-destructive z-10 opacity-50 group-hover/widget:opacity-100 transition-opacity"
                    onClick={() => handleRemoveWidget(widgetConfig.id)} title="Remove widget"
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
              {visibleWidgetsToRender.length === 0 ? "No widgets selected. Click 'Change Layout' then 'Add Widget'." : "Loading dashboard widgets..."}
            </p>
        </div>
      )}

      {/* Edit Matter Dialog */}
      <Dialog open={showEditMatterModal} onOpenChange={setShowEditMatterModal}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Matter: {matter?.name}</DialogTitle>
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
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>{Object.values(MATTER_TYPES).map(typeValue => (<SelectItem key={typeValue} value={typeValue}>{typeValue}</SelectItem>))}</SelectContent></Select><FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={matterForm.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>{(statusOptionsByType[selectedMatterTypeInForm || (matter?.type as MatterType) || MATTER_TYPES.OTHER]).map(statusValue => (<SelectItem key={statusValue} value={statusValue}>{statusValue}</SelectItem>))}</SelectContent></Select><FormMessage />
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
                        <Popover open={referredByPopoverOpenMatter} onOpenChange={setReferredByPopoverOpenMatter}>
                          <PopoverTrigger asChild>
                            <div className="relative flex items-center">
                               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
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
                  <FormField control={matterForm.control} name="linkedClientIds" render={({ field }) => (
                    <FormItem>
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
                <DialogClose asChild><Button type="button" variant="outline" onClick={() => setShowEditMatterModal(false)}>Cancel</Button></DialogClose>
                <Button type="submit"><Save className="mr-2 h-4 w-4" />Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
    

