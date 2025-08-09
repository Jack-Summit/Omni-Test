
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Responsive as ResponsiveGrid, WidthProvider, type Layout, type Layouts } from 'react-grid-layout';
import { AnnouncementsWidget } from '@/components/dashboard/attorney/announcements-widget';
import { RecentClientActivityWidget } from '@/components/dashboard/attorney/recent-client-activity-widget';
import { ReviewRemindersWidget } from '@/components/dashboard/attorney/review-reminders-widget';
import { UpcomingTasksWidget } from '@/components/dashboard/attorney/upcoming-tasks-widget';
import { MyDayWidget } from '@/components/dashboard/attorney/my-day-widget';
import { ClientCommunicationCenterWidget } from '@/components/dashboard/attorney/client-communication-center-widget';
import { BillingTimeSnapshotWidget } from '@/components/dashboard/attorney/billing-time-snapshot-widget';
import { Button } from '@/components/ui/button';
import { Save, PlusCircle, Trash2, Edit3, LayoutGrid } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';


const ResponsiveGridLayout = WidthProvider(ResponsiveGrid);

interface DashboardWidgetItem {
  id: string;
  component: React.ElementType<{ firmId?: string, userId?: string }>; 
  name: string;
  defaultLayout: { i: string; w: number; h: number; x: number; y: number; minW?: number; minH?: number; static?: boolean; isResizable?: boolean; isDraggable?: boolean };
}

const ALL_AVAILABLE_WIDGETS: Omit<DashboardWidgetItem, 'defaultLayout'> & { defaultLayout: Layout }[] = [
  {
    id: 'myDay',
    component: MyDayWidget,
    name: 'My Day',
    defaultLayout: { i: 'myDay', w: 1, h: 4, x: 0, y: 0, minW: 1, minH: 3, isDraggable: true, isResizable: true }
  },
  {
    id: 'upcomingTasks',
    component: UpcomingTasksWidget,
    name: 'Upcoming Tasks',
    defaultLayout: { i: 'upcomingTasks', w: 1, h: 4, x: 1, y: 0, minW: 1, minH: 3, isDraggable: true, isResizable: true }
  },
  {
    id: 'clientCommunicationCenter',
    component: ClientCommunicationCenterWidget,
    name: 'Client Communication Center',
    defaultLayout: { i: 'clientCommunicationCenter', w: 2, h: 4, x: 0, y: 4, minW: 1, minH: 3, isDraggable: true, isResizable: true }
  },
  {
    id: 'billingTimeSnapshot', 
    component: BillingTimeSnapshotWidget,
    name: 'Billing & Time Snapshot',
    defaultLayout: { i: 'billingTimeSnapshot', w: 2, h: 4, x: 0, y: 8, minW: 1, minH: 3, isDraggable: true, isResizable: true }
  },
  {
    id: 'recentClientActivity',
    component: RecentClientActivityWidget,
    name: 'Recent Client Activity',
    defaultLayout: { i: 'recentClientActivity', w: 1, h: 4, x: 0, y: 12, minW: 1, minH: 3, isDraggable: true, isResizable: true }
  },
  {
    id: 'reviewReminders',
    component: ReviewRemindersWidget,
    name: 'Review Reminders',
    defaultLayout: { i: 'reviewReminders', w: 1, h: 4, x: 1, y: 12, minW: 1, minH: 3, isDraggable: true, isResizable: true }
  },
  {
    id: 'announcements',
    component: AnnouncementsWidget,
    name: 'Announcements',
    defaultLayout: { i: 'announcements', w: 2, h: 4, x: 0, y: 16, minW: 1, minH: 3, isDraggable: true, isResizable: true }
  },
];

const INITIAL_VISIBLE_WIDGET_IDS = ['myDay', 'upcomingTasks', 'clientCommunicationCenter', 'billingTimeSnapshot', 'recentClientActivity', 'reviewReminders', 'announcements'];


const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 2, md: 2, sm: 1, xs: 1, xxs: 1 };

const generateInitialLayoutForBreakpoint = (widgetIds: string[], numCols: number): Layout[] => {
  const layout: Layout[] = [];
  let currentX = 0;
  let currentY = 0;
  let maxHeightInCurrentRow = 0;

  widgetIds.forEach((id) => {
    const widgetConfig = ALL_AVAILABLE_WIDGETS.find(w => w.id === id);
    if (!widgetConfig) {
      console.warn(`Widget config not found for ID: ${id}`);
      return; 
    }
    
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
    const numCols = COLS[bpKey];
    layoutsObj[bpKey] = generateInitialLayoutForBreakpoint(widgetIds, numCols);
  });
  return layoutsObj;
};


