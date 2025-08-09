
export type UserRole = 'firmUser' | 'client'; 

export interface LawFirm {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
}

export type FirmUserRole = 'Admin' | 'Attorney' | 'Paralegal' | 'Staff';

export interface User {
  id: string;
  name: string;
  email: string;
  type: 'firmUser' | 'client'; 
  firmId?: string; 
  firmRole?: FirmUserRole; 
  permissions?: Record<string, boolean>; 
  avatarUrl?: string;
}

export interface ProfileFormData {
  name: string;
  // avatarUrl will be handled separately
}


export interface NewUserFormData {
  name: string;
  email: string;
  firmRole: FirmUserRole;
}

export interface EditUserFormData {
  name: string;
  email: string; 
  firmRole: FirmUserRole;
  permissions?: Record<string, boolean>;
}


export enum ContactCategory {
  CLIENT = "Client",
  FINANCIAL_ADVISOR = "Financial Advisor",
  CPA = "CPA",
  OTHER_ATTORNEY = "Other Attorney",
  GENERAL_CONTACT = "General Contact",
}

export const CONTACT_CATEGORIES = Object.values(ContactCategory);

export type ContactStatus = 'Active' | 'Prospect' | 'Inactive' | 'New' | 'Vendor' | 'Referral Source';

export const CONTACT_STATUSES: ContactStatus[] = ['Active', 'Prospect', 'Inactive', 'New', 'Vendor', 'Referral Source'];

export interface EmailEntry {
  address: string;
  type?: string; 
  isPrimary: boolean;
}

export interface PhoneEntry {
  number: string;
  type?: string; 
  isPrimary: boolean;
}

export interface Contact {
  id: string | number;
  name: string;
  emails: EmailEntry[];
  category: ContactCategory;
  status: ContactStatus;
  lastActivity: string; 
  dob?: string; 
  phones?: PhoneEntry[];
  address?: string; 
  mailingAddress?: string;
  company?: string;
  notes?: string;
  referredBy?: string;
  relatedContactIds?: (string | number)[];
  firmId: string;
  outstandingBalance?: number;
  trustAccountBalance?: number;
}

export interface ContactFormData {
  name: string;
  emails: EmailEntry[];
  category: ContactCategory;
  status: string;
  dob?: string; 
  phones?: PhoneEntry[];
  address?: string;
  mailingAddress?: string;
  company?: string;
  notes?: string;
  referredBy?: string;
}

export const MATTER_TYPES = {
  PROSPECT: "Prospect",
  ESTATE_PLANNING: "Estate Planning",
  TRUST_ADMINISTRATION: "Trust Administration",
  PROBATE: "Probate",
  BUSINESS: "Business",
  OTHER: "Other"
} as const;

export type MatterType = typeof MATTER_TYPES[keyof typeof MATTER_TYPES];

export const INTAKE_FORM_TYPES = {
  ESTATE_PLANNING: "Estate Planning Intake",
  ESTATE_PLAN_UPDATE: "Estate Plan Update Intake",
  TRUST_ADMINISTRATION: "Trust Administration Intake",
  PROBATE: "Probate Intake",
  BUSINESS: "Business Intake",
  GENERAL_INQUIRY: "General Inquiry Intake",
} as const;

export type IntakeFormType = typeof INTAKE_FORM_TYPES[keyof typeof INTAKE_FORM_TYPES];


export type MatterStatus = 'Open' | 'Closed' | 'Pending' | 'On Hold' | 'Lead' | 'Contacted' | 'Consult Scheduled' | 'Not Qualified' | 'Proposal Sent' | 'Awaiting Decision' | 'Closed-Won' | 'Closed-Lost';

export const statusOptionsByType: Record<MatterType, MatterStatus[]> = {
  [MATTER_TYPES.PROSPECT]: ["Lead", "Contacted", "Consult Scheduled", "Not Qualified", "Awaiting Decision"],
  [MATTER_TYPES.ESTATE_PLANNING]: ["Open", "Pending", "Closed", "On Hold"],
  [MATTER_TYPES.TRUST_ADMINISTRATION]: ["Open", "Pending", "Closed", "On Hold"],
  [MATTER_TYPES.PROBATE]: ["Open", "Pending", "Closed", "On Hold"],
  [MATTER_TYPES.BUSINESS]: ["Open", "Pending", "Closed", "On Hold"],
  [MATTER_TYPES.OTHER]: ["Open", "Pending", "Closed", "On Hold"],
};

export const NO_ATTORNEY_SELECTED_VALUE_MATTER = "[NO_ATTORNEY_SELECTED_MATTER]";

export type IntakeFormStatus = 'Not Sent' | 'Sent' | 'Started' | 'Completed';
export const INTAKE_FORM_STATUSES: IntakeFormStatus[] = ['Not Sent', 'Sent', 'Started', 'Completed'];

export interface ImportantDateEntry {
  id?: string;
  date?: string;
  notes?: string;
}


