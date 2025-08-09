
import type { Contact, Matter, Appointment, Task, Document, Asset, KeyParty, Note, ContactStatus, TimeEntry, LawFirm, Announcement, Activity, Reminder, User, FirmUserRole, ClientToDoItem, GroupCalendar, CommunicationLogItem, CommunicationTypes, CommunicationDirections, EmailEntry, PhoneEntry, IntakeFormStatus, DocumentTemplate, EmailTemplate } from './types';
import { MATTER_TYPES, ContactCategory as CCEnum, CONTACT_STATUSES, AssetCategory, COMMUNICATION_TYPES_ARRAY, COMMUNICATION_DIRECTIONS_ARRAY } from './types'; 
import { formatISO, startOfDay, addHours, setHours } from 'date-fns';

export const MOCK_LAW_FIRMS_DATA: LawFirm[] = [
  { 
    id: 'firm1', 
    name: 'Briefcase Demo Firm LLP',
    address: '123 Law Lane, Suite 400\\nLegal City, LS 54321',
    phone: '(555) 123-4567',
    website: 'https://www.examplefirm.com',
    logoUrl: 'https://placehold.co/300x100.png?text=Firm+Logo'
  },
  { id: 'firm2', name: 'Future Growth Legal Services' },
];

const DEFAULT_FIRM_ID = 'firm1'; 
const TODAY_ISO_DATE = formatISO(startOfDay(new Date()), { representation: 'date' });


export const MOCK_CONTACTS_DATA: Contact[] = [
    { 
      id: 1, 
      name: 'John Smith', 
      emails: [{ address: 'john@example.com', isPrimary: true, type: 'Work' }, {address: 'jsmith_home@example.com', isPrimary:false, type: 'Home'}], 
      category: CCEnum.CLIENT, 
      status: 'Active', 
      lastActivity: '2025-05-09', 
      dob: '1975-03-15', 
      phones: [{ number: '555-1234', isPrimary: true, type: 'Mobile' }], 
      address: '123 Main St, Anytown, USA', 
      mailingAddress: 'PO Box 100, Anytown, USA',
      company: '', 
      notes: 'Primary client for Smith Family Trust.', 
      referredBy: 'Sarah Miller (WealthPlan)',
      relatedContactIds: [3], 
      firmId: DEFAULT_FIRM_ID, 
      outstandingBalance: 1250.75, 
      trustAccountBalance: 5000.00 
    },
    { 
      id: 2, 
      name: 'Jane Doe', 
      emails: [{ address: 'client@example.com', isPrimary: true, type: 'Personal' }], 
      category: CCEnum.CLIENT, 
      status: 'Prospect', 
      lastActivity: '2025-05-01', 
      dob: '1980-11-20', 
      phones: [{ number: '555-5678', isPrimary: true, type: 'Work' }, {number: '555-8765', isPrimary: false, type: 'Home'}], 
      address: '456 Oak Ave, Otherville, USA', 
      company: 'Doe Innovations', 
      notes: 'Interested in estate planning.', 
      relatedContactIds: ['fa1'], 
      firmId: DEFAULT_FIRM_ID, 
      outstandingBalance: 0, 
      trustAccountBalance: 1500.00 
    },
    { 
      id: 3, 
      name: 'Alice Brown', 
      emails: [{ address: 'alice@example.com', isPrimary: true, type: 'Home'}], 
      category: CCEnum.CLIENT, 
      status: 'Active', 
      lastActivity: '2025-04-15', 
      dob: '1978-07-01', 
      phones: [{ number: '555-9012', isPrimary: true, type: 'Mobile' }], 
      address: '789 Pine Rd, Anytown, USA', 
      company: '', 
      notes: 'Co-client with John Smith.', 
      relatedContactIds: [1], 
      firmId: DEFAULT_FIRM_ID, 
      outstandingBalance: 1250.75, 
      trustAccountBalance: 5000.00 
    },
    { 
      id: 4, 
      name: 'Bob Green', 
      emails: [{ address: 'bob@example.com', isPrimary: true, type: 'Business' }], 
      category: CCEnum.CLIENT, 
      status: 'Inactive', 
      lastActivity: '2024-12-01', 
      phones: [{ number: '555-3456', isPrimary: true, type: 'Work' }], 
      address: '101 Maple Dr, Yetiville, USA', 
      company: 'Green Gardens', 
      notes: 'Previous will drafting client.', 
      firmId: DEFAULT_FIRM_ID, 
      outstandingBalance: 200.00, 
      trustAccountBalance: 0 
    },
    { 
      id: 5, 
      name: 'Charlie White', 
      emails: [{ address: 'charlie@example.com', isPrimary: true, type: 'Personal' }], 
      category: CCEnum.CLIENT, 
      status: 'Prospect', 
      lastActivity: '2025-05-08', 
      phones: [{ number: '555-7890', isPrimary: true, type: 'Mobile' }], 
      address: '222 Birch Ln, Someplace, USA', 
      company: 'White Consulting', 
      notes: 'New inquiry.', 
      referredBy: 'Networking Event',
      firmId: DEFAULT_FIRM_ID 
    },
    { 
      id: 'fa1', 
      name: 'Sarah Miller (WealthPlan)', 
      emails: [{ address: 'sarah.miller@wealthplan.com', isPrimary: true, type: 'Work' }], 
      category: CCEnum.FINANCIAL_ADVISOR, 
      status: CONTACT_STATUSES[5], 
      lastActivity: '2025-05-02', 
      phones: [{ number: '555-1001', isPrimary: true, type: 'Work Mobile' }], 
      company: 'WealthPlan Partners', 
      address: 'Financial District Plaza', 
      notes: 'Refers HNW clients.', 
      relatedContactIds: [2], 
      firmId: DEFAULT_FIRM_ID 
    },
    { 
      id: 'fa2', 
      name: 'Michael Chen (Advisor)', 
      emails: [{ address: 'm.chen@advisors.com', isPrimary: true, type: 'Work' }], 
      category: CCEnum.FINANCIAL_ADVISOR, 
      status: 'Active', 
      lastActivity: '2025-04-28', 
      phones: [{ number: '555-1002', isPrimary: true, type: 'Office' }], 
      company: 'Chen Financial', 
      address: 'Tech Park Dr', 
      notes: 'Advisor for Doe family.', 
      firmId: DEFAULT_FIRM_ID
    },
    { 
      id: 'cpa1', 
      name: 'David Lee', 
      emails: [{ address: 'david.lee@taxpros.cpa', isPrimary: true, type: 'Work' }], 
      category: CCEnum.CPA, 
      status: 'Vendor', 
      lastActivity: '2025-04-20', 
      phones: [{ number: '555-2002', isPrimary: true, type: 'Office' }], 
      company: 'TaxPros Associates', 
      address: 'Commerce Tower', 
      notes: 'Handles tax for several mutual clients.', 
      firmId: DEFAULT_FIRM_ID 
    },
    { 
      id: 'oa1', 
      name: 'Emily Carter', 
      emails: [{ address: 'ecarter@lawfirm.com', isPrimary: true, type: 'Work' }], 
      category: CCEnum.OTHER_ATTORNEY, 
      status: 'Active', 
      lastActivity: '2025-03-10', 
      phones: [{ number: '555-3003', isPrimary: true, type: 'Direct Line' }], 
      company: 'Carter & Associates (Family Law)', 
      address: 'Legal Chambers Bldg', 
      notes: 'Co-counsel on Doe divorce, referred for EP.', 
      firmId: DEFAULT_FIRM_ID 
    },
    { 
      id: 'gc1', 
      name: 'Tom Baker', 
      emails: [{ address: 'tom.baker@email.net', isPrimary: true, type: 'Personal' }], 
      category: CCEnum.GENERAL_CONTACT, 
      status: 'New', 
      lastActivity: '2025-05-11', 
      phones: [{ number: '555-4004', isPrimary: true, type: 'Home' }], 
      company: 'Baker\'s Bakery', 
      address: 'Old Town Road', 
      notes: 'Met at networking event.', 
      firmId: DEFAULT_FIRM_ID 
    }
];

