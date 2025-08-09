// @ts-nocheck
// TODO: Remove ts-nocheck and fix types
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Save, Send, ArrowLeft, ArrowRight } from 'lucide-react';
import {
    PersonalFamilyInfoTab, GuardiansFiduciariesTab, CapacityConfirmationTab
} from '@/components/forms/trust-creation/tab-components'; // Reused
import { GeneralWillProvisionsAndDistributionTab } from './tab-components-will';
import type { Matter, Contact } from '@/lib/types';
import { toast } from "@/hooks/use-toast";

interface WillFormProps {
  matter: Matter | null;
  client: Contact | null;
  client2?: Contact | null;
  onFormSubmit?: (data: any) => void;
  onFormSave?: (data: any) => void;
}

export const WillMarriedIndividualForm: React.FC<WillFormProps> = ({ matter, client, client2, onFormSubmit, onFormSave }) => {
    const [activeTab, setActiveTab] = useState("Personal/Family Information");

    const person1EffectiveLabel = client?.name || "Testator 1 (Self)";
    const person2EffectiveLabel = client2?.name || "Testator 2 (Spouse)";

    const methods = useForm({
        defaultValues: {
            trustor1_name: client?.name || "", 
            trustor1_aka: "",
            trustor1_gender: "Prefer not to say",
            trustor1_dob: "",
            trustor1_residence: "",
            trustor2_name: client2?.name || "", 
            trustor2_aka: "",
            trustor2_gender: "Prefer not to say",
            trustor2_dob: "",
            trustor2_residence: "",
            have_children: "No",
            children: [],
            any_deceased_children: "No",
            deceased_children: [],
            any_disinherited_children: "No",
            disinherited_children: [],

            name_guardians: "No",
            guardian1_name: "",
            guardian1_choice_type: "Single",
            guardian2_name: "",
            guardian2_choice_type: "Single",
            guardian_notes: "",
            spouse_auto_fiduciary: "Yes", // <<<< UPDATED DEFAULT VALUE HERE
            trustor1_fin_agent1_name: client2?.name || "",
            trustor1_fin_agent2_name: "",
            trustor1_fin_agent3_name: "",
            trustor1_fin_agents_acting: "Single",
            trustor2_fin_agent1_name: client?.name || "",
            trustor2_fin_agent2_name: "",
            trustor2_fin_agent3_name: "",
            trustor2_fin_agents_acting: "Single",
            trustor1_hc_agent1_name: client2?.name || "",
            trustor1_hc_agent2_name: "",
            trustor1_hc_agent3_name: "",
            // trustor1_hc_agents_acting: "Single", // Removed
            trustor2_hc_agent1_name: client?.name || "",
            trustor2_hc_agent2_name: "",
            trustor2_hc_agent3_name: "",
            // trustor2_hc_agents_acting: "Single", // Removed
            trustor1_ad_same_as_hc: "Yes",
            trustor2_ad_same_as_hc: "Yes",
            trustor1_ad_agent1_name: "",
            trustor1_ad_agent2_name: "",
            trustor1_ad_agent3_name: "",
            // trustor1_ad_agents_acting: "Single", // Removed
            trustor2_ad_agent1_name: "",
            trustor2_ad_agent2_name: "",
            trustor2_ad_agent3_name: "",
            // trustor2_ad_agents_acting: "Single", // Removed
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

            // Will Specific Default Values
            shared_pr_spouse_auto_first: "Yes", 
            shared_pr_same_as_financial_agents: "No", 
            pr_nominations_same_for_both_spouses: "Yes", 
            
            t1_pr_same_as_financial_agents: "No",
            t2_pr_same_as_financial_agents: "No",
            
            primary_personal_representatives_list: [{ name: "", relationship: "", address: "", notes: "", has_co_personal_representative: "No", co_personal_representative_name: "", co_personal_representative_relationship: "" }],
            are_personal_representatives_primary_joint: "No",
            primary_personal_representatives_acting_option: "Singly", 

            // Default for up to 2 successor sets (empty arrays by default)
            successor1_personal_representatives_list: [],
            are_personal_representatives_successor1_joint: "No",
            successor1_personal_representatives_acting_option: "Singly",

            successor2_personal_representatives_list: [],
            are_personal_representatives_successor2_joint: "No",
            successor2_personal_representatives_acting_option: "Singly",
            
            // Separate for Testator 1 if nominations are different
            t1_primary_personal_representatives_list: [{ name: "", relationship: "", address: "", notes: "", has_co_personal_representative: "No", co_personal_representative_name: "", co_personal_representative_relationship: "" }],
            t1_are_personal_representatives_primary_joint: "No",
            t1_primary_personal_representatives_acting_option: "Singly",
            
            t1_successor1_personal_representatives_list: [],
            t1_are_personal_representatives_successor1_joint: "No",
            t1_successor1_personal_representatives_acting_option: "Singly",

            t1_successor2_personal_representatives_list: [],
            t1_are_personal_representatives_successor2_joint: "No",
            t1_successor2_personal_representatives_acting_option: "Singly",

            // Separate for Testator 2 if nominations are different
            t2_primary_personal_representatives_list: [{ name: "", relationship: "", address: "", notes: "", has_co_personal_representative: "No", co_personal_representative_name: "", co_personal_representative_relationship: "" }],
            t2_are_personal_representatives_primary_joint: "No",
            t2_primary_personal_representatives_acting_option: "Singly",

            t2_successor1_personal_representatives_list: [],
            t2_are_personal_representatives_successor1_joint: "No",
            t2_successor1_personal_representatives_acting_option: "Singly",

            t2_successor2_personal_representatives_list: [],
            t2_are_personal_representatives_successor2_joint: "No",
            t2_successor2_personal_representatives_acting_option: "Singly",
            
            personal_representative_waive_bond: "Yes, waive bond requirement", 
            will_controlling_law_state: "", 
            will_investment_standard: "Prudent Investor", 
            no_contest_clause_will: "Insert No-Contest Clause",
            tpp_distribution_will: "Equally to Children", 
            tpp_distribution_will_specific_names: "",
            tpp_notes_will: "",
            any_specific_bequests_individuals_will: "No",
            specific_bequests_individuals_will_list: [],
            any_specific_bequests_charities_will: "No",
            specific_bequests_charities_will_list: [],
            
            will_residuary_distribution_primary_option: "All to surviving spouse. After death of both spouses, equal to children of the Testators (NOTE Group Options assume that ALL beneficiaries are joint children)", 
            will_residuary_beneficiaries_terms: [],

            ultimate_distribution_will: "Heirs at Law",
            ultimate_distribution_will_specific_names: [],
            notes_will_provisions_distribution: "",

            t1_cap_understands_planning: false,
            t1_cap_knows_children: false,
            t1_cap_knows_estate_value: false,
            t1_cap_understands_bequests: false,
            t1_cap_understands_powers: false,
            t2_cap_understands_planning: false,
            t2_cap_knows_children: false,
            t2_cap_knows_estate_value: false,
            t2_cap_understands_bequests: false,
            t2_cap_understands_powers: false,
            attorney_initials_capacity: "",
            notes_capacity_confirmation: "",
        }
    });

    const { handleSubmit, watch, formState: { errors }, getValues, setValue } = methods;

    useEffect(() => {
        if (client && !getValues('trustor1_name')) { 
            setValue('trustor1_name', client.name);
        }
         if (client2 && !getValues('trustor2_name')) { 
            setValue('trustor2_name', client2.name);
        }
        
    }, [client, client2, getValues, setValue]);


    const tabNames = [
        "Personal/Family Information", "Guardians & Fiduciaries", "General Will Provisions & Distribution", "Capacity Confirmation"
    ];

    const onSubmitHandler = (data: any) => {
        if (onFormSubmit) {
            onFormSubmit(data);
        } else {
            console.log("Will Questionnaire (Married) Form Submitted Data (standalone):", JSON.stringify(data, null, 2));
            toast({
                title: "Form Data Captured (Standalone)",
                description: "Will information has been processed. Check console for data.",
                variant: "default",
                duration: 7000,
            });
        }
    };

    const handleSaveDraft = () => {
        const currentData = getValues();
        console.log("Saving Will Questionnaire (Married) Draft:", JSON.stringify(currentData, null, 2));
        toast({ title: "Draft Saved", description: "Your progress has been saved for the Will. Check console for data." });
        if (onFormSave) {
            onFormSave(currentData);
        }
    };

    const handleNext = () => {
        const currentIndex = tabNames.indexOf(activeTab);
        if (currentIndex < tabNames.length - 1) {
            setActiveTab(tabNames[currentIndex + 1]);
            window.scrollTo(0, 0);
        }
    };

    const handlePrevious = () => {
        const currentIndex = tabNames.indexOf(activeTab);
        if (currentIndex > 0) {
            setActiveTab(tabNames[currentIndex - 1]);
            window.scrollTo(0, 0);
        }
    };

    const isLastTab = activeTab === tabNames[tabNames.length - 1];
    const isFirstTab = activeTab === tabNames[0];

    return (
        <FormProvider {...methods}>
            <div className="bg-card p-4 md:p-6 rounded-lg shadow-xl border border-border">
                <h2 className="text-2xl font-bold text-center text-primary mb-2">
                    Will Questionnaire (Married)
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-6">
                    Matter: {matter?.name || 'N/A'} | Testator 1 (Self): {person1EffectiveLabel} {client2 ? `| Testator 2 (Spouse): ${person2EffectiveLabel}`: ''}
                </p>

                <Tabs value={activeTab} onValueChange={(newTab) => { setActiveTab(newTab); window.scrollTo(0, 0); }} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 h-auto">
                        {tabNames.map(tabName => (
                            <TabsTrigger key={tabName} value={tabName} className="text-xs sm:text-sm px-2 py-2.5 h-auto whitespace-normal leading-tight data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                {tabName}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <form onSubmit={handleSubmit(onSubmitHandler)}>
                        <div className="mt-1 min-h-[400px] outline-none ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                            {activeTab === "Personal/Family Information" && <PersonalFamilyInfoTab person1Label={person1EffectiveLabel} person2Label={person2EffectiveLabel} />}
                            {activeTab === "Guardians & Fiduciaries" && <GuardiansFiduciariesTab person1Label={person1EffectiveLabel} person2Label={person2EffectiveLabel} />}
                            {activeTab === "General Will Provisions & Distribution" && <GeneralWillProvisionsAndDistributionTab person1Label={person1EffectiveLabel} person2Label={person2EffectiveLabel}/>}
                            {activeTab === "Capacity Confirmation" && <CapacityConfirmationTab person1Label={person1EffectiveLabel} person2Label={person2EffectiveLabel} />}
                        </div>

                        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                            <Button type="button" variant="outline" onClick={handlePrevious} disabled={isFirstTab}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Previous Tab
                            </Button>
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <Button type="button" variant="secondary" onClick={handleSaveDraft} className="w-full sm:w-auto">
                                    <Save className="mr-2 h-4 w-4" /> Save Draft
                                </Button>
                                {isLastTab ? (
                                    <Button type="submit" className="w-full sm:w-auto">
                                        <Send className="mr-2 h-4 w-4" /> Submit Form
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={handleNext} className="w-full sm:w-auto">
                                        Next Tab <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <Alert variant="destructive" className="mt-6">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Errors Found</AlertTitle>
                                <AlertDescription>
                                    Please review the form. Some required fields may be missing or have invalid entries. Navigate through the tabs to find and correct them.
                                </AlertDescription>
                            </Alert>
                        )}
                    </form>
                </Tabs>
            </div>
        </FormProvider>
    );
};
