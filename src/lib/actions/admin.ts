'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@/types/database';

export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/[locale]/admin/users', 'page');
  return { success: true };
}

export async function updatePartnerCountries(
  partnerId: string,
  countryIds: string[]
) {
  const supabase = await createClient();

  // Remove existing assignments
  await supabase
    .from('partner_countries')
    .delete()
    .eq('partner_id', partnerId);

  // Add new assignments
  if (countryIds.length > 0) {
    const rows = countryIds.map((countryId) => ({
      partner_id: partnerId,
      country_id: countryId,
    }));

    const { error } = await supabase
      .from('partner_countries')
      .insert(rows);

    if (error) return { error: error.message };
  }

  revalidatePath('/[locale]/admin/partners', 'page');
  return { success: true };
}
