
"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Responsive, WidthProvider, type Layout, type Layouts } from 'react-grid-layout';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUserMockClient, MOCK_MATTERS_DATA } from '@/lib/mock-data';
import type { Contact, Matter } from '@/lib/types';
import { MATTER_TYPES } from '@/lib/types';
import { ClientWelcomeWidget } from '@/components/dashboard/client/client-welcome-widget';
import { ClientUpcomingAppointmentsWidget } from '@/components/dashboard/client/client-upcoming-appointments-widget';
import { ClientKeyDocumentsWidget } from '@/components/dashboard/client/client-key-documents-widget';
import { ClientMattersOverviewWidget } from '@/components/dashboard/client/client-matters-overview-widget';
import { ClientFinancialSummaryWidget } from '@/components/dashboard/client/client-financial-summary-widget';
import { ClientToDoWidget } from '@/components/dashboard/client/client-todo-widget';
import { ClientEstateOverviewWidget } from '@/components/dashboard/client/client-estate-overview-widget';
import { Button } from '@/components/ui/button';
import { Save, PlusCircle, Trash2, Edit3, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area'; // Added ScrollArea


const ResponsiveGridLayout = WidthProvider(Responsive);

interface ClientDashboardWidgetItem {
  id: string;
  component: React.ElementType<{ firmId?: string; clientId?: string | number }>;
  name: string;
  defaultLayout: { i: string; w: number; h: number; minW?: number; minH?: number, static?: boolean, isResizable?: boolean, isDraggable?: boolean };
}

const ALL_AVAILABLE_CLIENT_WIDGETS: ClientDashboardWidgetItem[] = [
  {
    id: 'welcome',
    component: ClientWelcomeWidget,
    name: 'Welcome & Quick Links',
    defaultLayout: { i: 'welcome', w: 2, h: 2, minW: 2, minH: 2, static: true, isDraggable: false, isResizable: false }
  },
  {
    id: 'clientToDo',
    component: ClientToDoWidget,
    name: 'My To-Do List',
    defaultLayout: { i: 'clientToDo', w: 1, h: 3, minW: 1, minH: 2, isDraggable: true, isResizable: true }
  },
  {
    id: 'estateOverview',
    component: ClientEstateOverviewWidget,
    name: 'Estate Overview',
    defaultLayout: { i: 'estateOverview', w: 1, h: 2, minW: 1, minH: 2, isDraggable: true, isResizable: true }
  },
  {
    id: 'appointments',
    component: ClientUpcomingAppointmentsWidget,
    name: 'Upcoming Appointments',
    defaultLayout: { i: 'appointments', w: 1, h: 2, minW: 1, minH: 2, isDraggable: true, isResizable: true }
  },
  {
    id: 'documents',
    component: ClientKeyDocumentsWidget,
    name: 'Key Documents',
    defaultLayout: { i: 'documents', w: 1, h: 2, minW: 1, minH: 2, isDraggable: true, isResizable: true }
  },
  {
    id: 'matters',
    component: ClientMattersOverviewWidget,
    name: 'My Matters Overview',
    defaultLayout: { i: 'matters', w: 1, h: 2, minW: 1, minH: 2, isDraggable: true, isResizable: true }
  },
  {
    id: 'financialSummary',
    component: ClientFinancialSummaryWidget,
    name: 'Financial Summary',
    defaultLayout: { i: 'financialSummary', w: 1, h: 2, minW: 1, minH: 2, isDraggable: true, isResizable: true }
  },
];

const INITIAL_VISIBLE_CLIENT_WIDGET_IDS = ['welcome', 'clientToDo', 'appointments', 'documents', 'matters', 'financialSummary'];


const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 2, md: 2, sm: 1, xs: 1, xxs: 1 };

