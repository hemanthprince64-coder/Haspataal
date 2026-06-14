'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormFieldSchema {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'multiselect';
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  validation?: FieldValidation;
  conceptCode?: string;
  conceptSource?: string;
}

export interface DynamicFormSchema {
  formId: string;
  title: string;
  description?: string;
  fields: FormFieldSchema[];
}

interface DynamicFormProps {
  schema: DynamicFormSchema;
  onSubmit: (data: any) => void | Promise<void>;
  initialValues?: Record<string, any>;
  submitLabel?: string;
}

export function buildZodSchema(fields: FormFieldSchema[]) {
  const shape: Record<string, any> = {};

  for (const field of fields) {
    let fieldSchema: any;

    switch (field.type) {
      case 'number':
        fieldSchema = z.coerce.number({
          error: `${field.label} must be a number`,
        } as any);
        if (field.validation) {
          if (typeof field.validation.min === 'number') {
            fieldSchema = fieldSchema.min(
              field.validation.min,
              `${field.label} must be at least ${field.validation.min}`
            );
          }
          if (typeof field.validation.max === 'number') {
            fieldSchema = fieldSchema.max(
              field.validation.max,
              `${field.label} must be at most ${field.validation.max}`
            );
          }
        }
        break;

      case 'checkbox':
        fieldSchema = z.boolean();
        break;

      case 'multiselect':
        fieldSchema = z.array(z.string());
        if (field.required) {
          fieldSchema = fieldSchema.min(1, `Select at least one ${field.label}`);
        }
        break;

      case 'select':
      case 'text':
      case 'textarea':
      default:
        fieldSchema = z.string();
        if (field.required) {
          fieldSchema = fieldSchema.min(1, `${field.label} is required`);
        } else {
          fieldSchema = fieldSchema.optional().or(z.literal(''));
        }
        if (field.validation) {
          if (typeof field.validation.minLength === 'number') {
            fieldSchema = fieldSchema.min(
              field.validation.minLength,
              `${field.label} must be at least ${field.validation.minLength} characters`
            );
          }
          if (typeof field.validation.maxLength === 'number') {
            fieldSchema = fieldSchema.max(
              field.validation.maxLength,
              `${field.label} must be at most ${field.validation.maxLength} characters`
            );
          }
        }
        break;
    }

    if (!field.required && field.type !== 'checkbox' && field.type !== 'multiselect') {
      fieldSchema = fieldSchema.optional().nullable();
    }

    shape[field.id] = fieldSchema;
  }

  return z.object(shape);
}

interface VoiceInputButtonProps {
  fieldId: string;
  onTranscript: (text: string) => void;
}

