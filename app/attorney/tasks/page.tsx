
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PlusCircle, Edit2, Trash2, CalendarDays, Mail, AlertTriangle, Users, Filter, Search as SearchIcon, XCircle } from 'lucide-react';
import { MOCK_TASKS_DATA, MOCK_CONTACTS_DATA, MOCK_MATTERS_DATA, getContactNameById, MOCK_FIRM_USERS_DATA, getMatterNameById, getFirmUserNameById } from '@/lib/mock-data';
import type { Task, TaskFormData, TaskStatus, ContactCategory, Matter, FirmUserRole, User as FirmUserType, Contact } from '@/lib/types';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { MatterActionRibbon } from '@/components/layout/matter-action-ribbon';
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { parseISO, isBefore, isSameDay, isThisWeek, isSameMonth, isSameYear, startOfDay, format as formatDate } from 'date-fns';
import { cn } from '@/lib/utils';

const NO_CLIENT_SELECTED_VALUE = "[NO_CLIENT_SELECTED_TASK_PLACEHOLDER]";
const NO_MATTER_SELECTED_VALUE_TASK = "[NO_MATTER_SELECTED_TASK_PLACEHOLDER]";
const ALL_FILTER_VALUE = "[ALL_TASK_FILTER]";

const TASK_STATUS_OPTIONS: TaskStatus[] = ["Pending", "In Progress", "Completed", "On Hold", "To Do"];

const DUE_DATE_FILTER_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: "All Due Dates" },
  { value: "past_due", label: "Past Due" },
  { value: "today", label: "Due Today" },
  { value: "this_week", label: "Due This Week" },
  { value: "this_month", label: "Due This Month" },
  { value: "this_year", label: "Due This Year" },
];

const getTaskFormSchema = (firmIdToCheck?: string) => z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  dueDate: z.string().refine((val) => val === '' || !isNaN(Date.parse(val)), { message: "Invalid date format." }),
  status: z.enum(["Pending", "In Progress", "Completed", "On Hold", "To Do"]),
  clientId: z.string().optional(),
  matterId: z.string().optional(),
  assignedUserIds: z.array(z.string()).min(1, "Please assign the task to at least one user."),
}).superRefine((data, ctx) => {
    const clientIsSelected = data.clientId && data.clientId !== NO_CLIENT_SELECTED_VALUE;
    const matterIsSelected = data.matterId && data.matterId !== NO_MATTER_SELECTED_VALUE_TASK;

    if (clientIsSelected && matterIsSelected && firmIdToCheck) {
        const matter = MOCK_MATTERS_DATA.find(m => m.id === data.matterId && m.firmId === firmIdToCheck);
        if (matter && data.clientId && !matter.clientIds.includes(data.clientId)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Selected client is not part of the selected matter. Please ensure they are linked or select a different client/matter.",
                path: ["matterId"],
            });
        }
    }
});


const canManageTasks = (role?: FirmUserRole) => ['Admin', 'Attorney', 'Paralegal', 'Staff'].includes(role || '');
const canDeleteTask = (role?: FirmUserRole) => ['Admin', 'Attorney', 'Paralegal'].includes(role || '');