const generateInitialLayoutForBreakpoint = (widgetIds: string[], numCols: number): Layout[] => {
  const generatedLayout: Layout[] = [];
  let currentX = 0;
  let currentY = 0;
  let maxHeightInCurrentRow = 0;

  widgetIds.forEach((id) => {
    const widgetConfig = ALL_AVAILABLE_CLIENT_WIDGETS.find(w => w.id === id);
    if (!widgetConfig) return;

    const defaultW = widgetConfig.defaultLayout.w;
    const defaultH = widgetConfig.defaultLayout.h;

    let w = Math.min(defaultW, numCols);
    let h = defaultH;

    // Ensure static full-width widgets take full width on smaller screens too
    if (widgetConfig.defaultLayout.static && numCols < 2) {
        w = numCols;
    }

    if (currentX + w > numCols && currentX !== 0) {
      currentX = 0;
      currentY += maxHeightInCurrentRow;
      maxHeightInCurrentRow = 0;
    }

    generatedLayout.push({
      i: id,
      x: currentX,
      y: currentY,
      w: w,
      h: h,
      minW: widgetConfig.defaultLayout.minW ? Math.min(widgetConfig.defaultLayout.minW, numCols) : 1,
      maxW: numCols,
      minH: widgetConfig.defaultLayout.minH || 1,
      static: widgetConfig.defaultLayout.static ?? false,
      isResizable: widgetConfig.defaultLayout.isResizable ?? true,
      isDraggable: widgetConfig.defaultLayout.isDraggable ?? true,
    });

    currentX += w;
    maxHeightInCurrentRow = Math.max(maxHeightInCurrentRow, h);

    if (currentX >= numCols) {
        currentX = 0;
        currentY += maxHeightInCurrentRow;
        maxHeightInCurrentRow = 0;
    }
  });
  return generatedLayout;
};

