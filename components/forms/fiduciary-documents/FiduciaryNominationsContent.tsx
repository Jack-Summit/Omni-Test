
// @ts-nocheck
// TODO: Remove ts-nocheck and fix types
"use client";

import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputField, RadioGroupField, TextareaField, SelectField, CheckboxField } from '@/components/forms/trust-creation/field-components';
import { YES_NO_OPTIONS, FINANCIAL_AGENT_CHOICE_OPTIONS, SUCCESSOR_TRUSTEE_ACTING_OPTIONS, DISPOSITION_AGENT_SOURCE_OPTIONS } from '@/components/forms/trust-creation/constants';

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

export const FiduciaryNominationsContent = ({ person1Label, person2Label }) => {
    const { control, formState: { errors }, watch } = useFormContext();
    
    const maritalStatus = watch("marital_status");
    const isMarried = maritalStatus === "Married";

    const watchTrustor1AdSameAsHc = watch("trustor1_ad_same_as_hc");
    const watchTrustor2AdSameAsHc = isMarried ? watch("trustor2_ad_same_as_hc") : undefined;
    const watchTrustor1AdditionalHipaaAuth = watch("trustor1_additional_hipaa_authorization");
    const watchTrustor2AdditionalHipaaAuth = isMarried ? watch("trustor2_additional_hipaa_authorization") : undefined;

    const watchTrustor1AppointDispositionAgent = watch("trustor1_appoint_disposition_agent");
    const watchTrustor1DispositionAgentSource = watch("trustor1_disposition_agent_source");
    const watchTrustor2AppointDispositionAgent = isMarried ? watch("trustor2_appoint_disposition_agent") : undefined;
    const watchTrustor2DispositionAgentSource = isMarried ? watch("trustor2_disposition_agent_source") : undefined;


     return (
        <fieldset>
            <legend className="sr-only">Fiduciary Nominations</legend>
            
            {isMarried && (
                <FormSection title="Spousal Fiduciary Preference" borderClassName="border-orange-200/80">
                    <RadioGroupField
                        control={control}
                        errors={errors}
                        label="Is spouse automatically first choice for Fiduciary roles (e.g., Financial Agent, Health Care Agent, Successor Trustee) if not otherwise specified?"
                        name="spouse_auto_fiduciary"
                        options={YES_NO_OPTIONS}
                        required
                        layout="vertical"
                    />
                </FormSection>
            )}

            <FormSection title={`Financial Agents (Power of Attorney) - ${person1Label}`} borderClassName="border-indigo-200/80" description={`Who will manage ${person1Label}'s finances if incapacitated?`}>
                <InputField control={control} errors={errors} label={`Agent 1 (${person1Label})`} name="trustor1_fin_agent1_name" required placeholder="Full Name" />
                <InputField control={control} errors={errors} label={`Agent 2 (${person1Label}, Successor to Agent 1)`} name="trustor1_fin_agent2_name" placeholder="Full Name" />
                <InputField control={control} errors={errors} label={`Agent 3 (${person1Label}, Successor to Agent 2)`} name="trustor1_fin_agent3_name" placeholder="Full Name" />
            </FormSection>

            {isMarried && person2Label && (
                <FormSection title={`Financial Agents (Power of Attorney) - ${person2Label}`} borderClassName="border-indigo-200/80" description={`Who will manage ${person2Label}'s finances if incapacitated?`}>
                    <InputField control={control} errors={errors} label={`Agent 1 (${person2Label})`} name="trustor2_fin_agent1_name" required placeholder="Full Name" />
                    <InputField control={control} errors={errors} label={`Agent 2 (${person2Label}, Successor to Agent 1)`} name="trustor2_fin_agent2_name" placeholder="Full Name" />
                    <InputField control={control} errors={errors} label={`Agent 3 (${person2Label}, Successor to Agent 2)`} name="trustor2_fin_agent3_name" placeholder="Full Name" />
                </FormSection>
            )}
            
            <FormSection title={`Health Care Agents - ${person1Label}`} borderClassName="border-rose-200/80" description={`Specify who will make health care decisions for ${person1Label}.`}>
                <InputField control={control} errors={errors} label={`Agent 1 (${person1Label} Health Care)`} name="trustor1_hc_agent1_name" required placeholder="Full Name" />
                <InputField control={control} errors={errors} label={`Agent 2 (${person1Label} Health Care, Successor to Agent 1)`} name="trustor1_hc_agent2_name" placeholder="Full Name" />
                <InputField control={control} errors={errors} label={`Agent 3 (${person1Label} Health Care, Successor to Agent 2)`} name="trustor1_hc_agent3_name" placeholder="Full Name" />
            </FormSection>

            {isMarried && person2Label && (
                <FormSection title={`Health Care Agents - ${person2Label}`} borderClassName="border-rose-200/80" description={`Specify who will make health care decisions for ${person2Label}.`}>
                    <InputField control={control} errors={errors} label={`Agent 1 (${person2Label} Health Care)`} name="trustor2_hc_agent1_name" required placeholder="Full Name" />
                    <InputField control={control} errors={errors} label={`Agent 2 (${person2Label} Health Care, Successor to Agent 1)`} name="trustor2_hc_agent2_name" placeholder="Full Name" />
                    <InputField control={control} errors={errors} label={`Agent 3 (${person2Label} Health Care, Successor to Agent 2)`} name="trustor2_hc_agent3_name" placeholder="Full Name" />
                </FormSection>
            )}

            <FormSection title="Advance Directive Agent Designation" borderClassName="border-cyan-200/80" description="Specify agents for Advance Directives. This can be the same or different from Health Care Agents.">
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
                        <InputField control={control} errors={errors} label={`Agent 1 (${person1Label} Advance Directive)`} name="trustor1_ad_agent1_name" required placeholder="Full Name" />
                        <InputField control={control} errors={errors} label={`Agent 2 (${person1Label} Advance Directive, Successor to Agent 1)`} name="trustor1_ad_agent2_name" placeholder="Full Name" />
                        <InputField control={control} errors={errors} label={`Agent 3 (${person1Label} Advance Directive, Successor to Agent 2)`} name="trustor1_ad_agent3_name" placeholder="Full Name" />
                    </FormSection>
                )}

                {isMarried && person2Label && (
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
                                <InputField control={control} errors={errors} label={`Agent 1 (${person2Label} Advance Directive)`} name="trustor2_ad_agent1_name" required placeholder="Full Name" />
                                <InputField control={control} errors={errors} label={`Agent 2 (${person2Label} Advance Directive, Successor to Agent 1)`} name="trustor2_ad_agent2_name" placeholder="Full Name" />
                                <InputField control={control} errors={errors} label={`Agent 3 (${person2Label} Advance Directive, Successor to Agent 2)`} name="trustor2_ad_agent3_name" placeholder="Full Name" />
                            </FormSection>
                        )}
                    </>
                )}
            </FormSection>

            <FormSection title="HIPAA Authorization" borderClassName="border-teal-200/80" description={`Health Care Agents are automatically authorized. Specify any additional individuals.`}>
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
                {isMarried && person2Label && (
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

                {isMarried && person2Label && (
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

