// @ts-nocheck
// TODO: Remove ts-nocheck and fix types
"use client";

import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputField, RadioGroupField, TextareaField, SelectField } from '@/components/forms/trust-creation/field-components';
import { SpecificGiftsFields, CharityDistributionFields, UltimateBeneficiaryFields, ResidualBeneficiaryTermsFields } from '@/components/forms/trust-creation/section-components';
import { PersonalRepresentativeSetFields } from './section-components-will'; 
import {
    YES_NO_OPTIONS,
    RELATIONSHIP_OPTIONS,
    WILL_TPP_DISTRIBUTION_OPTIONS,
    WILL_PERSONAL_REPRESENTATIVE_BOND_OPTIONS, 
    INVESTMENT_STANDARD_OPTIONS,
    NO_CONTEST_OPTIONS_FORM, // Corrected constant name
    WILL_RESIDUARY_DISTRIBUTION_OPTIONS,
    WILL_ULTIMATE_DISTRIBUTION_OPTIONS,
    PERSONAL_REPRESENTATIVE_APPOINTMENT_SOURCE_OPTIONS,
    WILL_SINGLE_RESIDUAL_OPTIONS, // Added for single will residual choice
} from '@/components/forms/trust-creation/constants'; 


const FormSection = ({ title, description, children, className = "", borderClassName = "border-border" }) => (
    <Card className={`mb-8 shadow-sm ${className} ${borderClassName}`}>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
            {children}
        </CardContent>
    </Card>
);

