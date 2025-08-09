
// @ts-nocheck
// TODO: Remove ts-nocheck and fix types
"use client";

import React from 'react';
import { useFormContext, useWatch, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputField, RadioGroupField, TextareaField, SelectField, CheckboxField, CheckboxGroupField } from './field-components';
import {
    ChildrenFields, DeceasedChildrenFields, DisinheritedChildrenFields, SuccessorTrusteeSetFields,
    ResidualBeneficiaryTermsFields, UltimateBeneficiaryFields, CharityDistributionFields, SpecificGiftsFields,
    FormSectionCard as FormSection
} from './section-components';
import {
    YES_NO_OPTIONS, GENDER_OPTIONS, SUCCESSOR_TRUSTEE_OPTIONS, TPP_DISTRIBUTION_OPTIONS, COMMON_POT_OPTIONS,
    RETIREMENT_TRUST_POA_OPTIONS, RESIDUAL_DISTRIBUTION_MAIN_OPTIONS, GROUP_DISTRIBUTION_OPTIONS,
    ULTIMATE_DISTRIBUTION_PATTERN_OPTIONS,
    GUARDIAN_CHOICE_OPTIONS, FINANCIAL_AGENT_CHOICE_OPTIONS, SUCCESSOR_TRUSTEE_ACTING_OPTIONS,
    TRUST_EXECUTION_TYPE_OPTIONS, TRUST_STATUS_OPTIONS,
    INVESTMENT_STANDARD_OPTIONS, NO_CONTEST_OPTIONS_FORM, JOINT_SUCCESSOR_TRUSTEE_OPTIONS,
    SEPARATE_SUCCESSOR_TRUSTEE_OPTIONS, REMOVAL_CRITERIA_OPTIONS, INCAPACITY_CONSENT_OPTIONS,
    PROPERTY_SHARES_OPTIONS, RETIREMENT_TRUST_TYPE_OPTIONS, RETIREMENT_ACCUMULATION_DISTRIBUTION_METHOD_OPTIONS, OPTIONAL_POA_OPTIONS, INCENTIVE_CLAUSE_OPTIONS,
    ULTIMATE_SAME_OPTIONS, ULTIMATE_T1_OPTIONS, ULTIMATE_T2_OPTIONS,
    FUNDING_BENEFICIARY_OPTIONS, ADV_PROV_DUTY_ACCOUNT_SUCCESSOR_OPTIONS, ADV_PROV_PROPERTY_AGREEMENT_OPTIONS,
    ADV_PROV_MAINTAIN_CP_OPTIONS, ADV_PROV_LIFE_INSURANCE_OPTIONS, ADV_PROV_LIFETIME_RIGHTS_OPTIONS,
    ADV_PROV_QTIP_RECOVERY_OPTIONS, ADV_PROV_TRUST_DIVISION_OPTIONS, ADV_PROV_AB_SPLIT_FORMULA_OPTIONS,
    ADV_PROV_ABC_SPLIT_FORMULA_OPTIONS, ADV_PROV_FAMILY_TRUST_ADMIN_OPTIONS, ADV_PROV_MARITAL_TRUST_ADMIN_OPTIONS,
    TERMS_INCOME_OPTIONS, TERMS_PRINCIPAL_OPTIONS, TERMS_LAPSE_PROVISION_OPTIONS, BENEFICIARY_TRUSTEE_OPTIONS,
    DISPOSITION_AGENT_SOURCE_OPTIONS
} from './constants';


export const PersonalFamilyInfoTab = ({ person1Label = "Trustor 1", person2Label }) => {
    const { control, formState: { errors }, watch } = useFormContext();
    const watchHaveChildren = watch("have_children");
    const watchAnyDeceasedChildren = watch("any_deceased_children");
    const watchAnyDisinheritedChildren = watch("any_disinherited_children");

    return (
        <fieldset>
            <legend className="sr-only">Personal and Family Information</legend>
            <FormSection title={`${person1Label} Information`} borderClassName="border-blue-200/80">
                <InputField control={control} errors={errors} label={`Full Legal Name (${person1Label})`} name="trustor1_name" required />
                <InputField control={control} errors={errors} label={`Also Known As (${person1Label}, Optional)`} name="trustor1_aka" />
                <RadioGroupField control={control} errors={errors} label={`Gender (${person1Label})`} name="trustor1_gender" options={GENDER_OPTIONS} layout="vertical"/>
                <InputField control={control} errors={errors} label={`Date of Birth (${person1Label})`} name="trustor1_dob" type="date" />
                <InputField control={control} errors={errors} label={`City and State of Residence (${person1Label})`} name="trustor1_residence" placeholder="e.g., Anytown, CA" />
            </FormSection>

            {person2Label && (
                <FormSection title={`${person2Label} Information`} borderClassName="border-blue-200/80">
                    <InputField control={control} errors={errors} label={`Full Legal Name (${person2Label})`} name="trustor2_name" required />
                    <InputField control={control} errors={errors} label={`Also Known As (${person2Label}, Optional)`} name="trustor2_aka" />
                    <RadioGroupField control={control} errors={errors} label={`Gender (${person2Label})`} name="trustor2_gender" options={GENDER_OPTIONS} layout="vertical"/>
                    <InputField control={control} errors={errors} label={`Date of Birth (${person2Label})`} name="trustor2_dob" type="date" />
                    <InputField control={control} errors={errors} label={`City and State of Residence (${person2Label})`} name="trustor2_residence" placeholder="e.g., Anytown, CA" />
                </FormSection>
            )}

            <FormSection title="Children Information" borderClassName="border-green-200/80">
                <RadioGroupField control={control} errors={errors} label="Do you have children (biological, adopted, or from previous relationships)?" name="have_children" options={YES_NO_OPTIONS} required />
                {watchHaveChildren === "Yes" && <ChildrenFields control={control} errors={errors} person1Label={person1Label} person2Label={person2Label} />}
            </FormSection>

             <FormSection title="Deceased Children Information" borderClassName="border-yellow-200/80">
                <RadioGroupField control={control} errors={errors} label="Any Deceased Children Who Left Issue (descendants)?" name="any_deceased_children" options={YES_NO_OPTIONS} required />
                {watchAnyDeceasedChildren === "Yes" && <DeceasedChildrenFields control={control} errors={errors} />}
            </FormSection>

            <FormSection title="Disinherited Individuals Information" borderClassName="border-red-200/80">
                <RadioGroupField control={control} errors={errors} label="Any Children or Other Individuals to be Specifically Disinherited?" name="any_disinherited_children" options={YES_NO_OPTIONS} required />
                {watchAnyDisinheritedChildren === "Yes" && <DisinheritedChildrenFields control={control} errors={errors} />}
            </FormSection>
        </fieldset>
    );
};