export const MOCK_FIRM_USERS_DATA: User[] = [
    { id: 'attorney@example.com', name: 'Demo Attorney', email: 'attorney@example.com', type: 'firmUser', firmId: DEFAULT_FIRM_ID, firmRole: 'Admin' },
    { id: 'paralegal@example.com', name: 'Para Legal', email: 'paralegal@example.com', type: 'firmUser', firmId: DEFAULT_FIRM_ID, firmRole: 'Paralegal' },
    { id: 'staff@example.com', name: 'Support Staff', email: 'staff@example.com', type: 'firmUser', firmId: DEFAULT_FIRM_ID, firmRole: 'Staff' },
    { id: 'attorney2@example.com', name: 'Associate Attorney', email: 'attorney2@example.com', type: 'firmUser', firmId: DEFAULT_FIRM_ID, firmRole: 'Attorney' },
    { id: 'fg_admin@example.com', name: 'FG Admin User', email: 'fg_admin@example.com', type: 'firmUser', firmId: 'firm2', firmRole: 'Admin' },
];

export const MOCK_GROUP_CALENDARS_DATA: GroupCalendar[] = [
  { id: 'group_court_firm1', name: 'Court Deadlines', firmId: 'firm1' },
  { id: 'group_holidays_firm1', name: 'Office Holidays', firmId: 'firm1' },
  { id: 'group_court_firm2', name: 'Court Deadlines', firmId: 'firm2' },
];