export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const firmId = user?.firmId;
  const userId = user?.id; 
  const [isClient, setIsClient] = useState(false);
  const [visibleWidgetIds, setVisibleWidgetIds] = useState<string[]>([]);
  
  const [layouts, setLayouts] = useState<Layouts>({}); 
  
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof typeof COLS>('lg');
  const [isEditMode, setIsEditMode] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    setIsClient(true);
    if (!firmId) return; 

    const storageKey = `dashboardLayouts_attorney_${firmId}`;
    const visibleWidgetsKey = `dashboardVisibleWidgets_attorney_${firmId}`;

    const savedLayouts = localStorage.getItem(storageKey);
    const savedVisibleWidgets = localStorage.getItem(visibleWidgetsKey);

    let currentVisibleIds = INITIAL_VISIBLE_WIDGET_IDS;
    if (savedVisibleWidgets) {
      try {
        currentVisibleIds = JSON.parse(savedVisibleWidgets);
      } catch (error) {
        console.error("Failed to parse saved visible widgets, using default:", error);
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
                    return savedItem ? { ...defaultItem, ...savedItem, h: savedItem.h, w: savedItem.w } : defaultItem;
                });
            }
        });
        setLayouts(initialLayouts);
      } catch (error) {
        console.error("Failed to parse saved dashboard layouts, using default:", error);
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
                // Prioritize existing dimensions (w, h) if available, otherwise use new defaults
                return existingItem ? { ...newItem, w: existingItem.w, h: existingItem.h } : newItem;
            });
        });
        return mergedLayouts;
      });
    }
  }, [visibleWidgetIds, firmId]);


  const onBreakpointChange = useCallback((newBreakpoint: keyof typeof COLS, _newCols: number) => {
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
        const storageKey = `dashboardLayouts_attorney_${firmId}`;
        const visibleWidgetsKey = `dashboardVisibleWidgets_attorney_${firmId}`;
        localStorage.setItem(storageKey, JSON.stringify(layouts));
        localStorage.setItem(visibleWidgetsKey, JSON.stringify(visibleWidgetIds));
        toast({title: "Layout Saved", description: "Your dashboard layout has been saved."});
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
    
    const widgetConfig = ALL_AVAILABLE_WIDGETS.find(w => w.id === widgetId);
    if (!widgetConfig) return;

    setVisibleWidgetIds(prev => [...prev, widgetId]);
    toast({title: "Widget Added", description: `${widgetConfig.name} added. Remember to save your layout.`});
  };

  const handleRemoveWidget = (widgetId: string) => {
    const newVisibleIds = visibleWidgetIds.filter(id => id !== widgetId);
    setVisibleWidgetIds(newVisibleIds);
    
    const widgetConfig = ALL_AVAILABLE_WIDGETS.find(w => w.id === widgetId);
    toast({title: "Widget Removed", description: `${widgetConfig?.name || 'Widget'} removed. Remember to save your layout.`});
  };

  const visibleWidgets = ALL_AVAILABLE_WIDGETS.filter(w => visibleWidgetIds.includes(w.id));

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
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <LayoutGrid className="mr-3 h-8 w-8 text-primary" />
          Attorney Dashboard
        </h1>
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
                  <DialogTitle>Add Widgets to Dashboard</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {ALL_AVAILABLE_WIDGETS.map(widget => (
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
          draggableHandle=".drag-handle-override" 
        >
          {visibleWidgets.map(widgetConfig => {
            const WidgetComponent = widgetConfig.component;
            const layoutItem = layouts[currentBreakpoint]?.find(l => l.i === widgetConfig.id) ?? 
                               layouts.lg?.find(l => l.i === widgetConfig.id) ?? 
                               widgetConfig.defaultLayout; 
            return (
              <div
                key={widgetConfig.id} 
                data-grid={layoutItem} 
                // Removed bg-card, rounded-lg, shadow-lg. The Card inside widget will provide these.
                className="flex flex-col relative group/widget" 
              >
                {(isEditMode && (layoutItem?.isDraggable ?? widgetConfig.defaultLayout.isDraggable ?? true) && !(layoutItem?.static ?? widgetConfig.defaultLayout.static ?? false)) &&
                  <div className="drag-handle-override p-1 bg-primary cursor-move text-center text-xs text-primary-foreground opacity-80 hover:opacity-100 transition-opacity">Drag</div>
                }
                {/* WidgetComponent itself is a Card that should take h-full and provide its own styling */}
                <WidgetComponent firmId={firmId} userId={userId} />
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
              {visibleWidgets.length === 0 ? "No widgets selected. Click 'Change Layout' then 'Add Widget' to get started." : "Initializing dashboard layout..."}
            </p>
        </div>
      )}
    </div>
  );
}

