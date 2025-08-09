
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronLeft, FileSignature, BookCopy, FileText as FileTextIcon, Users, Layers } from 'lucide-react';
import { MOCK_MATTERS_DATA, MOCK_CONTACTS_DATA } from '@/lib/mock-data';
import type { Matter, Contact, ContactCategory, MatterType } from '@/lib/types'; // Added MatterType
import { toast } from "@/hooks/use-toast";
import { RevocableLivingTrustMarriedJointForm } from '@/components/forms/trust-creation/revocable-living-trust-married-joint-form';
import { RevocableLivingTrustMarriedSeparateForm } from '@/components/forms/trust-creation/revocable-living-trust-married-separate-form';
import { RevocableLivingTrustSingleIndividualForm } from '@/components/forms/trust-creation/revocable-living-trust-single-individual-form';
import { NonABTrustMarriedForm } from '@/components/forms/trust-creation/non-ab-trust-married-form';
import { WillMarriedIndividualForm } from '@/components/forms/will-creation/will-married-individual-form';
import { WillSingleIndividualForm } from '@/components/forms/will-creation/will-single-individual-form';
import { AllFiduciaryDocumentsForm } from '@/components/forms/fiduciary-documents/AllFiduciaryDocumentsForm';
import { MatterActionRibbon } from '@/components/layout/matter-action-ribbon';

interface DocumentOption {
  title: string;
  docType: string;
  subType?: string;
  icon: React.ElementType;
  formComponent?: React.ElementType;
}

const trustOptions: DocumentOption[] = [
  { title: "Revocable Living Trust (Single Individual)", docType: "Trust", subType: "Single Individual", icon: FileSignature, formComponent: RevocableLivingTrustSingleIndividualForm },
  { title: "Revocable Living Trust (Married Couple - Joint)", docType: "Trust", subType: "Married Couple - Joint", icon: FileSignature, formComponent: RevocableLivingTrustMarriedJointForm },
  { title: "Revocable Living Trust (Married Couple - Separate Trusts)", docType: "Trust", subType: "Married Couple - Separate Trusts", icon: Users, formComponent: RevocableLivingTrustMarriedSeparateForm },
  { title: "Non-A/B Trust (Married)", docType: "Trust", subType: "Non-A/B Trust - Married", icon: FileSignature, formComponent: NonABTrustMarriedForm },
];

const willOptions: DocumentOption[] = [
  { title: "Will (Single Individual)", docType: "Will", subType: "Single Individual", icon: BookCopy, formComponent: WillSingleIndividualForm },
  { title: "Will (Married)", docType: "Will", subType: "Married", icon: BookCopy, formComponent: WillMarriedIndividualForm },
];

const ancillaryOptions: DocumentOption[] = [
  { title: "All Fiduciary Documents (Health and Financial)", docType: "FiduciaryPackage", icon: Layers, formComponent: AllFiduciaryDocumentsForm },
  { title: "Durable Power of Attorney for Finances", docType: "POA", subType: "Financial", icon: FileTextIcon },
  { title: "Advance Health Care Directive", docType: "AHCD", icon: FileTextIcon },
  { title: "HIPAA Authorization", docType: "HIPAA", icon: FileTextIcon },
];

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  };
};

