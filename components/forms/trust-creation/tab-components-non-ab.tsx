
// @ts-nocheck
// TODO: Remove ts-nocheck and fix types
"use client";

import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputField, RadioGroupField, TextareaField, SelectField, CheckboxField, CheckboxGroupField } from './field-components';
import {
    SuccessorTrusteeSetFields, ResidualBeneficiaryTermsFields, UltimateBeneficiaryFields, CharityDistributionFields, SpecificGiftsFields, FormSectionCard as FormSection
} from './section-components'; 
import {
    // Constants for TrustDetailsNonABTab
    YES_NO_OPTIONS, TRUST_EXECUTION_TYPE_OPTIONS, INVESTMENT_STANDARD_OPTIONS, NO_CONTEST_OPTIONS_FORM, SUCCESSOR_TRUSTEE_OPTIONS,
    REMOVAL_CRITERIA_OPTIONS, 

    // Constants for DistributionNonABTab
    PROPERTY_SHARES_OPTIONS, TPP_DISTRIBUTION_OPTIONS, COMMON_POT_OPTIONS, 
    INCENTIVE_CLAUSE_OPTIONS, RESIDUAL_DISTRIBUTION_MAIN_OPTIONS, NON_AB_GROUP_DISTRIBUTION_OPTIONS, 
    TERMS_INCOME_OPTIONS, TERMS_PRINCIPAL_OPTIONS, TERMS_LAPSE_PROVISION_OPTIONS, BENEFICIARY_TRUSTEE_OPTIONS, 
    ULTIMATE_DISTRIBUTION_PATTERN_OPTIONS, ULTIMATE_SAME_OPTIONS, ULTIMATE_T1_OPTIONS, ULTIMATE_T2_OPTIONS,
    NON_AB_DISTRIBUTION_TYPE_OPTIONS, SUCCESSOR_TRUSTEE_ACTING_OPTIONS,
    RETIREMENT_TRUST_TYPE_OPTIONS, RETIREMENT_ACCUMULATION_DISTRIBUTION_METHOD_OPTIONS, OPTIONAL_POA_OPTIONS, // Added constants

    // Constants for AdvancedProvisionsNonABTab
    FUNDING_BENEFICIARY_OPTIONS, ADV_PROV_DUTY_ACCOUNT_SUCCESSOR_OPTIONS, ADV_PROV_PROPERTY_AGREEMENT_OPTIONS,
    ADV_PROV_MAINTAIN_CP_OPTIONS, ADV_PROV_LIFE_INSURANCE_OPTIONS, ADV_PROV_LIFETIME_RIGHTS_OPTIONS,
    ADV_PROV_QTIP_RECOVERY_OPTIONS 
} from './constants';