export default function TaskManagementPage() {
  const { user, globalTimeEntryEditing: authGlobalTimeEntryEditing, globalTimeEntryInitialData: authGlobalTimeEntryInitialData } = useAuth();
  const searchParams = useSearchParams();
  const currentPathname = usePathname();
  const filterByMatterIdFromUrl = searchParams.get('matterId');
  const firmId = user?.firmId;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentMatter, setCurrentMatter] = useState<Matter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [filterStatus, setFilterStatus] = useState<TaskStatus | typeof ALL_FILTER_VALUE>(ALL_FILTER_VALUE);
  const [filterAssignedUserId, setFilterAssignedUserId] = useState<string | typeof ALL_FILTER_VALUE>(ALL_FILTER_VALUE);
  const [filterClientId, setFilterClientIdState] = useState<string | typeof ALL_FILTER_VALUE>(ALL_FILTER_VALUE);
  const [filterMatterId, setFilterMatterIdState] = useState<string | typeof ALL_FILTER_VALUE>(ALL_FILTER_VALUE);
  const [filterDueDateRange, setFilterDueDateRange] = useState<string>(ALL_FILTER_VALUE);
  
  const [clientSearchTermDialog, setClientSearchTermDialog] = useState('');
  const [isClientListOpenDialog, setIsClientListOpenDialog] = useState(false);
  const [matterSearchTermDialog, setMatterSearchTermDialog] = useState('');
  const [isMatterListOpenDialog, setIsMatterListOpenDialog] = useState(false);


  const clientContacts = useMemo(() =>
    firmId ? MOCK_CONTACTS_DATA.filter(c => c.category === "Client" as ContactCategory && c.firmId === firmId) : [],
  [firmId]);

  const allFirmMatters = useMemo(() =>
    firmId ? MOCK_MATTERS_DATA.filter(m => m.firmId === firmId && m.type !== "Prospect") : [],
  [firmId]);

  const firmUsers = useMemo(() =>
    firmId ? MOCK_FIRM_USERS_DATA.filter(fu => fu.firmId === firmId) : [],
  [firmId]);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(getTaskFormSchema(firmId)),
    defaultValues: {
      title: '', description: '', dueDate: '', status: 'Pending',
      clientId: NO_CLIENT_SELECTED_VALUE,
      matterId: NO_MATTER_SELECTED_VALUE_TASK,
      assignedUserIds: user?.id ? [user.id] : [],
    },
  });

  const watchedClientIdInForm = form.watch("clientId");
  const watchedAssignedUserIdsInForm = form.watch("assignedUserIds");
  
  const [availableMattersForForm, setAvailableMattersForForm] = useState<Matter[]>(allFirmMatters);

  useEffect(() => {
    if (!firmId) return;
    let newAvailableMatters = allFirmMatters;
    if (watchedClientIdInForm && watchedClientIdInForm !== NO_CLIENT_SELECTED_VALUE) {
        newAvailableMatters = allFirmMatters.filter(m => m.clientIds.includes(watchedClientIdInForm));
        const currentMatterId = form.getValues('matterId');
        if (currentMatterId && currentMatterId !== NO_MATTER_SELECTED_VALUE_TASK && !newAvailableMatters.find(m => m.id === currentMatterId)) {
            form.setValue('matterId', NO_MATTER_SELECTED_VALUE_TASK);
            setMatterSearchTermDialog('');
        }
    }
    setAvailableMattersForForm(newAvailableMatters);
  }, [firmId, watchedClientIdInForm, allFirmMatters, form]);


  useEffect(() => {
    if (firmId) {
      setTasks(MOCK_TASKS_DATA.filter(t => t.firmId === firmId));
      if (filterByMatterIdFromUrl) {
        const matter = MOCK_MATTERS_DATA.find(m => m.id === filterByMatterIdFromUrl && m.firmId === firmId);
        setCurrentMatter(matter || null);
        setFilterClientIdState(ALL_FILTER_VALUE); 
        setFilterMatterIdState(filterByMatterIdFromUrl);
      } else {
        setCurrentMatter(null);
      }
    }
  }, [firmId, filterByMatterIdFromUrl]);

  // Effect to initialize form and search terms when dialog opens
  useEffect(() => {
    if (showTaskModal) {
      let initialClientId = NO_CLIENT_SELECTED_VALUE;
      let initialMatterId = NO_MATTER_SELECTED_VALUE_TASK;
      let resetValues: Partial<TaskFormData> = {
          title: '', description: '', dueDate: new Date().toISOString().split('T')[0], status: 'Pending',
          assignedUserIds: user?.id ? [user.id] : [],
      };
      
      const taskToEdit = editingTask || authGlobalTimeEntryEditing;
      const initialData = authGlobalTimeEntryInitialData;

      if (taskToEdit) {
        initialClientId = taskToEdit.clientId?.toString() || NO_CLIENT_SELECTED_VALUE;
        initialMatterId = taskToEdit.matterId || NO_MATTER_SELECTED_VALUE_TASK;

        // Type guard: Check if taskToEdit has a 'status' property (indicating it's a Task)
        if ('status' in taskToEdit) {
            // It's a Task
             resetValues = {
                ...resetValues,
                title: taskToEdit.title,
                description: taskToEdit.description || '',
                dueDate: taskToEdit.dueDate,
                status: taskToEdit.status,
                assignedUserIds: taskToEdit.assignedUserIds || (user?.id ? [user.id] : []),
            };
        } else {
            // It's likely a TimeEntry. Access properties based on TimeEntry structure.
            // Assuming TimeEntry has a 'date' property for the due date.
            resetValues = {
                ...resetValues,
                // TimeEntry might not have a direct 'title'. Use description or a default.
                title: (taskToEdit as any).description || `Task for Time Entry on ${formatDate((taskToEdit as any).date, 'MM/dd/yyyy')}`, // Example title
                description: (taskToEdit as any).description || '', // Assuming TimeEntry has a description
                dueDate: (taskToEdit as any).date ? (taskToEdit as any).date.split('T')[0] : new Date().toISOString().split('T')[0], // Use TimeEntry's date for dueDate
                status: 'Pending', // Default status for a task created from a TimeEntry
                assignedUserIds: (taskToEdit as any).assignedUserIds || (user?.id ? [user.id] : []), // Consider assigned users in TimeEntry
            };
        }

      } else if (initialData) {
         // Handle initialData (apply similar logic if initialData can be TimeEntry)
          if ('status' in initialData) {
             // initialData is likely a Task
              resetValues = {
                ...resetValues,
                title: initialData.title || '', // Safely access title if it's a Task
                description: initialData.description || '',
                dueDate: initialData.date || new Date().toISOString().split('T')[0],
                status: initialData.status || 'Pending',
                assignedUserIds: initialData.assignedUserIds || (user?.id ? [user.id] : []),
              };
          } else {
              // initialData is likely a TimeEntry
              // Access properties based on TimeEntry structure (adjust as needed)
              resetValues = {
                ...resetValues,
                title: (initialData as any).description || `Task for Time Entry on ${formatDate((initialData as any).date, 'MM/dd/yyyy')}`, // Assuming TimeEntry has a description or use a default
                description: (initialData as any).description || '',
                dueDate: (initialData as any).date ? (initialData as any).date.split('T')[0] : new Date().toISOString().split('T')[0], // Use TimeEntry's date for dueDate
                status: 'Pending', // Default status
                assignedUserIds: (initialData as any).assignedUserIds || (user?.id ? [user.id] : []), // Consider assigned users in TimeEntry
            };
          }
      }



      // Set display terms AFTER form reset
      setClientSearchTermDialog(initialClientId && initialClientId !== NO_CLIENT_SELECTED_VALUE ? getContactNameById(initialClientId) || '' : '');
      setMatterSearchTermDialog(initialMatterId && initialMatterId !== NO_MATTER_SELECTED_VALUE_TASK ? getMatterNameById(initialMatterId) || '' : '');
      setIsMatterListOpenDialog(false);
      
      setIsClientListOpenDialog(false);
    }
  }, [showTaskModal, editingTask, authGlobalTimeEntryEditing, authGlobalTimeEntryInitialData, form, currentMatter, filterByMatterIdFromUrl, user?.id]);


  const openTaskModal = (task: Task | null = null) => {
    setEditingTask(task); 
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    form.reset({ 
      title: '', description: '', dueDate: new Date().toISOString().split('T')[0], status: 'Pending',
      clientId: NO_CLIENT_SELECTED_VALUE, matterId: NO_MATTER_SELECTED_VALUE_TASK,
      assignedUserIds: user?.id ? [user.id] : [],
    });
    setClientSearchTermDialog('');
    setIsClientListOpenDialog(false);
    setMatterSearchTermDialog('');
    setIsMatterListOpenDialog(false);
  };
  
  const handleClientSearchInputChangeDialog = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setClientSearchTermDialog(newSearchTerm);
    if (newSearchTerm.trim().length > 0) {
        setIsClientListOpenDialog(true);
    } else {
        setIsClientListOpenDialog(false);
        // If input is cleared, clear RHF clientId and dependent matterId
        if (form.getValues("clientId") !== NO_CLIENT_SELECTED_VALUE) {
            form.setValue('clientId', NO_CLIENT_SELECTED_VALUE, { shouldValidate: true });
            form.setValue('matterId', NO_MATTER_SELECTED_VALUE_TASK, { shouldValidate: true }); // Also clear matter
        }
    }
  };

  const handleClientSelectionDialog = (client: Contact) => {
    form.setValue('clientId', client.id.toString(), { shouldValidate: true });
    setClientSearchTermDialog(client.name);
    setIsClientListOpenDialog(false);

    // Check if current matter is still valid for this client, if not, reset it
    const currentFormMatterId = form.getValues('matterId');
    if (currentFormMatterId && currentFormMatterId !== NO_MATTER_SELECTED_VALUE_TASK) {
        const matterDetails = MOCK_MATTERS_DATA.find(m => m.id === currentFormMatterId);
        if (matterDetails && !matterDetails.clientIds.includes(client.id.toString())) {
            form.setValue('matterId', NO_MATTER_SELECTED_VALUE_TASK, { shouldValidate: true });
        }
    }
  };

  const clearClientSelectionDialog = () => {
    form.setValue('clientId', NO_CLIENT_SELECTED_VALUE, { shouldValidate: true });
    setClientSearchTermDialog('');
    setIsClientListOpenDialog(false);
    // When client is cleared, matter should also be reset as its context is lost
    form.setValue('matterId', NO_MATTER_SELECTED_VALUE_TASK, { shouldValidate: true });
  };
  
  const handleMatterSearchInputChangeDialog = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setMatterSearchTermDialog(newSearchTerm);
    if (newSearchTerm.trim().length > 0) {
        setIsMatterListOpenDialog(true);
    } else {
        setIsMatterListOpenDialog(false);
        if (form.getValues("matterId") !== NO_MATTER_SELECTED_VALUE_TASK) {
            form.setValue('matterId', NO_MATTER_SELECTED_VALUE_TASK, { shouldValidate: true });
        }
    }
  };

  const handleMatterSelectionDialog = (matter: Matter) => {
    form.setValue('matterId', matter.id, { shouldValidate: true });
    setMatterSearchTermDialog(getMatterNameById(matter.id) || '');
    setIsMatterListOpenDialog(false);
  };

  const clearMatterSelectionDialog = () => {
    form.setValue('matterId', NO_MATTER_SELECTED_VALUE_TASK, { shouldValidate: true });
    setMatterSearchTermDialog('');
    setIsMatterListOpenDialog(false);
  };

  const filteredClientsForDialog = useMemo(() => {
    if (!clientSearchTermDialog.trim()) return [];
    return clientContacts.filter(c =>
      c.name.toLowerCase().includes(clientSearchTermDialog.toLowerCase())
    );
  }, [clientContacts, clientSearchTermDialog]);

  const onSubmit = (data: TaskFormData) => {
    if (!firmId || !user?.id) {
      toast({ title: "Error", description: "Firm context or user ID not found.", variant: "destructive"});
      return;
    }
    const finalClientId = data.clientId === NO_CLIENT_SELECTED_VALUE ? undefined : data.clientId;
    const finalMatterId = data.matterId === NO_MATTER_SELECTED_VALUE_TASK ? undefined : data.matterId;
    let finalAssignedUserIds = data.assignedUserIds;
    if (finalAssignedUserIds.length === 0 && user?.id) {
        finalAssignedUserIds = [user.id];
    }
    const assignedNames = finalAssignedUserIds
        .map(id => firmUsers.find(fu => fu.id === id)?.name)
        .filter(Boolean)
        .join(', ');

    const taskPayload: Omit<Task, 'id'> = {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        status: data.status,
        clientId: finalClientId, 
        matterId: finalMatterId, 
        assignedUserIds: finalAssignedUserIds,
        assignedToDisplay: assignedNames || 'Unassigned', 
        firmId,
    };

    const taskToUpdate = editingTask || authGlobalTimeEntryEditing;

    if (taskToUpdate) {
      const index = MOCK_TASKS_DATA.findIndex(t => t.id === taskToUpdate.id && t.firmId === firmId);
      if (index !== -1) {
        MOCK_TASKS_DATA[index] = { 
            ...taskToUpdate, 
            ...taskPayload, 
            client: finalClientId ? getContactNameById(finalClientId) : undefined 
        };
      }
      setTasks([...MOCK_TASKS_DATA.filter(t => t.firmId === firmId)]);
      toast({ title: "Task Updated", description: `Task "${data.title}" has been updated.` });
    } else {
      const newTask: Task = { 
          id: Date.now().toString(), 
          ...taskPayload, 
          client: finalClientId ? getContactNameById(finalClientId) : undefined 
      };
      MOCK_TASKS_DATA.unshift(newTask);
      setTasks([...MOCK_TASKS_DATA.filter(t => t.firmId === firmId)]);
      toast({ title: "Task Added", description: `Task "${data.title}" has been created.` });
    }
    closeTaskModal();
  };

  const handleDeleteTask = (taskId: string | number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
        const index = MOCK_TASKS_DATA.findIndex(task => task.id === taskId && task.firmId === firmId);
        if (index !== -1) { MOCK_TASKS_DATA.splice(index, 1); }
        setTasks([...MOCK_TASKS_DATA.filter(task => task.firmId === firmId)]);
        toast({ title: "Task Deleted", description: "The task has been removed.", variant: "destructive" });
    }
  };

  const filteredTasks = useMemo(() => {
    let displayableTasks = tasks;
    if (filterByMatterIdFromUrl) {
        displayableTasks = displayableTasks.filter(task => task.matterId === filterByMatterIdFromUrl);
    } else {
        if (filterMatterId && filterMatterId !== ALL_FILTER_VALUE) displayableTasks = displayableTasks.filter(task => task.matterId === filterMatterId);
        if (filterClientId && filterClientId !== ALL_FILTER_VALUE) displayableTasks = displayableTasks.filter(task => task.clientId === filterClientId);
    }
    if (filterStatus && filterStatus !== ALL_FILTER_VALUE) displayableTasks = displayableTasks.filter(task => task.status === filterStatus);
    if (filterAssignedUserId && filterAssignedUserId !== ALL_FILTER_VALUE) displayableTasks = displayableTasks.filter(task => task.assignedUserIds.includes(filterAssignedUserId));
    
    if (filterDueDateRange !== ALL_FILTER_VALUE) {
      const today = startOfDay(new Date());
      displayableTasks = displayableTasks.filter(task => {
        if (!task.dueDate) return false;
        try {
          const dueDate = startOfDay(parseISO(task.dueDate)); 
          switch (filterDueDateRange) {
            case "past_due": return isBefore(dueDate, today) && task.status !== "Completed";
            case "today": return isSameDay(dueDate, today);
            case "this_week": return isThisWeek(dueDate, { weekStartsOn: 1 }); 
            case "this_month": return isSameMonth(dueDate, today) && isSameYear(dueDate, today);
            case "this_year": return isSameYear(dueDate, today);
            default: return true;
          }
        } catch (e) { return false; }
      });
    }
    
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        displayableTasks = displayableTasks.filter(task =>
            task.title.toLowerCase().includes(searchLower) ||
            (task.description && task.description.toLowerCase().includes(searchLower)) ||
            (task.client && task.client.toLowerCase().includes(searchLower)) ||
            (task.assignedToDisplay && task.assignedToDisplay.toLowerCase().includes(searchLower))
        );
    }
    return displayableTasks;
  }, [tasks, filterByMatterIdFromUrl, filterStatus, filterAssignedUserId, filterClientId, filterMatterId, filterDueDateRange, searchTerm]);

  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100';
      case 'Pending': case 'To Do': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100';
      case 'On Hold': return 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  const primaryClientIdForRibbon = currentMatter?.clientIds[0];
  const userRole = user?.type === 'firmUser' ? user.firmRole : undefined;

  const getAssigneeButtonText = () => {
    if (!watchedAssignedUserIdsInForm || watchedAssignedUserIdsInForm.length === 0) return "Select Assignees";
    if (watchedAssignedUserIdsInForm.length === 1) {
      return firmUsers.find(fu => fu.id === watchedAssignedUserIdsInForm[0])?.name || "1 selected";
    }
    return `${watchedAssignedUserIdsInForm.length} users selected`;
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try { return formatDate(parseISO(dateString), 'MM/dd/yyyy'); } 
    catch (e) { return dateString; }
  };

  return (
    <div className="space-y-6">
      {filterByMatterIdFromUrl && currentMatter && (
        <MatterActionRibbon matterId={filterByMatterIdFromUrl} matterType={currentMatter.type} primaryClientId={primaryClientIdForRibbon} currentPathname={currentPathname} />
      )}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative sm:w-64 flex-grow sm:flex-grow-0">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild><Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter Tasks</Button></PopoverTrigger>
            <PopoverContent className="w-80 p-4 space-y-3">
              <div><Label htmlFor="filter-task-status" className="text-xs font-medium">Status</Label>
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value === ALL_FILTER_VALUE ? ALL_FILTER_VALUE : value as TaskStatus)}>
                  <SelectTrigger id="filter-task-status" className="w-full text-xs"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent><SelectItem value={ALL_FILTER_VALUE}>All Statuses</SelectItem>{TASK_STATUS_OPTIONS.map(stat => <SelectItem key={stat} value={stat}>{stat}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="filter-task-due-date" className="text-xs font-medium">Due Date</Label>
                <Select value={filterDueDateRange} onValueChange={(value) => setFilterDueDateRange(value)}>
                  <SelectTrigger id="filter-task-due-date" className="w-full text-xs"><SelectValue placeholder="All Due Dates" /></SelectTrigger>
                  <SelectContent>{DUE_DATE_FILTER_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="filter-task-assignee" className="text-xs font-medium">Assigned To</Label>
                <Select value={filterAssignedUserId} onValueChange={(value) => setFilterAssignedUserId(value === ALL_FILTER_VALUE ? ALL_FILTER_VALUE : value)}>
                  <SelectTrigger id="filter-task-assignee" className="w-full text-xs"><SelectValue placeholder="All Users" /></SelectTrigger>
                  <SelectContent><SelectItem value={ALL_FILTER_VALUE}>All Users</SelectItem>{firmUsers.map(fu => <SelectItem key={fu.id} value={fu.id}>{fu.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {!filterByMatterIdFromUrl && (<>
                  <div><Label htmlFor="filter-task-client" className="text-xs font-medium">Client</Label>
                    <Select value={filterClientId} onValueChange={(value) => setFilterClientIdState(value === ALL_FILTER_VALUE ? ALL_FILTER_VALUE : value)}>
                      <SelectTrigger id="filter-task-client" className="w-full text-xs"><SelectValue placeholder="All Clients" /></SelectTrigger>
                      <SelectContent><SelectItem value={ALL_FILTER_VALUE}>All Clients</SelectItem>{clientContacts.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label htmlFor="filter-task-matter" className="text-xs font-medium">Matter</Label>
                    <Select value={filterMatterId} onValueChange={(value) => setFilterMatterIdState(value === ALL_FILTER_VALUE ? ALL_FILTER_VALUE : value)}>
                      <SelectTrigger id="filter-task-matter" className="w-full text-xs"><SelectValue placeholder="All Matters" /></SelectTrigger>
                      <SelectContent><SelectItem value={ALL_FILTER_VALUE}>All Matters</SelectItem>{allFirmMatters.filter(m => !filterClientId || filterClientId === ALL_FILTER_VALUE || m.clientIds.includes(filterClientId)).map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
              </>)}
            </PopoverContent>
          </Popover>
          {canManageTasks(userRole) && (<Button onClick={() => openTaskModal()} className="flex-shrink-0"><PlusCircle className="mr-2 h-4 w-4" /> Add Task</Button>)}
        </div>
      </div>
      {filterByMatterIdFromUrl && currentMatter && (<h1 className="text-2xl font-semibold text-foreground">Tasks for Matter: {currentMatter.name}</h1>)}
      <Card className="shadow-xl"><CardContent className="p-4 md:p-6">
          {filteredTasks.length > 0 ? (<ul className="space-y-4">
              {filteredTasks.map(task => {
                const today = startOfDay(new Date());
                const dueDate = task.dueDate ? startOfDay(parseISO(task.dueDate)) : null;
                const isPastDue = dueDate && isBefore(dueDate, today) && task.status !== "Completed";
                return (<li key={task.id} className="p-4 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150 ease-in-out">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-2 sm:mb-0 flex-grow">
                      <h3 className="font-semibold text-foreground text-lg">{task.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {task.client && `Client: ${task.client} | `}
                        {task.matterId && `Matter: ${getMatterNameById(task.matterId) || task.matterId} | `}
                        <span className={cn(isPastDue ? "text-destructive font-semibold" : "")}>Due: {formatDisplayDate(task.dueDate)}</span>
                        {task.assignedToDisplay && ` | Assigned: ${task.assignedToDisplay}`}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full shrink-0 ${getStatusBadgeClass(task.status)}`}>{task.status}</span>
                  </div>
                  {task.description && <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border/50">{task.description}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <TooltipProvider>{canManageTasks(userRole) && (<Tooltip><TooltipTrigger asChild><Button onClick={() => openTaskModal(task)} variant="ghost" size="sm"><Edit2 className="mr-1 h-4 w-4" /> Edit</Button></TooltipTrigger><TooltipContent><p>Edit Task</p></TooltipContent></Tooltip>)}{canDeleteTask(userRole) && (<Tooltip><TooltipTrigger asChild><Button onClick={() => handleDeleteTask(task.id)} variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="mr-1 h-4 w-4" /> Delete</Button></TooltipTrigger><TooltipContent><p>Delete Task</p></TooltipContent></Tooltip>)}<Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" onClick={() => toast({title: "Feature Placeholder", description: "Exporting to .ics would be handled here."})}><CalendarDays className="mr-1 h-4 w-4" /> .ics</Button></TooltipTrigger><TooltipContent><p>Copy to Calendar (.ics)</p></TooltipContent></Tooltip><Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" onClick={() => toast({title: "Feature Placeholder", description: "Drafting email would be handled here."})}><Mail className="mr-1 h-4 w-4" /> Email</Button></TooltipTrigger><TooltipContent><p>Draft Email (mailto:)</p></TooltipContent></Tooltip></TooltipProvider>
                  </div></li>);})}</ul>
          ) : (<div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                <p className="text-lg font-semibold">No Tasks Found</p>
                <p className="text-sm">{searchTerm || filterStatus !== ALL_FILTER_VALUE || filterAssignedUserId !== ALL_FILTER_VALUE || filterClientId !== ALL_FILTER_VALUE || filterMatterId !== ALL_FILTER_VALUE || filterDueDateRange !== ALL_FILTER_VALUE ? "No tasks match your current filter criteria." : (filterByMatterIdFromUrl ? "No tasks found for this matter." : "There are no tasks.")}</p>
             </div>)}</CardContent></Card>
      <Dialog open={showTaskModal} onOpenChange={(isOpen) => { if (!isOpen) closeTaskModal(); else setShowTaskModal(true); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingTask || authGlobalTimeEntryEditing ? "Edit Task" : "Add New Task"}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <ScrollArea className="h-[60vh] pr-4"><div className="space-y-4"> 
                  <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Task Title</FormLabel><FormControl><Input placeholder="e.g., Draft Will for John Smith" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Add more details about the task..." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="dueDate" render={({ field }) => (<FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent>{TASK_STATUS_OPTIONS.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)}/>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="clientId" render={({ field: formFieldRHF_Client }) => (
                        <FormItem><FormLabel>Client Contact (Optional)</FormLabel>
                            <Popover open={isClientListOpenDialog} onOpenChange={setIsClientListOpenDialog}>
                                <PopoverTrigger asChild>
                                    <div className="relative flex items-center">
                                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                        <FormControl><Input placeholder="Search clients..." value={clientSearchTermDialog} onChange={handleClientSearchInputChangeDialog} onFocus={() => { if (clientSearchTermDialog.trim() || clientContacts.length > 0 ) setIsClientListOpenDialog(true); }} className="h-9 text-xs pl-8" autoComplete="off"/></FormControl>
                                        {form.getValues("clientId") && form.getValues("clientId") !== NO_CLIENT_SELECTED_VALUE && (<Button type="button" variant="ghost" size="icon" onClick={clearClientSelectionDialog} className="absolute right-1 h-7 w-7 text-muted-foreground hover:text-destructive" aria-label="Clear client selection"><XCircle className="h-4 w-4" /></Button>)}
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 mt-1" align="start" onOpenAutoFocus={(event) => event.preventDefault()}>
                                    <ScrollArea className="h-auto max-h-48">{filteredClientsForDialog.length > 0 ? (filteredClientsForDialog.map(client => (<Button key={client.id} variant="ghost" className={cn("w-full justify-start text-left h-auto py-1.5 px-2 text-xs", formFieldRHF_Client.value === client.id.toString() && "bg-accent text-accent-foreground")} onClick={() => handleClientSelectionDialog(client)} type="button">{client.name}</Button>))) : (<p className="p-2 text-xs text-center text-muted-foreground">{clientSearchTermDialog.trim() ? "No clients found." : "Type to search clients."}</p>)}</ScrollArea>
                                </PopoverContent>
                            </Popover><FormMessage />
                        </FormItem>)}/>
                        <FormField
    control={form.control}
    name="matterId"
    render={({ field: formFieldRHF_Matter }) => (
        <FormItem>
            <FormLabel>Matter Association (Optional)</FormLabel>
            <Popover open={isMatterListOpenDialog} onOpenChange={setIsMatterListOpenDialog}>
                <PopoverTrigger asChild>
                    <div className="relative flex items-center">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                         <FormControl>
                            <Input
                                placeholder="Search matters..."
                                value={matterSearchTermDialog}
                                onChange={handleMatterSearchInputChangeDialog}
                                onFocus={() => {
                                    if (matterSearchTermDialog.trim() || availableMattersForForm.length > 0) {
                                        setIsMatterListOpenDialog(true);
                                    }
                                }}
                                className="h-9 text-xs pl-8"
                                autoComplete="off"
                                disabled={filterByMatterIdFromUrl && !!currentMatter}
                            />
                        </FormControl>
                        {form.getValues("matterId") && form.getValues("matterId") !== NO_MATTER_SELECTED_VALUE_TASK && !(filterByMatterIdFromUrl && !!currentMatter) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={clearMatterSelectionDialog}
                                className="absolute right-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                                aria-label="Clear matter selection"
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 mt-1" align="start" onOpenAutoFocus={(event) => event.preventDefault()}>
                    <ScrollArea className="h-auto max-h-48">
                        <Button
                             variant="ghost"
                             className={cn(
                                 "w-full justify-start text-left h-auto py-1.5 px-2 text-xs",
                                 formFieldRHF_Matter.value === NO_MATTER_SELECTED_VALUE_TASK && "bg-accent text-accent-foreground"
                             )}
                             onClick={() => clearMatterSelectionDialog()}
                             type="button"
                         >
                             -- None --
                         </Button>
                        {availableMattersForForm.length > 0 ? (
                            availableMattersForForm
                                .filter(m =>
                                    matterSearchTermDialog.trim() === '' ||
                                    m.name.toLowerCase().includes(matterSearchTermDialog.toLowerCase()) ||
                                    m.clientIds.some(clientId => getContactNameById(clientId)?.toLowerCase().includes(matterSearchTermDialog.toLowerCase()))
                                )
                                .map(m => (
                                    <Button
                                        key={m.id}
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start text-left h-auto py-1.5 px-2 text-xs",
                                            formFieldRHF_Matter.value === m.id && "bg-accent text-accent-foreground"
                                        )}
                                        onClick={() => handleMatterSelectionDialog(m)}
                                        type="button"
                                    >
                                        {m.name} (Client: {getContactNameById(m.clientIds[0]) || 'N/A'})
                                    </Button>
                                ))
                        ) : (
                             <p className="p-2 text-xs text-center text-muted-foreground">
                                {matterSearchTermDialog.trim() ? "No matters found." : (watchedClientIdInForm && watchedClientIdInForm !== NO_CLIENT_SELECTED_VALUE ? "No matters for selected client" : "Type to search matters.")}
                            </p>
                        )}
                    </ScrollArea>
                </PopoverContent>
            </Popover>
            <FormMessage />
        </FormItem>
    )}
/>
                  </div>
                  <FormField control={form.control} name="assignedUserIds" render={({ field }) => (
                    <FormItem><FormLabel>Assigned To</FormLabel>
                      <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start font-normal"><Users className="mr-2 h-4 w-4" /> {getAssigneeButtonText()}</Button></PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <ScrollArea className="h-48"><div className="p-4 space-y-2">
                            {firmUsers.map((fu) => (<FormItem key={fu.id} className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl><Checkbox id={`assignee-${fu.id}`} checked={field.value?.includes(fu.id)} onCheckedChange={(checked) => {const currentVal = field.value || []; if (checked) { field.onChange([...currentVal, fu.id]); } else { field.onChange(currentVal.filter(id => id !== fu.id)); }}}/></FormControl>
                                <Label htmlFor={`assignee-${fu.id}`} className="font-normal text-sm">{fu.name} ({fu.email})</Label></FormItem>))}
                          </div></ScrollArea></PopoverContent></Popover>
                      <FormDescription>Select one or more users. Defaults to you if none selected on save.</FormDescription><FormMessage />
                    </FormItem>)}/>
                </div></ScrollArea> 
              <DialogFooter className="pt-4">
                <DialogClose asChild><Button type="button" variant="outline" onClick={closeTaskModal}>Cancel</Button></DialogClose>
                <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" />{editingTask || authGlobalTimeEntryEditing ? "Save Changes" : "Create Task"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

