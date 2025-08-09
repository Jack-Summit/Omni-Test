
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
    // Constants for TrustDetailsSeparateTab
    YES_NO_OPTIONS, TRUST_EXECUTION_TYPE_OPTIONS, INVESTMENT_STANDARD_OPTIONS, NO_CONTEST_OPTIONS_FORM, SUCCESSOR_TRUSTEE_OPTIONS,
    JOINT_SUCCESSOR_TRUSTEE_OPTIONS, SEPARATE_SUCCESSOR_TRUSTEE_OPTIONS, REMOVAL_CRITERIA_OPTIONS, INCAPACITY_CONSENT_OPTIONS,

    // Constants for DistributionSeparateTab
    PROPERTY_SHARES_OPTIONS, TPP_DISTRIBUTION_OPTIONS, COMMON_POT_OPTIONS,
    INCENTIVE_CLAUSE_OPTIONS, RESIDUAL_DISTRIBUTION_MAIN_OPTIONS, GROUP_DISTRIBUTION_OPTIONS,
    TERMS_INCOME_OPTIONS, TERMS_PRINCIPAL_OPTIONS, TERMS_LAPSE_PROVISION_OPTIONS, BENEFICIARY_TRUSTEE_OPTIONS,
    ULTIMATE_DISTRIBUTION_PATTERN_OPTIONS, ULTIMATE_SAME_OPTIONS, ULTIMATE_T1_OPTIONS, ULTIMATE_T2_OPTIONS, SUCCESSOR_TRUSTEE_ACTING_OPTIONS,
    NON_AB_DISTRIBUTION_TYPE_OPTIONS, RETIREMENT_TRUST_TYPE_OPTIONS, RETIREMENT_ACCUMULATION_DISTRIBUTION_METHOD_OPTIONS, OPTIONAL_POA_OPTIONS,


    // Constants for AdvancedProvisionsSeparateTab
    FUNDING_BENEFICIARY_OPTIONS, ADV_PROV_DUTY_ACCOUNT_SUCCESSOR_OPTIONS, ADV_PROV_PROPERTY_AGREEMENT_OPTIONS,
    ADV_PROV_MAINTAIN_CP_OPTIONS, ADV_PROV_LIFE_INSURANCE_OPTIONS, ADV_PROV_LIFETIME_RIGHTS_OPTIONS,
    ADV_PROV_QTIP_RECOVERY_OPTIONS, ADV_PROV_TRUST_DIVISION_OPTIONS, ADV_PROV_AB_SPLIT_FORMULA_OPTIONS,
    ADV_PROV_ABC_SPLIT_FORMULA_OPTIONS, ADV_PROV_FAMILY_TRUST_ADMIN_OPTIONS, ADV_PROV_MARITAL_TRUST_ADMIN_OPTIONS
} from './constants';


