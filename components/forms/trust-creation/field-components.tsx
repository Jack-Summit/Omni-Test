
"use client";

import React from 'react';
import { Controller, type Control, type FieldErrors, type Path, type UseFormRegister, type FieldValues } from 'react-hook-form';
import { Input, type InputProps } from "@/components/ui/input";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";
import { RadioGroup as ShadRadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select as ShadSelect, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox as ShadCheckbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"; // Assuming these are correctly set up
import { cn } from '@/lib/utils';

interface Option {
  value: string | number;
  label: string;
}

interface CheckboxGroupOption {
  value: string;
  label: string;
}


interface BaseFieldProps<TFieldValues extends FieldValues> {
  label?: string;
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  required?: boolean;
  className?: string;
  description?: string;
}

// InputField using RHF Controller for better integration with ShadCN form components
export const InputField = <TFieldValues extends FieldValues>({
  label, name, control, errors, type = 'text', placeholder, required = false, pattern, className = '', readOnly = false, description, ...props
}: BaseFieldProps<TFieldValues> & InputProps & { pattern?: string, readOnly?: boolean }) => (
  <FormField
    control={control}
    name={name}
    rules={{ required: required ? `${label || 'This field'} is required.` : false, pattern }}
    render={({ field }) => {
      const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const digits = rawValue.replace(/\D/g, ''); // Remove non-digits
    
        let formattedValue = '';
        if (digits.length > 0) {
          formattedValue = digits.substring(0, 3);
        }
        if (digits.length > 3) {
          formattedValue += '-' + digits.substring(3, 6);
        }
        if (digits.length > 6) {
          formattedValue += '-' + digits.substring(6, 10);
        }
        
        field.onChange(formattedValue);
      };

      return (
        <FormItem className={cn("space-y-1", className)}>
          {label && <FormLabel htmlFor={name}>{label}{required && <span className="text-destructive">*</span>}</FormLabel>}
          <FormControl>
            <Input
              id={name}
              type={type} // Original type
              placeholder={placeholder}
              readOnly={readOnly}
              {...field} // Spread RHF field props (value, onChange, onBlur, ref, name)
              {...props} // Spread other native input props
              onChange={type === 'tel' ? handlePhoneChange : field.onChange} // Override onChange for tel
              value={field.value || ''}
              maxLength={type === 'tel' ? 12 : undefined} // Max length for xxx-xxx-xxxx is 12
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      );
    }}
  />
);

