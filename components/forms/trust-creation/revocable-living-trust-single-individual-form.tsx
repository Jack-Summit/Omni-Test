
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
    PersonalFamilyInfoTab, GuardiansFiduciariesTab, TrustDetailsTab,
    DistributionTab, CapacityConfirmationTab, AdvancedProvisionsSingleTab
} from './tab-components'; 
import type { Matter, Contact } from '@/lib/types';
import { toast } from "@/hooks/use-toast";


interface TrustInformationFormProps {
  matter: Matter | null;
  client: Contact | null; 
  onFormSubmit?: (data: any) => void; 
  onFormSave?: (data: any) => void; 
}

export const RevocableLivingTrustSingleIndividualForm: React.FC<TrustInformationFormProps> = ({ matter, client, onFormSubmit, onFormSave }) => {
    const [activeTab, setActiveTab] = useState("Personal/Family Information");

    const testatorLabel = client?.name || "Trustor";

    const methods = useForm({
        defaultValues: {
            // --- Personal/Family Information (Single Trustor) ---
            trustor1_name: client?.name || "",
            trustor1_aka: "",
            trustor1_gender: "Prefer not to say",
            trustor1_dob: "",
            trustor1_residence: "",
            have_children: "No",
            children: [], 
            any_deceased_children: "No",
            deceased_children: [], 
            any_disinherited_children: "No",
            disinherited_children: [], 

            // --- Guardians & Fiduciaries (Single Trustor) ---
            name_guardians: "No",
            guardian1_name: "",
            guardian1_choice_type: "Single",
            guardian2_name: "",
            guardian2_choice_type: "Single",
            guardian_notes: "",
            
            trustor1_fin_agent1_name: "", 
            trustor1_fin_agent2_name: "",
            trustor1_fin_agent3_name: "",
            trustor1_fin_agents_acting: "Single", 
            
            trustor1_hc_agent1_name: "",
            trustor1_hc_agent2_name: "",
            trustor1_hc_agent3_name: "",
            
            trustor1_ad_same_as_hc: "Yes", 
            
            trustor1_ad_agent1_name: "",
            trustor1_ad_agent2_name: "",
            trustor1_ad_agent3_name: "",
            
            trustor1_additional_hipaa_authorization: "No",
            trustor1_additional_hipaa_names: "",
            trustor1_appoint_disposition_agent: "No",
            trustor1_disposition_agent_source: "",
            trustor1_disposition_agent_other_name: "",
            

            // --- Trust Details (Single Trustor) ---
            trust_name: client ? `${client.name} Revocable Living Trust` : "Revocable Living Trust",
            trust_execution_type: "New",
            trust_original_date: "", 
            trust_authority_amend: "", 
            trust_amendment_number: "",
            prior_amendments_restatements: "", 
            current_trust_date: "", 
            
            trust_controlling_law_state: "",
            trust_investment_standard: "Prudent Investor",
            trust_no_contest_clause: "Insert", 
            trust_co_trustee_act_independently: "Yes", 
            trust_initial_trustor1: true, 
            trust_initial_trustor1_act_independently: "Yes", 
            trust_initial_additional_trustee_exists: false,
            trust_initial_additional_trustee_name: "",
            trust_initial_additional_trustee_act_independently: "Yes",
            
            successor_trustees_same_as_financial_agents: "Specify Different", 
            trustor1_successor_trustees: [{ 
                name: "", role_type: "Individual", relationship: "", address: "", phone: "", email: "",
                has_co_trustee: "No",
                co_trustees: [],
                co_trustees_acting_option: "Jointly"
            }], 
            
            want_trust_protector: "No",
            trust_protector_name: "",
            removal_trustees_by_others_criteria: "Majority in INTEREST",
            want_incapacity_panel: "No", 
            trustor1_incapacity_panel_member1: "",
            trustor1_incapacity_panel_member2: "",
            trustor1_incapacity_panel_member3: "",
            trustor1_incapacity_panel_consent: "Unanimous Consent",
            notes_trust_details: "",

            // --- Distribution (Single Trustor) ---
            tpp_distribution: "Equally to Children", 
            tpp_equally_to_names: "", 
            tpp_other_notes: "", 
            any_specific_distributions_charity: "No",
            charity_distributions: [], 
            any_specific_distributions_individuals: "No",
            individual_gifts: [], 
            common_pot_trust_option: "No Common Pot Trust", 
            common_pot_specified_age: "", 
            common_pot_alt_specified_age: "", 
            retirement_preservation_trust: "No",
            retirement_preservation_names_match_residual: "Yes", 
            retirement_preservation_names_list: "", 
            retirement_trust_type: "Conduit", 
            retirement_accumulation_distribution_method: "Indefinite", // New default
            retirement_accumulation_specified_age: "", // New default
            retirement_trust_optional_poa: "Yes, Each Beny", 
            retirement_trust_optional_poa_except: "", 
            beneficiary_nuptial_required: "No", 
            
            residual_distribution_main_option: "Group", 
            
            residual_group_option_selected: "Equal and Immediate", 
            group_min_age_trustee: "", 
            group_age_income_dists: "", 
            group_terms_income_option: 'HEMS',
            group_terms_principal_option: 'HEMS Only',
            group_terms_age1: '', group_terms_age2: '', group_terms_age3: '',
            group_terms_lapse_provision: 'Per Stirpes to Beneficiary\'s Issue',
            group_asset_protection_invest_trustee_name: "", 
            group_gst_spec_age: "", 
            group_gst_tru_rate: "", 
            group_beneficiary_trustee_option: 'Same as then Serving Successor',
            group_beneficiary_trustee_3rd_party1: "", 
            group_beneficiary_trustee_3rd_party2: "", 
            group_beneficiary_trustee_3rd_party_acting: "Jointly", 
            group_beneficiary_trustee_ben_3rd_party_name: "", 
            group_beneficiary_trustee_ben_3rd_party_acting: "Jointly", 
            group_beneficiary_trustee_ben_age: "", 
            group_incentive_clauses: [],
            group_incentive_clauses_other: "",
            group_distribution_notes: "",
            
            residual_beneficiaries: [], 
            ultimate_same_option: "Same Intestate", 
            ultimate_joint_beneficiaries: [], 
            notes_distribution: "", 

            // --- Advanced Provisions (Single Trustor) ---
            funding_qualified_asset_checklist: false,
            funding_qualified_beneficiary_option: "Beneficiaries same as residual", 
            funding_qualified_trustor1_beneficiaries: "",
            funding_non_qualified_asset_checklist: false, 
            funding_non_qualified_beneficiary_option: "Beneficiaries same as residual", 
            funding_non_qualified_trustor1_beneficiaries: "", 
            funding_checklist_notes: "", 
            adv_prov_duty_to_account_successor: "Default UTC",
            notes_advanced_provisions: "",
            
            // --- Capacity Confirmation (Single Trustor) ---
            t1_cap_understands_planning: false,
            t1_cap_knows_children: false,
            t1_cap_knows_estate_value: false,
            t1_cap_understands_bequests: false,
            t1_cap_understands_powers: false,
            attorney_initials_capacity: "",
            notes_capacity_confirmation: "",
        }
    });

    const { handleSubmit, watch, formState: { errors }, setValue, getValues, control } = methods; // Added control here
    
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        if (!getValues('current_trust_date') && getValues('trust_execution_type') === 'New') {
             setValue('current_trust_date', today);
             setValue('trust_original_date', ''); 
             setValue('trust_authority_amend', '');
             setValue('trust_amendment_number', '');
             setValue('prior_amendments_restatements', '');
        } else if (getValues('trust_execution_type') === 'Restatement' && !getValues('current_trust_date')) {
            setValue('current_trust_date', today);
        }

        if (client && !getValues('trustor1_name')) {
            setValue('trustor1_name', client.name);
        }

        if (client && !getValues('trust_name')) {
            setValue('trust_name', `${client.name} Revocable Living Trust`);
        }
        
    }, [getValues, setValue, client, matter, watch('trust_execution_type')]);

    const watchSuccessorTrusteesSameAsFinAgents = watch("successor_trustees_same_as_financial_agents");

    useEffect(() => {
        if (watchSuccessorTrusteesSameAsFinAgents === 'Same as Financial Agents') {
            const mapAgentToTrustee = (agentName: string | undefined) => ({
                name: agentName || "",
                role_type: "Individual",
                relationship: "", 
                address: "",
                phone: "",
                email: "",
                has_co_trustee: "No",
                co_trustee_name: "",
                co_trustee_role_type: "Individual",
                co_trustee_relationship: "",
                co_trustees_acting_option: "Jointly",
                co_trustees: [], 
            });

            const finAgentsT1 = [
                getValues('trustor1_fin_agent1_name'),
                getValues('trustor1_fin_agent2_name'),
                getValues('trustor1_fin_agent3_name'),
            ].filter(Boolean).map(mapAgentToTrustee);

            setValue('trustor1_successor_trustees', finAgentsT1.length > 0 ? finAgentsT1 : [{
                name: "", role_type: "Individual", relationship: "", address: "", phone: "", email: "",
                has_co_trustee: "No", co_trustees: [], co_trustees_acting_option: "Jointly"
            }]);
        } else if (watchSuccessorTrusteesSameAsFinAgents === "Specify Different" && getValues('trustor1_successor_trustees')?.length === 0) {
            setValue('trustor1_successor_trustees', [{
                name: "", role_type: "Individual", relationship: "", address: "", phone: "", email: "",
                has_co_trustee: "No", co_trustees: [], co_trustees_acting_option: "Jointly"
            }]);
        }
    }, [
        watchSuccessorTrusteesSameAsFinAgents,
        getValues,
        setValue,
        watch('trustor1_fin_agent1_name'),
        watch('trustor1_fin_agent2_name'),
        watch('trustor1_fin_agent3_name'),
    ]);

    const tabNames = [
        "Personal/Family Information", "Guardians & Fiduciaries", "Trust Details",
        "Distribution", "Advanced Provisions", "Capacity Confirmation"
    ];

    const onSubmitHandler = (data: any) => {
        if (onFormSubmit) {
            onFormSubmit(data);
        } else {
            console.log("Single Individual Trust Form Submitted Data (standalone):", JSON.stringify(data, null, 2));
            toast({ 
                title: "Form Data Captured (Standalone)", 
                description: "Single individual trust information has been processed. Check console for data.",
                variant: "default",
                duration: 7000,
            });
        }
    };

    const handleSaveDraft = () => {
        const currentData = getValues();
        console.log("Saving Single Individual Trust Draft:", JSON.stringify(currentData, null, 2));
        toast({ title: "Draft Saved", description: "Your progress has been saved. Check console for data." });
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
                    Revocable Living Trust Questionnaire (Single Individual)
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-6">
                    Matter: {matter?.name || 'N/A'} | Trustor: {testatorLabel}
                </p>

                <Tabs value={activeTab} onValueChange={(newTab) => {setActiveTab(newTab); window.scrollTo(0, 0);}} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-6 h-auto">
                        {tabNames.map(tabName => (
                            <TabsTrigger key={tabName} value={tabName} className="text-xs sm:text-sm px-2 py-2.5 h-auto whitespace-normal leading-tight data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                {tabName}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <form onSubmit={handleSubmit(onSubmitHandler)}>
                        <div className="mt-1 min-h-[400px] outline-none ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                            {activeTab === "Personal/Family Information" && <PersonalFamilyInfoTab person1Label={testatorLabel} />}
                            {activeTab === "Guardians & Fiduciaries" && <GuardiansFiduciariesTab person1Label={testatorLabel} />}
                            {activeTab === "Trust Details" && <TrustDetailsTab person1Label={testatorLabel} isSingleForm={true} watchSuccessorTrusteesSameAsFinAgents={watchSuccessorTrusteesSameAsFinAgents} />}
                            {activeTab === "Distribution" && <DistributionTab person1Label={testatorLabel} isSingleForm={true} />}
                            {activeTab === "Advanced Provisions" && <AdvancedProvisionsSingleTab person1Label={testatorLabel} control={control} errors={errors} watch={watch} getValues={getValues} setValue={setValue}/>}
                            {activeTab === "Capacity Confirmation" && <CapacityConfirmationTab person1Label={testatorLabel} control={control} errors={errors} getValues={getValues} setValue={setValue} />}
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

