import type { Database } from './database';

export type Country = Database['public']['Tables']['countries']['Row'];
export type EntityType = Database['public']['Tables']['entity_types']['Row'];
export type CountryFormField = Database['public']['Tables']['country_form_fields']['Row'];
export type RequiredDocument = Database['public']['Tables']['required_documents']['Row'];

export type CountryWithEntityTypes = Country & {
  entity_types: EntityType[];
};

export function getLocalizedName(
  item: { name_en: string; name_es: string; name_pt: string; name_ru: string },
  locale: string
): string {
  switch (locale) {
    case 'es': return item.name_es;
    case 'pt': return item.name_pt;
    case 'ru': return item.name_ru;
    default: return item.name_en;
  }
}

export function getLocalizedLabel(
  field: { label_en: string; label_es: string; label_pt: string; label_ru: string },
  locale: string
): string {
  switch (locale) {
    case 'es': return field.label_es;
    case 'pt': return field.label_pt;
    case 'ru': return field.label_ru;
    default: return field.label_en;
  }
}

export function getLocalizedPlaceholder(
  field: {
    placeholder_en: string | null;
    placeholder_es: string | null;
    placeholder_pt: string | null;
    placeholder_ru: string | null;
  },
  locale: string
): string | undefined {
  switch (locale) {
    case 'es': return field.placeholder_es ?? undefined;
    case 'pt': return field.placeholder_pt ?? undefined;
    case 'ru': return field.placeholder_ru ?? undefined;
    default: return field.placeholder_en ?? undefined;
  }
}

export function getLocalizedDescription(
  item: {
    description_en: string | null;
    description_es: string | null;
    description_pt: string | null;
    description_ru: string | null;
  },
  locale: string
): string | undefined {
  switch (locale) {
    case 'es': return item.description_es ?? undefined;
    case 'pt': return item.description_pt ?? undefined;
    case 'ru': return item.description_ru ?? undefined;
    default: return item.description_en ?? undefined;
  }
}
