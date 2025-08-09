
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DollarSign, Info, AlertTriangle, PlusCircle, Edit2, Trash2, Landmark, Building, Briefcase, Home, Gift, Package, FileText, LifeBuoy, Coins, ShieldCheck, Banknote, Box, FileQuestion, UserCheck, Hash } from 'lucide-react';
import { MOCK_ASSETS_DATA, MOCK_MATTERS_DATA, getMatterNameById, MOCK_CONTACTS_DATA, getContactNameById } from '@/lib/mock-data';
import type { Asset, Matter, AssetCategory as AssetCategoryEnum, AddAssetsFormData, AssetFormDataItem, BusinessType as BusinessTypeEnum, ContactCategory as ContactCategoryEnum, FirmUserRole } from '@/lib/types';
import { ASSET_CATEGORIES, AssetCategory, BUSINESS_TYPES, BusinessType, ASSET_STATUS_OPTIONS, ContactCategory } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { MatterActionRibbon } from '@/components/layout/matter-action-ribbon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from '@/contexts/AuthContext';

const NO_ADVISOR_SELECTED_VALUE = "[NO_ADVISOR_SELECTED]";
const CATEGORIES_WITH_ACCOUNT_NUMBER: AssetCategoryEnum[] = [
    AssetCategory.BANK_ACCOUNTS,
    AssetCategory.INVESTMENT_ACCOUNTS,
    AssetCategory.RETIREMENT_ACCOUNTS,
    AssetCategory.LIFE_INSURANCE,
    AssetCategory.ANNUITIES,
];

const assetFormItemSchema = z.object({
  name: z.string().min(1, "Asset name is required."),
  category: z.nativeEnum(AssetCategory, { errorMap: () => ({ message: "Category is required."}) }),
  value: z.string().min(1, "Value is required."),
  currentOwner: z.string().min(1, "Current owner is required."),
  accountNumber: z.string().optional(),
  status: z.enum(["Not Funded", "Funded", "To Be Titled", "Pending Titling", "N/A", "Unknown"]),
  notes: z.string().optional(),
  // Category-specific fields
  businessType: z.string().optional(),
  businessTypeOther: z.string().optional(),
  deedOnFile: z.boolean().optional(),
  financialAdvisorId: z.string().optional(),
  operatingDocumentsOnFile: z.boolean().optional(),
  primaryBeneficiaries: z.string().optional(),
  secondaryBeneficiaries: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.category === AssetCategory.BUSINESS_INTERESTS && !data.businessType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Business type is required for Business Interests.",
      path: ["businessType"],
    });
  }
  if (data.category === AssetCategory.BUSINESS_INTERESTS && data.businessType === 'Other' && !data.businessTypeOther?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify other business type.",
      path: ["businessTypeOther"],
    });
  }
});

const addAssetsFormSchema = z.object({
  assets: z.array(assetFormItemSchema).min(1, "Please add at least one asset."),
});

const canManageAsset = (role?: FirmUserRole) => ['Admin', 'Attorney', 'Paralegal'].includes(role || '');

const getCategoryIcon = (category: AssetCategoryEnum) => {
    switch (category) {
        case AssetCategory.REAL_ESTATE: return <Home className="h-4 w-4 text-muted-foreground" />;
        case AssetCategory.BANK_ACCOUNTS: return <Landmark className="h-4 w-4 text-muted-foreground" />;
        case AssetCategory.INVESTMENT_ACCOUNTS: return <DollarSign className="h-4 w-4 text-muted-foreground" />;
        case AssetCategory.RETIREMENT_ACCOUNTS: return <Briefcase className="h-4 w-4 text-muted-foreground" />;
        case AssetCategory.LIFE_INSURANCE: return <LifeBuoy className="h-4 w-4 text-muted-foreground" />;
        case AssetCategory.PERSONAL_PROPERTY: return <Gift className="h-4 w-4 text-muted-foreground" />;
        case AssetCategory.BUSINESS_INTERESTS: return <Building className="h-4 w-4 text-muted-foreground" />;
        case AssetCategory.BONDS: return <FileText className="h-4 w-4 text-muted-foreground" />;
        case AssetCategory.CERTIFICATES_OF_DEPOSIT: return <Coins className="h-4 w-4 text-muted-foreground" />;
        case AssetCategory.CHARITABLE_ACCOUNTS: return <ShieldCheck className="h-4 w-4 text-muted-foreground" />;
        case AssetCategory.HEALTH_SAVINGS_ACCOUNTS: return <Banknote className="h-4 w-4 text-muted-foreground" />;
        case AssetCategory.MONEY_MARKET_ACCOUNTS: return <DollarSign className="h-4 w-4 text-muted-foreground" />; 
        case AssetCategory.SAFE_DEPOSIT_BOXES: return <Box className="h-4 w-4 text-muted-foreground" />;
        case AssetCategory.ANNUITIES: return <UserCheck className="h-4 w-4 text-muted-foreground" />; 
        default: return <Package className="h-4 w-4 text-muted-foreground" />;
    }
};

