// @ts-nocheck
// TODO: Remove ts-nocheck and fix types

"use client";

import React, { useEffect } from 'react';
import { useFieldArray, Controller, useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputField, RadioGroupField, TextareaField, SelectField, CheckboxField, CheckboxGroupField } from './field-components';
import {
    YES_NO_OPTIONS, GENDER_OPTIONS, CHILD_RELATIONSHIP_OPTIONS, GIFT_KIND_OPTIONS, GIFT_TIMING_OPTIONS, GIFT_EXPENSE_BEARER_OPTIONS,
    GIFT_TAX_PAYER_OPTIONS, DISTRIBUTION_TYPE_OPTIONS, LAPSE_PROVISION_OPTIONS, NAMED_LAPSE_TIMING_OPTIONS,
    TERMS_INCOME_OPTIONS, TERMS_PRINCIPAL_OPTIONS, TERMS_LAPSE_PROVISION_OPTIONS, GST_LAPSE_PROVISION_OPTIONS,
    SENTRY_INVEST_TRUSTEE_OPTIONS, BENEFICIARY_TRUSTEE_OPTIONS, SUCCESSOR_TRUSTEE_ROLE_OPTIONS, RELATIONSHIP_OPTIONS,
    ULTIMATE_BENEFICIARY_TYPE_OPTIONS, SUCCESSOR_TRUSTEE_ACTING_OPTIONS,
    WILL_LAPSE_PROVISION_OPTIONS,
    WILL_GIFT_TIMING_OPTIONS,
    INCENTIVE_CLAUSE_OPTIONS,
    NON_AB_DISTRIBUTION_TYPE_OPTIONS,
} from './constants';
import { PlusCircle, Trash2 } from 'lucide-react';

