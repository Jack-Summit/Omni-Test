
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
    DistributionTab, AdvancedProvisionsMarriedTab, CapacityConfirmationTab
} from './tab-components'; 
import type { Matter, Contact } from '@/lib/types';
import { toast } from "@/hooks/use-toast";


interface TrustInformationFormProps {
  matter: Matter | null;
  client: Contact | null; 
  client2?: Contact | null; 
  onFormSubmit?: (data: any) => void; 
  onFormSave?: (data: any) => void; 
}

export const RevocableLivingTrustMarriedJointForm: React.FC<TrustInformationFormProps> = ({ matter, client, client2, onFormSubmit, onFormSave }) => {
    const [activeTab, setActiveTab] = useState("Personal/Family Information");

    const methods = useForm({
        defaultValues: {
            // Personal/Family Information
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
            children: [{ name: "", dob: "", gender: "Prefer not to say", relationship: "Biological", child_of: "Both", phone: "", email: "" }],
            any_deceased_children: "No",
            deceased_children: [], 
            any_disinherited_children: "No",
            disinherited_children: [], 

            // Guardians & Fiduciaries
            name_guardians: "No",
            guardian1_name: "",
            guardian1_choice_type: "Single",
            guardian2_name: "",
            guardian2_choice_type: "Single",
            guardian_notes: "",
            
            spouse_auto_fiduciary: "Yes", 
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
            trustor2_hc_agent1_name: client?.name || "",
            trustor2_hc_agent2_name: "",
            trustor2_hc_agent3_name: "",

            trustor1_ad_same_as_hc: "Yes", 
            trustor2_ad_same_as_hc: "Yes", 
            trustor1_ad_agent1_name: "",
            trustor1_ad_agent2_name: "",
            trustor1_ad_agent3_name: "",
            trustor2_ad_agent1_name: "",
            trustor2_ad_agent2_name: "",
            trustor2_ad_agent3_name: "",

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

            // Trust Details
            trust_name: client && client2 ? `${client.name} and ${client2.name} Revocable Living Trust` : (client ? `${client.name} Revocable Living Trust` : "Revocable Living Trust"),
            trust_execution_type: "New", 
            trust_original_date: "", 
            trust_authority_amend: "", 
            trust_amendment_number: "", 
            prior_amendments_restatements: "", 
            current_trust_date: "", 
            
            trust_controlling_law_state: "",
            trust_prenuptial_language: "Yes",
            trust_investment_standard: "Prudent Investor",
            trust_investment_standard_surviving_spouse: "No",
            trust_no_contest_clause: "Insert", 
            trust_co_trustee_act_independently: "Yes",
            trust_initial_trustor1: true,
            trust_initial_trustor1_act_independently: "Yes",
            trust_initial_trustor2: true,
            trust_initial_trustor2_act_independently: "Yes",
            trust_initial_additional_trustee_exists: false,
            trust_initial_additional_trustee_name: "",
            trust_initial_additional_trustee_act_independently: "Yes",
            
            successor_trustees_same_as_financial_agents: "Same as Financial Agents", 
            are_successor_trustees_joint: "Yes", 
            successor_trustee_option: "05", 
            joint_successor_trustees: [{ name: "", role_type: "Individual", relationship: "", address: "", phone: "", email: "", has_co_trustee: "No", co_trustees: [], co_trustees_acting_option: "Jointly" }], 
            trustor1_successor_trustees: [{ name: "", role_type: "Individual", relationship: "", address: "", phone: "", email: "", has_co_trustee: "No", co_trustees: [], co_trustees_acting_option: "Jointly" }],
            trustor2_successor_trustees: [{ name: "", role_type: "Individual", relationship: "", address: "", phone: "", email: "", has_co_trustee: "No", co_trustees: [], co_trustees_acting_option: "Jointly" }],
            
            qdot_trustee_named: "No",
            qdot_trustee1_name: "",
            qdot_trustee2_name: "",
            qdot_co_trustees: "No",
            want_trust_protector: "No",
            trust_protector_name: "",
            survivor_power_change_trustee: "No",
            survivor_can_appoint_special_co_trustee: "No",
            removal_trustees_by_others_criteria: "Majority in INTEREST",
            want_incapacity_panel: "No", 
            trustor1_incapacity_panel_member1: "",
            trustor1_incapacity_panel_member2: "",
            trustor1_incapacity_panel_member3: "",
            trustor1_incapacity_panel_consent: "Unanimous Consent",
            trustor2_incapacity_panel_member1: "",
            trustor2_incapacity_panel_member2: "",
            trustor2_incapacity_panel_member3: "",
            trustor2_incapacity_panel_consent: "Unanimous Consent",
            notes_trust_details: "",

            // Distribution
            draft_three_certificates: "No", 
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

            residual_diff_group_t1_option_selected: "Equal and Immediate",
            t1_group_min_age_trustee: "",
            t1_group_age_income_dists: "",
            t1_group_terms_income_option: "HEMS",
            t1_group_terms_principal_option: "HEMS Only",
            t1_group_terms_age1: "", t1_group_terms_age2: "", t1_group_terms_age3: "",
            t1_group_terms_lapse_provision: "Per Stirpes to Beneficiary\'s Issue",
            t1_group_asset_protection_invest_trustee_name: "",
            t1_group_gst_spec_age: "",
            t1_group_gst_tru_rate: "",
            t1_group_beneficiary_trustee_option: "Same as then Serving Successor",
            t1_group_beneficiary_trustee_3rd_party1: "",
            t1_group_beneficiary_trustee_3rd_party2: "",
            t1_group_beneficiary_trustee_3rd_party_acting: "Jointly",
            t1_group_beneficiary_trustee_ben_3rd_party_name: "",
            t1_group_beneficiary_trustee_ben_3rd_party_acting: "Jointly",
            t1_group_beneficiary_trustee_ben_age: "",
            t1_group_incentive_clauses: [],
            t1_group_incentive_clauses_other: "",
            t1_group_distribution_notes: "",

            residual_diff_group_t2_option_selected: "Equal and Immediate",
            t2_group_min_age_trustee: "",
            t2_group_age_income_dists: "",
            t2_group_terms_income_option: "HEMS",
            t2_group_terms_principal_option: "HEMS Only",
            t2_group_terms_age1: "", t2_group_terms_age2: "", t2_group_terms_age3: "",
            t2_group_terms_lapse_provision: "Per Stirpes to Beneficiary\'s Issue",
            t2_group_asset_protection_invest_trustee_name: "",
            t2_group_gst_spec_age: "",
            t2_group_gst_tru_rate: "",
            t2_group_beneficiary_trustee_option: "Same as then Serving Successor",
            t2_group_beneficiary_trustee_3rd_party1: "",
            t2_group_beneficiary_trustee_3rd_party2: "",
            t2_group_beneficiary_trustee_3rd_party_acting: "Jointly",
            t2_group_beneficiary_trustee_ben_3rd_party_name: "",
            t2_group_beneficiary_trustee_ben_3rd_party_acting: "Jointly",
            t2_group_beneficiary_trustee_ben_age: "",
            t2_group_incentive_clauses: [],
            t2_group_incentive_clauses_other: "",
            t2_group_distribution_notes: "",
            
            residual_beneficiaries: [], 
            ultimate_distribution_pattern: "Same", 
            ultimate_same_option: "Same Intestate", 
            ultimate_t1_option: "Trustor One Intestate", 
            ultimate_t2_option: "Trustor Two Intestate", 
            ultimate_joint_beneficiaries: [], 
            ultimate_t1_beneficiaries: [], 
            ultimate_t2_beneficiaries: [], 
            notes_distribution: "", 

            // Advanced Provisions
            funding_qualified_asset_checklist: false,
            funding_qualified_beneficiary_option: "Spouse first",
            funding_qualified_trustor1_beneficiaries: "",
            funding_qualified_trustor2_beneficiaries: "",
            funding_non_qualified_asset_checklist: false,
            funding_non_qualified_beneficiary_option: "Spouse first",
            funding_non_qualified_trustor1_beneficiaries: "",
            funding_non_qualified_trustor2_beneficiaries: "",
            funding_checklist_notes: "",
            adv_prov_duty_to_account_surviving: "No", 
            adv_prov_duty_to_account_successor: "Default UTC",
            adv_prov_trust_property_tic_shares: false,
            adv_prov_property_agreement_provision: "Aggregate Theory CP",
            adv_prov_maintain_cp_status: "Not Applicable",
            adv_prov_life_insurance_allocation: "Neither",
            adv_prov_trustor_lifetime_rights_selection: "01",
            adv_prov_qtip_recovery_rights: "Waive Recovery Rights",
            adv_prov_trust_division_type: "A/B Split",
            adv_prov_flex_trust: "Yes", 
            adv_prov_ab_split_funding_formula: "Fractional Division",
            adv_prov_abc_split_funding_formula: "Fractional Division/QTIP", 
            adv_prov_survivor_trust_invasion_power: "No", 
            adv_prov_survivor_trust_irrevocable: "No", 
            adv_prov_family_trust_admin_option: "PI5LPOA",
            adv_prov_family_trust_pi_desc_needs: "No", 
            adv_prov_family_trust_pilpoa_desc_needs: "No", 
            adv_prov_family_trust_dpt_desc_needs: "No", 
            adv_prov_family_trust_tru_desc_needs: "No", 
            adv_prov_family_trust_tru_rate: "",
            adv_prov_family_trust_lpoa_tax_step_up: "No", 
            adv_prov_family_trust_lpoa_survivor_to_descendants: "No", 
            adv_prov_marital_trust_admin_option: "DPTLPOA_MT", 
            adv_prov_marital_trust_exempt_tru_rate: "",
            adv_prov_marital_trust_non_exempt_tru_rate: "",
            notes_advanced_provisions: "",
            
            // Capacity Confirmation
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

    const { handleSubmit, watch, formState: { errors }, setValue, getValues } = methods;
    
    const person1EffectiveLabel = client?.name || "Trustor 1";
    const person2EffectiveLabel = client2?.name || "Trustor 2";

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
        if (client2 && !getValues('trustor2_name')) {
            setValue('trustor2_name', client2.name);
        }

        const trustBaseName = client?.name ? `${client.name}${client2 ? ` and ${client2.name}` : ''}` : matter?.name;

        if (matter && trustBaseName && !getValues('trust_name')) {
            setValue('trust_name', `${trustBaseName} Revocable Living Trust`);
        }
        
    }, [getValues, setValue, client, client2, matter, watch('trust_execution_type')]);


    const watchSuccessorTrusteesSameAsFinAgents = watch("successor_trustees_same_as_financial_agents");
    const watchAreSuccessorTrusteesJoint = watch("are_successor_trustees_joint");

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
                co_trustees: [], 
                co_trustees_acting_option: "Jointly", 
            });

            const finAgentsT1 = [
                getValues('trustor1_fin_agent1_name'),
                getValues('trustor1_fin_agent2_name'),
                getValues('trustor1_fin_agent3_name'),
            ].filter(Boolean).map(mapAgentToTrustee);

            const finAgentsT2 = [
                getValues('trustor2_fin_agent1_name'),
                getValues('trustor2_fin_agent2_name'),
                getValues('trustor2_fin_agent3_name'),
            ].filter(Boolean).map(mapAgentToTrustee);

            if (watchAreSuccessorTrusteesJoint === 'Yes') {
                setValue('joint_successor_trustees', finAgentsT1.length > 0 ? finAgentsT1 : []);
                setValue('trustor1_successor_trustees', []);
                setValue('trustor2_successor_trustees', []);
            } else { 
                setValue('trustor1_successor_trustees', finAgentsT1.length > 0 ? finAgentsT1 : []);
                setValue('trustor2_successor_trustees', finAgentsT2.length > 0 ? finAgentsT2 : []);
                setValue('joint_successor_trustees', []);
            }
        }
    }, [
        watchSuccessorTrusteesSameAsFinAgents,
        watchAreSuccessorTrusteesJoint,
        getValues,
        setValue,
        watch('trustor1_fin_agent1_name'),
        watch('trustor1_fin_agent2_name'),
        watch('trustor1_fin_agent3_name'),
        watch('trustor2_fin_agent1_name'),
        watch('trustor2_fin_agent2_name'),
        watch('trustor2_fin_agent3_name'),
    ]);

    const tabNames = [
        "Personal/Family Information", "Guardians & Fiduciaries", "Trust Details",
        "Distribution", "Advanced Provisions", "Capacity Confirmation"
    ];

    const onSubmitHandler = (data: any) => {
        if (onFormSubmit) {
            onFormSubmit(data);
        } else {
            console.log("Form Submitted Data (RLT Joint - standalone):", JSON.stringify(data, null, 2));
            toast({ 
                title: "Form Data Captured (Standalone)", 
                description: "Trust information has been processed. Check console for data.",
                variant: "default",
                duration: 7000,
            });
        }
    };

    const handleSaveDraft = () => {
        const currentData = getValues();
        console.log("Saving Draft:", JSON.stringify(currentData, null, 2));
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
                    Revocable Living Trust Questionnaire (Married Couple - Joint)
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-6">
                    Matter: {matter?.name || 'N/A'} | Clients: {person1EffectiveLabel}{client2 ? ` & ${person2EffectiveLabel}` : ''}
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
                            {activeTab === "Personal/Family Information" && <PersonalFamilyInfoTab person1Label={person1EffectiveLabel} person2Label={person2EffectiveLabel} />}
                            {activeTab === "Guardians & Fiduciaries" && <GuardiansFiduciariesTab person1Label={person1EffectiveLabel} person2Label={person2EffectiveLabel} />}
                            {activeTab === "Trust Details" && <TrustDetailsTab watchSuccessorTrusteesSameAsFinAgents={watchSuccessorTrusteesSameAsFinAgents} watchAreSuccessorTrusteesJoint={watchAreSuccessorTrusteesJoint} person1Label={person1EffectiveLabel} person2Label={person2EffectiveLabel}/>}
                            {activeTab === "Distribution" && <DistributionTab person1Label={person1EffectiveLabel} person2Label={person2EffectiveLabel} />}
                            {activeTab === "Advanced Provisions" && <AdvancedProvisionsMarriedTab person1Label={person1EffectiveLabel} person2Label={person2EffectiveLabel} />}
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