export function VoiceInputButton({ fieldId, onTranscript }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSupported(true);
      }
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Default to Hindi (Web Speech API auto-falls back to Hinglish/Indian English)
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Listening (speak in Hindi or English)...', { duration: 2000 });
    };

    recognition.onerror = (event: any) => {
      console.error('[Speech] Error:', event.error);
      setIsListening(false);
      toast.error(`Speech recognition failed: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onTranscript(transcript);
        toast.success(`Recognized: "${transcript}"`, { duration: 3000 });
      }
    };

    recognition.start();
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={startListening}
      className={`absolute right-3 p-1.5 rounded-full transition-all duration-200 ${
        isListening
          ? 'bg-rose-500 text-white animate-pulse scale-110 shadow-md shadow-rose-500/30'
          : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
      style={{ top: '50%', transform: 'translateY(-50%)' }}
      title="Speak Hindi/English"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
        />
      </svg>
    </button>
  );
}

export default function DynamicForm({
  schema,
  onSubmit,
  initialValues = {},
  submitLabel = 'Submit',
}: DynamicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const zodSchema = buildZodSchema(schema.fields);

  // Set defaults for checkboxes and multiselects to avoid react uncontrolled input warnings
  const defaultValues: Record<string, any> = {};
  for (const f of schema.fields) {
    if (f.type === 'checkbox') {
      defaultValues[f.id] = initialValues[f.id] ?? false;
    } else if (f.type === 'multiselect') {
      defaultValues[f.id] = initialValues[f.id] ?? [];
    } else {
      defaultValues[f.id] = initialValues[f.id] ?? '';
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      console.error('Dynamic form submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-slate-200/80 bg-white/90 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 transition-all duration-300">
      <CardHeader className="space-y-1.5 pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {schema.title}
        </CardTitle>
        {schema.description && (
          <CardDescription className="text-slate-500 dark:text-slate-400">
            {schema.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-6">
          {schema.fields.map((field) => {
            const error = errors[field.id];
            
            return (
              <div key={field.id} className="space-y-2 group">
                {field.type !== 'checkbox' && (
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={field.id}
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors"
                    >
                      {field.label}
                      {field.required && (
                        <span className="text-rose-500 ml-1 font-bold">*</span>
                      )}
                    </Label>
                    
                    {(field.conceptCode || field.conceptSource) && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {field.conceptSource || 'CIEL'}: {field.conceptCode}
                      </span>
                    )}
                  </div>
                )}

                {field.type === 'text' && (
                  <div className="relative flex items-center">
                    <Input
                      id={field.id}
                      placeholder={field.placeholder || `Enter ${field.label}`}
                      {...register(field.id)}
                      className="w-full rounded-lg border-slate-200/80 focus:ring-2 focus:ring-blue-500/20 pr-10 transition-all duration-200"
                    />
                    <VoiceInputButton fieldId={field.id} onTranscript={(text) => setValue(field.id, text)} />
                  </div>
                )}

                {field.type === 'number' && (
                  <Input
                    id={field.id}
                    type="number"
                    step="any"
                    placeholder={field.placeholder || `Enter ${field.label}`}
                    {...register(field.id)}
                    className="w-full rounded-lg border-slate-200/80 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                )}

                {field.type === 'textarea' && (
                  <div className="relative">
                    <Textarea
                      id={field.id}
                      placeholder={field.placeholder || `Enter details...`}
                      {...register(field.id)}
                      rows={4}
                      className="w-full rounded-lg border-slate-200/80 focus:ring-2 focus:ring-blue-500/20 pr-10 transition-all duration-200"
                    />
                    <div className="absolute right-3 bottom-3">
                      <VoiceInputButton fieldId={field.id} onTranscript={(text) => setValue(field.id, text)} />
                    </div>
                  </div>
                )}

                {field.type === 'select' && (
                  <Select
                    onValueChange={(val) => setValue(field.id, val)}
                    defaultValue={defaultValues[field.id]}
                  >
                    <SelectTrigger className="w-full rounded-lg border-slate-200/80 focus:ring-2 focus:ring-blue-500/20">
                      <SelectValue placeholder={field.placeholder || "Select an option"} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.type === 'checkbox' && (
                  <div className="flex items-center space-x-3 py-1">
                    <Checkbox
                      id={field.id}
                      checked={watch(field.id)}
                      onCheckedChange={(checked) => setValue(field.id, !!checked)}
                    />
                    <div className="space-y-1 leading-none">
                      <Label
                        htmlFor={field.id}
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        {field.label}
                        {field.required && (
                          <span className="text-rose-500 ml-1 font-bold">*</span>
                        )}
                      </Label>
                      {field.placeholder && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">{field.placeholder}</p>
                      )}
                    </div>
                    {(field.conceptCode || field.conceptSource) && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {field.conceptSource || 'CIEL'}: {field.conceptCode}
                      </span>
                    )}
                  </div>
                )}

                {field.type === 'multiselect' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-slate-100 dark:border-slate-800/80 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/30">
                    {field.options?.map((opt) => {
                      const currentSelected: string[] = watch(field.id) || [];
                      const isChecked = currentSelected.includes(opt.value);
                      
                      return (
                        <div key={opt.value} className="flex items-center space-x-3">
                          <Checkbox
                            id={`${field.id}-${opt.value}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setValue(field.id, [...currentSelected, opt.value]);
                              } else {
                                setValue(
                                  field.id,
                                  currentSelected.filter((v) => v !== opt.value)
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={`${field.id}-${opt.value}`}
                            className="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none"
                          >
                            {opt.label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {error && (
                  <p className="text-xs font-semibold text-rose-500 animate-in fade-in duration-200">
                    {error.message as string}
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>

        <CardFooter className="pt-2 pb-6 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg px-6 py-2.5 font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all duration-150"
          >
            {isSubmitting ? 'Submitting...' : submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