export const MOCK_MATTERS_DATA: Matter[] = [
    { id: 'M001', name: 'Smith Family Trust 2025', clientIds: [1, 3], status: 'Open', type: MATTER_TYPES.ESTATE_PLANNING, firmId: DEFAULT_FIRM_ID, responsibleAttorneyId: 'attorney@example.com', openDate: '2025-01-15' },
    { id: 'M002', name: 'Doe Real Estate Closing', clientIds: [2], status: 'Closed', type: MATTER_TYPES.PROBATE, firmId: DEFAULT_FIRM_ID, responsibleAttorneyId: 'attorney2@example.com', openDate: '2024-11-01', closeDate: '2025-03-10' },
    { id: 'M003', name: 'Brown Guardianship', clientIds: [3], status: 'Open', type: MATTER_TYPES.OTHER, firmId: DEFAULT_FIRM_ID, responsibleAttorneyId: 'attorney@example.com', openDate: '2025-02-20' },
    { id: 'M004', name: 'Green Will Drafting', clientIds: [4], status: 'Pending', type: MATTER_TYPES.ESTATE_PLANNING, firmId: DEFAULT_FIRM_ID, responsibleAttorneyId: 'paralegal@example.com', openDate: '2025-03-01' },
    { id: 'M005', name: 'Charlie White Inquiry', clientIds: [5], status: 'Lead', type: MATTER_TYPES.PROSPECT, firmId: DEFAULT_FIRM_ID, responsibleAttorneyId: 'staff@example.com', openDate: '2025-05-08', intakeFormStatus: 'Not Sent' },
    { id: 'M006', name: 'Future Growth EP Demo', clientIds: [], status: 'Open', type: MATTER_TYPES.ESTATE_PLANNING, firmId: 'firm2', responsibleAttorneyId: 'fg_admin@example.com', openDate: '2025-04-10' },
    { id: 'M007', name: 'Davis Trust Admin', clientIds: [1], status: 'Open', type: MATTER_TYPES.TRUST_ADMINISTRATION, firmId: DEFAULT_FIRM_ID, responsibleAttorneyId: 'attorney@example.com', openDate: '2025-06-01' },
];

export const MOCK_APPOINTMENTS_DATA: Appointment[] = [
    { id: 'appt1', title: 'Consultation with John Smith', date: '2025-07-15', time: '10:00 AM', type: 'Consultation', clientId: 1, matterId: 'M001', notes: 'Discuss initial estate plan.', firmId: DEFAULT_FIRM_ID, ownerIds: ['attorney@example.com'] },
    { id: 'appt2', title: 'Document Signing - Jane Doe', date: '2025-07-22', time: '02:00 PM', type: 'Signing', clientId: 2, matterId: 'M002', notes: 'Will and POA signing.', firmId: DEFAULT_FIRM_ID, ownerIds: ['attorney@example.com'] },
    { id: 'appt3', title: 'Review Meeting - Alice Brown', date: '2025-08-05', time: '11:00 AM', type: 'Review', clientId: 3, matterId: 'M001', notes: 'Review trust funding.', firmId: DEFAULT_FIRM_ID, ownerIds: ['paralegal@example.com'] },
    { id: 'appt4', title: 'Follow-up Call - Bob Green', date: '2025-07-18', time: '03:30 PM', type: 'Call', clientId: 4, matterId: 'M004', notes: 'Check on questionnaire.', firmId: DEFAULT_FIRM_ID, ownerIds: ['attorney@example.com'] },
    { id: 'appt5', title: 'Initial Call - Charlie White', date: '2025-07-12', time: '09:00 AM', type: 'Prospect Call', clientId: 5, matterId: 'M005', notes: 'Initial inquiry about services.', firmId: DEFAULT_FIRM_ID, ownerIds: ['staff@example.com'] },
    { id: 'appt6', title: 'Court Hearing - Smith Case', date: '2025-08-20', time: '09:30 AM', type: 'Court Appearance', matterId: 'M001', notes: 'Motion hearing.', firmId: DEFAULT_FIRM_ID, ownerIds: ['group_court_firm1', 'attorney@example.com'] },
    { id: 'appt7', title: 'Office Closed - Labor Day', date: '2025-09-01', time: 'All Day', type: 'Holiday', firmId: DEFAULT_FIRM_ID, ownerIds: ['group_holidays_firm1'] },
    { id: 'appt_today1', title: 'Daily Standup', date: TODAY_ISO_DATE, time: '09:00 AM', type: 'Internal Meeting', firmId: DEFAULT_FIRM_ID, ownerIds: ['attorney@example.com', 'paralegal@example.com'], notes: 'Quick team sync.' },
    { id: 'appt_today2', title: 'Client Call: Smith Funding Qs', date: TODAY_ISO_DATE, time: '11:30 AM', type: 'Client Call', clientId: 1, matterId: 'M001', firmId: DEFAULT_FIRM_ID, ownerIds: ['attorney@example.com'], notes: 'John Smith has questions about asset funding.'},
    { id: 'appt_today3', title: 'Lunch & Learn: New Tax Laws', date: TODAY_ISO_DATE, time: '12:30 PM', type: 'Training', firmId: DEFAULT_FIRM_ID, ownerIds: ['attorney@example.com', 'attorney2@example.com', 'paralegal@example.com'], notes: 'Firm-wide training session.'},
];

