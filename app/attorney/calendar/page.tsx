
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link'; // Added Link import
import { MonthlyCalendarView } from '@/components/shared/monthly-calendar-view';
import { DailyCalendarView } from '@/components/shared/daily-calendar-view';
import { WorkWeekCalendarView } from '@/components/shared/work-week-calendar-view';
import { FullWeekCalendarView } from '@/components/shared/full-week-calendar-view';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarIconComponent } from "@/components/ui/calendar";
import { MOCK_APPOINTMENTS_DATA, MOCK_TASKS_DATA, MOCK_MATTERS_DATA, getContactNameById, MOCK_FIRM_USERS_DATA, MOCK_GROUP_CALENDARS_DATA, MOCK_CONTACTS_DATA } from '@/lib/mock-data';
import type { Appointment, Task, Matter, GroupCalendar, User as FirmUser, AppointmentFormData, Contact, MatterType } from '@/lib/types'; // Added MatterType
import { ContactCategory, MATTER_TYPES } from '@/lib/types'; // Added MATTER_TYPES
import { ClipboardList, Info, CalendarCheck2, AlertTriangle, Calendar as CalendarLucideIcon, ChevronLeft, ChevronRight, Users2, PlusCircle, Video, Repeat, BellRing, Search as SearchIcon } from 'lucide-react';
import { MatterActionRibbon } from '@/components/layout/matter-action-ribbon';
import { format, parseISO, startOfMonth, addMonths, subMonths, addDays, subDays, isSameDay, startOfWeek, endOfWeek, addWeeks, subWeeks, set, addHours } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type CalendarViewMode = 'month' | 'work-week' | 'week' | 'day';

const NO_MATTER_SELECTED_VALUE = "[NO_MATTER_SELECTED]";
const NO_CLIENT_SELECTED_VALUE = "[NO_CLIENT_SELECTED]";


const appointmentFormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid start date."}),
  startTime: z.string().optional(),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid end date."}),
  endTime: z.string().optional(),
  isAllDay: z.boolean(),
  location: z.string().optional(),
  matterId: z.string().optional(),
  clientId: z.string().optional(),
  ownerIds: z.array(z.string()).min(1, "At least one calendar must be selected."),
  description: z.string().optional(),
  attendeesText: z.string().optional(),
  recurrenceRule: z.string().optional(),
  reminderSettings: z.string().optional(),
}).refine(data => {
  if (!data.isAllDay && (!data.startTime || !data.endTime)) {
    return false;
  }
  return true;
}, {
  message: "Start and End time are required for non-all-day events.",
  path: ["startTime"],
}).refine(data => new Date(`${data.startDate}T${data.startTime || '00:00'}`) <= new Date(`${data.endDate}T${data.endTime || '23:59'}`), {
  message: "End date/time must be after start date/time.",
  path: ["endDate"],
});

const getMatterDashboardLink = (matterId: string, matterType?: MatterType): string => {
    if (!matterType) return `/attorney/matters/${matterId}/estate-planning`; // Default or error link
    let dashboardSlug = 'estate-planning';
    if (matterType === MATTER_TYPES.TRUST_ADMINISTRATION) {
      dashboardSlug = 'trust-administration';
    } else if (matterType === MATTER_TYPES.PROSPECT) {
      dashboardSlug = 'prospect';
    }
    return `/attorney/matters/${matterId}/${dashboardSlug}`;
};


