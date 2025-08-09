
"use client";

import type { User, FirmUserRole, TimeEntry, TimeEntryFormData } from '@/lib/types';
import { useRouter } from 'next/navigation';
import type { Dispatch, SetStateAction, ReactNode} from 'react';
import React, { useState, createContext, useContext, useEffect, useCallback, useMemo } from 'react'; // Added useCallback and useMemo
import { getContactNameById, getMatterNameById, MOCK_LAW_FIRMS_DATA } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  login: (type: 'firmUser' | 'client', name: string, email: string, firmId?: string, firmRole?: FirmUserRole) => void;
  logout: () => void;
  isLoading: boolean; // Represents initial auth state loading
  updateCurrentUserName: (newName: string) => void;
  updateUserAvatar: (newAvatarUrl: string | null) => void;
  currentAttorneyPage: string;
  setCurrentAttorneyPage: Dispatch<SetStateAction<string>>;
  currentClientPage: string;
  setCurrentClientPage: Dispatch<SetStateAction<string>>;

  // Global Timer State
  isGlobalTimerRunning: boolean;
  globalElapsedSeconds: number;
  globalTimerClient: string;
  globalTimerMatter: string;
  startGlobalTimer: (clientId: string, matterId: string) => void;
  stopGlobalTimerAndLog: () => void;
  resetGlobalTimer: () => void;
  setGlobalTimerClient: Dispatch<SetStateAction<string>>;
  setGlobalTimerMatter: Dispatch<SetStateAction<string>>;
  formatTimer: (totalSeconds: number) => string;

  // Global Time Entry Dialog State
  showGlobalTimeEntryDialog: boolean;
  globalTimeEntryEditing: TimeEntry | null;
  globalTimeEntryInitialData: Partial<TimeEntryFormData> | null;
  openGlobalTimeEntryDialog: (entryToEdit?: TimeEntry | null, prefillData?: Partial<TimeEntryFormData> | null) => void;
  closeGlobalTimeEntryDialog: () => void;
  
  // Time entries state
  timeEntries: TimeEntry[];
  addTimeEntry: (entryData: Omit<TimeEntry, 'id' | 'isInvoiced' | 'clientName' | 'matterName' | 'firmId'>) => void;
  updateTimeEntry: (entry: TimeEntry) => void;
  deleteTimeEntry: (entryId: string) => void;
  setTimeEntries: Dispatch<SetStateAction<TimeEntry[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  // router is not used directly in AuthContext, but can be if needed for specific auth flows not handled by pages
  // const router = useRouter(); 

  const [currentAttorneyPage, setCurrentAttorneyPage] = useState('dashboard');
  const [currentClientPage, setCurrentClientPage] = useState('dashboard');

  const [isGlobalTimerRunning, setIsGlobalTimerRunning] = useState(false);
  const [globalElapsedSeconds, setGlobalElapsedSeconds] = useState(0);
  const [globalTimerIntervalId, setGlobalTimerIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [globalTimerClient, setGlobalTimerClient] = useState<string>('');
  const [globalTimerMatter, setGlobalTimerMatter] = useState<string>('');

  const [showGlobalTimeEntryDialog, setShowGlobalTimeEntryDialog] = useState(false);
  const [globalTimeEntryEditing, setGlobalTimeEntryEditing] = useState<TimeEntry | null>(null);
  const [globalTimeEntryInitialData, setGlobalTimeEntryInitialData] = useState<Partial<TimeEntryFormData> | null>(null);

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('briefcaseUser');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user from localStorage:", error);
        localStorage.removeItem('briefcaseUser'); 
        setUser(null);
      }
    }
    setIsLoading(false); 
  }, []); 

  const login = useCallback((type: 'firmUser' | 'client', name: string, email: string, firmId?: string, firmRole?: FirmUserRole) => {
    let newUser: User;
    const defaultFirmIdForNewUsers = MOCK_LAW_FIRMS_DATA.length > 0 ? MOCK_LAW_FIRMS_DATA[0].id : 'firm1';
    if (type === 'firmUser') {
      newUser = { 
        type, 
        name, 
        id: email, 
        email, 
        firmId: firmId || defaultFirmIdForNewUsers, 
        firmRole: firmRole || 'Attorney',
        avatarUrl: `https://placehold.co/40x40/E0E0E0/B0B0B0.png?text=${name ? name.charAt(0).toUpperCase() : 'U'}`
      };
    } else { 
      newUser = { 
        type, 
        name, 
        id: email, 
        email,
        firmId: firmId || defaultFirmIdForNewUsers,
        avatarUrl: `https://placehold.co/40x40/A0D0A0/FFFFFF.png?text=${name ? name.charAt(0).toUpperCase() : 'C'}`
      };
    }
    setUser(newUser);
    localStorage.setItem('briefcaseUser', JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    if (globalTimerIntervalId) clearInterval(globalTimerIntervalId);
    setIsGlobalTimerRunning(false);
    setGlobalElapsedSeconds(0);
    setGlobalTimerClient('');
    setGlobalTimerMatter('');
    setGlobalTimerIntervalId(null);
    setUser(null);
    localStorage.removeItem('briefcaseUser');
  }, [globalTimerIntervalId]);

  const updateCurrentUserName = useCallback((newName: string) => {
    setUser(prevUser => {
      if (prevUser) {
        const updatedUser = { ...prevUser, name: newName };
        localStorage.setItem('briefcaseUser', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    });
  }, []);
  
  const updateUserAvatar = useCallback((newAvatarUrl: string | null) => {
    setUser(prevUser => {
      if (prevUser) {
        const updatedUser = { ...prevUser, avatarUrl: newAvatarUrl || undefined };
        localStorage.setItem('briefcaseUser', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    });
  }, []);


  const startGlobalTimer = useCallback((clientId: string, matterId: string) => {
    if (globalTimerIntervalId) clearInterval(globalTimerIntervalId); 
    setGlobalTimerClient(clientId);
    setGlobalTimerMatter(matterId);
    setIsGlobalTimerRunning(true);
    const id = setInterval(() => {
      setGlobalElapsedSeconds(prev => prev + 1);
    }, 1000);
    setGlobalTimerIntervalId(id);
  }, [globalTimerIntervalId]);

  const openGlobalTimeEntryDialog = useCallback((entryToEdit: TimeEntry | null = null, prefillData: Partial<TimeEntryFormData> | null = null) => {
    setGlobalTimeEntryEditing(entryToEdit);
    setGlobalTimeEntryInitialData(prefillData);
    setShowGlobalTimeEntryDialog(true);
  }, []);

  const stopGlobalTimerAndLog = useCallback(() => {
    setIsGlobalTimerRunning(false);
    if (globalTimerIntervalId) clearInterval(globalTimerIntervalId);
    setGlobalTimerIntervalId(null);

    if (globalElapsedSeconds > 0 && globalTimerClient && globalTimerMatter && user?.firmId) {
      const hours = Math.floor(globalElapsedSeconds / 3600);
      const minutes = Math.floor((globalElapsedSeconds % 3600) / 60);
      const initialData: Partial<TimeEntryFormData> & { firmId?: string } = {
        date: new Date().toISOString().split('T')[0],
        durationHours: hours,
        durationMinutes: minutes,
        description: `Work on ${getMatterNameById(globalTimerMatter)} for ${getContactNameById(globalTimerClient)}`,
        clientId: globalTimerClient,
        matterId: globalTimerMatter,
        isBillable: true,
      };
      openGlobalTimeEntryDialog(null, initialData);
    }
  }, [globalTimerIntervalId, globalElapsedSeconds, globalTimerClient, globalTimerMatter, user?.firmId, openGlobalTimeEntryDialog]);

  const resetGlobalTimer = useCallback(() => {
    setIsGlobalTimerRunning(false);
    if (globalTimerIntervalId) clearInterval(globalTimerIntervalId);
    setGlobalTimerIntervalId(null);
    setGlobalElapsedSeconds(0);
    setGlobalTimerClient(''); 
    setGlobalTimerMatter('');
  }, [globalTimerIntervalId]);

  const formatTimer = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, []);
  
  const closeGlobalTimeEntryDialog = useCallback(() => {
    setShowGlobalTimeEntryDialog(false);
    setGlobalTimeEntryEditing(null);
    setGlobalTimeEntryInitialData(null);
    if (!isGlobalTimerRunning && globalElapsedSeconds > 0) {
        setGlobalElapsedSeconds(0); 
    }
  }, [isGlobalTimerRunning, globalElapsedSeconds]);

  const addTimeEntry = useCallback((entryData: Omit<TimeEntry, 'id' | 'isInvoiced' | 'clientName' | 'matterName' | 'firmId'>) => {
    if (!user?.firmId) {
      console.error("Cannot add time entry: user has no firmId.");
      return;
    }
    const newEntry: TimeEntry = {
      id: `TE${Date.now().toString()}`,
      ...entryData,
      clientName: getContactNameById(entryData.clientId),
      matterName: getMatterNameById(entryData.matterId),
      isInvoiced: false,
      firmId: user.firmId,
    };
    setTimeEntries(prev => [newEntry, ...prev]);
  }, [user?.firmId]);

  const updateTimeEntry = useCallback((updatedEntry: TimeEntry) => {
    if (!user?.firmId || updatedEntry.firmId !== user.firmId) {
      console.error("Cannot update time entry: firmId mismatch or missing.");
      return;
    }
    setTimeEntries(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
  }, [user?.firmId]);

  const deleteTimeEntry = useCallback((entryId: string) => {
     setTimeEntries(prev => prev.filter(entry => entry.id !== entryId && entry.firmId === user?.firmId));
  }, [user?.firmId]);
  
  useEffect(() => { 
    return () => {
      if (globalTimerIntervalId) clearInterval(globalTimerIntervalId);
    };
  }, [globalTimerIntervalId]);

  const contextValue = useMemo(() => ({
    user, login, logout, isLoading, updateCurrentUserName, updateUserAvatar,
    currentAttorneyPage, setCurrentAttorneyPage,
    currentClientPage, setCurrentClientPage,
    isGlobalTimerRunning, globalElapsedSeconds, globalTimerClient, globalTimerMatter,
    startGlobalTimer, stopGlobalTimerAndLog, resetGlobalTimer, formatTimer,
    setGlobalTimerClient, setGlobalTimerMatter,
    showGlobalTimeEntryDialog, globalTimeEntryEditing, globalTimeEntryInitialData,
    openGlobalTimeEntryDialog, closeGlobalTimeEntryDialog,
    timeEntries, addTimeEntry, updateTimeEntry, deleteTimeEntry, setTimeEntries
  }), [
    user, login, logout, isLoading, updateCurrentUserName, updateUserAvatar,
    currentAttorneyPage, // Removed setCurrentAttorneyPage from here if not strictly needed for memo value
    currentClientPage,   // Removed setCurrentClientPage from here if not strictly needed for memo value
    isGlobalTimerRunning, globalElapsedSeconds, globalTimerClient, globalTimerMatter,
    startGlobalTimer, stopGlobalTimerAndLog, resetGlobalTimer, formatTimer,
    setGlobalTimerClient, setGlobalTimerMatter, // Kept setters if they are directly passed or used to derive parts of value
    showGlobalTimeEntryDialog, globalTimeEntryEditing, globalTimeEntryInitialData,
    openGlobalTimeEntryDialog, closeGlobalTimeEntryDialog,
    timeEntries, addTimeEntry, updateTimeEntry, deleteTimeEntry, // Removed setTimeEntries if only dispatch is passed
    setCurrentAttorneyPage, setCurrentClientPage, setTimeEntries // Added back setters that are directly part of the context value
  ]);


  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