export const TrustDetailsSeparateTab = ({
    person1Label = "Trustor 1",
    person2Label = "Trustor 2",
    watchSuccessorTrusteesSameAsFinAgents,
    watchAreSuccessorTrusteesJoint
}) => {
    const { control, formState: { errors }, watch, setValue, getValues } = useFormContext();

    const watchTrustor1TrustExecutionType = watch("trustor1_trust_execution_type");
    const watchTrustor2TrustExecutionType = watch("trustor2_trust_execution_type");

    const watchTrustor1QDOTNamed = watch("trustor1_qdot_trustee_named");
    const watchTrustor2QDOTNamed = watch("trustor2_qdot_trustee_named");
    
    const watchTrustor1WantTrustProtector = watch("trustor1_want_trust_protector");
    const watchTrustor2WantTrustProtector = watch("trustor2_want_trust_protector");

    const watchTrustor1WantIncapacityPanel = watch("trustor1_want_incapacity_panel");
    const watchTrustor2WantIncapacityPanel = watch("trustor2_want_incapacity_panel");


    React.useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        if (watchTrustor1TrustExecutionType === 'New' && !getValues('trustor1_current_trust_date')) {
            setValue('trustor1_current_trust_date', today);
            setValue('trustor1_trust_original_date', '');
            setValue('trustor1_trust_authority_amend', '');
            setValue('trustor1_prior_amendments_restatements', '');
        } else if (watchTrustor1TrustExecutionType === 'Restatement' && !getValues('trustor1_current_trust_date')) {
             setValue('trustor1_current_trust_date', today);
        }

        if (watchTrustor2TrustExecutionType === 'New' && !getValues('trustor2_current_trust_date')) {
            setValue('trustor2_current_trust_date', today);
            setValue('trustor2_trust_original_date', '');
            setValue('trustor2_trust_authority_amend', '');
            setValue('trustor2_prior_amendments_restatements', '');
        } else if (watchTrustor2TrustExecutionType === 'Restatement' && !getValues('trustor2_current_trust_date')) {
             setValue('trustor2_current_trust_date', today);
        }
    }, [watchTrustor1TrustExecutionType, watchTrustor2TrustExecutionType, setValue, getValues]);

    return (
        <fieldset>
            <legend className="sr-only">Trust Details for Separate Trusts</legend>

            <FormSection title={`${person1Label}'s Trust Details`} borderClassName="border-blue-300/80">
                <InputField control={control} errors={errors} label={`Trust Name (${person1Label})`} name="trustor1_trust_name" placeholder={`e.g., ${person1Label} Revocable Living Trust`} required />
                <RadioGroupField control={control} errors={errors} label={`Trust Execution Type (${person1Label})`} name="trustor1_trust_execution_type" options={TRUST_EXECUTION_TYPE_OPTIONS} required layout="vertical"/>
                {watchTrustor1TrustExecutionType === "New" && (
                     <InputField control={control} errors={errors} label={`Date of Trust Signing (${person1Label})`} name="trustor1_current_trust_date" type="date" required />
                )}
                {watchTrustor1TrustExecutionType === "Restatement" && (
                    <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-4">
                        <InputField control={control} errors={errors} label={`Date of Original Trust Being Restated (${person1Label})`} name="trustor1_trust_original_date" type="date" required />
                        <TextareaField control={control} errors={errors} label={`Authority to Amend/Restate (${person1Label})`} name="trustor1_trust_authority_amend" rows={2} required />
                        <TextareaField control={control} errors={errors} label={`Prior Amendments or Restatements (${person1Label})`} name="trustor1_prior_amendments_restatements" rows={3}/>
                        <InputField control={control} errors={errors} label={`Date of this Restatement (${person1Label})`} name="trustor1_current_trust_date" type="date" required />
                    </div>
                )}
                <InputField control={control} errors={errors} label={`State of Controlling Law (${person1Label})`} name="trustor1_trust_controlling_law_state" placeholder="e.g., Oregon" required />
                <RadioGroupField control={control} errors={errors} label={`Prenuptial Language (${person1Label}'s Trust)`} name="trustor1_trust_prenuptial_language" options={YES_NO_OPTIONS} required />
                <RadioGroupField control={control} errors={errors} label={`Investment Standard (${person1Label}'s Trust)`} name="trustor1_trust_investment_standard" options={INVESTMENT_STANDARD_OPTIONS} required />
                <RadioGroupField control={control} errors={errors} label={`No Contest Clause (${person1Label}'s Trust)`} name="trustor1_trust_no_contest_clause" options={NO_CONTEST_OPTIONS_FORM} required />
                <TextareaField control={control} errors={errors} label={`Notes for ${person1Label}'s Trust Details`} name="trustor1_notes_trust_details" rows={3} />
            </FormSection>

            <FormSection title={`${person2Label}'s Trust Details`} borderClassName="border-green-300/80">
                <InputField control={control} errors={errors} label={`Trust Name (${person2Label})`} name="trustor2_trust_name" placeholder={`e.g., ${person2Label} Revocable Living Trust`} required />
                <RadioGroupField control={control} errors={errors} label={`Trust Execution Type (${person2Label})`} name="trustor2_trust_execution_type" options={TRUST_EXECUTION_TYPE_OPTIONS} required layout="vertical"/>
                 {watchTrustor2TrustExecutionType === "New" && (
                     <InputField control={control} errors={errors} label={`Date of Trust Signing (${person2Label})`} name="trustor2_current_trust_date" type="date" required />
                )}
                {watchTrustor2TrustExecutionType === "Restatement" && (
                    <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-4">
                        <InputField control={control} errors={errors} label={`Date of Original Trust Being Restated (${person2Label})`} name="trustor2_trust_original_date" type="date" required />
                        <TextareaField control={control} errors={errors} label={`Authority to Amend/Restate (${person2Label})`} name="trustor2_trust_authority_amend" rows={2} required />
                        <TextareaField control={control} errors={errors} label={`Prior Amendments or Restatements (${person2Label})`} name="trustor2_prior_amendments_restatements" rows={3}/>
                        <InputField control={control} errors={errors} label={`Date of this Restatement (${person2Label})`} name="trustor2_current_trust_date" type="date" required />
                    </div>
                )}
                <InputField control={control} errors={errors} label={`State of Controlling Law (${person2Label})`} name="trustor2_trust_controlling_law_state" placeholder="e.g., Oregon" required />
                <RadioGroupField control={control} errors={errors} label={`Prenuptial Language (${person2Label}'s Trust)`} name="trustor2_trust_prenuptial_language" options={YES_NO_OPTIONS} required />
                <RadioGroupField control={control} errors={errors} label={`Investment Standard (${person2Label}'s Trust)`} name="trustor2_trust_investment_standard" options={INVESTMENT_STANDARD_OPTIONS} required />
                <RadioGroupField control={control} errors={errors} label={`No Contest Clause (${person2Label}'s Trust)`} name="trustor2_trust_no_contest_clause" options={NO_CONTEST_OPTIONS_FORM} required />
                <TextareaField control={control} errors={errors} label={`Notes for ${person2Label}'s Trust Details`} name="trustor2_notes_trust_details" rows={3} />
            </FormSection>

            <FormSection title="Shared Trustee Provisions" borderClassName="border-orange-200/80" description="These provisions may apply across both trusts or define how trustees interact.">
                <RadioGroupField control={control} errors={errors} label="Can any Co-Trustee act independently (General Rule)?" name="shared_trust_co_trustee_act_independently" options={YES_NO_OPTIONS} />

                <div className="mt-6 pt-6 border-t border-border">
                     <RadioGroupField control={control} errors={errors} label="Are Successor Trustee the same as Financial Agents (Overall Strategy)?" name="shared_successor_trustees_same_as_financial_agents" options={SUCCESSOR_TRUSTEE_OPTIONS} required />
                </div>
                <div className="mt-4">
                    <RadioGroupField control={control} errors={errors} label="Are Successor Trustees for both trusts appointed jointly, or separately per trust?" name="shared_are_successor_trustees_joint" options={YES_NO_OPTIONS} required
                        description="If 'Yes', one set of successor trustees will be named for both trusts. If 'No', you'll specify successors for each Trustor's Trust separately."
                    />
                </div>

                {watchAreSuccessorTrusteesJoint === 'Yes' && (
                    <FormSection title="Joint Successor Trustees (For Both Trusts)" borderClassName="border-orange-300" className="mt-4 bg-orange-100/50">
                        <RadioGroupField name="shared_successor_trustee_option" control={control} errors={errors} layout="vertical" options={JOINT_SUCCESSOR_TRUSTEE_OPTIONS}
                            description="Select the succession pattern for the joint trustees."
                        />
                        <SuccessorTrusteeSetFields
                            control={control} errors={errors} watch={watch}
                            fieldArrayNamePrefix="shared_joint_successor_trustees"
                            title="Nominate Joint Successor Trustees"
                            successorTrusteesSource={watchSuccessorTrusteesSameAsFinAgents}
                        />
                    </FormSection>
                )}
                {watchAreSuccessorTrusteesJoint === 'No' && (
                     <FormSection title="Separate Successor Trustees (Per Trust)" borderClassName="border-orange-300" className="mt-4 bg-orange-100/50">
                        <RadioGroupField name="shared_successor_trustee_option" control={control} errors={errors} layout="vertical" options={SEPARATE_SUCCESSOR_TRUSTEE_OPTIONS}
                            description="Select the general succession pattern if separate."
                        />
                        <SuccessorTrusteeSetFields
                            control={control} errors={errors} watch={watch}
                            fieldArrayNamePrefix="shared_trustor1_successor_trustees"
                            title={`Successor Trustees for ${person1Label}'s Trust`}
                            successorTrusteesSource={watchSuccessorTrusteesSameAsFinAgents}
                        />
                        <SuccessorTrusteeSetFields
                            control={control} errors={errors} watch={watch}
                            fieldArrayNamePrefix="shared_trustor2_successor_trustees"
                            title={`Successor Trustees for ${person2Label}'s Trust`}
                            successorTrusteesSource={watchSuccessorTrusteesSameAsFinAgents}
                        />
                    </FormSection>
                )}
            </FormSection>
            
            <FormSection title="Trustee Removal Provisions (Per Trust)" borderClassName="border-rose-200/80">
                <FormSection title={`Removal of Trustees by Others (${person1Label}'s Trust)`} className="mb-4 bg-rose-50/30" borderClassName="border-rose-300/50">
                    <RadioGroupField 
                        control={control} 
                        errors={errors} 
                        label={`Select which beneficiaries may remove a Trustee for ${person1Label}'s Trust:`} 
                        name="trustor1_removal_trustees_by_others_criteria" 
                        options={REMOVAL_CRITERIA_OPTIONS} 
                        layout="vertical" 
                    />
                </FormSection>
                <FormSection title={`Removal of Trustees by Others (${person2Label}'s Trust)`} className="bg-rose-50/30" borderClassName="border-rose-300/50">
                    <RadioGroupField 
                        control={control} 
                        errors={errors} 
                        label={`Select which beneficiaries may remove a Trustee for ${person2Label}'s Trust:`} 
                        name="trustor2_removal_trustees_by_others_criteria" 
                        options={REMOVAL_CRITERIA_OPTIONS} 
                        layout="vertical" 
                    />
                </FormSection>
            </FormSection>

            <FormSection title="QDOT Trustees (Per Trustor)" borderClassName="border-pink-200/80" description="Recommended if a Trustor is not a U.S. citizen. Discuss gift tax issues.">
                <FormSection title={`QDOT Trustees (${person1Label}'s Trust)`} className="mb-4 bg-pink-50/30" borderClassName="border-pink-300/50">
                    <RadioGroupField control={control} errors={errors} label={`Does ${person1Label}'s Trust require QDOT Trustee(s)?`} name="trustor1_qdot_trustee_named" options={YES_NO_OPTIONS} />
                    {watchTrustor1QDOTNamed === "Yes" && (
                        <div className="ml-6 mt-2 space-y-3 border p-3 rounded-md bg-muted/30">
                            <InputField control={control} errors={errors} label={`1. QDOT Trustee Name (${person1Label})`} name="trustor1_qdot_trustee1_name" />
                            <InputField control={control} errors={errors} label={`2. QDOT Trustee Name (${person1Label})`} name="trustor1_qdot_trustee2_name" />
                            <RadioGroupField control={control} errors={errors} label={`Co-Trustees for ${person1Label}'s QDOT?`} name="trustor1_qdot_co_trustees" options={YES_NO_OPTIONS} />
                        </div>
                    )}
                </FormSection>

                 <FormSection title={`QDOT Trustees (${person2Label}'s Trust)`} className="bg-pink-50/30" borderClassName="border-pink-300/50">
                    <RadioGroupField control={control} errors={errors} label={`Does ${person2Label}'s Trust require QDOT Trustee(s)?`} name="trustor2_qdot_trustee_named" options={YES_NO_OPTIONS} />
                    {watchTrustor2QDOTNamed === "Yes" && (
                        <div className="ml-6 mt-2 space-y-3 border p-3 rounded-md bg-muted/30">
                            <InputField control={control} errors={errors} label={`1. QDOT Trustee Name (${person2Label})`} name="trustor2_qdot_trustee1_name" />
                            <InputField control={control} errors={errors} label={`2. QDOT Trustee Name (${person2Label})`} name="trustor2_qdot_trustee2_name" />
                            <RadioGroupField control={control} errors={errors} label={`Co-Trustees for ${person2Label}'s QDOT?`} name="trustor2_qdot_co_trustees" options={YES_NO_OPTIONS} />
                        </div>
                    )}
                </FormSection>
            </FormSection>
            
            <FormSection title="Trust Protector (Per Trustor)" borderClassName="border-teal-200/80">
                <FormSection title={`Trust Protector (${person1Label}'s Trust)`} className="mb-4 bg-teal-50/30" borderClassName="border-teal-300/50">
                    <RadioGroupField 
                        control={control} errors={errors} 
                        label={`Do you want to name a Trust Protector for ${person1Label}'s Trust?`} 
                        name="trustor1_want_trust_protector" 
                        options={YES_NO_OPTIONS} 
                        required 
                        description="If no, a majority of Successor Trustees may appoint a Trust Protector for this trust." 
                    />
                    {watchTrustor1WantTrustProtector === "Yes" && (
                        <InputField 
                            control={control} errors={errors} 
                            label={`Trust Protector Name (${person1Label})`} 
                            name="trustor1_trust_protector_name" 
                            placeholder="Full Name of Trust Protector" 
                            required={watchTrustor1WantTrustProtector === "Yes"} 
                            className="ml-6" 
                        />
                    )}
                </FormSection>

                <FormSection title={`Trust Protector (${person2Label}'s Trust)`} className="bg-teal-50/30" borderClassName="border-teal-300/50">
                    <RadioGroupField 
                        control={control} errors={errors} 
                        label={`Do you want to name a Trust Protector for ${person2Label}'s Trust?`} 
                        name="trustor2_want_trust_protector" 
                        options={YES_NO_OPTIONS} 
                        required 
                        description="If no, a majority of Successor Trustees may appoint a Trust Protector for this trust." 
                    />
                    {watchTrustor2WantTrustProtector === "Yes" && (
                        <InputField 
                            control={control} errors={errors} 
                            label={`Trust Protector Name (${person2Label})`} 
                            name="trustor2_trust_protector_name" 
                            placeholder="Full Name of Trust Protector" 
                            required={watchTrustor2WantTrustProtector === "Yes"} 
                            className="ml-6" 
                        />
                    )}
                </FormSection>
            </FormSection>
            
            <FormSection title="Incapacity Panel (Per Trustor)" borderClassName="border-indigo-200/80">
                <FormSection title={`Incapacity Panel (${person1Label}'s Trust)`} className="mb-4 bg-indigo-50/30" borderClassName="border-indigo-300/50">
                    <RadioGroupField 
                        control={control} errors={errors} 
                        label={`Do you want an Incapacity Panel for ${person1Label}'s Trust?`} 
                        name="trustor1_want_incapacity_panel" 
                        options={YES_NO_OPTIONS} 
                        required 
                        layout="vertical"
                        description={`Panel determines capacity for ${person1Label} regarding their trust.`}
                    />
                    {watchTrustor1WantIncapacityPanel === "Yes" && (
                        <FormSection title={`${person1Label} Incapacity Panel Members`} className="bg-muted/30 ml-6 mt-3" borderClassName="border-indigo-400">
                            <InputField control={control} errors={errors} label="1. Member Name" name="trustor1_incapacity_panel_member1" />
                            <InputField control={control} errors={errors} label="2. Member Name" name="trustor1_incapacity_panel_member2" />
                            <InputField control={control} errors={errors} label="3. Member Name" name="trustor1_incapacity_panel_member3" />
                            <RadioGroupField control={control} errors={errors} label="Consent Required" name="trustor1_incapacity_panel_consent" options={INCAPACITY_CONSENT_OPTIONS} />
                        </FormSection>
                    )}
                </FormSection>
                
                <FormSection title={`Incapacity Panel (${person2Label}'s Trust)`} className="bg-indigo-50/30" borderClassName="border-indigo-300/50">
                    <RadioGroupField 
                        control={control} errors={errors} 
                        label={`Do you want an Incapacity Panel for ${person2Label}'s Trust?`} 
                        name="trustor2_want_incapacity_panel" 
                        options={YES_NO_OPTIONS} 
                        required 
                        layout="vertical"
                        description={`Panel determines capacity for ${person2Label} regarding their trust.`}
                    />
                    {watchTrustor2WantIncapacityPanel === "Yes" && (
                        <FormSection title={`${person2Label} Incapacity Panel Members`} className="bg-muted/30 ml-6 mt-3" borderClassName="border-indigo-400">
                            <InputField control={control} errors={errors} label="1. Member Name" name="trustor2_incapacity_panel_member1" />
                            <InputField control={control} errors={errors} label="2. Member Name" name="trustor2_incapacity_panel_member2" />
                            <InputField control={control} errors={errors} label="3. Member Name" name="trustor2_incapacity_panel_member3" />
                            <RadioGroupField control={control} errors={errors} label="Consent Required" name="trustor2_incapacity_panel_consent" options={INCAPACITY_CONSENT_OPTIONS} />
                        </FormSection>
                    )}
                </FormSection>
            </FormSection>
        </fieldset>
    );
};


