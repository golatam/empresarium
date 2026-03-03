import { createClient } from '@/lib/supabase/server';

export async function getAdminStats() {
  const supabase = await createClient();

  const [orders, users, partners, countries] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'partner'),
    supabase.from('countries').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  return {
    totalOrders: orders.count ?? 0,
    totalUsers: users.count ?? 0,
    totalPartners: partners.count ?? 0,
    activeCountries: countries.count ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAllUsers(role?: string): Promise<any[]> {
  const supabase = await createClient();
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (role) query = query.eq('role', role);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPartners(): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      partner_countries(*, country:countries(*))
    `)
    .eq('role', 'partner')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPartnersForCountry(countryId: string): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('partner_countries')
    .select('partner:profiles!partner_countries_partner_id_fkey(*)')
    .eq('country_id', countryId);

  if (error) throw error;
  return data?.map((d) => (d as Record<string, unknown>).partner).filter(Boolean) ?? [];
}