export const TrustDetailsNonABTab = ({
    person1Label = "Trustor 1", 
    person2Label = "Trustor 2",
    watchSuccessorTrusteesSameAsFinAgents,
}) => {
    const { control, formState: { errors }, watch, setValue, getValues } = useFormContext();
    
    const watchTrustExecutionType = watch("trust_execution_type");
    const watchAdditionalTrusteeExists = watch("trust_initial_additional_trustee_exists");
    const watchInitialTrustor1 = watch("trust_initial_trustor1");
    const watchInitialTrustor2 = watch("trust_initial_trustor2");

    React.useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        if (watchTrustExecutionType === 'New' && !getValues('current_trust_date')) { 
            setValue('current_trust_date', today); 
            setValue('trust_original_date', ''); 
            setValue('trust_authority_amend', '');
            setValue('trust_amendment_number', '');
            setValue('prior_amendments_restatements', '');
        } else if (watchTrustExecutionType === 'Restatement' && !getValues('current_trust_date')) {
             setValue('current_trust_date', today); 
        }
    }, [watchTrustExecutionType, setValue, getValues]);

    return (
        <fieldset>
            <legend className="sr-only">Trust Details for Non-A/B Trust</legend>

            <FormSection title="Trust Identification" borderClassName="border-sky-200/80">
                <InputField control={control} errors={errors} label="Trust Name" name="trust_name" placeholder={`e.g., The ${person1Label} and ${person2Label} Family Trust`} required />
                <RadioGroupField control={control} errors={errors} label="Trust Execution Type" name="trust_execution_type" options={TRUST_EXECUTION_TYPE_OPTIONS} required layout="vertical"/>
                {watchTrustExecutionType === "New" && (
                     <InputField control={control} errors={errors} label="Date of Trust Signing" name="current_trust_date" type="date" description="This will typically be the date the new trust document is executed." required />
                )}
                {watchTrustExecutionType === "Restatement" && (
                    <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-4">
                        <InputField control={control} errors={errors} label="Date of Original Trust Being Restated" name="trust_original_date" type="date" required />
                        <TextareaField control={control} errors={errors} label="Authority to Amend/Restate (e.g., Article/Section)" name="trust_authority_amend" placeholder="Cite the specific provision in the original trust document." rows={2} required />
                        <InputField control={control} errors={errors} label="Amendment Number (if applicable)" name="trust_amendment_number" placeholder="e.g., Amendment No. 1" />
                        <TextareaField control={control} errors={errors} label="List any Prior Amendments or Restatements (Dates and brief description)" name="prior_amendments_restatements" rows={3} placeholder="e.g., Amendment No. 1 dated 01/01/2020 changed successor trustee."/>
                        <InputField control={control} errors={errors} label="Date of this Restatement" name="current_trust_date" type="date" description="This will typically be the date the restatement document is executed." required />
                    </div>
                )}
            </FormSection>

            <FormSection title="General Trust Provisions" borderClassName="border-emerald-200/80">
                <InputField control={control} errors={errors} label="State of Controlling Law" name="trust_controlling_law_state" placeholder="e.g., Oregon" required />
                <RadioGroupField control={control} errors={errors} label="Do you desire to include Prenuptial language?" name="trust_prenuptial_language" options={YES_NO_OPTIONS} required />
                <RadioGroupField control={control} errors={errors} label="Investment Standard" name="trust_investment_standard" options={INVESTMENT_STANDARD_OPTIONS} required />
                <RadioGroupField control={control} errors={errors} label="Applicable to Surviving Spouse (Investment Standard)" name="trust_investment_standard_surviving_spouse" options={YES_NO_OPTIONS} required />
                <RadioGroupField control={control} errors={errors} label="No Contest Clause" name="trust_no_contest_clause" options={NO_CONTEST_OPTIONS_FORM} required />
            </FormSection>

            <FormSection title="Trustees" borderClassName="border-orange-200/80">
                <RadioGroupField control={control} errors={errors} label="Can any Co-Trustee act independently?" name="trust_co_trustee_act_independently" options={YES_NO_OPTIONS} />
                <h4 className="text-md font-semibold text-foreground my-3 pt-4 border-t">Initial Trustees</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                        <CheckboxField control={control} errors={errors} name="trust_initial_trustor1" label={`${person1Label} as Initial Trustee`} />
                        {watchInitialTrustor1 && <RadioGroupField control={control} errors={errors} label="Can Act Independently?" name="trust_initial_trustor1_act_independently" options={YES_NO_OPTIONS} className="ml-6"/>}
                    </div>
                    <div>
                        <CheckboxField control={control} errors={errors} name="trust_initial_trustor2" label={`${person2Label} as Initial Trustee`} />
                        {watchInitialTrustor2 && <RadioGroupField control={control} errors={errors} label="Can Act Independently?" name="trust_initial_trustor2_act_independently" options={YES_NO_OPTIONS} className="ml-6"/>}
                    </div>
                </div>
                <div className="mt-3">
                    <CheckboxField control={control} errors={errors} name="trust_initial_additional_trustee_exists" label="Additional Initial Trustee" />
                    {watchAdditionalTrusteeExists && (
                        <div className="ml-6 mt-2 space-y-2 border p-3 rounded-md bg-muted/30">
                            <InputField control={control} errors={errors} label="Additional Initial Trustee Name" name="trust_initial_additional_trustee_name" placeholder="Full Name" />
                            <RadioGroupField control={control} errors={errors} label="Can Act Independently?" name="trust_initial_additional_trustee_act_independently" options={YES_NO_OPTIONS} />
                        </div>
                    )}
                </div>
                
                <div className="mt-6 pt-6 border-t border-border">
                     <RadioGroupField control={control} errors={errors} label="Are Successor Trustees the same as Financial Agents?" name="successor_trustees_same_as_financial_agents" options={SUCCESSOR_TRUSTEE_OPTIONS} required />
                </div>
                <FormSection title="Successor Trustees (Shared List)" borderClassName="border-orange-300" className="mt-4 bg-orange-100/50">
                    <SuccessorTrusteeSetFields
                        control={control} errors={errors} watch={watch}
                        fieldArrayNamePrefix="trustor1_successor_trustees" // Using T1 list for shared successors
                        title="Nominate Successor Trustees"
                        readOnlyAllNames={watchSuccessorTrusteesSameAsFinAgents === 'Same as Financial Agents'}
                    />
                </FormSection>
            </FormSection>
            
            <FormSection title="Survivor's Power & Trustee Removal" borderClassName="border-amber-200/80">
                 <RadioGroupField control={control} errors={errors} label={`Allow surviving/competent ${person1Label} or ${person2Label} to add, remove, replace Trustees without cause?`} name="survivor_power_change_trustee" options={YES_NO_OPTIONS} />
                <RadioGroupField control={control} errors={errors} label={`Allow surviving/competent ${person1Label} or ${person2Label} to appoint a Trust Protector (if one not named or serving)?`} name="survivor_can_appoint_special_co_trustee" options={YES_NO_OPTIONS} />
                <RadioGroupField control={control} errors={errors} label={`Select which beneficiaries may remove a Trustee after death/incapacity of ${person1Label} and ${person2Label}:`} name="removal_trustees_by_others_criteria" options={REMOVAL_CRITERIA_OPTIONS} layout="vertical" className="mt-4"/>
            </FormSection>
            
            <FormSection title="Notes" borderClassName="border-gray-200/80">
                <TextareaField control={control} errors={errors} label="Notes for Trust Details" name="notes_trust_details" placeholder="Enter any relevant notes for this section..." rows={3} />
            </FormSection>
        </fieldset>
    );
};