const generateLayoutsForAllBreakpoints = (widgetIds: string[]): Layouts => {
  const layoutsObj: Layouts = {};
  (Object.keys(COLS) as Array<keyof typeof COLS>).forEach(bpKey => {
    const numCols = COLS[bpKey];
    layoutsObj[bpKey] = generateInitialLayoutForBreakpoint(widgetIds, numCols);
  });
  return layoutsObj;
};

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [isClientSide, setIsClientSide] = useState(false);
  const [currentUserMockClient, setCurrentUserMockClient] = useState<Contact | null | undefined>(undefined);

  const [layouts, setLayouts] = useState<Layouts>({});
  const [visibleWidgetIds, setVisibleWidgetIds] = useState<string[]>([]);

  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof typeof COLS>('lg');
  const [isEditMode, setIsEditMode] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  useEffect(() => {
    if (user && user.type === 'client' && user.id) {
      const clientData = getCurrentUserMockClient(user.id);
      setCurrentUserMockClient(clientData || null);
    } else {
      setCurrentUserMockClient(null);
    }
  }, [user]);

  // Consolidated effect for setting up visible widgets and layouts
  useEffect(() => {
    if (!isClientSide || !currentUserMockClient || !currentUserMockClient.firmId || !currentUserMockClient.id) {
      if (isClientSide && currentUserMockClient === null) { // User identified but no client data found
        setVisibleWidgetIds([]);
        setLayouts({});
      }
      return;
    }

    const clientFirmId = currentUserMockClient.firmId;
    const clientId = currentUserMockClient.id;
    const storageKeyPrefix = `dashboard_client_${clientFirmId}_${clientId}`;
    const savedLayoutsString = localStorage.getItem(`${storageKeyPrefix}_layouts`);
    const savedVisibleWidgetsString = localStorage.getItem(`${storageKeyPrefix}_visibleWidgets`);

    let finalVisibleWidgetIds = [...INITIAL_VISIBLE_CLIENT_WIDGET_IDS];
    const clientMatters = MOCK_MATTERS_DATA.filter(m =>
      m.firmId === clientFirmId && m.clientIds.includes(clientId.toString())
    );
    const hasEstatePlanning = clientMatters.some(m => m.type === MATTER_TYPES.ESTATE_PLANNING);

    if (hasEstatePlanning && !finalVisibleWidgetIds.includes('estateOverview')) {
      finalVisibleWidgetIds.push('estateOverview');
    } else if (!hasEstatePlanning && finalVisibleWidgetIds.includes('estateOverview')) {
      finalVisibleWidgetIds = finalVisibleWidgetIds.filter(id => id !== 'estateOverview');
    }

    if (savedVisibleWidgetsString) {
      try {
        let parsedVisibleWidgets = JSON.parse(savedVisibleWidgetsString);
        if (hasEstatePlanning && !parsedVisibleWidgets.includes('estateOverview')) {
            parsedVisibleWidgets.push('estateOverview');
        } else if (!hasEstatePlanning && parsedVisibleWidgets.includes('estateOverview')) {
            parsedVisibleWidgets = parsedVisibleWidgets.filter((id: string) => id !== 'estateOverview');
        }
        finalVisibleWidgetIds = parsedVisibleWidgets;
      } catch (error) {
        console.error("Failed to parse saved client visible widgets, using determined defaults:", error);
        // finalVisibleWidgetIds remains the one derived from INITIAL_VISIBLE_CLIENT_WIDGET_IDS and hasEstatePlanning
      }
    }
    
    setVisibleWidgetIds(finalVisibleWidgetIds);

    let finalLayoutsToSet = generateLayoutsForAllBreakpoints(finalVisibleWidgetIds);

    if (savedLayoutsString) {
      try {
        const parsedSavedLayouts = JSON.parse(savedLayoutsString);
        const mergedLayouts: Layouts = {};
        (Object.keys(finalLayoutsToSet) as Array<keyof typeof COLS>).forEach(bpKey => {
          const breakpointLayout = finalLayoutsToSet[bpKey] || [];
          mergedLayouts[bpKey] = breakpointLayout.map(newItem => {
            const existingItem = parsedSavedLayouts[bpKey]?.find((oldItem: Layout) => oldItem.i === newItem.i);
            return existingItem ? { ...newItem, w: existingItem.w, h: existingItem.h, x: existingItem.x, y: existingItem.y } : newItem;
          }).filter(layoutItem => finalVisibleWidgetIds.includes(layoutItem.i));
        });
        setLayouts(mergedLayouts);
      } catch (error) {
        console.error("Failed to parse saved client layouts, generating new from current visible widgets:", error);
        setLayouts(finalLayoutsToSet);
      }
    } else {
      setLayouts(finalLayoutsToSet);
    }

    if (isInitialMount.current) {
        isInitialMount.current = false;
    }

  }, [isClientSide, currentUserMockClient]);


  const onBreakpointChange = useCallback((newBreakpoint: keyof typeof COLS) => {
    setCurrentBreakpoint(newBreakpoint);
  }, []);

  const onLayoutChange = useCallback((_currentLayout: Layout[], allLayouts: Layouts) => {
    if (isEditMode && Object.keys(allLayouts).length > 0 && !isInitialMount.current) {
        setLayouts(allLayouts);
    }
  }, [isEditMode]);

  const handleToggleEditMode = () => {
    if (!currentUserMockClient) return;
    const clientFirmId = currentUserMockClient.firmId;
    const clientId = currentUserMockClient.id;
    const storageKeyPrefix = `dashboard_client_${clientFirmId || 'unknown'}_${clientId || 'unknown'}`;

    if (isEditMode) {
        localStorage.setItem(`${storageKeyPrefix}_layouts`, JSON.stringify(layouts));
        localStorage.setItem(`${storageKeyPrefix}_visibleWidgets`, JSON.stringify(visibleWidgetIds));
        toast({title: "Layout Saved", description: "Your dashboard layout has been saved."});
    } else {
        if(!isInitialMount.current){
             toast({title: "Layout Editing Enabled", description: "You can now move and resize widgets."});
        }
    }
    setIsEditMode(prev => !prev);
  };


  const handleAddWidget = (widgetId: string) => {
    if (visibleWidgetIds.includes(widgetId)) return;
    const widgetConfig = ALL_AVAILABLE_CLIENT_WIDGETS.find(w => w.id === widgetId);
    if (!widgetConfig || widgetConfig.defaultLayout.static) {
        toast({title: "Cannot Add Widget", description: "This widget cannot be dynamically added or is static.", variant: "destructive"});
        return;
    }
    
    const newVisibleWidgetIds = [...visibleWidgetIds, widgetId];
    setVisibleWidgetIds(newVisibleWidgetIds);
    // Update layouts immediately to include the new widget in a default position
    setLayouts(prevLayouts => {
      const newGeneratedLayouts = generateLayoutsForAllBreakpoints(newVisibleWidgetIds);
      const mergedLayouts: Layouts = {};
      (Object.keys(newGeneratedLayouts) as Array<keyof typeof COLS>).forEach(bpKey => {
          mergedLayouts[bpKey] = newGeneratedLayouts[bpKey].map(newItem => {
              const existingItem = prevLayouts[bpKey]?.find(oldItem => oldItem.i === newItem.i);
              return existingItem ? { ...newItem, w: existingItem.w, h: existingItem.h, x: existingItem.x, y: existingItem.y } : newItem;
          });
      });
      return mergedLayouts;
    });
    toast({title: "Widget Added", description: `${widgetConfig.name} added. Remember to save your layout.`});
  };

  const handleRemoveWidget = (widgetId: string) => {
    const widgetConfig = ALL_AVAILABLE_CLIENT_WIDGETS.find(w => w.id === widgetId);
    if (widgetConfig && widgetConfig.defaultLayout.static) {
        toast({title: "Cannot Remove Widget", description: "This widget is static and cannot be removed.", variant: "destructive"});
        return;
    }
    const newVisibleWidgetIds = visibleWidgetIds.filter(id => id !== widgetId);
    setVisibleWidgetIds(newVisibleWidgetIds);
    // Update layouts to remove the widget
    setLayouts(prevLayouts => {
        const updatedLayouts: Layouts = {};
        (Object.keys(prevLayouts) as Array<keyof typeof COLS>).forEach(bpKey => {
            updatedLayouts[bpKey] = prevLayouts[bpKey].filter(l => l.i !== widgetId);
        });
        // Optionally, could regenerate layouts for remaining widgets if desired, but not strictly necessary here
        // For simplicity, just removing from existing. If compaction issues arise, regenerate.
        return updatedLayouts;
    });
    toast({title: "Widget Removed", description: `${widgetConfig?.name || 'Widget'} removed. Remember to save your layout.`});
  };

  const visibleWidgets = useMemo(() => ALL_AVAILABLE_CLIENT_WIDGETS.filter(w => visibleWidgetIds.includes(w.id)), [visibleWidgetIds]);

  if (!isClientSide || currentUserMockClient === undefined) { // Still determining if client data exists
    return <div className="text-center p-10 text-white/70">Loading dashboard...</div>;
  }
  if (currentUserMockClient === null) { // Client data definitively not found
    return <div className="text-center p-10 text-red-300">Error: Client data not found. Please contact support.</div>;
  }


  const clientFirmIdToPass = currentUserMockClient.firmId;
  const clientIdToPass = currentUserMockClient.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Shield className="w-8 h-8 mr-3 text-sky-300" /> Client Dashboard
        </h1>
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
          className="min-h-[600px] rounded-lg"
          margin={[8, 8]}
          containerPadding={[8, 8]}
          compactType="vertical"
          preventCollision={false}
          draggableHandle=".drag-handle-client"
        >
          {visibleWidgets.map(widgetConfig => {
            const WidgetComponent = widgetConfig.component;
            // Find the layout item for the current breakpoint or default to lg, then to defaultLayout
            const layoutItem = layouts[currentBreakpoint]?.find(l => l.i === widgetConfig.id)
                                || layouts.lg?.find(l => l.i === widgetConfig.id)
                                || widgetConfig.defaultLayout;
            return (
              <div
                key={widgetConfig.id}
                data-grid={layoutItem}
                className="group/widget relative flex flex-col overflow-hidden bg-white/90 text-card-foreground shadow-xl rounded-lg border-none"
              >
                {(isEditMode && (layoutItem.isDraggable ?? true) && !(layoutItem.static ?? false)) &&
                    <div className="drag-handle-client p-1 bg-primary/20 cursor-move text-center text-xs text-primary-foreground opacity-0 group-hover/widget:opacity-60 transition-opacity">Drag</div>
                }
                <div className="flex-grow h-full overflow-y-auto p-4">
                    <WidgetComponent firmId={clientFirmIdToPass} clientId={clientIdToPass} />
                </div>
                {isEditMode && !(layoutItem.static ?? false) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 p-1 h-6 w-6 text-destructive hover:bg-destructive/20 z-10 opacity-0 group-hover/widget:opacity-100 transition-opacity"
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
        <div className="min-h-[600px] flex items-center justify-center bg-white/10 rounded-lg border border-white/20">
            <p className="text-white/70">
                 {visibleWidgetIds.length === 0 ? "No widgets selected. Click 'Change Layout' then 'Add Widget' to get started." : "Initializing dashboard layout..."}
            </p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/20 flex justify-end items-center space-x-2">
        {isEditMode && (
            <Dialog open={isAddWidgetModalOpen} onOpenChange={setIsAddWidgetModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/80 hover:bg-white text-primary">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Widget
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card text-card-foreground">
                <DialogHeader>
                  <DialogTitle>Add Widgets to Dashboard</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[40vh] mt-4 pr-3">
                  <div className="space-y-4 py-4">
                    {ALL_AVAILABLE_CLIENT_WIDGETS.filter(w => !(w.defaultLayout.static ?? false)).map(widget => (
                      <div key={widget.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`add-client-${widget.id}`}
                          checked={visibleWidgetIds.includes(widget.id)}
                          onCheckedChange={(checked) => {
                            if (checked) handleAddWidget(widget.id);
                            else handleRemoveWidget(widget.id);
                          }}
                          className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <Label htmlFor={`add-client-${widget.id}`} className="font-medium text-sm text-foreground">
                          {widget.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="default" onClick={handleToggleEditMode} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {isEditMode ? <Save className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4"/>}
            {isEditMode ? 'Save Layout' : 'Change Layout'}
          </Button>
      </div>
    </div>
  );
}