export default function AttorneyCalendarPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const currentPathname = usePathname();
  const filterByMatterId = searchParams.get('matterId');
  const firmId = user?.firmId;

  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedCalDate, setSelectedCalDate] = useState<Date>(new Date());
  const [currentMatter, setCurrentMatter] = useState<Matter | null>(null);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [monthYearPickerOpen, setMonthYearPickerOpen] = useState(false);
  const [calendarSelectorOpen, setCalendarSelectorOpen] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  const [matterSearchTerm, setMatterSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [matterSelectOpen, setMatterSelectOpen] = useState(false);
  const [clientSelectOpen, setClientSelectOpen] = useState(false);

  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>(user ? [user.id] : []);
  const [showMyTasks, setShowMyTasks] = useState(true);

  const firmUsers = useMemo(() => firmId ? MOCK_FIRM_USERS_DATA.filter(fu => fu.firmId === firmId) : [], [firmId]);
  const groupCalendars = useMemo(() => firmId ? MOCK_GROUP_CALENDARS_DATA.filter(gc => gc.firmId === firmId) : [], [firmId]);
  const mattersForFirm = useMemo(() => firmId ? MOCK_MATTERS_DATA.filter(m => m.firmId === firmId) : [], [firmId]);
  const clientContactsForFirm = useMemo(() => firmId ? MOCK_CONTACTS_DATA.filter(c => c.firmId === firmId && c.category === ContactCategory.CLIENT) : [], [firmId]);


  const allEvents = useMemo(() => {
    if (selectedCalendarIds.length === 0 || !user?.firmId) return [];

    const appointments = MOCK_APPOINTMENTS_DATA.filter(appt =>
        appt.firmId === user.firmId &&
        (appt.ownerIds.some(ownerId => selectedCalendarIds.includes(ownerId)) ||
         (appt.clientId && MOCK_MATTERS_DATA.find(m => m.id === appt.matterId && m.firmId === user.firmId)?.clientIds.includes(appt.clientId) && selectedCalendarIds.includes(user.id)))
    );

    let taskEvents: (Appointment & { matterType?: MatterType, matterName?: string })[] = [];
    if (showMyTasks) {
        const tasks = MOCK_TASKS_DATA.filter(task =>
            task.firmId === user.firmId &&
            (task.assignedUserIds && task.assignedUserIds.some(assigneeId => selectedCalendarIds.includes(assigneeId)))
        );

        taskEvents = tasks.map((task: Task) => {
          const matterForTask = task.matterId ? MOCK_MATTERS_DATA.find(m => m.id === task.matterId) : undefined;
          return {
            id: `task-${task.id}`,
            title: task.title,
            date: task.dueDate,
            time: "All Day",
            type: 'task',
            notes: task.description,
            ownerIds: task.assignedUserIds || [],
            firmId: task.firmId,
            matterId: task.matterId,
            matterName: matterForTask?.name,
            matterType: matterForTask?.type,
            clientId: task.clientId,
            client: task.client,
            status: task.status,
          };
        });
    }

    return [...appointments, ...taskEvents].map(event => {
        const matter = event.matterId ? MOCK_MATTERS_DATA.find(m=>m.id === event.matterId) : undefined;
        return {
            ...event,
            clientName: event.clientId ? getContactNameById(event.clientId) : undefined,
            matterName: matter?.name,
            matterType: matter?.type,
        };
    });
  }, [selectedCalendarIds, user?.firmId, user?.id, showMyTasks]);

  const addEventForm = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: format(new Date(), 'HH:mm'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      endTime: format(addHours(new Date(), 1), 'HH:mm'),
      isAllDay: false,
      location: '',
      matterId: filterByMatterId || NO_MATTER_SELECTED_VALUE,
      clientId: NO_CLIENT_SELECTED_VALUE,
      ownerIds: user?.id ? [user.id] : [],
      description: '',
      attendeesText: '',
      recurrenceRule: 'none',
      reminderSettings: 'none',
    },
  });

  useEffect(() => {
    if(filterByMatterId) {
        addEventForm.setValue('matterId', filterByMatterId);
        const matterForFilter = mattersForFirm.find(m => m.id === filterByMatterId);
        if (matterForFilter && matterForFilter.clientIds.length > 0) {
            addEventForm.setValue('clientId', matterForFilter.clientIds[0].toString());
        } else {
            addEventForm.setValue('clientId', NO_CLIENT_SELECTED_VALUE);
        }
    } else {
        addEventForm.setValue('matterId', NO_MATTER_SELECTED_VALUE);
        addEventForm.setValue('clientId', NO_CLIENT_SELECTED_VALUE);
    }
    if(user?.id && addEventForm.getValues('ownerIds').length === 0) {
        addEventForm.setValue('ownerIds', [user.id]);
    }
  }, [filterByMatterId, user?.id, addEventForm, mattersForFirm]);


  const getCalendarOwnerNameById = useCallback((ownerId: string | undefined): string | undefined => {
    if (!ownerId) return undefined;
    const firmUserMatch = firmUsers.find(fu => fu.id === ownerId);
    if (firmUserMatch) return firmUserMatch.name;
    const groupCalMatch = groupCalendars.find(gc => gc.id === ownerId);
    if (groupCalMatch) return groupCalMatch.name;
    return ownerId; 
  }, [firmUsers, groupCalendars]);


  const getEventsForSpecificDate = useCallback((date: Date | null): Appointment[] => {
    if (!date) return [];
    return allEvents.filter(event => {
        const eventDateString = event.date || event.dueDate;
        if (!eventDateString) return false;
        try {
            return isSameDay(parseISO(eventDateString), date);
        } catch (e) {
            console.error("Failed to parse event date", eventDateString, e);
            return false;
        }
    });
  }, [allEvents]);

  const [selectedDateEvents, setSelectedDateEvents] = useState<Appointment[]>(() => getEventsForSpecificDate(selectedCalDate));

  useEffect(() => {
    if (user && selectedCalendarIds.length === 0) {
      setSelectedCalendarIds([user.id]);
    }
  }, [user, selectedCalendarIds]);

  useEffect(() => {
    if (filterByMatterId && firmId) {
      const matter = MOCK_MATTERS_DATA.find(m => m.id === filterByMatterId && m.firmId === firmId);
      setCurrentMatter(matter || null);
    } else {
      setCurrentMatter(null);
    }
  }, [filterByMatterId, firmId]);

  useEffect(() => {
    if (viewMode === 'day' && !selectedCalDate) {
      setSelectedCalDate(new Date());
    }
    if (selectedCalDate){
         setSelectedDateEvents(getEventsForSpecificDate(selectedCalDate));
    }
  }, [viewMode, selectedCalDate, getEventsForSpecificDate]);


  const handleDateClickForMonthView = (date: Date, eventsOnDate: Appointment[]) => {
    setSelectedCalDate(date);
    setSelectedDateEvents(eventsOnDate); 
  };

  const handleDayPickerSelect = (date: Date | undefined) => {
    if (date) {
        if (viewMode === 'day' || viewMode === 'week' || viewMode === 'work-week') {
            setSelectedCalDate(date);
        } else { 
            setSelectedCalDate(date);
            setCurrentMonth(startOfMonth(date));
        }
        setMonthYearPickerOpen(false);
    }
  };

  const handlePrevMonth = () => {
    const newDate = subMonths(currentMonth, 1);
    setCurrentMonth(startOfMonth(newDate));
    setSelectedCalDate(newDate);
  };
  const handleNextMonth = () => {
    const newDate = addMonths(currentMonth, 1);
    setCurrentMonth(startOfMonth(newDate));
    setSelectedCalDate(newDate);
  };

  const handlePrevDay = () => setSelectedCalDate(prev => subDays(prev || new Date(), 1));
  const handleNextDay = () => setSelectedCalDate(prev => addDays(prev || new Date(), 1));

  const handlePrevWeek = () => setSelectedCalDate(prev => subWeeks(prev || new Date(), 1));
  const handleNextWeek = () => setSelectedCalDate(prev => addWeeks(prev || new Date(), 1));

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentMonth(startOfMonth(today));
    setSelectedCalDate(today);
  };

  const handleEventClick = (event: Appointment) => {
    const ownerName = event.ownerIds.length === 1 ? getCalendarOwnerNameById(event.ownerIds[0]) : (event.ownerIds.length > 1 ? "[Multiple]" : "");
    toast({
        title: `${ownerName ? `${ownerName} ` : ''}${event.title}`,
        description: `Time: ${event.time || 'All Day'}. Notes: ${event.notes || 'None'}`,
    });
  };

  const handleDateTimeSelect = (date: Date, hour: number) => {
    toast({
        title: "Timeslot Selected",
        description: `Date: ${format(date, 'PPP')}, Time: ${hour === -1 ? 'All Day' : format(new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour), 'ha') }`,
    });
  };

  const handleCalendarSelectionChange = (calendarId: string, isSelected: boolean | string) => {
    setSelectedCalendarIds(prev => {
      if (isSelected) {
        return [...new Set([...prev, calendarId])];
      } else {
        return prev.filter(id => id !== calendarId);
      }
    });
  };

  const onAddEventSubmit = (data: AppointmentFormData) => {
    if (!user?.firmId) {
        toast({ title: "Error", description: "Cannot add event without firm context.", variant: "destructive"});
        return;
    }
    const newAppointment: Appointment = {
        id: `appt-${Date.now()}`,
        title: data.title,
        date: data.startDate,
        time: data.isAllDay ? "All Day" : data.startTime || "",
        endDate: data.isAllDay ? data.startDate : data.endDate,
        endTime: data.isAllDay ? "" : data.endTime,
        isAllDay: data.isAllDay,
        location: data.location,
        matterId: data.matterId === NO_MATTER_SELECTED_VALUE ? undefined : data.matterId,
        clientId: data.clientId === NO_CLIENT_SELECTED_VALUE ? undefined : data.clientId,
        ownerIds: data.ownerIds,
        notes: data.description,
        attendeesText: data.attendeesText,
        recurrenceRule: data.recurrenceRule,
        reminderSettings: data.reminderSettings,
        type: "Meeting",
        firmId: user.firmId,
    };
    MOCK_APPOINTMENTS_DATA.push(newAppointment);
    setSelectedCalendarIds(prev => [...prev]);
    toast({ title: "Event Added", description: `Event "${data.title}" has been scheduled.` });
    setShowAddEventModal(false);
    addEventForm.reset({
        ...addEventForm.formState.defaultValues, 
        ownerIds: user?.id ? [user.id] : [], 
        matterId: filterByMatterId || NO_MATTER_SELECTED_VALUE, 
        clientId: filterByMatterId ? (MOCK_MATTERS_DATA.find(m=>m.id === filterByMatterId)?.clientIds[0]?.toString() || NO_CLIENT_SELECTED_VALUE) : NO_CLIENT_SELECTED_VALUE,
    });
  };

  const primaryClientIdForRibbon = currentMatter?.clientIds[0];
  const matterSpecificEvents = filterByMatterId && firmId ? allEvents.filter(e => e.matterId === filterByMatterId && e.firmId === firmId) : [];

  const renderCalendarView = () => {
    switch (viewMode) {
      case 'month':
        return (
          <MonthlyCalendarView
            events={allEvents}
            onDateClick={handleDateClickForMonthView}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
          />
        );
      case 'day':
         if (!selectedCalDate) return <p>Loading day view...</p>;
        return (
          <DailyCalendarView
            selectedDate={selectedCalDate}
            events={selectedDateEvents}
            currentUserId={user?.id}
            getCalendarOwnerNameById={getCalendarOwnerNameById}
          />
        );
      case 'work-week':
        return (
          <WorkWeekCalendarView
            selectedDate={selectedCalDate || new Date()}
            events={allEvents}
            onEventClick={handleEventClick}
            onDateTimeSelect={handleDateTimeSelect}
          />
        );
      case 'week':
        return (
          <FullWeekCalendarView
            selectedDate={selectedCalDate || new Date()}
            events={allEvents}
            onEventClick={handleEventClick}
            onDateTimeSelect={handleDateTimeSelect}
          />
        );
      default:
        return null;
    }
  };

  const getDisplayDateForPicker = () => {
    if (viewMode === 'day') return selectedCalDate || new Date();
    if (viewMode === 'week' || viewMode === 'work-week') return selectedCalDate || new Date();
    return currentMonth;
  };

  const getButtonTextForPicker = () => {
      if (viewMode === 'day') return format(selectedCalDate || new Date(), 'MMMM d, yyyy');
      if (viewMode === 'week' || viewMode === 'work-week') {
          const weekStartsOn = viewMode === 'work-week' ? 1 : 0;
          const start = startOfWeek(selectedCalDate || new Date(), { weekStartsOn });
          const end = addDays(start, viewMode === 'work-week' ? 4 : 6);
          if (start.getMonth() === end.getMonth()){
            return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
          }
          return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      }
      return format(currentMonth, 'MMMM yyyy');
  }

  const selectedOwnerIds = addEventForm.watch('ownerIds') || [];
  const selectedMatterIdForDisplay = addEventForm.watch('matterId');
  const selectedClientIdForDisplay = addEventForm.watch('clientId');

  const filteredMattersForPopover = mattersForFirm.filter(m => 
    m.name.toLowerCase().includes(matterSearchTerm.toLowerCase())
  );
  const filteredClientsForPopover = clientContactsForFirm.filter(c =>
    c.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );


  return (
    <div className="space-y-6">
      {filterByMatterId && currentMatter && (
        <>
          <MatterActionRibbon matterId={filterByMatterId} matterType={currentMatter.type} primaryClientId={primaryClientIdForRibbon} currentPathname={currentPathname} />
          <h1 className="text-3xl font-bold text-foreground">
            Calendar for Matter: {currentMatter.name}
          </h1>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                    <CalendarCheck2 className="h-5 w-5 text-primary" />
                    <CardTitle>All Events for this Matter</CardTitle>
                </div>
                <Button onClick={() => setShowAddEventModal(true)} size="sm">
                    <PlusCircle className="mr-2 h-4 w-4"/> Add Event to Matter
                </Button>
            </CardHeader>
            <CardContent>
              {matterSpecificEvents.length > 0 ? (
                <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {matterSpecificEvents.map(event => {
                     const ownerNameDisplay = event.ownerIds.length === 1 ? getCalendarOwnerNameById(event.ownerIds[0]) : (event.ownerIds.length > 1 ? "[Multiple]" : "");
                     return (
                        <li key={event.id} className="p-4 bg-muted/30 rounded-lg border border-border shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start">
                            <p className="font-semibold text-foreground">{ownerNameDisplay && <span className="text-xs text-primary/80 mr-1">[{ownerNameDisplay}]</span>}{event.title}</p>
                            <p className="text-sm text-muted-foreground mt-1 sm:mt-0">
                            {format(parseISO(event.date || event.dueDate || '1970-01-01'), 'PPP')} {event.time && event.time !== "All Day" ? `at ${event.time}` : `(${event.time || 'All Day'})`}
                            </p>
                        </div>
                        {event.type === 'task'
                            ? <p className="text-sm text-muted-foreground">Type: Task | Status: {event.status || "N/A"}</p>
                            : event.type && <p className="text-sm text-muted-foreground">Type: {event.type}</p>
                        }
                        {event.clientName && event.clientId && (
                            <p className="text-sm text-muted-foreground">
                                Client: <Link href={`/attorney/contacts/${event.clientId}?matterId=${filterByMatterId}`} className="text-primary hover:underline">{event.clientName}</Link>
                            </p>
                        )}
                        {event.notes && (
                            <div className="mt-2 flex items-start text-xs text-muted-foreground italic space-x-1 bg-background p-2 rounded-md border">
                            <Info size={14} className="flex-shrink-0 mt-0.5" />
                            <span>{event.notes}</span>
                            </div>
                        )}
                        </li>
                     );
                  })}
                </ul>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle className="mx-auto h-12 w-12 text-primary/50 mb-4" />
                  <p className="text-lg font-semibold">No Events Found</p>
                  <p className="text-sm">No appointments or tasks scheduled for this matter.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!filterByMatterId && (
        <>
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={viewMode === 'day' ? handlePrevDay : (viewMode === 'week' || viewMode === 'work-week' ? handlePrevWeek : handlePrevMonth)}
                    variant="outline"
                    size="icon"
                    aria-label={viewMode === 'day' ? 'Previous Day' : (viewMode === 'week' || viewMode === 'work-week' ? 'Previous Week' : 'Previous Month')}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Popover open={monthYearPickerOpen} onOpenChange={setMonthYearPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                        <CalendarLucideIcon className="mr-2 h-4 w-4" />
                        {getButtonTextForPicker()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarIconComponent
                        mode="single"
                        selected={getDisplayDateForPicker()}
                        onSelect={handleDayPickerSelect}
                        initialFocus
                        defaultMonth={getDisplayDateForPicker()}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    onClick={viewMode === 'day' ? handleNextDay : (viewMode === 'week' || viewMode === 'work-week' ? handleNextWeek : handleNextMonth)}
                    variant="outline"
                    size="icon"
                     aria-label={viewMode === 'day' ? 'Next Day' : (viewMode === 'week' || viewMode === 'work-week' ? 'Next Week' : 'Next Month')}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                   <Button onClick={handleGoToToday} variant="outline" size="sm">Today</Button>
                   <Button onClick={() => setShowAddEventModal(true)} size="sm">
                        <PlusCircle className="mr-2 h-4 w-4"/> Add Event
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Popover open={calendarSelectorOpen} onOpenChange={setCalendarSelectorOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm"><Users2 className="mr-2 h-4 w-4" /> Calendars ({selectedCalendarIds.length})</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="end">
                        <ScrollArea className="h-[40vh] p-4">
                            <div className="space-y-3">
                                <div>
                                    <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Display Options</h5>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show-my-tasks"
                                            checked={showMyTasks}
                                            onCheckedChange={(checked) => setShowMyTasks(Boolean(checked))}
                                        />
                                        <Label htmlFor="show-my-tasks" className="text-sm font-normal">Show My Tasks</Label>
                                    </div>
                                </div>
                                 <hr className="my-2"/>
                                <div>
                                    <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">My Calendar</h5>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`cal-user-${user?.id}`}
                                            checked={selectedCalendarIds.includes(user?.id || '')}
                                            onCheckedChange={(checked) => handleCalendarSelectionChange(user?.id || '', checked)}
                                        />
                                        <Label htmlFor={`cal-user-${user?.id}`} className="text-sm font-normal">{user?.name} (Me)</Label>
                                    </div>
                                </div>
                                {firmUsers.filter(fu => fu.id !== user?.id).length > 0 && (
                                    <div>
                                        <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 mt-3">Firm Users</h5>
                                        {firmUsers.filter(fu => fu.id !== user?.id).map(fu => (
                                            <div key={fu.id} className="flex items-center space-x-2 mb-1">
                                            <Checkbox
                                                id={`cal-user-${fu.id}`}
                                                checked={selectedCalendarIds.includes(fu.id)}
                                                onCheckedChange={(checked) => handleCalendarSelectionChange(fu.id, checked)}
                                            />
                                            <Label htmlFor={`cal-user-${fu.id}`} className="text-sm font-normal">{fu.name}</Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {groupCalendars.length > 0 && (
                                     <div>
                                        <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 mt-3">Group Calendars</h5>
                                        {groupCalendars.map(gc => (
                                            <div key={gc.id} className="flex items-center space-x-2 mb-1">
                                            <Checkbox
                                                id={`cal-group-${gc.id}`}
                                                checked={selectedCalendarIds.includes(gc.id)}
                                                onCheckedChange={(checked) => handleCalendarSelectionChange(gc.id, checked)}
                                            />
                                            <Label htmlFor={`cal-group-${gc.id}`} className="text-sm font-normal">{gc.name}</Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as CalendarViewMode)}>
                    <TabsList>
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <TabsTrigger value="work-week">Work Week</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="day">Day</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderCalendarView()}
            </CardContent>
          </Card>

          {viewMode === 'month' && selectedCalDate && (
            <Card className="mt-6 shadow-lg">
              <CardHeader className="flex flex-row items-center space-x-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">
                  Events for {format(selectedCalDate, 'PPPP')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateEvents.length > 0 ? (
                  <ul className="space-y-4">
                    {selectedDateEvents.map(event => {
                      const ownerNameDisplay = event.ownerIds.length === 1 ? getCalendarOwnerNameById(event.ownerIds[0]) : (event.ownerIds.length > 1 ? "[Multiple]" : "");
                      return (
                        <li key={event.id} className="p-4 bg-muted/30 rounded-lg border border-border shadow-sm">
                          <p className="font-semibold text-foreground">{ownerNameDisplay && <span className="text-xs text-primary/80 mr-1">[{ownerNameDisplay}]</span>}{event.title}</p>
                          {event.time && <p className="text-sm text-muted-foreground">Time: {event.time}</p>}
                          {event.type === 'task'
                              ? <p className="text-sm text-muted-foreground">Type: Task | Status: {event.status || "N/A"}</p>
                              : event.type && <p className="text-sm text-muted-foreground">Type: {event.type}</p>
                          }
                           {event.clientName && event.clientId && (
                              <p className="text-sm text-muted-foreground">
                                Client: <Link href={`/attorney/contacts/${event.clientId}${filterByMatterId ? `?matterId=${filterByMatterId}`: ''}`} className="text-primary hover:underline">{event.clientName}</Link>
                              </p>
                            )}
                            {event.matterName && event.matterId && event.matterType && (
                               <p className="text-sm text-muted-foreground">
                                Matter: <Link href={getMatterDashboardLink(event.matterId, event.matterType)} className="text-primary hover:underline">{event.matterName}</Link>
                              </p>
                            )}
                          {event.notes && (
                            <div className="mt-2 flex items-start text-xs text-muted-foreground italic space-x-1 bg-background p-2 rounded-md border">
                              <Info size={14} className="flex-shrink-0 mt-0.5" />
                              <span>{event.notes}</span>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No events scheduled for this day.</p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

    {/* Add Event Modal */}
    <Dialog open={showAddEventModal} onOpenChange={setShowAddEventModal}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Add New Calendar Event</DialogTitle>
            </DialogHeader>
            <Form {...addEventForm}>
                <form onSubmit={addEventForm.handleSubmit(onAddEventSubmit)} className="space-y-4 py-2">
                    <ScrollArea className="h-[65vh] pr-5">
                        <div className="space-y-4">
                            <FormField control={addEventForm.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Event Title</FormLabel><FormControl><Input placeholder="e.g., Client Meeting, Document Signing" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={addEventForm.control} name="isAllDay" render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">All Day Event?</FormLabel></FormItem>
                            )}/>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={addEventForm.control} name="startDate" render={({ field }) => (
                                    <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                {!addEventForm.watch("isAllDay") && (
                                    <FormField control={addEventForm.control} name="startTime" render={({ field }) => (
                                        <FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={addEventForm.control} name="endDate" render={({ field }) => (
                                    <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                {!addEventForm.watch("isAllDay") && (
                                    <FormField control={addEventForm.control} name="endTime" render={({ field }) => (
                                        <FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                )}
                            </div>
                            <FormField control={addEventForm.control} name="location" render={({ field }) => (
                                <FormItem><FormLabel>Location (Optional)</FormLabel><FormControl><Input placeholder="e.g., Conference Room A, Client's Office" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="space-y-1">
                                <FormLabel>Video Conferencing</FormLabel>
                                <Button type="button" variant="outline" className="w-full text-muted-foreground hover:text-foreground" disabled>
                                    <Video className="mr-2 h-4 w-4" /> Connect to Zoom/Google Meet (Coming Soon)
                                </Button>
                            </div>
                           
                            <FormField
                                control={addEventForm.control}
                                name="matterId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Associated Matter (Optional)</FormLabel>
                                        <Popover open={matterSelectOpen} onOpenChange={setMatterSelectOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start font-normal">
                                                    {selectedMatterIdForDisplay && selectedMatterIdForDisplay !== NO_MATTER_SELECTED_VALUE
                                                        ? mattersForFirm.find(m => m.id === selectedMatterIdForDisplay)?.name || "Select a matter"
                                                        : "Select a matter"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                <div className="p-2 border-b">
                                                    <Input
                                                        placeholder="Search matters..."
                                                        value={matterSearchTerm}
                                                        onChange={(e) => setMatterSearchTerm(e.target.value)}
                                                        className="h-8"
                                                    />
                                                </div>
                                                <ScrollArea className="h-[200px]">
                                                    <div className="p-1">
                                                        <Button
                                                            variant="ghost"
                                                            className="w-full justify-start text-xs"
                                                            onClick={() => {
                                                                field.onChange(NO_MATTER_SELECTED_VALUE);
                                                                addEventForm.setValue('clientId', NO_CLIENT_SELECTED_VALUE);
                                                                setMatterSelectOpen(false);
                                                            }}
                                                        >
                                                            -- None --
                                                        </Button>
                                                        {filteredMattersForPopover.map(m => (
                                                            <Button
                                                                key={m.id}
                                                                variant={field.value === m.id ? "default" : "ghost"}
                                                                className="w-full justify-start text-xs h-auto py-1.5 px-2"
                                                                onClick={() => {
                                                                    field.onChange(m.id);
                                                                    if (m.clientIds.length > 0) {
                                                                        addEventForm.setValue('clientId', m.clientIds[0].toString(), { shouldValidate: true });
                                                                    } else {
                                                                         addEventForm.setValue('clientId', NO_CLIENT_SELECTED_VALUE, { shouldValidate: true });
                                                                    }
                                                                    setMatterSelectOpen(false);
                                                                }}
                                                            >
                                                                {m.name}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                             <FormField
                                control={addEventForm.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Associated Client (Optional)</FormLabel>
                                        <Popover open={clientSelectOpen} onOpenChange={setClientSelectOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start font-normal">
                                                    {selectedClientIdForDisplay && selectedClientIdForDisplay !== NO_CLIENT_SELECTED_VALUE
                                                        ? clientContactsForFirm.find(c => c.id.toString() === selectedClientIdForDisplay)?.name || "Select a client"
                                                        : "Select a client"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                <div className="p-2 border-b">
                                                    <Input
                                                        placeholder="Search clients..."
                                                        value={clientSearchTerm}
                                                        onChange={(e) => setClientSearchTerm(e.target.value)}
                                                        className="h-8"
                                                    />
                                                </div>
                                                <ScrollArea className="h-[200px]">
                                                    <div className="p-1">
                                                        <Button
                                                            variant="ghost"
                                                            className="w-full justify-start text-xs"
                                                            onClick={() => {
                                                                field.onChange(NO_CLIENT_SELECTED_VALUE);
                                                                setClientSelectOpen(false);
                                                            }}
                                                        >
                                                            -- None --
                                                        </Button>
                                                        {filteredClientsForPopover.map(c => (
                                                            <Button
                                                                key={c.id}
                                                                variant={field.value === c.id.toString() ? "default" : "ghost"}
                                                                className="w-full justify-start text-xs h-auto py-1.5 px-2"
                                                                onClick={() => {
                                                                    field.onChange(c.id.toString());
                                                                    setClientSelectOpen(false);
                                                                }}
                                                            >
                                                                {c.name}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                           <FormField
                                control={addEventForm.control}
                                name="ownerIds"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Add to Calendar(s)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                                {selectedOwnerIds.length > 0 ? `Selected (${selectedOwnerIds.length})` : "Select calendars..."}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <ScrollArea className="h-[30vh] p-4">
                                                <div className="space-y-2">
                                                    <h5 className="text-xs font-semibold uppercase text-muted-foreground">My Calendar</h5>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`event-cal-user-${user?.id}`}
                                                            checked={field.value?.includes(user?.id || '')}
                                                            onCheckedChange={(checked) => {
                                                                const currentVal = field.value || [];
                                                                if (checked) field.onChange([...new Set([...currentVal, user?.id || ''])]);
                                                                else field.onChange(currentVal.filter(id => id !== user?.id));
                                                            }}
                                                        />
                                                        <Label htmlFor={`event-cal-user-${user?.id}`} className="font-normal">{user?.name} (Me)</Label>
                                                    </div>
                                                    {firmUsers.filter(fu => fu.id !== user?.id).length > 0 && (
                                                      <>
                                                        <h5 className="text-xs font-semibold uppercase text-muted-foreground mt-2 pt-2 border-t">Firm Users</h5>
                                                        {firmUsers.filter(fu => fu.id !== user?.id).map(fu => (
                                                            <div key={fu.id} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`event-cal-user-${fu.id}`}
                                                                    checked={field.value?.includes(fu.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        const currentVal = field.value || [];
                                                                        if (checked) field.onChange([...new Set([...currentVal, fu.id])]);
                                                                        else field.onChange(currentVal.filter(id => id !== fu.id));
                                                                    }}
                                                                />
                                                                <Label htmlFor={`event-cal-user-${fu.id}`} className="font-normal">{fu.name}</Label>
                                                            </div>
                                                        ))}
                                                      </>
                                                    )}
                                                    {groupCalendars.length > 0 && (
                                                      <>
                                                        <h5 className="text-xs font-semibold uppercase text-muted-foreground mt-2 pt-2 border-t">Group Calendars</h5>
                                                        {groupCalendars.map(gc => (
                                                            <div key={gc.id} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`event-cal-group-${gc.id}`}
                                                                    checked={field.value?.includes(gc.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        const currentVal = field.value || [];
                                                                        if (checked) field.onChange([...new Set([...currentVal, gc.id])]);
                                                                        else field.onChange(currentVal.filter(id => id !== gc.id));
                                                                    }}
                                                                />
                                                                <Label htmlFor={`event-cal-group-${gc.id}`} className="font-normal">{gc.name}</Label>
                                                            </div>
                                                        ))}
                                                      </>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField control={addEventForm.control} name="recurrenceRule" render={({ field }) => (
                                <FormItem><FormLabel>Repeat (Placeholder)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || 'none'}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">Does not repeat</SelectItem>
                                        <SelectItem value="daily" disabled>Daily</SelectItem>
                                        <SelectItem value="weekly" disabled>Weekly</SelectItem>
                                    </SelectContent></Select><FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={addEventForm.control} name="reminderSettings" render={({ field }) => (
                                <FormItem><FormLabel>Reminder (Placeholder)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || 'none'}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">No reminder</SelectItem>
                                        <SelectItem value="15m" disabled>15 minutes before</SelectItem>
                                        <SelectItem value="1h" disabled>1 hour before</SelectItem>
                                    </SelectContent></Select><FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={addEventForm.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description/Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Purpose of the event, agenda, etc." {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={addEventForm.control} name="attendeesText" render={({ field }) => (
                                <FormItem><FormLabel>Invite Attendees (Optional)</FormLabel><FormControl><Textarea placeholder="Enter names or email addresses, comma-separated" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                    </ScrollArea>
                    <DialogFooter className="pt-4 border-t">
                        <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                        <Button type="submit">Add Event</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
    </div>
  );
}

