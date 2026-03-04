import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export type CurrentUser = {
  id: string;
  email: string;
  profile: Profile;
};

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  console.log('[getCurrentUser] getUser:', user ? user.email : 'NO USER', '| error:', authError?.message || 'none');

  if (authError || !user) return null;

  const { data: initialProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  let profile = initialProfile;

  // Auto-repair: create missing profile (handles trigger failures, admin-created users, etc.)
  if (profileError || !profile) {
    console.log('[getCurrentUser] profile missing — auto-creating for', user.email);
    const admin = createAdminClient();
    await admin.from('profiles').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || '',
      role: 'client',
      preferred_locale: user.user_metadata?.preferred_locale || 'en',
    }, { onConflict: 'id' });

    // Re-fetch with the user's client (respects RLS)
    const { data: newProfile, error: newError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (newError || !newProfile) {
      console.error('[getCurrentUser] auto-repair failed:', newError?.message);
      return null;
    }
    profile = newProfile;
  }

  console.log('[getCurrentUser] profile:', profile ? `role=${profile.role}` : 'NO PROFILE', '| error:', profileError?.message || 'none');

  return { id: user.id, email: user.email!, profile };
}