export const MOCK_TASKS_DATA: Task[] = [
    { id: 'task1', title: "Draft Will for John Smith", dueDate: "2025-07-15", status: "In Progress", client: "John Smith", clientId: 1, assignedUserIds: ['attorney@example.com'], assignedToDisplay: "Demo Attorney", matterId: "M001", description: "Initial draft of last will and testament.", firmId: DEFAULT_FIRM_ID },
    { id: 'task2', title: "Review Trust Documents for Jane Doe", dueDate: "2025-07-22", status: "Pending", client: "Jane Doe", clientId: 2, assignedUserIds: ['attorney2@example.com'], assignedToDisplay: "Associate Attorney", matterId: "M002", description: "Review submitted trust documents for accuracy.", firmId: DEFAULT_FIRM_ID },
    { id: 'task3', title: "Finalize Will Execution for Green", dueDate: "2025-08-15", status: "To Do", client: "Bob Green", clientId: 4, assignedUserIds: ['attorney@example.com'], assignedToDisplay: "Demo Attorney", matterId: "M004", description: "Prepare for and conduct will execution ceremony.", firmId: DEFAULT_FIRM_ID },
    { id: 'task4', title: "Prepare demo docs for Future Growth", dueDate: "2025-08-01", status: "To Do", client: "Internal", assignedUserIds: ['fg_admin@example.com'], assignedToDisplay: "FG Admin User", matterId: "M006", description: "Demo estate plan.", firmId: "firm2" },
    { id: 'task5', title: "File Court Document - Smith Case", dueDate: "2025-08-18", status: "Pending", client: "John Smith", clientId: 1, matterId: "M001", assignedUserIds: ['paralegal@example.com'], assignedToDisplay: "Para Legal", firmId: DEFAULT_FIRM_ID },
    { id: 'task_today1', title: "Send Follow-up Email to C. White", dueDate: TODAY_ISO_DATE, status: "To Do", client: "Charlie White", clientId: 5, matterId: "M005", assignedUserIds: ['staff@example.com'], assignedToDisplay: "Support Staff", description: "Follow up after initial inquiry.", firmId: DEFAULT_FIRM_ID },
    { id: 'task_today2', title: "Prepare for Smith Signing Ceremony", dueDate: TODAY_ISO_DATE, status: "In Progress", client: "John Smith", clientId: 1, matterId: "M001", assignedUserIds: ['attorney@example.com'], assignedToDisplay: "Demo Attorney", description: "Gather all necessary documents and witness list.", firmId: DEFAULT_FIRM_ID },
];

export const MOCK_CLIENT_TODO_DATA: ClientToDoItem[] = [
  { id: 'todo1', matterId: 'M001', firmId: DEFAULT_FIRM_ID, title: 'Locate deeds for all real property', description: 'Gather copies of deeds for Main Residence and any other owned real estate.', isCompleted: false, dateAdded: '2025-07-01', addedByAttorneyName: 'Demo Attorney' },
  { id: 'todo2', matterId: 'M001', firmId: DEFAULT_FIRM_ID, title: 'Provide statements for all bank accounts', description: 'Submit recent statements for checking, savings, and money market accounts.', isCompleted: true, dateAdded: '2025-07-01', dateCompleted: '2025-07-05', addedByAttorneyName: 'Demo Attorney' },
  { id: 'todo3', matterId: 'M002', firmId: DEFAULT_FIRM_ID, title: 'Gather original Will of deceased', isCompleted: false, dateAdded: '2025-07-10', addedByAttorneyName: 'Demo Attorney' },
  { id: 'todo4', matterId: 'M006', firmId: 'firm2', title: 'Complete initial client questionnaire', description: 'Fill out the online intake form.', isCompleted: false, dateAdded: '2025-08-01', addedByAttorneyName: 'FG Admin User' },
];