export const DistributionNonABTab = ({ person1Label = "Trustor 1", person2Label = "Trustor 2" }) => {
    const { control, formState: { errors }, watch } = useFormContext();

    const watchTPP = watch("tpp_distribution");
    const watchAnyCharity = watch("any_specific_distributions_charity");
    const watchAnyIndividualGift = watch("any_specific_distributions_individuals");
    const watchCommonPotOption = watch("common_pot_trust_option");
    const watchResidualMainOption = watch("residual_distribution_main_option");
    const watchResidualGroupOptionSelected = watch("residual_group_option_selected");
    const watchGroupTermsPrincipal = watch("group_terms_principal_option");
    const watchGroupBeneficiaryTrusteeOption = watch("group_beneficiary_trustee_option");
    const watchUltimatePattern = watch("ultimate_distribution_pattern");
    const watchUltimateSameOption = watch("ultimate_same_option"); 
    const watchUltimateT1Option = watch("ultimate_t1_option"); 
    const watchUltimateT2Option = watch("ultimate_t2_option"); 
    const watchResidualDiffGroupT1OptionSelected = watch("residual_diff_group_t1_option_selected");
    const watchResidualDiffGroupT2OptionSelected = watch("residual_diff_group_t2_option_selected");

    const watchRetirementPreservation = watch("retirement_preservation_trust");
    const watchRetirementNamesMatch = watch("retirement_preservation_names_match_residual");
    const watchRetirementTrustType = watch("retirement_trust_type");
    const watchRetirementAccumulationMethod = watch("retirement_accumulation_distribution_method");
    const watchOptionalPOA = watch("retirement_trust_optional_poa");


    return (
        <fieldset>
             <legend className="sr-only">Distribution Plan for Non-A/B Trust</legend>
            
            <FormSection title={`Tangible Personal Property (TPP) - Distribution upon death of ${person1Label} and ${person2Label}`} borderClassName="border-lime-200/80">
                <RadioGroupField name="tpp_distribution" options={TPP_DISTRIBUTION_OPTIONS} control={control} errors={errors} required layout="vertical" />
                {watchTPP === 'Equally to' && (<InputField control={control} errors={errors} name="tpp_equally_to_names" placeholder="Enter names" required={watchTPP === 'Equally to'} className="mt-2 ml-6" /> )}
                <TextareaField control={control} errors={errors} label="Other/Notes (Optional)" name="tpp_other_notes" rows={2} placeholder="Specific instructions or list of items..." className="mt-4" />
            </FormSection>

            <FormSection title="Specific Distributions to Charity" borderClassName="border-emerald-200/80" description="Gifts of specific assets or cash amounts to charitable organizations.">
                <RadioGroupField control={control} errors={errors} label="Any specific distributions for charity(ies)?" name="any_specific_distributions_charity" options={YES_NO_OPTIONS} required />
                {watchAnyCharity === "Yes" && <CharityDistributionFields control={control} errors={errors} watch={watch} formType="trust" fieldArrayNamePrefix="charity_distributions" />}
            </FormSection>

            <FormSection title="Specific Distributions to Individuals" borderClassName="border-orange-200/80" description="Gifts of specific assets or cash amounts to individuals (friends, family, etc.).">
                <RadioGroupField control={control} errors={errors} label="Any specific distributions for Individuals?" name="any_specific_distributions_individuals" options={YES_NO_OPTIONS} required />
                {watchAnyIndividualGift === "Yes" && (
                    <SpecificGiftsFields 
                        control={control} 
                        errors={errors} 
                        watch={watch} 
                        formType="trust" 
                        fieldArrayNamePrefix="individual_gifts"
                        distributionTypeOptions={NON_AB_DISTRIBUTION_TYPE_OPTIONS}
                    />
                )}
            </FormSection>

            <FormSection title={`Residual Beneficiaries & Other Distributions - Distribution of remaining trust assets after specific gifts, upon death of ${person1Label} and ${person2Label}`} borderClassName="border-pink-200/80">
                <FormSection title="Common Pot Trust" borderClassName="border-pink-300/50" className="bg-pink-100/30">
                    <RadioGroupField name="common_pot_trust_option" control={control} errors={errors} layout="vertical" options={COMMON_POT_OPTIONS} />
                    {watchCommonPotOption === "Common Pot until Youngest Specified Age" && <InputField control={control} errors={errors} label="Specified Age" name="common_pot_specified_age" type="number" placeholder="e.g., 21" className="ml-6 w-32"/>}
                    {watchCommonPotOption === "Common Pot until Youngest Specified Age or College" && <InputField control={control} errors={errors} label="Specified Age" name="common_pot_alt_specified_age" type="number" placeholder="e.g., 23" className="ml-6 w-32"/>}
                </FormSection>

                <FormSection title="Retirement Preservation Trust" borderClassName="border-pink-300/50" className="bg-pink-100/30 mt-4">
                    <RadioGroupField label="Is this a Retirement Preservation Trust?" name="retirement_preservation_trust" options={YES_NO_OPTIONS} control={control} errors={errors} />
                    {watchRetirementPreservation === "Yes" && (
                        <div className="ml-6 mt-2 space-y-3">
                            <RadioGroupField name="retirement_preservation_names_match_residual" control={control} errors={errors} layout="vertical" options={[ {value: 'Yes', label: "Names match residual names"}, {value: 'No', label: "List the names:"} ]}/>
                            {watchRetirementNamesMatch === 'No' && <TextareaField control={control} errors={errors} name="retirement_preservation_names_list" placeholder="Specify beneficiaries for RPT(s)" className="ml-6" rows={2}/>}
                            <RadioGroupField label="Retirement Trust Type" name="retirement_trust_type" control={control} errors={errors} options={RETIREMENT_TRUST_TYPE_OPTIONS} />
                             {watchRetirementTrustType === "Accumulation" && (
                                <div className="ml-6 mt-3 space-y-3 p-3 border border-muted/50 rounded-md bg-muted/20">
                                    <RadioGroupField
                                        label="Accumulation Trust Distribution Method"
                                        name="retirement_accumulation_distribution_method"
                                        options={RETIREMENT_ACCUMULATION_DISTRIBUTION_METHOD_OPTIONS}
                                        control={control}
                                        errors={errors}
                                        layout="vertical"
                                        required={watchRetirementTrustType === "Accumulation"}
                                    />
                                    {watchRetirementAccumulationMethod === "Until Specified Age" && (
                                        <InputField
                                            control={control}
                                            errors={errors}
                                            label="Specified Age for Accumulation Distribution"
                                            name="retirement_accumulation_specified_age"
                                            type="number"
                                            placeholder="e.g., 30"
                                            required={watchRetirementAccumulationMethod === "Until Specified Age"}
                                            className="ml-6"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </FormSection>
                
                <FormSection title="Optional Power of Appointment & Nuptial Requirement & Incentive Clauses" borderClassName="border-pink-300/50" className="bg-pink-100/30 mt-4">
                    <RadioGroupField label="Include Optional Power of Appointment for Beneficiary (General Policy)?" name="retirement_trust_optional_poa" control={control} errors={errors} options={OPTIONAL_POA_OPTIONS} layout="vertical" />
                    {watchOptionalPOA === "Yes, Except" && <InputField control={control} errors={errors} name="retirement_trust_optional_poa_except" placeholder="Enter exceptions" className="ml-6"/>}
                    <p className="text-xs text-muted-foreground mt-2 ml-6">NOTE: Allows Beny To Designate Successor POA-NOT FOR ACCESS TRUST OR SNT.</p>
                    <RadioGroupField label="Require beneficiary pre/post-nup before distribution (General Policy)?" name="beneficiary_nuptial_required" options={YES_NO_OPTIONS} control={control} errors={errors} className="mt-4"/>
                     <FormSection title="Incentive Clauses for General Residual Distribution" className="mt-4" borderClassName="border-primary/20">
                        <CheckboxGroupField label="Select General Incentive Clauses (Optional):" name="group_incentive_clauses" control={control} errors={errors} options={INCENTIVE_CLAUSE_OPTIONS} />
                        <InputField control={control} errors={errors} label="Other General Incentive Clause:" name="group_incentive_clauses_other" placeholder="Specify other incentive" />
                    </FormSection>
                </FormSection>
                
                <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-lg font-semibold text-foreground mb-3">Distribution Options</h4>
                    <RadioGroupField name="residual_distribution_main_option" control={control} errors={errors} layout="vertical" options={RESIDUAL_DISTRIBUTION_MAIN_OPTIONS} />
                    
                    {watchResidualMainOption === "Group" && (
                        <FormSection title="Group Distribution Details" borderClassName="border-pink-400/60" className="ml-6 mt-4 bg-pink-200/40">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <InputField control={control} errors={errors} label="Min. age beneficiary is own Trustee" name="group_min_age_trustee" type="number" />
                                <InputField control={control} errors={errors} label="Age beneficiary receives income distributions" name="group_age_income_dists" type="number" />
                            </div>
                            <RadioGroupField label="Select Group Distribution Type:" name="residual_group_option_selected" control={control} errors={errors} layout="vertical" options={NON_AB_GROUP_DISTRIBUTION_OPTIONS} />
                             {watchResidualGroupOptionSelected === 'Equal and Terms Specified' && (
                                <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-3">
                                    <h6 className="text-sm font-medium text-muted-foreground mb-2 uppercase">Terms Specified Details</h6>
                                    <RadioGroupField label="Income" name="group_terms_income_option" control={control} errors={errors} layout="vertical" options={TERMS_INCOME_OPTIONS} />
                                    <RadioGroupField label="Principal" name="group_terms_principal_option" control={control} errors={errors} layout="vertical" options={TERMS_PRINCIPAL_OPTIONS} />
                                    {(watchGroupTermsPrincipal?.includes('Age') || watchGroupTermsPrincipal?.includes('Stagger')) && (
                                        <div className="grid grid-cols-3 gap-2 ml-6">
                                            <InputField label="Age 1" name="group_terms_age1" type="number" control={control} errors={errors} className="mb-0"/>
                                            {(watchGroupTermsPrincipal?.includes('Stagger 2') || watchGroupTermsPrincipal?.includes('Stagger 3')) && <InputField label="Age 2" name="group_terms_age2" type="number" control={control} errors={errors} className="mb-0"/>}
                                            {watchGroupTermsPrincipal?.includes('Stagger 3') && <InputField label="Age 3" name="group_terms_age3" type="number" control={control} errors={errors} className="mb-0"/>}
                                        </div>
                                    )}
                                    <RadioGroupField label="Lapse Provisions At Death of Beneficiary" name="group_terms_lapse_provision" control={control} errors={errors} layout="vertical" options={TERMS_LAPSE_PROVISION_OPTIONS} />
                                </div>
                            )}
                             <div className="mt-4 pt-4 border-t">
                                <h6 className="text-md font-semibold text-foreground mb-2">Beneficiary Trustee Option</h6>
                                <RadioGroupField name="group_beneficiary_trustee_option" control={control} errors={errors} layout="vertical" options={BENEFICIARY_TRUSTEE_OPTIONS} />
                                {watchGroupBeneficiaryTrusteeOption === '3rd Party' && ( <div className="ml-6 mt-2 space-y-2 border p-3 rounded-md bg-muted/30"> <InputField label="1. 3rd Party Trustee Name" name="group_beneficiary_trustee_3rd_party1" control={control} errors={errors} /> <InputField label="2. 3rd Party Trustee Name (Optional)" name="group_beneficiary_trustee_3rd_party2" control={control} errors={errors} /> <RadioGroupField label="If two 3rd party trustees, how should they act?" name="group_beneficiary_trustee_3rd_party_acting" options={SUCCESSOR_TRUSTEE_ACTING_OPTIONS} control={control} errors={errors} layout="vertical"/> </div> )}
                                {watchGroupBeneficiaryTrusteeOption === 'Beneficiary and 3rd Party' && ( <div className="ml-6 mt-2 space-y-2 border p-3 rounded-md bg-muted/30"> <InputField label="3rd Party Co-Trustee Name" name="group_beneficiary_trustee_ben_3rd_party_name" control={control} errors={errors} /> <RadioGroupField label="How should Beneficiary and 3rd Party Co-Trustees act?" name="group_beneficiary_trustee_ben_3rd_party_acting" options={SUCCESSOR_TRUSTEE_ACTING_OPTIONS} control={control} errors={errors} layout="vertical"/></div> )}
                                {watchGroupBeneficiaryTrusteeOption === 'Beneficiary at Named Age' && ( <InputField label="Age Beneficiary Becomes Sole Trustee" name="group_beneficiary_trustee_ben_age" type="number" control={control} errors={errors} className="ml-6"/> )}
                             </div>
                            <TextareaField label="Group Distribution Notes" name="group_distribution_notes" control={control} errors={errors} rows={2} placeholder="Any specific notes about the group distribution..." className="mt-4" />
                        </FormSection>
                    )}

                    {watchResidualMainOption === "Different Group" && (
                        <FormSection title="Different Group Distributions" borderClassName="border-yellow-200/80" className="ml-6 mt-4 bg-yellow-100/40">
                            <p className="text-sm text-muted-foreground mb-4">Define separate group distribution schemes for ${person1Label} and ${person2Label}.</p>
                            <FormSection title={`${person1Label}'s Group Distribution`} borderClassName="border-yellow-300/70" className="mb-6 bg-yellow-50/50">
                                <RadioGroupField label={`Select Group Distribution Type for ${person1Label}:`} name="residual_diff_group_t1_option_selected" control={control} errors={errors} layout="vertical" options={NON_AB_GROUP_DISTRIBUTION_OPTIONS} />
                                {watchResidualDiffGroupT1OptionSelected && watchResidualDiffGroupT1OptionSelected !== "Equal and Immediate" && watchResidualDiffGroupT1OptionSelected !== "Access/Divorce Protection Trust" && (
                                    <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-3">
                                        <h6 className="text-sm font-medium text-muted-foreground mb-2 uppercase">Details for ${person1Label}'s Group</h6>
                                        <InputField control={control} errors={errors} label={`Min. age beny is own Trustee (${person1Label})`} name="t1_group_min_age_trustee" type="number" />
                                        <InputField control={control} errors={errors} label={`Age beny receives income (${person1Label})`} name="t1_group_age_income_dists" type="number" />
                                        {watchResidualDiffGroupT1OptionSelected === 'Equal and Terms Specified' && (
                                            <div className="mt-2">
                                                <RadioGroupField label={`Income (${person1Label})`} name="t1_group_terms_income_option" control={control} errors={errors} layout="vertical" options={TERMS_INCOME_OPTIONS} />
                                                <RadioGroupField label={`Principal (${person1Label})`} name="t1_group_terms_principal_option" control={control} errors={errors} layout="vertical" options={TERMS_PRINCIPAL_OPTIONS} />
                                                <RadioGroupField label={`Lapse Provisions (${person1Label})`} name="t1_group_terms_lapse_provision" control={control} errors={errors} layout="vertical" options={TERMS_LAPSE_PROVISION_OPTIONS} />
                                            </div>
                                        )}
                                         <RadioGroupField name={`t1_group_beneficiary_trustee_option`} control={control} errors={errors} layout="vertical" options={BENEFICIARY_TRUSTEE_OPTIONS} label={`Beneficiary Trustee (${person1Label})`} />
                                        <FormSection title={`Incentive Clauses for ${person1Label}'s Group`} className="mt-2" borderClassName="border-primary/20">
                                            <CheckboxGroupField label="Select Clauses (Optional):" name={`t1_group_incentive_clauses`} control={control} errors={errors} options={INCENTIVE_CLAUSE_OPTIONS} />
                                            <InputField control={control} errors={errors} label="Other Clause:" name={`t1_group_incentive_clauses_other`} placeholder="Specify other incentive" />
                                        </FormSection>
                                    </div>
                                )}
                                <TextareaField label={`Notes for ${person1Label}'s Group Distribution`} name="t1_group_distribution_notes" control={control} errors={errors} rows={2} className="mt-2" />
                            </FormSection>
                            <FormSection title={`${person2Label}'s Group Distribution`} borderClassName="border-yellow-300/70" className="bg-yellow-50/50">
                                 <RadioGroupField label={`Select Group Distribution Type for ${person2Label}:`} name="residual_diff_group_t2_option_selected" control={control} errors={errors} layout="vertical" options={NON_AB_GROUP_DISTRIBUTION_OPTIONS} />
                                  {watchResidualDiffGroupT2OptionSelected && watchResidualDiffGroupT2OptionSelected !== "Equal and Immediate" && watchResidualDiffGroupT2OptionSelected !== "Access/Divorce Protection Trust" && (
                                    <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-3">
                                        <h6 className="text-sm font-medium text-muted-foreground mb-2 uppercase">Details for ${person2Label}'s Group</h6>
                                        <InputField control={control} errors={errors} label={`Min. age beny is own Trustee (${person2Label})`} name="t2_group_min_age_trustee" type="number" />
                                        <InputField control={control} errors={errors} label={`Age beny receives income (${person2Label})`} name="t2_group_age_income_dists" type="number" />
                                        {watchResidualDiffGroupT2OptionSelected === 'Equal and Terms Specified' && (
                                            <div className="mt-2">
                                                <RadioGroupField label={`Income (${person2Label})`} name="t2_group_terms_income_option" control={control} errors={errors} layout="vertical" options={TERMS_INCOME_OPTIONS} />
                                                <RadioGroupField label={`Principal (${person2Label})`} name="t2_group_terms_principal_option" control={control} errors={errors} layout="vertical" options={TERMS_PRINCIPAL_OPTIONS} />
                                                <RadioGroupField label={`Lapse Provisions (${person2Label})`} name="t2_group_terms_lapse_provision" control={control} errors={errors} layout="vertical" options={TERMS_LAPSE_PROVISION_OPTIONS} />
                                            </div>
                                        )}
                                        <RadioGroupField name={`t2_group_beneficiary_trustee_option`} control={control} errors={errors} layout="vertical" options={BENEFICIARY_TRUSTEE_OPTIONS} label={`Beneficiary Trustee (${person2Label})`} />
                                        <FormSection title={`Incentive Clauses for ${person2Label}'s Group`} className="mt-2" borderClassName="border-primary/20">
                                            <CheckboxGroupField label="Select Clauses (Optional):" name={`t2_group_incentive_clauses`} control={control} errors={errors} options={INCENTIVE_CLAUSE_OPTIONS} />
                                            <InputField control={control} errors={errors} label="Other Clause:" name={`t2_group_incentive_clauses_other`} placeholder="Specify other incentive" />
                                        </FormSection>
                                    </div>
                                )}
                                 <TextareaField label={`Notes for ${person2Label}'s Group Distribution`} name="t2_group_distribution_notes" control={control} errors={errors} rows={2} className="mt-2" />
                            </FormSection>
                        </FormSection>
                    )}

                    {watchResidualMainOption === "Terms" && (
                        <ResidualBeneficiaryTermsFields 
                            control={control} 
                            errors={errors} 
                            watch={watch} 
                            formType="trust"
                            distributionTypeOptions={NON_AB_DISTRIBUTION_TYPE_OPTIONS}
                        />
                    )}
                </div>
            </FormSection>
            
            <FormSection title={`Lack of Designated Beneficiaries (Ultimate Distribution) - If ALL previously named beneficiaries fail to survive ${person1Label} and ${person2Label}`} borderClassName="border-red-200/80">
                <RadioGroupField label={`Do ${person1Label} and ${person2Label} have the same Ultimate Distribution Selection?`} name="ultimate_distribution_pattern" options={ULTIMATE_DISTRIBUTION_PATTERN_OPTIONS} control={control} errors={errors} required layout="vertical" />
                {watchUltimatePattern === 'Same' && (
                    <FormSection title="Ultimate Distribution - Same Pattern" borderClassName="border-red-300/60" className="ml-6 mt-4 bg-red-100/40">
                        <RadioGroupField name="ultimate_same_option" options={ULTIMATE_SAME_OPTIONS} control={control} errors={errors} label="" required={watchUltimatePattern === 'Same'} layout="vertical" />
                        {watchUltimateSameOption === 'Same Named Beneficiaries' && (
                            <UltimateBeneficiaryFields control={control} errors={errors} fieldArrayName="ultimate_joint_beneficiaries" title="Joint Ultimate Beneficiaries" />
                        )}
                    </FormSection>
                )}
                {watchUltimatePattern === 'Different' && (
                     <FormSection title={`Ultimate Distribution - ${person1Label}'s Pattern`} borderClassName="border-red-300/60" className="ml-6 mt-4 bg-red-100/40">
                        <RadioGroupField name="ultimate_t1_option" options={ULTIMATE_T1_OPTIONS} control={control} errors={errors} label="" required={watchUltimatePattern === 'Different'} layout="vertical" />
                        {watchUltimateT1Option === 'Trustor One Named Beneficiaries' && (
                            <UltimateBeneficiaryFields control={control} errors={errors} fieldArrayName="ultimate_t1_beneficiaries" title={`${person1Label}'s Ultimate Beneficiaries`} />
                        )}
                    </FormSection>
                )}
                {watchUltimatePattern === 'Different' && (
                     <FormSection title={`Ultimate Distribution - ${person2Label}'s Share`} borderClassName="border-red-300/60" className="ml-6 mt-4 bg-red-100/40">
                        <RadioGroupField name="ultimate_t2_option" options={ULTIMATE_T2_OPTIONS} control={control} errors={errors} label="" required={watchUltimatePattern === 'Different'} layout="vertical" />
                        {watchUltimateT2Option === 'Trustor Two Named Beneficiaries' && (
                            <UltimateBeneficiaryFields control={control} errors={errors} fieldArrayName="ultimate_t2_beneficiaries" title={`${person2Label}'s Ultimate Beneficiaries`} />
                        )}
                    </FormSection>
                )}
            </FormSection>

            <FormSection title="General Distribution Notes" borderClassName="border-gray-200/80">
                 <TextareaField control={control} errors={errors} label="Overall Comments or Instructions Regarding Distributions" name="notes_distribution" rows={4} placeholder="Any overriding principles, preferences, or clarifications not covered elsewhere." />
            </FormSection>
        </fieldset>
    );
};
    
export const AdvancedProvisionsNonABTab = ({ person1Label = "Trustor 1", person2Label = "Trustor 2" }) => {
    const { control, formState: { errors }, watch } = useFormContext(); 
    
    const watchFundingQualifiedAssetChecklist = watch("funding_qualified_asset_checklist");
    const watchFundingQualifiedBeneficiaryOption = watch("funding_qualified_beneficiary_option");
    const watchFundingNonQualifiedAssetChecklist = watch("funding_non_qualified_asset_checklist");
    const watchFundingNonQualifiedBeneficiaryOption = watch("funding_non_qualified_beneficiary_option");

    return (
        <fieldset>
            <h3 className="text-xl font-semibold text-foreground px-2 mb-4">Advanced Provisions for Non-A/B Trust</h3>

            <FormSection title="FUNDING CHECKLIST" borderClassName="border-sky-200/80">
                <div className="mb-6 p-4 border rounded-md bg-card">
                    <CheckboxField control={control} errors={errors} name="funding_qualified_asset_checklist" label="Qualified Asset Checklist"/>
                    <p className="text-xs text-muted-foreground mb-3 ml-6">Retirement sub-trusts for beneficiaries – preferred for minor children or children with struggles.</p>
                    {watchFundingQualifiedAssetChecklist && (
                        <div className="ml-6 space-y-3">
                            <RadioGroupField name="funding_qualified_beneficiary_option" control={control} errors={errors} layout="vertical" options={FUNDING_BENEFICIARY_OPTIONS} />
                             {watchFundingQualifiedBeneficiaryOption === "Other" && (
                                <div className="ml-6 mt-2 space-y-2">
                                    <InputField control={control} errors={errors} label={`${person1Label} beneficiaries:`} name="funding_qualified_trustor1_beneficiaries" placeholder="Beneficiary names for Qualified Assets" />
                                    <InputField control={control} errors={errors} label={`${person2Label} beneficiaries:`} name="funding_qualified_trustor2_beneficiaries" placeholder="Beneficiary names for Qualified Assets" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="mb-6 p-4 border rounded-md bg-card">
                    <CheckboxField control={control} errors={errors} name="funding_non_qualified_asset_checklist" label="Non-Qualified Asset Checklist"/>
                    {watchFundingNonQualifiedAssetChecklist && (
                        <div className="ml-6 space-y-3 mt-2">
                            <RadioGroupField name="funding_non_qualified_beneficiary_option" control={control} errors={errors} layout="vertical" options={FUNDING_BENEFICIARY_OPTIONS} />
                            {watchFundingNonQualifiedBeneficiaryOption === "Other" && ( 
                                 <div className="ml-6 mt-2 space-y-2">
                                    <InputField control={control} errors={errors} label={`${person1Label} beneficiaries:`} name="funding_non_qualified_trustor1_beneficiaries" placeholder="Beneficiary names for Non-Qualified Assets" />
                                    <InputField control={control} errors={errors} label={`${person2Label} beneficiaries:`} name="funding_non_qualified_trustor2_beneficiaries" placeholder="Beneficiary names for Non-Qualified Assets" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <TextareaField label="Checklist notes:" name="funding_checklist_notes" control={control} errors={errors} placeholder="Enter any funding checklist notes..." rows={3} />
            </FormSection>

            <FormSection title="TRUST PROVISIONS" borderClassName="border-violet-200/80">
                <FormSection title="Duty To Account" borderClassName="border-violet-300/70" className="bg-violet-100/50">
                    <RadioGroupField label={`Duty of Competent or Surviving Trustor (${person1Label}/${person2Label}) to Account?`} name="adv_prov_duty_to_account_surviving" options={YES_NO_OPTIONS} control={control} errors={errors} />
                    <RadioGroupField label="To Successor Trustee/Beneficiaries?" name="adv_prov_duty_to_account_successor" options={ADV_PROV_DUTY_ACCOUNT_SUCCESSOR_OPTIONS} control={control} errors={errors} layout="vertical" />
                </FormSection>
                 <FormSection title="Trust Property" borderClassName="border-violet-300/70" className="mt-4 bg-violet-100/50">
                    <CheckboxField control={control} errors={errors} name="adv_prov_trust_property_tic_shares" label="Tenants in Common Shares" 
                        description="All trust property is treated as tenants in common owned ½ by each Trustor’s contributive share. A property agreement converting the property to tenancy-in-common should be used."/>
                </FormSection>
                 <FormSection title="Property Agreement Provisions" borderClassName="border-violet-300/70" className="mt-4 bg-violet-100/50">
                    <RadioGroupField name="adv_prov_property_agreement_provision" control={control} errors={errors} layout="vertical" options={ADV_PROV_PROPERTY_AGREEMENT_OPTIONS} label="Property Agreement Selection"/>
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <RadioGroupField name="adv_prov_maintain_cp_status" options={ADV_PROV_MAINTAIN_CP_OPTIONS} control={control} errors={errors} label="Maintain Community Property Status (if applicable)"
                         description="For clients moving from a community property state to a common law state or for common law clients who own property as husband and wife in a community property state, do you want to maintain community property status of those assets?"/>
                    </div>
                </FormSection>
                 <FormSection title="Life Insurance" borderClassName="border-violet-300/70" className="mt-4 bg-violet-100/50">
                    <RadioGroupField name="adv_prov_life_insurance_allocation" control={control} errors={errors} layout="vertical" options={ADV_PROV_LIFE_INSURANCE_OPTIONS} label="How do you wish to have life insurance owned by or paid to the Trust allocated?"/>
                </FormSection>
                 <FormSection title="Trustor’s Lifetime Rights" borderClassName="border-violet-300/70" className="mt-4 bg-violet-100/50">
                    <RadioGroupField name="adv_prov_trustor_lifetime_rights_selection" control={control} errors={errors} layout="vertical" options={ADV_PROV_LIFETIME_RIGHTS_OPTIONS} label="Select how to provide for an incapacitated Trustor and/or dependents."
                    description="A spouse-Trustee may not make discretionary distributions to minor children from an incapacitated Trustor’s Contributive Share. This is because a spouse who is authorized to make distributions to satisfy such spouse’s legal obligation to support minor children will be treated as having a general power of appointment over the incapacitated spouse’s share of the trust property. The Special Co-Trustee will exercise such discretion." />
                </FormSection>
                <FormSection title="Article Four and Pour Over Will" borderClassName="border-violet-300/70" className="mt-4 bg-violet-100/50">
                    <RadioGroupField name="adv_prov_qtip_recovery_rights" control={control} errors={errors} layout="vertical" options={ADV_PROV_QTIP_RECOVERY_OPTIONS} label="QTIP Recovery Rights"
                    description="If the value of a QTIP trust established by a Deceased Trustor might be elected to qualify for the Marital Deduction and would therefore be includible in the estate of the Surviving Trustor, does the Surviving Trustor wish to retain the right to recover the estate taxes attributable to the inclusion of the QTIP, or waive the right to recovery? When Trustor 1’s and Trustor 2’s beneficiaries are identical a waiver is generally made to avoid reducing the balance in a “Reverse QTIP” trust so as to maximize GST benefits." />
                </FormSection>
            </FormSection>
            
            <FormSection title="Notes" borderClassName="border-gray-200/80">
                <TextareaField control={control} errors={errors} label="Notes for Advanced Provisions" name="notes_advanced_provisions" placeholder="Enter any relevant notes for this section..." rows={3} />
            </FormSection>
        </fieldset>
    );
};

