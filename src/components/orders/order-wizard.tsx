'use client';

import { useCallback, useEffect, useReducer, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Country, EntityType, CountryFormField } from '@/types/country';
import type { WizardState, FounderFormData } from '@/types/order';
import { getLocalizedName, getLocalizedDescription } from '@/types/country';
import { createOrder } from '@/lib/actions/orders';
import { createClient } from '@/lib/supabase/client';
import { DynamicField } from './dynamic-field';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 7;
const DRAFT_KEY = 'empresarium_wizard_draft';

const EMPTY_FOUNDER: FounderFormData = {
  fullName: '',
  email: '',
  phone: '',
  nationality: '',
  dateOfBirth: '',
  documentType: '',
  documentNumber: '',
  taxId: '',
  ownershipPercentage: 0,
  isDirector: false,
  extraData: {},
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type WizardAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_COUNTRY'; countryId: string }
  | { type: 'SET_ENTITY_TYPE'; entityTypeId: string }
  | { type: 'SET_COMPANY_FIELD'; field: 'companyName' | 'companyActivity' | 'companyAddress'; value: string }
  | { type: 'SET_FOUNDERS'; founders: FounderFormData[] }
  | { type: 'UPDATE_FOUNDER'; index: number; founder: FounderFormData }
  | { type: 'ADD_FOUNDER' }
  | { type: 'REMOVE_FOUNDER'; index: number }
  | { type: 'SET_COUNTRY_FIELD'; key: string; value: unknown }
  | { type: 'SET_ADDON'; addon: keyof WizardState['addons']; value: boolean }
  | { type: 'RESTORE_DRAFT'; state: WizardState };

const initialState: WizardState = {
  step: 1,
  countryId: null,
  entityTypeId: null,
  companyName: '',
  companyActivity: '',
  companyAddress: '',
  founders: [{ ...EMPTY_FOUNDER }],
  countryFields: {},
  addons: {
    nomineeDirector: false,
    nomineeShareholder: false,
    accounting: false,
    bookkeeping: false,
  },
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'SET_COUNTRY':
      return {
        ...state,
        countryId: action.countryId,
        entityTypeId: null,
        countryFields: {},
      };
    case 'SET_ENTITY_TYPE':
      return { ...state, entityTypeId: action.entityTypeId };
    case 'SET_COMPANY_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_FOUNDERS':
      return { ...state, founders: action.founders };
    case 'UPDATE_FOUNDER':
      return {
        ...state,
        founders: state.founders.map((f, i) => (i === action.index ? action.founder : f)),
      };
    case 'ADD_FOUNDER':
      return { ...state, founders: [...state.founders, { ...EMPTY_FOUNDER }] };
    case 'REMOVE_FOUNDER':
      return {
        ...state,
        founders: state.founders.filter((_, i) => i !== action.index),
      };
    case 'SET_COUNTRY_FIELD':
      return {
        ...state,
        countryFields: { ...state.countryFields, [action.key]: action.value },
      };
    case 'SET_ADDON':
      return {
        ...state,
        addons: { ...state.addons, [action.addon]: action.value },
      };
    case 'RESTORE_DRAFT':
      return action.state;
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface OrderWizardProps {
  countries: Country[];
  locale: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OrderWizard({ countries, locale }: OrderWizardProps) {
  const t = useTranslations('wizard');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [state, dispatch] = useReducer(wizardReducer, initialState);
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
  const [countryFormFields, setCountryFormFields] = useState<CountryFormField[]>([]);
  const [loadingEntityTypes, setLoadingEntityTypes] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Step labels for progress display
  const stepLabels = [
    t('step1'),
    t('step2'),
    t('step3'),
    t('step4'),
    t('step5'),
    t('step6'),
    t('step7'),
  ];

  // -----------------------------------------------------------------------
  // Draft persistence
  // -----------------------------------------------------------------------

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WizardState;
        dispatch({ type: 'RESTORE_DRAFT', state: parsed });
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save to localStorage on step changes
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [state]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Ignore
    }
  }, []);

  // -----------------------------------------------------------------------
  // Fetch entity types when country changes
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!state.countryId) {
      setEntityTypes([]);
      return;
    }

    let cancelled = false;
    setLoadingEntityTypes(true);

    const fetchEntityTypes = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('entity_types')
        .select('*')
        .eq('country_id', state.countryId!)
        .eq('is_active', true)
        .order('sort_order');

      if (!cancelled) {
        setLoadingEntityTypes(false);
        if (!error && data) {
          setEntityTypes(data);
        }
      }
    };

    fetchEntityTypes();
    return () => { cancelled = true; };
  }, [state.countryId]);

  // -----------------------------------------------------------------------
  // Fetch country form fields when country changes
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!state.countryId) {
      setCountryFormFields([]);
      return;
    }

    let cancelled = false;
    setLoadingFields(true);

    const fetchFields = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('country_form_fields')
        .select('*')
        .eq('country_id', state.countryId!)
        .order('sort_order');

      if (!cancelled) {
        setLoadingFields(false);
        if (!error && data) {
          setCountryFormFields(data);
        }
      }
    };

    fetchFields();
    return () => { cancelled = true; };
  }, [state.countryId]);

  // -----------------------------------------------------------------------
  // Navigation helpers
  // -----------------------------------------------------------------------

  const canGoNext = (): boolean => {
    switch (state.step) {
      case 1:
        return !!state.countryId;
      case 2:
        return !!state.entityTypeId;
      case 3:
        return state.companyName.trim().length > 0;
      case 4:
        return state.founders.length > 0 && state.founders.every((f) => f.fullName.trim() && f.email.trim());
      case 5:
        // Validate required country fields
        return countryFormFields
          .filter((f) => f.is_required)
          .every((f) => {
            const val = state.countryFields[f.field_key];
            return val !== undefined && val !== '' && val !== null;
          });
      case 6:
        return true; // Add-ons are optional
      case 7:
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (state.step < TOTAL_STEPS && canGoNext()) {
      dispatch({ type: 'SET_STEP', step: state.step + 1 });
    }
  };

  const goBack = () => {
    if (state.step > 1) {
      dispatch({ type: 'SET_STEP', step: state.step - 1 });
    }
  };

  // -----------------------------------------------------------------------
  // Submit / Save Draft
  // -----------------------------------------------------------------------

  const handleSubmit = (asDraft: boolean) => {
    if (!state.countryId || !state.entityTypeId) return;

    setSubmitError(null);
    startTransition(async () => {
      const result = await createOrder({
        countryId: state.countryId!,
        entityTypeId: state.entityTypeId!,
        companyName: state.companyName,
        companyActivity: state.companyActivity || undefined,
        companyAddress: state.companyAddress || undefined,
        formData: state.countryFields,
        founders: state.founders,
        addons: state.addons,
        status: asDraft ? 'draft' : 'submitted',
      });

      if (result.error) {
        setSubmitError(result.error);
      } else if (result.orderId) {
        clearDraft();
        router.push(`/${locale}/orders/${result.orderId}`);
      }
    });
  };

  // -----------------------------------------------------------------------
  // Find currently selected country/entity type for display
  // -----------------------------------------------------------------------

  const selectedCountry = countries.find((c) => c.id === state.countryId);
  const selectedEntityType = entityTypes.find((et) => et.id === state.entityTypeId);

  // -----------------------------------------------------------------------
  // Step renderers
  // -----------------------------------------------------------------------

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t('selectCountry')}</h2>
        <p className="text-sm text-muted-foreground">{t('selectCountryDesc')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => {
          const name = getLocalizedName(country, locale);
          const isSelected = state.countryId === country.id;

          return (
            <Card
              key={country.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => dispatch({ type: 'SET_COUNTRY', countryId: country.id })}
            >
              <CardContent className="flex items-center gap-3 p-4">
                {country.flag_url && (
                  <img
                    src={country.flag_url}
                    alt={name}
                    className="h-8 w-10 rounded-sm object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{country.currency}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t('selectEntityType')}</h2>
        <p className="text-sm text-muted-foreground">{t('selectEntityTypeDesc')}</p>
      </div>
      {loadingEntityTypes ? (
        <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {entityTypes.map((et) => {
            const name = getLocalizedName(et, locale);
            const description = getLocalizedDescription(et, locale);
            const isSelected = state.entityTypeId === et.id;

            return (
              <Card
                key={et.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => dispatch({ type: 'SET_ENTITY_TYPE', entityTypeId: et.id })}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{name}</CardTitle>
                  <CardDescription className="text-xs">{et.code}</CardDescription>
                </CardHeader>
                {description && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t('companyDetails')}</h2>
        <p className="text-sm text-muted-foreground">{t('companyDetailsDesc')}</p>
      </div>
      <div className="space-y-4 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="companyName">
            {t('companyName')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="companyName"
            value={state.companyName}
            onChange={(e) =>
              dispatch({ type: 'SET_COMPANY_FIELD', field: 'companyName', value: e.target.value })
            }
            placeholder={t('companyName')}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyActivity">{t('companyActivity')}</Label>
          <Textarea
            id="companyActivity"
            value={state.companyActivity}
            onChange={(e) =>
              dispatch({
                type: 'SET_COMPANY_FIELD',
                field: 'companyActivity',
                value: e.target.value,
              })
            }
            placeholder={t('companyActivity')}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyAddress">{t('companyAddress')}</Label>
          <Input
            id="companyAddress"
            value={state.companyAddress}
            onChange={(e) =>
              dispatch({
                type: 'SET_COMPANY_FIELD',
                field: 'companyAddress',
                value: e.target.value,
              })
            }
            placeholder={t('companyAddress')}
          />
        </div>
      </div>
    </div>
  );

  const renderFounderForm = (founder: FounderFormData, index: number) => (
    <Card key={index}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {t('founderName')} #{index + 1}
          </CardTitle>
          {state.founders.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => dispatch({ type: 'REMOVE_FOUNDER', index })}
            >
              {t('removeFounder')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              {t('founderName')} <span className="text-destructive">*</span>
            </Label>
            <Input
              value={founder.fullName}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_FOUNDER',
                  index,
                  founder: { ...founder, fullName: e.target.value },
                })
              }
              placeholder={t('founderName')}
            />
          </div>
          <div className="space-y-2">
            <Label>
              {t('founderEmail')} <span className="text-destructive">*</span>
            </Label>
            <Input
              type="email"
              value={founder.email}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_FOUNDER',
                  index,
                  founder: { ...founder, email: e.target.value },
                })
              }
              placeholder={t('founderEmail')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('founderPhone')}</Label>
            <Input
              type="tel"
              value={founder.phone}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_FOUNDER',
                  index,
                  founder: { ...founder, phone: e.target.value },
                })
              }
              placeholder={t('founderPhone')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('founderNationality')}</Label>
            <Input
              value={founder.nationality}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_FOUNDER',
                  index,
                  founder: { ...founder, nationality: e.target.value },
                })
              }
              placeholder={t('founderNationality')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('founderDOB')}</Label>
            <Input
              type="date"
              value={founder.dateOfBirth}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_FOUNDER',
                  index,
                  founder: { ...founder, dateOfBirth: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t('founderDocType')}</Label>
            <Select
              value={founder.documentType}
              onValueChange={(val) =>
                dispatch({
                  type: 'UPDATE_FOUNDER',
                  index,
                  founder: { ...founder, documentType: val },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('founderDocType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="national_id">National ID</SelectItem>
                <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('founderDocNumber')}</Label>
            <Input
              value={founder.documentNumber}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_FOUNDER',
                  index,
                  founder: { ...founder, documentNumber: e.target.value },
                })
              }
              placeholder={t('founderDocNumber')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('founderTaxId')}</Label>
            <Input
              value={founder.taxId}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_FOUNDER',
                  index,
                  founder: { ...founder, taxId: e.target.value },
                })
              }
              placeholder={t('founderTaxId')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('founderOwnership')}</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={founder.ownershipPercentage}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_FOUNDER',
                  index,
                  founder: { ...founder, ownershipPercentage: Number(e.target.value) },
                })
              }
              placeholder="0"
            />
          </div>
          <div className="flex items-center space-x-2 self-end pb-2">
            <Checkbox
              id={`director-${index}`}
              checked={founder.isDirector}
              onCheckedChange={(checked) =>
                dispatch({
                  type: 'UPDATE_FOUNDER',
                  index,
                  founder: { ...founder, isDirector: checked === true },
                })
              }
            />
            <Label htmlFor={`director-${index}`} className="font-normal">
              {t('founderIsDirector')}
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => {
    const totalOwnership = state.founders.reduce((sum, f) => sum + f.ownershipPercentage, 0);

    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{t('foundersTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('foundersDesc')}</p>
        </div>

        {selectedEntityType && (
          <p className="text-sm text-muted-foreground">
            {t('minFounders', { min: selectedEntityType.min_founders })}
            {selectedEntityType.max_founders
              ? ` / ${t('maxFounders', { max: selectedEntityType.max_founders })}`
              : ''}
          </p>
        )}

        <div className="space-y-4">
          {state.founders.map((founder, index) => renderFounderForm(founder, index))}
        </div>

        {totalOwnership !== 100 && state.founders.length > 0 && (
          <p className="text-sm text-destructive">{t('ownershipTotal')}</p>
        )}

        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'ADD_FOUNDER' })}
          disabled={
            selectedEntityType?.max_founders
              ? state.founders.length >= selectedEntityType.max_founders
              : false
          }
        >
          {t('addFounder')}
        </Button>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t('countryFields')}</h2>
        <p className="text-sm text-muted-foreground">{t('countryFieldsDesc')}</p>
      </div>
      {loadingFields ? (
        <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
      ) : countryFormFields.length === 0 ? (
        <p className="text-sm text-muted-foreground">{tCommon('noResults')}</p>
      ) : (
        <div className="grid gap-4 max-w-xl">
          {countryFormFields.map((field) => (
            <DynamicField
              key={field.id}
              field={field}
              value={state.countryFields[field.field_key]}
              onChange={(key, value) => dispatch({ type: 'SET_COUNTRY_FIELD', key, value })}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t('addonsTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('addonsDesc')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        {([
          { key: 'nomineeDirector' as const, label: t('nomineeDirector'), desc: t('nomineeDirectorDesc') },
          { key: 'nomineeShareholder' as const, label: t('nomineeShareholder'), desc: t('nomineeShareholderDesc') },
          { key: 'accounting' as const, label: t('accounting'), desc: t('accountingDesc') },
          { key: 'bookkeeping' as const, label: t('bookkeeping'), desc: t('bookkeepingDesc') },
        ]).map((addon) => (
          <Card
            key={addon.key}
            className={`cursor-pointer transition-all ${
              state.addons[addon.key]
                ? 'border-primary ring-2 ring-primary/20'
                : 'hover:border-primary/50'
            }`}
            onClick={() => dispatch({ type: 'SET_ADDON', addon: addon.key, value: !state.addons[addon.key] })}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={state.addons[addon.key]}
                  onCheckedChange={(checked) =>
                    dispatch({ type: 'SET_ADDON', addon: addon.key, value: checked === true })
                  }
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <p className="font-medium leading-none">{addon.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{addon.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep7 = () => {
    const countryName = selectedCountry ? getLocalizedName(selectedCountry, locale) : '';
    const entityTypeName = selectedEntityType ? getLocalizedName(selectedEntityType, locale) : '';

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">{t('reviewTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('reviewDesc')}</p>
        </div>

        {/* Country & Entity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('step1')} &amp; {t('step2')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('selectCountry')}</span>
              <span className="flex items-center gap-1.5 font-medium">
                {selectedCountry?.flag_url && (
                  <img
                    src={selectedCountry.flag_url}
                    alt={countryName}
                    className="h-4 w-5 rounded-sm object-cover"
                  />
                )}
                {countryName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('selectEntityType')}</span>
              <span className="font-medium">{entityTypeName}</span>
            </div>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('companyDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('companyName')}</span>
              <span className="font-medium">{state.companyName}</span>
            </div>
            {state.companyActivity && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('companyActivity')}</span>
                <span className="font-medium">{state.companyActivity}</span>
              </div>
            )}
            {state.companyAddress && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('companyAddress')}</span>
                <span className="font-medium">{state.companyAddress}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Founders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t('foundersTitle')} ({state.founders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.founders.map((founder, index) => (
              <div key={index}>
                {index > 0 && <Separator className="mb-3" />}
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{founder.fullName}</p>
                  <p className="text-muted-foreground">{founder.email}</p>
                  <p className="text-muted-foreground">
                    {t('founderOwnership')}: {founder.ownershipPercentage}%
                    {founder.isDirector ? ` | ${t('founderIsDirector')}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Country Fields */}
        {Object.keys(state.countryFields).length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('countryFields')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {Object.entries(state.countryFields).map(([key, value]) => {
                const fieldDef = countryFormFields.find((f) => f.field_key === key);
                const label = fieldDef
                  ? getLocalizedName(
                      {
                        name_en: fieldDef.label_en,
                        name_es: fieldDef.label_es,
                        name_pt: fieldDef.label_pt,
                        name_ru: fieldDef.label_ru,
                      },
                      locale
                    )
                  : key;

                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">
                      {typeof value === 'boolean'
                        ? value ? tCommon('yes') : tCommon('no')
                        : String(value ?? '-')}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Add-ons */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('addonsTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {state.addons.nomineeDirector && (
              <p className="font-medium">- {t('nomineeDirector')}</p>
            )}
            {state.addons.nomineeShareholder && (
              <p className="font-medium">- {t('nomineeShareholder')}</p>
            )}
            {state.addons.accounting && (
              <p className="font-medium">- {t('accounting')}</p>
            )}
            {state.addons.bookkeeping && (
              <p className="font-medium">- {t('bookkeeping')}</p>
            )}
            {!state.addons.nomineeDirector &&
              !state.addons.nomineeShareholder &&
              !state.addons.accounting &&
              !state.addons.bookkeeping && (
                <p className="text-muted-foreground italic">{tCommon('noResults')}</p>
              )}
          </CardContent>
        </Card>

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}
      </div>
    );
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const progressValue = (state.step / TOTAL_STEPS) * 100;

  const renderCurrentStep = () => {
    switch (state.step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {stepLabels[state.step - 1]}
          </span>
          <span className="text-muted-foreground">
            {state.step} / {TOTAL_STEPS}
          </span>
        </div>
        <Progress value={progressValue} />
        <div className="flex justify-between">
          {stepLabels.map((label, i) => (
            <span
              key={i}
              className={`hidden text-xs sm:block ${
                i + 1 === state.step
                  ? 'font-medium text-primary'
                  : i + 1 < state.step
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <Separator />

      {/* Step content */}
      <div className="min-h-[300px]">
        {renderCurrentStep()}
      </div>

      <Separator />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {state.step > 1 && (
            <Button variant="outline" onClick={goBack} disabled={isPending}>
              {tCommon('back')}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {state.step >= 3 && state.step < TOTAL_STEPS && (
            <Button
              variant="ghost"
              onClick={() => handleSubmit(true)}
              disabled={isPending || !state.countryId || !state.entityTypeId}
            >
              {isPending ? tCommon('loading') : t('saveDraft')}
            </Button>
          )}

          {state.step < TOTAL_STEPS ? (
            <Button onClick={goNext} disabled={!canGoNext() || isPending}>
              {tCommon('next')}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={isPending}
              >
                {isPending ? tCommon('loading') : t('saveDraft')}
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                disabled={isPending}
              >
                {isPending ? tCommon('loading') : t('submitOrder')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
