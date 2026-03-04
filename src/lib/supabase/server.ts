import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  const sbCookies = cookieStore.getAll().filter(c => c.name.startsWith('sb-'));
  console.log('[supabase/server] createClient — sb cookies:', sbCookies.map(c => c.name));

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (e) {
            // In Server Components, cookies cannot be set (read-only).
            // In Server Actions, this should NOT fail — if it does, session cookies won't persist.
            console.error('[supabase/server] setAll FAILED — cookies not persisted:', e instanceof Error ? e.message : e);
          }
        },
      },
    }
  );
}