export const FormSectionCard = ({ title, description, children, className = "", borderClassName = "border-border" }) => (
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


// --- Specific Gift Item ---
const SpecificGiftItem = ({ control, errors, watch, index, remove: removeItem, fieldArrayNamePrefix, formType = 'trust', distributionTypeOptions = DISTRIBUTION_TYPE_OPTIONS }) => {
    const fieldArrayName = `${fieldArrayNamePrefix}.${index}`;

    const watchDistributionType = watch(`${fieldArrayName}.distribution_type`);
    const watchTermsSpecifiedPrincipal = watch(`${fieldArrayName}.terms_principal_option`);
    const watchSentryInvestTrusteeOption = watch(`${fieldArrayName}.sentry_invest_trustee_option`);
    const watchBeneficiaryTrusteeOption = watch(`${fieldArrayName}.beneficiary_trustee_option`);
    const watchGstLapseProvision = watch(`${fieldArrayName}.gst_lapse_provision`);

    const watchLapseProvisionType = watch(`${fieldArrayName}.lapse_provision_type`);

    const watchGiftKind = watch(`${fieldArrayName}.gift_kind`);

    const currentDistributionType = watchDistributionType || 'Standard Free of Trust';

    const lapseOptions = formType === 'will' ? WILL_LAPSE_PROVISION_OPTIONS : LAPSE_PROVISION_OPTIONS;
    const giftTimingOptions = formType === 'will' ? WILL_GIFT_TIMING_OPTIONS : GIFT_TIMING_OPTIONS;


    return (
        <Card className="mb-4 border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-primary/5 rounded-t-lg">
                <CardTitle className="text-lg">Specific Gift {index + 1}</CardTitle>
                <Button type="button" variant="ghost" size="sm" onClick={removeItem} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-1" /> Remove Gift
                </Button>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                    <InputField control={control} errors={errors} label="Beneficiary Name" name={`${fieldArrayName}.name`} placeholder="Full Legal Name" required />
                    <TextareaField control={control} errors={errors} label="Description of Specific Distribution" name={`${fieldArrayName}.description`} placeholder="e.g., My Rolex watch, 100 shares of XYZ stock, Property at 123 Main St" required rows={2} className="md:col-span-2" />

                    {formType === 'trust' && (
                        <>
                            <RadioGroupField control={control} errors={errors} label="When Distributed" name={`${fieldArrayName}.timing`} options={giftTimingOptions} required layout="vertical" />
                            <RadioGroupField control={control} errors={errors} label="What Kind of Gift?" name={`${fieldArrayName}.gift_kind`} options={GIFT_KIND_OPTIONS} required layout="vertical" />
                            {watchGiftKind === 'Other' && (
                                <InputField control={control} errors={errors} label="Describe Other Gift Kind" name={`${fieldArrayName}.gift_kind_other`} placeholder="Specify other kind" required={watchGiftKind === 'Other'} className="md:col-span-2" />
                            )}
                        </>
                    )}
                     {formType === 'will' && (
                         <>
                            {/* No timing options for will specific gifts as per request (timing is at Testator\'s death) */}
                         </>
                     )}


                    <RadioGroupField control={control} errors={errors} label="Who Bears Expenses?" name={`${fieldArrayName}.expense_bearer`} options={GIFT_EXPENSE_BEARER_OPTIONS} required layout="vertical" />
                    <RadioGroupField control={control} errors={errors} label="Who Pays Death Taxes?" name={`${fieldArrayName}.tax_payer`} options={GIFT_TAX_PAYER_OPTIONS} required layout="vertical" />
                </div>

                {formType === 'trust' && (
                    <>
                        <div className="mt-4 pt-4 border-t border-border">
                            <h6 className="text-md font-semibold text-foreground mb-2">Distribution Options for this Gift</h6>
                            <RadioGroupField name={`${fieldArrayName}.distribution_type`} control={control} errors={errors} required layout="vertical" options={distributionTypeOptions} />
                        </div>

                        {currentDistributionType === 'Terms Specified' && (
                            <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-3">
                                <h6 className="text-sm font-medium text-muted-foreground mb-2 uppercase">Terms Specified Details</h6>
                                <RadioGroupField label="Income Distribution Standard" name={`${fieldArrayName}.terms_income_option`} control={control} errors={errors} layout="vertical" options={TERMS_INCOME_OPTIONS} />
                                <RadioGroupField label="Principal Distribution Standard" name={`${fieldArrayName}.terms_principal_option`} control={control} errors={errors} layout="vertical" options={TERMS_PRINCIPAL_OPTIONS} />
                                {(watchTermsSpecifiedPrincipal?.includes('Age') || watchTermsSpecifiedPrincipal?.includes('Stagger')) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 ml-6">
                                        <InputField label="Age 1 / Amount 1" name={`${fieldArrayName}.terms_age1`} type="text" control={control} errors={errors} placeholder="e.g., 25 or 1/3" className="mb-0" />
                                        {(watchTermsSpecifiedPrincipal?.includes('Stagger 2') || watchTermsSpecifiedPrincipal?.includes('Stagger 3')) && <InputField label="Age 2 / Amount 2" name={`${fieldArrayName}.terms_age2`} type="text" control={control} errors={errors} placeholder="e.g., 30 or 1/2" className="mb-0" />}
                                        {watchTermsSpecifiedPrincipal?.includes('Stagger 3') && <InputField label="Age 3 / Amount 3" name={`${fieldArrayName}.terms_age3`} type="text" control={control} errors={errors} placeholder="e.g., 35 or Remainder" className="mb-0" />}
                                    </div>
                                )}
                            </div>
                        )}

                        {(currentDistributionType === 'GST Income' || currentDistributionType === 'GST TRU' || currentDistributionType === 'GST Discretionary') && (
                            <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-3">
                                <h6 className="text-sm font-medium text-muted-foreground mb-2 uppercase">GST Details</h6>
                                {currentDistributionType === 'GST TRU' && <InputField label="TRU Distribution Rate (%)" name={`${fieldArrayName}.gst_tru_rate`} type="number" control={control} errors={errors} />}
                                <RadioGroupField label="Lapse Provisions for GST Trust" name={`${fieldArrayName}.gst_lapse_provision`} control={control} errors={errors} layout="vertical" options={GST_LAPSE_PROVISION_OPTIONS} />
                                {watchGstLapseProvision === 'Specific Beneficiary Descendants at Spec Age' && <InputField label="Specified Age for Descendants" name={`${fieldArrayName}.gst_lapse_spec_age`} type="number" control={control} errors={errors} className="ml-6" />}
                            </div>
                        )}

                        {currentDistributionType === 'Sentry w/ Investment Trustee' && (
                            <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-3">
                                <h6 className="text-sm font-medium text-muted-foreground mb-2 uppercase">Sentry Trust w/ Investment Trustee</h6>
                                <RadioGroupField label="Investment Trustee Options" name={`${fieldArrayName}.sentry_invest_trustee_option`} control={control} errors={errors} layout="vertical" options={SENTRY_INVEST_TRUSTEE_OPTIONS} />
                                {watchSentryInvestTrusteeOption === 'Other' && <InputField label="Other Investment Trustee Name" name={`${fieldArrayName}.sentry_invest_trustee_other_name`} control={control} errors={errors} placeholder="Full Name or Corporate Name" className="ml-6" />}
                                {watchSentryInvestTrusteeOption === 'Specific Beneficiary' && <InputField label="Specific Beneficiary as Investment Trustee" name={`${fieldArrayName}.sentry_invest_trustee_beneficiary_name`} control={control} errors={errors} placeholder="Full Name of Beneficiary" className="ml-6" />}
                            </div>
                        )}

                        {currentDistributionType !== 'Standard Free of Trust' && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <h6 className="text-md font-semibold text-foreground mb-2">Beneficiary Trustee Option for this Gift</h6>
                                <RadioGroupField name={`${fieldArrayName}.beneficiary_trustee_option`} control={control} errors={errors} layout="vertical" options={BENEFICIARY_TRUSTEE_OPTIONS} />
                                {watchBeneficiaryTrusteeOption === '3rd Party' && (
                                    <div className="ml-6 mt-2 space-y-2 border p-3 rounded-md bg-muted/30">
                                        <InputField label="1. 3rd Party Trustee Name" name={`${fieldArrayName}.beneficiary_trustee_3rd_party1`} control={control} errors={errors} />
                                        <InputField label="2. 3rd Party Trustee Name (Optional)" name={`${fieldArrayName}.beneficiary_trustee_3rd_party2`} control={control} errors={errors} />
                                        <RadioGroupField label="If two 3rd party trustees, how should they act?" name={`${fieldArrayName}.beneficiary_trustee_3rd_party_acting`} options={SUCCESSOR_TRUSTEE_ACTING_OPTIONS} control={control} errors={errors} layout="vertical"/>
                                    </div>
                                )}
                                {watchBeneficiaryTrusteeOption === 'Beneficiary and 3rd Party' && (
                                     <div className="ml-6 mt-2 space-y-2 border p-3 rounded-md bg-muted/30">
                                         <InputField label="3rd Party Co-Trustee Name" name={`${fieldArrayName}.beneficiary_trustee_ben_3rd_party_name`} control={control} errors={errors} />
                                         <RadioGroupField label="How should Beneficiary and 3rd Party Co-Trustees act?" name={`${fieldArrayName}.beneficiary_trustee_ben_3rd_party_acting`} options={SUCCESSOR_TRUSTEE_ACTING_OPTIONS} control={control} errors={errors} layout="vertical"/>
                                    </div>
                                )}
                                {watchBeneficiaryTrusteeOption === 'Beneficiary at Named Age' && (
                                    <InputField label="Age Beneficiary Becomes Sole Trustee" name={`${fieldArrayName}.beneficiary_trustee_ben_age`} type="number" control={control} errors={errors} className="ml-6" />
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Lapse Provisions - shown for both Will and Trust */}
                <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20">
                    <h6 className="text-sm font-medium text-muted-foreground mb-2 uppercase">Lapse Provisions</h6>
                    <RadioGroupField name={`${fieldArrayName}.lapse_provision_type`} control={control} errors={errors} layout="vertical" options={lapseOptions} required />
                    {watchLapseProvisionType === 'Named Beneficiaries Immediate' && (
                        <>
                            {formType === 'trust' && (
                                <RadioGroupField name={`${fieldArrayName}.lapse_named_timing`} control={control} errors={errors} layout="vertical" options={NAMED_LAPSE_TIMING_OPTIONS} className="ml-6" />
                            )}
                            <TextareaField label="Named Contingent Beneficiaries" name={`${fieldArrayName}.lapse_named_beneficiaries_list`} control={control} errors={errors} placeholder="List names, relationships, and shares" rows={2} className="ml-6 mt-2" />
                        </>
                    )}
                    {formType === 'trust' && currentDistributionType === 'Terms Specified' && (
                        <RadioGroupField label="Lapse Provisions At Death of Beneficiary (For Terms Specified)" name={`${fieldArrayName}.terms_lapse_provision`} control={control} errors={errors} layout="vertical" options={TERMS_LAPSE_PROVISION_OPTIONS} className="mt-3 pt-3 border-t"/>
                    )}
                </div>
                <TextareaField label="Notes for this Specific Gift" name={`${fieldArrayName}.notes`} control={control} errors={errors} rows={2} placeholder="Any specific instructions or details..." className="mt-4" />
            </CardContent>
        </Card>
    );
};


export const SpecificGiftsFields = ({ control, errors, watch, formType = 'trust', fieldArrayNamePrefix = "individual_gifts", distributionTypeOptions = DISTRIBUTION_TYPE_OPTIONS }) => {
    const { fields, append, remove } = useFieldArray({ control, name: fieldArrayNamePrefix });

    const defaultTrustGift = {
        name: "", timing: "Death of Both Trustors", gift_kind: "Cash", description: "", expense_bearer: "Trust/Estate Bears Expenses", tax_payer: "Estate",
        distribution_type: distributionTypeOptions[0]?.value || "Standard Free of Trust",
        lapse_provision_type: "Per Stirpes",
        terms_income_option: 'HEMS',
        terms_principal_option: 'HEMS Only',
        gst_lapse_provision: 'Per Stirpes',
        sentry_invest_trustee_option: 'Specific Beneficiary',
        beneficiary_trustee_option: 'Same as then Serving Successor',
        notes: ""
    };

    const defaultWillGift = {
        name: "",
        description: "",
        expense_bearer: "Trust/Estate Bears Expenses",
        tax_payer: "Estate",
        lapse_provision_type: "Per Stirpes",
        notes: ""
    };

    const handleAppend = () => {
        if (formType === 'will') {
            append(defaultWillGift);
        } else {
            append(defaultTrustGift);
        }
    };


    return (
        <div className="mt-4 space-y-4">
            <h4 className="text-lg font-semibold mb-3 text-foreground">Individual Gift Details</h4>
            {fields.map((item, index) => (
                <SpecificGiftItem
                    key={item.id}
                    control={control}
                    errors={errors}
                    watch={watch}
                    index={index}
                    remove={() => remove(index)}
                    fieldArrayNamePrefix={fieldArrayNamePrefix}
                    formType={formType}
                    distributionTypeOptions={distributionTypeOptions}
                />
            ))}
            <Button
                type="button"
                variant="outline"
                onClick={handleAppend}
                className="mt-2"
            >
                <PlusCircle className="w-4 h-4 mr-2" /> Add Another Specific Gift
            </Button>
        </div>
    );
};

// --- Children Fields ---
export const ChildrenFields = ({ control, errors, person1Label, person2Label }) => {
    const { fields, append, remove } = useFieldArray({ control, name: "children" });

    const childOfOptions = (person2Label && person1Label) ? [
        { value: 'Both', label: 'Both' },
        { value: person1Label, label: person1Label },
        { value: person2Label, label: person2Label },
    ] : [];

    return (
        <div className="space-y-4">
            {fields.map((item, index) => (
                <Card key={item.id} className="p-4 border-secondary">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b">
                        <h5 className="font-semibold text-foreground">Child {index + 1}</h5>
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-destructive"><Trash2 className="w-4 h-4 mr-1" /> Remove Child</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Full Legal Name" name={`children.${index}.name`} control={control} errors={errors} required />
                        <InputField label="Date of Birth" name={`children.${index}.dob`} type="date" control={control} errors={errors} />
                        <RadioGroupField label="Gender" name={`children.${index}.gender`} options={GENDER_OPTIONS} control={control} errors={errors} layout="vertical" />
                        <SelectField label="Relationship to Trustor(s)" name={`children.${index}.relationship`} options={CHILD_RELATIONSHIP_OPTIONS} control={control} errors={errors} />
                        {person2Label && childOfOptions.length > 0 && (
                            <RadioGroupField label="Child of" name={`children.${index}.child_of`} options={childOfOptions} control={control} errors={errors} layout="vertical" required/>
                        )}
                        <InputField label="Address (Optional)" name={`children.${index}.address`} control={control} errors={errors} className="md:col-span-2"/>
                        <InputField label="Phone Number (Optional)" name={`children.${index}.phone`} control={control} errors={errors} type="tel" />
                        <InputField label="Email Address (Optional)" name={`children.${index}.email`} control={control} errors={errors} type="email" />
                    </div>
                </Card>
            ))}
            <Button type="button" variant="outline" onClick={() => append({ name: "", dob: "", gender: "Prefer not to say", relationship: "Biological", address: "", phone: "", email: "", child_of: (person2Label && person1Label) ? "Both" : undefined })}><PlusCircle className="w-4 h-4 mr-2" /> Add Child</Button>
        </div>
    );
};

// --- Deceased Children Fields ---
export const DeceasedChildrenFields = ({ control, errors }) => {
    const { fields, append, remove } = useFieldArray({ control, name: "deceased_children" });
    return (
        <div className="space-y-4">
            {fields.map((item, index) => (
                <Card key={item.id} className="p-4 border-secondary">
                     <div className="flex justify-between items-center mb-3 pb-2 border-b">
                        <h5 className="font-semibold text-foreground">Deceased Child {index + 1}</h5>
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-destructive"><Trash2 className="w-4 h-4 mr-1" /> Remove</Button>
                    </div>
                    <InputField label="Full Legal Name of Deceased Child" name={`deceased_children.${index}.name`} control={control} errors={errors} required />
                    <InputField label="Date of Death (Approximate if unknown)" name={`deceased_children.${index}.dod`} type="date" control={control} errors={errors} />
                    <RadioGroupField label="Did this child leave surviving issue (descendants)?" name={`deceased_children.${index}.left_issue`} options={YES_NO_OPTIONS} control={control} errors={errors} required />
                    <TextareaField label="Names of their surviving issue (if any)" name={`deceased_children.${index}.issue_names`} control={control} errors={errors} rows={2} placeholder="List names, DOBs if known" />
                </Card>
            ))}
            <Button type="button" variant="outline" onClick={() => append({ name: "", dod: "", left_issue: "No", issue_names: "" })}><PlusCircle className="w-4 h-4 mr-2" /> Add Deceased Child</Button>
        </div>
    );
};

// --- Disinherited Children Fields ---
export const DisinheritedChildrenFields = ({ control, errors }) => {
    const { fields, append, remove } = useFieldArray({ control, name: "disinherited_children" });
    return (
        <div className="space-y-4">
            {fields.map((item, index) => (
                <Card key={item.id} className="p-4 border-destructive/30">
                     <div className="flex justify-between items-center mb-3 pb-2 border-b">
                        <h5 className="font-semibold text-foreground">Disinherited Individual {index + 1}</h5>
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-destructive"><Trash2 className="w-4 h-4 mr-1" /> Remove</Button>
                    </div>
                    <InputField label="Full Legal Name of Disinherited Individual" name={`disinherited_children.${index}.name`} control={control} errors={errors} required />
                    <TextareaField label="Reason for Disinheritance (Optional, for attorney reference)" name={`disinherited_children.${index}.reason`} control={control} errors={errors} rows={2} />
                     <RadioGroupField
                        label="Disinherit Their Descendants as Well?"
                        name={`disinherited_children.${index}.disinherit_descendants`}
                        options={YES_NO_OPTIONS}
                        control={control}
                        errors={errors}
                        layout="vertical"
                        description="If 'Yes', this individual\'s children (and their descendants) will also be disinherited from this line."
                    />
                </Card>
            ))}
            <Button type="button" variant="outline" onClick={() => append({ name: "", reason: "", disinherit_descendants: "No" })}><PlusCircle className="w-4 h-4 mr-2" /> Add Disinherited Individual</Button>
        </div>
    );
};


// --- Successor Trustee Set Fields ---
const CoTrusteeItem = ({ control, errors, primaryTrusteeIndex, coTrusteeIndex, removeCoTrustee, fieldArrayNamePrefix }) => {
    const coTrusteeItemName = `${fieldArrayNamePrefix}.${primaryTrusteeIndex}.co_trustees.${coTrusteeIndex}`;
    return (
        <Card className="mb-3 p-3 border-muted/70 bg-muted/20">
            <div className="flex justify-between items-center mb-2 pb-1 border-b border-muted/50">
                <h6 className="text-sm font-medium text-foreground">Co-Successor Trustee {coTrusteeIndex + 1}</h6>
                <Button type="button" variant="ghost" size="icon" onClick={removeCoTrustee} className="text-destructive/80 hover:bg-destructive/10 h-7 w-7">
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </div>
            <InputField label="Full Name / Corporate Name" name={`${coTrusteeItemName}.name`} control={control} errors={errors} required />
            <SelectField label="Role Type" name={`${coTrusteeItemName}.role_type`} options={SUCCESSOR_TRUSTEE_ROLE_OPTIONS} control={control} errors={errors} />
            <SelectField label="Relationship to Trustor(s)" name={`${coTrusteeItemName}.relationship`} options={RELATIONSHIP_OPTIONS} control={control} errors={errors} />
        </Card>
    );
};

const SuccessorTrusteeItem = ({ control, errors, index, remove, fieldArrayNamePrefix }) => {
    const trusteeFieldName = `${fieldArrayNamePrefix}.${index}`;
    const watchHasCoTrustee = useWatch({ control, name: `${trusteeFieldName}.has_co_trustee` });

    const { fields: coTrusteeFields, append: appendCoTrustee, remove: removeCoTrustee } = useFieldArray({
        control,
        name: `${trusteeFieldName}.co_trustees`
    });

    return (
        <Card className="mb-4 p-4 border-primary/20">
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
                <h6 className="font-medium text-foreground">Successor Trustee {index + 1}</h6>
                 <Button type="button" variant="ghost" size="icon" onClick={remove} className="text-destructive hover:bg-destructive/10 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Full Name / Corporate Name" name={`${trusteeFieldName}.name`} control={control} errors={errors} required />
                <SelectField label="Role Type" name={`${trusteeFieldName}.role_type`} options={SUCCESSOR_TRUSTEE_ROLE_OPTIONS} control={control} errors={errors} />
                <SelectField label="Relationship to Trustor(s)" name={`${trusteeFieldName}.relationship`} options={RELATIONSHIP_OPTIONS} control={control} errors={errors} />
                <InputField label="Address (Optional)" name={`${trusteeFieldName}.address`} control={control} errors={errors} />
                <InputField label="Phone (Optional)" name={`${trusteeFieldName}.phone`} control={control} errors={errors} type="tel" />
                <InputField label="Email (Optional)" name={`${trusteeFieldName}.email`} control={control} errors={errors} type="email" />
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
                <RadioGroupField
                    label="Appoint Co-Successor Trustee(s) with this Trustee?"
                    name={`${trusteeFieldName}.has_co_trustee`}
                    options={YES_NO_OPTIONS}
                    control={control}
                    errors={errors}
                    layout="horizontal"
                />
                {watchHasCoTrustee === 'Yes' && (
                    <div className="ml-6 mt-3 space-y-3 p-3 border border-muted/50 rounded-md bg-muted/20">
                        {coTrusteeFields.map((item, coIndex) => (
                            <CoTrusteeItem
                                key={item.id}
                                control={control}
                                errors={errors}
                                primaryTrusteeIndex={index}
                                coTrusteeIndex={coIndex}
                                removeCoTrustee={() => removeCoTrustee(coIndex)}
                                fieldArrayNamePrefix={fieldArrayNamePrefix}
                            />
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendCoTrustee({ name: "", role_type: "Individual", relationship: "" })}
                            className="mt-2"
                        >
                            <PlusCircle className="w-4 h-4 mr-2" /> Add Co-Successor Trustee
                        </Button>

                        {coTrusteeFields.length > 0 && (
                             <RadioGroupField
                                label="How should this Primary Successor Trustee and their Co-Successor Trustee(s) act together?"
                                name={`${trusteeFieldName}.co_trustees_acting_option`}
                                options={SUCCESSOR_TRUSTEE_ACTING_OPTIONS}
                                control={control}
                                errors={errors}
                                layout="vertical"
                                required
                                className="mt-3 pt-3 border-t border-muted/70"
                            />
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

export const SuccessorTrusteeSetFields = ({ control, errors, watch, fieldArrayNamePrefix, title, successorTrusteesSource }) => {
    const { fields, append, remove } = useFieldArray({ control, name: fieldArrayNamePrefix });
    const readOnlyAllNames = successorTrusteesSource === 'Same as Financial Agents';

    return (
        <div className="mt-4">
            <h5 className="text-md font-semibold mb-3 text-primary">{title}</h5>
            {fields.length > 0 ? (
                fields.map((item, index) => (
                    <SuccessorTrusteeItem
                        key={item.id}
                        control={control}
                        errors={errors}
                        index={index}
                        remove={() => remove(index)}
                        fieldArrayNamePrefix={fieldArrayNamePrefix}
                    />
                ))
            ) : (
                readOnlyAllNames && ( // Only show this message if fields are empty AND it's read-only mode
                    <div className="p-4 text-sm text-muted-foreground bg-muted/30 rounded-md border border-border">
                        Financial agents nominated in the 'Guardians & Fiduciaries' tab will serve as successor trustees for this set.
                        To specify different individuals, please select 'Specify Different Successor Trustees' above.
                    </div>
                )
            )}
            {!readOnlyAllNames && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({
                        name: "", role_type: "Individual", relationship: "", address: "", phone: "", email: "",
                        has_co_trustee: "No",
                        co_trustees: [],
                        co_trustees_acting_option: "Jointly"
                     })}
                    className="mt-2"
                >
                    <PlusCircle className="w-4 h-4 mr-2" /> Add Another Successor Trustee
                </Button>
            )}
        </div>
    );
};


// --- Residual Beneficiary Term Item (Similar to SpecificGiftItem) ---
export const ResidualBeneficiaryTermItem = ({ control, errors, watch, index, remove: removeItem, fieldArrayNamePrefix = "residual_beneficiaries", formType = "trust", distributionTypeOptions = DISTRIBUTION_TYPE_OPTIONS }) => {
    const fieldArrayName = `${fieldArrayNamePrefix}.${index}`; 

    const watchDistributionType = watch(`${fieldArrayName}.distribution_type`);
    const watchTermsSpecifiedPrincipal = watch(`${fieldArrayName}.terms_principal_option`);
    const watchLapseProvisionType = watch(`${fieldArrayName}.lapse_provision_type`);
    const watchGstLapseProvision = watch(`${fieldArrayName}.gst_lapse_provision`);
    const watchSentryInvestTrusteeOption = watch(`${fieldArrayName}.sentry_invest_trustee_option`);
    const watchBeneficiaryTrusteeOption = watch(`${fieldArrayName}.beneficiary_trustee_option`);

    const currentDistributionType = watchDistributionType || 'Standard Free of Trust';
    const lapseOptions = formType === 'will' ? WILL_LAPSE_PROVISION_OPTIONS : LAPSE_PROVISION_OPTIONS;


    return (
        <Card className="mb-4 border-pink-300/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-pink-50/50 rounded-t-lg">
                <CardTitle className="text-lg text-pink-700">Residual Beneficiary Share {index + 1}</CardTitle>
                 <Button type="button" variant="ghost" size="sm" onClick={removeItem} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-1" /> Remove Share
                </Button>
            </CardHeader>
            <CardContent className="pt-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                    <InputField control={control} errors={errors} label="Beneficiary Name / Group Description" name={`${fieldArrayName}.name`} placeholder="e.g., Child A, or 'My Children Equally'" required />
                    <InputField control={control} errors={errors} label="Percentage Share of Residue" name={`${fieldArrayName}.percentage_share`} type="text" placeholder="e.g., 50% or 1/3" required/>
                 </div>
                {formType === 'trust' && (
                    <>
                        <div className="mt-4 pt-4 border-t border-border">
                            <h6 className="text-md font-semibold text-foreground mb-2">Distribution Options for this Share</h6>
                            <RadioGroupField name={`${fieldArrayName}.distribution_type`} control={control} errors={errors} required layout="vertical" options={distributionTypeOptions} />
                        </div>

                        {(currentDistributionType === 'Access/Divorce Protection' || currentDistributionType === 'Special Needs' || currentDistributionType === 'Sentry w/ Investment Trustee' || currentDistributionType === 'Sentry w/o Investment Trustee') && (
                            <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20">
                                {/* Lapse Provisions specific to these simpler trust types might be handled by the generic one below, 
                                or you might want a simplified version here if needed.
                                For now, relying on the main lapse provision section. */}
                            </div>
                        )}
                        {currentDistributionType === 'Terms Specified' && (
                            <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-3">
                                <h6 className="text-sm font-medium text-muted-foreground mb-2 uppercase">Terms Specified Details</h6>
                                <RadioGroupField label="Income Distribution Standard" name={`${fieldArrayName}.terms_income_option`} control={control} errors={errors} layout="vertical" options={TERMS_INCOME_OPTIONS} />
                                <RadioGroupField label="Principal Distribution Standard" name={`${fieldArrayName}.terms_principal_option`} control={control} errors={errors} layout="vertical" options={TERMS_PRINCIPAL_OPTIONS} />
                                {(watchTermsSpecifiedPrincipal?.includes('Age') || watchTermsSpecifiedPrincipal?.includes('Stagger')) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 ml-6">
                                        <InputField label="Age 1 / Amount 1" name={`${fieldArrayName}.terms_age1`} type="text" control={control} errors={errors} placeholder="e.g., 25 or 1/3" className="mb-0" />
                                        {(watchTermsSpecifiedPrincipal?.includes('Stagger 2') || watchTermsSpecifiedPrincipal?.includes('Stagger 3')) && <InputField label="Age 2 / Amount 2" name={`${fieldArrayName}.terms_age2`} type="text" control={control} errors={errors} placeholder="e.g., 30 or 1/2" className="mb-0" />}
                                        {watchTermsSpecifiedPrincipal?.includes('Stagger 3') && <InputField label="Age 3 / Amount 3" name={`${fieldArrayName}.terms_age3`} type="text" control={control} errors={errors} placeholder="e.g., 35 or Remainder" className="mb-0" />}
                                    </div>
                                )}
                                <RadioGroupField label="Lapse Provisions At Death of Beneficiary" name={`${fieldArrayName}.terms_lapse_provision`} control={control} errors={errors} layout="vertical" options={TERMS_LAPSE_PROVISION_OPTIONS} />
                            </div>
                        )}
                        {(currentDistributionType === 'GST Income' || currentDistributionType === 'GST TRU' || currentDistributionType === 'GST Discretionary') && (
                            <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-3">
                                <h6 className="text-sm font-medium text-muted-foreground mb-2 uppercase">GST Details</h6>
                                {currentDistributionType === 'GST TRU' && <InputField label="TRU Distribution Rate (%)" name={`${fieldArrayName}.gst_tru_rate`} type="number" control={control} errors={errors} />}
                                <RadioGroupField label="Lapse Provisions for GST Trust" name={`${fieldArrayName}.gst_lapse_provision`} control={control} errors={errors} layout="vertical" options={GST_LAPSE_PROVISION_OPTIONS} />
                                {watchGstLapseProvision === 'Specific Beneficiary Descendants at Spec Age' && <InputField label="Specified Age for Descendants" name={`${fieldArrayName}.gst_lapse_spec_age`} type="number" control={control} errors={errors} className="ml-6" />}
                            </div>
                        )}
                        {currentDistributionType === 'Sentry w/ Investment Trustee' && (
                            <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20 space-y-3">
                                <h6 className="text-sm font-medium text-muted-foreground mb-2 uppercase">Sentry Trust w/ Investment Trustee</h6>
                                <RadioGroupField label="Investment Trustee Options" name={`${fieldArrayName}.sentry_invest_trustee_option`} control={control} errors={errors} layout="vertical" options={SENTRY_INVEST_TRUSTEE_OPTIONS} />
                                {watchSentryInvestTrusteeOption === 'Other' && <InputField label="Other Investment Trustee Name" name={`${fieldArrayName}.sentry_invest_trustee_other_name`} control={control} errors={errors} placeholder="Full Name or Corporate Name" className="ml-6" />}
                                {watchSentryInvestTrusteeOption === 'Specific Beneficiary' && <InputField label="Specific Beneficiary as Investment Trustee" name={`${fieldArrayName}.sentry_invest_trustee_beneficiary_name`} control={control} errors={errors} placeholder="Full Name of Beneficiary" className="ml-6" />}
                            </div>
                        )}
                        {currentDistributionType !== 'Standard Free of Trust' && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <h6 className="text-md font-semibold text-foreground mb-2">Beneficiary Trustee Option for this Share</h6>
                                <RadioGroupField name={`${fieldArrayName}.beneficiary_trustee_option`} control={control} errors={errors} layout="vertical" options={BENEFICIARY_TRUSTEE_OPTIONS} />
                                {watchBeneficiaryTrusteeOption === '3rd Party' && (
                                    <div className="ml-6 mt-2 space-y-2 border p-3 rounded-md bg-muted/30">
                                        <InputField label="1. 3rd Party Trustee Name" name={`${fieldArrayName}.beneficiary_trustee_3rd_party1`} control={control} errors={errors} />
                                        <InputField label="2. 3rd Party Trustee Name (Optional)" name={`${fieldArrayName}.beneficiary_trustee_3rd_party2`} control={control} errors={errors} />
                                        <RadioGroupField label="If two 3rd party trustees, how should they act?" name={`${fieldArrayName}.beneficiary_trustee_3rd_party_acting`} options={SUCCESSOR_TRUSTEE_ACTING_OPTIONS} control={control} errors={errors} layout="vertical"/>
                                    </div>
                                )}
                                {watchBeneficiaryTrusteeOption === 'Beneficiary and 3rd Party' && (
                                    <div className="ml-6 mt-2 space-y-2 border p-3 rounded-md bg-muted/30">
                                        <InputField label="3rd Party Co-Trustee Name" name={`${fieldArrayName}.beneficiary_trustee_ben_3rd_party_name`} control={control} errors={errors} />
                                        <RadioGroupField label="How should Beneficiary and 3rd Party Co-Trustees act?" name={`${fieldArrayName}.beneficiary_trustee_ben_3rd_party_acting`} options={SUCCESSOR_TRUSTEE_ACTING_OPTIONS} control={control} errors={errors} layout="vertical"/>
                                    </div>
                                )}
                                {watchBeneficiaryTrusteeOption === 'Beneficiary at Named Age' && (
                                    <InputField label="Age Beneficiary Becomes Sole Trustee" name={`${fieldArrayName}.beneficiary_trustee_ben_age`} type="number" control={control} errors={errors} className="ml-6" />
                                )}
                            </div>
                        )}
                         <FormSectionCard title="Incentive Clauses for this Share" className="mt-4" borderClassName="border-primary/20">
                            <CheckboxGroupField label="Select Clauses (Optional):" name={`${fieldArrayName}.incentive_clauses`} control={control} errors={errors} options={INCENTIVE_CLAUSE_OPTIONS} />
                            <InputField control={control} errors={errors} label="Other Clause:" name={`${fieldArrayName}.incentive_clauses_other`} placeholder="Specify other incentive" />
                        </FormSectionCard>
                    </>
                )}
                {/* Common Lapse Provisions for the share */}
                <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20">
                    <h6 className="text-sm font-medium text-muted-foreground mb-2 uppercase">Lapse Provisions for this Share</h6>
                    <RadioGroupField name={`${fieldArrayName}.lapse_provision_type`} control={control} errors={errors} layout="vertical" options={lapseOptions} required/>
                    {watchLapseProvisionType === 'Named Beneficiaries Immediate' && (
                         <>
                            {formType === 'trust' && (
                                <RadioGroupField name={`${fieldArrayName}.lapse_named_timing`} control={control} errors={errors} layout="vertical" options={NAMED_LAPSE_TIMING_OPTIONS} className="ml-6" />
                            )}
                            <TextareaField label="Named Contingent Beneficiaries" name={`${fieldArrayName}.lapse_named_beneficiaries_list`} control={control} errors={errors} placeholder="List names, relationships, and shares" rows={2} className="ml-6 mt-2" />
                        </>
                    )}
                </div>
                <TextareaField label="Notes for this Residual Share" name={`${fieldArrayName}.notes`} control={control} errors={errors} rows={2} placeholder="Any specific instructions or details for this share..." className="mt-4" />
            </CardContent>
        </Card>
    );
};

// --- Residual Beneficiary Terms Fields (Array of Items) ---
export const ResidualBeneficiaryTermsFields = ({ control, errors, watch, fieldArrayNamePrefix = "residual_beneficiaries", formType = "trust", distributionTypeOptions = DISTRIBUTION_TYPE_OPTIONS }) => {
    const { fields, append, remove } = useFieldArray({ control, name: fieldArrayNamePrefix });

    const defaultWillShare = {
        name: "",
        percentage_share: "",
        lapse_provision_type: "Per Stirpes",
        notes: ""
    };

    const defaultTrustShare = {
        name: "",
        percentage_share: "",
        distribution_type: distributionTypeOptions[0]?.value || "Standard Free of Trust",
        lapse_provision_type: "Per Stirpes",
        terms_income_option: "HEMS",
        terms_principal_option: "HEMS Only",
        terms_age1: "", terms_age2: "", terms_age3: "",
        terms_lapse_provision: "Per Stirpes to Beneficiary\'s Issue",
        gst_tru_rate: "",
        gst_lapse_provision: "Per Stirpes",
        gst_lapse_spec_age: "",
        sentry_invest_trustee_option: "Specific Beneficiary",
        sentry_invest_trustee_other_name: "",
        sentry_invest_trustee_beneficiary_name: "",
        beneficiary_trustee_option: "Same as then Serving Successor",
        beneficiary_trustee_3rd_party1: "",
        beneficiary_trustee_3rd_party2: "",
        beneficiary_trustee_3rd_party_acting: "Jointly",
        beneficiary_trustee_ben_3rd_party_name: "",
        beneficiary_trustee_ben_3rd_party_acting: "Jointly",
        beneficiary_trustee_ben_age: "",
        incentive_clauses: [],
        incentive_clauses_other: "",
        notes: ""
    };
    
    const handleAppendShare = () => {
        if (formType === 'will') {
            append(defaultWillShare);
        } else {
            append(defaultTrustShare);
        }
    };

    return (
        <div className="mt-4 space-y-4">
            <h4 className="text-lg font-semibold mb-3 text-foreground">Residual Beneficiary Shares</h4>
            {fields.map((item, index) => (
                <ResidualBeneficiaryTermItem
                    key={item.id}
                    control={control}
                    errors={errors}
                    watch={watch}
                    index={index}
                    remove={() => remove(index)}
                    fieldArrayNamePrefix={fieldArrayNamePrefix}
                    formType={formType}
                    distributionTypeOptions={distributionTypeOptions}
                />
            ))}
            <Button type="button" variant="outline" onClick={handleAppendShare}>
                <PlusCircle className="w-4 h-4 mr-2" /> Add Residual Beneficiary Share
            </Button>
        </div>
    );
};

// --- Ultimate Beneficiary Fields ---
const UltimateBeneficiaryItem = ({ control, errors, index, remove, fieldArrayName }) => {
    const itemNamePrefix = `${fieldArrayName}.${index}`;
    const watchType = useWatch({ control, name: `${itemNamePrefix}.type` });

    return (
        <Card className="mb-4 p-4 border-red-300/50">
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
                <h6 className="font-medium text-foreground">Ultimate Beneficiary {index + 1}</h6>
                 <Button type="button" variant="ghost" size="icon" onClick={remove} className="text-destructive hover:bg-destructive/10 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
            </div>
            <RadioGroupField label="Type" name={`${itemNamePrefix}.type`} options={ULTIMATE_BENEFICIARY_TYPE_OPTIONS} control={control} errors={errors} layout="horizontal" />
            <InputField label="Name" name={`${itemNamePrefix}.name`} control={control} errors={errors} required placeholder={watchType === 'Charity' ? "Charity Name" : "Individual's Full Name"} />
            {watchType === 'Charity' && (
                <>
                    <InputField label="Charity Tax ID (Optional)" name={`${itemNamePrefix}.charity_tax_id`} control={control} errors={errors} />
                    <TextareaField label="Charity Address & Purpose (Optional)" name={`${itemNamePrefix}.charity_details`} control={control} errors={errors} rows={2} placeholder="Address, and any specific purpose for the gift"/>
                </>
            )}
            {watchType === 'Individual' && (
                 <SelectField label="Relationship to Trustor(s) (Optional)" name={`${itemNamePrefix}.individual_relationship`} options={RELATIONSHIP_OPTIONS} control={control} errors={errors} />
            )}
             <InputField label="Percentage Share of Ultimate Distribution" name={`${itemNamePrefix}.percentage_share`} type="text" control={control} errors={errors} placeholder="e.g., 50% or 1/3" required/>
        </Card>
    );
};

export const UltimateBeneficiaryFields = ({ control, errors, fieldArrayName, title }) => {
    const { fields, append, remove } = useFieldArray({ control, name: fieldArrayName });
    return (
        <div className="mt-4">
            <h5 className="text-md font-semibold mb-3 text-red-700">{title}</h5>
            {fields.map((item, index) => (
                <UltimateBeneficiaryItem key={item.id} control={control} errors={errors} index={index} remove={() => remove(index)} fieldArrayName={fieldArrayName} />
            ))}
            <Button type="button" variant="outline" onClick={() => append({ type: "Charity", name: "", percentage_share: "", charity_tax_id: "", charity_details: "" })}>
                <PlusCircle className="w-4 h-4 mr-2" /> Add Ultimate Beneficiary
            </Button>
        </div>
    );
};

// --- Charity Distribution Fields ---
const CharityDistributionItem = ({ control, errors, index, remove, fieldArrayNamePrefix = "charity_distributions", formType = 'trust' }) => {
    const fieldNamePrefix = `${fieldArrayNamePrefix}.${index}`;
    const giftTimingOptions = formType === 'will' ? WILL_GIFT_TIMING_OPTIONS : GIFT_TIMING_OPTIONS;
    return (
         <Card className="mb-4 p-4 border-emerald-300/50">
             <div className="flex justify-between items-center mb-3 pb-2 border-b">
                <h6 className="font-medium text-foreground">Charitable Gift {index + 1}</h6>
                <Button type="button" variant="ghost" size="icon" onClick={remove} className="text-destructive hover:bg-destructive/10 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
            </div>
            <InputField label="Charity Name" name={`${fieldNamePrefix}.name`} control={control} errors={errors} required />
            <InputField label="Amount or Percentage" name={`${fieldNamePrefix}.amount_or_percentage`} control={control} errors={errors} required placeholder="e.g., $10,000 or 5%" />
            <TextareaField label="Purpose/Restriction (Optional)" name={`${fieldNamePrefix}.purpose`} control={control} errors={errors} rows={2} placeholder="e.g., For general charitable purposes, or specific fund" />
            <RadioGroupField label="Timing of Gift" name={`${fieldNamePrefix}.timing`} options={giftTimingOptions} control={control} errors={errors} required layout="vertical" />
        </Card>
    );
};

export const CharityDistributionFields = ({ control, errors, watch, fieldArrayNamePrefix = "charity_distributions", formType = 'trust' }) => {
    const { fields, append, remove } = useFieldArray({ control, name: fieldArrayNamePrefix });
    return (
        <div className="mt-4 space-y-4">
             <h4 className="text-lg font-semibold mb-3 text-foreground">Charity Gift Details</h4>
            {fields.map((item, index) => (
                <CharityDistributionItem 
                    key={item.id} 
                    control={control} 
                    errors={errors} 
                    index={index} 
                    remove={() => remove(index)} 
                    fieldArrayNamePrefix={fieldArrayNamePrefix}
                    formType={formType}
                />
            ))}
            <Button type="button" variant="outline" onClick={() => append({ 
                name: "", 
                amount_or_percentage: "", 
                purpose: "", 
                timing: formType === 'will' ? "At Testator Death" : "Death of Both Trustors" 
            })}>
                <PlusCircle className="w-4 h-4 mr-2" /> Add Charitable Gift
            </Button>
        </div>
    );
};