export interface Matter {
  id: string;
  name: string;
  clientIds: (string | number)[];
  status: MatterStatus;
  type: MatterType;
  firmId: string;
  responsibleAttorneyId?: string;
  responsibleAttorneyName?: string; 
  openDate: string; 
  closeDate?: string; 
  potentialServicesNotes?: string;
  intakeFormType?: IntakeFormType;
  intakeFormStatus?: IntakeFormStatus;
  intakeFormSentDate?: string;
  intakeFormCompletedDate?: string;
  consultationDate1?: string;
  consultationDate2?: string;
  engagementLetterSentDate?: string;
  expectedDecisionDate?: string;
  importantDate?: string; 
  importantDateNotes?: string; 
  importantDates?: ImportantDateEntry[];
  referredBy?: string; 
}

export interface MatterFormData {
  name: string;
  type: MatterType;
  status: string;
  linkedClientIds: (string | number)[];
  responsibleAttorneyId?: string;
  openDate: string; 
  closeDate?: string; 
  consultationDate1?: string;
  consultationDate2?: string;
  engagementLetterSentDate?: string;
  expectedDecisionDate?: string;
  importantDate?: string; 
  importantDateNotes?: string; 
  importantDates?: ImportantDateEntry[];
  referredBy?: string; 
}

export interface Appointment {
  id: string;
  title: string;
  date: string; 
  time: string; 
  endDate?: string; 
  endTime?: string; 
  isAllDay?: boolean;
  location?: string;
  recurrenceRule?: string;
  reminderSettings?: string;
  attendeesText?: string;
  type: string;
  matterId?: string;
  notes?: string;
  status?: TaskStatus; 
  dueDate?: string; 
  firmId: string;
  ownerIds: string[]; 
}

export interface AppointmentFormData {
  title: string;
  startDate: string;
  startTime?: string; 
  endDate: string;
  endTime?: string; 
  isAllDay: boolean;
  location?: string;
  recurrenceRule?: string;
  matterId?: string;
  reminderSettings?: string;
  ownerIds: string[]; 
  description?: string;
  attendeesText?: string;
}


export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'To Do' | 'On Hold';

export interface Task {
  id: string | number;
  title: string;
  description?: string;
  dueDate: string; 
  status: TaskStatus;
  clientId?: string | number;
  matterId?: string;
  assignedUserIds: string[];
  assignedToDisplay?: string; 
  firmId: string;
}

export interface GroupCalendar {
  id: string;
  name: string;
  firmId: string;
}


export interface ClientToDoItem {
  id: string;
  matterId: string;
  firmId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dateAdded: string; 
  dateCompleted?: string; 
  addedByAttorneyName?: string; 
}

export interface ClientToDoItemFormData {
  title: string;
  description?: string;
}


export interface Document {
  id: string | number;
  name: string;
  matterId?: string;
  dateUploaded?: string; 
  dateShared?: string; 
  size: string;
  type: string;
  url?: string;
  contentPreview?: string;
  folderPath?: string;
  firmId: string;
}

export enum AssetCategory {
  REAL_ESTATE = "Real Estate",
  BANK_ACCOUNTS = "Bank Accounts",
  INVESTMENT_ACCOUNTS = "Investment/Brokerage Accounts",
  RETIREMENT_ACCOUNTS = "Retirement Accounts",
  LIFE_INSURANCE = "Life Insurance",
  PERSONAL_PROPERTY = "Personal Property",
  BUSINESS_INTERESTS = "Business Interests",
  BONDS = "Bonds",
  CERTIFICATES_OF_DEPOSIT = "Certificates of Deposit",
  CHARITABLE_ACCOUNTS = "Charitable Accounts",
  HEALTH_SAVINGS_ACCOUNTS = "Health Savings Accounts",
  MONEY_MARKET_ACCOUNTS = "Money Market Accounts",
  SAFE_DEPOSIT_BOXES = "Safe Deposit Boxes",
  ANNUITIES = "Annuities",
  OTHER = "Other Assets",
}

export const ASSET_CATEGORIES = Object.values(AssetCategory);
export type AssetStatusType = 'Not Funded' | 'Funded' | 'To Be Titled' | 'Pending Titling' | 'N/A' | 'Unknown';
export const ASSET_STATUS_OPTIONS: AssetStatusType[] = ["Not Funded", "Funded", "To Be Titled", "Pending Titling", "N/A", "Unknown"];


export type BusinessType = 'LLC' | 'S-Corp' | 'C-Corp' | 'Partnership' | 'Sole Proprietorship' | 'Other';
export const BUSINESS_TYPES: BusinessType[] = ['LLC', 'S-Corp', 'C-Corp', 'Partnership', 'Sole Proprietorship', 'Other'];


export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  matterId: string;
  value: string;
  status: AssetStatusType;
  currentOwner: string;
  accountNumber?: string; 
  notes?: string;
  businessType?: BusinessType;
  businessTypeOther?: string;
  deedOnFile?: boolean;
  financialAdvisorId?: string;
  operatingDocumentsOnFile?: boolean;
  primaryBeneficiaries?: string;
  secondaryBeneficiaries?: string;
  firmId: string;
}

