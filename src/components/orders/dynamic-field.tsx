'use client';

import type { CountryFormField } from '@/types/country';
import { getLocalizedLabel, getLocalizedPlaceholder } from '@/types/country';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SelectOption {
  value: string;
  label_en: string;
  label_es: string;
  label_pt: string;
  label_ru: string;
}

interface DynamicFieldProps {
  field: CountryFormField;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
  locale: string;
}

function getLocalizedOptionLabel(option: SelectOption, locale: string): string {
  switch (locale) {
    case 'es':
      return option.label_es;
    case 'pt':
      return option.label_pt;
    case 'ru':
      return option.label_ru;
    default:
      return option.label_en;
  }
}

export function DynamicField({ field, value, onChange, locale }: DynamicFieldProps) {
  const label = getLocalizedLabel(field, locale);
  const placeholder = getLocalizedPlaceholder(field, locale);
  const fieldId = `field-${field.field_key}`;

  const renderField = () => {
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            id={fieldId}
            type={field.field_type === 'phone' ? 'tel' : field.field_type}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(field.field_key, e.target.value)}
            placeholder={placeholder}
            required={field.is_required}
          />
        );

      case 'number':
        return (
          <Input
            id={fieldId}
            type="number"
            value={(value as string | number) ?? ''}
            onChange={(e) => onChange(field.field_key, e.target.value ? Number(e.target.value) : '')}
            placeholder={placeholder}
            required={field.is_required}
          />
        );

      case 'date':
        return (
          <Input
            id={fieldId}
            type="date"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(field.field_key, e.target.value)}
            required={field.is_required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(field.field_key, e.target.value)}
            placeholder={placeholder}
            required={field.is_required}
            rows={4}
          />
        );

      case 'select': {
        const options = (field.options as SelectOption[] | null) ?? [];
        return (
          <Select
            value={(value as string) ?? ''}
            onValueChange={(val) => onChange(field.field_key, val)}
          >
            <SelectTrigger id={fieldId}>
              <SelectValue placeholder={placeholder ?? label} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {getLocalizedOptionLabel(option, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={fieldId}
              checked={(value as boolean) ?? false}
              onCheckedChange={(checked) => onChange(field.field_key, checked)}
            />
            <Label htmlFor={fieldId} className="font-normal">
              {label}
            </Label>
          </div>
        );

      case 'file':
        return (
          <Input
            id={fieldId}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              onChange(field.field_key, file ?? null);
            }}
            required={field.is_required}
          />
        );

      default:
        return (
          <Input
            id={fieldId}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(field.field_key, e.target.value)}
            placeholder={placeholder}
            required={field.is_required}
          />
        );
    }
  };

  // Checkbox already includes its own label inline
  if (field.field_type === 'checkbox') {
    return (
      <div className="space-y-2">
        {renderField()}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>
        {label}
        {field.is_required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderField()}
    </div>
  );
}