export const MOCK_DOCUMENTS_DATA: Document[] = [
    { id: 'doc1', name: "Smith Will_v1.docx", client: "John Smith", clientId: 1, matterId: "M001", dateUploaded: "2025-07-01", size: "1.2MB", type: "Will", folderPath: "Drafts", firmId: DEFAULT_FIRM_ID },
    { id: 'doc2', name: "Doe Trust_final.pdf", client: "Jane Doe", clientId: 2, matterId: "M002", dateUploaded: "2025-06-20", size: "800KB", type: "Trust", folderPath: "Executed Documents", firmId: DEFAULT_FIRM_ID },
    { id: 'doc3', name: "Green RLT Draft.docx", client: "Bob Green", clientId: 4, matterId: "M004", dateUploaded: "2025-07-10", size: "1.3MB", type: "Trust Agreement", folderPath: "Drafts/Client Review", firmId: DEFAULT_FIRM_ID },
    { id: 'doc4', name: 'Client_Intake_Form_Smith.pdf', matterId: 'M001', type: 'Intake', dateUploaded: '2025-07-01', size: '300KB', client: "John Smith", clientId: 1, firmId: DEFAULT_FIRM_ID },
    { id: 'doc5', name: 'Smith Trust Funding Letter.docx', matterId: 'M001', type: 'Correspondence', dateUploaded: '2025-07-15', size: '150KB', client: "John Smith", clientId: 1, folderPath: "Correspondence/Client", firmId: DEFAULT_FIRM_ID },
    { id: 'doc6', name: 'Smith Deed_Main_Residence.pdf', matterId: 'M001', type: 'Deed', dateUploaded: '2025-08-01', size: '450KB', client: "John Smith", clientId: 1, folderPath: "Property Records/Real Estate", firmId: DEFAULT_FIRM_ID },
    { id: 'doc7', name: 'Future Growth Demo Will.pdf', matterId: 'M006', type: 'Will', dateUploaded: '2025-08-02', size: '600KB', firmId: 'firm2', folderPath: "Templates" },
];

export const MOCK_CLIENT_DOCUMENTS_DATA: Document[] = [
    { id: 'cdoc1', name: "My Will_final.pdf", dateShared: "2025-07-02", size: "750KB", type: "Will", clientId: 1, firmId: DEFAULT_FIRM_ID }, // John Smith
    { id: 'cdoc2', name: "Power of Attorney.pdf", dateShared: "2025-07-02", size: "300KB", type: "Power of Attorney", clientId: 1, firmId: DEFAULT_FIRM_ID }, // John Smith
];


export const MOCK_ASSETS_DATA: Asset[] = [
    { id: 'asset1', name: 'Main Residence (123 Oak St)', category: AssetCategory.REAL_ESTATE, matterId: 'M001', value: '$750,000', status: 'Not Funded', currentOwner: 'John Smith and Alice Brown, JTWROS', notes: 'Needs to be deeded into trust.', deedOnFile: false, firmId: DEFAULT_FIRM_ID },
    { id: 'asset2', name: 'Chase Checking Account (...1234)', category: AssetCategory.BANK_ACCOUNTS, matterId: 'M001', value: '$50,000', status: 'Funded', currentOwner: 'Smith Family Trust', notes: 'Retitled on 07/10/2025.', firmId: DEFAULT_FIRM_ID },
    { id: 'asset3', name: 'Vacation Home (789 Pine Rd)', category: AssetCategory.REAL_ESTATE, matterId: 'M004', value: '$350,000', status: 'To Be Titled', currentOwner: 'Bob Green, Individual', deedOnFile: true, firmId: DEFAULT_FIRM_ID },
    { id: 'asset4', name: 'Vanguard Brokerage (...5678)', category: AssetCategory.INVESTMENT_ACCOUNTS, matterId: 'M001', value: '$250,000', status: 'Pending Titling', currentOwner: 'John Smith, Individual', notes: 'Change of ownership forms submitted.', financialAdvisorId: 'fa1', firmId: DEFAULT_FIRM_ID },
    { id: 'asset5', name: 'IRA - John Smith (...7890)', category: AssetCategory.RETIREMENT_ACCOUNTS, matterId: 'M001', value: '$450,000', status: 'N/A', currentOwner: 'John Smith, Individual', notes: 'Beneficiary designation to be updated to trust.', financialAdvisorId: 'fa1', primaryBeneficiaries: 'Alice Brown (Spouse)', secondaryBeneficiaries: 'Smith Family Trust', firmId: DEFAULT_FIRM_ID },
    { id: 'asset6', name: 'Antique Furniture Collection', category: AssetCategory.PERSONAL_PROPERTY, matterId: 'M001', value: '$25,000', status: 'Not Funded', currentOwner: 'Alice Brown, Individual', firmId: DEFAULT_FIRM_ID },
    { id: 'asset7', name: 'Smith Consulting LLC', category: AssetCategory.BUSINESS_INTERESTS, matterId: 'M001', value: '$1,200,000', status: 'Pending Titling', currentOwner: 'John Smith, Sole Proprietor', notes: 'Assignment of interest needs to be prepared.', businessType: 'LLC', businessTypeOther: '', operatingDocumentsOnFile: false, firmId: DEFAULT_FIRM_ID },
    { id: 'asset8', name: 'Prudential Life Insurance Policy', category: AssetCategory.LIFE_INSURANCE, matterId: 'M001', value: '$500,000 (Death Benefit)', status: 'N/A', currentOwner: 'John Smith (Insured), Alice Brown (Owner)', notes: 'Beneficiary is Alice Brown, then Smith Family Trust - for benefit of children.', primaryBeneficiaries: 'Alice Brown (Spouse)', secondaryBeneficiaries: 'Smith Family Trust', firmId: DEFAULT_FIRM_ID},
    { id: 'asset9', name: 'MetLife Annuity', category: AssetCategory.ANNUITIES, matterId: 'M001', value: '$300,000', status: 'N/A', currentOwner: 'John Smith', notes: 'Review beneficiary designations.', primaryBeneficiaries: 'Alice Brown', secondaryBeneficiaries: 'Children, per stirpes', firmId: DEFAULT_FIRM_ID},
    { id: 'asset10', name: 'Future Growth Demo Asset', category: AssetCategory.BANK_ACCOUNTS, matterId: 'M006', value: '$100,000', status: 'Funded', currentOwner: 'FG Demo Trust', firmId: 'firm2' },
];