export interface AssetFormDataItem {
  name: string;
  category: AssetCategory | "";
  value: string;
  currentOwner: string;
  accountNumber?: string; 
  status: AssetStatusType | "";
  notes?: string;
  businessType?: BusinessType | "";
  businessTypeOther?: string;
  deedOnFile?: boolean;
  financialAdvisorId?: string;
  operatingDocumentsOnFile?: boolean;
  primaryBeneficiaries?: string;
  secondaryBeneficiaries?: string;
}

export interface AddAssetsFormData {
  assets: AssetFormDataItem[];
}


export interface KeyParty {
  role: string;
  name: string;
}

export interface Note {
  id?: string;
  date: string;
  note: string;
}

export interface TimeEntry {
  id: string;
  date: string; 
  durationMinutes: number;
  description: string;
  clientId: string | number;
  clientName?: string;
  matterId: string;
  matterName?: string;
  attorneyId?: string;
  attorneyName?: string;
  isBillable: boolean;
  isInvoiced: boolean;
  firmId: string;
}

export interface TimeEntryFormData {
  date: string;
  durationHours: number;
  durationMinutes: number;
  description: string;
  clientId: string;
  matterId: string;
  isBillable: boolean;
}

export interface TaskFormData {
  title: string;
  description?: string;
  dueDate: string;
  status: TaskStatus;
  clientId?: string; // Made optional
  matterId?: string;
  assignedUserIds: string[];
}


export interface Announcement {
  id: string;
  title: string;
  text: string;
  date: string; 
  firmId?: string; 
}

export interface Activity {
  id: string;
  text: string;
  time: string; 
  type: string;
  link?: string;
  firmId: string;
}

export interface Reminder {
  id: string;
  text: string;
  dueDate: string;
  type: string;
  matterId: string; 
}

export enum CommunicationTypes {
  CALL = "Call",
  EMAIL = "Email",
  MEETING = "Meeting",
  CLIENT_PORTAL_MESSAGE = "Client Portal Message",
  INTERNAL_NOTE = "Internal Note",
}
export const COMMUNICATION_TYPES_ARRAY = Object.values(CommunicationTypes); 

export enum CommunicationDirections {
  INCOMING = "Incoming",
  OUTGOING = "Outgoing",
}
export const COMMUNICATION_DIRECTIONS_ARRAY = Object.values(CommunicationDirections);


export interface CommunicationLogItem {
    id: string;
    firmId: string;
    matterId?: string;
    clientId?: string | number;
    dateTime: string; 
    type: CommunicationTypes;
    direction: CommunicationDirections;
    subject: string;
    details: string;
    participants?: string; 
    durationMinutes?: number;
    isClientVisible?: boolean; 
    loggedByUserId: string; 
    loggedByName?: string; 
    clientName?: string;
    matterName?: string;
    isRead?: boolean; 
    snippet?: string; 
}

export interface LogCommunicationFormData {
    type: CommunicationTypes | '';
    clientId?: string | number;
    matterId?: string;
    date: string; 
    time: string; 
    direction: CommunicationDirections | '';
    subject: string;
    details: string;
    participants?: string;
    durationHours?: number;
    durationMinutes?: number;
    isClientVisible?: boolean;
}

export enum LeadStatus {
  NEW_INQUIRY = "New Inquiry",
  INITIAL_CONTACT_MADE = "Initial Contact Made",
  CONSULTATION_SCHEDULED = "Consultation Scheduled",
  CONSULTATION_COMPLETED = "Consultation Completed",
  PROPOSAL_SENT = "Proposal Sent",
  AWAITING_DECISION = "Awaiting Decision",
  CLOSED_WON = "Closed-Won",
  CLOSED_LOST = "Closed-Lost",
}
export const LEAD_STATUS_OPTIONS = Object.values(LeadStatus);

// --- New Lead Form Data Structure ---
export interface LeadContactFormData {
    name: string;
    email: string; 
    phone?: string; 
    address?: string;
    notes?: string;
}

export interface NewLeadFormData {
    contact1: LeadContactFormData;
    addSpouse?: boolean;
    contact2?: LeadContactFormData;
    prospectMatterName: string;
    responsibleAttorneyId?: string;
    potentialServices?: string; 
    referredBy?: string; // Added this line
}
// --- End New Lead Form Data Structure ---

// --- Template Management Types ---
export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  fileName?: string; // Name of the uploaded file
  dateAdded: string;
  firmId: string;
}

export interface DocumentTemplateFormData {
  name: string;
  category: string;
  templateFile?: FileList; // For file input
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyPreview: string; // A short preview of the body
  dateAdded: string;
  firmId: string;
}
// --- End Template Management Types ---

export type PageData = Contact | Matter | Task | Document | Asset | { filterByMatter?: string } | { matter: Matter, updateMatterDetails: (matterId: string, newDetails: Partial<Matter>) => void } | null;