// RadioGroup using RHF Controller
export const RadioGroupField = <TFieldValues extends FieldValues>({
  label, name, control, errors, options, required = false, className = '', disabledOptions = [], layout = 'vertical', description
}: BaseFieldProps<TFieldValues> & { options: Option[], disabledOptions?: string[], layout?: 'horizontal' | 'vertical' }) => (
  <FormField
    control={control}
    name={name}
    rules={{ required: required ? `${label || 'This field'} is required.` : false }}
    render={({ field }) => (
      <FormItem className={cn("space-y-1", className)}>
        {label && <FormLabel>{label}{required && <span className="text-destructive">*</span>}</FormLabel>}
        <FormControl>
          <ShadRadioGroup
            onValueChange={field.onChange}
            value={field.value}
            className={cn(layout === 'horizontal' ? 'flex space-x-4' : 'space-y-2')}
          >
            {options.map(option => (
              <FormItem key={option.value} className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroupItem
                    value={option.value.toString()}
                    id={`${name}-${option.value}`}
                    disabled={disabledOptions.includes(option.value.toString())}
                  />
                </FormControl>
                <FormLabel htmlFor={`${name}-${option.value}`} className="font-normal">
                  {option.label}
                </FormLabel>
              </FormItem>
            ))}
          </ShadRadioGroup>
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

// TextareaField using RHF Controller
export const TextareaField = <TFieldValues extends FieldValues>({
  label, name, control, errors, placeholder, rows = 3, className = '', required = false, description
}: BaseFieldProps<TFieldValues> & TextareaProps) => (
  <FormField
    control={control}
    name={name}
    rules={{ required: required ? `${label || 'This field'} is required.` : false }}
    render={({ field }) => (
      <FormItem className={cn("space-y-1", className)}>
        {label && <FormLabel htmlFor={name}>{label}{required && <span className="text-destructive">*</span>}</FormLabel>}
        <FormControl>
          <Textarea
            id={name}
            placeholder={placeholder}
            rows={rows}
            {...field}
            value={field.value || ''} 
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

// SelectField using RHF Controller
export const SelectField = <TFieldValues extends FieldValues>({
  label, name, control, errors, options, placeholder, required = false, className = '', description
}: BaseFieldProps<TFieldValues> & { options: Option[], placeholder?: string }) => (
  <FormField
    control={control}
    name={name}
    rules={{ required: required ? `${label || 'This field'} is required.` : false }}
    render={({ field }) => (
      <FormItem className={cn("space-y-1", className)}>
        {label && <FormLabel htmlFor={name}>{label}{required && <span className="text-destructive">*</span>}</FormLabel>}
        <ShadSelect onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger id={name}>
              <SelectValue placeholder={placeholder || `Select ${label?.toLowerCase() || 'an option'}`} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </ShadSelect>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

// CheckboxField for a single checkbox, using RHF Controller
export const CheckboxField = <TFieldValues extends FieldValues>({
  label, name, control, errors, className = '', description,
}: BaseFieldProps<TFieldValues>) => ( 
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={cn("flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow", className)}>
        <FormControl>
          <ShadCheckbox
            checked={field.value}
            onCheckedChange={field.onChange}
            id={name}
          />
        </FormControl>
        <div className="space-y-1 leading-none">
          {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </div>
      </FormItem>
    )}
  />
);

// CheckboxGroupField for multiple checkboxes, using RHF Controller
export const CheckboxGroupField = <TFieldValues extends FieldValues>({
  label,
  name,
  control,
  errors,
  options,
  required = false,
  className = '',
  description,
}: BaseFieldProps<TFieldValues> & { options: CheckboxGroupOption[] }) => (
  <FormField
    control={control}
    name={name}
    rules={{
      validate: (value) => {
        if (required && (!value || (Array.isArray(value) && value.length === 0))) {
          return `${label || 'This field'} is required. Please select at least one option.`;
        }
        return true;
      },
    }}
    render={({ field }) => (
      <FormItem className={cn("space-y-1", className)}>
        {label && <FormLabel>{label}{required && <span className="text-destructive">*</span>}</FormLabel>}
        <div className="space-y-2">
          {options.map((option) => (
            <FormField
              key={option.value}
              control={control}
              name={name}
              render={({ field: groupField }) => {
                const currentValues = Array.isArray(groupField.value) ? groupField.value : [];
                return (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <ShadCheckbox
                        checked={currentValues.includes(option.value)}
                        onCheckedChange={(checked) => {
                          let newArray = [...currentValues];
                          if (checked) {
                            if (!newArray.includes(option.value)) {
                                newArray.push(option.value);
                            }
                          } else {
                            newArray = newArray.filter((val) => val !== option.value);
                          }
                          groupField.onChange(newArray);
                        }}
                        id={`${name}-${option.value}`}
                      />
                    </FormControl>
                    <FormLabel htmlFor={`${name}-${option.value}`} className="font-normal">
                      {option.label}
                    </FormLabel>
                  </FormItem>
                );
              }}
            />
          ))}
        </div>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);


// getNestedValue helper - can be kept if used elsewhere, but RHF handles dot notation.
export const getNestedValue = (obj: any, path: string, defaultValue: any = null) => {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    return value !== undefined ? value : defaultValue;
};

// Simple InputField without RHF Controller, using register (closer to user's original InputField)
// This is less integrated with FormField's error display but matches user's structure.
// If you need FormMessage, it's better to use the Controller version above.
export const SimpleInputField = <TFieldValues extends FieldValues>({
  label, name, register, errors, type = 'text', placeholder, required = false, pattern, className = '', readOnly = false, ...props
}: {
  label: string;
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  type?: string;
  placeholder?: string;
  required?: boolean;
  pattern?: { value: RegExp; message: string };
  className?: string;
  readOnly?: boolean;
  [key: string]: any; // for other input props
}) => {
  const error = getNestedValue(errors, name);
  return (
    <div className={cn("mb-4", className)}>
      <Label htmlFor={name} className="block text-sm font-medium text-foreground mb-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        readOnly={readOnly}
        {...register(name, { 
          required: required ? `${label} is required.` : false, 
          pattern
        })}
        className={cn(error ? 'border-destructive ring-destructive' : 'border-input')}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error.message?.toString()}</p>}
    </div>
  );
};

// Simple TextareaField using register
export const SimpleTextareaField = <TFieldValues extends FieldValues>({
  label, name, register, errors, placeholder, rows = 3, className = '', required = false
}: {
  label: string;
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  placeholder?: string;
  rows?: number;
  className?: string;
  required?: boolean;
}) => {
  const error = getNestedValue(errors, name);
  return (
    <div className={cn("mb-4", className)}>
      <Label htmlFor={name} className="block text-sm font-medium text-foreground mb-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Textarea
        id={name}
        placeholder={placeholder}
        rows={rows}
        {...register(name, { required: required ? `${label} is required.` : false })}
        className={cn(error ? 'border-destructive ring-destructive' : 'border-input')}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error.message?.toString()}</p>}
    </div>
  );
};
