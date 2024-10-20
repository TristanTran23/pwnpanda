import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types_db';

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return document.cookie.split('; ').find(row => row.startsWith(name))?.split('=')[1]
        },
        set(name: string, value: string, options: { expires: number; path: string; sameSite: 'strict' | 'lax' }) {
          document.cookie = `${name}=${value}; expires=${new Date(options.expires).toUTCString()}; path=${options.path}; SameSite=${options.sameSite}; Secure`
        },
        remove(name: string, options: { path: string }) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${options.path}; SameSite=Lax; Secure`
        },
      },
    }
  );