
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
} from './tab-components'; // Reused
import {
    TrustDetailsSeparateTab, DistributionSeparateTab, AdvancedProvisionsSeparateTab
} from './tab-components-separate'; // These should be correctly defined in tab-components-separate.tsx
import type { Matter, Contact } from '@/lib/types';
import { toast } from "@/hooks/use-toast";

interface TrustInformationFormProps {
  matter: Matter | null;
  client: Contact | null;
  client2?: Contact | null;
  onFormSubmit?: (data: any) => void;
  onFormSave?: (data: any) => void;
}

export const RevocableLivingTrustMarriedSeparateForm: React.FC<TrustInformationFormProps> = ({ matter, client, client2, onFormSubmit, onFormSave }) => {
    const [activeTab, setActiveTab] = useState("Personal/Family Information");

    const person1EffectiveLabel = client?.name || "Trustor 1";
    const person2EffectiveLabel = client2?.name || "Trustor 2";

    const defaultTrusteeObject = { name: "", role_type: "Individual", relationship: "", address: "", phone: "", email: "", has_co_trustee: "No", co_trustees: [], co_trustees_acting_option: "Jointly" };

    const methods = useForm({
        defaultValues: {
            // --- Personal/Family Information (Same as Joint) ---
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

            // --- Guardians & Fiduciaries (Same as Joint) ---
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

            // --- Trust Details (Separate for each trust) ---
            trustor1_trust_name: client ? `${client.name}\\\'s Revocable Living Trust` : "",
            trustor1_trust_execution_type: "New",
            trustor1_trust_original_date: "",
            trustor1_trust_authority_amend: "",
            trustor1_prior_amendments_restatements: "",
            trustor1_current_trust_date: "",
            trustor1_trust_status: "New",
            trustor1_trust_controlling_law_state: "",
            trustor1_trust_prenuptial_language: "Yes",
            trustor1_trust_investment_standard: "Prudent Investor",
            trustor1_trust_no_contest_clause: "Insert",
            trustor1_notes_trust_details: "",

            trustor2_trust_name: client2 ? `${client2.name}\\\'s Revocable Living Trust` : "",
            trustor2_trust_execution_type: "New",
            trustor2_trust_original_date: "",
            trustor2_trust_authority_amend: "",
            trustor2_prior_amendments_restatements: "",
            trustor2_current_trust_date: "",
            trustor2_trust_status: "New",
            trustor2_trust_controlling_law_state: "",
            trustor2_trust_prenuptial_language: "Yes",
            trustor2_trust_investment_standard: "Prudent Investor",
            trustor2_trust_no_contest_clause: "Insert",
            trustor2_notes_trust_details: "",

            shared_trust_co_trustee_act_independently: "Yes",
            shared_successor_trustees_same_as_financial_agents: "Same as Financial Agents",
            shared_are_successor_trustees_joint: "Yes",
            shared_successor_trustee_option: "05",
            shared_joint_successor_trustees: [defaultTrusteeObject],
            shared_trustor1_successor_trustees: [defaultTrusteeObject],
            shared_trustor2_successor_trustees: [defaultTrusteeObject],
            
            // QDOT per Trustor
            trustor1_qdot_trustee_named: "No",
            trustor1_qdot_trustee1_name: "",
            trustor1_qdot_trustee2_name: "",
            trustor1_qdot_co_trustees: "No",
            trustor2_qdot_trustee_named: "No",
            trustor2_qdot_trustee1_name: "",
            trustor2_qdot_trustee2_name: "",
            trustor2_qdot_co_trustees: "No",

            // Trust Protector per Trustor
            trustor1_want_trust_protector: "No",
            trustor1_trust_protector_name: "",
            trustor2_want_trust_protector: "No",
            trustor2_trust_protector_name: "",
            
            trustor1_removal_trustees_by_others_criteria: "Majority in INTEREST",
            trustor2_removal_trustees_by_others_criteria: "Majority in INTEREST",

            // Incapacity Panel per Trustor
            trustor1_want_incapacity_panel: "No",
            trustor1_incapacity_panel_member1: "",
            trustor1_incapacity_panel_member2: "",
            trustor1_incapacity_panel_member3: "",
            trustor1_incapacity_panel_consent: "Unanimous Consent",
            trustor2_want_incapacity_panel: "No",
            trustor2_incapacity_panel_member1: "",
            trustor2_incapacity_panel_member2: "",
            trustor2_incapacity_panel_member3: "",
            trustor2_incapacity_panel_consent: "Unanimous Consent",

            // --- Distribution (Separate for each trust) ---
            trustor1_tpp_distribution: "Equally to Children",
            trustor1_tpp_equally_to_names: "",
            trustor1_tpp_other_notes: "",
            trustor1_any_specific_distributions_charity: "No",
            trustor1_charity_distributions: [],
            trustor1_any_specific_distributions_individuals: "No",
            trustor1_individual_gifts: [],
            trustor1_residual_distribution_main_option: "Group",
            trustor1_residual_group_option_selected: "Equal and Immediate",
            trustor1_group_min_age_trustee: "",
            trustor1_group_age_income_dists: "",
            trustor1_group_terms_income_option: 'HEMS',
            trustor1_group_terms_principal_option: 'HEMS Only',
            trustor1_group_terms_age1: '',
            trustor1_group_terms_age2: '',
            trustor1_group_terms_age3: '',
            trustor1_group_terms_lapse_provision: 'Per Stirpes to Beneficiary\'s Issue',
            trustor1_group_asset_protection_invest_trustee_name: "",
            trustor1_group_gst_spec_age: "",
            trustor1_group_gst_tru_rate: "",
            trustor1_group_beneficiary_trustee_option: 'Same as then Serving Successor',
            trustor1_group_beneficiary_trustee_3rd_party1: "",
            trustor1_group_beneficiary_trustee_3rd_party2: "",
            trustor1_group_beneficiary_trustee_3rd_party_acting: "Jointly",
            trustor1_group_beneficiary_trustee_ben_3rd_party_name: "",
            trustor1_group_beneficiary_trustee_ben_3rd_party_acting: "Jointly",
            trustor1_group_beneficiary_trustee_ben_age: "",
            trustor1_group_incentive_clauses_other: "",
            trustor1_group_distribution_notes: "",
            trustor1_residual_beneficiaries: [],
            trustor1_ultimate_distribution_pattern: "Same",
            trustor1_ultimate_same_option: "Same Intestate",
            trustor1_ultimate_t1_option: "Trustor One Intestate",
            trustor1_ultimate_joint_beneficiaries: [],
            trustor1_notes_distribution: "",

            trustor2_tpp_distribution: "Equally to Children",
            trustor2_tpp_equally_to_names: "",
            trustor2_tpp_other_notes: "",
            trustor2_any_specific_distributions_charity: "No",
            trustor2_charity_distributions: [],
            trustor2_any_specific_distributions_individuals: "No",
            trustor2_individual_gifts: [],
            trustor2_residual_distribution_main_option: "Group",
            trustor2_residual_group_option_selected: "Equal and Immediate", 
            t2_group_min_age_trustee: "",
            t2_group_age_income_dists: "",
            t2_group_terms_income_option: 'HEMS',
            t2_group_terms_principal_option: 'HEMS Only',
            t2_group_terms_age1: '',
            t2_group_terms_age2: '',
            t2_group_terms_age3: '',
            t2_group_terms_lapse_provision: 'Per Stirpes to Beneficiary\'s Issue',
            t2_group_asset_protection_invest_trustee_name: "",
            t2_group_gst_spec_age: "",
            t2_group_gst_tru_rate: "",
            t2_group_beneficiary_trustee_option: 'Same as then Serving Successor',
            t2_group_beneficiary_trustee_3rd_party1: "",
            t2_group_beneficiary_trustee_3rd_party2: "",
            t2_group_beneficiary_trustee_3rd_party_acting: "Jointly",
            t2_group_beneficiary_trustee_ben_3rd_party_name: "",
            t2_group_beneficiary_trustee_ben_3rd_party_acting: "Jointly",
            t2_group_beneficiary_trustee_ben_age: "",
            t2_group_incentive_clauses_other: "",
            t2_group_distribution_notes: "", 
            trustor2_residual_beneficiaries: [],
            trustor2_ultimate_distribution_pattern: "Same",
            trustor2_ultimate_same_option: "Same Intestate",
            trustor2_ultimate_t2_option: "Trustor Two Intestate",
            trustor2_ultimate_joint_beneficiaries: [],
            trustor2_notes_distribution: "",

            common_pot_trust_option: "No Common Pot Trust",
            common_pot_specified_age: "",
            common_pot_alt_specified_age: "",
            retirement_preservation_trust: "No",
            retirement_preservation_names_match_residual: "Yes",
            retirement_preservation_names_list: "",
            retirement_trust_type: "Conduit",
            retirement_accumulation_distribution_method: "Indefinite",
            retirement_accumulation_specified_age: "",
            retirement_trust_optional_poa: "Yes, Each Beny",
            retirement_trust_optional_poa_except: "",
            beneficiary_nuptial_required: "No",
            
            // Advanced Provisions
            trustor1_funding_qualified_asset_checklist: false,
            trustor1_funding_qualified_beneficiary_option: "Beneficiaries same as residual",
            trustor1_funding_qualified_other_beneficiaries: "",
            trustor1_funding_non_qualified_asset_checklist: false,
            trustor1_funding_non_qualified_beneficiary_option: "Beneficiaries same as residual",
            trustor1_funding_non_qualified_other_beneficiaries: "",

            trustor2_funding_qualified_asset_checklist: false,
            trustor2_funding_qualified_beneficiary_option: "Beneficiaries same as residual",
            trustor2_funding_qualified_other_beneficiaries: "",
            trustor2_funding_non_qualified_asset_checklist: false,
            trustor2_funding_non_qualified_beneficiary_option: "Beneficiaries same as residual",
            trustor2_funding_non_qualified_other_beneficiaries: "",

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
            trustor1_adv_prov_admin_option: "PI5LPOA",
            trustor2_adv_prov_admin_option: "PI5LPOA",
            notes_advanced_provisions: "",

            // --- Capacity Confirmation (Same as Joint) ---
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

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        if (!getValues('trustor1_current_trust_date') && getValues('trustor1_trust_execution_type') === 'New') {
             setValue('trustor1_current_trust_date', today);
        }
        if (!getValues('trustor2_current_trust_date') && getValues('trustor2_trust_execution_type') === 'New') {
             setValue('trustor2_current_trust_date', today);
        }

        if (client && !getValues('trustor1_name')) {
            setValue('trustor1_name', client.name);
        }
        if (client2 && !getValues('trustor2_name')) {
            setValue('trustor2_name', client2.name);
        }

        if (client && !getValues('trustor1_trust_name')) {
            setValue('trustor1_trust_name', `${client.name}\\\'s Revocable Living Trust`);
        }
        if (client2 && !getValues('trustor2_trust_name')) {
            setValue('trustor2_trust_name', `${client2.name}\\\'s Revocable Living Trust`);
        }

        const spouseAuto = getValues("spouse_auto_fiduciary");
        if (spouseAuto === "Yes") {
            if (client2 && !getValues("trustor1_fin_agent1_name")) setValue("trustor1_fin_agent1_name", client2.name);
            if (client2 && !getValues("trustor1_hc_agent1_name")) setValue("trustor1_hc_agent1_name", client2.name);
            if (client && !getValues("trustor2_fin_agent1_name")) setValue("trustor2_fin_agent1_name", client.name);
            if (client && !getValues("trustor2_hc_agent1_name")) setValue("trustor2_hc_agent1_name", client.name);
        }

    }, [getValues, setValue, client, client2, matter, watch("spouse_auto_fiduciary")]);

    const watchSuccessorTrusteesSameAsFinAgents = watch("shared_successor_trustees_same_as_financial_agents");
    const watchAreSuccessorTrusteesJoint = watch("shared_are_successor_trustees_joint");

    useEffect(() => {
        const shouldUpdateBasedOnFinancialAgents = watchSuccessorTrusteesSameAsFinAgents === 'Same as Financial Agents';

        if (shouldUpdateBasedOnFinancialAgents) {
            const mapAgentToTrustee = (agentName: string | undefined) => ({
                name: agentName || "", role_type: "Individual", relationship: "", address: "", phone: "", email: "",
                has_co_trustee: "No", co_trustee_name: "", co_trustee_role_type: "Individual",
                co_trustee_relationship: "", co_trustees_acting_option: "Jointly",
                co_trustees: [],
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
                setValue('shared_joint_successor_trustees', finAgentsT1.length > 0 ? finAgentsT1 : (finAgentsT2.length > 0 ? finAgentsT2 : [defaultTrusteeObject]));
                setValue('shared_trustor1_successor_trustees', []);
                setValue('shared_trustor2_successor_trustees', []);
            } else {
                setValue('shared_trustor1_successor_trustees', finAgentsT1.length > 0 ? finAgentsT1 : [defaultTrusteeObject]);
                setValue('shared_trustor2_successor_trustees', finAgentsT2.length > 0 ? finAgentsT2 : [defaultTrusteeObject]);
                setValue('shared_joint_successor_trustees', []);
            }
        } else {
            if (watchAreSuccessorTrusteesJoint === 'Yes') {
                if (!getValues('shared_joint_successor_trustees') || getValues('shared_joint_successor_trustees').length === 0) {
                    setValue('shared_joint_successor_trustees', [defaultTrusteeObject]);
                }
                setValue('shared_trustor1_successor_trustees', []);
                setValue('shared_trustor2_successor_trustees', []);
            } else {
                if (!getValues('shared_trustor1_successor_trustees') || getValues('shared_trustor1_successor_trustees').length === 0) {
                    setValue('shared_trustor1_successor_trustees', [defaultTrusteeObject]);
                }
                if (!getValues('shared_trustor2_successor_trustees') || getValues('shared_trustor2_successor_trustees').length === 0) {
                    setValue('shared_trustor2_successor_trustees', [defaultTrusteeObject]);
                }
                setValue('shared_joint_successor_trustees', []);
            }
        }
    }, [
        watchSuccessorTrusteesSameAsFinAgents,
        watchAreSuccessorTrusteesJoint,
        getValues, setValue, defaultTrusteeObject,
        watch('trustor1_fin_agent1_name'), watch('trustor1_fin_agent2_name'), watch('trustor1_fin_agent3_name'),
        watch('trustor2_fin_agent1_name'), watch('trustor2_fin_agent2_name'), watch('trustor2_fin_agent3_name'),
    ]);


    const tabNames = [
        "Personal/Family Information", "Guardians & Fiduciaries", "Trust Details",
        "Distribution", "Advanced Provisions", "Capacity Confirmation"
    ];

    const onSubmitHandler = (data: any) => {
        if (onFormSubmit) {
            onFormSubmit(data);
        } else {
            console.log("Separate Trusts Form Submitted Data (standalone):", JSON.stringify(data, null, 2));
            toast({
                title: "Form Data Captured (Standalone)",
                description: "Separate trusts information has been processed. Check console for data.",
                variant: "default",
                duration: 7000,
            });
        }
    };

    const handleSaveDraft = () => {
        const currentData = getValues();
        console.log("Saving Separate Trusts Draft:", JSON.stringify(currentData, null, 2));
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
                    Revocable Living Trust Questionnaire (Married Couple - Separate Trusts)
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
                            {activeTab === "Trust Details" && <TrustDetailsSeparateTab person1Label={person1EffectiveLabel} person2Label={person2EffectiveLabel} watchSuccessorTrusteesSameAsFinAgents={watchSuccessorTrusteesSameAsFinAgents} watchAreSuccessorTrusteesJoint={watchAreSuccessorTrusteesJoint} />}
                            {activeTab === "Distribution" && <DistributionSeparateTab person1Label={person1EffectiveLabel} person2Label={person2EffectiveLabel} />}
                            {activeTab === "Advanced Provisions" && <AdvancedProvisionsSeparateTab person1Label={person1EffectiveLabel} person2Label={person2EffectiveLabel} />}
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

