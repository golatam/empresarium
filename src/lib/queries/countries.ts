import { createClient } from '@/lib/supabase/server';

export async function getCountries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data;
}

export async function getCountryById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getEntityTypes(countryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('entity_types')
    .select('*')
    .eq('country_id', countryId)
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data;
}

export async function getCountryFormFields(countryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('country_form_fields')
    .select('*')
    .eq('country_id', countryId)
    .order('sort_order');

  if (error) throw error;
  return data;
}

export async function getRequiredDocuments(countryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('required_documents')
    .select('*')
    .eq('country_id', countryId)
    .order('sort_order');

  if (error) throw error;
  return data;
}

export async function getCountriesWithEntityTypes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('countries')
    .select('*, entity_types(*)')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data;
}
