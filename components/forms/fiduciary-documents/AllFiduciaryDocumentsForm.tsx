// @ts-nocheck
// TODO: Remove ts-nocheck and fix types
"use client";

import React, { useEffect } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Save, Send } from 'lucide-react';
import { RadioGroupField } from '@/components/forms/trust-creation/field-components';
import { FiduciaryNominationsContent } from './FiduciaryNominationsContent';
import type { Matter, Contact } from '@/lib/types';
import { toast } from "@/hooks/use-toast";
import { YES_NO_OPTIONS } from '@/components/forms/trust-creation/constants';

const MARITAL_STATUS_OPTIONS = [
    { value: 'Married', label: 'Married Couple' },
    { value: 'Single', label: 'Single Individual' },
];

interface AllFiduciaryDocumentsFormProps {
  matter: Matter | null;
  client: Contact | null;
  client2?: Contact | null;
  onFormSubmit?: (data: any) => void;
  onFormSave?: (data: any) => void;
}

export const AllFiduciaryDocumentsForm: React.FC<AllFiduciaryDocumentsFormProps> = ({ matter, client, client2, onFormSubmit, onFormSave }) => {
    const methods = useForm({
        defaultValues: {
            marital_status: client2 ? 'Married' : 'Single', 
            spouse_auto_fiduciary: "Yes", // <<<< UPDATED DEFAULT VALUE HERE
            trustor1_fin_agent1_name: client2 ? client2.name : "", 
            trustor1_fin_agent2_name: "",
            trustor1_fin_agent3_name: "",
            trustor1_fin_agents_acting: "Single",

            trustor2_fin_agent1_name: client2 ? client?.name : "", 
            trustor2_fin_agent2_name: "",
            trustor2_fin_agent3_name: "",
            trustor2_fin_agents_acting: "Single",

            trustor1_hc_agent1_name: client2 ? client2.name : "",
            trustor1_hc_agent2_name: "",
            trustor1_hc_agent3_name: "",
            trustor1_hc_agents_acting: "Single",

            trustor2_hc_agent1_name: client2 ? client?.name : "",
            trustor2_hc_agent2_name: "",
            trustor2_hc_agent3_name: "",
            trustor2_hc_agents_acting: "Single",

            trustor1_ad_same_as_hc: "Yes",
            trustor2_ad_same_as_hc: "Yes",

            trustor1_ad_agent1_name: "", 
            trustor1_ad_agent2_name: "",
            trustor1_ad_agent3_name: "",
            trustor1_ad_agents_acting: "Single",

            trustor2_ad_agent1_name: "",
            trustor2_ad_agent2_name: "",
            trustor2_ad_agent3_name: "",
            trustor2_ad_agents_acting: "Single",

            trustor1_additional_hipaa_authorization: "No",
            trustor1_additional_hipaa_names: "",
            trustor2_additional_hipaa_authorization: "No",
            trustor2_additional_hipaa_names: "",

            trustor1_appoint_disposition_agent: "No",
            trustor1_disposition_agent_source: "",
            trustor1_disposition_agent_other_name: "",
            trustor2_appoint_disposition_agent: "No",
            trustor2_disposition_agent_source: "",
            trustor2_disposition_agent_other_name: "",
        }
    });

    const { handleSubmit, formState: { errors }, getValues, setValue, watch, control } = methods;
    const maritalStatus = watch("marital_status");

    useEffect(() => {
        if (maritalStatus === "Single") {
            setValue("trustor2_fin_agent1_name", "");
            setValue("trustor2_fin_agent2_name", "");
            setValue("trustor2_fin_agent3_name", "");
            setValue("trustor2_hc_agent1_name", "");
            setValue("trustor2_hc_agent2_name", "");
            setValue("trustor2_hc_agent3_name", "");
            setValue("trustor2_ad_agent1_name", "");
            setValue("trustor2_ad_agent2_name", "");
            setValue("trustor2_ad_agent3_name", "");
            setValue("trustor2_additional_hipaa_authorization", "No");
            setValue("trustor2_additional_hipaa_names", "");
            setValue("spouse_auto_fiduciary", "No");
            setValue("trustor2_appoint_disposition_agent", "No");
            setValue("trustor2_disposition_agent_source", "");
            setValue("trustor2_disposition_agent_other_name", "");
        }
    }, [maritalStatus, setValue]);
    
    useEffect(() => {
        const spouseAuto = getValues("spouse_auto_fiduciary");
        if (maritalStatus === "Married" && spouseAuto === "Yes") {
            if (client && client2) {
                if (!getValues("trustor1_fin_agent1_name")) setValue("trustor1_fin_agent1_name", client2.name);
                if (!getValues("trustor1_hc_agent1_name")) setValue("trustor1_hc_agent1_name", client2.name);
                if (!getValues("trustor2_fin_agent1_name")) setValue("trustor2_fin_agent1_name", client.name);
                if (!getValues("trustor2_hc_agent1_name")) setValue("trustor2_hc_agent1_name", client.name);
            }
        }
    }, [watch("spouse_auto_fiduciary"), maritalStatus, client, client2, setValue, getValues]);
    
    const trustor1_ad_same_as_hc = watch("trustor1_ad_same_as_hc");
    useEffect(() => {
        if (trustor1_ad_same_as_hc === "Yes") {
            setValue("trustor1_ad_agent1_name", getValues("trustor1_hc_agent1_name"));
            setValue("trustor1_ad_agent2_name", getValues("trustor1_hc_agent2_name"));
            setValue("trustor1_ad_agent3_name", getValues("trustor1_hc_agent3_name"));
            setValue("trustor1_ad_agents_acting", getValues("trustor1_hc_agents_acting"));
        }
    }, [trustor1_ad_same_as_hc, setValue, getValues, watch("trustor1_hc_agent1_name"), watch("trustor1_hc_agent2_name"), watch("trustor1_hc_agent3_name"), watch("trustor1_hc_agents_acting")]);

    const trustor2_ad_same_as_hc = watch("trustor2_ad_same_as_hc");
    useEffect(() => {
        if (maritalStatus === "Married" && trustor2_ad_same_as_hc === "Yes") {
            setValue("trustor2_ad_agent1_name", getValues("trustor2_hc_agent1_name"));
            setValue("trustor2_ad_agent2_name", getValues("trustor2_hc_agent2_name"));
            setValue("trustor2_ad_agent3_name", getValues("trustor2_hc_agent3_name"));
            setValue("trustor2_ad_agents_acting", getValues("trustor2_hc_agents_acting"));
        }
    }, [maritalStatus, trustor2_ad_same_as_hc, setValue, getValues, watch("trustor2_hc_agent1_name"), watch("trustor2_hc_agent2_name"), watch("trustor2_hc_agent3_name"), watch("trustor2_hc_agents_acting")]);


    const onSubmitHandler = (data: any) => {
        if (onFormSubmit) {
            onFormSubmit(data);
        } else {
            console.log("Fiduciary Documents Form Submitted Data (standalone):", JSON.stringify(data, null, 2));
            toast({
                title: "Form Data Captured (Standalone)",
                description: "Fiduciary nominations have been processed. Check console for data.",
                variant: "default",
                duration: 7000,
            });
        }
    };

    const handleSaveDraft = () => {
        const currentData = getValues();
        console.log("Saving Fiduciary Documents Draft:", JSON.stringify(currentData, null, 2));
        toast({ title: "Draft Saved", description: "Your progress has been saved for fiduciary nominations. Check console for data." });
        if (onFormSave) {
            onFormSave(currentData);
        }
    };

    const person1EffectiveLabel = maritalStatus === "Single" ? (client?.name || "Client") : (client?.name || "Client 1");
    const person2EffectiveLabel = maritalStatus === "Married" ? (client2?.name || "Client 2") : "";


    return (
        <FormProvider {...methods}>
            <div className="bg-card p-4 md:p-6 rounded-lg shadow-xl border border-border">
                <h2 className="text-2xl font-bold text-center text-primary mb-2">
                    Fiduciary Document Nominations
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-6">
                    Matter: {matter?.name || 'N/A'} | Client: {person1EffectiveLabel}
                    {maritalStatus === "Married" && client2 && ` & ${person2EffectiveLabel}`}
                </p>
                
                <div className="mb-6">
                     <RadioGroupField
                        control={control}
                        errors={errors}
                        label="Marital Status for Fiduciary Nominations"
                        name="marital_status"
                        options={MARITAL_STATUS_OPTIONS}
                        required
                        layout="horizontal"
                    />
                </div>


                <form onSubmit={handleSubmit(onSubmitHandler)}>
                    <div className="mt-1 min-h-[400px] outline-none ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                        <FiduciaryNominationsContent 
                            person1Label={person1EffectiveLabel} 
                            person2Label={person2EffectiveLabel} 
                        />
                    </div>
                    
                    <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-end items-center gap-4">
                        <Button type="button" variant="secondary" onClick={handleSaveDraft} className="w-full sm:w-auto">
                            <Save className="mr-2 h-4 w-4" /> Save Draft
                        </Button>
                        <Button type="submit" className="w-full sm:w-auto">
                           <Send className="mr-2 h-4 w-4" /> Submit Form
                        </Button>
                    </div>

                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive" className="mt-6">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Errors Found</AlertTitle>
                            <AlertDescription>
                                Please review the form. Some required fields may be missing or have invalid entries.
                            </AlertDescription>
                        </Alert>
                    )}
                </form>
            </div>
        </FormProvider>
    );
};
