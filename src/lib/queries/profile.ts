import { createClient } from '@/lib/supabase/server';
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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  console.log('[getCurrentUser] profile:', profile ? `role=${profile.role}` : 'NO PROFILE', '| error:', profileError?.message || 'none');

  if (profileError || !profile) return null;

  return { id: user.id, email: user.email!, profile };
}
