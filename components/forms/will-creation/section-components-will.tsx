// @ts-nocheck
// TODO: Remove ts-nocheck and fix types

"use client";

import React, { useEffect, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputField, RadioGroupField, SelectField, TextareaField, CheckboxField } from '@/components/forms/trust-creation/field-components';
import { YES_NO_OPTIONS, RELATIONSHIP_OPTIONS, PERSONAL_REPRESENTATIVE_ACTING_OPTIONS } from '@/components/forms/trust-creation/constants';
import { PlusCircle, Trash2 } from 'lucide-react';

const PersonalRepresentativeItem = ({ control, errors, index, remove, fieldArrayNamePrefix, readOnlyName = false }) => {
    const itemFieldName = `${fieldArrayNamePrefix}.${index}`;
    const watchHasCoPersonalRepresentative = useWatch({ control, name: `${itemFieldName}.has_co_personal_representative` });

    return (
        <Card className="mb-4 p-4 border-primary/20">
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
                <h6 className="font-medium text-foreground">Personal Representative {index + 1}</h6>
                {!readOnlyName && ( // Only allow removal if not read-only (i.e., 'Specify Below' or not the first derived)
                    <Button type="button" variant="ghost" size="icon" onClick={remove} className="text-destructive hover:bg-destructive/10 h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                    label="Full Name / Corporate Name"
                    name={`${itemFieldName}.name`}
                    control={control}
                    errors={errors}
                    required
                    readOnly={readOnlyName}
                />
                <SelectField
                    label="Relationship to Testator"
                    name={`${itemFieldName}.relationship`}
                    options={RELATIONSHIP_OPTIONS}
                    control={control}
                    errors={errors}
                    disabled={readOnlyName}
                />
                <InputField
                    label="Address (Optional)"
                    name={`${itemFieldName}.address`}
                    control={control}
                    errors={errors}
                    disabled={readOnlyName}
                    className="md:col-span-2"
                />
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
                <RadioGroupField
                    label="Appoint a Co-Personal Representative with this Personal Representative?"
                    name={`${itemFieldName}.has_co_personal_representative`}
                    options={YES_NO_OPTIONS}
                    control={control}
                    errors={errors}
                    layout="horizontal"
                    disabled={readOnlyName} // If PR is derived, co-PR choice might also be restricted or follow a pattern
                />
                {watchHasCoPersonalRepresentative === 'Yes' && ( 
                    <div className="ml-6 mt-3 space-y-3 p-3 border border-muted/50 rounded-md bg-muted/20">
                        <InputField
                            label="Co-Personal Representative Full Name / Corporate Name"
                            name={`${itemFieldName}.co_personal_representative_name`}
                            control={control}
                            errors={errors}
                            required={watchHasCoPersonalRepresentative === 'Yes'}
                            placeholder="Co-Personal Representative Name"
                        />
                         <SelectField
                            label="Co-Personal Representative Relationship to Testator(s)"
                            name={`${itemFieldName}.co_personal_representative_relationship`}
                            options={RELATIONSHIP_OPTIONS}
                            control={control}
                            errors={errors}
                        />
                    </div>
                )}
            </div>
            <TextareaField
                label="Notes (Optional)"
                name={`${itemFieldName}.notes`}
                control={control}
                errors={errors}
                rows={2}
                placeholder="Any specific notes about this Personal Representative..."
                className="mt-3"
                disabled={readOnlyName}
            />
        </Card>
    );
};

export const PersonalRepresentativeSetFields = ({ control, errors, fieldArrayNamePrefix, title, personalRepresentativeSourcePath, actingOptionPath, isJointPath }) => {
    const { fields, append, remove } = useFieldArray({ control, name: fieldArrayNamePrefix });
    const { setValue, getValues } = useFormContext();

    const personalRepresentativeSource = useWatch({ control, name: personalRepresentativeSourcePath });
    const isJointAppointment = useWatch({ control, name: isJointPath }) === 'Yes';
    
    const defaultPRValue = {
        name: "",
        relationship: "", address: "", notes: "",
        has_co_personal_representative: 'No',
        co_personal_representative_name: "",
        co_personal_representative_relationship: ""
    };

     useEffect(() => {
        const currentFields = getValues(fieldArrayNamePrefix) || []; // Get current field array state
        if (!personalRepresentativeSourcePath || !getValues(personalRepresentativeSourcePath)) {
             // If source path is not defined or no value for it, ensure at least one empty field if list is currently empty.
            if (currentFields.length === 0) {
                setValue(fieldArrayNamePrefix, [{ ...defaultPRValue }]);
            }
            return;
        }

        const currentSource = getValues(personalRepresentativeSourcePath);
        
        if (currentSource && currentSource !== 'Specify Below') {
            let sourceName = '';
            let sourceRelationship = '';
            
            if (currentSource.startsWith('Spouse_Of_')) {
                const testatorKey = currentSource.split('_Of_')[1]; 
                const t1Name = getValues('trustor1_name') || 'Testator 1';
                const t2Name = getValues('trustor2_name') || 'Testator 2';

                if (fieldArrayNamePrefix.startsWith('t1_') || title?.includes(t1Name)) {
                    sourceName = t2Name; 
                } else if (fieldArrayNamePrefix.startsWith('t2_') || title?.includes(t2Name)) {
                    sourceName = t1Name;
                } else { 
                    sourceName = t2Name; // Default to T2 as spouse if shared and T1 is primary context
                }
                sourceRelationship = 'Spouse';
            } else if (currentSource.endsWith('_FA1')) {
                const testatorKey = currentSource.split('_FA1')[0];
                sourceName = getValues(testatorKey === 'Testator1' ? 'trustor1_fin_agent1_name' : 'trustor2_fin_agent1_name');
            } else if (currentSource.endsWith('_FA2')) {
                const testatorKey = currentSource.split('_FA2')[0];
                sourceName = getValues(testatorKey === 'Testator1' ? 'trustor1_fin_agent2_name' : 'trustor2_fin_agent2_name');
            } else if (currentSource.endsWith('_FA3')) {
                const testatorKey = currentSource.split('_FA3')[0];
                sourceName = getValues(testatorKey === 'Testator1' ? 'trustor1_fin_agent3_name' : 'trustor2_fin_agent3_name');
            }

            const newFieldsArray = [{
                ...defaultPRValue,
                name: sourceName || "",
                relationship: sourceRelationship || "",
            }];
            
            if (isJointAppointment) {
                 newFieldsArray.push({...defaultPRValue, name: "", relationship: ""}); // Add a blank second for joint
            }
            
            let needsUpdate = currentFields.length !== newFieldsArray.length;
            if (!needsUpdate) {
                for (let i = 0; i < currentFields.length; i++) {
                    if (currentFields[i].name !== newFieldsArray[i]?.name || currentFields[i].relationship !== newFieldsArray[i]?.relationship) {
                        needsUpdate = true;
                        break;
                    }
                }
            }
            if (needsUpdate) {
                setValue(fieldArrayNamePrefix, newFieldsArray, { shouldValidate: true });
            }

        } else if (currentSource === 'Specify Below') {
            // When switching to 'Specify Below' or initially
            if (currentFields.length === 0) {
                setValue(fieldArrayNamePrefix, [{ ...defaultPRValue }]);
            } else if (!isJointAppointment && currentFields.length > 1) {
                 // If not joint, but more than 1 field exists, trim to 1.
                 setValue(fieldArrayNamePrefix, [currentFields[0]]);
            } else if (isJointAppointment && currentFields.length === 1) {
                // If joint and only one field, add a second blank one.
                setValue(fieldArrayNamePrefix, [...currentFields, { ...defaultPRValue }]);
            } else if (isJointAppointment && currentFields.length > 2) {
                // If joint and more than 2 fields, trim to 2.
                setValue(fieldArrayNamePrefix, currentFields.slice(0,2));
            }
            // If isJointAppointment and fields.length is 0, the first if (fields.length === 0) handles it.
            // If isJointAppointment and fields.length is 2, it's correct.
        }
    }, [
        personalRepresentativeSource, 
        isJointAppointment, 
        fieldArrayNamePrefix, 
        setValue, 
        getValues, 
        // append and remove are not directly used in this useEffect logic anymore for Specify Below
        // fields.length was removed to prevent loop
        title, 
        // defaultPRValue, // defaultPRValue is stable, defined outside
        personalRepresentativeSourcePath, 
        isJointPath,
        // Critical: Add watched financial agent names if they are used in getValues() for derivation
        // This example assumes getValues() for FA names within effect. For full reactivity, these should be passed or watched.
        // However, removing fields.length is the primary fix for the loop.
        // Stability of getValues' results within one effect run is assumed.
        getValues('trustor1_fin_agent1_name'), 
        getValues('trustor1_fin_agent2_name'),
        getValues('trustor1_fin_agent3_name'),
        getValues('trustor2_fin_agent1_name'),
        getValues('trustor2_fin_agent2_name'),
        getValues('trustor2_fin_agent3_name'),
        getValues('trustor1_name'), 
        getValues('trustor2_name')
    ]);

    const readOnlyConditionForPrimary = personalRepresentativeSourcePath && personalRepresentativeSource !== 'Specify Below';

    return (
        <div className="mt-4">
            <h5 className="text-md font-semibold mb-3 text-primary">{title}</h5>
            {fields.map((item, index) => (
                <PersonalRepresentativeItem
                    key={item.id}
                    control={control}
                    errors={errors}
                    index={index}
                    remove={() => remove(index)}
                    fieldArrayNamePrefix={fieldArrayNamePrefix}
                    readOnlyName={readOnlyConditionForPrimary && index === 0 && !(isJointAppointment && index ===1) } // First is read-only if derived, unless it's the second slot in a joint derived.
                />
            ))}

            {(personalRepresentativeSource === 'Specify Below' && (!isJointAppointment || (isJointAppointment && fields.length < 2))) && (
                 <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => append({...defaultPRValue})} 
                    className="mt-2"
                 >
                    <PlusCircle className="mr-2 h-4 w-4" /> 
                    {isJointAppointment && fields.length === 1 ? "Add Second Joint Personal Representative" : "Add Successor Personal Representative"}
                </Button>
            )}


            {fields.length > 1 && isJointAppointment && actingOptionPath && (
                <RadioGroupField
                    label="How should these Joint Personal Representatives act together?"
                    name={actingOptionPath}
                    options={PERSONAL_REPRESENTATIVE_ACTING_OPTIONS.filter(opt => opt.value !== 'Singly')} 
                    control={control}
                    errors={errors}
                    layout="vertical"
                    className="mt-4 pt-3 border-t"
                />
            )}
        </div>
    );
};