export default function CreateDocumentSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const queryParams = useSearchParams();
  const currentPathname = usePathname();

  const matterId = params.matterId as string;
  const clientIdFromQuery = queryParams.get('clientId');

  const [matter, setMatter] = useState<Matter | null>(null);
  const [primaryClient, setPrimaryClient] = useState<Contact | null>(null);
  const [secondaryClient, setSecondaryClient] = useState<Contact | null>(null);
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState<{ docType: string; subType?: string; title: string; formComponent?: React.ElementType } | null>(null);

  useEffect(() => {
    if (matterId) {
      const foundMatter = MOCK_MATTERS_DATA.find(m => m.id === matterId);
      setMatter(foundMatter || null);

      if (foundMatter) {
        const clientContacts = MOCK_CONTACTS_DATA.filter(c => foundMatter.clientIds.includes(c.id) && c.category === "Client" as ContactCategory);

        if (clientIdFromQuery) {
            const queryClient = clientContacts.find(c => c.id.toString() === clientIdFromQuery);
            setPrimaryClient(queryClient || null);
            if (queryClient && clientContacts.length > 1) {
                const otherClient = clientContacts.find(c => c.id !== queryClient.id);
                setSecondaryClient(otherClient || null);
            }
        } else if (clientContacts.length > 0) {
            setPrimaryClient(clientContacts[0]);
            if (clientContacts.length > 1) {
                setSecondaryClient(clientContacts[1]);
            }
        }
      }
    }
  }, [matterId, clientIdFromQuery]);

  useEffect(() => {
    if (queryParams.get('summary_action') === 'done') {
      sessionStorage.removeItem('pendingFormSummaryData');
      setSelectedDocumentDetails(null);
       const newPath = `/attorney/matters/${matterId}/create-document`;
       router.replace(newPath, { scroll: false });
    }
  }, [queryParams, matterId, router]);


  const handleDocumentSelection = (doc: DocumentOption) => {
    if (doc.formComponent) {
      setSelectedDocumentDetails({ docType: doc.docType, subType: doc.subType, title: doc.title, formComponent: doc.formComponent });
    } else {
      toast({
          title: "Document Template Unavailable",
          description: `Interactive form for "${doc.title}" is not yet available.`,
          variant: "default",
          duration: 5000,
      });
    }
  };

  const DocumentCategoryCard = ({ title, icon: Icon, options }: {title: string, icon: React.ElementType, options: DocumentOption[]}) => (
    <Card className="hover:shadow-2xl transition-shadow duration-200 ease-in-out">
      <CardHeader className="flex flex-row items-center space-x-2">
        <Icon className="h-5 w-5 text-primary" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {options.map(opt => (
            <Button
              key={opt.title}
              onClick={() => handleDocumentSelection(opt)}
              variant="outline"
              className="w-full justify-start text-left h-auto py-2.5 px-3 whitespace-normal leading-snug text-sm hover:bg-primary/10"
            >
              <opt.icon className="w-4 h-4 mr-2 text-muted-foreground" />
              {opt.title}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const handleBackToSelection = () => {
    setSelectedDocumentDetails(null);
    sessionStorage.removeItem('pendingFormSummaryData');
  };

  const handleFormSubmit = (formData: any) => {
    console.log("Form Submitted in Page:", formData);
    toast({
      title: "Form Processed",
      description: "The document information has been captured. Preparing summary...",
      duration: 3000
    });

    const summaryData = {
        formData,
        matter,
        client: primaryClient,
        client2: (selectedDocumentDetails?.subType !== "Single Individual" && selectedDocumentDetails?.docType !== "Will" && primaryClient && secondaryClient) ? secondaryClient : undefined,
        formTitle: selectedDocumentDetails?.title || "Document Summary",
        docType: selectedDocumentDetails?.docType || "unknown",
        subType: selectedDocumentDetails?.subType
    };
    try {
        sessionStorage.setItem('pendingFormSummaryData', JSON.stringify(summaryData, getCircularReplacer()));
    } catch (error) {
        console.error("Error saving to sessionStorage:", error);
        toast({ title: "Error", description: "Could not save form data for summary. Please try again.", variant: "destructive"});
        return;
    }

    if (matter?.id && selectedDocumentDetails?.docType) {
        router.push(`/attorney/matters/${matter.id}/create-document/summary?docType=${selectedDocumentDetails.docType}&formTitle=${encodeURIComponent(summaryData.formTitle)}`);
    } else {
        toast({ title: "Navigation Error", description: "Cannot proceed to summary page. Missing critical data.", variant: "destructive"});
        handleBackToSelection();
    }
  }

  const SelectedFormComponent = selectedDocumentDetails?.formComponent;

  if (!matter && !selectedDocumentDetails && !clientIdFromQuery) { // Adjusted condition slightly
    return (
      <div className="space-y-8 bg-background min-h-full -m-6 p-6">
        <div className="p-6 text-center">
          <p className="text-destructive text-lg">Error: Matter data not found for document creation.</p>
          <Button onClick={() => router.push('/attorney/matters')} variant="outline" className="mt-4">
            Return to Matters List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background min-h-full -m-6 p-6">
      <MatterActionRibbon 
        matterId={matterId} 
        matterType={matter?.type} 
        primaryClientId={primaryClient?.id} 
        currentPathname={currentPathname} 
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 p-4 bg-card shadow rounded-lg border">
        <div>
            <h1 className="text-3xl font-bold text-foreground">
                {selectedDocumentDetails ? `Editing: ${selectedDocumentDetails.title}` : "Create New Document"}
            </h1>
            <p className="text-muted-foreground">For Matter: <span className="text-primary font-medium">{matter?.name || "Loading..."}</span></p>
            {primaryClient && <p className="text-sm text-muted-foreground">Primary Client: <span className="text-primary font-medium">{primaryClient.name}</span></p>}
            {selectedDocumentDetails?.subType !== "Single Individual" && selectedDocumentDetails?.docType !== "Will" && secondaryClient && primaryClient && <p className="text-sm text-muted-foreground">Secondary Client: <span className="text-primary font-medium">{secondaryClient.name}</span></p>}
        </div>
        <Button
          onClick={selectedDocumentDetails ? handleBackToSelection : () => router.back()}
          variant="outline"
          className="mt-3 sm:mt-0"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {selectedDocumentDetails ? "Back to Document Selection" : "Back"}
        </Button>
      </div>

      {SelectedFormComponent ? (
        <SelectedFormComponent
            matter={matter}
            client={primaryClient}
            client2={(selectedDocumentDetails?.subType !== "Single Individual" && selectedDocumentDetails?.docType !== "Will" && primaryClient && secondaryClient) ? secondaryClient : undefined}
            onFormSubmit={handleFormSubmit}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DocumentCategoryCard title="Trust Agreements" icon={FileSignature} options={trustOptions} />
          <DocumentCategoryCard title="Last Will and Testaments" icon={BookCopy} options={willOptions} />
          <DocumentCategoryCard title="Ancillary Documents" icon={FileTextIcon} options={ancillaryOptions} />
        </div>
      )}
    </div>
  );
}