export const GeneralWillProvisionsAndDistributionTab = ({ person1Label = "Testator", person2Label, isSingleWill = false }) => {
    const { control, formState: { errors }, watch, getValues, setValue } = useFormContext();

    const testator1Name = watch('trustor1_name') || person1Label;
    const testator2Name = person2Label ? (watch('trustor2_name') || person2Label) : undefined;

    const watchPrNominationsSameForBoth = !isSingleWill ? watch("pr_nominations_same_for_both_spouses") : undefined;
    const watchSharedPrSpouseAutoFirst = !isSingleWill ? watch("shared_pr_spouse_auto_first") : undefined;
    
    const watchT1PrSameAsFinancialAgents = watch("t1_pr_same_as_financial_agents"); 
    const watchT2PrSameAsFinancialAgents = !isSingleWill ? watch("t2_pr_same_as_financial_agents") : undefined;

    const watchTppDistributionWill = watch("tpp_distribution_will");
    const watchAnySpecificBequestsIndividuals = watch("any_specific_bequests_individuals_will");
    const watchAnySpecificBequestsCharities = watch("any_specific_bequests_charities_will");
    const watchWillResiduaryDistributionPrimaryOption = !isSingleWill ? watch("will_residuary_distribution_primary_option") : undefined;
    const watchUltimateDistributionWill = watch("ultimate_distribution_will");
    const watchWillSingleResidualOption = isSingleWill ? watch("will_single_residual_option") : undefined;
    
    const dynamicPersonalRepresentativeSourceOptions = PERSONAL_REPRESENTATIVE_APPOINTMENT_SOURCE_OPTIONS(testator1Name, testator2Name);


    return (
        <fieldset>
            <legend className="sr-only">General Will Provisions and Distribution</legend>

            <FormSection title="Personal Representative Nomination" borderClassName="border-blue-200/80">
                {isSingleWill ? (
                    <FormSection title={`${testator1Name}'s Personal Representative Nominations`} borderClassName="border-sky-300/70" className="mt-4 bg-sky-100/50">
                         <RadioGroupField
                            control={control} errors={errors} required
                            label={`Are Personal Representatives the same as ${testator1Name}'s Financial Agents listed previously?`}
                            name="t1_pr_same_as_financial_agents" // Path for single individual form
                            options={YES_NO_OPTIONS} layout="vertical"
                        />
                        <PersonalRepresentativeSetFields
                            control={control} errors={errors}
                            fieldArrayNamePrefix="t1_primary_personal_representatives_list"
                            title={`Primary Personal Representative(s) for ${testator1Name}`}
                            personalRepresentativeSourcePath={"t1_pr_same_as_financial_agents"} 
                            isJointPath={"t1_are_personal_representatives_primary_joint"}
                            actingOptionPath={"t1_primary_personal_representatives_acting_option"}
                        />
                    </FormSection>
                ) : (
                    <>
                        <RadioGroupField
                            control={control} errors={errors} required
                            label="Is Spouse Automatically First as Primary Personal Representative?"
                            name="shared_pr_spouse_auto_first"
                            options={YES_NO_OPTIONS} layout="vertical"
                        />
                        <RadioGroupField
                            control={control} errors={errors} required
                            label="Are Personal Representatives the same as the Financial Agents listed in the previous Tab?"
                            name="shared_pr_same_as_financial_agents"
                            options={YES_NO_OPTIONS} layout="vertical"
                        />
                        <RadioGroupField
                            control={control} errors={errors} required
                            label="Are Personal Representative nominations the same for both spouses' Wills?"
                            name="pr_nominations_same_for_both_spouses"
                            options={YES_NO_OPTIONS} layout="vertical"
                        />

                        {watchPrNominationsSameForBoth === "Yes" && (
                            <FormSection title="Shared Personal Representative Nominations" borderClassName="border-blue-300/70" className="mt-4 bg-blue-100/50">
                                <PersonalRepresentativeSetFields
                                    control={control} errors={errors}
                                    fieldArrayNamePrefix="primary_personal_representatives_list"
                                    title={"Primary Personal Representative(s) (Shared)"}
                                    personalRepresentativeSourcePath={"shared_pr_same_as_financial_agents"}
                                    isJointPath={"are_personal_representatives_primary_joint"}
                                    actingOptionPath={"primary_personal_representatives_acting_option"}
                                />
                            </FormSection>
                        )}

                        {watchPrNominationsSameForBoth === "No" && (
                            <>
                                <FormSection title={`${testator1Name}'s Personal Representative Nominations`} borderClassName="border-sky-300/70" className="mt-4 bg-sky-100/50">
                                   <RadioGroupField
                                        control={control} errors={errors} required
                                        label={`Are ${testator1Name}'s Personal Representatives the same as their Financial Agents?`}
                                        name="t1_pr_same_as_financial_agents"
                                        options={YES_NO_OPTIONS} layout="vertical"
                                    />
                                    <PersonalRepresentativeSetFields
                                        control={control} errors={errors}
                                        fieldArrayNamePrefix="t1_primary_personal_representatives_list"
                                        title={`Primary Personal Representative(s) for ${testator1Name}`}
                                        personalRepresentativeSourcePath={"t1_pr_same_as_financial_agents"}
                                        isJointPath={"t1_are_personal_representatives_primary_joint"}
                                        actingOptionPath={"t1_primary_personal_representatives_acting_option"}
                                    />
                                </FormSection>
                                <FormSection title={`${testator2Name}'s Personal Representative Nominations`} borderClassName="border-teal-300/70" className="mt-4 bg-teal-100/50">
                                    <RadioGroupField
                                        control={control} errors={errors} required
                                        label={`Are ${testator2Name}'s Personal Representatives the same as their Financial Agents?`}
                                        name="t2_pr_same_as_financial_agents"
                                        options={YES_NO_OPTIONS} layout="vertical"
                                    />
                                    <PersonalRepresentativeSetFields
                                        control={control} errors={errors}
                                        fieldArrayNamePrefix="t2_primary_personal_representatives_list"
                                        title={`Primary Personal Representative(s) for ${testator2Name}`}
                                        personalRepresentativeSourcePath={"t2_pr_same_as_financial_agents"}
                                        isJointPath={"t2_are_personal_representatives_primary_joint"}
                                        actingOptionPath={"t2_primary_personal_representatives_acting_option"}
                                    />
                                </FormSection>
                            </>
                        )}
                    </>
                )}
                <RadioGroupField control={control} errors={errors} label="Waive Bond for Personal Representative(s)?" name="personal_representative_waive_bond" options={WILL_PERSONAL_REPRESENTATIVE_BOND_OPTIONS} layout="vertical" required className="mt-6 pt-6 border-t border-border"/>
            </FormSection>

            <FormSection title="General Will Clauses" borderClassName="border-green-200/80">
                <InputField control={control} errors={errors} label="State of Controlling Law" name="will_controlling_law_state" placeholder="e.g., Oregon" required />
                <RadioGroupField control={control} errors={errors} label="Investment Standard" name="will_investment_standard" options={INVESTMENT_STANDARD_OPTIONS} layout="vertical" required />
                <RadioGroupField control={control} errors={errors} label="No-Contest Clause" name="no_contest_clause_will" options={NO_CONTEST_OPTIONS_FORM} layout="vertical" required />
            </FormSection>

            <FormSection title="Distribution of Tangible Personal Property (TPP)" borderClassName="border-purple-200/80">
                <RadioGroupField control={control} errors={errors} label="How to distribute TPP?" name="tpp_distribution_will" options={WILL_TPP_DISTRIBUTION_OPTIONS} layout="vertical" required />
                {watchTppDistributionWill === "Equally to:" && (
                    <TextareaField control={control} errors={errors} label="Specify Individuals for TPP" name="tpp_distribution_will_specific_names" placeholder="List names and items/shares" rows={3} className="ml-6 mt-2"/>
                )}
                 <TextareaField control={control} errors={errors} label="TPP Notes (Optional)" name="tpp_notes_will" rows={2} placeholder="Any specific instructions, lists, or clarifications regarding TPP..." className="mt-4"/>
            </FormSection>

            <FormSection title="Specific Bequests (Gifts)" borderClassName="border-orange-200/80">
                <RadioGroupField control={control} errors={errors} label="Any specific bequests to individuals?" name="any_specific_bequests_individuals_will" options={YES_NO_OPTIONS} layout="vertical" required />
                {watchAnySpecificBequestsIndividuals === "Yes" && (
                    <SpecificGiftsFields
                        control={control}
                        errors={errors}
                        watch={watch}
                        fieldArrayNamePrefix="specific_bequests_individuals_will_list"
                        formType="will"
                    />
                )}
                <RadioGroupField control={control} errors={errors} label="Any specific bequests to charities?" name="any_specific_bequests_charities_will" options={YES_NO_OPTIONS} layout="vertical" required className="mt-6"/>
                {watchAnySpecificBequestsCharities === "Yes" && (
                     <CharityDistributionFields
                        control={control}
                        errors={errors}
                        watch={watch}
                        fieldArrayNamePrefix="specific_bequests_charities_will_list"
                        formType="will"
                    />
                )}
            </FormSection>
            
            {isSingleWill ? (
                 <FormSection title="Residual Beneficiaries" borderClassName="border-pink-200/80">
                    <RadioGroupField
                        control={control}
                        errors={errors}
                        label="Distribution of Residuary Estate:"
                        name="will_single_residual_option"
                        options={WILL_SINGLE_RESIDUAL_OPTIONS}
                        layout="vertical"
                        required
                    />
                    {watchWillSingleResidualOption === "SpecifyShares" && (
                         <ResidualBeneficiaryTermsFields
                            control={control}
                            errors={errors}
                            watch={watch}
                            fieldArrayNamePrefix="will_residuary_beneficiaries_terms"
                            formType="will"
                        />
                    )}
                </FormSection>
            ) : (
                <FormSection title="Residuary Estate Distribution" borderClassName="border-pink-200/80">
                    <RadioGroupField
                        control={control}
                        errors={errors}
                        label="Distribution of Residuary Estate:"
                        name="will_residuary_distribution_primary_option"
                        options={WILL_RESIDUARY_DISTRIBUTION_OPTIONS}
                        layout="vertical"
                        required
                    />
                    {watchWillResiduaryDistributionPrimaryOption === "Different amounts/distributions for different beneficiaries." && (
                        <div className="ml-6 mt-4">
                            <p className="text-sm text-muted-foreground mb-2">
                                Define the specific shares for the residuary estate below. Ensure percentages add up to 100%.
                            </p>
                            <ResidualBeneficiaryTermsFields
                                control={control}
                                errors={errors}
                                watch={watch}
                               fieldArrayNamePrefix="will_residuary_beneficiaries_terms"
                                formType="will"
                            />
                        </div>
                    )}
                </FormSection>
            )}


            <FormSection title="Ultimate Distribution (Contingent)" borderClassName="border-red-200/80">
                 <p className="text-sm text-muted-foreground mb-2">This applies if all previously named beneficiaries (spouse, children, etc.) predecease you.</p>
                <RadioGroupField control={control} errors={errors} label="Ultimate distribution of estate:" name="ultimate_distribution_will" options={WILL_ULTIMATE_DISTRIBUTION_OPTIONS} layout="vertical" required />
                {watchUltimateDistributionWill === "To the following named individuals/charities:" && (
                    <UltimateBeneficiaryFields control={control} errors={errors} fieldArrayName="ultimate_distribution_will_specific_names" title="Named Ultimate Beneficiaries for Will" />
                )}
            </FormSection>

            <FormSection title="Notes" borderClassName="border-gray-200/80">
                <TextareaField control={control} errors={errors} label="General Notes for Will Provisions & Distribution" name="notes_will_provisions_distribution" rows={4} placeholder="Any additional comments, instructions, or clarifications for this section." />
            </FormSection>
        </fieldset>
    );
};
    
    