export const DistributionSeparateTab = ({ person1Label = "Trustor 1", person2Label = "Trustor 2" }) => {
    const { control, formState: { errors }, watch } = useFormContext();

    const watchTrustor1TPP = watch("trustor1_tpp_distribution");
    const watchTrustor1AnyCharity = watch("trustor1_any_specific_distributions_charity");
    const watchTrustor1AnyIndividualGift = watch("trustor1_any_specific_distributions_individuals");
    const watchTrustor1ResidualMainOption = watch("trustor1_residual_distribution_main_option");
    const watchTrustor1ResidualGroupOptionSelected = watch("trustor1_residual_group_option_selected");
    const watchTrustor1GroupTermsPrincipal = watch("trustor1_group_terms_principal_option");
    const watchTrustor1GroupBeneficiaryTrusteeOption = watch("trustor1_group_beneficiary_trustee_option");
    const watchTrustor1UltimatePattern = watch("trustor1_ultimate_distribution_pattern");
    const watchTrustor1UltimateT1Option = watch("trustor1_ultimate_t1_option");

    const watchTrustor2TPP = watch("trustor2_tpp_distribution");
    const watchTrustor2AnyCharity = watch("trustor2_any_specific_distributions_charity");
    const watchTrustor2AnyIndividualGift = watch("trustor2_any_specific_distributions_individuals");
    const watchTrustor2ResidualMainOption = watch("trustor2_residual_distribution_main_option");
    const watchTrustor2ResidualGroupOptionSelected = watch("trustor2_residual_group_option_selected"); // Corrected watch path
    const watchTrustor2GroupTermsPrincipal = watch("t2_group_terms_principal_option"); // Corrected watch path prefix
    const watchTrustor2GroupBeneficiaryTrusteeOption = watch("t2_group_beneficiary_trustee_option"); // Corrected watch path prefix
    const watchTrustor2UltimatePattern = watch("trustor2_ultimate_distribution_pattern");
    const watchTrustor2UltimateT2Option = watch("trustor2_ultimate_t2_option"); // Corrected from ultimate_t1_option

    const watchCommonPotOption = watch("common_pot_trust_option");
    const watchRetirementPreservation = watch("retirement_preservation_trust");
    const watchRetirementNamesMatch = watch("retirement_preservation_names_match_residual");
    const watchOptionalPOA = watch("retirement_trust_optional_poa");
    const watchRetirementTrustType = watch("retirement_trust_type");
    const watchRetirementAccumulationMethod = watch("retirement_accumulation_distribution_method");

    const trustor1ResidualMainOptions = RESIDUAL_DISTRIBUTION_MAIN_OPTIONS.filter(opt => opt.value !== "Different Group").map(opt => {
        if (opt.value === "Group") {
            return { ...opt, label: `Group Distribution Options (NOTE: Assumes ALL beneficiaries are children of ${person1Label})` };
        }
        return opt;
    });

    const trustor2ResidualMainOptions = RESIDUAL_DISTRIBUTION_MAIN_OPTIONS.filter(opt => opt.value !== "Different Group").map(opt => {
        if (opt.value === "Group") {
            return { ...opt, label: `Group Distribution Options (NOTE: Assumes ALL beneficiaries are children of ${person2Label})` };
        }
        return opt;
    });


    return (
        <fieldset>
             <legend className="sr-only">Distribution Plan for Separate Trusts</legend>

            <FormSection title="Tangible Personal Property (TPP) Distribution" borderClassName="border-lime-200/80"
                         description={`How TPP from each trustor's separate trust should be handled.`}>
                <FormSection title={`${person1Label}'s TPP`} className="mb-6 bg-lime-100/30" borderClassName="border-lime-300/50">
                    <RadioGroupField name="trustor1_tpp_distribution" options={TPP_DISTRIBUTION_OPTIONS} control={control} errors={errors} required layout="vertical" />
                    {watchTrustor1TPP === 'Equally to' && (<InputField control={control} errors={errors} name="trustor1_tpp_equally_to_names" placeholder="Enter names" required className="mt-2 ml-6" /> )}
                    <TextareaField control={control} errors={errors} label={`Other/Notes (${person1Label} TPP)`} name="trustor1_tpp_other_notes" rows={2} className="mt-4" />
                </FormSection>

                <FormSection title={`${person2Label}'s TPP`} className="bg-lime-100/30" borderClassName="border-lime-300/50">
                    <RadioGroupField name="trustor2_tpp_distribution" options={TPP_DISTRIBUTION_OPTIONS} control={control} errors={errors} required layout="vertical" />
                    {watchTrustor2TPP === 'Equally to' && (<InputField control={control} errors={errors} name="trustor2_tpp_equally_to_names" placeholder="Enter names" required className="mt-2 ml-6" /> )}
                    <TextareaField control={control} errors={errors} label={`Other/Notes (${person2Label} TPP)`} name="trustor2_tpp_other_notes" rows={2} className="mt-4" />
                </FormSection>
            </FormSection>

            <FormSection title="Specific Distributions to Charity" borderClassName="border-emerald-200/80"
                         description="Gifts of specific assets or cash amounts to charitable organizations from each trust.">
                <FormSection title={`${person1Label}'s Charitable Gifts`} className="mb-6 bg-emerald-100/30" borderClassName="border-emerald-300/50">
                    <RadioGroupField control={control} errors={errors} label="Any specific charity distributions?" name="trustor1_any_specific_distributions_charity" options={YES_NO_OPTIONS} required />
                    {watchTrustor1AnyCharity === "Yes" && <CharityDistributionFields control={control} errors={errors} watch={watch} fieldArrayNamePrefix="trustor1_charity_distributions" />}
                </FormSection>
                 <FormSection title={`${person2Label}'s Charitable Gifts`} className="bg-emerald-100/30" borderClassName="border-emerald-300/50">
                    <RadioGroupField control={control} errors={errors} label="Any specific charity distributions?" name="trustor2_any_specific_distributions_charity" options={YES_NO_OPTIONS} required />
                    {watchTrustor2AnyCharity === "Yes" && <CharityDistributionFields control={control} errors={errors} watch={watch} fieldArrayNamePrefix="trustor2_charity_distributions" />}
                </FormSection>
            </FormSection>

            <FormSection title="Specific Distributions to Individuals" borderClassName="border-orange-200/80"
                         description="Gifts of specific assets or cash amounts to individuals from each trust.">
                <FormSection title={`${person1Label}'s Individual Gifts`} className="mb-6 bg-orange-100/30" borderClassName="border-orange-300/50">
                    <RadioGroupField control={control} errors={errors} label="Any specific individual distributions?" name="trustor1_any_specific_distributions_individuals" options={YES_NO_OPTIONS} required />
                    {watchTrustor1AnyIndividualGift === "Yes" && <SpecificGiftsFields control={control} errors={errors} watch={watch} fieldArrayNamePrefix="trustor1_individual_gifts" distributionTypeOptions={NON_AB_DISTRIBUTION_TYPE_OPTIONS} />}
                </FormSection>
                <FormSection title={`${person2Label}'s Individual Gifts`} className="bg-orange-100/30" borderClassName="border-orange-300/50">
                    <RadioGroupField control={control} errors={errors} label="Any specific individual distributions?" name="trustor2_any_specific_distributions_individuals" options={YES_NO_OPTIONS} required />
                    {watchTrustor2AnyIndividualGift === "Yes" && <SpecificGiftsFields control={control} errors={errors} watch={watch} fieldArrayNamePrefix="trustor2_individual_gifts" distributionTypeOptions={NON_AB_DISTRIBUTION_TYPE_OPTIONS}/>}
                </FormSection>
            </FormSection>

            <FormSection title="Shared Distribution Provisions" borderClassName="border-purple-300/80" description="These provisions often apply to descendants of both trustors or have a shared nature.">
                <FormSection title="Common Pot Trust" borderClassName="border-purple-400/50" className="bg-purple-100/30">
                    <RadioGroupField name="common_pot_trust_option" control={control} errors={errors} layout="vertical" options={COMMON_POT_OPTIONS} />
                    {watchCommonPotOption === "Common Pot until Youngest Specified Age" && <InputField control={control} errors={errors} label="Specified Age" name="common_pot_specified_age" type="number" placeholder="e.g., 21" className="ml-6 w-32"/>}
                    {watchCommonPotOption === "Common Pot until Youngest Specified Age or College" && <InputField control={control} errors={errors} label="Specified Age" name="common_pot_alt_specified_age" type="number" placeholder="e.g., 23" className="ml-6 w-32"/>}
                </FormSection>

                <FormSection title="Retirement Preservation Trust (Consider if per-trust or shared)" borderClassName="border-purple-400/50" className="bg-purple-100/30 mt-4">
                    <RadioGroupField label="Establish Retirement Preservation Trust(s)?" name="retirement_preservation_trust" options={YES_NO_OPTIONS} control={control} errors={errors}
                        description="Decide if this is a single trust for joint accounts, or if separate RPTs are needed per original trust."
                    />
                    {watchRetirementPreservation === "Yes" && (
                        <div className="ml-6 mt-2 space-y-3">
                            <RadioGroupField name="retirement_preservation_names_match_residual" control={control} errors={errors} layout="vertical" options={[ {value: 'Yes', label: "Beneficiaries match respective residual plans"}, {value: 'No', label: "List specific beneficiaries:"} ]}/>
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

                <FormSection title="Optional Power of Appointment & Nuptial Requirement" borderClassName="border-purple-400/50" className="bg-purple-100/30 mt-4">
                     <RadioGroupField label="Include Optional Power of Appointment for Beneficiaries (General Policy)?" name="retirement_trust_optional_poa" control={control} errors={errors} options={OPTIONAL_POA_OPTIONS} layout="vertical" />
                    {watchOptionalPOA === "Yes, Except" && <InputField control={control} errors={errors} name="retirement_trust_optional_poa_except" placeholder="Enter exceptions" className="ml-6"/>}
                    <p className="text-xs text-muted-foreground mt-2 ml-6">NOTE: Allows Beny To Designate Successor POA-NOT FOR ACCESS TRUST OR SNT.</p>
                    <RadioGroupField label="Require beneficiary pre/post-nup before distribution (General Policy)?" name="beneficiary_nuptial_required" options={YES_NO_OPTIONS} control={control} errors={errors} className="mt-4"/>
                </FormSection>
            </FormSection>

            <FormSection title="Residual Distribution of Each Trust" borderClassName="border-pink-200/80"
                         description="How the remaining assets of each trust are distributed after specific gifts.">
                <FormSection title={`${person1Label}'s Residual Distribution`} className="mb-6 bg-pink-100/30" borderClassName="border-pink-300/50">
                     <RadioGroupField name="trustor1_residual_distribution_main_option" control={control} errors={errors} layout="vertical" options={trustor1ResidualMainOptions} />
                     {watchTrustor1ResidualMainOption === "Group" && (
                        <FormSection title={`Group Distribution Details for ${person1Label}`} borderClassName="border-pink-400/60" className="ml-6 mt-4 bg-pink-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <InputField control={control} errors={errors} label={`Min. age beny is own Trustee (${person1Label})`} name="trustor1_group_min_age_trustee" type="number" />
                                <InputField control={control} errors={errors} label={`Age beny receives income (${person1Label})`} name="trustor1_group_age_income_dists" type="number" />
                            </div>
                            <RadioGroupField label={`Select Group Distribution Type (${person1Label}):`} name="trustor1_residual_group_option_selected" control={control} errors={errors} layout="vertical" options={GROUP_DISTRIBUTION_OPTIONS} />
                            {watchTrustor1ResidualGroupOptionSelected === 'Equal and Terms Specified' && (
                                <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-3">
                                    <h6 className="text-sm font-medium text-muted-foreground mb-2 uppercase">Terms Specified Details ({person1Label})</h6>
                                    <RadioGroupField label={`Income (${person1Label})`} name="trustor1_group_terms_income_option" control={control} errors={errors} layout="vertical" options={TERMS_INCOME_OPTIONS} />
                                    <RadioGroupField label={`Principal (${person1Label})`} name="trustor1_group_terms_principal_option" control={control} errors={errors} layout="vertical" options={TERMS_PRINCIPAL_OPTIONS} />
                                    {(watchTrustor1GroupTermsPrincipal?.includes('Age') || watchTrustor1GroupTermsPrincipal?.includes('Stagger')) && (
                                        <div className="grid grid-cols-3 gap-2 ml-6">
                                            <InputField label="Age 1" name="trustor1_group_terms_age1" type="number" control={control} errors={errors} className="mb-0"/>
                                            {(watchTrustor1GroupTermsPrincipal?.includes('Stagger 2') || watchTrustor1GroupTermsPrincipal?.includes('Stagger 3')) && <InputField label="Age 2" name="trustor1_group_terms_age2" type="number" control={control} errors={errors} className="mb-0"/>}
                                            {watchTrustor1GroupTermsPrincipal?.includes('Stagger 3') && <InputField label="Age 3" name="trustor1_group_terms_age3" type="number" control={control} errors={errors} className="mb-0"/>}
                                        </div>
                                    )}
                                    <RadioGroupField label={`Lapse Provisions At Death of Beneficiary (${person1Label})`} name="trustor1_group_terms_lapse_provision" control={control} errors={errors} layout="vertical" options={TERMS_LAPSE_PROVISION_OPTIONS} />
                                </div>
                            )}
                            {watchTrustor1ResidualGroupOptionSelected === 'Asset Protection Trust w/ Investment Trustee' && <InputField control={control} errors={errors} label={`Name of Investment Trustee (${person1Label})`} name="trustor1_group_asset_protection_invest_trustee_name"  className="ml-6"/> }
                            {(watchTrustor1ResidualGroupOptionSelected === 'GST Shares Income HEMS Remainder GC Spec Age' || watchTrustor1ResidualGroupOptionSelected === 'GST Shares Disc HEMS Remainder GC Spec Age' || watchTrustor1ResidualGroupOptionSelected === 'GST Shares TRU Remainder GC Spec Age' || watchTrustor1ResidualGroupOptionSelected === 'GST Family Incentive Trust') && <InputField control={control} errors={errors} label={`Specified Age (${person1Label})`} name="trustor1_group_gst_spec_age" type="number"  className="ml-6 w-32"/>}
                            {(watchTrustor1ResidualGroupOptionSelected === 'GST Shares TRU Remainder GC 25/30/35' || watchTrustor1ResidualGroupOptionSelected === 'GST Shares TRU Remainder GC Spec Age') && <InputField control={control} errors={errors} label={`TRU Distribution Rate (%) (${person1Label})`} name="trustor1_group_gst_tru_rate" type="number"  className="ml-6 w-32"/>}
                            <div className="mt-4 pt-4 border-t">
                                <h6 className="text-md font-semibold text-foreground mb-2">Beneficiary Trustee Option ({person1Label})</h6>
                                <RadioGroupField name="trustor1_group_beneficiary_trustee_option" control={control} errors={errors} layout="vertical" options={BENEFICIARY_TRUSTEE_OPTIONS} />
                                {watchTrustor1GroupBeneficiaryTrusteeOption === '3rd Party' && ( <div className="ml-6 mt-2 space-y-2 border p-3 rounded-md bg-muted/30"> <InputField label="1. 3rd Party Trustee Name" name="trustor1_group_beneficiary_trustee_3rd_party1" control={control} errors={errors} /> <InputField label="2. 3rd Party Trustee Name (Optional)" name="trustor1_group_beneficiary_trustee_3rd_party2" control={control} errors={errors} /> <RadioGroupField label="If two 3rd party trustees, how should they act?" name="trustor1_group_beneficiary_trustee_3rd_party_acting" options={SUCCESSOR_TRUSTEE_ACTING_OPTIONS} control={control} errors={errors} layout="vertical"/> </div> )}
                                {watchTrustor1GroupBeneficiaryTrusteeOption === 'Beneficiary and 3rd Party' && ( <div className="ml-6 mt-2 space-y-2 border p-3 rounded-md bg-muted/30"> <InputField label="3rd Party Co-Trustee Name" name="trustor1_group_beneficiary_trustee_ben_3rd_party_name" control={control} errors={errors} /> <RadioGroupField label="How should Beneficiary and 3rd Party Co-Trustees act?" name="trustor1_group_beneficiary_trustee_ben_3rd_party_acting" options={SUCCESSOR_TRUSTEE_ACTING_OPTIONS} control={control} errors={errors} layout="vertical"/></div> )}
                                {watchTrustor1GroupBeneficiaryTrusteeOption === 'Beneficiary at Named Age' && ( <InputField label="Age Beneficiary Becomes Sole Trustee" name="trustor1_group_beneficiary_trustee_ben_age" type="number" control={control} errors={errors} className="ml-6"/> )}
                            </div>
                             <FormSection title={`Incentive Clauses for ${person1Label}'s Group Distribution`} className="mt-4" borderClassName="border-primary/20">
                                <CheckboxGroupField label="Select Clauses (Optional):" name={`trustor1_group_incentive_clauses`} control={control} errors={errors} options={INCENTIVE_CLAUSE_OPTIONS} />
                                <InputField control={control} errors={errors} label="Other Clause:" name={`trustor1_group_incentive_clauses_other`} placeholder="Specify other incentive" />
                            </FormSection>
                            <TextareaField label={`Notes for ${person1Label}'s Group Distribution`} name="trustor1_group_distribution_notes" control={control} errors={errors} rows={2} placeholder="Any specific notes..." className="mt-4" />
                        </FormSection>
                    )}
                    {watchTrustor1ResidualMainOption === "Terms" && <ResidualBeneficiaryTermsFields control={control} errors={errors} watch={watch} fieldArrayNamePrefix="trustor1_residual_beneficiaries" distributionTypeOptions={NON_AB_DISTRIBUTION_TYPE_OPTIONS} />}
                </FormSection>
                <FormSection title={`${person2Label}'s Residual Distribution`} className="bg-pink-100/30" borderClassName="border-pink-300/50">
                    <RadioGroupField name="trustor2_residual_distribution_main_option" control={control} errors={errors} layout="vertical" options={trustor2ResidualMainOptions} />
                     {watchTrustor2ResidualMainOption === "Group" && (
                        <FormSection title={`Group Distribution Details for ${person2Label}`} borderClassName="border-pink-400/60" className="ml-6 mt-4 bg-pink-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <InputField control={control} errors={errors} label={`Min. age beny is own Trustee (${person2Label})`} name="t2_group_min_age_trustee" type="number" />
                                <InputField control={control} errors={errors} label={`Age beny receives income (${person2Label})`} name="t2_group_age_income_dists" type="number" />
                            </div>
                            <RadioGroupField label={`Select Group Distribution Type (${person2Label}):`} name="trustor2_residual_group_option_selected" control={control} errors={errors} layout="vertical" options={GROUP_DISTRIBUTION_OPTIONS} />
                            {watchTrustor2ResidualGroupOptionSelected === 'Equal and Terms Specified' && (
                                <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-3">
                                    <h6 className="text-sm font-medium text-muted-foreground mb-2 uppercase">Terms Specified Details ({person2Label})</h6>
                                    <RadioGroupField label={`Income (${person2Label})`} name="t2_group_terms_income_option" control={control} errors={errors} layout="vertical" options={TERMS_INCOME_OPTIONS} />
                                    <RadioGroupField label={`Principal (${person2Label})`} name="t2_group_terms_principal_option" control={control} errors={errors} layout="vertical" options={TERMS_PRINCIPAL_OPTIONS} />
                                    {(watchTrustor2GroupTermsPrincipal?.includes('Age') || watchTrustor2GroupTermsPrincipal?.includes('Stagger')) && (
                                        <div className="grid grid-cols-3 gap-2 ml-6">
                                            <InputField label="Age 1" name="t2_group_terms_age1" type="number" control={control} errors={errors} className="mb-0"/>
                                            {(watchTrustor2GroupTermsPrincipal?.includes('Stagger 2') || watchTrustor2GroupTermsPrincipal?.includes('Stagger 3')) && <InputField label="Age 2" name="t2_group_terms_age2" type="number" control={control} errors={errors} className="mb-0"/>}
                                            {watchTrustor2GroupTermsPrincipal?.includes('Stagger 3') && <InputField label="Age 3" name="t2_group_terms_age3" type="number" control={control} errors={errors} className="mb-0"/>}
                                        </div>
                                    )}
                                    <RadioGroupField label={`Lapse Provisions At Death of Beneficiary (${person2Label})`} name="t2_group_terms_lapse_provision" control={control} errors={errors} layout="vertical" options={TERMS_LAPSE_PROVISION_OPTIONS} />
                                </div>
                            )}
                            {watchTrustor2ResidualGroupOptionSelected === 'Asset Protection Trust w/ Investment Trustee' && <InputField control={control} errors={errors} label={`Name of Investment Trustee (${person2Label})`} name="t2_group_asset_protection_invest_trustee_name"  className="ml-6"/> }
                            {(watchTrustor2ResidualGroupOptionSelected === 'GST Shares Income HEMS Remainder GC Spec Age' || watchTrustor2ResidualGroupOptionSelected === 'GST Shares Disc HEMS Remainder GC Spec Age' || watchTrustor2ResidualGroupOptionSelected === 'GST Shares TRU Remainder GC Spec Age' || watchTrustor2ResidualGroupOptionSelected === 'GST Family Incentive Trust') && <InputField control={control} errors={errors} label={`Specified Age (${person2Label})`} name="t2_group_gst_spec_age" type="number"  className="ml-6 w-32"/>}
                            {(watchTrustor2ResidualGroupOptionSelected === 'GST Shares TRU Remainder GC 25/30/35' || watchTrustor2ResidualGroupOptionSelected === 'GST Shares TRU Remainder GC Spec Age') && <InputField control={control} errors={errors} label={`TRU Distribution Rate (%) (${person2Label})`} name="t2_group_gst_tru_rate" type="number"  className="ml-6 w-32"/>}
                            <div className="mt-4 pt-4 border-t">
                                <h6 className="text-md font-semibold text-foreground mb-2">Beneficiary Trustee Option ({person2Label})</h6>
                                <RadioGroupField name="t2_group_beneficiary_trustee_option" control={control} errors={errors} layout="vertical" options={BENEFICIARY_TRUSTEE_OPTIONS} />
                                {watchTrustor2GroupBeneficiaryTrusteeOption === '3rd Party' && ( <div className="ml-6 mt-2 space-y-2 border p-3 rounded-md bg-muted/30"> <InputField label="1. 3rd Party Trustee Name" name="t2_group_beneficiary_trustee_3rd_party1" control={control} errors={errors} /> <InputField label="2. 3rd Party Trustee Name (Optional)" name="t2_group_beneficiary_trustee_3rd_party2" control={control} errors={errors} /> <RadioGroupField label="If two 3rd party trustees, how should they act?" name="t2_group_beneficiary_trustee_3rd_party_acting" options={SUCCESSOR_TRUSTEE_ACTING_OPTIONS} control={control} errors={errors} layout="vertical"/> </div> )}
                                {watchTrustor2GroupBeneficiaryTrusteeOption === 'Beneficiary and 3rd Party' && ( <div className="ml-6 mt-2 space-y-2 border p-3 rounded-md bg-muted/30"> <InputField label="3rd Party Co-Trustee Name" name="t2_group_beneficiary_trustee_ben_3rd_party_name" control={control} errors={errors} /> <RadioGroupField label="How should Beneficiary and 3rd Party Co-Trustees act?" name="t2_group_beneficiary_trustee_ben_3rd_party_acting" options={SUCCESSOR_TRUSTEE_ACTING_OPTIONS} control={control} errors={errors} layout="vertical"/></div> )}
                                {watchTrustor2GroupBeneficiaryTrusteeOption === 'Beneficiary at Named Age' && ( <InputField label="Age Beneficiary Becomes Sole Trustee" name="t2_group_beneficiary_trustee_ben_age" type="number" control={control} errors={errors} className="ml-6"/> )}
                            </div>
                             <FormSection title={`Incentive Clauses for ${person2Label}'s Group Distribution`} className="mt-4" borderClassName="border-primary/20">
                                <CheckboxGroupField label="Select Clauses (Optional):" name={`t2_group_incentive_clauses`} control={control} errors={errors} options={INCENTIVE_CLAUSE_OPTIONS} />
                                <InputField control={control} errors={errors} label="Other Clause:" name={`t2_group_incentive_clauses_other`} placeholder="Specify other incentive" />
                            </FormSection>
                            <TextareaField label={`Notes for ${person2Label}'s Group Distribution`} name="t2_group_distribution_notes" control={control} errors={errors} rows={2} placeholder="Any specific notes..." className="mt-4" />
                        </FormSection>
                    )}
                    {watchTrustor2ResidualMainOption === "Terms" && <ResidualBeneficiaryTermsFields control={control} errors={errors} watch={watch} fieldArrayNamePrefix="trustor2_residual_beneficiaries" distributionTypeOptions={NON_AB_DISTRIBUTION_TYPE_OPTIONS} />}
                </FormSection>
            </FormSection>

            <FormSection title="Ultimate Distribution (Contingent)" borderClassName="border-red-200/80"
                         description="If ALL previously named beneficiaries of a trust fail.">
                 <FormSection title={`${person1Label}'s Ultimate Distribution`} className="mb-6 bg-red-100/30" borderClassName="border-red-300/50">
                    <RadioGroupField name="trustor1_ultimate_distribution_pattern" options={ULTIMATE_T1_OPTIONS} control={control} errors={errors} required layout="vertical"
                        description={`Ultimate distribution if all named beneficiaries of ${person1Label}'s trust fail.`}/>
                    {watchTrustor1UltimateT1Option === 'Trustor One Named Beneficiaries' && (
                        <UltimateBeneficiaryFields control={control} errors={errors} fieldArrayName="trustor1_ultimate_joint_beneficiaries" title={`${person1Label}'s Named Ultimate Beneficiaries`} />
                    )}
                </FormSection>
                 <FormSection title={`${person2Label}'s Ultimate Distribution`} className="bg-red-100/30" borderClassName="border-red-300/50">
                    <RadioGroupField name="trustor2_ultimate_distribution_pattern" options={ULTIMATE_T2_OPTIONS} control={control} errors={errors} required layout="vertical"
                        description={`Ultimate distribution if all named beneficiaries of ${person2Label}'s trust fail.`}/>
                    {watchTrustor2UltimateT2Option === 'Trustor Two Named Beneficiaries' && (
                        <UltimateBeneficiaryFields control={control} errors={errors} fieldArrayName="trustor2_ultimate_joint_beneficiaries" title={`${person2Label}'s Named Ultimate Beneficiaries`} />
                    )}
                </FormSection>
            </FormSection>

            <FormSection title="Distribution Notes" borderClassName="border-gray-300/80">
                <TextareaField control={control} errors={errors} label={`Notes for ${person1Label}'s Overall Distribution`} name="trustor1_notes_distribution" rows={3} />
                <TextareaField control={control} errors={errors} label={`Notes for ${person2Label}'s Overall Distribution`} name="trustor2_notes_distribution" rows={3} className="mt-4"/>
            </FormSection>
        </fieldset>
    );
};
    
export const AdvancedProvisionsSeparateTab = ({ person1Label = "Trustor 1", person2Label = "Trustor 2" }) => {
    const { control, formState: { errors }, watch } = useFormContext(); 

    const watchTrustor1FundingQualifiedAssetChecklist = watch("trustor1_funding_qualified_asset_checklist");
    const watchTrustor1FundingQualifiedBeneficiaryOption = watch("trustor1_funding_qualified_beneficiary_option");
    const watchTrustor1FundingNonQualifiedAssetChecklist = watch("trustor1_funding_non_qualified_asset_checklist");
    const watchTrustor1FundingNonQualifiedBeneficiaryOption = watch("trustor1_funding_non_qualified_beneficiary_option");

    const watchTrustor2FundingQualifiedAssetChecklist = watch("trustor2_funding_qualified_asset_checklist");
    const watchTrustor2FundingQualifiedBeneficiaryOption = watch("trustor2_funding_qualified_beneficiary_option");
    const watchTrustor2FundingNonQualifiedAssetChecklist = watch("trustor2_funding_non_qualified_asset_checklist");
    const watchTrustor2FundingNonQualifiedBeneficiaryOption = watch("trustor2_funding_non_qualified_beneficiary_option");

    const watchAdvProvTrustDivisionType = watch("adv_prov_trust_division_type");

    return (
        <fieldset>
            <legend className="sr-only">Advanced Provisions for Separate Trusts</legend>
            <h3 className="text-xl font-semibold text-foreground px-2 mb-4">Trust Division &amp; Administration (Consider how these apply to separate trusts)</h3>

            <FormSection title="Funding Checklist (Per Trust)" borderClassName="border-sky-200/80">
                <FormSection title={`${person1Label}'s Trust Funding Checklist`} borderClassName="border-sky-300/70" className="mb-6 bg-sky-100/50">
                    <CheckboxField control={control} errors={errors} name="trustor1_funding_qualified_asset_checklist" label={`Qualified Asset Checklist (${person1Label})`} />
                    {watchTrustor1FundingQualifiedAssetChecklist && (
                        <div className="ml-6 space-y-3 mt-3">
                            <RadioGroupField name="trustor1_funding_qualified_beneficiary_option" control={control} errors={errors} layout="vertical" options={FUNDING_BENEFICIARY_OPTIONS} label={`Beneficiary Option for Qualified Assets (${person1Label})`} />
                            {watchTrustor1FundingQualifiedBeneficiaryOption === "Other" && <InputField label="Specify Other Beneficiaries" name="trustor1_funding_qualified_other_beneficiaries" control={control} errors={errors} />}
                        </div>
                    )}
                     <div className="mt-4 pt-4 border-t">
                        <CheckboxField control={control} errors={errors} name="trustor1_funding_non_qualified_asset_checklist" label={`Non-Qualified Asset Checklist (${person1Label})`} />
                        {watchTrustor1FundingNonQualifiedAssetChecklist && (
                            <div className="ml-6 space-y-3 mt-3">
                                <RadioGroupField name="trustor1_funding_non_qualified_beneficiary_option" control={control} errors={errors} layout="vertical" options={FUNDING_BENEFICIARY_OPTIONS} label={`Beneficiary Option for Non-Qualified Assets (${person1Label})`} />
                                {watchTrustor1FundingNonQualifiedBeneficiaryOption === "Other" && <InputField label="Specify Other Beneficiaries" name="trustor1_funding_non_qualified_other_beneficiaries" control={control} errors={errors} />}
                            </div>
                        )}
                    </div>
                </FormSection>

                <FormSection title={`${person2Label}'s Trust Funding Checklist`} borderClassName="border-sky-300/70" className="bg-sky-100/50">
                    <CheckboxField control={control} errors={errors} name="trustor2_funding_qualified_asset_checklist" label={`Qualified Asset Checklist (${person2Label})`} />
                     {watchTrustor2FundingQualifiedAssetChecklist && (
                        <div className="ml-6 space-y-3 mt-3">
                            <RadioGroupField name="trustor2_funding_qualified_beneficiary_option" control={control} errors={errors} layout="vertical" options={FUNDING_BENEFICIARY_OPTIONS} label={`Beneficiary Option for Qualified Assets (${person2Label})`} />
                            {watchTrustor2FundingQualifiedBeneficiaryOption === "Other" && <InputField label="Specify Other Beneficiaries" name="trustor2_funding_qualified_other_beneficiaries" control={control} errors={errors} />}
                        </div>
                    )}
                    <div className="mt-4 pt-4 border-t">
                        <CheckboxField control={control} errors={errors} name="trustor2_funding_non_qualified_asset_checklist" label={`Non-Qualified Asset Checklist (${person2Label})`} />
                        {watchTrustor2FundingNonQualifiedAssetChecklist && (
                            <div className="ml-6 space-y-3 mt-3">
                                <RadioGroupField name="trustor2_funding_non_qualified_beneficiary_option" control={control} errors={errors} layout="vertical" options={FUNDING_BENEFICIARY_OPTIONS} label={`Beneficiary Option for Non-Qualified Assets (${person2Label})`} />
                                {watchTrustor2FundingNonQualifiedBeneficiaryOption === "Other" && <InputField label="Specify Other Beneficiaries" name="trustor2_funding_non_qualified_other_beneficiaries" control={control} errors={errors} />}
                            </div>
                        )}
                    </div>
                </FormSection>
                <TextareaField label="Overall Funding Checklist Notes:" name="funding_checklist_notes" control={control} errors={errors} rows={3} />
            </FormSection>

            <FormSection title="General Trust Provisions (Applicable to Both Trusts Unless Specified)" borderClassName="border-violet-200/80">
                <RadioGroupField label="Duty of Competent or Surviving Trustor to Account (to beneficiaries of their own trust)?" name="adv_prov_duty_to_account_surviving" options={YES_NO_OPTIONS} control={control} errors={errors} />
                <RadioGroupField label="Duty To Account To Successor Trustee/Beneficiaries (of respective Family Trust portion, if applicable)?" name="adv_prov_duty_to_account_successor" options={ADV_PROV_DUTY_ACCOUNT_SUCCESSOR_OPTIONS} control={control} errors={errors} layout="vertical" />
                <CheckboxField control={control} errors={errors} name="adv_prov_trust_property_tic_shares" label="Tenants in Common Shares (for jointly owned property contributed)" />
                <RadioGroupField name="adv_prov_property_agreement_provision" control={control} errors={errors} layout="vertical" options={ADV_PROV_PROPERTY_AGREEMENT_OPTIONS} label="Property Agreement Selection"/>
                <RadioGroupField name="adv_prov_maintain_cp_status" options={ADV_PROV_MAINTAIN_CP_OPTIONS} control={control} errors={errors} label="Maintain Community Property Status (if applicable)"/>
                <RadioGroupField name="adv_prov_life_insurance_allocation" control={control} errors={errors} layout="vertical" options={ADV_PROV_LIFE_INSURANCE_OPTIONS} label="Life Insurance Allocation (consider for each trust)"/>
                <RadioGroupField name="adv_prov_trustor_lifetime_rights_selection" control={control} errors={errors} layout="vertical" options={ADV_PROV_LIFETIME_RIGHTS_OPTIONS} label="Trustor’s Lifetime Rights (per Trustor for their trust)"/>
                <RadioGroupField name="adv_prov_qtip_recovery_rights" control={control} errors={errors} layout="vertical" options={ADV_PROV_QTIP_RECOVERY_OPTIONS} label="QTIP Recovery Rights (if QTIPs are formed from either trust)"/>
            </FormSection>

            <FormSection title="Trust Division &amp; Administration (Consider how these apply to separate trusts)" borderClassName="border-teal-200/80">
                <RadioGroupField label="Trust Division Type (e.g., how assets flow into each trust initially or on first death if certain conditions are met):" name="adv_prov_trust_division_type" options={ADV_PROV_TRUST_DIVISION_OPTIONS} control={control} errors={errors} layout="vertical" />
                {(watchAdvProvTrustDivisionType === "A/B Split" || watchAdvProvTrustDivisionType === "A/B/C Split (QTIP)") && (
                    <div className="ml-6">
                        <RadioGroupField name="adv_prov_ab_split_funding_formula" control={control} errors={errors} layout="vertical" options={ADV_PROV_AB_SPLIT_FORMULA_OPTIONS} label="Funding Formula for Division"/>
                    </div>
                )}
                {watchAdvProvTrustDivisionType === "A/B/C Split (QTIP)" && (
                     <div className="ml-6">
                        <RadioGroupField name="adv_prov_abc_split_funding_formula" control={control} errors={errors} layout="vertical" options={ADV_PROV_ABC_SPLIT_FORMULA_OPTIONS} label="A/B/C Split (QTIP) Formula"/>
                    </div>
                )}
                <RadioGroupField label="Use FLEX Trust Provisions (Generally)?" name="adv_prov_flex_trust" options={YES_NO_OPTIONS} control={control} errors={errors} className="mt-4" />

                <FormSection title={`Administration of ${person1Label}'s Trust`} borderClassName="border-orange-300/70" className="mt-4 bg-orange-100/50">
                     <RadioGroupField name="trustor1_adv_prov_admin_option" control={control} errors={errors} layout="vertical" options={ADV_PROV_FAMILY_TRUST_ADMIN_OPTIONS} label={`${person1Label}'s Trust Admin Option`}/>
                </FormSection>
                 <FormSection title={`Administration of ${person2Label}'s Trust`} borderClassName="border-pink-300/70" className="mt-4 bg-pink-100/50">
                     <RadioGroupField name="trustor2_adv_prov_admin_option" control={control} errors={errors} layout="vertical" options={ADV_PROV_FAMILY_TRUST_ADMIN_OPTIONS} label={`${person2Label}'s Trust Admin Option`}/>
                </FormSection>
            </FormSection>

            <FormSection title="Notes" borderClassName="border-gray-200/80">
                <TextareaField control={control} errors={errors} label="Notes for Advanced Provisions (Separate Trusts)" name="notes_advanced_provisions" rows={3} />
            </FormSection>
        </fieldset>
    );
};
    
    


    


    









    

    