export const MOCK_TIME_ENTRIES_DATA: TimeEntry[] = [
  {
    id: 'te001',
    date: '2025-07-10',
    durationMinutes: 60, 
    description: 'Initial consultation call with John Smith re: Smith Family Trust.',
    clientId: 1,
    clientName: 'John Smith',
    matterId: 'M001',
    matterName: 'Smith Family Trust 2025',
    attorneyId: 'attorney@example.com', 
    attorneyName: 'Demo Attorney',
    isBillable: true,
    isInvoiced: false,
    firmId: DEFAULT_FIRM_ID,
  },
  {
    id: 'te002',
    date: '2025-07-11',
    durationMinutes: 120, 
    description: 'Drafting of initial RLT documents for Smith Family Trust.',
    clientId: 1,
    clientName: 'John Smith',
    matterId: 'M001',
    matterName: 'Smith Family Trust 2025',
    attorneyId: 'attorney@example.com',
    attorneyName: 'Demo Attorney',
    isBillable: true,
    isInvoiced: false,
    firmId: DEFAULT_FIRM_ID,
  },
  {
    id: 'te003',
    date: '2025-07-12',
    durationMinutes: 30, 
    description: 'Phone call with Jane Doe regarding probate process.',
    clientId: 2,
    clientName: 'Jane Doe',
    matterId: 'M002',
    matterName: 'Doe Real Estate Closing',
    attorneyId: 'attorney@example.com',
    attorneyName: 'Demo Attorney',
    isBillable: true,
    isInvoiced: true,
    firmId: DEFAULT_FIRM_ID,
  },
];

export const MOCK_COMMUNICATION_LOGS_DATA: CommunicationLogItem[] = [
    {
        id: 'comm1',
        firmId: DEFAULT_FIRM_ID,
        matterId: 'M001',
        clientId: 1,
        dateTime: '2025-07-10T10:00:00Z',
        type: COMMUNICATION_TYPES_ARRAY[0], 
        direction: COMMUNICATION_DIRECTIONS_ARRAY[1], 
        subject: 'Initial Consultation Follow-up',
        details: 'Discussed next steps for estate plan creation with John Smith.',
        participants: 'Demo Attorney, John Smith',
        durationMinutes: 30,
        isClientVisible: false,
        loggedByUserId: 'attorney@example.com',
        loggedByName: 'Demo Attorney',
        clientName: 'John Smith',
        matterName: 'Smith Family Trust 2025',
        isRead: true,
        snippet: 'Discussed next steps...'
    },
    {
        id: 'comm2',
        firmId: DEFAULT_FIRM_ID,
        matterId: 'M001',
        clientId: 3,
        dateTime: '2025-07-11T14:30:00Z',
        type: COMMUNICATION_TYPES_ARRAY[1], 
        direction: COMMUNICATION_DIRECTIONS_ARRAY[1], 
        subject: 'Draft Trust Documents for Review',
        details: 'Sent draft RLT documents to Alice Brown for review. Attached: Smith_RLT_Draft_v1.pdf',
        participants: 'Demo Attorney, Alice Brown',
        isClientVisible: true, 
        loggedByUserId: 'attorney@example.com',
        loggedByName: 'Demo Attorney',
        clientName: 'Alice Brown',
        matterName: 'Smith Family Trust 2025',
        isRead: false,
        snippet: 'Sent draft RLT documents to Alice Brown...'
    },
     {
        id: 'comm3',
        firmId: DEFAULT_FIRM_ID,
        matterId: 'M002',
        clientId: 2,
        dateTime: '2025-07-12T11:00:00Z',
        type: COMMUNICATION_TYPES_ARRAY[2], 
        direction: COMMUNICATION_DIRECTIONS_ARRAY[0], 
        subject: 'Meeting with Jane Doe re: Probate',
        details: 'Met with Jane Doe at the office to discuss probate process timeline and required documents.',
        participants: 'Demo Attorney, Jane Doe',
        durationMinutes: 60,
        isClientVisible: false,
        loggedByUserId: 'attorney@example.com',
        loggedByName: 'Demo Attorney',
        clientName: 'Jane Doe',
        matterName: 'Doe Real Estate Closing',
        isRead: true,
        snippet: 'Met with Jane Doe at the office...'
    },
    {
        id: 'comm4',
        firmId: DEFAULT_FIRM_ID,
        clientId: 1, 
        matterId: 'M001',
        dateTime: '2025-07-13T09:15:00Z',
        type: COMMUNICATION_TYPES_ARRAY[3], 
        direction: COMMUNICATION_DIRECTIONS_ARRAY[0], 
        subject: 'Question about Asset Funding',
        details: 'John Smith sent a message through the client portal asking about how to title his brokerage account into the trust.',
        participants: 'John Smith',
        isClientVisible: true, 
        loggedByUserId: 'client_portal_system', 
        loggedByName: 'Client Portal',
        clientName: 'John Smith',
        matterName: 'Smith Family Trust 2025',
        isRead: false,
        snippet: 'Client portal message: How to title brokerage account?'
    },
];