export default function AssetTrackingPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const currentPathname = usePathname();
  const filterByMatterId = searchParams.get('matterId');
  const firmId = user?.firmId;
  
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [currentMatter, setCurrentMatter] = useState<Matter | null>(null);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);

  const financialAdvisorContacts = useMemo(() => 
    MOCK_CONTACTS_DATA.filter(c => c.category === ContactCategory.FINANCIAL_ADVISOR as ContactCategoryEnum && c.firmId === firmId)
  , [firmId]);

  const addAssetsForm = useForm<AddAssetsFormData>({
    resolver: zodResolver(addAssetsFormSchema),
    defaultValues: {
      assets: [{ 
        name: '', category: "" as AssetCategoryEnum, value: '', currentOwner: '', accountNumber: '', status: "Not Funded", notes: '', 
        businessType: "" as BusinessTypeEnum, businessTypeOther: '',
        deedOnFile: false, financialAdvisorId: NO_ADVISOR_SELECTED_VALUE, operatingDocumentsOnFile: false,
        primaryBeneficiaries: '', secondaryBeneficiaries: ''
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: addAssetsForm.control,
    name: "assets",
  });

  const editAssetForm = useForm<AssetFormDataItem>({
    resolver: zodResolver(assetFormItemSchema),
    defaultValues: {
        name: '', category: "" as AssetCategoryEnum, value: '', currentOwner: '', accountNumber: '', status: "Not Funded", notes: '', 
        businessType: "" as BusinessTypeEnum, businessTypeOther: '',
        deedOnFile: false, financialAdvisorId: NO_ADVISOR_SELECTED_VALUE, operatingDocumentsOnFile: false,
        primaryBeneficiaries: '', secondaryBeneficiaries: ''
    }
  });

  useEffect(() => {
    if (firmId) {
        setAllAssets(MOCK_ASSETS_DATA.filter(a => a.firmId === firmId));
        if (filterByMatterId) {
          const matter = MOCK_MATTERS_DATA.find(m => m.id === filterByMatterId && m.firmId === firmId);
          setCurrentMatter(matter || null);
        } else {
          setCurrentMatter(null);
        }
    }
  }, [firmId, filterByMatterId]);

  const filteredAssets = useMemo(() => {
    return filterByMatterId
      ? allAssets.filter(asset => asset.matterId === filterByMatterId && asset.firmId === firmId)
      : allAssets.filter(asset => asset.firmId === firmId);
  }, [allAssets, filterByMatterId, firmId]);

  const categorizedAssets = useMemo(() => {
    const grouped: { [key in AssetCategoryEnum]?: Asset[] } = {};
    ASSET_CATEGORIES.forEach(category => {
        const assetsInCategory = filteredAssets.filter(asset => asset.category === category);
        if (assetsInCategory.length > 0) {
            grouped[category] = assetsInCategory;
        }
    });
    return grouped;
  }, [filteredAssets]);

  const getStatusBadgeClass = (status: Asset['status']) => {
    switch (status) {
      case 'Funded': return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100';
      case 'Pending Titling': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100';
      case 'Not Funded':
      case 'To Be Titled':
        return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    return parseFloat(value.replace(/[^0-9.-]+/g,""));
  };

  const totalEstimatedValue = useMemo(() => {
    return filteredAssets.reduce((sum, asset) => sum + parseCurrency(asset.value), 0);
  }, [filteredAssets]);

  const fundingProgress = useMemo(() => {
    if (filteredAssets.length === 0) return 0;
    const fundedCount = filteredAssets.filter(asset => asset.status === 'Funded').length;
    return Math.round((fundedCount / filteredAssets.length) * 100);
  }, [filteredAssets]);

  const getFundingProgressColorClass = (progress: number): string => {
    if (progress <= 33) {
      return 'bg-destructive'; // Red
    } else if (progress <= 66) {
      return 'bg-accent';    // Yellow/Gold
    } else {
      return 'bg-primary';   // Green/Teal
    }
  };

  const handleAddAssetClick = () => {
    addAssetsForm.reset({ assets: [{ 
        name: '', category: "" as AssetCategoryEnum, value: '', currentOwner: '', accountNumber: '', status: "Not Funded", notes: '', 
        businessType: "" as BusinessTypeEnum, businessTypeOther: '',
        deedOnFile: false, financialAdvisorId: NO_ADVISOR_SELECTED_VALUE, operatingDocumentsOnFile: false,
        primaryBeneficiaries: '', secondaryBeneficiaries: ''
    }] });
    setShowAddAssetModal(true);
  };

  const handleEditAssetClick = (asset: Asset) => {
    setEditingAsset(asset);
    editAssetForm.reset({
        name: asset.name,
        category: asset.category,
        value: asset.value,
        currentOwner: asset.currentOwner,
        accountNumber: asset.accountNumber || '',
        status: asset.status,
        notes: asset.notes || '',
        businessType: asset.businessType || ('' as BusinessTypeEnum),
        businessTypeOther: asset.businessTypeOther || '',
        deedOnFile: asset.deedOnFile || false,
        financialAdvisorId: asset.financialAdvisorId || NO_ADVISOR_SELECTED_VALUE,
        operatingDocumentsOnFile: asset.operatingDocumentsOnFile || false,
        primaryBeneficiaries: asset.primaryBeneficiaries || '',
        secondaryBeneficiaries: asset.secondaryBeneficiaries || '',
    });
    setShowEditAssetModal(true);
  };
  
  const handleDraftFundingDocs = (assetName: string) => {
     toast({
      title: "Action Placeholder",
      description: `Drafting funding documents for "${assetName}" would be initiated here.`,
    });
  };

  const handleRequestFromClient = (assetName: string) => {
    toast({
      title: "Client Notification (Placeholder)",
      description: `A request for operating documents for "${assetName}" would be sent to the client.`,
    });
  };

  const onAddAssetsSubmit = (data: AddAssetsFormData) => {
    if (!filterByMatterId) {
      toast({ title: "Error", description: "Cannot add assets without a selected matter.", variant: "destructive" });
      return;
    }
    if (!firmId) {
      toast({ title: "Error", description: "Cannot add assets without a firm context.", variant: "destructive" });
      return;
    }
    const newAssets: Asset[] = data.assets.map(item => ({
      id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: item.name,
      category: item.category as AssetCategoryEnum,
      value: item.value,
      currentOwner: item.currentOwner,
      accountNumber: CATEGORIES_WITH_ACCOUNT_NUMBER.includes(item.category as AssetCategoryEnum) ? item.accountNumber : undefined,
      status: item.status as Asset['status'],
      notes: item.notes,
      matterId: filterByMatterId,
      businessType: item.category === AssetCategory.BUSINESS_INTERESTS ? item.businessType as BusinessTypeEnum : undefined,
      businessTypeOther: item.category === AssetCategory.BUSINESS_INTERESTS && item.businessType === 'Other' ? item.businessTypeOther : undefined,
      deedOnFile: item.category === AssetCategory.REAL_ESTATE ? item.deedOnFile : undefined,
      financialAdvisorId: (item.category === AssetCategory.INVESTMENT_ACCOUNTS || item.category === AssetCategory.RETIREMENT_ACCOUNTS) && item.financialAdvisorId && item.financialAdvisorId !== NO_ADVISOR_SELECTED_VALUE ? item.financialAdvisorId : undefined,
      operatingDocumentsOnFile: item.category === AssetCategory.BUSINESS_INTERESTS ? item.operatingDocumentsOnFile : undefined,
      primaryBeneficiaries: (item.category === AssetCategory.RETIREMENT_ACCOUNTS || item.category === AssetCategory.LIFE_INSURANCE || item.category === AssetCategory.ANNUITIES) ? item.primaryBeneficiaries : undefined,
      secondaryBeneficiaries: (item.category === AssetCategory.RETIREMENT_ACCOUNTS || item.category === AssetCategory.LIFE_INSURANCE || item.category === AssetCategory.ANNUITIES) ? item.secondaryBeneficiaries : undefined,
      firmId,
    }));
    
    MOCK_ASSETS_DATA.unshift(...newAssets);
    setAllAssets([...MOCK_ASSETS_DATA.filter(a => a.firmId === firmId)]);
    toast({ title: "Assets Added", description: `${newAssets.length} asset(s) have been added to the matter.` });
    setShowAddAssetModal(false);
  };

  const onEditAssetSubmit = (data: AssetFormDataItem) => {
    if (!editingAsset || !firmId) return;
    const updatedAsset: Asset = {
        ...editingAsset,
        name: data.name,
        category: data.category as AssetCategoryEnum,
        value: data.value,
        currentOwner: data.currentOwner,
        accountNumber: CATEGORIES_WITH_ACCOUNT_NUMBER.includes(data.category as AssetCategoryEnum) ? data.accountNumber : undefined,
        status: data.status as Asset['status'],
        notes: data.notes,
        businessType: data.category === AssetCategory.BUSINESS_INTERESTS ? data.businessType as BusinessTypeEnum : undefined,
        businessTypeOther: data.category === AssetCategory.BUSINESS_INTERESTS && data.businessType === 'Other' ? data.businessTypeOther : undefined,
        deedOnFile: data.category === AssetCategory.REAL_ESTATE ? data.deedOnFile : undefined,
        financialAdvisorId: (data.category === AssetCategory.INVESTMENT_ACCOUNTS || data.category === AssetCategory.RETIREMENT_ACCOUNTS) && data.financialAdvisorId && data.financialAdvisorId !== NO_ADVISOR_SELECTED_VALUE ? data.financialAdvisorId : undefined,
        operatingDocumentsOnFile: data.category === AssetCategory.BUSINESS_INTERESTS ? data.operatingDocumentsOnFile : undefined,
        primaryBeneficiaries: (data.category === AssetCategory.RETIREMENT_ACCOUNTS || data.category === AssetCategory.LIFE_INSURANCE || data.category === AssetCategory.ANNUITIES) ? data.primaryBeneficiaries : undefined,
        secondaryBeneficiaries: (data.category === AssetCategory.RETIREMENT_ACCOUNTS || data.category === AssetCategory.LIFE_INSURANCE || data.category === AssetCategory.ANNUITIES) ? data.secondaryBeneficiaries : undefined,
        firmId,
    };
    const index = MOCK_ASSETS_DATA.findIndex(a => a.id === editingAsset.id && a.firmId === firmId);
    if (index !== -1) {
        MOCK_ASSETS_DATA[index] = updatedAsset;
    }
    setAllAssets([...MOCK_ASSETS_DATA.filter(a => a.firmId === firmId)]);
    toast({ title: "Asset Updated", description: `Asset "${updatedAsset.name}" has been updated.` });
    setShowEditAssetModal(false);
    setEditingAsset(null);
  };

  const primaryClientIdForRibbon = currentMatter?.clientIds[0];
  const editFormCategoryValue = editAssetForm.watch('category');
  const editFormBusinessTypeValue = editAssetForm.watch('businessType');
  const userRole = user?.type === 'firmUser' ? user.firmRole : undefined;

  return (
    <div className="space-y-6">
        {filterByMatterId && currentMatter && (
          <MatterActionRibbon matterId={filterByMatterId} matterType={currentMatter.type} primaryClientId={primaryClientIdForRibbon} currentPathname={currentPathname} />
        )}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground">
                {filterByMatterId && currentMatter 
                    ? `Trust Funding & Asset Allocation for Matter: ${currentMatter.name}` 
                    : "All Client Assets"}
            </h1>
            {filterByMatterId && canManageAsset(userRole) && (
                <Button onClick={handleAddAssetClick}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Asset(s)
                </Button>
            )}
        </div>

        {filterByMatterId && (
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                    <Landmark className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">Funding Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Total Estimated Value:</p>
                        <p className="font-semibold text-lg text-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalEstimatedValue)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Overall Funding Progress:</p>
                        <div className="flex items-center gap-2">
                            <div className="w-full bg-muted rounded-full h-2.5">
                                <div 
                                    className={`h-2.5 rounded-full ${getFundingProgressColorClass(fundingProgress)}`}
                                    style={{ width: `${fundingProgress}%` }}
                                ></div>
                            </div>
                            <span className="font-semibold text-lg text-foreground">{fundingProgress}%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">Asset Details</CardTitle>
                </div>
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <span className="inline-flex items-center text-primary cursor-help p-1 bg-primary/10 rounded-md hover:bg-primary/20 transition-colors text-xs">
                            <Info className="w-4 h-4 mr-1"/> JTWROS?
                        </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                        <p className="text-sm"><strong>JTWROS:</strong> Joint Tenancy with Right of Survivorship. Assets held this way typically pass directly to surviving joint owner(s) outside of probate and may not need to be formally 'funded' into a trust in the same way.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                    {filterByMatterId 
                        ? "Manage assets and their funding status for this specific matter." 
                        : "Overview of all client assets. Select a matter to see matter-specific assets and funding tools."
                    }
                </p>
                {Object.keys(categorizedAssets).length > 0 ? (
                    <div className="space-y-6">
                        {(Object.keys(categorizedAssets) as AssetCategoryEnum[]).map(category => (
                            <div key={category}>
                                <h3 className="text-lg font-semibold text-primary mb-2 flex items-center">
                                    {getCategoryIcon(category)}
                                    <span className="ml-2">{category}</span>
                                </h3>
                                <ul className="space-y-3">
                                    {categorizedAssets[category]?.map(asset => (
                                        <li key={asset.id} className="p-3 border border-border rounded-lg shadow-sm bg-card">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                                <h4 className="font-semibold text-foreground">{asset.name}</h4>
                                                <span className={`px-2.5 py-0.5 mt-1 sm:mt-0 text-xs font-semibold rounded-full ${getStatusBadgeClass(asset.status)}`}>
                                                    {asset.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Value: {asset.value}</p>
                                            <p className="text-sm text-muted-foreground">Current Owner: {asset.currentOwner}</p>
                                            {CATEGORIES_WITH_ACCOUNT_NUMBER.includes(asset.category) && asset.accountNumber && (
                                                <p className="text-sm text-muted-foreground">Account #: {asset.accountNumber}</p>
                                            )}
                                            {asset.category === AssetCategory.REAL_ESTATE && (
                                                <p className="text-sm text-muted-foreground">Deed on File: {asset.deedOnFile ? 'Yes' : 'No'}</p>
                                            )}
                                            {(asset.category === AssetCategory.INVESTMENT_ACCOUNTS || asset.category === AssetCategory.RETIREMENT_ACCOUNTS) && asset.financialAdvisorId && (
                                                 <p className="text-sm text-muted-foreground">Financial Advisor: {getContactNameById(asset.financialAdvisorId) || 'N/A'}</p>
                                            )}
                                            {asset.category === AssetCategory.BUSINESS_INTERESTS && (
                                                <>
                                                    {asset.businessType && <p className="text-sm text-muted-foreground">Business Type: {asset.businessType}{asset.businessType === 'Other' && asset.businessTypeOther ? ` (${asset.businessTypeOther})` : ''}</p>}
                                                    <p className="text-sm text-muted-foreground">Operating Docs on File: {asset.operatingDocumentsOnFile ? 'Yes' : 'No'}</p>
                                                </>
                                            )}
                                            {(asset.category === AssetCategory.RETIREMENT_ACCOUNTS || asset.category === AssetCategory.LIFE_INSURANCE || asset.category === AssetCategory.ANNUITIES) && (
                                                <>
                                                    {asset.primaryBeneficiaries && <p className="text-sm text-muted-foreground">Primary Beneficiaries: {asset.primaryBeneficiaries}</p>}
                                                    {asset.secondaryBeneficiaries && <p className="text-sm text-muted-foreground">Secondary Beneficiaries: {asset.secondaryBeneficiaries}</p>}
                                                </>
                                            )}
                                            {asset.notes && <p className="text-xs text-muted-foreground/80 italic mt-1">Notes: {asset.notes}</p>}
                                            {!filterByMatterId && asset.matterId && <p className="text-xs text-muted-foreground/80">Matter: {getMatterNameById(asset.matterId) || asset.matterId}</p>}
                                            
                                            {filterByMatterId && canManageAsset(userRole) && (
                                                <div className="mt-2 pt-2 border-t border-border/30 flex justify-end items-center gap-2">
                                                    {asset.category === AssetCategory.BUSINESS_INTERESTS && !asset.operatingDocumentsOnFile && (
                                                         <Button variant="outline" size="sm" onClick={() => handleRequestFromClient(asset.name)}>
                                                            <FileQuestion className="h-3 w-3 mr-1.5" /> Request Docs
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" size="sm" onClick={() => handleEditAssetClick(asset)}>
                                                        <Edit2 className="h-3 w-3 mr-1.5" /> Edit
                                                    </Button>
                                                    {(asset.category === AssetCategory.REAL_ESTATE || asset.category === AssetCategory.BUSINESS_INTERESTS) &&
                                                      asset.status !== 'Funded' && asset.status !== 'N/A' && asset.status !== 'Unknown' && (
                                                        <Button variant="default" size="sm" onClick={() => handleDraftFundingDocs(asset.name)}>
                                                            Draft Funding Docs
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                        <p className="text-lg font-semibold">No Assets Found</p>
                        <p className="text-sm">
                           {filterByMatterId ? "No assets recorded for this matter yet. Click 'Add New Asset(s)' to begin." : "No assets recorded in the system."} 
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Add Asset Modal */}
        <Dialog open={showAddAssetModal} onOpenChange={setShowAddAssetModal}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Add New Assets to Matter: {currentMatter?.name}</DialogTitle>
                </DialogHeader>
                <Form {...addAssetsForm}>
                    <form onSubmit={addAssetsForm.handleSubmit(onAddAssetsSubmit)}>
                        <ScrollArea className="h-[60vh] pr-6">
                            <div className="space-y-6 py-4">
                                {fields.map((field, index) => {
                                    const categoryValue = addAssetsForm.watch(`assets.${index}.category`);
                                    const businessTypeValue = addAssetsForm.watch(`assets.${index}.businessType`);
                                    return (
                                    <Card key={field.id} className="p-4 relative">
                                        <CardHeader className="p-0 pb-3 mb-3 border-b">
                                            <CardTitle className="text-md">Asset {index + 1}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 space-y-3">
                                            <FormField control={addAssetsForm.control} name={`assets.${index}.name`} render={({ field: formField }) => (
                                                <FormItem><FormLabel>Asset Name</FormLabel><FormControl><Input placeholder="e.g., Main Residence, Chase Checking" {...formField} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <FormField control={addAssetsForm.control} name={`assets.${index}.category`} render={({ field: formField }) => (
                                                    <FormItem><FormLabel>Category</FormLabel>
                                                        <Select onValueChange={formField.onChange} value={formField.value}><FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                                                        <SelectContent>{ASSET_CATEGORIES.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select><FormMessage />
                                                    </FormItem>
                                                )}/>
                                                {categoryValue === AssetCategory.BUSINESS_INTERESTS && (
                                                    <FormField control={addAssetsForm.control} name={`assets.${index}.businessType`} render={({ field: formField }) => (
                                                        <FormItem><FormLabel>Business Type</FormLabel>
                                                            <Select onValueChange={formField.onChange} value={formField.value}><FormControl><SelectTrigger><SelectValue placeholder="Select business type" /></SelectTrigger></FormControl>
                                                            <SelectContent>{BUSINESS_TYPES.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select><FormMessage />
                                                        </FormItem>
                                                    )}/>
                                                )}
                                                {categoryValue === AssetCategory.BUSINESS_INTERESTS && businessTypeValue === 'Other' && (
                                                     <FormField control={addAssetsForm.control} name={`assets.${index}.businessTypeOther`} render={({ field: formField }) => (
                                                        <FormItem className="md:col-span-2"><FormLabel>Other Business Type</FormLabel><FormControl><Input placeholder="Specify other type" {...formField} /></FormControl><FormMessage /></FormItem>
                                                    )}/>
                                                )}
                                            </div>
                                            <FormField control={addAssetsForm.control} name={`assets.${index}.value`} render={({ field: formField }) => (
                                                <FormItem><FormLabel>Estimated Value</FormLabel><FormControl><Input placeholder="e.g., $100,000 or 100 shares" {...formField} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={addAssetsForm.control} name={`assets.${index}.currentOwner`} render={({ field: formField }) => (
                                                <FormItem><FormLabel>Current Owner(s)</FormLabel><FormControl><Input placeholder="e.g., John Smith, Individual or John & Jane Smith, JTWROS" {...formField} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            {CATEGORIES_WITH_ACCOUNT_NUMBER.includes(categoryValue as AssetCategoryEnum) && (
                                                <FormField control={addAssetsForm.control} name={`assets.${index}.accountNumber`} render={({ field: formField }) => (
                                                    <FormItem><FormLabel>Account Number (Optional)</FormLabel><FormControl><Input placeholder="Enter account number" {...formField} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                            )}
                                             <FormField control={addAssetsForm.control} name={`assets.${index}.status`} render={({ field: formField }) => (
                                                <FormItem><FormLabel>Funding Status</FormLabel>
                                                    <Select onValueChange={formField.onChange} value={formField.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                                    <SelectContent>{ASSET_STATUS_OPTIONS.map(stat => (<SelectItem key={stat} value={stat}>{stat}</SelectItem>))}</SelectContent></Select><FormMessage />
                                                </FormItem>
                                            )}/>
                                            
                                            {categoryValue === AssetCategory.REAL_ESTATE && (
                                                <FormField control={addAssetsForm.control} name={`assets.${index}.deedOnFile`} render={({ field: formField }) => (
                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={formField.value} onCheckedChange={formField.onChange} /></FormControl><FormLabel className="font-normal">Deed on File?</FormLabel></FormItem>
                                                )}/>
                                            )}
                                            {(categoryValue === AssetCategory.INVESTMENT_ACCOUNTS || categoryValue === AssetCategory.RETIREMENT_ACCOUNTS) && (
                                                <FormField control={addAssetsForm.control} name={`assets.${index}.financialAdvisorId`} render={({ field: formField }) => (
                                                    <FormItem><FormLabel>Financial Advisor (Optional)</FormLabel>
                                                        <Select onValueChange={formField.onChange} value={formField.value || NO_ADVISOR_SELECTED_VALUE}><FormControl><SelectTrigger><SelectValue placeholder="Select advisor" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value={NO_ADVISOR_SELECTED_VALUE}>-- None --</SelectItem>
                                                            {financialAdvisorContacts.map(fa => (<SelectItem key={fa.id} value={fa.id.toString()}>{fa.name}</SelectItem>))}
                                                        </SelectContent></Select><FormMessage />
                                                    </FormItem>
                                                )}/>
                                            )}
                                            {categoryValue === AssetCategory.BUSINESS_INTERESTS && (
                                                <FormField control={addAssetsForm.control} name={`assets.${index}.operatingDocumentsOnFile`} render={({ field: formField }) => (
                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={formField.value} onCheckedChange={formField.onChange} /></FormControl><FormLabel className="font-normal">Operating Agreement/Bylaws/Stock on File?</FormLabel></FormItem>
                                                )}/>
                                            )}
                                            {(categoryValue === AssetCategory.RETIREMENT_ACCOUNTS || categoryValue === AssetCategory.LIFE_INSURANCE || categoryValue === AssetCategory.ANNUITIES) && (
                                                <>
                                                    <FormField control={addAssetsForm.control} name={`assets.${index}.primaryBeneficiaries`} render={({ field: formField }) => (
                                                        <FormItem><FormLabel>Primary Beneficiary(ies)</FormLabel><FormControl><Textarea placeholder="List names of primary beneficiaries" {...formField} /></FormControl><FormMessage /></FormItem>
                                                    )}/>
                                                     <FormField control={addAssetsForm.control} name={`assets.${index}.secondaryBeneficiaries`} render={({ field: formField }) => (
                                                        <FormItem><FormLabel>Secondary Beneficiary(ies)</FormLabel><FormControl><Textarea placeholder="List names of secondary beneficiaries" {...formField} /></FormControl><FormMessage /></FormItem>
                                                    )}/>
                                                </>
                                            )}

                                            <FormField control={addAssetsForm.control} name={`assets.${index}.notes`} render={({ field: formField }) => (
                                                <FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Account numbers, property details, specific instructions..." {...formField} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                        </CardContent>
                                        {fields.length > 1 && (
                                            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1 h-auto">
                                                <Trash2 className="w-4 h-4 mr-1" /> Remove
                                            </Button>
                                        )}
                                    </Card>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                        <DialogFooter className="pt-6 border-t mt-4 flex-col-reverse sm:flex-row sm:justify-between gap-2">
                            <Button type="button" variant="outline" onClick={() => append({ 
                                name: '', category: "" as AssetCategoryEnum, value: '', currentOwner: '', accountNumber: '', status: "Not Funded" as Asset['status'], notes: '', 
                                businessType: "" as BusinessTypeEnum, businessTypeOther: '',
                                deedOnFile: false, financialAdvisorId: NO_ADVISOR_SELECTED_VALUE, operatingDocumentsOnFile: false,
                                primaryBeneficiaries: '', secondaryBeneficiaries: ''
                            })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Asset
                            </Button>
                            <div className="flex gap-2">
                                <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                                <Button type="submit">Save Assets</Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

        {/* Edit Asset Modal */}
        <Dialog open={showEditAssetModal} onOpenChange={setShowEditAssetModal}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Asset: {editingAsset?.name}</DialogTitle>
                </DialogHeader>
                <Form {...editAssetForm}>
                    <form onSubmit={editAssetForm.handleSubmit(onEditAssetSubmit)}>
                        <ScrollArea className="h-[60vh] pr-6">
                             <div className="space-y-4 py-4">
                                <FormField control={editAssetForm.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Asset Name</FormLabel><FormControl><Input placeholder="e.g., Main Residence, Chase Checking" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField control={editAssetForm.control} name="category" render={({ field }) => (
                                    <FormItem><FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                                        <SelectContent>{ASSET_CATEGORIES.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select><FormMessage />
                                    </FormItem>
                                )}/>
                                {editFormCategoryValue === AssetCategory.BUSINESS_INTERESTS && (
                                    <FormField control={editAssetForm.control} name="businessType" render={({ field }) => (
                                        <FormItem><FormLabel>Business Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select business type" /></SelectTrigger></FormControl>
                                            <SelectContent>{BUSINESS_TYPES.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select><FormMessage />
                                        </FormItem>
                                    )}/>
                                )}
                                </div>
                                 {editFormCategoryValue === AssetCategory.BUSINESS_INTERESTS && editFormBusinessTypeValue === 'Other' && (
                                     <FormField control={editAssetForm.control} name="businessTypeOther" render={({ field }) => (
                                        <FormItem><FormLabel>Other Business Type</FormLabel><FormControl><Input placeholder="Specify other type" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                )}
                                <FormField control={editAssetForm.control} name="value" render={({ field }) => (
                                    <FormItem><FormLabel>Estimated Value</FormLabel><FormControl><Input placeholder="e.g., $100,000 or 100 shares" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={editAssetForm.control} name="currentOwner" render={({ field }) => (
                                    <FormItem><FormLabel>Current Owner(s)</FormLabel><FormControl><Input placeholder="e.g., John Smith, Individual or John & Jane Smith, JTWROS" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                {CATEGORIES_WITH_ACCOUNT_NUMBER.includes(editFormCategoryValue as AssetCategoryEnum) && (
                                    <FormField control={editAssetForm.control} name="accountNumber" render={({ field }) => (
                                        <FormItem><FormLabel>Account Number (Optional)</FormLabel><FormControl><Input placeholder="Enter account number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                )}
                                 <FormField control={editAssetForm.control} name="status" render={({ field }) => (
                                    <FormItem><FormLabel>Funding Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                        <SelectContent>{ASSET_STATUS_OPTIONS.map(stat => (<SelectItem key={stat} value={stat}>{stat}</SelectItem>))}</SelectContent></Select><FormMessage />
                                    </FormItem>
                                )}/>

                                {editFormCategoryValue === AssetCategory.REAL_ESTATE && (
                                    <FormField control={editAssetForm.control} name="deedOnFile" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Deed on File?</FormLabel></FormItem>
                                    )}/>
                                )}
                                {(editFormCategoryValue === AssetCategory.INVESTMENT_ACCOUNTS || editFormCategoryValue === AssetCategory.RETIREMENT_ACCOUNTS) && (
                                    <FormField control={editAssetForm.control} name="financialAdvisorId" render={({ field }) => (
                                        <FormItem><FormLabel>Financial Advisor (Optional)</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || NO_ADVISOR_SELECTED_VALUE}><FormControl><SelectTrigger><SelectValue placeholder="Select advisor" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value={NO_ADVISOR_SELECTED_VALUE}>-- None --</SelectItem>
                                                {financialAdvisorContacts.map(fa => (<SelectItem key={fa.id} value={fa.id.toString()}>{fa.name}</SelectItem>))}
                                            </SelectContent></Select><FormMessage />
                                        </FormItem>
                                    )}/>
                                )}
                                {editFormCategoryValue === AssetCategory.BUSINESS_INTERESTS && (
                                    <FormField control={editAssetForm.control} name="operatingDocumentsOnFile" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Operating Agreement/Bylaws/Stock on File?</FormLabel></FormItem>
                                    )}/>
                                )}
                                {(editFormCategoryValue === AssetCategory.RETIREMENT_ACCOUNTS || editFormCategoryValue === AssetCategory.LIFE_INSURANCE || editFormCategoryValue === AssetCategory.ANNUITIES) && (
                                    <>
                                        <FormField control={editAssetForm.control} name="primaryBeneficiaries" render={({ field }) => (
                                            <FormItem><FormLabel>Primary Beneficiary(ies)</FormLabel><FormControl><Textarea placeholder="List names of primary beneficiaries" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                         <FormField control={editAssetForm.control} name="secondaryBeneficiaries" render={({ field }) => (
                                            <FormItem><FormLabel>Secondary Beneficiary(ies)</FormLabel><FormControl><Textarea placeholder="List names of secondary beneficiaries" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </>
                                )}

                                <FormField control={editAssetForm.control} name="notes" render={({ field }) => (
                                    <FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Account numbers, property details, specific instructions..." {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                        </ScrollArea>
                        <DialogFooter className="pt-6 border-t mt-4">
                            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </div>
  );
}