export const GuardiansFiduciariesTab = ({ person1Label = "Trustor 1", person2Label }) => {
    const { control, formState: { errors }, watch, getValues, setValue } = useFormContext();
    const watchNameGuardians = watch("name_guardians");
    const watchTrustor1AdSameAsHc = watch("trustor1_ad_same_as_hc");
    const watchTrustor2AdSameAsHc = person2Label ? watch("trustor2_ad_same_as_hc") : undefined;
    const watchTrustor1AdditionalHipaaAuth = watch("trustor1_additional_hipaa_authorization");
    const watchTrustor2AdditionalHipaaAuth = person2Label ? watch("trustor2_additional_hipaa_authorization") : undefined;
    const watchSpouseAutoFiduciary = person2Label ? watch("spouse_auto_fiduciary") : undefined;

    const watchTrustor1AppointDispositionAgent = watch("trustor1_appoint_disposition_agent");
    const watchTrustor1DispositionAgentSource = watch("trustor1_disposition_agent_source");
    const watchTrustor2AppointDispositionAgent = person2Label ? watch("trustor2_appoint_disposition_agent") : undefined;
    const watchTrustor2DispositionAgentSource = person2Label ? watch("trustor2_disposition_agent_source") : undefined;
    
    React.useEffect(() => {
        if (watchSpouseAutoFiduciary === "Yes" && person2Label && getValues("trustor1_name") && getValues("trustor2_name")) {
            // This effect mainly sets the preference. Specific nominations below take precedence.
            // If you want to auto-fill agent names, do it here, but ensure it doesn't cause re-render loops.
            // For example, only set if the field is empty:
            // if (!getValues("trustor1_fin_agent1_name")) setValue("trustor1_fin_agent1_name", getValues("trustor2_name"));
            // if (!getValues("trustor2_fin_agent1_name")) setValue("trustor2_fin_agent1_name", getValues("trustor1_name"));
        }
    }, [watchSpouseAutoFiduciary, person1Label, person2Label, setValue, getValues]);
    
    React.useEffect(() => {
        if (watchTrustor1AdSameAsHc === "Yes") {
            setValue("trustor1_ad_agent1_name", getValues("trustor1_hc_agent1_name"));
            setValue("trustor1_ad_agent2_name", getValues("trustor1_hc_agent2_name"));
            setValue("trustor1_ad_agent3_name", getValues("trustor1_hc_agent3_name"));
            // setValue("trustor1_ad_agents_acting", getValues("trustor1_hc_agents_acting")); // Removed
        }
    }, [watchTrustor1AdSameAsHc, setValue, getValues, watch("trustor1_hc_agent1_name"), watch("trustor1_hc_agent2_name"), watch("trustor1_hc_agent3_name")]); // Removed watch for _acting

    React.useEffect(() => {
        if (person2Label && watchTrustor2AdSameAsHc === "Yes") {
            setValue("trustor2_ad_agent1_name", getValues("trustor2_hc_agent1_name"));
            setValue("trustor2_ad_agent2_name", getValues("trustor2_hc_agent2_name"));
            setValue("trustor2_ad_agent3_name", getValues("trustor2_hc_agent3_name"));
            // setValue("trustor2_ad_agents_acting", getValues("trustor2_hc_agents_acting")); // Removed
        }
    }, [person2Label, watchTrustor2AdSameAsHc, setValue, getValues, watch("trustor2_hc_agent1_name"), watch("trustor2_hc_agent2_name"), watch("trustor2_hc_agent3_name")]); // Removed watch for _acting


     return (
        <fieldset>
            <legend className="sr-only">Guardians and Fiduciaries</legend>
            <FormSection title="Guardians for Minor Children" borderClassName="border-purple-200/80" description="Only applicable if you have minor children.">
                <RadioGroupField control={control} errors={errors} label="Do you want to name guardians for any minor children?" name="name_guardians" options={YES_NO_OPTIONS} required />
                {watchNameGuardians === "Yes" && (
                    <>
                        <InputField control={control} errors={errors} label="First Choice Guardian(s) Name(s)" name="guardian1_name" placeholder="Full name(s)" />
                        <RadioGroupField control={control} errors={errors} label="First Choice: Single or Joint Guardians?" name="guardian1_choice_type" options={GUARDIAN_CHOICE_OPTIONS} layout="vertical"/>
                        <InputField control={control} errors={errors} label="Second Choice Guardian(s) Name(s)" name="guardian2_name" placeholder="Full name(s)" />
                         <RadioGroupField control={control} errors={errors} label="Second Choice: Single or Joint Guardians?" name="guardian2_choice_type" options={GUARDIAN_CHOICE_OPTIONS} layout="vertical"/>
                        <TextareaField control={control} errors={errors} label="Guardian Notes (Optional)" name="guardian_notes" placeholder="Any specific instructions or preferences for guardians." rows={3}/>
                    </>
                )}
            </FormSection>
            
            {person2Label && ( 
                <FormSection title="Spousal Fiduciary Preference" borderClassName="border-orange-200/80">
                    <RadioGroupField
                        control={control}
                        errors={errors}
                        label="Is spouse automatically first for Fiduciary roles?"
                        name="spouse_auto_fiduciary"
                        options={YES_NO_OPTIONS}
                        required
                        layout="vertical"
                        description="Specific nominations below will take precedence."
                    />
                </FormSection>
            )}


            <FormSection title={`Financial Agents (Power of Attorney) - ${person1Label}`} borderClassName="border-indigo-200/80" description={`Who will manage ${person1Label}'s finances if incapacitated?`}>
                <InputField control={control} errors={errors} label={`Agent 1 Name`} name="trustor1_fin_agent1_name" required placeholder="Full Name" />
                <InputField control={control} errors={errors} label={`Agent 2 Name (Successor to Agent 1)`} name="trustor1_fin_agent2_name" placeholder="Full Name" />
                <InputField control={control} errors={errors} label={`Agent 3 Name (Successor to Agent 2)`} name="trustor1_fin_agent3_name" placeholder="Full Name" />
                {/* Removed: trustor1_fin_agents_acting */}
            </FormSection>

            {person2Label && (
                <FormSection title={`Financial Agents (Power of Attorney) - ${person2Label}`} borderClassName="border-indigo-200/80" description={`Who will manage ${person2Label}'s finances if incapacitated?`}>
                    <InputField control={control} errors={errors} label={`Agent 1 Name`} name="trustor2_fin_agent1_name" required placeholder="Full Name" />
                    <InputField control={control} errors={errors} label={`Agent 2 Name (Successor to Agent 1)`} name="trustor2_fin_agent2_name" placeholder="Full Name" />
                    <InputField control={control} errors={errors} label={`Agent 3 Name (Successor to Agent 2)`} name="trustor2_fin_agent3_name" placeholder="Full Name" />
                    {/* Removed: trustor2_fin_agents_acting */}
                </FormSection>
            )}
            
             <FormSection title={`Health Care Agents - ${person1Label}`} borderClassName="border-rose-200/80" description={`Specify who will make health care decisions for ${person1Label}.`}>
                <InputField control={control} errors={errors} label={`Agent 1 Name`} name="trustor1_hc_agent1_name" required placeholder="Full Name" />
                <InputField control={control} errors={errors} label={`Agent 2 Name (Successor to Agent 1)`} name="trustor1_hc_agent2_name" placeholder="Full Name" />
                <InputField control={control} errors={errors} label={`Agent 3 Name (Successor to Agent 2)`} name="trustor1_hc_agent3_name" placeholder="Full Name" />
                 {/* Removed: trustor1_hc_agents_acting */}
            </FormSection>

            {person2Label && (
                <FormSection title={`Health Care Agents - ${person2Label}`} borderClassName="border-rose-200/80" description={`Specify who will make health care decisions for ${person2Label}.`}>
                    <InputField control={control} errors={errors} label={`Agent 1 Name`} name="trustor2_hc_agent1_name" required placeholder="Full Name" />
                    <InputField control={control} errors={errors} label={`Agent 2 Name (Successor to Agent 1)`} name="trustor2_hc_agent2_name" placeholder="Full Name" />
                    <InputField control={control} errors={errors} label={`Agent 3 Name (Successor to Agent 2)`} name="trustor2_hc_agent3_name" placeholder="Full Name" />
                    {/* Removed: trustor2_hc_agents_acting */}
                </FormSection>
            )}

            <FormSection title="Advance Directive Agent Designation" borderClassName="border-cyan-200/80" description="Specify agents for Advance Directives.">
                 <RadioGroupField 
                    control={control} 
                    errors={errors} 
                    label={`For ${person1Label}: Are Advance Directive Agents the same as their Health Care Agents specified above?`} 
                    name="trustor1_ad_same_as_hc" 
                    options={YES_NO_OPTIONS} 
                    layout="vertical"
                    required 
                />
                {watchTrustor1AdSameAsHc === "No" && (
                    <FormSection title={`Advance Directive Agents - ${person1Label}`} className="mt-4" borderClassName="border-cyan-300/70" description={`Specify who will act under ${person1Label}'s Advance Directive.`}>
                        <InputField control={control} errors={errors} label={`Agent 1 Name`} name="trustor1_ad_agent1_name" required placeholder="Full Name" />
                        <InputField control={control} errors={errors} label={`Agent 2 Name (Successor to Agent 1)`} name="trustor1_ad_agent2_name" placeholder="Full Name" />
                        <InputField control={control} errors={errors} label={`Agent 3 Name (Successor to Agent 2)`} name="trustor1_ad_agent3_name" placeholder="Full Name" />
                        {/* Removed: trustor1_ad_agents_acting */}
                    </FormSection>
                )}

                {person2Label && (
                    <>
                        <div className="mt-6 pt-6 border-t border-cyan-200/50">
                            <RadioGroupField 
                                control={control} 
                                errors={errors} 
                                label={`For ${person2Label}: Are Advance Directive Agents the same as their Health Care Agents specified above?`} 
                                name="trustor2_ad_same_as_hc" 
                                options={YES_NO_OPTIONS} 
                                layout="vertical" 
                                required
                            />
                        </div>
                        {watchTrustor2AdSameAsHc === "No" && (
                            <FormSection title={`Advance Directive Agents - ${person2Label}`} className="mt-4" borderClassName="border-cyan-300/70" description={`Specify who will act under ${person2Label}'s Advance Directive.`}>
                                <InputField control={control} errors={errors} label={`Agent 1 Name`} name="trustor2_ad_agent1_name" required placeholder="Full Name" />
                                <InputField control={control} errors={errors} label={`Agent 2 Name (Successor to Agent 1)`} name="trustor2_ad_agent2_name" placeholder="Full Name" />
                                <InputField control={control} errors={errors} label={`Agent 3 Name (Successor to Agent 2)`} name="trustor2_ad_agent3_name" placeholder="Full Name" />
                                 {/* Removed: trustor2_ad_agents_acting */}
                            </FormSection>
                        )}
                    </>
                )}
            </FormSection>

            <FormSection title="HIPAA Authorization" borderClassName="border-teal-200/80" description={`Health Care Agents are automatically authorized. Specify any additional individuals for ${person1Label}${person2Label ? ` and ${person2Label}` : ''}.`}>
                <div className="mb-4">
                    <RadioGroupField 
                        control={control} 
                        errors={errors} 
                        label={`For ${person1Label}: Add additional names to HIPAA Authorization (beyond named Health Care Agents)?`} 
                        name="trustor1_additional_hipaa_authorization" 
                        options={YES_NO_OPTIONS} 
                        layout="vertical"
                        required 
                    />
                    {watchTrustor1AdditionalHipaaAuth === "Yes" && (
                        <TextareaField 
                            control={control} 
                            errors={errors} 
                            label={`Additional HIPAA Authorized Individuals for ${person1Label}`} 
                            name="trustor1_additional_hipaa_names" 
                            placeholder="List full names, one per line." 
                            rows={3}
                            description={`${person1Label}'s named Health Care Agents will automatically be authorized.`}
                            className="mt-2"
                        />
                    )}
                </div>
                {person2Label && (
                     <div className="pt-4 border-t border-teal-200/50">
                        <RadioGroupField 
                            control={control} 
                            errors={errors} 
                            label={`For ${person2Label}: Add additional names to HIPAA Authorization (beyond named Health Care Agents)?`} 
                            name="trustor2_additional_hipaa_authorization" 
                            options={YES_NO_OPTIONS} 
                            layout="vertical"
                            required 
                        />
                        {watchTrustor2AdditionalHipaaAuth === "Yes" && (
                            <TextareaField 
                                control={control} 
                                errors={errors} 
                                label={`Additional HIPAA Authorized Individuals for ${person2Label}`} 
                                name="trustor2_additional_hipaa_names" 
                                placeholder="List full names, one per line." 
                                rows={3}
                                description={`${person2Label}'s named Health Care Agents will automatically be authorized.`}
                                 className="mt-2"
                            />
                        )}
                    </div>
                )}
            </FormSection>
             <FormSection title="Disposition of Remains" borderClassName="border-stone-300/80" description="Appointment of agent for decisions concerning disposition of remains.">
                <div className="mb-6">
                    <RadioGroupField
                        control={control}
                        errors={errors}
                        label={`Would ${person1Label} like to Appoint a person to make decisions concerning disposition of remains?`}
                        name="trustor1_appoint_disposition_agent"
                        options={YES_NO_OPTIONS}
                        required
                        layout="vertical"
                    />
                    {watchTrustor1AppointDispositionAgent === "Yes" && (
                        <div className="ml-6 mt-3 space-y-3">
                            <RadioGroupField
                                control={control}
                                errors={errors}
                                label={`Agent for ${person1Label}'s Disposition of Remains:`}
                                name="trustor1_disposition_agent_source"
                                options={DISPOSITION_AGENT_SOURCE_OPTIONS}
                                required={watchTrustor1AppointDispositionAgent === "Yes"}
                                layout="vertical"
                            />
                            {watchTrustor1DispositionAgentSource === "Other" && (
                                <InputField
                                    control={control}
                                    errors={errors}
                                    label="Specify Other Agent Name"
                                    name="trustor1_disposition_agent_other_name"
                                    placeholder="Full Name"
                                    required={watchTrustor1DispositionAgentSource === "Other"}
                                    className="ml-6"
                                />
                            )}
                        </div>
                    )}
                </div>

                {person2Label && (
                    <div className="pt-6 border-t border-stone-200/70">
                        <RadioGroupField
                            control={control}
                            errors={errors}
                            label={`Would ${person2Label} like to Appoint a person to make decisions concerning disposition of remains?`}
                            name="trustor2_appoint_disposition_agent"
                            options={YES_NO_OPTIONS}
                            required
                            layout="vertical"
                        />
                        {watchTrustor2AppointDispositionAgent === "Yes" && (
                            <div className="ml-6 mt-3 space-y-3">
                                <RadioGroupField
                                    control={control}
                                    errors={errors}
                                    label={`Agent for ${person2Label}'s Disposition of Remains:`}
                                    name="trustor2_disposition_agent_source"
                                    options={DISPOSITION_AGENT_SOURCE_OPTIONS}
                                    required={watchTrustor2AppointDispositionAgent === "Yes"}
                                    layout="vertical"
                                />
                                {watchTrustor2DispositionAgentSource === "Other" && (
                                    <InputField
                                        control={control}
                                        errors={errors}
                                        label="Specify Other Agent Name"
                                        name="trustor2_disposition_agent_other_name"
                                        placeholder="Full Name"
                                        required={watchTrustor2DispositionAgentSource === "Other"}
                                        className="ml-6"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </FormSection>
        </fieldset>
    );
};

export const TrustDetailsTab = ({
    person1Label = "Trustor 1",
    person2Label,
    isSingleForm = false,
    watchSuccessorTrusteesSameAsFinAgents,
}) => {
    const { control, formState: { errors }, watch, setValue, getValues } = useFormContext();
    
    const watchTrustExecutionType = watch("trust_execution_type");
    const watchAdditionalTrusteeExists = watch("trust_initial_additional_trustee_exists");
    const watchQDOTNamed = !isSingleForm ? watch("qdot_trustee_named") : undefined;
    const watchWantTrustProtector = watch("want_trust_protector");
    const watchInitialTrustor1 = watch("trust_initial_trustor1");
    const watchInitialTrustor2 = !isSingleForm ? watch("trust_initial_trustor2") : undefined;
    const watchWantIncapacityPanel = watch("want_incapacity_panel");
    const successorTrusteesSourceWatch = watch("successor_trustees_same_as_financial_agents");
    const watchAreSuccessorTrusteesJoint = !isSingleForm ? watch("are_successor_trustees_joint") : undefined;


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
            <legend className="sr-only">Trust Details</legend>

            <FormSection title="Trust Identification" borderClassName="border-sky-200/80">
                <InputField control={control} errors={errors} label="Trust Name" name="trust_name" placeholder={`e.g., The ${person1Label}${!isSingleForm && person2Label ? ` and ${person2Label}` : ''} Living Trust`} required />
                <RadioGroupField control={control} errors={errors} label="Trust Execution Type" name="trust_execution_type" options={TRUST_EXECUTION_TYPE_OPTIONS} required layout="vertical"/>
                
                {watchTrustExecutionType === "New" && (
                     <InputField 
                        control={control} 
                        errors={errors} 
                        label="Date of Trust Signing" 
                        name="current_trust_date" 
                        type="date" 
                        description="This will typically be the date the new trust document is executed."
                        required
                    />
                )}
                {watchTrustExecutionType === "Restatement" && (
                    <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-4">
                        <InputField control={control} errors={errors} label="Date of Original Trust Being Restated" name="trust_original_date" type="date" required={watchTrustExecutionType === "Restatement"} />
                        <TextareaField control={control} errors={errors} label="Authority to Amend/Restate (e.g., Article/Section)" name="trust_authority_amend" placeholder="Cite the specific provision in the original trust document." rows={2} required={watchTrustExecutionType === "Restatement"} />
                        <InputField control={control} errors={errors} label="Amendment Number (if applicable)" name="trust_amendment_number" placeholder="e.g., Amendment No. 1" />
                        <TextareaField 
                            control={control} 
                            errors={errors} 
                            label="List any Prior Amendments or Restatements (Dates and brief description)" 
                            name="prior_amendments_restatements" 
                            rows={3}
                            placeholder="e.g., Amendment No. 1 dated 01/01/2020 changed successor trustee."
                        />
                        <InputField 
                            control={control} 
                            errors={errors} 
                            label="Date of this Restatement" 
                            name="current_trust_date" 
                            type="date" 
                            description="This will typically be the date the restatement document is executed."
                            required={watchTrustExecutionType === "Restatement"}
                        />
                    </div>
                )}
            </FormSection>

            <FormSection title="General Trust Provisions" borderClassName="border-emerald-200/80">
                <InputField control={control} errors={errors} label="State of Controlling Law" name="trust_controlling_law_state" placeholder="e.g., Oregon" required />
                {!isSingleForm && (
                     <RadioGroupField control={control} errors={errors} label="Do you desire to include Prenuptial language?" name="trust_prenuptial_language" options={YES_NO_OPTIONS} required />
                )}
                <RadioGroupField control={control} errors={errors} label="Investment Standard" name="trust_investment_standard" options={INVESTMENT_STANDARD_OPTIONS} required />
                {!isSingleForm && person2Label && ( 
                    <RadioGroupField control={control} errors={errors} label="Applicable to Surviving Spouse (Investment Standard)" name="trust_investment_standard_surviving_spouse" options={YES_NO_OPTIONS} required />
                )}
                <RadioGroupField control={control} errors={errors} label="No Contest Clause" name="trust_no_contest_clause" options={NO_CONTEST_OPTIONS_FORM} required />
                {!isSingleForm && (
                    <RadioGroupField
                        control={control}
                        errors={errors}
                        label="Can any Co-Trustee act independently?"
                        name="trust_co_trustee_act_independently"
                        options={YES_NO_OPTIONS}
                    />
                )}
            </FormSection>

            <FormSection title="Trustees" borderClassName="border-orange-200/80">
                <h4 className="text-md font-semibold text-foreground my-3 pt-4 border-t">Initial Trustees</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                        <CheckboxField control={control} errors={errors} name="trust_initial_trustor1" label={`${person1Label} as Initial Trustee`} />
                        {watchInitialTrustor1 && <RadioGroupField control={control} errors={errors} label="Can Act Independently?" name="trust_initial_trustor1_act_independently" options={YES_NO_OPTIONS} className="ml-6"/>}
                    </div>
                    {!isSingleForm && person2Label && ( 
                        <div>
                            <CheckboxField control={control} errors={errors} name="trust_initial_trustor2" label={`${person2Label} as Initial Trustee`} />
                            {watchInitialTrustor2 && <RadioGroupField control={control} errors={errors} label="Can Act Independently?" name="trust_initial_trustor2_act_independently" options={YES_NO_OPTIONS} className="ml-6"/>}
                        </div>
                    )}
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
                     <RadioGroupField control={control} errors={errors} label="Are Successor Trustee the same as Financial Agents?" name="successor_trustees_same_as_financial_agents" options={SUCCESSOR_TRUSTEE_OPTIONS} required />
                </div>
                {!isSingleForm && person2Label && (
                    <div className="mt-4">
                        <RadioGroupField control={control} errors={errors} label="Are Successor Trustees Joint?" name="are_successor_trustees_joint" options={YES_NO_OPTIONS} required
                            description="This selection determines how successor trustees are appointed for the couple. It does NOT determine how they act together once appointed."
                        />
                    </div>
                )}
                
                {!isSingleForm && person2Label && (
                    <div className="mt-4">
                        <h4 className="text-md font-semibold text-muted-foreground mb-2">Successor Trustee Option(s)</h4>
                        <RadioGroupField
                            name="successor_trustee_option"
                            control={control}
                            errors={errors}
                            layout="vertical"
                            options={watchAreSuccessorTrusteesJoint === 'Yes' ? JOINT_SUCCESSOR_TRUSTEE_OPTIONS : SEPARATE_SUCCESSOR_TRUSTEE_OPTIONS}
                            description={watchAreSuccessorTrusteesJoint === 'Yes' ? "Select the succession pattern for joint trustees." : "Select the succession pattern."}
                        />
                    </div>
                )}
                
                {!isSingleForm && person2Label && watchAreSuccessorTrusteesJoint === 'Yes' && (
                    <FormSection title="Joint Successor Trustees" borderClassName="border-orange-300" className="mt-4 bg-orange-100/50">
                        <SuccessorTrusteeSetFields
                            control={control} errors={errors} watch={watch}
                            fieldArrayNamePrefix="joint_successor_trustees"
                            title="Joint Successor Trustees"
                            successorTrusteesSource={successorTrusteesSourceWatch}
                        />
                    </FormSection>
                )}
                {!isSingleForm && person2Label && watchAreSuccessorTrusteesJoint === 'No' && (
                     <FormSection title="Separate Successor Trustees" borderClassName="border-orange-300" className="mt-4 bg-orange-100/50">
                        <SuccessorTrusteeSetFields
                            control={control} errors={errors} watch={watch}
                            fieldArrayNamePrefix="trustor1_successor_trustees"
                            title={`${person1Label}'s Successor Trustees`}
                            successorTrusteesSource={successorTrusteesSourceWatch}
                        />
                        <SuccessorTrusteeSetFields
                            control={control} errors={errors} watch={watch}
                            fieldArrayNamePrefix="trustor2_successor_trustees"
                            title={`${person2Label}'s Successor Trustees`}
                            successorTrusteesSource={successorTrusteesSourceWatch}
                        />
                    </FormSection>
                )}
                 {isSingleForm && ( 
                    <FormSection title="Successor Trustees" borderClassName="border-orange-300" className="mt-4 bg-orange-100/50">
                         <SuccessorTrusteeSetFields
                            control={control} errors={errors} watch={watch}
                            fieldArrayNamePrefix="trustor1_successor_trustees" 
                            title={`${person1Label}'s Successor Trustees`}
                            successorTrusteesSource={watchSuccessorTrusteesSameAsFinAgents}
                        />
                    </FormSection>
                )}
                 <FormSection title="Removal of Trustees by Others" className="mt-6 pt-6 border-t" borderClassName="border-rose-200/80">
                    <RadioGroupField control={control} errors={errors} label={`Select which beneficiaries may remove a Trustee after death/incapacity of ${person1Label}${!isSingleForm && person2Label ? ` and ${person2Label}`: ''}:`} name="removal_trustees_by_others_criteria" options={REMOVAL_CRITERIA_OPTIONS} layout="vertical" />
                </FormSection>
            </FormSection>

            {!isSingleForm && (
                <FormSection title="QDOT Trustees" borderClassName="border-pink-200/80" description="Recommended if one/both Trustors are not a U.S. citizen. Discuss gift tax issues.">
                    <RadioGroupField control={control} errors={errors} label="Do you wish to name QDOT Trustee at this time?" name="qdot_trustee_named" options={YES_NO_OPTIONS} />
                    {watchQDOTNamed === "Yes" && (
                        <div className="ml-6 mt-2 space-y-3 border p-3 rounded-md bg-muted/30">
                            <InputField control={control} errors={errors} label="1. QDOT Trustee Name" name="qdot_trustee1_name" />
                            <InputField control={control} errors={errors} label="2. QDOT Trustee Name" name="qdot_trustee2_name" />
                            <RadioGroupField control={control} errors={errors} label="Co-Trustees?" name="qdot_co_trustees" options={YES_NO_OPTIONS} />
                        </div>
                    )}
                </FormSection>
            )}

            <FormSection title="Trust Protector" borderClassName="border-teal-200/80">
                 <RadioGroupField 
                    control={control} 
                    errors={errors} 
                    label="Do you want to name a Trust Protector?" 
                    name="want_trust_protector" 
                    options={YES_NO_OPTIONS} 
                    required 
                    description="If no, a majority of Successor Trustees may appoint a Trust Protector."
                />
                {watchWantTrustProtector === "Yes" && (
                    <InputField control={control} errors={errors} label="Trust Protector Name" name="trust_protector_name" placeholder="Full Name of Trust Protector" required={watchWantTrustProtector === "Yes"} className="ml-6" />
                )}
            </FormSection>
            
            {!isSingleForm && person2Label && ( 
                <FormSection title="Survivor's Power to Change Trustee" borderClassName="border-amber-200/80">
                    <RadioGroupField control={control} errors={errors} label={`Allow surviving/competent ${person1Label} or ${person2Label} to add, remove, replace Trustees without cause?`} name="survivor_power_change_trustee" options={YES_NO_OPTIONS} />
                    <RadioGroupField control={control} errors={errors} label={`Allow surviving/competent ${person1Label} or ${person2Label} to appoint a Trust Protector (if one not named or serving)?`} name="survivor_can_appoint_special_co_trustee" options={YES_NO_OPTIONS} />
                </FormSection>
            )}

             <FormSection title="Incapacity Panel" borderClassName="border-indigo-200/80">
                 <RadioGroupField 
                    control={control} 
                    errors={errors} 
                    label="Do you want an Incapacity Panel?" 
                    name="want_incapacity_panel" 
                    options={YES_NO_OPTIONS} 
                    required 
                    layout="vertical"
                    description="An Incapacity Panel can make determinations regarding a Trustor's capacity if it comes into question."
                />
                {watchWantIncapacityPanel === "Yes" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <FormSection title={`${person1Label}'s Incapacity Panel`} className="bg-muted/30" borderClassName="border-indigo-300">
                            <InputField control={control} errors={errors} label="1." name="trustor1_incapacity_panel_member1" />
                            <InputField control={control} errors={errors} label="2." name="trustor1_incapacity_panel_member2" />
                            <InputField control={control} errors={errors} label="3." name="trustor1_incapacity_panel_member3" />
                            <RadioGroupField control={control} errors={errors} label="Consent Required" name="trustor1_incapacity_panel_consent" options={INCAPACITY_CONSENT_OPTIONS} />
                        </FormSection>
                        {!isSingleForm && person2Label && ( 
                            <FormSection title={`${person2Label}'s Incapacity Panel`} className="bg-muted/30" borderClassName="border-indigo-300">
                                <InputField control={control} errors={errors} label="1." name="trustor2_incapacity_panel_member1" />
                                <InputField control={control} errors={errors} label="2." name="trustor2_incapacity_panel_member2" />
                                <InputField control={control} errors={errors} label="3." name="trustor2_incapacity_panel_member3" />
                                <RadioGroupField control={control} errors={errors} label="Consent Required" name="trustor2_incapacity_panel_consent" options={INCAPACITY_CONSENT_OPTIONS} />
                            </FormSection>
                        )}
                    </div>
                )}
            </FormSection>
            
            <FormSection title="Notes" borderClassName="border-gray-200/80">
                <TextareaField control={control} errors={errors} label="Notes for Trust Details" name="notes_trust_details" placeholder="Enter any relevant notes for this section..." rows={3} />
            </FormSection>
        </fieldset>
    );
};

export const DistributionTab = ({ person1Label = "Trustor 1", person2Label, isSingleForm = false }) => {
    const { control, formState: { errors }, watch } = useFormContext();

    // Watch values for conditional rendering
    const watchTPP = watch("tpp_distribution");
    const watchAnyCharity = watch("any_specific_distributions_charity");
    const watchAnyIndividualGift = watch("any_specific_distributions_individuals");
    const watchCommonPotOption = watch("common_pot_trust_option");
    const watchRetirementPreservation = watch("retirement_preservation_trust");
    const watchRetirementNamesMatch = watch("retirement_preservation_names_match_residual");
    const watchOptionalPOA = watch("retirement_trust_optional_poa");
    const watchResidualMainOption = watch("residual_distribution_main_option");
    const watchResidualGroupOptionSelected = watch("residual_group_option_selected");
    const watchGroupTermsPrincipal = watch("group_terms_principal_option");
    const watchGroupBeneficiaryTrusteeOption = watch("group_beneficiary_trustee_option");
    const watchUltimatePattern = !isSingleForm ? watch("ultimate_distribution_pattern") : undefined;
    const watchUltimateSameOption = watch("ultimate_same_option"); 
    const watchUltimateT1Option = !isSingleForm ? watch("ultimate_t1_option") : undefined; 
    const watchUltimateT2Option = !isSingleForm ? watch("ultimate_t2_option") : undefined; 
    
    const watchResidualDiffGroupT1OptionSelected = !isSingleForm ? watch("residual_diff_group_t1_option_selected") : undefined;
    const watchResidualDiffGroupT2OptionSelected = !isSingleForm ? watch("residual_diff_group_t2_option_selected") : undefined;

    const watchRetirementTrustType = watch("retirement_trust_type");
    const watchRetirementAccumulationMethod = watch("retirement_accumulation_distribution_method");


    const residualMainOptions = isSingleForm
        ? RESIDUAL_DISTRIBUTION_MAIN_OPTIONS.filter(option => option.value !== "Different Group")
        : RESIDUAL_DISTRIBUTION_MAIN_OPTIONS;


    return (
        <fieldset>
             <legend className="sr-only">Distribution Plan</legend>
            
            <FormSection title={`Tangible Personal Property (TPP) - Distribution upon death of ${person1Label}${!isSingleForm && person2Label ? ` and ${person2Label}` : ''}`} borderClassName="border-lime-200/80">
                <RadioGroupField name="tpp_distribution" options={TPP_DISTRIBUTION_OPTIONS} control={control} errors={errors} required layout="vertical" />
                {watchTPP === 'Equally to' && (<InputField control={control} errors={errors} name="tpp_equally_to_names" placeholder="Enter names" required={watchTPP === 'Equally to'} className="mt-2 ml-6" /> )}
                <TextareaField control={control} errors={errors} label="Other/Notes (Optional)" name="tpp_other_notes" rows={2} placeholder="Specific instructions or list of items..." className="mt-4" />
            </FormSection>

            <FormSection title="Specific Distributions to Charity" borderClassName="border-emerald-200/80" description="Gifts of specific assets or cash amounts to charitable organizations.">
                <RadioGroupField control={control} errors={errors} label="Any specific distributions for charity(ies)?" name="any_specific_distributions_charity" options={YES_NO_OPTIONS} required />
                {watchAnyCharity === "Yes" && <CharityDistributionFields control={control} errors={errors} watch={watch} />}
            </FormSection>

            <FormSection title="Specific Distributions to Individuals" borderClassName="border-orange-200/80" description="Gifts of specific assets or cash amounts to individuals (friends, family, etc.).">
                <RadioGroupField control={control} errors={errors} label="Any specific distributions for Individuals?" name="any_specific_distributions_individuals" options={YES_NO_OPTIONS} required />
                {watchAnyIndividualGift === "Yes" && (
                    <SpecificGiftsFields control={control} errors={errors} watch={watch} />
                )}
            </FormSection>

            <FormSection title={`Residual Beneficiaries & Other Distributions - Distribution of remaining trust assets after specific gifts, upon death of ${person1Label}${!isSingleForm && person2Label ? ` and ${person2Label}` : ''}`} borderClassName="border-pink-200/80">
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
                     <RadioGroupField label="Include Optional Power of Appointment for Beneficiary?" name="retirement_trust_optional_poa" control={control} errors={errors} options={OPTIONAL_POA_OPTIONS} layout="vertical" />
                    {watchOptionalPOA === "Yes, Except" && <InputField control={control} errors={errors} name="retirement_trust_optional_poa_except" placeholder="Enter exceptions" className="ml-6"/>}
                    <p className="text-xs text-muted-foreground mt-2 ml-6">NOTE: Allows Beny To Designate Successor POA-NOT FOR ACCESS TRUST OR SNT.</p>
                    <RadioGroupField label="Require beneficiary pre/post-nup before distribution?" name="beneficiary_nuptial_required" options={YES_NO_OPTIONS} control={control} errors={errors} className="mt-4"/>
                </FormSection>
                
                <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-lg font-semibold text-foreground mb-3">Distribution Options</h4>
                    <RadioGroupField name="residual_distribution_main_option" control={control} errors={errors} layout="vertical" options={residualMainOptions} />
                    
                    {watchResidualMainOption === "Group" && (
                        <FormSection title="Group Distribution Details" borderClassName="border-pink-400/60" className="ml-6 mt-4 bg-pink-200/40">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <InputField control={control} errors={errors} label="Min. age beneficiary is own Trustee" name="group_min_age_trustee" type="number" />
                                <InputField control={control} errors={errors} label="Age beneficiary receives income distributions" name="group_age_income_dists" type="number" />
                            </div>
                            <RadioGroupField label="Select Group Distribution Type:" name="residual_group_option_selected" control={control} errors={errors} layout="vertical" options={GROUP_DISTRIBUTION_OPTIONS} />
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
                            {watchResidualGroupOptionSelected === 'Asset Protection Trust w/ Investment Trustee' && <InputField control={control} errors={errors} label="Name of Investment Trustee" name="group_asset_protection_invest_trustee_name"  className="ml-6"/> }
                            {(watchResidualGroupOptionSelected === 'GST Shares Income HEMS Remainder GC Spec Age' || watchResidualGroupOptionSelected === 'GST Shares Disc HEMS Remainder GC Spec Age' || watchResidualGroupOptionSelected === 'GST Shares TRU Remainder GC Spec Age' || watchResidualGroupOptionSelected === 'GST Family Incentive Trust') && <InputField control={control} errors={errors} label="Specified Age" name="group_gst_spec_age" type="number"  className="ml-6 w-32"/>}
                            {(watchResidualGroupOptionSelected === 'GST Shares TRU Remainder GC 25/30/35' || watchResidualGroupOptionSelected === 'GST Shares TRU Remainder GC Spec Age') && <InputField control={control} errors={errors} label="TRU Distribution Rate (%)" name="group_gst_tru_rate" type="number"  className="ml-6 w-32"/>}
                            <div className="mt-4 pt-4 border-t">
                                <h6 className="text-md font-semibold text-foreground mb-2">Beneficiary Trustee Option</h6>
                                <RadioGroupField name="group_beneficiary_trustee_option" control={control} errors={errors} layout="vertical" options={BENEFICIARY_TRUSTEE_OPTIONS} />
                                {watchGroupBeneficiaryTrusteeOption === '3rd Party' && ( <div className="ml-6 mt-2 space-y-2 border p-3 rounded-md bg-muted/30"> <InputField label="1. 3rd Party Trustee Name" name="group_beneficiary_trustee_3rd_party1" control={control} errors={errors} /> <InputField label="2. 3rd Party Trustee Name (Optional)" name="group_beneficiary_trustee_3rd_party2" control={control} errors={errors} /> <RadioGroupField label="If two 3rd party trustees, how should they act?" name="group_beneficiary_trustee_3rd_party_acting" options={SUCCESSOR_TRUSTEE_ACTING_OPTIONS} control={control} errors={errors} layout="vertical"/> </div> )}
                                {watchGroupBeneficiaryTrusteeOption === 'Beneficiary and 3rd Party' && ( <div className="ml-6 mt-2 space-y-2 border p-3 rounded-md bg-muted/30"> <InputField label="3rd Party Co-Trustee Name" name="group_beneficiary_trustee_ben_3rd_party_name" control={control} errors={errors} /> <RadioGroupField label="How should Beneficiary and 3rd Party Co-Trustees act?" name="group_beneficiary_trustee_ben_3rd_party_acting" options={SUCCESSOR_TRUSTEE_ACTING_OPTIONS} control={control} errors={errors} layout="vertical"/></div> )}
                                {watchGroupBeneficiaryTrusteeOption === 'Beneficiary at Named Age' && ( <InputField label="Age Beneficiary Becomes Sole Trustee" name="group_beneficiary_trustee_ben_age" type="number" control={control} errors={errors} className="ml-6"/> )}
                             </div>
                            <FormSection title="Incentive Clauses for this Group Distribution" className="mt-4" borderClassName="border-primary/20">
                                <CheckboxGroupField label="Select Clauses (Optional):" name="group_incentive_clauses" control={control} errors={errors} options={INCENTIVE_CLAUSE_OPTIONS} />
                                <InputField control={control} errors={errors} label="Other Clause:" name="group_incentive_clauses_other" placeholder="Specify other incentive" />
                            </FormSection>
                            <TextareaField label="Group Distribution Notes" name="group_distribution_notes" control={control} errors={errors} rows={2} placeholder="Any specific notes about the group distribution..." className="mt-4" />
                        </FormSection>
                    )}

                     {!isSingleForm && watchResidualMainOption === "Different Group" && (
                        <FormSection title="Different Group Distributions" borderClassName="border-yellow-200/80" className="ml-6 mt-4 bg-yellow-100/40">
                            <p className="text-sm text-muted-foreground mb-4">Define separate group distribution schemes for {person1Label} and {person2Label}.</p>
                            <FormSection title={`${person1Label}'s Group Distribution`} borderClassName="border-yellow-300/70" className="mb-6 bg-yellow-50/50">
                                <RadioGroupField label={`Select Group Distribution Type for ${person1Label}:`} name="residual_diff_group_t1_option_selected" control={control} errors={errors} layout="vertical" options={GROUP_DISTRIBUTION_OPTIONS} />
                                {watchResidualDiffGroupT1OptionSelected && watchResidualDiffGroupT1OptionSelected !== "Equal and Immediate" && watchResidualDiffGroupT1OptionSelected !== "Access/Divorce Protection Trust" && (
                                    <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-3">
                                        <h6 className="text-sm font-medium text-muted-foreground mb-2 uppercase">Details for {person1Label}'s Group</h6>
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
                                 <RadioGroupField label={`Select Group Distribution Type for ${person2Label}:`} name="residual_diff_group_t2_option_selected" control={control} errors={errors} layout="vertical" options={GROUP_DISTRIBUTION_OPTIONS} />
                                  {watchResidualDiffGroupT2OptionSelected && watchResidualDiffGroupT2OptionSelected !== "Equal and Immediate" && watchResidualDiffGroupT2OptionSelected !== "Access/Divorce Protection Trust" && (
                                    <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-3">
                                        <h6 className="text-sm font-medium text-muted-foreground mb-2 uppercase">Details for {person2Label}'s Group</h6>
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
                        <ResidualBeneficiaryTermsFields control={control} errors={errors} watch={watch} />
                    )}
                </div>
            </FormSection>
            
            <FormSection title={`Lack of Designated Beneficiaries (Ultimate Distribution) - If ALL previously named beneficiaries fail to survive ${person1Label}${!isSingleForm && person2Label ? ` and ${person2Label}` : ''}`} borderClassName="border-red-200/80">
                {(!isSingleForm && person2Label) ? ( 
                    <RadioGroupField label={`Do ${person1Label} and ${person2Label} have the same Ultimate Distribution Selection?`} name="ultimate_distribution_pattern" options={ULTIMATE_DISTRIBUTION_PATTERN_OPTIONS} control={control} errors={errors} required layout="vertical" />
                ) : ( 
                    <Controller name="ultimate_distribution_pattern" control={control} render={({ field }) => <input type="hidden" {...field} value="Different" />} />
                )}

                { (isSingleForm || (!isSingleForm && person2Label && watchUltimatePattern === 'Different')) && (
                    <FormSection title={`Ultimate Distribution - ${person1Label}'s Pattern`} borderClassName="border-red-300/60" className="ml-6 mt-4 bg-red-100/40">
                        <RadioGroupField name="ultimate_t1_option" options={ULTIMATE_T1_OPTIONS} control={control} errors={errors} label="" required layout="vertical" />
                        {watchUltimateT1Option === 'Trustor One Named Beneficiaries' && (
                            <UltimateBeneficiaryFields control={control} errors={errors} fieldArrayName="ultimate_t1_beneficiaries" title={`${person1Label}'s Ultimate Beneficiaries`} />
                        )}
                    </FormSection>
                )}

                {!isSingleForm && person2Label && watchUltimatePattern === 'Same' && (
                    <FormSection title="Ultimate Distribution - Same Pattern" borderClassName="border-red-300/60" className="ml-6 mt-4 bg-red-100/40">
                        <RadioGroupField name="ultimate_same_option" options={ULTIMATE_SAME_OPTIONS} control={control} errors={errors} label="" required={watchUltimatePattern === 'Same'} layout="vertical" />
                        {watchUltimateSameOption === 'Same Named Beneficiaries' && (
                            <UltimateBeneficiaryFields control={control} errors={errors} fieldArrayName="ultimate_joint_beneficiaries" title="Joint Ultimate Beneficiaries" />
                        )}
                    </FormSection>
                )}
                {!isSingleForm && person2Label && watchUltimatePattern === 'Different' && (
                     <FormSection title={`Ultimate Distribution - ${person2Label}'s Share`} borderClassName="border-red-300/60" className="ml-6 mt-4 bg-red-100/40">
                        <RadioGroupField name="ultimate_t2_option" options={ULTIMATE_T2_OPTIONS} control={control} errors={errors} label="" required={watchUltimatePattern === 'Different'} layout="vertical" />
                        {watchUltimateT2Option === 'Trustor Two Named Beneficiaries' && (
                            <UltimateBeneficiaryFields control={control} errors={errors} fieldArrayName="ultimate_t2_beneficiaries" title={`${person2Label}'s Ultimate Beneficiaries`} />
                        )}
                    </FormSection>
                )}
                 {isSingleForm && ( 
                    <FormSection title={`Ultimate Distribution - ${person1Label}'s Pattern`} borderClassName="border-red-300/60" className="ml-6 mt-4 bg-red-100/40">
                        <RadioGroupField name="ultimate_same_option" options={ULTIMATE_T1_OPTIONS.map(opt => ({...opt, label: opt.label.replace("Trustor 1's", `${person1Label}'s`)}))} control={control} errors={errors} label="" required layout="vertical" />
                        {watchUltimateSameOption?.includes('Named Beneficiaries') && ( 
                            <UltimateBeneficiaryFields control={control} errors={errors} fieldArrayName="ultimate_joint_beneficiaries" title={`${person1Label}'s Ultimate Beneficiaries`} />
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
    
export const AdvancedProvisionsMarriedTab = ({ person1Label = "Trustor 1", person2Label = "Trustor 2" }) => {
    const { control, formState: { errors }, watch } = useFormContext(); 
    
    const watchFundingQualifiedAssetChecklist = watch("funding_qualified_asset_checklist");
    const watchFundingQualifiedBeneficiaryOption = watch("funding_qualified_beneficiary_option");
    const watchFundingNonQualifiedAssetChecklist = watch("funding_non_qualified_asset_checklist");
    const watchFundingNonQualifiedBeneficiaryOption = watch("funding_non_qualified_beneficiary_option");
    const watchAdvProvTrustDivisionType = watch("adv_prov_trust_division_type"); 
    const watchAdvProvAbSplitFormula = watch("adv_prov_ab_split_funding_formula");
    const watchAdvProvFamilyTrustAdminOption = watch("adv_prov_family_trust_admin_option");
    const watchAdvProvMaritalTrustAdminOption = watch("adv_prov_marital_trust_admin_option");

    return (
        <fieldset>
            <h3 className="text-xl font-semibold text-foreground px-2 mb-4">Advanced Provisions</h3>

            <FormSection title="Funding Checklist" borderClassName="border-sky-200/80">
                <div className="mb-6 p-4 border rounded-md bg-card">
                    <CheckboxField control={control} errors={errors} name="funding_qualified_asset_checklist" label="Qualified Asset Checklist"/>
                    <p className="text-xs text-muted-foreground mb-3 ml-6">Retirement sub-trusts for beneficiaries – preferred for minor children or children with struggles. Do Not Use with PLR funding formula.</p>
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

            <FormSection title="Trust Provisions" borderClassName="border-violet-200/80">
                <FormSection title="Duty To Account" borderClassName="border-violet-300/70" className="bg-violet-100/50">
                    <RadioGroupField label={`Duty of Competent or Surviving Trustor (${person1Label}/${person2Label}) to Account?`} name="adv_prov_duty_to_account_surviving" options={YES_NO_OPTIONS} control={control} errors={errors} />
                    <RadioGroupField label="To Successor Trustee/Beneficiaries of Family Trust?" name="adv_prov_duty_to_account_successor" options={ADV_PROV_DUTY_ACCOUNT_SUCCESSOR_OPTIONS} control={control} errors={errors} layout="vertical" />
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
                    <RadioGroupField name="adv_prov_life_insurance_allocation" control={control} errors={errors} layout="vertical" options={ADV_PROV_LIFE_INSURANCE_OPTIONS} label="How do you wish to have life insurance owned by or paid to the Revocable Living / Family Wealth Trust allocated?"/>
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

            <FormSection title="Trust Division" borderClassName="border-teal-200/80">
                <RadioGroupField label="Do you want an:" name="adv_prov_trust_division_type" options={ADV_PROV_TRUST_DIVISION_OPTIONS} control={control} errors={errors} layout="vertical" required />
                <div className="mt-4">
                    <RadioGroupField label="Do you want a FLEX Trust:" name="adv_prov_flex_trust" options={YES_NO_OPTIONS} control={control} errors={errors} required />
                </div>
                {(watchAdvProvTrustDivisionType === "A/B Split" || watchAdvProvTrustDivisionType === "A/B/C Split (QTIP)") && (
                    <FormSection title="A/B Split Funding Formula" borderClassName="border-teal-300/70" className="ml-6 mt-4 bg-teal-100/50">
                        <RadioGroupField name="adv_prov_ab_split_funding_formula" control={control} errors={errors} layout="vertical" options={ADV_PROV_AB_SPLIT_FORMULA_OPTIONS} />
                        {watchAdvProvAbSplitFormula === "Disclaimer Trust" && ( <p className="text-xs text-destructive mt-2 p-2 bg-destructive/10 rounded-md"> <strong>CAUTION: Disclaimer Trust</strong> – When the Disclaimer Trust option is chosen, it is recommended you do not choose an option for the Family Trust that includes a Limited Power of Appointment. If Limited Power of Appointment language is available over the Family Trust, the Surviving Trustor must also disclaim the Limited Power of Appointment or he / she will not have a valid disclaimer for federal estate tax purposes. </p> )}
                    </FormSection>
                )}
                {watchAdvProvTrustDivisionType === "A/B/C Split (QTIP)" && (
                    <FormSection title="A/B/C Split Funding Formula" borderClassName="border-teal-300/70" className="ml-6 mt-4 bg-teal-100/50">
                        <RadioGroupField name="adv_prov_abc_split_funding_formula" control={control} errors={errors} layout="vertical" options={ADV_PROV_ABC_SPLIT_FORMULA_OPTIONS} />
                        <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded-md"> <strong>NOTE:</strong> If a QTIP Trust or QDOT Trust is desired, choose from one of the A/B/C Split options. </p>
                    </FormSection>
                )}
            </FormSection>

            <FormSection title="Survivor's Trust" borderClassName="border-emerald-200/80">
                <p className="text-sm text-muted-foreground mb-3">Note: The Survivor's Trust always provides for the distribution of income and discretionary principal for the Surviving Spouse. The Surviving Spouse also has a lifetime and testamentary power of appointment (withdrawal right).</p>
                <RadioGroupField label="Invasion Power: Select whether to allow for Trustee invasion of Survivor's Trust for descendants and dependents:" name="adv_prov_survivor_trust_invasion_power" options={YES_NO_OPTIONS} control={control} errors={errors} required />
                <RadioGroupField label="MAKE SURVIVOR'S TRUST IRREVOCABLE:" name="adv_prov_survivor_trust_irrevocable" options={YES_NO_OPTIONS} control={control} errors={errors} required className="mt-4" />
            </FormSection>

            <FormSection title="Family Trust" borderClassName="border-orange-200/80">
                <p className="text-sm text-muted-foreground mb-2">All options with principal distributions will generate language for principal distributions for the Surviving Spouse and the Deceased Trustor's descendants.</p>
                <p className="text-xs text-destructive mt-1 mb-3 p-2 bg-destructive/10 rounded-md"> <strong>CAUTION:</strong> Any option that includes a Limited Power of Appointment and/or a 5%/$5000 Option will have the Limited Power of Appointment and/or the 5%/$5000 language removed if a Disclaimer Trust chosen in Article 7. </p>
                <h5 className="text-md font-semibold text-foreground mb-2">ADMINISTRATION OF FAMILY TRUST</h5>
                <RadioGroupField name="adv_prov_family_trust_admin_option" control={control} errors={errors} layout="vertical" options={ADV_PROV_FAMILY_TRUST_ADMIN_OPTIONS} />
                {(watchAdvProvFamilyTrustAdminOption === "PI" || watchAdvProvFamilyTrustAdminOption === "PILPOA" || watchAdvProvFamilyTrustAdminOption === "DPT" || watchAdvProvFamilyTrustAdminOption === "TRU") && (
                    <div className="ml-6 mt-3">
                        <RadioGroupField
                            label="Deceased Trustor’s descendants for Needs?"
                            name={
                                watchAdvProvFamilyTrustAdminOption === "PI" ? "adv_prov_family_trust_pi_desc_needs" :
                                watchAdvProvFamilyTrustAdminOption === "PILPOA" ? "adv_prov_family_trust_pilpoa_desc_needs" :
                                watchAdvProvFamilyTrustAdminOption === "DPT" ? "adv_prov_family_trust_dpt_desc_needs" :
                                "adv_prov_family_trust_tru_desc_needs"
                            }
                            options={YES_NO_OPTIONS} control={control} errors={errors} required
                        />
                    </div>
                )}
                {watchAdvProvFamilyTrustAdminOption === "TRU" && ( <InputField control={control} errors={errors} label="TRU Distribution Rate:" name="adv_prov_family_trust_tru_rate" type="number" placeholder="%" className="ml-6 mt-2 w-32" /> )}
                <div className="mt-4 pt-4 border-t border-border/50">
                    <RadioGroupField label="Does the Limited Power of Appointment (if any) allow appointment to a trust that provides a tax step-up in basis at the death of the appointee?" name="adv_prov_family_trust_lpoa_tax_step_up" options={YES_NO_OPTIONS} control={control} errors={errors} layout="vertical" />
                </div>
                <div className="mt-2">
                     <RadioGroupField label="Does the Limited Power of Appointment (if any) allow the Surviving Trustor to appoint the Family Trust assets to his/her descendants (or only to the Deceased Trustor's descendants)?" name="adv_prov_family_trust_lpoa_survivor_to_descendants" options={YES_NO_OPTIONS} control={control} errors={errors} layout="vertical" />
                </div>
            </FormSection>

            {watchAdvProvTrustDivisionType === "A/B/C Split (QTIP)" && (
                <FormSection title="Marital Trust" borderClassName="border-pink-200/80">
                    <h5 className="text-md font-semibold text-foreground mb-2">ADMINISTRATION OF MARITAL TRUST</h5>
                    <RadioGroupField name="adv_prov_marital_trust_admin_option" control={control} errors={errors} layout="vertical" options={ADV_PROV_MARITAL_TRUST_ADMIN_OPTIONS} />
                    {(watchAdvProvMaritalTrustAdminOption === "DPTLPOA_MT" || watchAdvProvMaritalTrustAdminOption === "DPTIT_MT") && ( <p className="text-xs text-muted-foreground mt-1 ml-6 p-2 bg-muted/30 rounded-md">NOTE: If you choose this option you should use either Option 3 or 4 for Trustee selection.</p> )}
                    {watchAdvProvMaritalTrustAdminOption === "APTS_MT" && ( <p className="text-xs text-muted-foreground mt-1 ml-6 p-2 bg-muted/30 rounded-md">NOTE: If you choose this option you should use either Option 3 or 4 for Trustee selection. (No Investment Trustee).</p> )}
                    {watchAdvProvMaritalTrustAdminOption === "APTIT_MT" && ( <p className="text-xs text-muted-foreground mt-1 ml-6 p-2 bg-muted/30 rounded-md">NOTE: If you choose this option you should use either Option 3 or 4 for Trustee selection.</p> )}
                    {(watchAdvProvMaritalTrustAdminOption === "TRUPILPOA_MT" || watchAdvProvMaritalTrustAdminOption === "TRUPI_MT") && (
                        <div className="ml-6 mt-3 space-y-2">
                            <InputField control={control} errors={errors} label="Exempt TRU Distribution Rate:" name="adv_prov_marital_trust_exempt_tru_rate" type="number" placeholder="%" className="w-32" />
                            <InputField control={control} errors={errors} label="Non-Exempt TRU Distribution Rate:" name="adv_prov_marital_trust_non_exempt_tru_rate" type="number" placeholder="%" className="w-32" />
                        </div>
                    )}
                </FormSection>
            )}
            
            <FormSection title="Notes" borderClassName="border-gray-200/80">
                <TextareaField control={control} errors={errors} label="Notes for Advanced Provisions" name="notes_advanced_provisions" placeholder="Enter any relevant notes for this section..." rows={3} />
            </FormSection>
        </fieldset>
    );
};


export const AdvancedProvisionsSingleTab = ({ person1Label = "Trustor" }) => {
    const { control, formState: { errors }, watch } = useFormContext(); 
    
    const watchFundingQualifiedAssetChecklist = watch("funding_qualified_asset_checklist");
    const watchFundingQualifiedBeneficiaryOption = watch("funding_qualified_beneficiary_option");
    const watchFundingNonQualifiedAssetChecklist = watch("funding_non_qualified_asset_checklist"); 
    const watchFundingNonQualifiedBeneficiaryOption = watch("funding_non_qualified_beneficiary_option"); 
    const singleFundingBeneficiaryOptions = FUNDING_BENEFICIARY_OPTIONS.filter(opt => opt.value !== "Spouse first");


    return (
        <fieldset>
            <h3 className="text-xl font-semibold text-foreground px-2 mb-4">Advanced Provisions</h3>

            <FormSection title="Funding Checklist" borderClassName="border-sky-200/80">
                <div className="mb-6 p-4 border rounded-md bg-card">
                    <CheckboxField control={control} errors={errors} name="funding_qualified_asset_checklist" label="Qualified Asset Checklist"/>
                    <p className="text-xs text-muted-foreground mb-3 ml-6">Retirement sub-trusts for beneficiaries – preferred for minor children or children with struggles.</p>
                    {watchFundingQualifiedAssetChecklist && (
                        <div className="ml-6 space-y-3">
                            <RadioGroupField name="funding_qualified_beneficiary_option" control={control} errors={errors} layout="vertical" options={singleFundingBeneficiaryOptions} />
                            {watchFundingQualifiedBeneficiaryOption === "Other" && ( 
                                <InputField control={control} errors={errors} label={`${person1Label}'s beneficiaries for Qualified Assets:`} name="funding_qualified_trustor1_beneficiaries" placeholder="Beneficiary names" />
                            )}
                        </div>
                    )}
                </div>
                 <div className="mb-6 p-4 border rounded-md bg-card">
                    <CheckboxField control={control} errors={errors} name="funding_non_qualified_asset_checklist" label="Non-Qualified Asset Checklist"/>
                    {watchFundingNonQualifiedAssetChecklist && (
                        <div className="ml-6 space-y-3 mt-2">
                            <RadioGroupField name="funding_non_qualified_beneficiary_option" control={control} errors={errors} layout="vertical" options={singleFundingBeneficiaryOptions} />
                            {watchFundingNonQualifiedBeneficiaryOption === "Other" && ( 
                                <InputField control={control} errors={errors} label={`${person1Label}'s beneficiaries for Non-Qualified Assets:`} name="funding_non_qualified_trustor1_beneficiaries" placeholder="Beneficiary names" />
                            )}
                        </div>
                    )}
                </div>
                <TextareaField label="Checklist notes:" name="funding_checklist_notes" control={control} errors={errors} placeholder="Enter any funding checklist notes..." rows={3} />
            </FormSection>

            <FormSection title="Trust Provisions" borderClassName="border-violet-200/80">
                <FormSection title="Duty To Account" borderClassName="border-violet-300/70" className="bg-violet-100/50">
                    <RadioGroupField label="To Successor Trustee/Beneficiaries?" name="adv_prov_duty_to_account_successor" options={ADV_PROV_DUTY_ACCOUNT_SUCCESSOR_OPTIONS} control={control} errors={errors} layout="vertical" />
                </FormSection>
            </FormSection>
            
            <FormSection title="Notes" borderClassName="border-gray-200/80">
                <TextareaField control={control} errors={errors} label="Notes for Advanced Provisions" name="notes_advanced_provisions" placeholder="Enter any relevant notes for this section..." rows={3} />
            </FormSection>
        </fieldset>
    );
};

export const CapacityConfirmationTab = ({ person1Label = "Trustor 1", person2Label }) => {
    const { control, formState: { errors } } = useFormContext(); // Removed register as it's not used for CheckboxField

    return (
        <fieldset>
            <legend className="sr-only">Capacity Confirmation</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-md bg-sky-50/30 border border-sky-200/80">
                <FormSection title={`${person1Label} Capacity`} className="bg-card" borderClassName="border-sky-300/70">
                    <CheckboxField control={control} errors={errors} name="t1_cap_understands_planning" label="Understands estate planning process." />
                    <CheckboxField control={control} errors={errors} name="t1_cap_knows_children" label="Knows their children." />
                    <CheckboxField control={control} errors={errors} name="t1_cap_knows_estate_value" label="Knows approximate estate value/nature." />
                    <CheckboxField control={control} errors={errors} name="t1_cap_understands_bequests" label="Understands bequests to beneficiaries." />
                    <CheckboxField control={control} errors={errors} name="t1_cap_understands_powers" label="Understands powers granted." />
                </FormSection>

                {person2Label && (
                    <FormSection title={`${person2Label} Capacity`} className="bg-card" borderClassName="border-sky-300/70">
                        <CheckboxField control={control} errors={errors} name="t2_cap_understands_planning" label="Understands estate planning process." />
                        <CheckboxField control={control} errors={errors} name="t2_cap_knows_children" label="Knows their children." />
                        <CheckboxField control={control} errors={errors} name="t2_cap_knows_estate_value" label="Knows approximate estate value/nature." />
                        <CheckboxField control={control} errors={errors} name="t2_cap_understands_bequests" label="Understands bequests to beneficiaries." />
                        <CheckboxField control={control} errors={errors} name="t2_cap_understands_powers" label="Understands powers granted." />
                    </FormSection>
                )}
            </div>

            <FormSection title="Notes" borderClassName="border-gray-200/80" className="mt-8">
                <InputField
                    control={control}
                    errors={errors}
                    label="Attorney's Initials"
                    name="attorney_initials_capacity"
                    placeholder="Enter initials"
                    required 
                    className="mb-4"
                />
                <TextareaField
                    control={control}
                    errors={errors}
                    label="Notes for Capacity Confirmation"
                    name="notes_capacity_confirmation"
                    placeholder="Enter any relevant notes for this section..."
                    rows={3}
                />
            </FormSection>
        </fieldset>
    );
};
    
    