export const MOCK_ANNOUNCEMENTS_DATA: Announcement[] = [
  { id: 'ann1', title: 'Important: Software Update Scheduled', text: 'A new software update is scheduled for next Tuesday evening. Key features include improved document versioning and a faster client portal.', date: '2025-08-10', firmId: DEFAULT_FIRM_ID },
  { id: 'ann2', title: 'Office Holiday Closure Notice (Firm 1)', text: 'Our office will be closed on Monday, September 1st for Labor Day.', date: '2025-08-01', firmId: DEFAULT_FIRM_ID },
  { id: 'ann3', title: 'New CLE Training Available (All Firms)', text: 'A new Continuing Legal Education course on Advanced Trust Strategies is now available on the firm portal.', date: '2025-07-28' }, 
  { id: 'ann4', title: 'Welcome Future Growth Legal!', text: 'Welcome to Briefcase! We are excited to have you.', date: '2025-07-25', firmId: 'firm2' },
];

export const MOCK_RECENT_ACTIVITY_DATA: Activity[] = [
  { id: 'act1', text: 'John Smith - Profile Updated (Contact Info)', time: '2h ago', type: 'Client Update', link: '/attorney/contacts/1', firmId: DEFAULT_FIRM_ID },
  { id: 'act2', text: 'Jane Doe - Document "Will_v2.pdf" Signed', time: '5h ago', type: 'Document Signature', link: '/attorney/documents?matterId=M002', firmId: DEFAULT_FIRM_ID },
  { id: 'act3', text: 'New Matter "Alpha Corp Trust" created for Client Gamma', time: 'Yesterday', type: 'Matter Creation', link: '/attorney/matters/MXXX', firmId: DEFAULT_FIRM_ID },
  { id: 'act4', text: 'Task "Review Alpha Corp Deed" completed by Attorney B', time: 'Yesterday', type: 'Task Completion', link: '/attorney/tasks?taskId=taskYYY', firmId: DEFAULT_FIRM_ID },
  { id: 'act5', text: 'Alice Brown - Sent "Funding Reminder" email', time: '2 days ago', type: 'Communication', link: '/attorney/communications?clientId=3', firmId: DEFAULT_FIRM_ID },
  { id: 'act6', text: 'FG Demo Matter - Asset added', time: '1h ago', type: 'Asset Update', link: '/attorney/assets?matterId=M006', firmId: 'firm2' },
];

export const MOCK_REMINDERS_DATA: Reminder[] = [
  { id: 'rem1', text: 'Smith Estate - Annual Review Due', dueDate: 'In 1 week', type: 'Annual Review', matterId: 'M001' }, 
  { id: 'rem2', text: 'Doe Trust - Funding Check-in Call', dueDate: 'In 2 weeks', type: 'Funding Follow-up', matterId: 'M002' }, 
  { id: 'rem3', text: 'Green Will - 3-Year Review Recommended', dueDate: 'Next Month', type: 'Periodic Review', matterId: 'M004' }, 
  { id: 'rem4', text: 'Prospect White - Follow up on Intake', dueDate: 'Tomorrow', type: 'Prospect Follow-up', matterId: 'M005'}, 
  { id: 'rem5', text: 'Future Growth Demo - Send welcome packet', dueDate: 'In 3 days', type: 'Client Onboarding', matterId: 'M006'}, 
];

// --- Template Management Mock Data ---
export const MOCK_DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  { id: 'dtpl1', name: 'Engagement Letter - Estate Planning', category: 'Engagement Letters', fileName: 'EP_Engagement_Letter_v3.docx', dateAdded: '2024-03-15', firmId: DEFAULT_FIRM_ID },
  { id: 'dtpl2', name: 'Simple Will Template', category: 'Estate Planning - Wills', fileName: 'Simple_Will_Template.docx', dateAdded: '2024-01-20', firmId: DEFAULT_FIRM_ID },
  { id: 'dtpl3', name: 'Trustee Acceptance Letter', category: 'Trust Administration', fileName: 'Trustee_Acceptance.pdf', dateAdded: '2024-04-01', firmId: DEFAULT_FIRM_ID },
  { id: 'dtpl4', name: 'General Power of Attorney - Statutory', category: 'Fiduciary Documents', fileName: 'GenPOA_Statutory_OR.docx', dateAdded: '2023-11-10', firmId: DEFAULT_FIRM_ID },
  { id: 'dtpl5', name: 'Advance Health Care Directive - OR', category: 'Fiduciary Documents', fileName: 'AHCD_OR_Template.pdf', dateAdded: '2023-11-10', firmId: DEFAULT_FIRM_ID },
];

export const MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
  { id: 'etpl1', name: 'Initial Consultation Confirmation', subject: 'Confirmation of your Consultation with Briefcase Demo Firm LLP', bodyPreview: 'Dear [Client Name], This email confirms your upcoming consultation...', dateAdded: '2024-02-10', firmId: DEFAULT_FIRM_ID },
  { id: 'etpl2', name: 'Document Review Request', subject: 'Action Required: Please Review Your Draft Documents', bodyPreview: 'Dear [Client Name], Your draft estate planning documents are ready for your review...', dateAdded: '2024-03-01', firmId: DEFAULT_FIRM_ID },
  { id: 'etpl3', name: 'Invoice Attached', subject: 'Invoice [Invoice Number] from Briefcase Demo Firm LLP', bodyPreview: 'Dear [Client Name], Please find attached your recent invoice...', dateAdded: '2024-01-05', firmId: DEFAULT_FIRM_ID },
];
// --- End Template Management Mock Data ---


export const MOCK_KEY_PARTIES_DATA: (matterId: string) => KeyParty[] = (matterId) => {
    const matter = MOCK_MATTERS_DATA.find(m => m.id === matterId);
    if (!matter) return [];
    const clientContacts = matter.clientIds.map(id => MOCK_CONTACTS_DATA.find(c => c.id === id && c.category === CCEnum.CLIENT)?.name || 'Unknown Client').join(' & ');
    return [
        { role: 'Settlor(s)', name: clientContacts },
        { role: 'Successor Trustee', name: 'Alice Brown (Daughter)' },
        { role: 'Beneficiary (Primary)', name: 'Bob Green (Son), Alice Brown (Daughter)' },
    ];
};

export const MOCK_NOTES_DATA: (matterId: string) => Note[] = (matterId) => {
    const matter = MOCK_MATTERS_DATA.find(m => m.id === matterId);
    if (!matter) return [];

    if (matterId === 'M001') {
        return [
            { id: 'note_m001_1', date: "2025-07-05", note: "Initial consultation held. Client wishes to proceed with full estate plan." },
            { id: 'note_m001_2', date: "2025-07-10", note: "Draft of RLT sent to client for review." }
        ];
    }
    if (matterId === 'M005') {
        return [
            { id: 'note_m005_1', date: "2025-07-09", note: "Initial call. Sent intake form. Scheduled follow-up for next week." },
            { id: 'note_m005_2', date: "2025-07-12", note: "Follow-up call. Client has questions about trust funding." }
        ];
    }
    if (matterId === 'M006') {
        return [
            { id: 'note_m006_1', date: "2025-08-01", note: "Kick-off meeting for Future Growth demo project."}
        ];
    }
    return [];
};

export const getContactNameById = (contactId: string | number | undefined): string | undefined => {
    if (contactId === undefined) return undefined;
    const contact = MOCK_CONTACTS_DATA.find(c => c.id.toString() === contactId.toString());
    return contact ? contact.name : undefined;
};

export const getFirmUserNameById = (userId?: string): string | undefined => {
    if (!userId) return undefined;
    const user = MOCK_FIRM_USERS_DATA.find(u => u.id === userId);
    return user ? user.name : undefined;
};


export const getMatterNameById = (matterId: string | undefined): string | undefined => {
    if (matterId === undefined) return undefined;
    const matter = MOCK_MATTERS_DATA.find(m => m.id === matterId);
    return matter ? matter.name : undefined;
}

export const getCurrentUserMockClient = (userId?: string): Contact | undefined => {
  if (!userId) return undefined;
  // For clients, user.id is their email.
  return MOCK_CONTACTS_DATA.find(c => c.emails.some(email => email.address === userId) && c.category === CCEnum.CLIENT);
};

